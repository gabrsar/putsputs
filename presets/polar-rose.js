// Polar · rosas luminosas — Rosas harmônicas com nervuras, bloom, centelhas e respiração musical. Detalhes surgem e somem com as frases.
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


const g=fresh();g.translate(w/2,h/2);g.rotate(t*.035+Math.sin(t*.13)*mid*.15);g.colorMode(p.HSB,360,100,100,255);g.noFill();
const R=Math.min(w,h)*.52;
for(let layerIndex=0;layerIndex<18;layerIndex++){
 const v=value(layerIndex*3),radius=R*(.12+layerIndex*.048),hue=(175+layerIndex*10+t*.7)%360;
 g.stroke(hue,55,65+v*35,35+v*140);g.strokeWeight(layerIndex%4===0?1.5:.6);g.beginShape();
 for(let j=0;j<=260;j++){const u=j/260,angle=u*TAU,frequency=value(Math.floor(u*Math.max(1,bands.length)));const r=radius*(1+Math.cos(angle*5+t*.20)*(.12+low*.20)+Math.sin(angle*9-t*.12)*high*.10+frequency*.18)+wave(u)*R*.06;g.vertex(Math.cos(angle)*r,Math.sin(angle)*r*.86);}g.endShape(p.CLOSE);
}
s.sparks??=[];if(hit&&s.sparks.length<100)for(let i=0;i<8;i++){const angle=rand(0,TAU);s.sparks.push({angle,r:R*rand(.2,.8),speed:rand(10,60),age:0,hue:rand(170,320)});}
for(const spark of s.sparks){spark.r+=spark.speed*dt;spark.angle+=dt*(.12+high*.4);spark.age+=dt;g.noStroke();g.fill(spark.hue,35,100,clamp(1-spark.age/2)*200);g.circle(Math.cos(spark.angle)*spark.r,Math.sin(spark.angle)*spark.r*.86,1.5+high*2);}s.sparks=s.sparks.filter(v=>v.age<2);
present(g,.7+weather*1.2,5+high*4);
