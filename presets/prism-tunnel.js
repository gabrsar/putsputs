// @putsputs-direct-webgl
// @putsputs-blendable
// Prism corridor: immutable material/shape snapshots recede from the viewer.
const SAMPLE=.25,COUNT=96;
const dt=Math.max(.001,Math.min(.1,a.dt||1/60));
const audio=window.avsShaderAudio(a,s);
const hsv=(h,sat,value)=>{
 const hue=(h%360+360)%360/60,c=value*sat,x=c*(1-Math.abs(hue%2-1)),m=value-c;
 const rgb=hue<1?[c,x,0]:hue<2?[x,c,0]:hue<3?[0,c,x]:hue<4?[0,x,c]:hue<5?[x,0,c]:[c,0,x];
 return rgb.map(v=>v+m);
};
const hash=n=>{const value=Math.sin(n*127.13+71.7)*43758.5453;return value-Math.floor(value);};
function snapshot(born,serial,quiet=false){
 const low=quiet?0:audio.body[0],mid=quiet?0:audio.body[1],high=quiet?0:audio.body[2];
 const center=quiet?.45:audio.center,hue=189+center*83+(quiet?0:(a.music?.trend||0)*8);
 const colors=Array.from({length:8},(_,i)=>{
  const note=quiet?0:audio.spectrum[Math.floor(i*12/8)],hit=quiet?0:audio.attack[Math.floor(i*3/8)];
  return Object.freeze([...hsv(hue+i*14+(hash(serial*.31+i)-.5)*9,.62+.15*note,.48+.30*note),Math.max(note,hit*.65)]);
 });
 return Object.freeze({born,serial,colors:Object.freeze(colors),shape:Object.freeze([
  (low-mid)*.13,(high-low)*.09,(center-.5)*.10+(hash(serial*.23)-.5)*.025,hash(serial+17)])});
}
if(!s.prismHistory||a.time<s.prismHistory.lastTime){
 s.prismHistory={clock:0,nextBorn:SAMPLE,serial:0,lastTime:a.time,records:[]};
 for(let i=0;i<COUNT;i++)s.prismHistory.records.push(snapshot(-i*SAMPLE,-i,i>0));
}
const history=s.prismHistory;
history.clock+=dt;history.lastTime=a.time;
while(history.clock+1e-8>=history.nextBorn){
 history.records.unshift(snapshot(history.nextBorn,++history.serial));
 if(history.records.length>COUNT)history.records.pop();
 history.nextBorn+=SAMPLE;
}
const fragment=`#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iPhase;
uniform sampler2D materials,shapes;
out vec4 outputColor;
const float PI=3.14159265;
vec4 shape(float row){return texelFetch(shapes,ivec2(0,int(clamp(row,0.,95.))),0);}
vec4 material(float row,int lane){return texelFetch(materials,ivec2(lane,int(clamp(row,0.,95.))),0);}
float depthAt(vec2 p){float oct=max(abs(p.x),abs(p.y))*.65+(abs(p.x)+abs(p.y))*.25;return 2.6/max(.0001,oct);}
float ageAt(float z){return max(0.,log(max(1.,z/2.6))/.32);}
float rowAt(float age){return clamp((age-iPhase)/.25,0.,95.);}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 // Same two frozen cross sections remain neighbors for their whole lifetime.
 float z=depthAt(p),age=ageAt(z),row=rowAt(age);
 vec4 section=mix(shape(floor(row)),shape(ceil(row)),fract(row));
 vec2 q=p-section.xy*2.6/z;
 z=depthAt(q);age=ageAt(z);row=rowAt(age);
 section=mix(shape(floor(row)),shape(ceil(row)),fract(row));
 q=p-section.xy*2.6/z;
 float angle=atan(q.y,q.x)-section.z,angular=(angle+PI)*8./(2.*PI);
 int lane=int(mod(floor(angular),8.));
 vec4 paint=material(floor(row),lane);
 float u=fract(angular),v=fract(row),seed=shape(floor(row)).w;
 float fine=1.-smoothstep(.30,.9,fwidth(row));
 float edge=min(u,1.-u),joint=min(v,1.-v);
 float rail=exp(-edge*96.),rib=exp(-joint*64.)*fine;
 // Fixed faceted enamel, polished chamfer and etched conductors. These patterns
 // depend on the segment's own coordinates/seed, never its current list index.
 float facet=.16+.16*cos((u-.5)*PI),bevel=exp(-edge*32.)*.15+rib*.28;
 float trace=pow(.5+.5*cos(u*75.+seed*6.28),28.)*.055*fine;
 float notches=pow(.5+.5*cos(v*31.4+seed*9.),20.)*rail*fine;
 float inlay=exp(-abs(u-(.25+seed*.45))*120.)*fine;
 vec3 enamel=paint.rgb*(facet+bevel+trace);
 vec3 metal=mix(vec3(.17,.27,.35),paint.rgb,.58);
 vec3 c=enamel+metal*(rail*.18+notches*.10)+paint.rgb*inlay*(.025+paint.a*.18);
 // Established colors only lose light with distance; present-day music is not
 // supplied to this pass. The last recorded cross section is subpixel-sized.
 float fade=exp(-age*.105)*(1.-smoothstep(23.1,23.75,age));
 c*=fade*smoothstep(.0,.18,age+.07);
 c=mix(vec3(.001,.002,.005),c,clamp(fade*2.,0.,1.));
 c*=1.-.18*smoothstep(.9,2.4,length(p));
 color=vec4(1.-exp(-c*1.5),1.);
}
void main(){mainImage(outputColor,gl_FragCoord.xy);}`;
if(!s.surface){
 const canvas=document.createElement('canvas'),gl=canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false});
 if(!gl)throw new Error('WebGL 2 indisponível.');
 const program=gl.createProgram();
 const compile=(type,source)=>{
  const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
  if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){const error=gl.getShaderInfoLog(shader);gl.deleteShader(shader);throw new Error(error);}
  gl.attachShader(program,shader);gl.deleteShader(shader);
 };
 try{
  compile(gl.VERTEX_SHADER,`#version 300 es
void main(){vec2 v=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(v*2.-1.,0.,1.);}`);
  compile(gl.FRAGMENT_SHADER,fragment);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
 }catch(error){gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();throw error;}
 const makeTexture=(unit,width)=>{
  const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA32F,width,COUNT,0,gl.RGBA,gl.FLOAT,null);return texture;
 };
 const materialTexture=makeTexture(1,8),shapeTexture=makeTexture(2,1);
 s.surface={canvas,gl,program,materialTexture,shapeTexture,
  resolution:gl.getUniformLocation(program,'iResolution'),phase:gl.getUniformLocation(program,'iPhase'),
  materials:gl.getUniformLocation(program,'materials'),shapes:gl.getUniformLocation(program,'shapes'),
  materialData:new Float32Array(COUNT*8*4),shapeData:new Float32Array(COUNT*4)};
 s.dispose=()=>{canvas.remove();gl.deleteTexture(materialTexture);gl.deleteTexture(shapeTexture);gl.deleteProgram(program);gl.getExtension('WEBGL_lose_context')?.loseContext();};
}
const surface=s.surface,{canvas,gl,program}=surface;
const scale=Math.min(a.drawFinishedShader?1.15:.70,a.renderScale??.85);
const width=Math.max(1,Math.round(p.width*scale)),height=Math.max(1,Math.round(p.height*scale));
if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;
for(let i=0;i<COUNT;i++){
 const record=history.records[i];surface.shapeData.set(record.shape,i*4);
 for(let lane=0;lane<8;lane++)surface.materialData.set(record.colors[lane],(i*8+lane)*4);
}
gl.viewport(0,0,width,height);gl.useProgram(program);
gl.uniform3f(surface.resolution,width,height,1);
gl.uniform1f(surface.phase,Math.max(0,history.clock-history.records[0].born));
gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,surface.materialTexture);
gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,8,COUNT,gl.RGBA,gl.FLOAT,surface.materialData);gl.uniform1i(surface.materials,1);
gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,surface.shapeTexture);
gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,1,COUNT,gl.RGBA,gl.FLOAT,surface.shapeData);gl.uniform1i(surface.shapes,2);
gl.activeTexture(gl.TEXTURE0);
if(a.drawFinishedShader)a.drawFinishedShader(surface,width,height);else gl.drawArrays(gl.TRIANGLES,0,3);
if(a.directWebGL&&a.presentWebGL)a.presentWebGL(canvas);else p.drawingContext.drawImage(canvas,0,0,p.width,p.height);
