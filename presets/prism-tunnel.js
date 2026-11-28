// Solid octagonal corridor, projected from 3D and shaded from far to near.
const audio=window.avsShaderAudio(a,s);
const t=audio.motion, size=Math.min(p.width,p.height), segments=96, sides=8;
// Nonlinear spacing extends the last ring beyond two thousand world units.
// Its projected opening is smaller than a pixel, rather than a visible cap.
const depth=u=>u+1+Math.pow(Math.max(0,u)/9,2.7)*6;
s.light??=new Float32Array(8);
const response=1-Math.exp(-Math.min(.06,a.dt??1/60)/.55);
for(let i=0;i<8;i++)s.light[i]+=(audio.spectrum[Math.min(11,Math.floor(i*12/8))]-s.light[i])*response;
const turn=.09*Math.sin(t*.12),travel=(t*1.6)%1;
function ring(z){
 const scale=size*1.9/z, bend=t*.19+z*.17;
 const x=p.width*.5+Math.sin(bend)*size*.17/(1.+z*.045);
 const y=p.height*.5+Math.cos(bend*.83)*size*.13/(1.+z*.045);
 return Array.from({length:sides},(_,i)=>{const angle=i*Math.PI*2/sides+turn+z*.05;return [x+Math.cos(angle)*scale,y+Math.sin(angle)*scale];});
}
p.background(5,7,17);p.noStroke();p.colorMode(p.HSB,360,100,100);
let far=ring(depth(segments+1-travel));
for(let j=segments;j>=0;j--){
 const z=depth(j-travel),near=ring(Math.max(.1,z));
 let echo=0;
 for(let e=0;e<8;e++){
  const age=audio.events[e*4],strength=audio.events[e*4+1];
  echo+=strength*Math.exp(-age*.75)*Math.exp(-Math.pow((z-3-age*8)/1.3,2))*7;
 }
 for(let i=0;i<sides;i++){
  const k=(i+1)%sides, energy=s.light[i];
  const light=(9+39*Math.exp(-z*.025)+(j%4===0?9:0)+energy*15+echo)*Math.exp(-z*.003);
  p.fill((205+i*17+j*2+t*9)%360,60,Math.min(100,light));
  p.quad(...far[i],...far[k],...near[k],...near[i]);
 }
 far=near;
}
p.colorMode(p.RGB,255);
