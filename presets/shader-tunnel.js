// @putsputs-direct-webgl
// @putsputs-blendable
// Enamel corridor: a segment's musical material and shape are fixed at birth.
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iAdvance;
uniform vec4 iGeometry[64];
uniform vec4 iMaterial[64];
uniform vec4 iFeatures[64];
out vec4 outputColor;
float coordinate(float depth){return max(0.,(depth-3.)/3.8-iAdvance);}
int segment(float at){return int(clamp(floor(at),0.,63.));}
vec4 geometry(float depth){float at=clamp(coordinate(depth),0.,62.999);int index=int(at);return mix(iGeometry[index],iGeometry[index+1],fract(at));}
float hash(float x){return fract(sin(x*127.13+91.7)*43758.5453);}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 float depth=3./max(.00025,length(p));vec4 path=geometry(depth);
 vec2 q=p-path.xy*.20;
 depth=3./max(.00025,length(q));path=geometry(depth);q=p-path.xy*.20;
 float a=atan(q.y,q.x)-path.z;
 float oct=max(abs(q.x),abs(q.y))*.65+(abs(q.x)+abs(q.y))*.25;
 float z=2.7/max(.00025,oct),at=coordinate(z);
 int index=segment(at);
 vec4 shape=iGeometry[index],surface=iMaterial[index],features=iFeatures[index];
 float local=fract(at),serial=shape.w;
 // The texture is attached to a persistent segment serial, never a frame index.
 float angle=a+3.14159265,side=fract(angle/6.2831853*8.),edge=min(side,1.-side);
 float lod=1.-smoothstep(.14,.85,fwidth(at));
 float rib=exp(-abs(local-.08)*52.)*lod,seam=exp(-edge*110.);
 float tileLine=exp(-min(fract(local*3.),1.-fract(local*3.))*90.)*lod;
 float joint=exp(-min(fract(side*6.),1.-fract(side*6.))*85.);
 float grain=.5+.5*sin(side*135.+sin(local*47.+serial)*1.2);
 float panel=.76+.16*sin(side*3.14159)+.08*grain;
 vec3 enamel=surface.rgb*panel*(.15+.12*(1.-surface.w));
 vec3 titanium=vec3(.045,.065,.085)*(1.+features.z*.3);
 float metalBand=exp(-abs(local-.085)*22.)*lod;
 vec3 wall=mix(enamel,titanium,metalBand*.8);
 wall+=surface.rgb*rib*(.12+features.x*.16);
 wall*=1.-min(.65,seam*.45+tileLine*.35+joint*.20);
 float fastener=exp(-pow((side-.5)/.045,2.))*exp(-pow((local-.14)/.020,2.))*lod;
 wall+=vec3(.50,.26,.085)*fastener*(.16+features.y*.25);
 float lane=floor(angle/6.2831853*8.);
 float note=lane<2.?features.x:lane<5.?features.y:features.z;
 float circuit=exp(-abs(side-.20)*170.)+exp(-abs(side-.80)*170.);
 float bars=pow(.5+.5*cos(local*62.8+serial*.9),14.)*lod;
 float selected=step(.38,hash(serial+lane*7.));
 vec3 inlay=mix(vec3(.08,.30,.52),surface.rgb,features.y*.5);
 wall+=inlay*circuit*(.04+note*.28+features.w*selected*.12)*(.35+bars*.65);
 float bevel=exp(-abs(local-.11)*80.)*lod;
 wall+=vec3(.25,.32,.38)*bevel*pow(.5+.5*cos(a-1.1),8.)*.10;
 float fog=exp(-max(0.,z-3.)*.014);
 color=vec4(1.-exp(-mix(vec3(.0006,.0011,.0025),wall,fog)*1.45),1.);
}
void main(){mainImage(outputColor,gl_FragCoord.xy);}
`;
if(!s.surface){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false});
 if(!gl)throw new Error('WebGL 2 indisponível.');
 const program=gl.createProgram();
 const compile=(kind,code)=>{
  const shader=gl.createShader(kind);gl.shaderSource(shader,code);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const error=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw Error(error);}
  gl.attachShader(program,shader);gl.deleteShader(shader);
 };
 try{
  compile(gl.VERTEX_SHADER,`#version 300 es
