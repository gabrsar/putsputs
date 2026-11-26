// Violão · madeira e ressonância — Seis cordas, roseta e ondas na madeira; áudio excita as cordas; passe o mouse pressionado para dedilhar.
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

p.background(30,18,15);const scale=Math.min(w/1.85,h/1.05);
p.translate(w*.40,h*.50);p.scale(scale);p.rotate(Math.PI/2);
p.noStroke();p.fill(130,78,41);p.ellipse(0,.1,.94,.94);p.ellipse(0,-.35,.72,.63);
// Grain is deterministic in space; it never flickers with the frame rate.
p.noFill();for(let i=0;i<65;i++){const x=(i/64-.5)*.78;p.stroke(75,40,21,35);p.strokeWeight(.001);p.beginShape();for(let j=0;j<=20;j++){const y=j/20*.84-.43,edge=.46*Math.sqrt(Math.max(0,1-(y-.03)**2/.68**2));p.vertex(clamp(x+Math.sin(y*15+i)*.003,-edge,edge),y);}p.endShape();}
p.noStroke();p.fill(21,12,10);p.ellipse(0,-.11,.30,.30);
for(let k=0;k<7;k++){p.noFill();p.stroke(k%2?211:65,k%2?164:40,k%2?94:25);p.strokeWeight(.003);p.ellipse(0,-.11,.32+k*.009,.32+k*.009);}
for(let i=0;i<48;i++){const angle=i/48*TAU;p.stroke(224,186,119,140);p.line(Math.cos(angle)*.18,-.11+Math.sin(angle)*.18,Math.cos(angle+.035)*.19,-.11+Math.sin(angle+.035)*.19);}
p.noStroke();p.fill(58,32,22);p.rect(-.11,-1,.22,.70,.01);p.fill(54,29,19);p.rect(-.17,.35,.34,.055,.008);
if(!s.strings)s.strings=Array(6).fill(0);
for(let i=0;i<6;i++){
 const strength=groups.length?level(groups[Math.floor(i/6*groups.length)]):energy;
 const screenY=h*.50+(i-2.5)*.034*scale;
 if(mouse.pressed&&mouse.inside&&Math.abs(mouse.ny*h-screenY)<scale*.04)s.strings[i]=1;
 s.strings[i]=Math.max(strength*.65,s.strings[i]*Math.exp(-dt/1.4));
 const amp=(.002+s.strings[i]*.016),x=(i-2.5)*.034;
 p.stroke(231,204-i*9,143-i*8,190);p.strokeWeight(.0012+(5-i)*.00025);p.noFill();p.beginShape();
 for(let j=0;j<=80;j++){const u=j/80,y=-1+u*1.36,vibration=Math.sin(u*Math.PI)*Math.sin(u*TAU*(i+1)+t*(20+i*4))*amp+wave(u)*.012*strength;p.vertex(x+vibration,y);}p.endShape();
}
for(let k=0;k<5;k++){const r=((t*.09+k/5)%1)*.6;p.noFill();p.stroke(234,184,109,(1-r/.6)*energy*28);p.strokeWeight(.002);p.ellipse(0,-.11,r,r);}
if(a.showHUD)hint('mouse pressionado: dedilhar · seis faixas excitam seis cordas');
