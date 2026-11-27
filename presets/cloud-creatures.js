// Nuvens · bichos de algodão — Pareidolia de gato, coelho, baleia e bule; clique ou N troca a forma; mouse sopra as nuvens.
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

p.background(114,151,185);
const c=p.drawingContext;
const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#6d96bd');sky.addColorStop(1,'#d5d7d0');c.fillStyle=sky;c.fillRect(0,0,w,h);
// Equal-size puff sets interpolate continuously, rather than swapping silhouettes.
const forms=[
 [[-.7,.1,.44],[-.25,.12,.52],[.25,.12,.52],[.7,.1,.44],[-.50,-.47,.30],[.50,-.47,.30],[-.53,-.72,.19],[.53,-.72,.19],[-.9,.15,.25],[.9,.15,.25],[0,.42,.36],[0,-.05,.42]],
 [[-.4,.15,.50],[0,.1,.58],[.4,.15,.50],[.65,.25,.27],[-.32,-.55,.26],[.27,-.55,.26],[-.34,-.99,.22],[.29,-1.04,.22],[-.65,.4,.30],[.35,.45,.30],[0,.42,.38],[0,-.18,.38]],
 [[-.65,.04,.48],[-.20,.08,.56],[.3,.12,.53],[.70,.05,.39],[1.02,-.05,.22],[1.14,-.26,.24],[1.25,-.4,.19],[1.1,-.5,.21],[-.95,-.08,.3],[.25,.44,.24],[-.25,-.36,.26],[0,-.05,.4]],
 [[-.5,.1,.45],[0,.15,.63],[.45,.1,.48],[.78,.1,.26],[.94,-.11,.22],[1.03,-.34,.17],[-.88,-.22,.20],[-1.02,.04,.19],[-.86,.30,.20],[0,-.40,.34],[0,-.65,.18],[0,.53,.40]]
];
if(!s.clouds){s.clouds=Array.from({length:22},(_,i)=>({x:((i%6)+rand(.05,.95))/6,y:.14+Math.floor(i/6)*.22+rand(-.025,.025),scale:rand(.075,.14)*(i<6?.70:1),seed:rand(0,10),points:forms[i%4].map(v=>[...v])}));s.form=0;s.next=20;}
if(t>s.next||mouse.clicked||keys.pressed('KeyN')){s.form=(s.form+1)%4;s.next=t+22;}
for(let i=0;i<s.clouds.length;i++){
 const cloud=s.clouds[i],layer=i%3, signal=[low,mid,high][layer];
 cloud.phase=(cloud.phase??cloud.seed)+dt*(.20+layer*.18+signal*2);
 const size=Math.min(w,h)*cloud.scale*(.9+signal*.48),form=forms[(s.form+i)%4];
 const thickness=.72+signal*.85,opacity=.40+signal*.50;
 cloud.x+=dt*(.009+layer*.007+signal*.065+trend*.002+clamp(mouse.vx||0,-500,500)*.000015);if(cloud.x>1.35)cloud.x=-.35;if(cloud.x<-.35)cloud.x=1.35;
 const x=cloud.x*w,y=cloud.y*h+Math.sin(cloud.phase)*h*(.035+layer*.019+signal*.06);
 for(let j=0;j<form.length;j++){
  const v=cloud.points[j];for(let k=0;k<3;k++)v[k]+=(form[j][k]-v[k])*(1-Math.exp(-dt/3));
  const xx=x+(v[0]+Math.sin(t*.20+j+cloud.seed)*.025)*size,yy=y+v[1]*size*thickness,r=size*v[2]*(1+mid*.04);
  const glow=c.createRadialGradient(xx-r*.15,yy-r*.22,r*.12,xx,yy,r*1.22);
  glow.addColorStop(0,'rgba(255,253,242,.78)');glow.addColorStop(.55,'rgba(249,248,241,.63)');glow.addColorStop(1,'rgba(243,247,248,0)');
  c.save();c.globalAlpha=opacity;c.translate(xx,yy);c.scale(1,thickness);c.translate(-xx,-yy);c.fillStyle=glow;c.beginPath();c.arc(xx,yy,r*1.22,0,TAU);c.fill();c.restore();
 }
}
if(a.showHUD)hint('N / clique: outra pareidolia · mouse: vento');
