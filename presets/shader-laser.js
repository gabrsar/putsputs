// Shadertoy-style single Image pass, with audio supplied as iBands (bass, mid, treble).
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
uniform int iStress;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
vec2 uv=(2.*fragCoord-iResolution.xy)/iResolution.y;
vec3 light=vec3(.008,.014,.03);
for(int j=0;j<3;j++){
 float k=float(j);
 vec2 p=uv-vec2((k-1.)*.63,sin(iTime*.7+k*2.)*.24);
 float r=length(p),a=atan(p.y,p.x)+iTime*(.8-k*.55);
 // Ten times as many angular spokes and radial rings: about 100x the dot density.
 float dots=0.;
 for(int layer=0;layer<50;layer++){
  float f=float(layer);
  float phase=f*2.399963;
  float spokes=pow(.5+.5*cos(a*(140.+2.*f)+phase+iTime*.09*f),22.);
  float rings=pow(.5+.5*cos(r*(300.+3.*f)-iTime*3.+phase*1.7),20.);
  dots+=spokes*rings;
 }
 dots=1.-exp(-dots*.65);
 dots*=smoothstep(.035,.22,r);
 float ray=pow(.5+.5*cos(a*14.),130.)*exp(-r*4.);
 vec3 hue=.52+.48*cos(vec3(0.,2.,4.)+k*2.);
 light+=hue*(dots*(.65+iBands.z)+ray*(.11+iBands.x*.4));
}
if(iStress>0){
 float haze=0.;
 vec3 direction=normalize(vec3(uv,1.4));
 for(int step=0;step<96;step++){
  if(step>=iStress) break;
  float distance=.12+float(step)*.055;
  vec3 point=direction*distance;
  point.xy+=vec2(sin(iTime*.5+point.z),cos(iTime*.37+point.z))*.25;
  float beam=sin(point.x*19.+point.z*5.)*cos(point.y*21.-point.z*4.);
  float cloud=sin(point.x*31.+iTime)*sin(point.y*27.-point.z*11.);
  haze+=max(0.,beam*.65+cloud*.35-.35)*exp(-distance*.42);
 }
 light+=vec3(.22,.38,.86)*(1.-exp(-haze*.12));
}
fragColor=vec4(light,1.);
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
  const stress = gl.getUniformLocation(program, 'iStress');
  const requestedSteps = Number(new URLSearchParams(location.search).get('stress'));
  const steps = Number.isFinite(requestedSteps) ? Math.min(96, Math.max(0, Math.round(requestedSteps))) : 0;
  s.surface = {canvas, gl, program, resolution, time, bands, stress, steps};
  s.dispose = () => {
    canvas.remove();
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
const {canvas, gl, program, resolution, time, bands, stress, steps} = s.surface;
const scale = steps ? 1 : Math.min(.65, a.renderScale ?? .65);
const width = Math.max(1, Math.round(p.width * scale));
const height = Math.max(1, Math.round(p.height * scale));
if (canvas.width !== width) canvas.width = width;
if (canvas.height !== height) canvas.height = height;
gl.viewport(0, 0, width, height);
gl.useProgram(program);
gl.uniform3f(resolution, width, height, 1);
gl.uniform1f(time, a.time || 0);
gl.uniform3f(bands, a.bass || 0, a.mid || 0, a.treble || 0);
gl.uniform1i(stress, steps);
gl.drawArrays(gl.TRIANGLES, 0, 3);
if (a.directWebGL) {
  if (!canvas.isConnected) {
    canvas.className = 'direct-webgl-stage';
    canvas.setAttribute('aria-hidden', 'true');
    document.getElementById('stage').append(canvas);
  }
} else {
  p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
}
