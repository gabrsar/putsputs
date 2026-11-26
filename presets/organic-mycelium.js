// Micélio · raízes por frequência — Cada faixa tem sua raiz e cor. A energia faz crescer, picos bifurcam e mudanças de timbre desviam os ramos.
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

if(!s.roots||s.rootCount!==bands.length){s.roots=bands.map((b,i)=>({band:i,x:rand(.1,.9),y:rand(.15,.85),angle:rand(0,TAU),seed:rand(0,500),cooldown:0,age:0,generation:0}));s.rootCount=bands.length;}
const g=fresh();g.colorMode(p.HSB,360,100,100,255);g.noFill();const children=[];
for(const branch of s.roots){
 const v=value(branch.band);if(!bands[branch.band]?.enabled)continue;
 const oldX=branch.x,oldY=branch.y;
 const field=(p.noise(branch.x*3,branch.y*3,branch.seed+t*.045)-.5)*TAU*2;
 const turn=(field-branch.angle+Math.PI*3)%TAU-Math.PI;
 branch.angle+=clamp(turn,-1,1)*dt*(.45+v*2.5)+trend*dt*.35;
 const speed=(1+v*v*105)*dt/Math.max(1,Math.min(w,h));
 branch.x+=Math.cos(branch.angle)*speed;branch.y+=Math.sin(branch.angle)*speed;branch.cooldown-=dt;branch.age+=dt;
 if(branch.x<-.02||branch.x>1.02||branch.y<-.02||branch.y>1.02||mouse.clicked){branch.x=mouse.clicked?mouse.nx:rand(.1,.9);branch.y=mouse.clicked?mouse.ny:rand(.1,.9);continue;}
 const hue=(branch.band/Math.max(1,bands.length)*310+135)%360;
 g.stroke(hue,65,48+v*50,65+v*150);g.strokeWeight(.55+v*1.6);g.line(oldX*w,oldY*h,branch.x*w,branch.y*h);
 if(v>.7&&bands[branch.band].hit&&branch.cooldown<=0&&s.roots.length+children.length<bands.length*4){
  children.push({...branch,angle:branch.angle+(rand()<.5?-1:1)*rand(.35,.9),seed:branch.seed+17,generation:branch.generation+1,age:0,cooldown:1.8});branch.angle-=.25;branch.cooldown=1.5;
 }
}
s.roots.push(...children);s.roots=s.roots.filter(b=>b.generation===0||b.age<16);
present(g,9+weather*8,2.5);
