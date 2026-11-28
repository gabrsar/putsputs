// @putsputs-direct-webgl
// @putsputs-blendable
// Original áudio-reativo inspirado em https://www.shadertoy.com/view/4sjSW1.
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

float tile(vec2 id){return fract(sin(dot(id,vec2(39.34,73.12)))*43758.5453);}
float boxDistance(vec3 p,vec3 b){
 vec3 q=abs(p)-b;
 return length(max(q,0.))+min(0.,max(q.x,max(q.y,q.z)));
}
float hash(vec2 id){return fract(sin(dot(id,vec2(39.34,73.12)))*43758.5453);}
float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(0.,max(q.x,max(q.y,q.z)));}
float field(vec3 p){
 vec2 id=floor(p.xz/2.4);
 vec2 q=mod(p.xz,2.4)-1.2;
 float height=.43+hash(id)*1.55;
 float tower=box(vec3(q.x,p.y-height*.5,q.y),vec3(.64,height*.5,.64));
 float side=box(vec3(q.x,p.y+.08,q.y),vec3(.91,.14,.86));
 return min(p.y+.12,min(tower,side));
}

void mainImage(out vec4 color,in vec2 pixel){
 vec2 uv=(2.*pixel-iResolution.xy)/iResolution.y;float era=iJourney.x;
 // Keep the flight inside the street corridor while making minute-scale turns.
 vec3 eye=vec3(.20*sin(era*.41),1.42+.10*sin(era*.63),iMotion*.68);
 vec3 ray=normalize(vec3(uv.x,uv.y-.13,1.46));ray.xy=turn(sin(era*.33)*.035)*ray.xy;
 vec3 sky=mix(vec3(.17,.065,.12),vec3(.013,.018,.054),smoothstep(-.35,.55,ray.y));
 float moon=length(ray.xy-vec2(-.24,.15));
 sky+=vec3(.48,.23,.15)*(1.-smoothstep(.075,.080,moon))*.6;
 float corona=exp(-abs(moon-.09)*48.)*(.025+spectral(2.)*.055);
 sky+=vec3(.35,.16,.11)*corona;
 // Distant antenna beacons, kept on the skyline instead of overlaid geometry.
 for(int j=0;j<8;j++){
  vec4 e=iEvents[j];float x=e.w*.54;
  float antenna=exp(-abs(ray.x-x)*380.)*exp(-abs(ray.y-.018-e.z*.01)*85.);
  sky+=vec3(.08,.18,.32)*antenna*life(e)*.24;
 }
 float travel=.03;vec3 hazeLight=vec3(0.);
 for(int i=0;i<83;i++){
  vec3 p=eye+ray*travel;float d=field(p);
  // Blue fog ribbons reveal volume between the camera and the architecture.
  float fog=pow(.5+.5*sin(p.z*.8+p.x*2.+era*.2),8.)*exp(-abs(p.y-.35)*2.);
  hazeLight+=vec3(.025,.05,.085)*fog*.006*exp(-travel*.08)*(1.+iBands.x);
  if(d<.006){
   vec2 e=vec2(.012,0.);
   vec3 n=normalize(vec3(field(p+e.xyy)-field(p-e.xyy),field(p+e.yxy)-field(p-e.yxy),field(p+e.yyx)-field(p-e.yyx)));
   float sun=max(0.,dot(n,normalize(vec3(-.61,.79,.22))));
   vec3 stone=mix(vec3(.045,.052,.087),vec3(.25,.19,.25),sun);
   float slots=1.-smoothstep(.055,.135,abs(fract(p.y*4.2+.1)-.5));
   float chips=.32+.68*step(.27,hash(floor(vec2((p.x+p.z)*4.,p.y*4.2))));
   float region=mod(abs(floor(p.x/2.4)+floor(p.z/2.4)*3.),12.);
   float note=spectral(region),signal=0.;
   for(int j=0;j<8;j++){
    vec4 event=iEvents[j];float pulse=exp(-pow((travel-2.-event.x*3.)/.55,2.));
    signal+=pulse*life(event)*(.25+.75*hash(floor(p.xz)+event.w));
   }
   vec3 neon=mix(vec3(.96,.29,.09),vec3(.22,.45,1.),iPhrase.y);
   stone+=neon*slots*chips*(1.-abs(n.y))*(.04+note*.45+signal*.45);
   float floorGrid=exp(-abs(sin(p.x*3.14159/1.2))*35.)+exp(-abs(sin(p.z*3.14159/1.2))*35.);
   stone+=vec3(.04,.10,.19)*floorGrid*max(0.,n.y)*(.2+iBands.y*.45+signal*.5);
   float engraving=pow(.5+.5*cos(p.y*39.+p.x*21.),16.);
   stone+=neon*engraving*slots*note*.055;
   sky=mix(sky,stone,exp(-travel*.071));break;
  }
  travel+=clamp(d*.72,.018,.48);if(travel>21.)break;
 }
 color=vec4(1.-exp(-(sky+hazeLight)*1.15),1.);
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
