// @putsputs-direct-webgl
// @putsputs-blendable
// Original áudio-reativo inspirado em https://www.shadertoy.com/view/4sjSW1.
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
float tile(vec2 id){return fract(sin(dot(id,vec2(39.34,73.12)))*43758.5453);}
float boxDistance(vec3 p,vec3 b){
 vec3 q=abs(p)-b;
 return length(max(q,0.))+min(0.,max(q.x,max(q.y,q.z)));
}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 uv=(2.*pixel-iResolution.xy)/iResolution.y;
 float time=iTime*.6;
 vec3 eye=vec3(0.,1.8,time);
 vec3 ray=normalize(vec3(uv.x,uv.y-.27,1.35));
 vec3 sky=mix(vec3(.16,.07,.09),vec3(.025,.022,.073),clamp(.5+ray.y,0.,1.));
 float t=.03;
 for(int j=0;j<64;j++){
  vec3 p=eye+ray*t;
  vec2 id=floor(p.xz);
  vec2 local=fract(p.xz)-.5;
  float h=.13+tile(id)*1.1;
  float tower=boxDistance(vec3(local.x,p.y-h,local.y),vec3(.32,h,.32));
  float ground=p.y;
  float d=min(ground,tower);
  if(d<.003){
   float line=1.-smoothstep(.023,.069,abs(fract(p.y*9.+tile(id)*4.)-.5));
   vec3 lit=vec3(.18,.19,.27)*(1.-.29*max(abs(local.x),abs(local.y)));
   if(tower<ground)lit+=line*vec3(.96,.26,.08)*(.25+iBands.x*.85);
   sky=mix(lit,sky,1.-exp(-t*.10));
   break;
  }
  t+=max(.012,d*.65);
  if(t>19.)break;
 }
 color=vec4(sky,1.);
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
