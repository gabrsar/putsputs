// Bordado · picos de linha / A agulha costura os picos da música em fileiras de tecido, com cor por frequência, tensão e fio solto. Clique começa outro pano.
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


if(!s.stitches||mouse.clicked||keys.pressed('KeyN')){s.stitches=[];s.needleX=.08;s.row=0;s.accumulator=0;s.serial=0;s.needleY=.22;s.last=null;}
p.background(222,214,193);
p.strokeWeight(.5);p.stroke(90,75,50,16);for(let x=0;x<w;x+=6)p.line(x,0,x,h);for(let y=0;y<h;y+=6)p.line(0,y,w,y);
const waveform=a.waveform||[];
let squareSum=0,packetPeak=0;for(let i=0;i<waveform.length;i+=4){const v=waveform[i];squareSum+=v*v;packetPeak=Math.max(packetPeak,Math.abs(v));}
const packetRms=Math.sqrt(squareSum/Math.max(1,Math.ceil(waveform.length/4)));
s.accumulator+=dt;let steps=0;
while(s.accumulator>=1/28&&steps++<4){
 s.accumulator-=1/28;
 const x=s.needleX,base=.22+s.row*.19;
 let dominant=0,maximum=0;groups.forEach((g,i)=>{const v=g.magnitude??Math.pow(10,(g.db??-120)/20);if(v>maximum){maximum=v;dominant=i;}});
 const envelope=waveform.length?clamp(packetRms*2.4+packetPeak*.22):energy;
 // Alternate the cloth baseline and an audio peak: a running embroidered waveform.
 const y=base-(s.serial%2?envelope*.11:0);
 s.spool??=0;s.nextSpool??=t+7;if(t>s.nextSpool){s.spool=(s.spool+47+rand(0,60))%360;s.nextSpool=t+6+rand(0,6);}
 const hue=(s.spool+12+dominant/Math.max(1,groups.length-1)*255+trend*15+360)%360;
 if(s.last)s.stitches.push({x0:s.last.x,y0:s.last.y,x1:x,y1:y,hue,born:t,peak:envelope,serial:s.serial});
 s.last={x,y};s.needleX+=.0024+energy*.0008;s.needleY=y;s.serial++;
 if(s.needleX>.92){s.needleX=.08;s.row=(s.row+1)%4;s.last=null;}
}
s.stitches=s.stitches.filter(v=>t-v.born<65).slice(-1800);
p.colorMode(p.HSB,360,100,100,255);
for(const v of s.stitches){
 const fade=clamp((65-(t-v.born))/12),x0=v.x0*w,y0=v.y0*h,x1=v.x1*w,y1=v.y1*h;
 p.strokeWeight(2.4);p.stroke(30,35,20,fade*75);p.line(x0+1,y0+1.5,x1+1,y1+1.5);
 p.stroke(v.hue,65,47+v.peak*20,fade*240);p.strokeWeight(1.7+v.peak*.6);p.line(x0,y0,x1,y1);
 p.stroke(v.hue,25,94,fade*150);p.strokeWeight(.45);p.line(x0,y0-.5,x1,y1-.5);
 if(v.serial%3===0){const dx=x1-x0,dy=y1-y0,len=Math.max(1,Math.hypot(dx,dy));p.stroke(v.hue,50,42,fade*160);p.strokeWeight(.65);p.line(x1-dy/len*2,y1+dx/len*2,x1+dy/len*2,y1-dx/len*2);}
}
const nx=s.needleX*w,ny=s.needleY*h;
p.noFill();p.stroke((30+high*170)%360,45,55,190);p.strokeWeight(1);p.bezier(nx,ny,nx+30,ny-55-energy*35,nx+60,ny+40,nx+90,ny+70);
p.stroke(0,0,30,110);p.strokeWeight(3);p.line(nx+1,ny+1,nx+16,ny-18);
p.stroke(0,0,85,240);p.strokeWeight(1.2);p.line(nx,ny,nx+15,ny-19);p.noStroke();p.fill(35,40,20,130);p.circle(nx,ny,2.5);
hint('N / clique: outro pano · os picos viram pontos e tensão no fio');
