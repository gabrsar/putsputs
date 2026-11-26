// Sound Waves · matéria em interferência — Campo de ondas de duas fontes; waveform real move a malha; clique posiciona uma fonte; W alterna linhas e pontos.
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
const hint=text=>{p.push();p.resetMatrix();p.colorMode(p.RGB,255);p.noStroke();p.fill(12,17,25,150);p.rect(10,h-29,Math.min(w-20,text.length*6+18),20,5);p.fill(220,225,230,180);p.textFont('monospace');p.textSize(10);p.textAlign(p.LEFT,p.CENTER);p.text(text,18,h-19);p.pop();};
p.blendMode(p.BLEND);p.colorMode(p.RGB,255);p.rectMode(p.CORNER);p.ellipseMode(p.CENTER);

p.background(5,15,25,255*(1-Math.exp(-dt/.18)));s.style??=0;if(keys.pressed('KeyW'))s.style=1-s.style;if(mouse.clicked)s.source={x:(mouse.nx-.5)*2,y:(mouse.ny-.5)*2};
const source=s.source||{x:.4,y:.08},R=Math.max(w,h)*1.65,cols=90,rows=64,rotation=t*.025+trend*.12;
p.colorMode(p.HSB,360,100,100,255);p.noFill();p.strokeWeight(.7);
for(let row=0;row<rows;row++){
 const Y=(row/(rows-1)-.5)*1.35;p.beginShape();
 for(let col=0;col<cols;col++){
  const X=(col/(cols-1)-.5)*1.75,d1=Math.hypot(X+.4,Y),d2=Math.hypot(X-source.x,Y-source.y),phase=t*(1.3+mid*.6);
  const z=(Math.sin(d1*(13+low*4)-phase)+Math.sin(d2*15-phase*.93))*(.018+energy*.045)+wave(col/(cols-1))*.025;
  const xx=X*Math.cos(rotation)-Y*Math.sin(rotation)*.15,yy=Y*.55+z;
  const x=w/2+xx*R,y=h/2+yy*R,color=clamp((z+.12)/.24);
  if(s.style){p.stroke(175+color*65+high*20,55,45+color*48,130);p.strokeWeight(.8+color*1.1+energy);p.point(x,y);}else{p.stroke(175+row*.9+trend*30,50,55+energy*30,65+energy*80);p.vertex(x,y);}
 }
 p.endShape();
}
hint('clique: move a fonte · W: linhas / pontos · waveform: relevo');
