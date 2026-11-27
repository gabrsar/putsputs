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
float hash(vec2 id){return fract(sin(dot(id,vec2(39.34,73.12)))*43758.5453);}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(0.,max(q.x,max(q.y,q.z)));}
float field(vec3 p){
 vec2 id=floor(p.xz/2.4);
 vec2 q=mod(p.xz,2.4)-1.2;
 float height=.43+hash(id)*1.55;
 float tower=box(vec3(q.x,p.y-height*.5,q.y),vec3(.64,height*.5,.64));
 float side=box(vec3(q.x,p.y+.08,q.y),vec3(.91,.14,.86));
 return min(p.y+.12,min(tower,side));
}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 uv=(2.*pixel-iResolution.xy)/iResolution.y;
 vec3 eye=vec3(0.,1.42,iTime*.68),ray=normalize(vec3(uv.x,uv.y-.13,1.46));
 vec3 sky=mix(vec3(.23,.095,.139),vec3(.021,.023,.073),smoothstep(-.35,.55,ray.y));
 float moon=length(ray.xy-vec2(-.24,.15));
 sky+=vec3(.61,.29,.17)*(1.-smoothstep(.075,.080,moon))*.6;
 float travel=.03;
 for(int i=0;i<83;i++){
  vec3 p=eye+ray*travel;
  float d=field(p);
  if(d<.006){
   vec2 e=vec2(.012,0.);
   vec3 n=normalize(vec3(field(p+e.xyy)-field(p-e.xyy),field(p+e.yxy)-field(p-e.yxy),field(p+e.yyx)-field(p-e.yyx)));
   float sun=max(0.,dot(n,normalize(vec3(-.61,.79,.22))));
   vec3 stone=mix(vec3(.071,.071,.113),vec3(.29,.22,.29),sun);
   float slots=1.-smoothstep(.055,.135,abs(fract(p.y*4.2+.1)-.5));
   float chips=.32+.68*step(.27,hash(floor(vec2((p.x+p.z)*4.,p.y*4.2))));
   stone+=vec3(.96,.29,.09)*slots*chips*(1.-abs(n.y))*(.11+iBands.x*.72);
   sky=mix(sky,stone,exp(-travel*.071));
   break;
  }
  travel+=clamp(d*.72,.018,.48);
  if(travel>21.)break;
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
