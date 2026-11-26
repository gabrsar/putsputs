// Negroni · líquido em órbita — O copo balança, o líquido gira e as ondas batem nas paredes; âmbar, cobre e reflexos de gelo.
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

const g=fresh();s.spin??=0;s.spin+=dt*(.22+mid*.65);s.slosh??=0;s.slosh+=(low-s.slosh)*(1-Math.exp(-dt/.12));
g.translate(w/2,h/2);g.rotate(Math.sin(t*.53)*(.10+s.slosh*.14)+trend*.12);g.colorMode(p.HSB,360,100,100,255);g.noFill();
const R=Math.min(w,h)*.40;
for(let ring=28;ring>=0;ring--){const q=ring/28,rad=R*(.10+q*.95),v=value(ring*2),phi=s.spin+q*.7;
 g.stroke((17+q*20+high*8)%360,65,45+v*50,55+v*95);g.strokeWeight(.65+v*1.4);g.beginShape();
 for(let j=0;j<=120;j++){const angle=j/120*TAU,flow=Math.sin(angle*3-phi*2)*low*.13+Math.sin(angle*7+phi)*high*.04;const rr=rad*(1+flow);g.vertex(Math.cos(angle+phi*.18)*rr,Math.sin(angle+phi*.18)*rr*.72+Math.sin(phi+q*5)*R*low*.10);}g.endShape(p.CLOSE);
}
g.stroke(35,18,95,170);g.strokeWeight(2);g.ellipse(0,0,R*2.17,R*1.59);
for(let i=0;i<4;i++){g.push();const angle=s.spin*.6+i*TAU/4;g.translate(Math.cos(angle)*R*.40,Math.sin(angle)*R*.28);g.rotate(-angle*.7);g.stroke(38,20,100,85+high*80);g.fill(35,10,90,8);g.rectMode(p.CENTER);g.rect(0,0,R*.34,R*.27,8);g.pop();}
present(g,.5+weather*.7,5);
