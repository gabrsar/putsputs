// @putsputs-direct-webgl
// @putsputs-blendable
// Shadertoy-style single Image pass, with audio supplied as iBands (bass, mid, treble).
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
 vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);
}
float fbm(vec2 p){
 float sum=0.,weight=.54;
 for(int i=0;i<4;i++){sum+=noise(p)*weight;p=mat2(1.67,1.24,-1.24,1.67)*p;weight*=.49;}
 return sum;
}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 uv=pixel/iResolution.xy;
 vec2 p=vec2((uv.x-.5)*iResolution.x/iResolution.y,uv.y);
 float time=iTime;
 float twist=fbm(vec2(p.x*4.,p.y*4.-time*1.7));
 float curl=fbm(vec2(p.x*5.+twist*2.2,p.y*6.-time*2.5));
 float flame=fbm(vec2((p.x+(twist-.5)*p.y*.44)*9.,p.y*6.-time*2.8));
 float fuel=exp(-pow(abs(p.x)*1.75,1.5))*(.78+iBands.x*.17);
 float heat=clamp((fuel+flame*.69+curl*.24-p.y*1.95-.41)*1.72,0.,1.);
 float ember=exp(-p.y*10.)*exp(-p.x*p.x*9.)*(.23+twist*.38);
 vec3 c=vec3(.018,.008,.015)+vec3(.17,.085,.062)*curl*smoothstep(.30,.76,p.y)*exp(-p.x*p.x*2.);
 c+=vec3(.47,.033,.012)*ember;
 c+=vec3(1.24*heat,1.02*pow(heat,2.05),.69*pow(heat,4.6));
 vec2 spark=vec2(p.x*31.,(p.y-time*.20)*19.);
 vec2 cell=floor(spark);vec2 local=fract(spark)-vec2(hash(cell+.3),hash(cell+2.));
 c+=vec3(.91,.24,.032)*exp(-dot(local,local)*140.)*step(.974,hash(cell))*smoothstep(.09,.3,p.y)*exp(-p.y*2.);
 color=vec4(1.-exp(-c*1.65),1.);
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
