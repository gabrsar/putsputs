// @putsputs-direct-webgl
// @putsputs-blendable
// Original starfield inspired by cinematic faster-than-light travel.
// No Star Trek artwork or source assets used.
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution,iBands,iAttack;
uniform float iTime,iMotion,iTravel;
uniform vec4 iPhrase,iJourney,iEvents[8],iSpectrum[3];
out vec4 outputColor;
float hash(float n){return fract(sin(n*127.13+91.7)*43758.5453);}
float band(int n){return iSpectrum[n/4][n%4];}
float capsule(vec2 p,vec2 a,vec2 b){vec2 d=b-a;return length(p-a-d*clamp(dot(p-a,d)/max(.000001,dot(d,d)),0.,1.));}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 float era=iJourney.x;
 // Fixed center, fixed exposure: music paints space instead of shaking the ship.
 vec3 light=vec3(.0015,.0025,.007);
 float clouds=pow(max(0.,.5+.5*sin(p.y*3.+sin(p.x*2.+era*.1))*sin(p.x*2.2-p.y*.8)),3.);
 light+=vec3(.012,.018,.045)*clouds*(.3+iPhrase.x*.45);
 for(int j=0;j<132;j++){
  float id=float(j),h=hash(id),h2=hash(id+451.);
  float angle=h*6.283185;
  vec2 direction=vec2(cos(angle),sin(angle));
  float spread=.25+hash(id+73.)*1.75;
  // Each star re-enters far away and exits outside the viewport before recycling.
  float travel=iTravel*(.10+hash(id+9.)*.065);
  float z=fract(h2-travel);
  float depth=.075+z*6.;
  vec2 star=direction*spread/depth;
  float fade=smoothstep(0.,.006,z)*(1.-smoothstep(.91,1.,z));
  float size=(.0008+.0024*(1.-z))/max(.4,depth*.3);
  float streak=.025+.19*(1.-z)*(1.-z);
  // Broad energy changes trail length gently; star trajectories stay clock-driven.
  vec2 tail=star-direction*streak*(.75+iPhrase.x*.25);
  vec2 trail=star-tail;
  float along=clamp(dot(p-tail,trail)/max(.000001,dot(trail,trail)),0.,1.);
  float d=capsule(p,tail,star);
  float aa=1.3/iResolution.y;
  float width=size*(.3+along*.7);
  float core=(1.-smoothstep(width,width+aa,d))*(.18+along*.82);
  float halo=exp(-d/(size*3.+aa));
  float head=exp(-length(p-star)/(size*1.6+aa));
  float note=band(j%12);
  // A few stars split into a brief blue spectral wake on high transients.
  float split=iAttack.z*step(.88,hash(id+91.));
  float wake=capsule(p,tail-direction*.018,star+vec2(-direction.y,direction.x)*.006);
  light+=vec3(.08,.21,.65)*exp(-wake/(size*2.+aa))*fade*split*.30;
  vec3 tint=mix(vec3(.38,.57,1.),vec3(.86,.94,1.),hash(id+17.));
  tint=mix(tint,vec3(1.,.73,.42),step(.92,h));
  light+=tint*(core*1.25+halo*.13+head*.32)*fade*(.55+note*.8)*(.6+(1.-z)*.65);
 }
 // No pulse overlay: transient accents belong to individual stellar wakes.
 // The starfield carries its music in the stellar light and spectral wakes.
 light*=1.-.15*smoothstep(.5,2.2,length(p));
 color=vec4(1.-exp(-light*1.5),1.);
}
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
  const travel=gl.getUniformLocation(program,'iTravel');
  s.surface = {canvas, gl, program, resolution, time, bands, travel};
  s.dispose = () => {
    canvas.remove();
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
const {canvas, gl, program, resolution, time, bands} = s.surface;
const scale = Math.min(a.drawFinishedShader ? 1.0 : .65, a.renderScale ?? .65);
const width = Math.max(1, Math.round(p.width * scale));
const height = Math.max(1, Math.round(p.height * scale));
if (canvas.width !== width) canvas.width = width;
if (canvas.height !== height) canvas.height = height;
gl.viewport(0, 0, width, height);
gl.useProgram(program);
gl.uniform3f(resolution, width, height, 1);
gl.uniform1f(time, a.time || 0);
window.avsShaderUniforms(a,s,s.surface);
s.travelClock=(s.travelClock||0)+Math.max(.001,Math.min(.1,a.dt||1/60));
gl.uniform1f(s.surface.travel,s.travelClock);
if (a.drawFinishedShader) a.drawFinishedShader(s.surface, width, height);
else gl.drawArrays(gl.TRIANGLES, 0, 3);
if (a.directWebGL && a.presentWebGL) a.presentWebGL(canvas);
else p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
