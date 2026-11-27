// Color Mix · sirenes na noite — Reflexos vermelhos e azuis como luzes de polícia através de vidro, alternância musical e manchas de luz.
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
 const trail=layer('history'),c=trail.drawingContext;
 const decay=1-Math.exp(-dt/ttl);
 c.save();
 try{
  c.setTransform(trail.pixelDensity(),0,0,trail.pixelDensity(),0,0);
  c.globalCompositeOperation='destination-out';
  c.globalAlpha=decay;
  c.fillStyle='#000';c.fillRect(0,0,w,h);
  c.globalCompositeOperation='lighter';
  c.globalAlpha=decay;
  c.drawImage(g.canvas,0,0,w,h);
 }finally{c.restore();}
 p.blendMode(p.BLEND);p.colorMode(p.RGB,255);p.background(3,6,12);
 const ctx=p.drawingContext;
 ctx.save();
 try{
  ctx.globalCompositeOperation='lighter';
  ctx.drawImage(trail.canvas,0,0,w,h);
  ctx.filter='blur('+bloom+'px)';
  ctx.globalAlpha=.44;
  ctx.drawImage(trail.canvas,0,0,w,h);
 }finally{ctx.restore();}
};

const g=fresh();g.noStroke();g.blendMode(p.ADD);
for(let side=0;side<2;side++){
 const phase=t*(2.1+low*.8)+side*Math.PI,flash=.26+.74*Math.pow(Math.max(0,Math.sin(phase)),3),v=side?high:low;
 const x=w*(side?.76:.24)+Math.sin(t*.24+side)*w*.11,y=h*(.48+Math.sin(t*.31+side)*.17);
 const c=g.drawingContext,rad=Math.hypot(w,h)*(.40+v*.25),gradient=c.createRadialGradient(x,y,0,x,y,rad);
 gradient.addColorStop(0,side?'rgba(72,132,255,'+(flash*.8)+')':'rgba(255,40,65,'+(flash*.8)+')');gradient.addColorStop(.18,side?'rgba(25,65,245,'+(flash*.40)+')':'rgba(220,12,30,'+(flash*.40)+')');gradient.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gradient;c.fillRect(0,0,w,h);
 for(let k=0;k<5;k++){g.fill(side?50:255,side?115:35,side?255:65,flash*(12+v*22));g.ellipse(x+Math.sin(k*9)*w*.12,y+Math.cos(k*7)*h*.20,w*(.18+k*.09),h*.08);}
}
const c=g.drawingContext;
for(let pair=0;pair<3;pair++){
 const gate=Math.pow(Math.max(0,Math.sin(t*(.13+pair*.043)+pair*2.7)),3)*(.15+mid*.34);
 if(gate<.015)continue;
 const spacing=.19+.14*Math.sin(t*.38+pair*2);
 for(let side=0;side<2;side++){
  const x=w*(.5+(side?1:-1)*spacing)+w*.1*Math.sin(t*.28+pair);
  const y=h*(.28+pair*.22+.09*Math.cos(t*.31+side));
  const radius=Math.min(w,h)*(.24+pair*.06);
  const glow=c.createRadialGradient(x,y,0,x,y,radius);
  const color=side?'66,120,255':'255,42,78';
  glow.addColorStop(0,'rgba('+color+','+gate+')');
  glow.addColorStop(1,'rgba('+color+',0)');
  c.fillStyle=glow;c.fillRect(x-radius,y-radius,2*radius,2*radius);
 }
}
present(g,.30+weather*.35,12);
