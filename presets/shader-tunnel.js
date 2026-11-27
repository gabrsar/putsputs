// @putsputs-direct-webgl
// @putsputs-blendable
// Shadertoy-style single Image pass, with audio supplied as iBands (bass, mid, treble).
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
uniform vec4 iHistory[24];
vec4 trace(float depth){
 float at=clamp(depth,0.,22.99);
 int i=int(at);
 return mix(iHistory[i],iHistory[i+1],fract(at));
}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 float depth=3./max(.11,length(p));
 vec4 memory=trace(depth);
 vec2 q=p-memory.xy*.44;
 depth=3./max(.11,length(q));
 memory=trace(depth);
 q=p-memory.xy*.44;
 float a=atan(q.y,q.x);
 float oct=max(abs(q.x),abs(q.y))*.65+(abs(q.x)+abs(q.y))*.25;
 float z=2.7/max(.06,oct),distance=z+iTime*.83;
 float seam=pow(.5+.5*cos(a*8.),18.);
 float ribs=exp(-24.*abs(fract(distance)-.5));
 float tiles=.5+.5*cos(distance*6.283)*cos(a*8.);
 vec3 enamel=.55+.45*cos(vec3(.4,2.7,4.5)+a*.46+memory.z*3.+z*.10);
 float lit=(.16+.45*ribs+.16*tiles)*(1.-seam*.58);
 vec3 c=enamel*lit*.54+enamel*ribs*(.10+memory.w*.50);
 float haze=exp(-z*.074)*smoothstep(.025,.20,oct);
 color=vec4(mix(vec3(.014,.022,.046),c,haze),1.);
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
gl.uniform3f(bands, a.bass || 0, a.mid || 0, a.treble || 0);
const dt=Math.min(.06,a.dt??1/60),t=a.time||0;
const ease=1-Math.exp(-dt/.56);
bend[0]+=(Math.sin(t*.35)*.3+((a.bass||0)-(a.mid||0))*.53-bend[0])*ease;
bend[1]+=(Math.cos(t*.27)*.25+((a.treble||0)-(a.bass||0))*.34-bend[1])*ease;
s.surface.elapsed+=dt;
if(s.surface.elapsed>=.13){
 s.surface.elapsed%=.13;
 memory.copyWithin(0,4);
 memory.set([bend[0],bend[1],a.mid||0,Math.max(a.bass||0,a.treble||0)],92);
}
gl.uniform4fv(history,memory);
if (a.drawFinishedShader) a.drawFinishedShader(s.surface, width, height);
else gl.drawArrays(gl.TRIANGLES, 0, 3);
if (a.directWebGL && a.presentWebGL) a.presentWebGL(canvas);
else p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
