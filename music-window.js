// Rolling windows: sample at 10 Hz, regress the recent phrase instead of each beat.
class RollingMusic {
  constructor(){this.reset();}
  reset(){this.samples=[];this.last=-Infinity;this.revision=null;this.state={energy:0,trend:0,brightness:0,spectralCenter:.5,volatility:0,pulse:0,direction:'steady',hue:180,flow:{x:0,y:0},windowSeconds:12,sampleCount:0,dbPerSecond:0};}
  regression(rows,key){
    if(rows.length<3)return 0;
    const origin=rows[0].time;let sx=0,sy=0,sxx=0,sxy=0;
    for(const row of rows){const x=row.time-origin,y=row[key];sx+=x;sy+=y;sxx+=x*x;sxy+=x*y;}
    const n=rows.length,den=n*sxx-sx*sx;
    return den>1e-8?(n*sxy-sx*sy)/den:0;
  }
  update(a){
    const f=a.features;if(!f)return this.state;
    const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
    if(f.revision!==this.revision||a.time-this.last>1.5||a.time<this.last){this.reset();this.revision=f.revision;}
    if(a.time-this.last>=.1){
      const shape=f.shape||[],sum=shape.reduce((n,v)=>n+v,0);
      const center=sum?shape.reduce((n,v,i)=>n+v*i/Math.max(1,shape.length-1),0)/sum:.5;
      this.samples.push({time:a.time,db:f.db,energy:clamp((f.db+75)/55),brightness:clamp((shape[4]||0)+(shape[5]||0)),center});
      this.samples=this.samples.filter(row=>a.time-row.time<=12).slice(-130);this.last=a.time;
      const recent=this.samples.filter(row=>a.time-row.time<=3.5);
      const phrase=this.samples.filter(row=>a.time-row.time<=8);
      const mean=phrase.reduce((n,row)=>n+row.energy,0)/Math.max(1,phrase.length);
      const deviation=Math.sqrt(phrase.reduce((n,row)=>n+(row.energy-mean)**2,0)/Math.max(1,phrase.length));
      const latest=this.samples.at(-1);
      this.target={energy:latest.energy,trend:clamp(this.regression(recent,'energy')*7,-1,1),
        brightness:latest.brightness,spectralCenter:center,volatility:clamp(deviation*3),dbPerSecond:this.regression(recent,'db')};
    }
    const dt=Math.max(.001,Math.min(.1,a.dt||1/60)),ease=1-Math.exp(-dt/.45);
    if(this.target)for(const key of ['energy','trend','brightness','spectralCenter','volatility','dbPerSecond'])this.state[key]+=(this.target[key]-this.state[key])*ease;
    const hit=f.db>-70&&Object.values(a.groups||{}).some(g=>g.enabled&&g.hit);
    this.state.pulse=Math.max(hit?this.state.energy:0,this.state.pulse*Math.exp(-dt/.25));
    this.state.direction=this.state.trend>.12?'rising':this.state.trend<-.12?'falling':'steady';
    this.state.hue=((this.state.spectralCenter*280+this.state.trend*35+360)%360);
    this.state.flow={x:(this.state.spectralCenter-.5)*1.4,y:-this.state.trend};
    this.state.sampleCount=this.samples.length;
    return this.state;
  }
}
window.RollingMusic=RollingMusic;
window.avsMusic=new RollingMusic();

