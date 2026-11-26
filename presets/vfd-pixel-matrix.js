// VFD · matriz de pixels / Display fluorescente de 104 × 36 pontos, relógio em dot matrix, grade física e persistência luminosa. Clique alterna espectro/waveform.
/* global p, a, s */
// Standalone AVS-Lab draw body: p = p5, a = audio/inputs, s = persistent state.
const dt=Math.max(0,Math.min(a.dt??1/60,.05)),w=p.width,h=p.height,TAU=Math.PI*2;
const clamp=(v,lo=0,hi=1)=>Math.max(lo,Math.min(hi,v));
const rand=(lo=0,hi=1)=>a.rand?a.rand(lo,hi):lo+Math.random()*(hi-lo);
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
const hint=text=>{if(!a.showHUD)return;p.push();p.resetMatrix();p.colorMode(p.RGB,255);p.noStroke();p.fill(12,17,25,150);p.rect(10,h-29,Math.min(w-20,text.length*6+18),20,5);p.fill(220,225,230,180);p.textFont('monospace');p.textSize(10);p.textAlign(p.LEFT,p.CENTER);p.text(text,18,h-19);p.pop();};
p.blendMode(p.BLEND);p.colorMode(p.RGB,255);p.rectMode(p.CORNER);p.ellipseMode(p.CENTER);


