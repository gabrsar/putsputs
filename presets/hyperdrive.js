// Hyperdrive · nascedouro musical — O túnel nasce no centro a partir do espectro e vem em sua direção. Memória contínua, paredes completas e sem obstáculos.
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
 trail.background(3,6,12,255*(1-Math.exp(-dt/ttl)));trail.image(g,0,0,w,h);
 p.blendMode(p.BLEND);p.colorMode(p.RGB,255);p.background(3,6,12);p.imageMode(p.CORNER);
 const ctx=p.drawingContext;ctx.save();try{ctx.filter='blur('+bloom+'px)';ctx.globalAlpha=.45;p.image(trail,0,0,w,h);ctx.filter='none';ctx.globalAlpha=1;p.image(trail,0,0,w,h);}finally{ctx.restore();}
};
p.blendMode(p.BLEND);p.colorMode(p.RGB,255);

const g=fresh();s.frames??=[];s.next??=0;
const SIDE=48,TTL=7;
if(t>=s.next){
 const cx=.5+(p.noise(t*.06,11)-.5)*.28+trend*.04,cy=.5+(p.noise(t*.07,72)-.5)*.24;
 const profile=Array.from({length:SIDE},(_,i)=>1+value(Math.floor(i/SIDE*Math.max(1,strengths.length)))*.23);
 s.frames.push({born:t,cx,cy,profile,spin:Math.sin(t*.13)*.2,hue:192+Math.sin(t*.03)*20});s.next=t+1/12;if(s.frames.length===1){const first=s.frames[0];s.frames=Array.from({length:84},(_,i)=>({...first,born:t-(83-i)/12,profile:[...first.profile]}));}
}s.frames=s.frames.filter(f=>t-f.born<TTL).slice(-86);
const frames=[...s.frames,{born:t,cx:s.frames.at(-1)?.cx??.5,cy:s.frames.at(-1)?.cy??.5,profile:s.frames.at(-1)?.profile||Array(SIDE).fill(1),spin:s.frames.at(-1)?.spin||0,hue:192}];
const point=(f,j)=>{const age=clamp((t-f.born)/TTL),radius=7+Math.pow(age,2.2)*Math.hypot(w,h)*2.1,angle=j/SIDE*TAU+f.spin;return [f.cx*w+Math.cos(angle)*radius*f.profile[j%SIDE]*w/Math.max(1,Math.min(w,h)),f.cy*h+Math.sin(angle)*radius*f.profile[j%SIDE]*h/Math.max(1,Math.min(w,h))];};
g.colorMode(p.HSB,360,100,100,255);g.strokeWeight(1.05);
// Near opaque walls first, distant rings on top; the tunnel always covers the viewport.
for(let i=0;i<frames.length-1;i++){
 const near=frames[i],far=frames[i+1],age=clamp((t-near.born)/TTL),alpha=145+age*100;
 for(let j=0;j<SIDE;j++){
  const hue=near.hue+j*.6;g.fill(hue,65,5+age*9,255);g.stroke(hue,65,72+age*28,alpha);
  g.quad(...point(near,j),...point(near,j+1),...point(far,j+1),...point(far,j));
 }
}
present(g,.09,3+weather*2);