// Per-renderer envelopes: previews and the stage never share animation state.
// Bands describe frequency regions, not separated instruments or a tempo estimate.
window.avsShaderAudio=(a,state)=>{
 const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
 const dt=Math.max(.001,Math.min(.1,a.dt||1/60));
 let v=state.shaderAudio;
 if(!v||a.time<v.lastTime)v=state.shaderAudio={body:[0,0,0],attack:[0,0,0],previous:[0,0,0],phrase:0,center:.5,pan:0,motion:0,lastTime:a.time};
 if(!v.events)Object.assign(v,{events:new Float32Array(32),spectrum:new Float32Array(12),cooldown:[0,0,0],eventIndex:0,eventCount:0,activity:0,journey:0,elapsed:0});
 const groups=Object.values(a.groups||{}),bounds=[25,250,4000,20000];
 const target=[0,0,0],hits=[0,0,0];
 for(let i=0;i<3;i++){
  let power=0,weight=0;
  for(const g of groups){
   const overlap=Math.max(0,Math.min(g.high,bounds[i+1])-Math.max(g.low,bounds[i]));
   if(!overlap)continue;
   // Disabled regions contribute zero, retaining their place in the normalization.
   const w=overlap/Math.max(1,g.high-g.low);weight+=w;
   if(!g.enabled)continue;
   const level=clamp(g.level??g.energy);
   power+=level*level*w;
   if(g.hit)hits[i]=Math.max(hits[i],level);
  }
  target[i]=groups.length?Math.sqrt(power/Math.max(1,weight)):clamp([a.bass,a.mid,a.treble][i]);
  // The fallback also supports exported presets with only the basic audio API.
  if(!groups.length)hits[i]=clamp((target[i]-v.previous[i]-.025)*4);
  v.previous[i]=target[i];
  v.body[i]+=(target[i]-v.body[i])*(1-Math.exp(-dt/(target[i]>v.body[i]?.045:.32)));
  v.attack[i]=Math.max(hits[i],v.attack[i]*Math.exp(-dt/[.24,.18,.12][i]));
 }
 const active=groups.some(g=>g.enabled)||!groups.length;
 const energy=active?clamp(a.music?.energy??Math.max(...target)):0;
 v.phrase+=(energy-v.phrase)*(1-Math.exp(-dt/2.4));
 v.center+=((active?clamp(a.music?.spectralCenter??.5):.5)-v.center)*(1-Math.exp(-dt/1.8));
 const stereo=a.stereo, left=stereo?.left?.energy||0,right=stereo?.right?.energy||0;
 const pan=stereo?.available?(right-left)/Math.max(.02,left+right):0;
 v.pan+=(pan-v.pan)*(1-Math.exp(-dt/.7));
 // Sparse, bounded musical memories survive their original attack. The shader
 // gives each event a spatial interpretation: depth, eddy, ember, echo or halo.
 for(let j=0;j<8;j++){
  const offset=j*4;v.events[offset]=Math.min(12,v.events[offset]+dt);
  if(v.events[offset]>=8)v.events[offset+1]=0;
 }
 for(let i=0;i<3;i++){
  v.cooldown[i]-=dt;
  if(hits[i]>.16&&v.cooldown[i]<=0){
   const offset=v.eventIndex*4;
   const position=Math.sin((v.eventCount+1)*2.399963+i*1.7)*.7+v.pan*.3;
   v.events.set([0,hits[i],i,position],offset);
   v.eventIndex=(v.eventIndex+1)%8;v.eventCount++;
   v.cooldown[i]=[.65,.8,.5][i];
  }
 }
 // Twelve log-spaced regions reveal relationships hidden by three broad bands.
 for(let i=0;i<12;i++){
  const lo=25*Math.pow(800,i/12),hi=25*Math.pow(800,(i+1)/12);
  let sum=0,weight=0;
  for(const g of groups){
   const overlap=Math.max(0,Math.min(hi,g.high)-Math.max(lo,g.low));
   if(!overlap)continue;
   const w=overlap/Math.max(1,g.high-g.low);weight+=w;
   if(g.enabled)sum+=clamp(g.level??g.energy)*w;
  }
  const value=groups.length?sum/Math.max(.0001,weight):target[Math.min(2,Math.floor(i/4))];
  v.spectrum[i]+=(value-v.spectrum[i])*(1-Math.exp(-dt/.18));
 }
 v.activity+=(Math.max(...v.attack)-v.activity)*(1-Math.exp(-dt/7));
 v.elapsed+=dt;
 // Continuous accumulated activity changes the scene over minutes, without cuts
 // or a short repeating loop. Quiet passages allow the composition to breathe.
 v.journey+=dt*(.012+v.phrase*.023+v.activity*.018);
 // Integrating speed avoids jumps caused by multiplying absolute time by energy.
 v.motion+=dt*(.18+v.phrase*.82+v.body[0]*.35);v.lastTime=a.time;
 return v;
};
window.avsShaderUniforms=(a,state,surface)=>{
 const v=window.avsShaderAudio(a,state),{gl,program}=surface;
 const u=surface.audioUniforms??=Object.fromEntries(['iAttack','iPhrase','iMotion','iEvents[0]','iSpectrum[0]','iJourney'].map(k=>[k,gl.getUniformLocation(program,k)]));
 gl.uniform3fv(surface.bands,v.body);
 gl.uniform3fv(u.iAttack,v.attack);
 gl.uniform4f(u.iPhrase,v.phrase,v.center,v.pan,Math.max(-1,Math.min(1,a.music?.trend||0)));
 gl.uniform1f(u.iMotion,v.motion);
 gl.uniform4fv(u['iEvents[0]'],v.events);
 gl.uniform4fv(u['iSpectrum[0]'],v.spectrum);
 gl.uniform4f(u.iJourney,v.journey,v.activity,v.elapsed,v.phrase);
 return v;
};
