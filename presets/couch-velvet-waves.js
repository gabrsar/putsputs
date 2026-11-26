// Sofá · ondas de veludo / Tecido retro de chevrons entrelaçados, fios e cores de estofado. Os graves franzem a trama; clique troca a paleta.
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


s.palette??=0;if(mouse.clicked||keys.pressed('KeyC'))s.palette=(s.palette+1)%3;
const palettes=[['#332538','#8c526b','#bd8b93','#d9bda5','#6c6f82'],['#302e3b','#82627d','#bc8d83','#dfc5a0','#687b85'],['#382d28','#9b4b32','#c17c3a','#d4b66c','#64725c']];
const colors=palettes[s.palette],unit=Math.max(68,Math.min(w,h)*.23),stripe=unit/7;
p.background(colors[0]);p.noStroke();
// Continuous woven chevrons. Each colored band shares the same warped coordinates.
const weaveY=(x,row)=>{
 const u=x/unit,triangle=Math.sin(u*Math.PI+t*.04);
 const fold=Math.sin(u*.8+row*.45+t*.11)*low*unit*.065;
 return row*stripe+triangle*unit*.33+fold;
};
for(let row=-9;row<h/stripe+10;row++){
 p.fill(colors[((row%colors.length)+colors.length)%colors.length]);p.beginShape();
 for(let x=-unit;x<=w+unit;x+=6)p.vertex(x,weaveY(x,row));
 for(let x=w+unit;x>=-unit;x-=6)p.vertex(x,weaveY(x,row+1));p.endShape(p.CLOSE);
 // A pair of yarn edges gives the bands a tangible warp/weft construction.
 p.noFill();p.stroke(240,217,171,38);p.strokeWeight(.8);p.beginShape();for(let x=0;x<=w;x+=6)p.vertex(x,weaveY(x,row)+1);p.endShape();p.noStroke();
}
// Twill threads: alternating short diagonals, rather than a flat overlaid grid.
p.strokeWeight(.65);
for(let y=0;y<h;y+=5){p.stroke(18,17,15,38);p.line(0,y,w,y);}
for(let x=0;x<w;x+=6){p.stroke(251,228,184,25);p.line(x,0,x,h);}
for(let y=0;y<h;y+=12)for(let x=0;x<w;x+=12){p.stroke(253,235,200,24);const shift=(Math.floor(y/12)%2)*6;p.line(x+shift,y,x+shift+5,y-4);}
hint('C / clique: paleta do estofado');
