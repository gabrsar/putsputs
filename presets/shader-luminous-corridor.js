// @putsputs-direct-webgl
// @putsputs-blendable
// Based on the shader supplied by the user: Jan Mróz (jaszunio15).
// Original and adaptation: CC BY 3.0, https://creativecommons.org/licenses/by/3.0/
// Changes: periodic-column optimization, twelve audio regions, stable camera, spatial echoes.
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution,iBands,iAttack;
uniform float iTime,iMotion,iTravel;
uniform vec4 iPhrase,iJourney,iEvents[8],iSpectrum[3];
out vec4 outputColor;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float band(int n){return iSpectrum[n/4][n%4];}
vec2 path(float z){return -vec2(sin(z*.035)*2.8,cos(z*.029)*2.2);}
float boxSDF(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
// Adapted from the supplied Jan Mróz repeated-box corridor. Column-stable
// lengths let the axial repetition be evaluated analytically: nine neighbors
// instead of twenty-seven SDF calls per march step.
vec4 objectSDF(vec3 world){
 vec3 p=world-vec3(path(world.z),0.);float spacing=.64;
 vec2 cell=floor(p.xy/spacing);float closest=1e4;vec3 tint=vec3(0.);
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
  vec2 id=cell+vec2(float(x),float(y));
  float h=hash(id),h2=hash(id+57.7);
  vec2 center=(id+.5+(vec2(h,h2)-.5)*.65)*spacing;
  float lengthZ=4.+h2*5.;
  vec3 q=vec3(p.xy-center,mod(p.z+h*lengthZ+lengthZ*.5,lengthZ)-lengthZ*.5);
  float d=boxSDF(q,vec3(.027+h*.026,.027+h*.026,lengthZ*(.31+.16*h)));
  if(d<closest){
   closest=d;
   int region=int(mod(floor((atan(center.y,center.x)+3.141593)*1.90986),12.));
   float note=band(region);
   tint=mix(vec3(.035,.32,1.),vec3(1.,.09,.34),step(.52,h));
   tint=mix(tint,vec3(.10,.85,.75),.15*iPhrase.y);
   tint*=.17+note*.75;
  }
 }
 float r=length(p.xy);
 return vec4(tint,max(closest,max(r-5.6,1.65-r)));
}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 uv=(2.*pixel-iResolution.xy)/iResolution.y;
 float z=-iTravel*.9;
 vec3 ro=vec3(path(z),z),ahead=vec3(path(z-2.),z-2.);
 vec3 forward=normalize(ahead-ro),right=normalize(cross(forward,vec3(0.,1.,0.))),up=cross(right,forward);
 vec3 rd=normalize(forward*1.65+right*uv.x+up*uv.y);
 float distance=0.,transmission=1.;vec3 light=vec3(.002,.004,.012);
 for(int i=0;i<64;i++){
  vec3 world=ro+rd*distance;
  vec4 sampleField=objectSDF(world);
  vec4 event=iEvents[i%8];
  vec2 column=world.xy-path(world.z);
  float lane=pow(.5+.5*cos(atan(column.y,column.x)-event.w*3.14),16.);
  float packet=event.y*exp(-event.x*.8)*exp(-pow((distance-4.-event.x*10.)/1.4,2.))*lane;
  sampleField.rgb*=1.+packet*2.2;
  float d=abs(sampleField.a),stepSize=clamp(d*.68,.035,1.5);
  float density=exp(-d*17.);
  float core=exp(-d*82.);
  float fog=exp(-distance*.027);
  light+=transmission*sampleField.rgb*(density*.055+core*.16)*fog;
  transmission*=1.-density*.038;
  distance+=stepSize;
  if(distance>86.||transmission<.08)break;
 }
 // The distant light field converges below pixel scale instead of ending in a lid.
 float r=length(uv),a=atan(uv.y,uv.x);
 float line=pow(.5+.5*cos(a*104.+sin(a*13.)*.6),25.);
 float far=exp(-r*7.)*(1.-smoothstep(.001,.018,r))*.12;
 light+=vec3(.08,.20,.55)*(line*.025+far)*transmission;
 // Musical packets are attached to the bars in world space above.
 light*=1.-.18*smoothstep(.8,2.2,r);
 color=vec4(1.-exp(-light*1.6),1.);
}
void main(){mainImage(outputColor,gl_FragCoord.xy);}
`;
if (!s.surface) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('WebGL 2 indisponível.');
  const program = gl.createProgram();
  const compile = (kind, code) => {
    const shader = gl.createShader(kind);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(error);
    }
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  };
  try {
    compile(gl.VERTEX_SHADER, `#version 300 es
void main(){
  vec2 corner=vec2(float((gl_VertexID << 1) & 2),float(gl_VertexID & 2));
  gl_Position=vec4(corner*2.0-1.0,0.0,1.0);
}`);
    compile(gl.FRAGMENT_SHADER, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (error) {
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    throw error;
  }
  const resolution = gl.getUniformLocation(program, 'iResolution');
  const time = gl.getUniformLocation(program, 'iTime');
  const bands = gl.getUniformLocation(program, 'iBands');
  const travel=gl.getUniformLocation(program,'iTravel');
  s.surface = {canvas, gl, program, resolution, time, bands, travel};
  s.dispose = () => {
    canvas.remove();
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
const {canvas, gl, program, resolution, time, bands} = s.surface;
const scale = Math.min(a.drawFinishedShader ? .70 : .65, a.renderScale ?? .65);
const width = Math.max(1, Math.round(p.width * scale));
const height = Math.max(1, Math.round(p.height * scale));
if (canvas.width !== width) canvas.width = width;
if (canvas.height !== height) canvas.height = height;
gl.viewport(0, 0, width, height);
gl.useProgram(program);
gl.uniform3f(resolution, width, height, 1);
gl.uniform1f(time, a.time || 0);
window.avsShaderUniforms(a,s,s.surface);
s.travelClock=(s.travelClock||0)+Math.max(.001,Math.min(.1,a.dt||1/60));
gl.uniform1f(s.surface.travel,s.travelClock);
if (a.drawFinishedShader) a.drawFinishedShader(s.surface, width, height);
else gl.drawArrays(gl.TRIANGLES, 0, 3);
if (a.directWebGL && a.presentWebGL) a.presentWebGL(canvas);
else p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
