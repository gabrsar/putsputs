// Lissajous · néon XY — Waveform XY com ganho visual, persistência de fósforo, cores vivas e órbitas que respiram.
/* global p, a, s */
const dt=Math.max(0,Math.min(a.dt??1/60,.08)),t=a.time||0,w=p.width,h=p.height,TAU=Math.PI*2;
const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
const rand=(lo=0,hi=1)=>a.rand?a.rand(lo,hi):lo+Math.random()*(hi-lo);
const bands=Object.values(a.groups||{}).sort((x,y)=>x.low-y.low);
const strengths=bands.map(g=>g.enabled?clamp(a.visualLevel?a.visualLevel(g.db??-120):((g.db??-120)+80)/55):0);
const value=i=>strengths.length?strengths[((i%strengths.length)+strengths.length)%strengths.length]:0;
const region=(lo,hi)=>{let sum=0,n=0;bands.forEach((g,i)=>{if(g.low<hi&&g.high>lo){sum+=strengths[i];n++;}});return sum/Math.max(1,n);};
const low=region(25,250),mid=region(250,4000),high=region(4000,22000),loud=Math.max(0,...strengths);
const music=a.music||{},trend=music.trend||0,mouse=a.mouse||{},hit=bands.some(g=>g.enabled&&g.hit);
const wave=u=>{const v=a.waveform||[];return v.length?v[Math.min(v.length-1,Math.floor(clamp(u)*v.length))]||0:0;};
const weather=Math.max(0,Math.sin(t*.11+(a.seed||1337)*.001));
const layer=key=>{
 s.layers??={};let g=s.layers[key];
 if(!g){g=s.layers[key]=p.createGraphics(w,h);g.pixelDensity(a.pixelDensity??1);g.clear();s.dispose=()=>{for(const v of Object.values(s.layers))v.remove();};}
 if(g.width!==w||g.height!==h){const copy=g.get();g.resizeCanvas(w,h);g.image(copy,0,0,w,h);}
 return g;
};
const fresh=()=>{const g=layer('ink');g.clear();g.resetMatrix();g.blendMode(p.BLEND);g.colorMode(p.RGB,255);return g;};
const present=(g,ttl=.7,bloom=4)=>{
 const trail=layer('history');trail.resetMatrix();trail.blendMode(p.BLEND);trail.colorMode(p.RGB,255);
 const c=trail.drawingContext;c.save();try{c.setTransform(trail.pixelDensity(),0,0,trail.pixelDensity(),0,0);c.globalCompositeOperation='copy';c.filter='blur(.35px)';c.drawImage(trail.canvas,0,0,w,h);}finally{c.restore();}
 trail.background(3,6,12,255*(1-Math.exp(-dt/ttl)));window.avsDecayHistory?.(trail,dt);trail.image(g,0,0,w,h);
 p.blendMode(p.BLEND);p.colorMode(p.RGB,255);p.background(3,6,12);p.imageMode(p.CORNER);
 const ctx=p.drawingContext;ctx.save();try{ctx.filter='blur('+bloom+'px)';ctx.globalAlpha=.45;p.image(trail,0,0,w,h);ctx.filter='none';ctx.globalAlpha=1;p.image(trail,0,0,w,h);}finally{ctx.restore();}
};
p.blendMode(p.BLEND);p.colorMode(p.RGB,255);

const g=fresh(),count=256;
const stereo=a.stereo?.available;
const left=(stereo?a.stereo.left?.waveform:null)||a.waveform||[];
const right=(stereo?a.stereo.right?.waveform:null)||a.waveform||[];
if(!s.xy){
 s.xy={left:new Float32Array(count),right:new Float32Array(count),gain:1,pressure:0,
  families:Array.from({length:4},(_,i)=>({x:rand(0,TAU)+i*.6,y:rand(0,TAU)-i*.4,body:0}))};
}
const xy=s.xy,ease=1-Math.exp(-dt/.19);
let peak=0;
// Real stereo gives each axis its own waveform. Mono uses a quadrature delay.
for(let j=0;j<count;j++){
 const atL=Math.floor(j/count*left.length),atR=Math.floor(j/count*right.length);
 let l=0,r=0;
 for(let k=-3;k<=3;k++){
  l+=left.length?(left[(atL+k+left.length)%left.length]||0):0;
  r+=right.length?(right[(atR+k+(stereo?0:Math.floor(right.length*.19))+right.length)%right.length]||0):0;
 }
 l/=7;r/=7;peak=Math.max(peak,Math.abs(l),Math.abs(r));
 xy.left[j]+=(l-xy.left[j])*ease;xy.right[j]+=(r-xy.right[j])*ease;
}
const gainTarget=Math.min(3.2,1/Math.max(.32,peak));
xy.gain+=(gainTarget-xy.gain)*(1-Math.exp(-dt/.7));
xy.pressure+=(loud-xy.pressure)*ease;
g.translate(w*.5,h*.5);g.noFill();g.colorMode(p.HSB,360,100,100,255);
const ratios=[[2,3],[3,2],[4,5],[1,2]],hues=[178,302,36,247];
// Independent families deform internally: no rigid plate or global rotation.
for(let family=0;family<4;family++){
 const f=xy.families[family],nx=ratios[family][0],ny=ratios[family][1];
 const selected=value(family*Math.max(1,Math.floor(strengths.length/4)));
 f.body+=(selected-f.body)*(1-Math.exp(-dt/.42));
 f.x+=dt*(.055+family*.017+low*(.035+family*.012));
 f.y-=dt*(.041+family*.023+mid*(.027+(3-family)*.011));
 const broad=family<2?1:.86;
 const ampX=w*.47*broad,ampY=h*.46*(family===2?.88:1);
 const alpha=(family<2?74:29)+f.body*(family<2?70:36);
 for(let ink=0;ink<2;ink++){
  g.stroke((hues[family]+high*9)%360,ink?45:79,100,ink?alpha*.78:alpha*.26);
  g.strokeWeight(ink?(family<2?1.15:.72):(family<2?3.4:2.0));g.beginShape();
  for(let j=0;j<=count;j++){
   const theta=j/count*TAU,index=j%count;
   const dx=xy.left[index]*xy.gain,dy=xy.right[index]*xy.gain;
   const weave=.055+f.body*.055;
   const x=.88*Math.sin(theta*nx+f.x)+weave*Math.sin(theta*(nx+2)-f.y)+dx*.065;
   const y=.86*Math.sin(theta*ny+f.y)+weave*Math.sin(theta*(ny+1)+f.x*.73)+dy*.075;
   g.vertex(x*ampX,y*ampY);
  }
  g.endShape(p.CLOSE);
 }
}
// Short phosphor memory keeps crossings readable and removes old footprints.
present(g,.62+xy.pressure*.24,2.4+high*.7);
