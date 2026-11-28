// @putsputs-direct-webgl
// @putsputs-blendable
// Volumetric combustion: broad coal bed, ten advected depth slices, smoke absorption.
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


// A broad combustion bed is viewed through ten independently advected slices.
// Music changes fuel distribution and buoyant releases, never the camera.
void mainImage(out vec4 color,in vec2 pixel){
 vec2 uv=pixel/iResolution.xy;
 float aspect=iResolution.x/iResolution.y;
 vec2 p=vec2((uv.x-.5)*aspect,uv.y);
 float time=iMotion*.31,era=iJourney.x;
 float note=spectral(min(11.,floor(uv.x*12.)));
 // Individual onsets leave rising, narrow thermal currents among the tongues.
 float release=0.;
 for(int j=0;j<8;j++){
  vec4 e=iEvents[j];
  float x=e.w*.68+.055*sin(p.y*6.-e.x*1.7+e.w*4.);
  float y=.08+e.x*.115;
  release+=exp(-pow((p.x-x)/.075,2.)-pow((p.y-y)/.19,2.))*life(e)*.12;
 }
 vec3 light=vec3(.006,.005,.009),transmission=vec3(1.);
 float totalFlame=0.;
 for(int layer=0;layer<10;layer++){
  float z=-.78+float(layer)*.1733;
  vec2 q=vec2(p.x*(.91+z*.12)+z*.09,p.y+z*.024);
  float up=time*(.77+z*.065);
  float large=fbm(vec2(q.x*3.7+z*.8,q.y*3.1-up));
  float curl=noise(vec2(q.x*12.+large*2.2+z*.7,q.y*9.2-up*1.38));
  float filament=noise(vec2(q.x*22.+curl*1.5,q.y*15.-up*1.8+z*4.));
  // No central Gaussian fuel column: a wide coal bed feeds many unequal tongues.
  float bed=.70+.075*sin(q.x*8.+z*4.2+era*.17)+.06*sin(q.x*19.-z*6.);
  float sides=exp(-pow(abs(q.x)/max(.65,aspect*.67),6.));
  float fuel=bed*sides+.09*iBands.x+.045*note+release;
  float structure=fuel-q.y*(1.30-.07*iBands.y)+(large-.50)*.83+(curl-.5)*.40;
  float flame=smoothstep(.035,.34,structure)*smoothstep(-.025,.035,q.y);
  flame*=.32+.68*smoothstep(.23,.78,curl*.68+filament*.32);
  float heat=clamp(structure*.92+.08*filament,0.,1.);
  heat*=.55+.60*smoothstep(.28,.8,curl);
  float fineRim=pow(max(0.,1.-abs(structure-.11)*5.),3.);
  vec3 fireColor=vec3(1.55,.10+.96*pow(heat,1.55),.012+.33*pow(heat,3.8));
  fireColor*=.27+heat*.9;
  fireColor+=vec3(.31,.055,.007)*fineRim*filament;
  // Cool opaque folds cross in front of brighter layers, providing actual depth.
  float smoke=smoothstep(.45,.73,large)*smoothstep(.24,.68,q.y)*(1.-flame*.82);
  float opacity=1.-exp(-(flame*.20+smoke*.067));
  vec3 material=mix(vec3(.030,.024,.030),fireColor,flame);
  light+=transmission*material*opacity;
  transmission*=exp(-vec3(.21,.27,.31)*(flame*.54+smoke*.75));
  totalFlame+=flame*.1;
 }
 // Discontinuous glowing coals spread along the base instead of a white central blob.
 float coal=noise(vec2(p.x*37.,1.3+sin(era*.3)*.1));
 float coalBed=exp(-p.y*47.)*smoothstep(.40,.78,coal);
 light+=vec3(.47,.075,.011)*coalBed*(.45+iBands.x*.35);
 // Back ash and foreground sparks follow different velocities and focus planes.
 for(int layer=0;layer<3;layer++){
  float k=float(layer),scale=31.+k*15.;
  vec2 grid=vec2((p.x+sin(p.y*5.+era*.4+k)*.032)*scale,(p.y-time*(.13+k*.065))*scale*.66);
  vec2 id=floor(grid),v=fract(grid)-vec2(hash(id+k),hash(id+2.+k));
  float spark=exp(-dot(v*vec2(1.,.52),v*vec2(1.,.52))*(200.-k*34.));
  float notes=spectral(7.+k*2.);
  float sparse=step(.994-notes*.014-iAttack.z*.008,hash(id+7.));
  light+=vec3(.82,.28+k*.035,.045)*spark*sparse*exp(-p.y*1.7)*(.11+k*.12)*(1.-totalFlame*.65);
 }
 float veil=1.-.17*smoothstep(.65,1.15,length(vec2((uv.x-.5)*1.2,uv.y-.45)));
 color=vec4(1.-exp(-light*veil*1.35),1.);
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
const scale = Math.min(a.drawFinishedShader ? .75 : .55, a.renderScale ?? .65);
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
