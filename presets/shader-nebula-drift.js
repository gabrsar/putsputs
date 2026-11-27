// @putsputs-direct-webgl
// @putsputs-blendable
// Original áudio-reativo inspirado em Star Nest de Kali, https://www.shadertoy.com/view/XlfGRj.
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
float noise21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 float theta=atan(p.y,p.x), radius=length(p);
 vec3 light=vec3(.009,.008,.025);
 for(int j=0;j<14;j++){
  float layer=float(j);
  float depth=fract(layer/14.+iTime*.08);
  float angle=theta+depth*2.7+sin(radius*4.-iTime*.3+depth*5.)*.36;
  vec2 q=vec2(cos(angle),sin(angle))*radius*(3.+depth*27.)+vec2(layer*11.13,layer*23.21);
  vec2 id=floor(q), cell=fract(q)-.5;
  float seed=noise21(id), fade=sin(depth*3.14159);
  vec2 offset=vec2(noise21(id+1.),noise21(id+2.))*.52-.26;
  float core=exp(-dot(cell-offset,cell-offset)*(52.+depth*180.));
  float cloud=.5+.5*cos(5.*angle+radius*6.+depth*11.+iTime*.25);
  vec3 tint=.57+.43*cos(vec3(.1,2.5,4.8)+layer*.47+iBands.y*.9);
  light+=fade*tint*(core*step(.85,seed)*(.55+iBands.z)+pow(cloud,5.)*.043*(1.+iBands.x));
 }
 color=vec4(1.-exp(-light),1.);
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
const scale = Math.min(.65, a.renderScale ?? .65);
const width = Math.max(1, Math.round(p.width * scale));
const height = Math.max(1, Math.round(p.height * scale));
if (canvas.width !== width) canvas.width = width;
if (canvas.height !== height) canvas.height = height;
gl.viewport(0, 0, width, height);
gl.useProgram(program);
gl.uniform3f(resolution, width, height, 1);
gl.uniform1f(time, a.time || 0);
gl.uniform3f(bands, a.bass || 0, a.mid || 0, a.treble || 0);
gl.drawArrays(gl.TRIANGLES, 0, 3);
if (a.directWebGL && a.presentWebGL) a.presentWebGL(canvas);
else p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
