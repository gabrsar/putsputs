// Infinity · desenho por frequência — Inspirado no seu Infinity Hand Drawer: uma linha por faixa, centro e tamanho em Perlin, traços acumulados e reversão de sentido.
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
 const ctx=p.drawingContext;ctx.save();try{ctx.filter='blur('+bloom+'px)';ctx.globalAlpha=.27;p.image(trail,0,0,w,h);ctx.filter='none';ctx.globalAlpha=1;p.image(trail,0,0,w,h);}finally{ctx.restore();}
};
p.blendMode(p.BLEND);p.colorMode(p.RGB,255);

if(!s.pens||s.pens.length!==bands.length)s.pens=bands.map((g,i)=>({phase:i*.03,x:null,y:null,seed:rand(0,1000)}));
const g=fresh();g.colorMode(p.HSB,360,100,100,255);g.noFill();
for(let i=0;i<s.pens.length;i++){
 const pen=s.pens[i],v=value(i);if(!bands[i].enabled){pen.x=null;continue;}
 const rate=.7+v*2.4+i/Math.max(1,bands.length)*.5;
 pen.phase+=dt*rate;const direction=Math.floor(pen.phase/TAU)%2?-1:1;
 const cx=w*(.5+(p.noise(pen.seed,t*.055)-.5)*.38),cy=h*(.5+(p.noise(pen.seed+40,t*.07)-.5)*.36);
 const rx=w*(.26+v*.12+(p.noise(pen.seed+10,t*.08)-.5)*.11),ry=h*(.20+v*.10);
 const x=cx+direction*rx*Math.cos(pen.phase),y=cy+direction*ry*Math.sin(pen.phase*2);
 const hue=(185+i/Math.max(1,bands.length)*220+trend*15)%360;
 g.stroke(hue,50+v*35,55+v*45,45+v*145);g.strokeWeight(.6+v*1.3);
 if(pen.x!==null&&Math.hypot(x-pen.x,y-pen.y)<Math.hypot(w,h)*.3)g.line(pen.x,pen.y,x,y);
 pen.x=x;pen.y=y;
 if(hit&&v>.65){g.noStroke();g.fill(hue,35,100,160);g.circle(x,y,2+v*3);}
}
present(g,7+weather*7,4.2);
