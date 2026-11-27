// @putsputs-sharp-canvas
// HANDDRAWING / sismógrafo à mão em uma folha de sulfite.
// Uma única linha: a caneta percorre a folha nos dois sentidos; a tinta fica no lugar e desvanece.
// A portadora representa o pico espectral dominante em câmera lenta (não é pitch detection).
/* global p, a, s */
const w=p.width,h=p.height,dt=Math.max(0,Math.min(a.dt??1/60,.1));
const clamp=(x,lo=0,hi=1)=>Math.max(lo,Math.min(hi,x));
const groups=Object.values(a.groups||{}),enabled=groups.filter(g=>g.enabled);
const level=g=>clamp(a.visualLevel?a.visualLevel(g.db??-120):((g.db??-120)+80)/55);
const keys=a.keyboard||{pressed:()=>false},mouse=a.mouse||{};
const init=()=>({time:0,phase:0,angle:0,hz:60,amplitude:0,dominantHz:0,peakBin:0,accumulator:0,serial:0,points:[],paused:false,travel:.09,direction:1});
if(!s.seismograph||keys.pressed('KeyN')||mouse.clicked)s.seismograph=init();
const pen=s.seismograph;
if(keys.pressed('KeyP'))pen.paused=!pen.paused;

// Search FFT bins, not the widest group's integrated power. Ignore DC and disabled bands.
const spectrum=a.spectrum||[],binHz=a.binHz||0;
let targetHz=pen.hz,targetAmplitude=0,bestScore=0,bestBin=0,bestGroup=null;
if(binHz>0&&spectrum.length){
 const start=Math.max(1,Math.ceil(25/binHz)),end=Math.min(spectrum.length-2,Math.floor(16000/binHz));
 for(let i=start;i<=end;i++){
  const hz=i*binHz,g=enabled.find(g=>hz>=g.low&&hz<g.high);
  if(groups.length&&!g)continue;
  const score=(spectrum[i]*.8+(spectrum[i-1]+spectrum[i+1])*.1)*(g?.gain??1);
  if(score>bestScore){bestScore=score;bestBin=i;bestGroup=g;}
 }
 // A competing peak must be meaningfully stronger before the pen changes carrier.
 if(pen.peakBin>=start&&pen.peakBin<=end){
  const i=pen.peakBin,hz=i*binHz,g=enabled.find(g=>hz>=g.low&&hz<g.high);
  const score=(spectrum[i]*.8+(spectrum[i-1]+spectrum[i+1])*.1)*(g?.gain??1);
  if((!groups.length||g)&&score>=bestScore*.88&&score>0){bestBin=i;bestScore=score;bestGroup=g;}
 }
 if(bestBin&&bestScore>.012){
  // Quadratic interpolation improves the peak estimate within the FFT's resolution.
  const left=spectrum[bestBin-1],center=spectrum[bestBin],right=spectrum[bestBin+1],den=left-2*center+right;
  const offset=Math.abs(den)>1e-9?clamp(.5*(left-right)/den,-.5,.5):0;
  targetHz=(bestBin+offset)*binHz;
  targetAmplitude=bestGroup?level(bestGroup):clamp(bestScore);
 }
}else{
 // Also works in hosts that expose groups without the raw FFT.
 for(const g of enabled){
  const score=g.magnitude??Math.pow(10,(g.db??-120)/20);
  if(score>bestScore){bestScore=score;bestGroup=g;}
 }
 if(bestGroup&&(bestGroup.db??-120)>-85){targetHz=Math.sqrt(Math.max(25,bestGroup.low)*bestGroup.high);targetAmplitude=level(bestGroup);}
}

