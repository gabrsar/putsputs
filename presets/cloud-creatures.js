// @putsputs-direct-webgl
// @putsputs-blendable
// Three wind layers driven independently by bass, mids and treble.
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
 vec2 uv=pixel/iResolution.xy;float era=iJourney.x;
 float dusk=.5+.5*sin(era*.31-.8);
 vec3 sky=mix(mix(vec3(.62,.73,.84),vec3(.28,.21,.36),dusk*.65),mix(vec3(.10,.31,.58),vec3(.045,.10,.25),dusk*.6),uv.y);
 float sun=exp(-length(uv-vec2(.74+.025*sin(era*.37),.72))*3.6);
 sky+=vec3(.19,.12,.05)*sun;
 // Far cirrus sheets retain fine structure behind the large moving cloud banks.
 float cirrus=pow(cloudNoise(vec2(uv.x*9.-iMotion*.025,uv.y*17.+era*.07)),3.);
 sky+=vec3(.17,.13,.16)*cirrus*smoothstep(.35,.85,uv.y)*(.4+spectral(9.));
 for(int layer=0;layer<4;layer++){
  float k=float(layer),scale=2.7+k*1.5;
  vec2 p=vec2(uv.x*iResolution.x/iResolution.y,uv.y*(1.05+k*.34))*scale;
  float drift=layer<3?iDrift[min(layer,2)]:iDrift[2]*.7;
  p+=vec2(-drift+iPhrase.z*(.12+k*.09),k*43.+iMotion*(.039+k*.012));
  float density=cloudNoise(p),note=spectral(1.+k*3.);
  float height=sin(iMotion*(.09+k*.05)+uv.x*3.2+k)*(.045+note*.09);
  float envelope=exp(-pow((uv.y-.35-k*.115-height)/(.20+note*.08+iPhrase.x*.05),2.));
  float opacity=smoothstep(.41,.70,density)*envelope*(.45+k*.12);
  float rim=smoothstep(.40,.49,density)*(1.-smoothstep(.49,.58,density));
  vec3 cloud=mix(vec3(.30,.40,.55),vec3(1.,.90,.76),smoothstep(.45,.73,density+uv.y*.11));
  cloud=mix(cloud,cloud*vec3(.85,.72,.95),dusk*.35);
  float resonance=0.;
  for(int j=0;j<8;j++){
   vec4 e=iEvents[j];float shaft=exp(-pow((uv.x-.5-e.w*.38)/.065,2.));
   float silver=pow(.5+.5*cos(density*38.+e.w*4.),12.);
   resonance+=shaft*silver*life(e)/(1.+k*.7);
  }
  // Soft internal illumination, partially hidden by each nearer opaque cloud.
  cloud+=vec3(.16,.20,.30)*resonance*(.25+density*.5);
  cloud+=vec3(.12,.09,.055)*rim*(.1+note*.3);
  sky=mix(sky,cloud,clamp(opacity,0.,.92));
 }
 // Shafts live in clear gaps and shift slowly as the musical atmosphere changes.
 float shafts=pow(.5+.5*sin((uv.x-.74)/(max(.12,.96-uv.y))*15.+era*.31),18.);
 sky+=vec3(.10,.075,.04)*shafts*sun*(.08+iBands.y*.14);
 color=vec4(clamp(sky,0.,1.),1.);
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
const audio=window.avsShaderUniforms(a,s,s.surface);
const energy=audio.body;
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
