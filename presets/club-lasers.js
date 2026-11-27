// Club laser dots and rotating diffraction stars, with no rapid full-screen flashes.
const t=a.time||0, span=Math.min(p.width,p.height), bass=a.bass||0, high=a.treble||0;
p.background(4,3,13,55);p.blendMode(p.ADD);
for(let head=0;head<3;head++){
 const x=p.width*(.24+head*.26),y=p.height*(.46+Math.sin(t*.42+head)*.14);
 const color=[[70,255,136],[90,130,255],[250,74,200]][head];
 for(let j=0;j<18;j++){
  const angle=t*(head%2?-.68:.72)+j*Math.PI/9;
  const radius=span*(.10+.21*(.5+.5*Math.sin(j*3.2+head)))*(1+bass*.5);
  const px=x+Math.cos(angle)*radius,py=y+Math.sin(angle)*radius*.65;
  p.stroke(...color,15+high*35);p.strokeWeight(1);p.line(x,y,px,py);
  p.noStroke();p.fill(...color,25);p.circle(px,py,12+high*10);
  p.stroke(...color,185);p.strokeWeight(1.3);
  const r=2+high*5;
  for(let k=0;k<3;k++){const spin=angle+t*.7+k*Math.PI/3,dx=Math.cos(spin)*r,dy=Math.sin(spin)*r;p.line(px-dx,py-dy,px+dx,py+dy);}
 }
}
p.blendMode(p.BLEND);