const RATE=180,STEP=1/RATE,FEED=.024,HISTORY=38,LENGTH=.25;
if(!pen.paused){
 pen.peakBin=bestBin;pen.dominantHz=targetAmplitude>.008?targetHz:0;
 pen.hz=Math.exp(Math.log(pen.hz)+(Math.log(Math.max(25,targetHz))-Math.log(pen.hz))*(1-Math.exp(-dt/.18)));
 pen.amplitude+=(targetAmplitude-pen.amplitude)*(1-Math.exp(-dt/(targetAmplitude>pen.amplitude?.035:.17)));
 // Slowed oscillations prevent 30/60-FPS aliasing of bass frequencies.
 const visibleHz=pen.hz<=240?pen.hz*.0125:Math.min(6,3+Math.log2(pen.hz/240)*.45);
 pen.accumulator+=dt;
 let samples=0;
 while(pen.accumulator>=STEP&&samples++<20){
  pen.accumulator-=STEP;pen.time+=STEP;pen.phase=(pen.phase+Math.PI*2*visibleHz*STEP)%(Math.PI*2);
  const targetAngle=Math.sin(pen.phase)*pen.amplitude*.65;
  pen.angle+=(targetAngle-pen.angle)*(1-Math.exp(-STEP/.009));
  // Imperfections belong to the recorded sample; old ink never jitters.
  const n=pen.serial++,tremor=(Math.sin(n*.731)+Math.sin(n*.173)*.45)*.00036*pen.amplitude;
  pen.travel+=pen.direction*FEED*STEP;
  if(pen.travel>=.79){pen.travel=1.58-pen.travel;pen.direction=-1;}
  if(pen.travel<=.09){pen.travel=.18-pen.travel;pen.direction=1;}
  pen.points.push({time:pen.time,x:pen.travel+LENGTH*(1-Math.cos(pen.angle))+tremor,y:.50+LENGTH*Math.SQRT2*Math.sin(pen.angle)+tremor*.65});
 }
 const cutoff=pen.time-HISTORY;let first=0;while(first<pen.points.length&&pen.points[first].time<cutoff)first++;
 if(first)pen.points.splice(0,first);
}

p.blendMode(p.BLEND);p.colorMode(p.RGB,255);p.rectMode(p.CORNER);
p.background(218,220,220);
const margin=Math.max(8,Math.min(26,w*.025,h*.04));
const pw=Math.max(1,Math.min(w-margin*2,(h-margin*2)*Math.SQRT2)),ph=pw/Math.SQRT2,px=(w-pw)/2,py=(h-ph)/2;
const c=p.drawingContext;
c.save();
try{
 // Plain white unruled A4 paper, with a restrained edge shadow.
 c.shadowColor='rgba(25,30,34,.13)';c.shadowBlur=12;c.shadowOffsetY=3;
 c.fillStyle='#fdfdfb';c.fillRect(px,py,pw,ph);
 c.shadowBlur=0;c.shadowOffsetY=0;
 c.beginPath();c.rect(px+pw*.035,py+ph*.04,pw*.93,ph*.92);c.clip();
 c.lineWidth=1.05+Math.min(.35,pw/3000);c.lineJoin='round';c.lineCap='round';
 // Batch adjoining samples by age: stationary history with a smooth graphite fade.
 for(let first=0;first<pen.points.length;first+=24){
  const end=Math.min(pen.points.length,first+24),age=pen.time-pen.points[first].time;
  const alpha=.88*Math.pow(clamp(1-age/HISTORY),1.5);
  c.strokeStyle='rgba(49,48,46,'+alpha.toFixed(4)+')';c.beginPath();
  for(let i=Math.max(0,first-1);i<end;i++){
   const point=pen.points[i],x=px+point.x*pw,y=py+point.y*ph;
   if(i===Math.max(0,first-1))c.moveTo(x,y);else c.lineTo(x,y);
  }c.stroke();
 }
 const last=pen.points.at(-1);
 if(last){c.fillStyle='rgba(40,39,37,.9)';c.beginPath();c.arc(px+last.x*pw,py+last.y*ph,1.3,0,Math.PI*2);c.fill();}
}finally{c.restore();}
// P pausa a folha e a caneta. N ou clique começa uma folha nova.
