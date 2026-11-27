// Tinta · sprays e gotas — Vozes viram sprays finos, graves depositam gotas grossas e a amplitude escolhe a carga de tinta. Pigmentos secam nas bordas.
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


if(!s.drops||a.keyboard?.pressed('KeyN')){s.drops=[];s.spray=0;s.drip=0;s.palette=rand(0,60);}
const paper=layer('paper');if(!s.paperReady){paper.background(6,7,10);paper.noStroke();for(let i=0;i<2500;i++){paper.fill(125,137,151,rand(4,15));paper.circle(rand(0,w),rand(0,h),rand(.3,1.2));}s.paperReady=true;}
p.background(6,7,10);p.image(paper,0,0,w,h);p.colorMode(p.HSB,360,100,100,255);p.noStroke();
let peak=0,squares=0,count=0;for(let i=0;i<(a.waveform?.length||0);i+=8){const v=a.waveform[i];peak=Math.max(peak,Math.abs(v));squares+=v*v;count++;}
const amp=clamp(Math.sqrt(squares/Math.max(1,count))*2+peak*.35),voice=region(280,3500);
const cx=.14+p.noise(14,t*.16)*.72,cy=.12+p.noise(57,t*.17)*.72;
s.spray+=dt*(voice*voice*210+high*35);s.drip+=dt*(2+low*18+amp*12);
let sprays=0;while(s.spray>=1&&sprays++<30){s.spray--;const angle=rand(0,TAU),distance=Math.sqrt(rand())*(.035+voice*.095);s.drops.push({x:clamp(cx+Math.cos(angle)*distance),y:clamp(cy+Math.sin(angle)*distance),r:rand(.0005,.0023)*(1+amp),age:0,hue:195+s.palette+high*50,seed:rand(0,100),spray:true});}
let drips=0;while(s.drip>=1&&drips++<5){s.drip--;if(amp>.035||low>.1||mouse.clicked)s.drops.push({x:mouse.clicked?mouse.nx:clamp(cx+rand(-.10,.10)),y:mouse.clicked?mouse.ny:clamp(cy+rand(-.10,.10)),r:.002+amp*amp*.035+low*.007,age:0,hue:12+s.palette+trend*35,seed:rand(0,100),spray:false});}
if(mouse.clicked)s.drops.push({x:mouse.nx,y:mouse.ny,r:.025,age:0,hue:200+s.palette,seed:rand(0,100),spray:false});
s.drops=s.drops.filter(d=>d.age<95).slice(-1200);
for(const d of s.drops){d.age+=dt;const wet=Math.exp(-d.age/(d.spray?3:15)),fade=clamp((95-d.age)/15),radius=Math.max(.4,d.r*Math.min(w,h)*(1+(1-wet)*.28)),x=d.x*w,y=d.y*h;
 p.noStroke();p.fill((d.hue+360)%360,45+(1-wet)*20,55+wet*20,fade*(d.spray?90:45));p.circle(x,y,radius*2);
 if(!d.spray){p.noFill();p.stroke((d.hue+360)%360,65,38,(1-wet)*fade*95);p.strokeWeight(.7);p.beginShape();for(let j=0;j<=28;j++){const angle=j/28*TAU,r=radius*(.90+.1*p.noise(d.seed+Math.cos(angle)*3,Math.sin(angle)*3));p.vertex(x+Math.cos(angle)*r,y+Math.sin(angle)*r);}p.endShape();p.noStroke();p.fill(48,5,100,wet*fade*65);p.ellipse(x-radius*.27,y-radius*.30,radius*.55,radius*.18);}
}
