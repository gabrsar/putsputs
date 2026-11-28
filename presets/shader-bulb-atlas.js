// @putsputs-direct-webgl
// @putsputs-blendable
// Original áudio-reativo inspirado em https://www.shadertoy.com/view/MdXSWn.
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

float hash(vec2 p){return fract(sin(dot(p,vec2(121.5,73.8)))*43758.5453);}
vec3 palette(float n){return .51+.46*cos(vec3(.45,2.45,4.1)+n);}

void mainImage(out vec4 color,in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 float era=iJourney.x,theta=iMotion*.037;
 vec2 z=turn(theta)*p*(.98+.12*sin(era*.71));
 vec2 c=vec2(-.743,.124)+vec2(.018*cos(iMotion*.07),.025*sin(iMotion*.09))+vec2(iPhrase.y-.5,iPhrase.x-.5)*.008;
 float n=0.,trap=10.,crossTrap=10.,petalTrap=10.,lenSq=dot(z,z),stripe=0.;
 for(int j=0;j<110;j++){
  if(lenSq>64.)break;
  z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;lenSq=dot(z,z);n+=1.;
  trap=min(trap,abs(length(z-vec2(.25,.12))-.58));
  crossTrap=min(crossTrap,min(abs(z.x),abs(z.y)));
  petalTrap=min(petalTrap,abs(length(z)-(.45+.10*cos(atan(z.y,z.x)*5.+era*.2))));
  stripe+=sin(atan(z.y,z.x)*4.+era*.13)*exp(-float(j)*.08);
 }
 float escaped=step(64.,lenSq);
 float smoothN=n+1.-log2(max(1.,log2(max(2.,sqrt(lenSq)))));
 vec3 sky=vec3(.009,.012,.035);
 // Three parallax star sheets and translucent nebular folds under the fractal.
 for(int layer=0;layer<3;layer++){
  float k=float(layer);vec2 grid=(p+vec2(sin(era*.3+k),cos(era*.23+k))*.08)*(31.+k*19.);
  vec2 id=floor(grid),local=fract(grid)-.5;
  float star=exp(-dot(local,local)*(170.+k*60.))*step(.985,hash(id+k*27.));
  sky+=palette(k*1.8+era*.1)*star*(.12+spectral(7.+k)*.3)/(1.+k*.4);
 }
 float nebula=pow(.5+.5*sin(p.x*4.+p.y*3.+sin(p.y*7.+era*.2)),3.)*exp(-abs(p.y)*.94);
 sky+=vec3(.10,.045,.19)*nebula;
 // Musical detail is carried by the iterated veins and petal traps below.
 float contour=exp(-trap*(24.+iBands.z*10.));
 float veins=exp(-crossTrap*80.),petals=exp(-petalTrap*44.);
 vec3 tint=palette(log(max(1.,smoothN))*1.55+iBands.y*.8+era*.14);
 float filaments=smoothstep(.02,.88,1.-exp(-n*.043))*escaped;
 vec3 matter=tint*(contour*.56+filaments*.36);
 matter+=palette(stripe*.25+era*.19)*veins*(.035+spectral(5.)*.16);
 matter+=palette(2.+stripe*.13)*petals*(.025+spectral(9.)*.12+iAttack.y*.15);
 float veil=mix(.34,.88,smoothstep(3.,85.,n));
 vec3 cOut=sky*(1.-veil*.68)+matter*(.72+iBands.x*.3);
 cOut=mix(cOut,sky*.32+matter*.34,(1.-escaped)*.70);
 color=vec4(1.-exp(-cOut*1.4),1.);
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
