const t=a.time||0,w=p.width,h=p.height,span=Math.min(w,h),dt=Math.min(.06,a.dt??1/60);
s.motion??=[0,0];
const ease=1-Math.exp(-dt/.25);
s.motion[0]+=((a.bass||0)-s.motion[0])*ease;
s.motion[1]+=((a.treble||0)-s.motion[1])*ease;
if(!s.glow){
 s.glow=p.createGraphics(w,h);s.glow.pixelDensity(1);s.dispose=()=>s.glow.remove();
}
const g=s.glow;
if(g.width!==w||g.height!==h)g.resizeCanvas(w,h);
g.clear();g.blendMode(p.ADD);
p.background(5,5,14);
const palette=[[85,238,180],[105,144,255],[248,101,192]];
for(let head=0;head<3;head++){
 const ink=palette[head],cx=w*(.27+.23*head),cy=h*(.47+.10*Math.sin(t*.28+head));
 const tilt=.56+.12*Math.cos(t*.31+head),turn=t*(head===1?-.42:.38)+head*.9;
 const scale=span*(.19+s.motion[0]*.065);
 const sourceX=w*(.33+.17*head),sourceY=h*.92;
 for(let ring=0;ring<3;ring++){
  for(let i=0;i<9;i++){
   const theta=i*Math.PI*2/9+turn+ring*.22;
   const radius=scale*(.42+ring*.31);
   const x=cx+Math.cos(theta)*radius,y=cy+Math.sin(theta)*radius*tilt;
   const brightness=.52+.48*Math.pow(.5+.5*Math.sin(theta*2.+t*.56+ring),2);
   g.stroke(...ink,ring===2?17:10);g.strokeWeight(1);g.line(sourceX,sourceY,x,y);
   g.noStroke();g.fill(...ink,42*brightness);g.circle(x,y,6+ring+s.motion[1]*4);
   const size=1.5+ring*.58+s.motion[1]*2.;
   g.stroke(...ink,175*brightness);g.strokeWeight(.85);
   for(let ray=0;ray<3;ray++){
    const angle=turn*.65+ray*Math.PI/3+i*.13,dx=Math.cos(angle)*size,dy=Math.sin(angle)*size;
    g.line(x-dx,y-dy,x+dx,y+dy);
   }
   g.noStroke();g.fill(218,238,255,140*brightness);g.circle(x,y,1.35);
  }
 }
}
const ctx=p.drawingContext;ctx.save();
try{
 ctx.globalCompositeOperation='lighter';
 ctx.filter='blur(6px)';ctx.globalAlpha=.75;ctx.drawImage(g.canvas,0,0,w,h);
 ctx.filter='none';ctx.globalAlpha=1;ctx.drawImage(g.canvas,0,0,w,h);
}finally{ctx.restore();}
