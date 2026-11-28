// @putsputs-direct-webgl
// @putsputs-blendable
// Laser de balada. iBands controla a abertura, as projeções e o brilho.
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

float mist(vec2 p){
 float t=iTime*.22;
 float curl=sin(p.y*4.-t+sin(p.x*3.+t*.6));
 return .49+.19*sin(p.x*7.+curl+t)+.16*sin(dot(p,vec2(-11.,9.))-t*1.4)
           +.10*sin(dot(p,vec2(21.,17.))+curl*2.+t*.9);
}
vec3 fan(vec2 p,vec2 source,float angle,float spread,vec3 tint){
 vec2 q=p-source;
 vec2 axis=vec2(cos(angle),sin(angle));
 float along=dot(q,axis), side=dot(q,vec2(-axis.y,axis.x));
 float ray=side/max(.035,along)/spread*5.;
 float index=round(ray);
 float distance=abs(side-index*spread*along/5.);
 float pixel=1.65/iResolution.y;
 float width=.0015+max(0.,along)*.003+iBands.z*.002;
 float core=1.-smoothstep(width*.65,width+pixel,distance);
 float halo=exp(-distance/(.012+max(along,0.)*.021));
 float vignette=smoothstep(0.,.08,along)*(1.-smoothstep(4.9,5.5,abs(ray)));
 float fog=mist(p)*exp(-max(0.,along)*.23);
 float sourceGlow=exp(-length(q)*58.);
 return tint*((core*.92+halo*.32)*vignette*fog+sourceGlow*1.25);
}
float starOutline(vec2 q,float angle,float size){
 // Fold into a single sector and measure the edge between its outer and inner vertices.
 float sector=6.2831853/5.;
 float theta=abs(mod(atan(q.y,q.x)-angle+sector*.5,sector)-sector*.5);
 vec2 point=length(q)*vec2(cos(theta),sin(theta));
 vec2 tip=vec2(size,0.);
 vec2 edge=size*.46*vec2(cos(sector*.5),sin(sector*.5))-tip;
 float d=length(point-tip-edge*clamp(dot(point-tip,edge)/dot(edge,edge),0.,1.));
 return .66*exp(-d*270.)+.27*exp(-d*62.);
}

void mainImage(out vec4 color,in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 float aspect=iResolution.x/iResolution.y,horizon=-.39,era=iJourney.x;
 float floorMask=1.-smoothstep(horizon-.045,horizon+.045,p.y);
 float reflected=floorMask*exp((p.y-horizon)*5.);
 vec3 light=vec3(.006,.008,.023)*(1.+mist(p));
 // Remote projector galleries visible through the stage haze.
 for(int layer=0;layer<3;layer++){
  float k=float(layer),depth=1.+k*.65;
  vec2 q=p*depth+vec2(.12*sin(era+k),.16*k);
  float lattice=pow(.5+.5*cos(q.x*17.+sin(q.y*5.+era)*.7),20.);
  light+=vec3(.035,.06,.12)*lattice*exp(-abs(q.y-.2)*3.)*(.16+spectral(3.+k*3.)*.4)/(1.+k);
 }
 // Remote light shutters sweep the haze as thin staggered stage curtains.
 for(int n=0;n<8;n++){
  vec4 e=iEvents[n];float x=e.w*aspect*.72;
  float slit=exp(-pow((p.x-x-.09*sin(p.y*4.+e.x))/.018,2.));
  float curtain=slit*exp(-pow((p.y-.22)/.43,2.))*mist(p)*life(e);
  light+=(.5+.5*cos(vec3(.1,2.2,4.4)+e.z))*curtain*.085;
 }
 float spread=.18+iBands.x*.29+iAttack.x*.10;
 float aim=.11*iBands.x+.05*sin(era*.47);
 vec2 left=vec2(-aspect*.78,horizon),right=vec2(aspect*.78,horizon);
 float leftAngle=.59+.22*sin(iMotion*.76)+aim;
 float rightAngle=2.56+.22*cos(iMotion*.68)-aim;
 vec3 emerald=vec3(.03,1.,.55),violet=vec3(.42,.28,1.);
 light+=fan(p,left,leftAngle,spread,emerald);
 light+=fan(p,right,rightAngle,spread*1.10,violet);
 light+=fan(p,vec2(0.,.83),-1.57+.27*sin(iMotion*.55),spread*.69,vec3(1.,.12,.32))*.63;
 vec2 mirror=vec2(p.x,2.*horizon-p.y);
 mirror.x+=sin(p.y*67.+iMotion*2.)*.003*(1.+iBands.x);
 light+=.24*reflected*(fan(mirror,left,leftAngle,spread,emerald)+fan(mirror,right,rightAngle,spread*1.10,violet));
 for(int j=0;j<5;j++){
  float k=float(j),note=spectral(2.+k*2.);
  vec2 center=vec2((k-2.)*min(.39,aspect*.32)+.09*sin(iMotion*.45+k),.32+.21*sin(iMotion*.54+k*1.4));
  float spin=iMotion*(.36+.063*k)+k,gate=.12+note*.48+iAttack.y*.4;
  vec3 tint=.55+.45*cos(vec3(.3,2.3,4.1)+k*1.54+era*.31);
  for(int ghost=2;ghost>=0;ghost--){
   float g=float(ghost);
   vec2 offset=vec2(sin(spin-g*.11),cos(spin-g*.11))*.018*g;
   light+=tint*starOutline(p-center-offset,spin-g*.1,(.065+note*.035)*(1.+g*.06))*gate/(1.+g*3.);
  }
 }
 // Dust occupies a nearer plane and only catches narrow shafts of light.
 vec2 grid=p*vec2(71.,47.)+vec2(iMotion*.14,iMotion*.24);
 vec2 id=floor(grid),local=fract(grid)-.5;
 float dust=exp(-dot(local,local)*210.)*step(.986,fract(sin(dot(id,vec2(37.,71.)))*43758.));
 light+=vec3(.3,.4,.55)*dust*min(1.,length(light))*(.1+iBands.z*.6);
 color=vec4(1.-exp(-light*1.18),1.);
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
