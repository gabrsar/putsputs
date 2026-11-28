// VELUDO / lounge vinho: fitas rubi, ameixa e ouro, com bastante respiro.
/* global p, a, s */
const dt=Math.max(0,Math.min(a.dt??1/60,.06)),w=p.width,h=p.height;
const bands=Object.values(a.groups||{}).sort((x,y)=>x.low-y.low);
const value=g=>g.enabled?(a.visualLevel?a.visualLevel(g.db??-120):Math.max(0,Math.min(1,((g.db??-120)+80)/55))):0;
const strengths=bands.map(value);
const region=(lo,hi)=>{const list=strengths.filter((_,i)=>bands[i].low<hi&&bands[i].high>lo);return list.reduce((n,x)=>n+x,0)/Math.max(1,list.length);};
const low=region(25,250),mid=region(250,4000);
const rand=(lo=0,hi=1)=>a.rand?a.rand(lo,hi):lo+Math.random()*(hi-lo);
// Desenha os fios em mais pixels e reduz a imagem com filtragem no palco.
const scale=(a.renderScale??1)<=.6?1:Math.min(2,Math.sqrt(2600000/(w*h)));
const rw=Math.max(1,Math.round(w*scale)),rh=Math.max(1,Math.round(h*scale));
if(!s.ribbon){
 s.ribbon=p.createGraphics(rw,rh);
 s.ribbon.pixelDensity(1);
 s.dispose=()=>s.ribbon.remove();
}
const g=s.ribbon;
if(g.width!==rw||g.height!==rh)g.resizeCanvas(rw,rh);
// Keep the feedback cadence at 60 Hz even when the stage draws more often.
s.paintTime=(s.paintTime??0)+dt;
const paintDt=Math.floor((s.paintTime+1e-7)*60)/60;
if(paintDt>0){
 s.paintTime=Math.max(0,s.paintTime-paintDt);
 const ink=alpha=>255*(1-Math.pow(1-alpha/255,paintDt*60));
 const ease=1-Math.exp(-paintDt/.24);
 s.phase??=rand(0,5);
 s.bass??=low;
 s.mid??=mid;
 s.bass+=(low-s.bass)*ease;
 s.mid+=(mid-s.mid)*ease;
 s.phase+=paintDt*(.035+s.bass*.035);
 s.energy??=Array(11).fill(0);

 g.blendMode(p.BLEND);g.colorMode(p.RGB,255);
 g.background(14,4,12,255*(1-Math.exp(-paintDt/.20)));window.avsDecayHistory?.(g,paintDt);
 g.resetMatrix();g.scale(rw/w,rh/h);g.noFill();
 for(let layer=0;layer<11;layer++){
  const target=strengths[Math.floor(layer/11*strengths.length)]||0;
  const energy=s.energy[layer]+=(target-s.energy[layer])*ease;
  g.stroke(125+layer*7,32+layer*4,65+layer*5,ink(24+energy*36));
  g.strokeWeight(.65+energy*.65);g.beginShape();
  for(let j=0;j<=100;j++){
   const u=j/100,x=u*w,y=h*(.25+layer*.045)+Math.sin(u*5+s.phase+layer*.18)*h*(.05+energy*.04);
   g.vertex(x,y);
  }
  g.endShape();
 }
 g.stroke(195,154,95,ink(18+s.mid*25));g.strokeWeight(.7);g.beginShape();
 for(let j=0;j<=100;j++){const u=j/100;g.vertex(u*w,h*.6+Math.sin(u*5+s.phase*.8)*h*.1);}
 g.endShape();
}

p.blendMode(p.BLEND);p.colorMode(p.RGB,255);p.background(14,4,12);
const ctx=p.drawingContext;
ctx.save();
try{
 ctx.imageSmoothingEnabled=true;
 ctx.imageSmoothingQuality='high';
 ctx.drawImage(g.canvas,0,0,w,h);
}finally{ctx.restore();}
