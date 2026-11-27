// @putsputs-direct-webgl
// Shadertoy-style single Image pass, with audio supplied as iBands (bass, mid, treble).
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
uniform int iStress;
uniform vec2 iJitter;
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
 for(int step=0;step<128;step++){
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
void main(){mainImage(outputColor,gl_FragCoord.xy+iJitter);}
`;
if (!s.surface) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('WebGL 2 indisponível.');
  const program = gl.createProgram();
  const compile = (kind, code, target = program) => {
    const shader = gl.createShader(kind);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(error);
    }
    gl.attachShader(target, shader);
    gl.deleteShader(shader);
  };
  const vertex = `#version 300 es
void main(){
  vec2 corner=vec2(float((gl_VertexID << 1) & 2),float(gl_VertexID & 2));
  gl_Position=vec4(corner*2.0-1.0,0.0,1.0);
}`;
  try {
    compile(gl.VERTEX_SHADER, vertex);
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
  const jitter = gl.getUniformLocation(program, 'iJitter');
  const stress = gl.getUniformLocation(program, 'iStress');
  const requestedSteps = Number(new URLSearchParams(location.search).get('stress'));
  const heavyBlur = requestedSteps >= 256;
  let blurProgram, blurTexture, blurRadius;
  if (heavyBlur) {
    blurProgram = gl.createProgram();
    try {
      compile(gl.VERTEX_SHADER, vertex, blurProgram);
      compile(gl.FRAGMENT_SHADER, `#version 300 es
precision highp float;
uniform sampler2D source;
uniform float radius;
out vec4 outputColor;
void main() {
  vec2 inverseSize = 1. / vec2(textureSize(source, 0));
  vec2 uv = gl_FragCoord.xy * inverseSize;
  vec3 glow = vec3(0.);
  float totalWeight = 0.;
  for (int y = -4; y <= 4; y++) {
    for (int x = -4; x <= 4; x++) {
      vec2 offset = vec2(float(x), float(y));
      float weight = exp(-dot(offset, offset) / 8.);
      glow += texture(source, uv + offset * inverseSize * radius).rgb * weight;
      totalWeight += weight;
    }
  }
  vec3 center = texture(source, uv).rgb;
  outputColor = vec4(center * .72 + glow * (.36 / totalWeight), 1.);
}
`, blurProgram);
      gl.linkProgram(blurProgram);
      if (!gl.getProgramParameter(blurProgram, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(blurProgram));
    } catch (error) {
      gl.deleteProgram(blurProgram);
      gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      throw error;
    }
    blurRadius = gl.getUniformLocation(blurProgram, 'radius');
    blurTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, blurTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  const steps = Number.isFinite(requestedSteps) ? Math.min(128, Math.max(0, Math.round(requestedSteps))) : 0;
  const burn = steps > 96;
  const maxDimension = Math.min(...gl.getParameter(gl.MAX_VIEWPORT_DIMS), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
  s.surface = {canvas, gl, program, resolution, time, bands, stress, jitter, steps, burn, maxDimension, blurProgram, blurTexture, blurRadius};
  s.dispose = () => {
    canvas.remove();
    if (blurProgram) {
      gl.deleteProgram(blurProgram);
      gl.deleteTexture(blurTexture);
    }
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
const {canvas, gl, program, resolution, time, bands, stress, jitter, steps, burn, maxDimension, blurProgram, blurTexture, blurRadius} = s.surface;
const burnScale = Math.min(4, Math.sqrt(8_294_400 / (p.width * p.height)), maxDimension / Math.max(p.width, p.height));
const scale = burn ? burnScale : steps ? 1 : Math.min(.65, a.renderScale ?? .65);
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
if (burn) {
  // Render 16 subpixel samples into the same buffer so every pass contributes.
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.enable(gl.BLEND);
  gl.blendColor(0, 0, 0, 1 / 16);
  gl.blendFuncSeparate(gl.CONSTANT_ALPHA, gl.ONE, gl.ZERO, gl.ONE);
  for (let sample = 0; sample < 16; sample++) {
    gl.uniform2f(jitter, (sample % 4 + .5) / 4 - .5, (Math.floor(sample / 4) + .5) / 4 - .5);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  gl.disable(gl.BLEND);
} else {
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
if (blurProgram) {
  gl.useProgram(blurProgram);
  gl.bindTexture(gl.TEXTURE_2D, blurTexture);
  if (s.surface.blurWidth !== width || s.surface.blurHeight !== height) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    s.surface.blurWidth = width;
    s.surface.blurHeight = height;
  }
  for (let pass = 0; pass < 8; pass++) {
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, width, height);
    gl.uniform1f(blurRadius, 1 + pass * 1.5);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
if (a.directWebGL) {
  if (!canvas.isConnected) {
    canvas.className = 'direct-webgl-stage';
    canvas.setAttribute('aria-hidden', 'true');
    document.getElementById('stage').append(canvas);
  }
} else {
  p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
}
