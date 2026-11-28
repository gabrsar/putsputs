// @putsputs-direct-webgl
// @putsputs-blendable
// Original áudio-reativo inspirado em Star Nest de Kali, https://www.shadertoy.com/view/XlfGRj.
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

float noise21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float field(vec3 p){
 vec3 q=abs(fract(p*.63+.5)-.5)*2.1;
 float structure=0.;
 for(int k=0;k<7;k++){
  float r2=max(.19,dot(q,q));
  float before=length(q);
  q=abs(q)/r2-vec3(.66,.52,.71);
  structure+=abs(length(q)-before);
 }
 return pow(clamp(structure*.18,0.,1.),3.);
}
float starHash(vec2 p){
 return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);
}

void mainImage(out vec4 color,in vec2 pixel){
 vec2 uv=(2.*pixel-iResolution.xy)/iResolution.y;
 float era=iJourney.x;
 vec3 direction=normalize(vec3((uv-vec2(iPhrase.z*.08,0.))*(.87-iBands.x*.07),1.));
 float angle=iMotion*.042;direction.xz=turn(angle)*direction.xz;
 vec3 origin=vec3(.19*sin(angle),.18*cos(angle*.7),iMotion*.15);
 vec3 light=vec3(.005,.008,.024);float transmission=1.;
 for(int i=0;i<16;i++){
  float depth=.42+float(i)*.36;vec3 p=origin+direction*depth;
  float dust=field(p+vec3(.08*sin(era*.47),.07*cos(era*.31),0.));
  float filament=pow(dust,2.6);
  float cloudBand=.5+.5*cos(p.y*3.2+p.x*.74+sin(p.z*.62+era*.11)*1.8);
  float curtain=smoothstep(.12,.82,cloudBand);
  vec3 tint=.52+.48*cos(vec3(.4,2.,4.5)+depth*.77+sin(p.y*1.8)*1.1+iPhrase.y*.6);
  vec2 grid=p.xy*(7.+float(i)*.38)+vec2(float(i)*17.9,float(i)*11.3);
  vec2 id=floor(grid),offset=fract(grid)-(vec2(starHash(id+1.),starHash(id+2.))*.68+.16);
  float star=exp(-dot(offset,offset)*235.)*step(.973,starHash(id));
  float note=spectral(mod(float(i),12.));
  vec4 event=iEvents[i%8];
  float ion=life(event)*pow(.5+.5*cos(p.z*2.3-event.x*2.+event.w*4.),12.);
  light+=transmission*tint*filament*curtain*ion*.13*exp(-depth*.20);
  light+=transmission*(tint*(dust*.064+filament*.22)*curtain+mix(tint,vec3(.83,.9,1.),.75)*star*.60)*(.75+note*.55)*exp(-depth*.23);
  transmission*=1.-dust*curtain*.045;
 }
 // Distant resonances have their own locations, depth and eight-second lifetimes.
 // No screen-space impacts: ionization lives inside the sampled volume.
 // Fine foreground filaments drift across the softer integrated volume.
 float lace=pow(.5+.5*sin(uv.y*38.+sin(uv.x*9.+era)*2.+iMotion*.18),28.);
 light+=vec3(.04,.07,.13)*lace*exp(-abs(uv.y)*2.)*spectral(10.);
 color=vec4(1.-exp(-light*1.2),1.);
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