const PIXEL=true;
s.mode??=0;if(mouse.clicked||keys.pressed('KeyV'))s.mode=1-s.mode;
const cols=PIXEL?104:32,rows=PIXEL?36:20,pad=Math.min(w,h)*.07;
const left=pad*1.2,top=h*.26,displayW=w-left*2,displayH=h*.61,cw=displayW/cols,ch=displayH/rows;
if(!s.plate||s.plate.width!==w||s.plate.height!==h){
 s.plate?.remove();s.screen?.remove();s.plate=p.createGraphics(w,h);s.screen=p.createGraphics(w,h);
 s.plate.pixelDensity(a.pixelDensity??1);s.screen.pixelDensity(a.pixelDensity??1);
 s.dispose=()=>{s.plate.remove();s.screen.remove();};
 const b=s.plate;b.background(3,10,12);b.noFill();b.stroke(70,112,108,70);b.strokeWeight(1);b.rect(pad*.5,pad*.45,w-pad,h-pad*.9,12);
 b.stroke(105,151,141,22);b.rect(pad*.7,pad*.65,w-pad*1.4,h-pad*1.3,9);
 // Visible inactive phosphor and a real-looking electrode lattice behind the display.
 for(let x=0;x<cols;x++)for(let y=0;y<rows;y++){
  const xx=left+x*cw,yy=top+y*ch;b.noStroke();b.fill(65,126,110,PIXEL?32:27);
  b.rect(xx+cw*.14,yy+ch*.17,cw*.72,ch*(PIXEL?.66:.53),Math.min(1.5,cw*.1));
 }
 b.strokeWeight(.45);
 for(let x=left;x<=w-left;x+=Math.max(3,cw*.5)){b.stroke(104,155,143,24);b.line(x,top-9,x,top+displayH+9);}
 for(let y=top-5;y<=top+displayH+5;y+=Math.max(3,ch*.5)){b.stroke(99,141,131,20);b.line(left-7,y,w-left+7,y);}
 // Grid frames, cathode filaments and little welded contacts, all under the glass.
 for(let bank=0;bank<8;bank++){
  const x=left+bank*displayW/8;b.stroke(111,155,143,42);b.noFill();b.rect(x+2,top-11,displayW/8-4,displayH+22,2);
  b.stroke(126,117,86,55);b.line(x+displayW/16,top-18,x+displayW/16,top+displayH+18);
  b.noStroke();b.fill(155,155,122,100);b.circle(x+displayW/16,top-17,2.5);b.circle(x+displayW/16,top+displayH+17,2.5);
 }
 for(let k=0;k<5;k++){const y=top+displayH*(k+.5)/5;b.stroke(170,104,66,30);b.strokeWeight(.6);b.line(left-15,y,w-left+15,y);}
 b.stroke(81,124,116,65);b.strokeWeight(1);for(let k=0;k<28;k++){const x=left+k/27*displayW;b.line(x,h-pad*.6,x,h-pad*.25);}
 b.noStroke();b.fill(126,178,155,95);b.textFont('monospace');b.textSize(Math.max(8,Math.min(11,w*.012)));b.textAlign(p.LEFT,p.TOP);b.text(PIXEL?'DOT MATRIX / 104 × 36':'FLUORESCENT ANALYZER / GRID DRIVE',left,h*.065);
}
p.background(2,7,9);p.image(s.plate,0,0,w,h);
const g=s.screen;g.clear();g.noStroke();s.bars??=Array(cols).fill(0);s.peaks??=Array(cols).fill(0);
for(let x=0;x<cols;x++){
 const group=groups[Math.min(groups.length-1,Math.floor(x/cols*groups.length))],target=group?level(group):0;
 s.bars[x]+=(target-s.bars[x])*(1-Math.exp(-dt/(target>s.bars[x]?.025:.22)));
 s.peaks[x]=Math.max(s.bars[x],s.peaks[x]-dt*.19);
 for(let y=0;y<rows;y++){
  if(!s.mode&&x%4===3)continue;
  const row=rows-1-y,height=s.bars[x]*rows;
  let brightness=0;
  if(!s.mode)brightness=row<height?.35+s.bars[x]*.65:Math.abs(row-s.peaks[x]*rows)<.6?.7:0;
  else{
   const center=(.5-wave(x/(cols-1))*.40)*rows;
   const distance=Math.abs(y-center);brightness=Math.exp(-distance*(PIXEL?1.2:1.7))*(.2+energy*.8);
  }
  if(brightness<.02)continue;
  const xx=left+x*cw,yy=top+y*ch;
  g.fill(95+brightness*40,230+brightness*25,182+brightness*50,brightness*235);
  g.rect(xx+cw*.14,yy+ch*.17,cw*.72,ch*(PIXEL?.66:.53),Math.min(1.5,cw*.1));
  if(!PIXEL){g.fill(190,255,226,brightness*65);g.rect(xx+cw*.16,yy+ch*.17,cw*.68,ch*.12);}
 }
}
// Seven-segment phosphor lives above the electrode grid; the pixel version uses a dot font.
const now=a.clock||{},clock=String(now.hour??0).padStart(2,'0')+String(now.minute??0).padStart(2,'0');
if(!PIXEL){
 const masks=[63,6,91,79,102,109,125,7,127,111],dh=Math.min(58,h*.095),dw=dh*.52;
 const segments=[[.1,0,.8,.1],[.87,.06,.1,.4],[.87,.54,.1,.4],[.1,.9,.8,.1],[.03,.54,.1,.4],[.03,.06,.1,.4],[.1,.45,.8,.1]];
 for(let d=0;d<4;d++)for(let j=0;j<7;j++){const q=segments[j],on=masks[+clock[d]]&(1<<j);g.fill(117,255,208,on?215:17);g.rect(left+d*dw*1.45+(d>1?dw*.25:0)+q[0]*dw,h*.11+q[1]*dh,q[2]*dw,q[3]*dh,1);}
}else{
 const font=['01110100011001110101110011000101110','00100011000010000100001000010001110','01110100010000100010001000100011111','11110000010000101110000010000111110','00010001100101010010111110001000010','11111100001000011110000010000111110','01110100001000011110100011000101110','11111000010001000100010000100001000','01110100011000101110100011000101110','01110100011000101111000010000101110'];
 const cell=Math.max(2,Math.min(6,h*.013));
 for(let d=0;d<4;d++)for(let y=0;y<7;y++)for(let x=0;x<5;x++){g.fill(111,255,208,font[+clock[d]][y*5+x]==='1'?210:14);g.rect(left+(d*7+x)*cell+(d>1?cell:0),h*.11+y*cell,cell*.70,cell*.70,.5);}
}
g.fill(100,227,191,160);g.textFont('monospace');g.textSize(Math.max(9,Math.min(14,w*.016)));g.textAlign(p.RIGHT,p.TOP);g.text(s.mode?'OSC / TIME DOMAIN':'FFT / PEAK HOLD',w-left,h*.125);
// Bloom the active phosphor only, keeping the underlying metal matrix sharp.
const ctx=p.drawingContext;ctx.save();
try{ctx.filter='blur(5px)';ctx.globalAlpha=.48;p.image(g,0,0,w,h);ctx.filter='none';ctx.globalAlpha=1;p.image(g,0,0,w,h);}finally{ctx.restore();}
const glass=ctx.createLinearGradient(0,0,w,h);glass.addColorStop(0,'rgba(215,250,242,.075)');glass.addColorStop(.37,'rgba(215,250,242,0)');glass.addColorStop(.39,'rgba(215,250,242,.025)');glass.addColorStop(1,'rgba(215,250,242,0)');ctx.fillStyle=glass;ctx.fillRect(pad*.5,pad*.45,w-pad,h-pad*.9);
hint('V / clique: espectro com peak hold ↔ osciloscópio');
