// @putsputs-direct-webgl
// @putsputs-blendable
// Shadertoy-style single Image pass, with audio supplied as iBands (bass, mid, treble).
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
uniform vec3 iAttack;
uniform vec4 iPhrase; // energy, spectral center, stereo pan, trend
uniform float iMotion;
uniform vec4 iEvents[8]; // age, strength, region, spatial seed
uniform vec4 iSpectrum[3];
uniform vec4 iJourney; // accumulated musical evolution, activity, elapsed, energy
float spectral(float n){int i=int(clamp(n,0.,11.));return iSpectrum[i/4][i%4];}
mat2 turn(float a){return mat2(cos(a),sin(a),-sin(a),cos(a));}
float life(vec4 e){return e.y*smoothstep(0.,.07,e.x)*exp(-e.x*.75);}

uniform vec4 iHistory[24];
vec4 trace(float depth){
 float at=clamp(depth-3.,0.,22.99);
 int i=int(at);
 return mix(iHistory[i],iHistory[i+1],fract(at));
}

void mainImage(out vec4 color,in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 float depth=3./max(.0003,length(p));
 vec4 memory=trace(depth);vec2 q=p-memory.xy*.44;
 depth=3./max(.0003,length(q));memory=trace(depth);q=p-memory.xy*.44;
 float a=atan(q.y,q.x)+sin(iJourney.x*.43)*.08;
 float oct=max(abs(q.x),abs(q.y))*.65+(abs(q.x)+abs(q.y))*.25;
 float z=2.7/max(.0003,oct),distance=z+iMotion*.83;
 float seam=pow(.5+.5*cos(a*8.),18.);
 // Resolve an unbounded corridor analytically. Subpixel ribs fade rather
 // than accumulating into a visible disk at a finite far clipping plane.
 float detail=1.-smoothstep(.15,.8,fwidth(distance));
 float ribs=exp(-24.*abs(fract(distance)-.5))*detail;
 float tiles=.5+.5*cos(distance*6.283)*cos(a*8.)*detail;
 vec3 enamel=.5+.45*cos(vec3(.4,2.7,4.5)+a*.46+memory.z*3.+z*.10+iJourney.x*.19);
 float lit=(.12+.39*ribs+.13*tiles)*(1.-seam*.58);
 vec3 c=enamel*lit*.54+enamel*ribs*(.08+memory.w*.44);
 // Fine circuitry lives on the walls; each angular lane listens to its own region.
 float lane=mod(floor((a+3.141593)/6.283186*12.),12.);
 float notes=spectral(lane);
 float circuit=pow(.5+.5*cos(a*48.+sin(distance*2.)*.3),20.);
 float connectors=exp(-60.*abs(fract(distance*3.)-.5))*detail;
 c+=enamel*circuit*(.025+notes*.13)*(1.-seam);
 c+=vec3(.18,.46,.72)*connectors*seam*(.04+notes*.25);
 for(int j=0;j<8;j++){
  vec4 e=iEvents[j];float pulse=exp(-pow((z-3.-e.x*4.5)/.65,2.))*life(e);
  float sector=pow(.5+.5*cos(a-e.w*3.14),18.);
  c+=(.5+.5*cos(vec3(.4,2.4,4.4)+e.z))*pulse*sector*.38*(circuit+ribs*.15);
 }
 float haze=exp(-z*.017);
 vec3 distant=vec3(.001,.002,.005);
 color=vec4(1.-exp(-mix(distant,c,haze)*1.18),1.);
}

out vec4 outputColor;
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
  const history=gl.getUniformLocation(program,'iHistory[0]');
  s.surface = {canvas, gl, program, resolution, time, bands, history, memory:new Float32Array(96), elapsed:0, bend:[0,0]};
  s.dispose = () => {
    canvas.remove();
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
const {canvas, gl, program, resolution, time, bands, history, memory, bend} = s.surface;
const scale = Math.min(a.drawFinishedShader ? 1.35 : .65, a.renderScale ?? .65);
const width = Math.max(1, Math.round(p.width * scale));
const height = Math.max(1, Math.round(p.height * scale));
if (canvas.width !== width) canvas.width = width;
if (canvas.height !== height) canvas.height = height;
gl.viewport(0, 0, width, height);
gl.useProgram(program);
gl.uniform3f(resolution, width, height, 1);
gl.uniform1f(time, a.time || 0);
const audio=window.avsShaderUniforms(a,s,s.surface);
const dt=Math.min(.1,a.dt??1/60),t=audio.motion;
const ease=1-Math.exp(-dt/.56);
bend[0]+=(Math.sin(t*.35)*.3+(audio.body[0]-audio.body[1])*.53-bend[0])*ease;
bend[1]+=(Math.cos(t*.27)*.25+(audio.body[2]-audio.body[0])*.34-bend[1])*ease;
s.surface.elapsed+=dt;
if(s.surface.elapsed>=.13){
 s.surface.elapsed%=.13;
 memory.copyWithin(4,0,92);
}
// Index zero is always the present; older events move away from the viewer.
memory.set([bend[0],bend[1],audio.body[1],Math.max(...audio.attack)],0);
gl.uniform4fv(history,memory);
if (a.drawFinishedShader) a.drawFinishedShader(s.surface, width, height);
else gl.drawArrays(gl.TRIANGLES, 0, 3);
if (a.directWebGL && a.presentWebGL) a.presentWebGL(canvas);
else p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
