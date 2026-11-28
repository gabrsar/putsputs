// Sound Waves · matéria em interferência — Campo de ondas de duas fontes; waveform real move a malha; clique posiciona uma fonte; W alterna linhas e pontos.
/* global p, a, s */
// Standalone AVS-Lab draw body: p = p5, a = audio/inputs, s = persistent state.
const dt=Math.max(0,Math.min(a.dt??1/60,.05)),w=p.width,h=p.height,TAU=Math.PI*2;
const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
const groups=Object.values(a.groups||{}).filter(g=>g.enabled).sort((x,y)=>x.low-y.low);
const level=g=>clamp(a.visualLevel?a.visualLevel(g.db??-120):((g.db??-120)+80)/55);
const band=(lo,hi)=>{let sum=0,n=0;for(const g of groups)if(g.low<hi&&g.high>lo){sum+=level(g);n++;}return n?sum/n:0;};
const music=a.music||{},mouse=a.mouse||{inside:false,nx:.5,ny:.5,clicked:false,pressed:false,vx:0,vy:0};
const keys=a.keyboard||{pressed:()=>false,down:()=>false};
s.motion??={time:0,low:0,mid:0,high:0,energy:0,trend:0,pulse:0};
const m=s.motion;m.time+=dt;
for(const [key,target]of [['low',band(20,250)],['mid',band(250,4000)],['high',band(4000,22000)],['energy',music.energy??Math.max(0,...groups.map(level))],['trend',music.trend??0]])m[key]+=(target-m[key])*(1-Math.exp(-dt/(key==='trend'?1.5:.24)));
m.pulse=Math.max(music.pulse??0,m.pulse*Math.exp(-dt/.35));
const t=m.time,low=m.low,mid=m.mid,high=m.high,energy=m.energy,trend=m.trend;
const wave=u=>{const v=a.waveform||[];return v.length?v[Math.min(v.length-1,Math.floor(clamp(u)*v.length))]||0:0;};
const hint=text=>{p.push();p.resetMatrix();p.colorMode(p.RGB,255);p.noStroke();p.fill(12,17,25,150);p.rect(10,h-29,Math.min(w-20,text.length*6+18),20,5);p.fill(220,225,230,180);p.textFont('monospace');p.textSize(10);p.textAlign(p.LEFT,p.CENTER);p.text(text,18,h-19);p.pop();};
p.blendMode(p.BLEND);p.colorMode(p.RGB,255);p.rectMode(p.CORNER);p.ellipseMode(p.CENTER);

// Pull the camera back in world units, then generate enough field beyond every
// viewport edge. The vertical compression no longer leaves an empty letterbox.
p.background(3,9,18);s.style??=0;if(keys.pressed('KeyW'))s.style=1-s.style;
const unit=Math.max(1,Math.min(w,h)*.22),tilt=.70;
if(mouse.clicked)s.source={x:((mouse.nx??.5)-.5)*w/unit,y:((mouse.ny??.5)-.5)*h/(unit*tilt)};
const source=s.source||{x:.65,y:.12};
const cols=Math.max(96,Math.min(220,Math.ceil(w/8))),rows=Math.max(96,Math.min(160,Math.ceil(h/7)));
const extentX=w/unit*1.20,extentY=h/(unit*tilt)*1.22;
if(!s.field||s.field.length!==cols*rows*3)s.field=new Float32Array(cols*rows*3);
const field=s.field,phase=t*(1.18+mid*.28);
const waveform=new Float32Array(cols);
for(let col=0;col<cols;col++)waveform[col]=wave(col/(cols-1));
p.colorMode(p.HSB,360,100,100,255);p.noFill();
for(let row=0;row<rows;row++){
 const v=row/(rows-1),Y=(v-.5)*extentY;
 const rowEnergy=groups.length?level(groups[Math.min(groups.length-1,Math.floor(v*groups.length))]):energy;
 if(!s.style){p.stroke(177+v*54+trend*16,48,43+rowEnergy*37,55+energy*82);p.strokeWeight(.58+rowEnergy*.38);p.beginShape();}
 for(let col=0;col<cols;col++){
  const u=col/(cols-1),X=(u-.5)*extentX;
  const d1=Math.hypot(X+.65,Y),d2=Math.hypot(X-source.x,Y-source.y);
  // Two source families remain independent. A third fine cross-current listens
  // to high frequencies, while the actual waveform bends the whole sheet.
  const primary=Math.sin(d1*(8.5+low*2.2)-phase);
  const secondary=Math.sin(d2*(10.2+rowEnergy*1.8)-phase*.87+.28*Math.sin(t*.11));
  const detail=Math.sin(X*12.5-Y*8.2-phase*.39)*high*.026;
  const z=(primary+secondary)*(.034+energy*.080)+waveform[col]*(.035+rowEnergy*.045)+detail;
  const x=w/2+X*unit,y=h/2+(Y*tilt+z)*unit,color=clamp(.5+z*2.8);
  const index=(row*cols+col)*3;field[index]=x;field[index+1]=y;field[index+2]=color;
  if(s.style){p.stroke(178+color*65+high*12,49,35+color*55,100+rowEnergy*70);p.strokeWeight(.7+color*.9);p.point(x,y);}
  else p.vertex(x,y);
 }
 if(!s.style)p.endShape();
}
// Sparse transverse threads reveal depth without turning the field into a cage.
if(!s.style){
 p.stroke(183,30,54,20+high*20);p.strokeWeight(.45);
 for(let col=0;col<cols;col+=9){
  p.beginShape();for(let row=0;row<rows;row++){const i=(row*cols+col)*3;p.vertex(field[i],field[i+1]);}p.endShape();
 }
}
// Vignette is composited after the complete sheet, in physical canvas pixels.
// Rendering each frame from scratch prevents old interference outlines persisting.
const ctx=p.drawingContext,cw=p.canvas.width,ch=p.canvas.height;
ctx.save();try{
 ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.filter='none';
 if(!s.vignette||s.vignette.width!==cw||s.vignette.height!==ch){
  const gradient=ctx.createRadialGradient(cw*.5,ch*.5,Math.min(cw,ch)*.16,cw*.5,ch*.5,Math.hypot(cw,ch)*.60);
  gradient.addColorStop(0,'rgba(0,3,10,0)');gradient.addColorStop(.55,'rgba(0,3,10,.12)');gradient.addColorStop(1,'rgba(0,3,10,.94)');
  s.vignette={width:cw,height:ch,gradient};
 }
 ctx.fillStyle=s.vignette.gradient;ctx.fillRect(0,0,cw,ch);
}finally{ctx.restore();}
if(a.showHUD)hint('clique: move a fonte · W: linhas / pontos · waveform: relevo');
