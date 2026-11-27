// Solid octagonal corridor, projected from 3D and shaded from far to near.
const t=a.time||0, size=Math.min(p.width,p.height), segments=24, sides=8;
const bass=a.bass||0, spectrum=a.spectrum||[];
const turn=t*.28, travel=(t*3)%1;
function ring(z){
 const scale=size*1.9/z, bend=t*.55+z*.17;
 const x=p.width*.5+Math.sin(bend)*size*.17;
 const y=p.height*.5+Math.cos(bend*.83)*size*.13;
 return Array.from({length:sides},(_,i)=>{const angle=i*Math.PI*2/sides+turn+z*.05;return [x+Math.cos(angle)*scale,y+Math.sin(angle)*scale];});
}
p.background(5,7,17);p.noStroke();p.colorMode(p.HSB,360,100,100);
let far=ring(segments+1-travel);
for(let j=segments;j>=0;j--){
 const near=ring(Math.max(.1,j+1-travel));
 for(let i=0;i<sides;i++){
  const k=(i+1)%sides, energy=spectrum[Math.floor((i+1)*spectrum.length/20)]||0;
  const light=Math.max(5,48-j*1.7)+(j%4===0?16:0)+bass*17+energy*28;
  p.fill((205+i*17+j*2+t*9)%360,60,Math.min(100,light));
  p.quad(...far[i],...far[k],...near[k],...near[i]);
 }
 far=near;
}
p.colorMode(p.RGB,255);
