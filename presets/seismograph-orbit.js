// Continuous sample history projected through an orbiting perspective camera.
const dt=Math.min(.08,a.dt??1/60), t=a.time||0, count=280;
s.trace??=Array.from({length:3},()=>new Float32Array(count));
s.cursor??=0;s.clock=(s.clock||0)+dt;
if(s.clock>=1/40){
 s.clock%=1/40;
 const wave=a.waveform||[], levels=[a.bass||0,a.mid||0,a.treble||0];
 for(let i=0;i<3;i++)s.trace[i][s.cursor]=levels[i]*(.6+(wave[Math.floor(wave.length*(i+.5)/3)]||0)*.4);
 s.cursor=(s.cursor+1)%count;
}
const zoom=Math.min(p.width,p.height), angle=t*.19, tilt=.58+Math.sin(t*.23)*.22;
function project(x,y,z){
 const u=x*Math.cos(angle)-z*Math.sin(angle),v=x*Math.sin(angle)+z*Math.cos(angle);
 const depth=3.7+v*Math.cos(tilt)+y*Math.sin(tilt);
 return [p.width/2+u*zoom/depth,p.height/2+(v*Math.sin(tilt)-y*Math.cos(tilt))*zoom/depth];
}
p.background(6,10,19);p.noFill();
for(let band=0;band<3;band++){
 const z=(band-1)*.77, color=[[72,237,193],[103,162,255],[245,121,210]][band];
 for(const width of [5,1.5]){
  p.stroke(...color,width===5?42:235);p.strokeWeight(width);p.beginShape();
  for(let i=0;i<count;i++)p.vertex(...project((i/(count-1)-.5)*4.8,s.trace[band][(s.cursor+i)%count]*1.6,z));
  p.endShape();
 }
}
