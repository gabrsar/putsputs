// Rádios · frequência recursiva
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


const g=fresh();g.translate(w/2,h/2);g.rotate(Math.sin(t*.18)*(.02+low*.035));
const W=Math.min(w*.91,h*1.8),H=W*.56;
function radio(cx,cy,rw,rh,depth){
 if(depth>7||rw<4)return;
 const v=value(depth*6),hue=175+depth*17;
 g.push();g.translate(cx,cy);g.rotate(Math.sin(t*.30+depth*.4)*v*.018);
 g.rectMode(p.CENTER);g.strokeWeight(Math.max(.4,rw*.002));g.stroke(178,139,93,190);g.fill(64,43,31,255);g.rect(0,0,rw,rh,rw*.025);
 g.stroke(203,178,128,150);g.fill(18,26,27,255);g.rect(0,0,rw*.96,rh*.91,rw*.02);
 // Woven speaker grille on the left.
 const speakerX=-rw*.30,speakerR=rh*.34;g.noStroke();g.fill(5,11,13);g.circle(speakerX,0,speakerR*2);
 g.stroke(111,125,115,75);g.strokeWeight(Math.max(.4,rw*.001));
 for(let i=-9;i<=9;i++){const q=i/10,span=Math.sqrt(Math.max(0,1-q*q))*speakerR;g.line(speakerX+q*speakerR,-span,speakerX+q*speakerR,span);}
 for(let i=0;i<4;i++){g.noFill();g.stroke(124,147,132,35+v*30);g.circle(speakerX,0,speakerR*(.55+i*.38)*(1+v*.025));}
 // The tuning display contains the next complete radio.
 const sx=rw*.18,sy=-rh*.08,sw=rw*.49,sh=rh*.55;
 g.noStroke();g.fill(4,15,18);g.rect(sx,sy,sw,sh,rw*.008);g.stroke(87,201,175,100+v*100);g.noFill();g.rect(sx,sy,sw,sh,rw*.008);
 g.stroke(99,178,156,80);for(let i=0;i<17;i++){const x=sx-sw*.45+i/16*sw*.90;g.line(x,sy+sh*.30,x,sy+sh*(i%4===0?.45:.40));}
 g.stroke(242,161,84,210);const needle=sx+Math.sin(t*.35+depth)*sw*(.20+v*.18);g.line(needle,sy+sh*.23,needle,sy+sh*.46);
 for(let k=0;k<2;k++){const x=rw*(.06+k*.27),y=rh*.33;g.noStroke();g.fill(111,108,91);g.circle(x,y,rh*.15);g.stroke(224,208,156,200);g.line(x,y,x+Math.sin(t*.2+depth+k)*rh*.045,y-rh*.045);}
 if(depth<3){g.noStroke();g.fill(181,202,178,180);g.textFont('monospace');g.textAlign(p.CENTER,p.CENTER);g.textSize(Math.max(5,rw*.018));g.text('∞ FM  /  '+String(88+depth*2)+'.'+Math.floor(v*9),rw*.17,-rh*.37);}
 radio(sx,sy-sh*.08,sw*.92,sh*.60,depth+1);
 g.pop();
}
radio(0,0,W,H,0);present(g,.35,3.5);
