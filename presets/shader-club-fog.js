// @putsputs-direct-webgl
// @putsputs-blendable
// Laser de balada. iBands controla a abertura, as projeções e o brilho.
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
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
 float aspect=iResolution.x/iResolution.y;
 float horizon=-.39;
 float floorMask=1.-smoothstep(horizon-.045,horizon+.045,p.y);
 float reflected=floorMask*exp((p.y-horizon)*5.);
 vec3 light=vec3(.008,.010,.025)*(1.+mist(p));
 light+=vec3(.014,.016,.043)*reflected;
 float spread=.27+iBands.x*.29;
 float aim=.11*iBands.x;
 vec2 left=vec2(-aspect*.78,horizon),right=vec2(aspect*.78,horizon);
 float leftAngle=.59+.22*sin(iTime*.76)+aim;
 float rightAngle=2.56+.22*cos(iTime*.68)-aim;
 vec3 emerald=vec3(.03,1.,.55),violet=vec3(.42,.28,1.);
 light+=fan(p,left,leftAngle,spread,emerald);
 light+=fan(p,right,rightAngle,spread*1.10,violet);
 light+=fan(p,vec2(0.,.83),-1.57+.27*sin(iTime*.55),spread*.69,vec3(1.,.12,.32))*.63;
 vec2 mirror=vec2(p.x,2.*horizon-p.y);
 light+=.24*reflected*(fan(mirror,left,leftAngle,spread,emerald)+fan(mirror,right,rightAngle,spread*1.10,violet));
 for(int j=0;j<5;j++){
  float k=float(j);
  vec2 center=vec2((k-2.)*min(.39,aspect*.32)+.09*sin(iTime*.45+k),.32+.21*sin(iTime*.54+k*1.4));
  float spin=iTime*(.36+.063*k)+k;
  float gate=.30+.70*pow(.5+.5*cos(iTime*.82+k*.77),2.);
  vec3 tint=.55+.45*cos(vec3(.3,2.3,4.1)+k*1.54+iTime*.14);
  light+=tint*starOutline(p-center,spin,.065+iBands.y*.035)*gate*(.78+iBands.z*.32);
 }
 color=vec4(1.-exp(-light*1.24),1.);
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
