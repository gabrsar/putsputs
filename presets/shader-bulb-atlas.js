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
void mainImage(out vec4 color, in vec2 pixel){
 vec2 uv=(2.*pixel-iResolution.xy)/iResolution.y;
 float phase=iTime*.18;
 vec3 eye=vec3(2.8*cos(phase),.62+.45*sin(phase*.6),2.8*sin(phase));
 vec3 front=normalize(-eye),right=normalize(cross(front,vec3(0.,1.,0.)));
 vec3 ray=normalize(front*1.8+right*uv.x+cross(right,front)*uv.y);
 float t=max(0.,-dot(eye,ray)-1.4);
 vec3 tint=vec3(.014,.022,.047)*(1.+.4*cos(uv.y*2.));
 for(int j=0;j<50;j++){
  vec3 pos=eye+ray*t;
  float distance=field(pos);
  if(distance<.0025){
   vec2 e=vec2(.004,0.);
   vec3 norm=normalize(vec3(field(pos+e.xyy)-field(pos-e.xyy),field(pos+e.yxy)-field(pos-e.yxy),field(pos+e.yyx)-field(pos-e.yyx)));
   float sun=max(0.,dot(norm,normalize(vec3(.65,.8,-.28))));
   float rim=pow(1.-max(0.,dot(norm,-ray)),2.);
   vec3 mineral=.55+.4*cos(vec3(.7,2.4,3.8)+length(pos)*5.+iBands.y*2.);
   tint=mineral*(.26+.74*sun)+rim*vec3(.35,.49,.78)*(.4+iBands.z);
   break;
  }
  t+=max(.003,distance*.95);
  if(t>4.6)break;
 }
 color=vec4(tint,1.);
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
const scale = Math.min(.65, a.renderScale ?? .65);
const width = Math.max(1, Math.round(p.width * scale));
const height = Math.max(1, Math.round(p.height * scale));
if (canvas.width !== width) canvas.width = width;
if (canvas.height !== height) canvas.height = height;
gl.viewport(0, 0, width, height);
gl.useProgram(program);
gl.uniform3f(resolution, width, height, 1);
gl.uniform1f(time, a.time || 0);
gl.uniform3f(bands, a.bass || 0, a.mid || 0, a.treble || 0);
gl.drawArrays(gl.TRIANGLES, 0, 3);
if (a.directWebGL && a.presentWebGL) a.presentWebGL(canvas);
else p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
