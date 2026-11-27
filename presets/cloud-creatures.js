// @putsputs-direct-webgl
// @putsputs-blendable
// Three wind layers driven independently by bass, mids and treble.
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
 vec2 i=floor(p),f=fract(p);
 vec2 a=f*f*f*(f*(6.*f-15.)+10.);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),a.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),a.x),a.y);
}
float cloudNoise(vec2 p){
 float n=0.,amplitude=.54;
 for(int j=0;j<4;j++){n+=noise(p)*amplitude;p=mat2(1.64,1.16,-1.16,1.64)*p;amplitude*=.49;}
 return n;
}
uniform vec3 iDrift;
void mainImage(out vec4 color,in vec2 pixel){
 vec2 uv=pixel/iResolution.xy;
 vec3 sky=mix(vec3(.72,.78,.86),vec3(.12,.35,.62),smoothstep(.0,1.,uv.y));
 float sun=exp(-length(uv-vec2(.74,.72))*3.6);
 sky+=vec3(.19,.12,.05)*sun;
 for(int layer=0;layer<3;layer++){
  float k=float(layer),scale=2.7+k*1.5;
  vec2 p=vec2(uv.x*iResolution.x/iResolution.y,uv.y*(1.05+k*.34))*scale;
  p+=vec2(-iDrift[layer],k*43.+iTime*(.039+k*.012));
  float density=cloudNoise(p);
  float high=iBands[layer];
  float height=sin(iTime*(.09+k*.05)+uv.x*3.2+k)*(.045+high*.09);
  float envelope=exp(-pow((uv.y-.38-k*.14-height)/( .26+high*.09),2.));
  float opacity=smoothstep(.41,.70,density)*envelope*(.58+k*.14);
  vec3 cloud=mix(vec3(.39,.48,.61),vec3(1.,.93,.82),smoothstep(.45,.73,density+uv.y*.11));
  sky=mix(sky,cloud,opacity);
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
  const drift=gl.getUniformLocation(program,'iDrift');
  s.surface = {canvas, gl, program, resolution, time, bands, drift, offsets:[0,0,0], wind:[0,0,0]};
  s.dispose = () => {
    canvas.remove();
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
const {canvas, gl, program, resolution, time, bands, drift, offsets, wind} = s.surface;
const scale = Math.min(a.drawFinishedShader ? 1.35 : .65, a.renderScale ?? .65);
const width = Math.max(1, Math.round(p.width * scale));
const height = Math.max(1, Math.round(p.height * scale));
if (canvas.width !== width) canvas.width = width;
if (canvas.height !== height) canvas.height = height;
gl.viewport(0, 0, width, height);
gl.useProgram(program);
gl.uniform3f(resolution, width, height, 1);
gl.uniform1f(time, a.time || 0);
const dt=Math.min(.06,a.dt??1/60);
const energy=[a.bass||0,a.mid||0,a.treble||0];
for(let i=0;i<3;i++){
 wind[i]+=(energy[i]-wind[i])*(1-Math.exp(-dt/.7));
 offsets[i]+=dt*(.075+i*.041+wind[i]*.58);
}
gl.uniform3fv(bands,wind);
gl.uniform3fv(drift,offsets);
if (a.drawFinishedShader) a.drawFinishedShader(s.surface, width, height);
else gl.drawArrays(gl.TRIANGLES, 0, 3);
if (a.directWebGL && a.presentWebGL) a.presentWebGL(canvas);
else p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
