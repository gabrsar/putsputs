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
 float time=iMotion,era=iJourney.x;
 float twist=fbm(vec2(p.x*4.,p.y*4.-time*1.7));
 float curl=fbm(vec2(p.x*5.+twist*2.2,p.y*6.-time*2.5));
 float flame=fbm(vec2((p.x+(twist-.5)*p.y*.44)*9.,p.y*6.-time*2.8));
 float fuel=exp(-pow(abs(p.x)*1.75,1.5))*(.52+iBands.x*.5+iAttack.x*.18);
 float heat=clamp((fuel+flame*.69+curl*.24-p.y*(2.1-iBands.y*.3)-.41)*1.72,0.,1.);
 // Backlit smoke folds behind the flame, with slow evolving thermal currents.
 vec2 smokeUV=vec2(p.x*3.+sin(p.y*4.+era)*.3,p.y*4.-time*.37);
 float smoke=fbm(smokeUV+curl*.9);
 vec3 c=vec3(.011,.008,.018)+vec3(.12,.055,.07)*smoke*smoothstep(.15,.75,p.y)*exp(-p.x*p.x*1.4);
 // Attacks release narrow buoyant plumes, advected through the smoke.
 for(int j=0;j<8;j++){
  vec4 e=iEvents[j];float y=.10+e.x*.15;
  float x=e.w*.43+sin(p.y*7.-e.x*2.+era)*.055;
  float plume=exp(-pow((p.x-x)/.038,2.)-pow((p.y-y)/.16,2.))*life(e);
  c+=vec3(.30,.065,.018)*plume*(1.-heat)*smoke*.65;
 }
 float ember=exp(-p.y*10.)*exp(-p.x*p.x*9.)*(.23+twist*.38);
 c+=vec3(.47,.033,.012)*ember;
 c+=vec3(1.24*heat,1.02*pow(heat,2.05),.69*pow(heat,4.6));
 // Three depths of embers: small distant ash, curling sparks, brighter foreground.
 for(int layer=0;layer<3;layer++){
  float k=float(layer),scale=23.+k*13.;
  vec2 grid=vec2((p.x+sin(p.y*5.+era+k)*.045)*scale,(p.y-time*(.10+k*.055))*scale*.63);
  vec2 cell=floor(grid),local=fract(grid)-vec2(hash(cell+k),hash(cell+2.+k));
  float note=spectral(7.+k*2.);
  float spark=exp(-dot(local*vec2(1.,.6),local*vec2(1.,.6))*(180.-k*35.));
  c+=vec3(.8,.22+k*.04,.035)*spark*step(.99-note*.035-iAttack.z*.025,hash(cell+7.))*exp(-p.y*(1.6+k*.35))*(.28+k*.16);
 }
 float lace=pow(.5+.5*sin(p.x*67.+curl*9.-time*3.),12.);
 c+=vec3(.32,.10,.02)*lace*heat*(1.-heat)*iBands.y*.22;
 color=vec4(1.-exp(-c*1.6),1.);
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
const audio=window.avsShaderUniforms(a,s,s.surface);
if (a.drawFinishedShader) a.drawFinishedShader(s.surface, width, height);
else gl.drawArrays(gl.TRIANGLES, 0, 3);
if (a.directWebGL && a.presentWebGL) a.presentWebGL(canvas);
else p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
