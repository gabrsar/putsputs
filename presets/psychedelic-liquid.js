// Psicodélico · plasma líquido — Rios cromáticos com memória desfocada, dobras Perlin, glow e centelhas que entram em certas frases.
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


const g=fresh();g.translate(w/2,h/2);g.colorMode(p.HSB,360,100,100,255);g.noFill();const R=Math.hypot(w,h)*.58;
for(let k=0;k<34;k++){const v=value(Math.floor(k/34*Math.max(1,bands.length))),hue=(225+k*7+t*3)%360;g.stroke(hue,65,60+v*40,35+v*100);g.strokeWeight(.65+v*1.1);g.beginShape();
 for(let j=0;j<=180;j++){const angle=j/180*TAU,noise=(p.noise(Math.cos(angle)*2+k*.1,Math.sin(angle)*2,t*.06)-.5)*(.04+mid*.08);const r=R*(.05+k*.029)*(1+Math.sin(angle*3+t*.17)*(.12+low*.14)+noise);g.vertex(Math.cos(angle+t*.035)*r,Math.sin(angle+t*.035)*r*.85);}g.endShape(p.CLOSE);
 if(weather>.7&&v>.5){const angle=t*.3+k;g.noStroke();g.fill(hue,20,100,120);g.circle(Math.cos(angle)*R*(.1+k*.022),Math.sin(angle)*R*(.1+k*.022)*.85,1+high*3);g.noFill();}
}present(g,1.3+weather*1.6,5+high*3);
