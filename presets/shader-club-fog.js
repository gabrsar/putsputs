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
 return .52+.20*sin(p.x*8.+sin(p.y*6.-t)+t)
           +.15*sin(dot(p,vec2(-13.,10.))-t*1.7)
           +.08*sin(dot(p,vec2(22.,16.))+t*.9);
}
vec3 fan(vec2 p,vec2 source,float angle,float spread,vec3 tint){
 vec2 q=p-source;
 vec2 axis=vec2(cos(angle),sin(angle));
 float along=dot(q,axis), side=dot(q,vec2(-axis.y,axis.x));
 float ray=side/max(.035,along)/spread*5.;
 float index=round(ray);
 float distance=abs(side-index*spread*along/5.);
 float pixel=2./iResolution.y;
 float width=.0015+max(0.,along)*.003+iBands.z*.002;
 float core=1.-smoothstep(width,width+pixel,distance);
 float halo=exp(-distance/(.012+max(along,0.)*.021));
 float vignette=smoothstep(0.,.08,along)*(1.-smoothstep(4.9,5.5,abs(ray)));
 float fog=mist(p)*exp(-max(0.,along)*.26);
 float sourceGlow=exp(-length(q)*58.);
 return tint*((core*.77+halo*.28)*vignette*fog+sourceGlow*.85);
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
 vec3 light=vec3(.013,.014,.034)*(.65+mist(p));
 float spread=.34+iBands.x*.35;
 float aim=.11*iBands.x;
 light+=fan(p,vec2(-aspect*.76,-.64),.62+.24*sin(iTime*.81)+aim,spread,vec3(.06,1.,.59));
 light+=fan(p,vec2(aspect*.76,-.64),2.52+.26*cos(iTime*.73)-aim,spread,vec3(.32,.32,1.));
 light+=fan(p,vec2(0.,.83),-1.57+.43*sin(iTime*.62),spread*.78,vec3(1.,.10,.41))*.77;
 for(int j=0;j<5;j++){
  float k=float(j);
  vec2 center=vec2((k-2.)*min(.39,aspect*.34),.30+.19*sin(iTime*.81+k*2.));
  float spin=iTime*(.47+.1*k)+k;
  vec3 tint=.55+.45*cos(vec3(0.,2.1,4.2)+k*1.8+iTime*.23);
  light+=tint*starOutline(p-center,spin,.072+iBands.y*.051)*( .68+iBands.z*.35);
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
