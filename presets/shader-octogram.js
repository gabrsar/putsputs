// @putsputs-direct-webgl
// @putsputs-blendable
// Original áudio-reativo inspirado em https://www.shadertoy.com/view/tlVGDt.
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
void mainImage(out vec4 color, in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 float r=length(p),theta=atan(p.y,p.x);
 vec3 glow=vec3(.013,.008,.028);
 for(int k=0;k<9;k++){
  float n=float(k);
  float z=fract(n/9.+iTime*.11);
  float angle=theta+iTime*.19+n*.52+sin(z*6.28)*.28;
  float star=.78+.22*cos(8.*angle);
  float edge=abs(r-(.04+1.55*z*z)*star);
  float light=.008/(edge+.012)+exp(-edge*85.)*.57;
  vec3 tint=.56+.44*cos(vec3(.4,2.5,4.2)+n*.8+iTime*.23);
  glow+=tint*light*sin(3.14159*z)*(1.+iBands.x*.7)*(.73+.27*cos(angle*16.));
 }
 color=vec4(1.-exp(-glow),1.);
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
  s.surface = {canvas, gl, program, resolution, time, bands};
  s.dispose = () => {
    canvas.remove();
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
const {canvas, gl, program, resolution, time, bands} = s.surface;
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
if (a.drawFinishedShader) a.drawFinishedShader(s.surface, width, height);
else gl.drawArrays(gl.TRIANGLES, 0, 3);
if (a.directWebGL && a.presentWebGL) a.presentWebGL(canvas);
else p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
