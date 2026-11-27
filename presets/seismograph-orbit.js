const width=p.width,height=p.height,size=Math.min(width,height);
const dt=Math.min(.06,a.dt??1/60),bands=Object.values(a.groups||{}).filter(group=>group.enabled);
const channels=12,limit=560,interval=1/90;
s.pen??={phase:new Float32Array(channels),level:new Float32Array(channels),rows:[],elapsed:0,clock:0};
const pen=s.pen;
const fallback=[a.bass||0,a.mid||0,a.treble||0];
for(let i=0;i<channels;i++){
 const band=bands[Math.floor(i/channels*bands.length)];
 const level=band?(a.visualLevel?a.visualLevel(band.db??-120):((band.db??-120)+80)/55):fallback[Math.floor(i/4)];
 const target=.04+.96*Math.min(1,Math.max(0,level));
 pen.level[i]+=(target-pen.level[i])*(1-Math.exp(-dt/.14));
}
pen.elapsed+=dt;pen.clock+=dt;
while(pen.elapsed>=interval){
 pen.elapsed-=interval;
 const angles=new Float32Array(channels);
 for(let i=0;i<channels;i++){
  pen.phase[i]=(pen.phase[i]+Math.PI*2*(1.05+i*.31)*interval)%(Math.PI*2);
  angles[i]=Math.sin(pen.phase[i])*pen.level[i]*.84;
 }
 pen.rows.push({time:pen.clock-pen.elapsed,angles});
 if(pen.rows.length>limit)pen.rows.shift();
}
const yaw=.31+Math.sin(pen.clock*.22)*.24,cos=Math.cos(yaw),sin=Math.sin(yaw);
function project(sample,track){
 const angle=sample.angles[track],age=pen.clock-sample.time;
 const x=.9-age*.32+(1-Math.cos(angle))*.37;
 const y=Math.sin(angle)*.39;
 const z=(track-(channels-1)/2)*.047;
 const across=x*cos-z*sin,depth=x*sin+z*cos;
 const scale=size/(1.67+.36*depth);
 return [width*.5+across*scale,height*.5-(y+depth*.46)*scale];
}
p.background(6,8,17);p.noFill();
p.colorMode(p.HSB,360,100,100,255);
const stride=(a.renderScale??1)<.65?2:1;
for(let i=channels-1;i>=0;i--){
 const hue=184+i*10;
 for(const [weight,alpha] of [[4,22],[1.25,215]]){
  p.stroke(hue,weight>2?85:51,100,alpha);p.strokeWeight(weight);
  p.beginShape();
  for(let j=(pen.rows.length-1)%stride;j<pen.rows.length;j+=stride)p.vertex(...project(pen.rows[j],i));
  p.endShape();
 }
}
p.colorMode(p.RGB,255);
