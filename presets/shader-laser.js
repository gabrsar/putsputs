// @putsputs-direct-webgl
// @putsputs-blendable
// Shadertoy-style single Image pass, with audio supplied as iBands (bass, mid, treble).
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
vec3 spectrum(float phase){return .54+.46*cos(vec3(0.,2.12,4.28)+phase);}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 vec3 c=vec3(.008,.01,.023);
 float aa=2./iResolution.y;
 for(int head=0;head<3;head++){
  float k=float(head);
  vec2 center=vec2((k-1.)*.65,.13*sin(iTime*.47+k*2.));
  vec2 q=p-center;
  float r=length(q),a=atan(q.y,q.x)-iTime*(.20+k*.13);
  for(int order=0;order<3;order++){
   float j=float(order);
   float warped=a+.09*sin(r*7.-iTime*.82+j*2.+k);
   float spokes=abs(sin(warped*(11.+j*5.)+j*1.4));
   float rings=abs(sin(r*(34.+j*9.)+sin(warped*5.)*.8-iTime*(.7+j*.2)));
   float dotDistance=length(vec2(spokes*r/(11.+j*5.),rings/(34.+j*9.)));
   float core=1.-smoothstep(.0014,.0034+aa,dotDistance);
   float glow=exp(-dotDistance*115.);
   float gate=smoothstep(.035,.14,r)*exp(-r*(.64+j*.48));
   c+=spectrum(k*2.1+j*.94+iTime*.18)*(core*.78+glow*.11)*gate*(.68+iBands.z*.52);
  }
  float ray=exp(-abs(sin(a*7.+k))*15.)*exp(-r*3.1);
  c+=spectrum(k*2.1)*ray*(.075+iBands.x*.13);
 }
 color=vec4(1.-exp(-c*1.23),1.);
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
  const timer = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  s.surface = {canvas, gl, program, resolution, time, bands, timer, queries: [], gpuSamples: []};
  s.dispose = () => {
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
const {canvas, gl, program, resolution, time, bands, timer, queries, gpuSamples} = s.surface;
if (timer && gl.getParameter(timer.GPU_DISJOINT_EXT)) {
  for (const query of queries) gl.deleteQuery(query);
  queries.length = gpuSamples.length = 0;
  s.gpuFrameMs = undefined;
}
while (queries.length && gl.getQueryParameter(queries[0], gl.QUERY_RESULT_AVAILABLE)) {
  const query = queries.shift();
  gpuSamples.push(gl.getQueryParameter(query, gl.QUERY_RESULT) / 1e6);
  gl.deleteQuery(query);
  if (gpuSamples.length > 120) gpuSamples.shift();
  s.gpuFrameMs = gpuSamples.reduce((sum, ms) => sum + ms, 0) / gpuSamples.length;
}
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
const query = timer && queries.length < 8 ? gl.createQuery() : null;
if (query) gl.beginQuery(timer.TIME_ELAPSED_EXT, query);
if (a.drawFinishedShader) a.drawFinishedShader(s.surface, width, height);
else gl.drawArrays(gl.TRIANGLES, 0, 3);
if (query) {
  gl.endQuery(timer.TIME_ELAPSED_EXT);
  queries.push(query);
}
if (a.directWebGL && a.presentWebGL) a.presentWebGL(canvas);
else p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
