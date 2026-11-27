// @putsputs-direct-webgl
// @putsputs-blendable
// Original áudio-reativo inspirado em Star Nest de Kali, https://www.shadertoy.com/view/XlfGRj.
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
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
 vec3 direction=normalize(vec3(uv*.83,1.));
 float turn=iTime*.042;
 direction.xz=mat2(cos(turn),sin(turn),-sin(turn),cos(turn))*direction.xz;
 vec3 origin=vec3(.19*sin(turn),.18*cos(turn*.7),iTime*.15);
 vec3 light=vec3(.008,.011,.032);
 for(int i=0;i<13;i++){
  float depth=.42+float(i)*.36;
  vec3 p=origin+direction*depth;
  float dust=field(p);
  float filament=pow(dust,2.6);
  float cloudBand=.5+.5*cos(p.y*3.2+p.x*.74+sin(p.z*.62)*1.8);
  float curtain=smoothstep(.12,.82,cloudBand);
  vec3 tint=.52+.48*cos(vec3(.4,2.,4.5)+depth*.77+sin(p.y*1.8)*1.1+iBands.y*.6);
  vec2 starGrid=p.xy*(7.+float(i)*.38)+vec2(float(i)*17.9,float(i)*11.3);
  vec2 id=floor(starGrid);
  vec2 nucleus=vec2(starHash(id+1.),starHash(id+2.))*.68+.16;
  vec2 offset=fract(starGrid)-nucleus;
  float star=exp(-dot(offset,offset)*235.)*step(.973,starHash(id));
  light+=(tint*(dust*.072+filament*.26)*curtain+mix(tint,vec3(.83,.9,1.),.75)*star*.90)
        *(1.+iBands.z*.39)*exp(-depth*.23);
 }
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
gl.uniform3f(bands, a.bass || 0, a.mid || 0, a.treble || 0);
if (a.drawFinishedShader) a.drawFinishedShader(s.surface, width, height);
else gl.drawArrays(gl.TRIANGLES, 0, 3);
if (a.directWebGL && a.presentWebGL) a.presentWebGL(canvas);
else p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
