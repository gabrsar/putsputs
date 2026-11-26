// Polarizer · tensões de luz — Filmes birrefringentes simulados em baixa resolução; mouse gira o analisador; clique muda as camadas.
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

const rw=Math.max(48,Math.min(230,Math.round(w/5))),rh=Math.max(40,Math.round(rw*h/Math.max(w,1)));
if(!s.film){s.film=p.createGraphics(rw,rh);s.film.pixelDensity(1);s.dispose=()=>s.film.remove();s.offset=rand(0,TAU);s.tick=0;}
if(s.film.width!==rw||s.film.height!==rh)s.film.resizeCanvas(rw,rh);
if(mouse.clicked||keys.pressed('KeyN'))s.offset=rand(0,TAU);
s.tick+=dt;
if(s.tick>=1/24||!s.rendered){s.tick=0;s.rendered=true;const g=s.film;g.loadPixels();const angle=(mouse.inside?mouse.nx*Math.PI:t*.045)+s.offset,stretch=1+low*.20;
 for(let y=0;y<rh;y++)for(let x=0;x<rw;x++){
  const X=(x/rw-.5)*w/Math.max(h,1)*2,Y=(y/rh-.5)*2;
  const u=X*Math.cos(angle)-Y*Math.sin(angle),v=X*Math.sin(angle)+Y*Math.cos(angle);
  const r1=Math.hypot(u+.40,v*.85),r2=Math.hypot(u-.42,v+.18),stress=(r1*3.2-r2*1.7+Math.sin(u*3+t*.08)*.45)*stretch;
  const axis=Math.atan2(v,u+.3)+Math.sin(v*3+u*2)*.45,transmission=Math.sin(2*(axis-angle))**2;
  const i=(x+y*rw)*4;
  for(let channel=0;channel<3;channel++){const retardation=stress*[2.7,3.5,4.6][channel]+channel*.3+high*.20;g.pixels[i+channel]=10+Math.pow(Math.sin(retardation)**2*transmission,.65)*220;}
  g.pixels[i+3]=255;
 }g.updatePixels();
}
p.background(7,9,13);p.image(s.film,0,0,w,h);
p.noFill();p.stroke(224,238,242,45);p.strokeWeight(1);const r=Math.min(w,h)*.38;p.circle(w/2,h/2,r*2);
hint('mouse: gira o polarizador · N / clique: outra tensão');