void main(){vec2 corner=vec2(float((gl_VertexID << 1) & 2),float(gl_VertexID & 2));gl_Position=vec4(corner*2.-1.,0.,1.);}`);
  compile(gl.FRAGMENT_SHADER,fragment);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 }catch(error){gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();throw error;}
 const uniform=name=>gl.getUniformLocation(program,name);
 s.surface={canvas,gl,program,resolution:uniform('iResolution'),advance:uniform('iAdvance'),geometry:uniform('iGeometry[0]'),material:uniform('iMaterial[0]'),features:uniform('iFeatures[0]')};
 s.dispose=()=>{canvas.remove();gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();};
}
const audio=window.avsShaderAudio(a,s),dt=Math.max(0,Math.min(.1,a.dt??1/60));
const STEP=.22,COUNT=64;
const signal=[...audio.body,Math.max(...audio.attack),audio.center];
if(!s.tunnel)s.tunnel={clock:0,next:STEP,serial:0,records:[],previous:signal.slice(),seed:Number(a.seed)||1337,geometry:new Float32Array(COUNT*4),material:new Float32Array(COUNT*4),features:new Float32Array(COUNT*4)};
const tunnel=s.tunnel;
const fract=x=>x-Math.floor(x);
const snapshot=(born,serial,values)=>{
 const [low,mid,high,attack,center]=values;
 const seed=fract(Math.sin(serial*127.13+tunnel.seed*.731)*43758.5453);
 const hue=center*2.6+low*.45+seed*.85;
 const rgb=[.4,2.5,4.5].map(offset=>.34+.28*Math.cos(offset+hue));
 return Object.freeze({born,serial,
  geometry:Object.freeze([Math.sin(born*.17)*.16+(low-mid)*.13,Math.cos(born*.13)*.12+(high-low)*.10,(mid-low)*.07+Math.sin(born*.11)*.025,serial]),
  material:Object.freeze([...rgb,.25+seed*.6]),features:Object.freeze([low,mid,high,attack])});
};
if(!tunnel.records.length)for(let i=0;i<COUNT;i++)tunnel.records.push(snapshot(-i*STEP,-i,signal));
const previousClock=tunnel.clock;tunnel.clock+=dt;
while(tunnel.clock+1e-8>=tunnel.next){
 const mix=dt?Math.max(0,Math.min(1,(tunnel.next-previousClock)/dt)):1;
 const values=signal.map((value,i)=>tunnel.previous[i]+(value-tunnel.previous[i])*mix);
 tunnel.records.unshift(snapshot(tunnel.next,++tunnel.serial,values));
 tunnel.records.length=COUNT;tunnel.next+=STEP;
}
tunnel.previous=signal.slice();
for(let i=0;i<COUNT;i++){
 const record=tunnel.records[i];tunnel.geometry.set(record.geometry,i*4);tunnel.material.set(record.material,i*4);tunnel.features.set(record.features,i*4);
}
const {canvas,gl,program,resolution,advance,geometry,material,features}=s.surface;
const scale=Math.min(a.drawFinishedShader?1.15:.65,a.renderScale??.65);
const width=Math.max(1,Math.round(p.width*scale)),height=Math.max(1,Math.round(p.height*scale));
if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
gl.viewport(0,0,width,height);gl.useProgram(program);gl.uniform3f(resolution,width,height,1);
gl.uniform1f(advance,(tunnel.clock-(tunnel.next-STEP))/STEP);
gl.uniform4fv(geometry,tunnel.geometry);gl.uniform4fv(material,tunnel.material);gl.uniform4fv(features,tunnel.features);
if(a.drawFinishedShader)a.drawFinishedShader(s.surface,width,height);else gl.drawArrays(gl.TRIANGLES,0,3);
if(a.directWebGL&&a.presentWebGL)a.presentWebGL(canvas);else p.drawingContext.drawImage(canvas,0,0,p.width,p.height);
