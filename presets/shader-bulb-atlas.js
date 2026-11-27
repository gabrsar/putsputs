// @putsputs-direct-webgl
// @putsputs-blendable
// Original áudio-reativo inspirado em https://www.shadertoy.com/view/MdXSWn.
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
float field(vec3 p){
 vec3 z=p;
 float derivative=1., radius=length(z);
 for(int n=0;n<6;n++){
  radius=max(length(z),.0001);
  if(radius>2.5)break;
  float polar=acos(clamp(z.z/radius,-1.,1.))*8.;
  float azimuth=atan(z.y,z.x)*8.;
  derivative=8.*pow(radius,7.)*derivative+1.;
  z=pow(radius,8.)*vec3(sin(polar)*cos(azimuth),sin(polar)*sin(azimuth),cos(polar))+p;
 }
 return .5*log(radius)*radius/derivative;
}
float hash(vec2 p){return fract(sin(dot(p,vec2(121.5,73.8)))*43758.5453);}
vec3 palette(float n){return .51+.46*cos(vec3(.45,2.45,4.1)+n);}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 float theta=iTime*.037;
 vec2 z=mat2(cos(theta),sin(theta),-sin(theta),cos(theta))*p*(.98+.12*sin(theta*2.));
 vec2 c=vec2(-.743,.124)+vec2(.018*cos(iTime*.07),.025*sin(iTime*.09));
 float n=0.,trap=10.,lenSq=dot(z,z);
 for(int j=0;j<110;j++){
  if(lenSq>64.)break;
  z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;
  lenSq=dot(z,z);n+=1.;
  trap=min(trap,abs(length(z-vec2(.25,.12))-.58));
 }
 float escaped=step(64.,lenSq);
 float smoothN=n+1.-log2(max(1.,log2(max(2.,sqrt(lenSq)))));
 vec2 grid=p*53.;
 float star=exp(-dot(fract(grid)-.5,fract(grid)-.5)*140.)*step(.976,hash(floor(grid)));
 float nebula=pow(max(0.,.5+.5*sin(p.x*4.+p.y*3.+sin(p.y*7.))),3.)*exp(-abs(p.y)*.94);
 vec3 sky=vec3(.014,.018,.05)+vec3(.12,.06,.24)*nebula+star*vec3(.44,.60,.83);
 float contour=exp(-trap*(24.+iBands.z*10.));
 vec3 tint=palette(log(max(1.,smoothN))*1.55+iBands.y*.8);
 float filaments=smoothstep(.02,.88,(1.-exp(-n*.043)))*escaped;
 vec3 cOut=sky+tint*(contour*.66+filaments*.43)*(.72+iBands.x*.30);
 cOut=mix(cOut,vec3(.022,.012,.052)+tint*contour*.28,(1.-escaped)*.88);
 color=vec4(1.-exp(-cOut*1.44),1.);
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
