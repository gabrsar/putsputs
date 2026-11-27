// Braseiro · fogo vivo — Fogo de alta resolução com advecção longa, combustível por frequência, rajadas Perlin e brasas que sobem.
/* global p, a, s */
const dt=Math.max(0,Math.min(a.dt??1/60,.08)),t=a.time||0,w=Math.max(1,Math.round(p.width*.55)),h=Math.max(1,Math.round(p.height*.55)),TAU=Math.PI*2;
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
 if(!g){g=s.layers[key]=p.createGraphics(w,h);g.pixelDensity(1);g.clear();s.dispose=()=>{for(const v of Object.values(s.layers))v.remove();};}
 if(g.width!==w||g.height!==h){const copy=g.get();g.resizeCanvas(w,h);g.image(copy,0,0,w,h);}
 return g;
};
const fresh=()=>{const g=layer('ink');g.clear();g.resetMatrix();g.blendMode(p.BLEND);g.colorMode(p.RGB,255);return g;};
const present=(g,ttl=.7,bloom=4)=>{
 const trail=layer('history');trail.resetMatrix();trail.blendMode(p.BLEND);trail.colorMode(p.RGB,255);
 const c=trail.drawingContext;c.save();try{c.setTransform(trail.pixelDensity(),0,0,trail.pixelDensity(),0,0);c.globalCompositeOperation='copy';c.filter='blur(.35px)';c.drawImage(trail.canvas,0,0,w,h);}finally{c.restore();}
 trail.background(3,6,12,255*(1-Math.exp(-dt/ttl)));trail.image(g,0,0,w,h);
 p.blendMode(p.BLEND);p.colorMode(p.RGB,255);p.background(3,6,12);p.imageMode(p.CORNER);
 const ctx=p.drawingContext;ctx.save();try{ctx.filter='blur('+bloom+'px)';ctx.globalAlpha=.45;p.image(trail,0,0,p.width,p.height);ctx.filter='none';ctx.globalAlpha=1;p.image(trail,0,0,p.width,p.height);}finally{ctx.restore();}
};
p.blendMode(p.BLEND);p.colorMode(p.RGB,255);



// Controlled cooling and turbulent advection keep the flame tips dark and irregular.
const FW=Math.min(240,Math.max(112,Math.round(w*.36))),FH=144;
const fuelAt=x=>{const pos=x/Math.max(1,FW-1)*Math.max(0,strengths.length-1),i=Math.floor(pos),f=pos-i;return value(i)*(1-f)+value(i+1)*f;};
if(!s.heat||s.fw!==FW){
 s.fw=FW;s.heat=new Float32Array(FW*FH);s.next=new Float32Array(FW*FH);s.fire=p.createImage(FW,FH);s.tick=0;s.embers=[];
 s.palette=Array.from({length:256},(_,i)=>{const v=i/255;return [Math.round(255*clamp(v*2.9)),Math.round(235*Math.pow(clamp((v-.17)*1.45),1.2)),Math.round(155*Math.pow(clamp((v-.70)*3.3),1.4))];});
 for(let x=0;x<FW;x++){
  const fuel=clamp(.12+fuelAt(x)*.72)*(.45+.55*p.noise(x*.042,3));
  for(let y=0;y<FH;y++){const distance=FH-1-y;s.heat[y*FW+x]=Math.max(0,fuel-distance*.0048)*( .75+.25*p.noise(x*.07,y*.04));}
 }
}
s.tick+=dt;let steps=0;
while(s.tick>=1/30&&steps++<3){
 s.tick-=1/30;const wind=(p.noise(t*.18,14)-.5)*(1+high*3)+trend;
 for(let y=0;y<FH-1;y++){
  const curl=Math.sin(y*.061-t*1.3)*(1.2+low*1.1);
  for(let x=0;x<FW;x++){
   const shift=wind+curl+(p.noise(x*.028,y*.027,t*.22)-.5)*5;
   const xx=Math.max(1,Math.min(FW-2,x+shift)),x0=Math.floor(xx),fx=xx-x0;
   const yy=Math.min(FH-1,y+1.4+p.noise(x*.035,t*.3)*2.1),y0=Math.floor(yy),fy=yy-y0,y1=Math.min(FH-1,y0+1);
   const row0=s.heat[y0*FW+x0]*(1-fx)+s.heat[y0*FW+x0+1]*fx;
   const row1=s.heat[y1*FW+x0]*(1-fx)+s.heat[y1*FW+x0+1]*fx;
   const heat=row0*(1-fy)+row1*fy;
   const cooling=.0026+rand(0,.0038)+(1-y/FH)*.001;
   s.next[y*FW+x]=Math.max(0,heat-cooling);
  }
 }
 for(let x=0;x<FW;x++){
  const v=fuelAt(x),tongue=.32+.68*p.noise(x*.045,t*.75),spark=rand()<.018?rand(.12,.28):0;
  s.next[(FH-1)*FW+x]=clamp((.045+v*.88+low*.08)*tongue+spark);
 }
 const swap=s.heat;s.heat=s.next;s.next=swap;
}
s.fire.loadPixels();for(let i=0;i<s.heat.length;i++){const c=s.palette[Math.round(clamp(s.heat[i])*255)],j=i*4;s.fire.pixels[j]=c[0];s.fire.pixels[j+1]=c[1];s.fire.pixels[j+2]=c[2];s.fire.pixels[j+3]=255;}s.fire.updatePixels();
const g=fresh();g.smooth();g.image(s.fire,0,0,w,h);
if(s.embers.length<60&&rand()<dt*(6+low*26))s.embers.push({x:rand(0,w),y:h*.96,age:0,speed:rand(30,90),seed:rand(0,100)});
for(const e of s.embers){e.age+=dt;e.x+=Math.sin(t*.8+e.seed)*dt*13;e.y-=e.speed*dt;g.noStroke();g.fill(255,145,45,clamp(1-e.age/4)*190);g.circle(e.x,e.y,.7+low*1.5);}s.embers=s.embers.filter(e=>e.age<4&&e.y>0);
present(g,.08,2.5);

