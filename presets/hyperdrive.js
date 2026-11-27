const t=a.time||0,w=p.width,h=p.height,span=Math.min(w,h),dt=Math.min(.06,a.dt??1/60);
const sides=24,steps=49,slice=1/10,life=steps*slice;
const bass=a.bass||0,mid=a.mid||0,treble=a.treble||0;
s.tube??={rings:[],clock:0,x:0,y:0};
const tube=s.tube;
const settle=1-Math.exp(-dt/.8);
tube.x+=(Math.sin(t*.27)*.18+(bass-mid)*.25-tube.x)*settle;
tube.y+=(Math.sin(t*.19+1)*.15+(mid-treble)*.20-tube.y)*settle;
function ring(born){
 const spectrum=a.spectrum||[],lastBin=Math.max(0,Math.min(620,spectrum.length-1));
 const color=Array.from({length:sides},(_,i)=>Math.min(1,(spectrum[Math.floor((i/sides)**2*lastBin)]||0)*.8+treble*.16));
 return {born,x:tube.x,y:tube.y,twist:.16*Math.sin(born*.4),hue:203+46*Math.sin(born*.67)+mid*77+treble*49,color};
}
if(!tube.rings.length){
 for(let i=steps;i>=0;i--)tube.rings.push(ring(t-i*slice));
 tube.clock=t+slice;
}
if(t>=tube.clock){tube.rings.push(ring(t));tube.clock=t+slice;}
while(tube.rings.length>steps+1)tube.rings.shift();
const points=tube.rings.map(record=>{
 const age=Math.max(0,(t-record.born)/life);
 const radius=span*(.026+age**2.25*(Math.hypot(w,h)/span*1.23));
 return Array.from({length:sides},(_,i)=>{
  const angle=i/sides*Math.PI*2+record.twist;
  return [w*.5+record.x*span*(.6+age*.8)+Math.cos(angle)*radius,
   h*.5+record.y*span*(.6+age*.8)+Math.sin(angle)*radius];
 });
});
p.background(5,7,17);p.colorMode(p.HSB,360,100,100);p.noStroke();
for(let i=0;i<points.length-1;i++){
 const near=points[i],far=points[i+1],record=tube.rings[i],age=Math.min(1,(t-record.born)/life);
 for(let j=0;j<sides;j++){
  const k=(j+1)%sides,light=record.color[j];
  const texture=.82+.14*Math.sin(j*.42)+.065*Math.cos(record.born*6.2+j*.17);
  p.fill((record.hue+j*1.4)%360,65+light*26,(12+age*41+light*57)*texture);
  p.quad(...near[j],...near[k],...far[k],...far[j]);
 }
}
p.colorMode(p.RGB,255);
