// @putsputs-direct-webgl
// @putsputs-blendable
// Original áudio-reativo inspirado em https://www.shadertoy.com/view/tlVGDt.
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


float frameBox(vec3 p,vec3 b){
 // Open frames have no front/back plates to suggest a closed end.
 vec2 q=abs(p.xy)-b.xy;
 float rim=min(length(vec2(q.x,max(q.y,0.))),length(vec2(max(q.x,0.),q.y)));
 return length(vec2(rim,p.z))-b.z;
}
// Repeated transparent architecture: light is integrated along the camera ray.
void mainImage(out vec4 color,in vec2 pixel){
 vec2 uv=(2.*pixel-iResolution.xy)/iResolution.y;
 float chapter=iJourney.x;
 vec3 ro=vec3(.18*sin(chapter*.71),.15*cos(chapter*.53),iMotion*1.15);
 vec3 rd=normalize(vec3(uv,1.65));
 rd.xy=turn(.25*sin(chapter*.63)+iPhrase.z*.07)*rd.xy;
 rd.yz=turn(.12*sin(chapter*.41))*rd.yz;
 float travel=.1,transmission=1.;
 vec3 light=vec3(.004,.007,.022);
 for(int i=0;i<64;i++){
  vec3 world=ro+rd*travel;
  float cell=floor((world.z+2.)/4.);
  vec3 q=vec3(world.xy,mod(world.z+2.,4.)-2.);
  q.xy=turn(world.z*.09+chapter*.23)*q.xy;
  float breath=.27*sin(cell*.83+chapter*.67)+iBands.x*.11;
  float d=8.;
  for(int j=0;j<4;j++){
   vec3 b=q;b.xy=turn(float(j)*.785398+sin(chapter*.39+cell*.4)*.22)*b.xy;
   float size=.83+float(j)*.23+breath;
   float frame=abs(frameBox(b,vec3(size,size,.055+float(j)*.023)))-.014;
   d=min(d,frame);
  }
  float ink=exp(-abs(d)*37.);
  float etch=.5+.5*cos(atan(q.y,q.x)*32.+q.z*9.+chapter);
  float band=spectral(mod(abs(cell),12.));
  vec3 tint=.5+.5*cos(vec3(.3,2.45,4.65)+cell*.59+chapter*.42);
  vec4 event=iEvents[i%8];
  float gilding=life(event)*pow(.5+.5*cos(atan(q.y,q.x)*4.+event.w*3.+event.x*2.),18.);
  float density=ink*(.036+band*.058)*(1.+etch*.3+gilding*.65);
  light+=transmission*tint*density*exp(-travel*.015);
  transmission*=1.-clamp(density*.46,0.,.3);
  travel+=clamp(abs(d)*.72,.035,.85);
  if(travel>48.||transmission<.08)break;
 }
 // Delayed distant impacts stay behind the architecture, never a full-screen flash.
 vec3 farLight=vec3(.001,.002,.006);
 // The expensive near volume continues as an analytic sequence of open
 // frames at logarithmically increasing depths, down to subpixel scale.
 vec2 tail=turn(chapter*.11)*uv;
 float a=atan(tail.y,tail.x),r=length(tail);
 float aperture=r/(.83+.17*cos(a*8.));
 float phase=log(1./max(.00001,aperture))*4.2-iMotion*.13;
 float tailDetail=1.-smoothstep(.25,1.2,fwidth(phase));
 float rings=exp(-24.*abs(fract(phase)-.5))*tailDetail;
 float fade=exp(-r*3.)*smoothstep(0.,2./iResolution.y,r);
 farLight+=(.5+.5*cos(vec3(.4,2.3,4.5)+phase*.12+chapter*.2))*rings*fade*.12;
 // The far aperture contains only the continuing architecture.
 light+=transmission*farLight;
 color=vec4(1.-exp(-light*1.35),1.);
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
const scale = Math.min(a.drawFinishedShader ? .85 : .65, a.renderScale ?? .65);
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
