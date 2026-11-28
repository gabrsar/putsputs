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

vec3 spectrum(float phase){return .54+.46*cos(vec3(0.,2.12,4.28)+phase);}

void mainImage(out vec4 color,in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 float era=iJourney.x;vec3 c=vec3(.004,.007,.019);
 float aa=1.5/iResolution.y;
 // Distant, translucent interference screen carries memories of past impacts.
 vec2 back=turn(sin(era*.31)*.28)*p;
 float mesh=pow(.5+.5*cos(back.x*23.+sin(back.y*6.+era)),22.)*pow(.5+.5*cos(back.y*19.-era*.3),10.);
 c+=vec3(.06,.12,.24)*mesh*(.15+iJourney.y*.6);
 // Scanning diffraction orders reveal short rows of dots in the rear screen.
 for(int n=0;n<8;n++){
  vec4 e=iEvents[n];vec2 scan=turn(e.w*.8)*(p-vec2(e.w*.45,0.));
  float slit=exp(-pow((scan.y+.55-e.x*.3)/.012,2.))*exp(-scan.x*scan.x*.9);
  float dots=pow(.5+.5*cos(scan.x*87.+e.z),22.);
  c+=spectrum(e.z*2.+era*.2)*slit*dots*life(e)*.16;
 }
 for(int head=0;head<3;head++){
  float k=float(head);
  vec2 center=vec2((k-1.)*(.64+.09*sin(era*.47)),.13*sin(iMotion*.19+k*2.));
  vec2 q=p-center;
  float r=length(q)/(1.+iBands[head]*.16),a=atan(q.y,q.x)-iMotion*(.16+k*.09);
  for(int order=0;order<4;order++){
   float j=float(order),notes=spectral(k*4.+j);
   float warped=a+(.04+iBands.y*.12)*sin(r*7.-iMotion*.82+j*2.+k);
   float spokes=abs(sin(warped*(11.+j*5.)+j*1.4+sin(era*.39)*.6));
   float rings=abs(sin(r*(34.+j*9.)+sin(warped*5.)*.8-iMotion*(.7+j*.2)));
   float d=length(vec2(spokes*r/(11.+j*5.),rings/(34.+j*9.)));
   float core=1.-smoothstep(.0012,.0028+aa,d);
   float glow=exp(-d*115.);
   float wave=pow(.5+.5*cos(warped*3.-iMotion*.7+k),12.)*iAttack[head];
   float gate=smoothstep(.035,.14,r)*exp(-r*(.64+j*.40));
   c+=spectrum(k*2.1+j*.94+era*.31)*(core*.56+glow*.09)*gate*(.35+notes*.75+wave*.6);
  }
  // A dim ghost order turns independently, behind the sharply resolved dots.
  float ghost=exp(-abs(sin((a+r*.4)*7.+era*.23))*35.)*exp(-r*3.1);
  c+=spectrum(k*2.1+1.)*ghost*(.025+iBands.x*.075);
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
const audio=window.avsShaderUniforms(a,s,s.surface);
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
