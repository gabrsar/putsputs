// @putsputs-direct-webgl
// @putsputs-blendable
// Aurora: atmospheric curtains, silver hems and spectral ray fibers.
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution,iBands,iAttack;
uniform float iTime,iMotion;
uniform vec4 iPhrase,iJourney,iEvents[8],iSpectrum[3];
out vec4 outputColor;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 a=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(a),hash(a+vec2(1.,0.)),f.x),mix(hash(a+vec2(0.,1.)),hash(a+1.),f.x),f.y);}
float spectral(float position){float n=clamp(position,0.,10.999);int i=int(n),j=i+1;return mix(iSpectrum[i/4][i%4],iSpectrum[j/4][j%4],fract(n));}
vec3 sky(vec2 p){
 vec3 c=mix(vec3(.002,.006,.017),vec3(.008,.018,.045),smoothstep(-.65,.8,p.y));
 float galaxy=exp(-pow((p.y-.42+p.x*.12)/.27,2.));
 float dust=noise(p*3.8)*.65+noise(p*9.1)*.35;c+=vec3(.017,.019,.038)*galaxy*dust;
 for(int layer=0;layer<2;layer++){
  float k=float(layer);vec2 grid=p*(48.+k*37.),id=floor(grid);
  vec2 local=fract(grid)-vec2(hash(id+k),hash(id+31.+k));
  float star=exp(-dot(local,local)*(260.+k*100.))*step(.988,hash(id+81.+k));
  float twinkle=.82+.18*sin(iTime*.23+hash(id)*12.);
  c+=mix(vec3(.18,.28,.47),vec3(.48,.43,.34),hash(id+7.))*star*twinkle/(1.+k);
 }return c;
}
vec3 curtains(vec2 p){
 float era=iJourney.x,wind=iMotion*.025;vec3 glow=vec3(0.);float transmission=1.;
 // Samples span depth; overlapping membranes absorb the more distant light.
 for(int i=0;i<20;i++){
  float n=float(i),depth=2.2+n*.42,x=p.x*depth*.62,y=(p.y+.66)*depth*.54;
  float wave=sin(x*.56+depth*.69+sin(x*.29-era*.14)*1.5+wind);
  float fold=.5+.5*sin(x*.83+depth*.97+wave*1.65),sheet=pow(fold,18.);
  float note=spectral(mod(x*.46+depth*.65+12.,11.));
  float lower=.13+depth*.085+.13*sin(x*.46+depth*.4+era*.17),altitude=y-lower;
  float height=.72+iPhrase.x*.80+note*.50;
  float vertical=smoothstep(-.025,.075,altitude)*exp(-max(0.,altitude)/(height*.58));
  float crown=1.-smoothstep(height*.72,height*1.65,altitude);
  float rayPhase=x*53.+wave*2.6+sin(x*7.-wind)*.55;
  float rayDetail=1.-smoothstep(.8,3.0,fwidth(rayPhase));
  float fibers=mix(.55,.55+.45*pow(.5+.5*sin(rayPhase),3.),rayDetail);
  vec4 event=iEvents[i%8];
  float charge=event.y*exp(-event.x*.8)*pow(.5+.5*cos(x*1.4-event.x*2.1+event.w*4.),12.);
  // Attacks illuminate thread-like folds, not separate impact geometry.
  float silver=exp(-abs(altitude)*34.)*(.4+note*.6+charge*.30);
  float highColor=smoothstep(.20,height*.85,max(0.,altitude));
  vec3 tint=mix(vec3(.025,.64,.36),vec3(.30,.095,.48),highColor);
  tint=mix(tint,vec3(.12,.40,.60),iPhrase.y*.22);
  float density=sheet*vertical*crown*fibers,depthFade=exp(-depth*.085);
  glow+=transmission*(tint*density*(.045+note*.085)+vec3(.16,.63,.48)*sheet*silver*.095)*depthFade;
  transmission*=1.-density*.045;
 }return glow;
}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 p=(2.*pixel-iResolution.xy)/iResolution.y;
 vec3 c=sky(p)+curtains(p)*2.0;
 // A still northern horizon anchors the atmosphere: no roll or beat zoom.
 float ridge=-.66+noise(vec2(p.x*2.3,18.7))*.075+noise(vec2(p.x*7.2,7.3))*.022;
 float terrain=1.-smoothstep(ridge-.006,ridge+.006,p.y);vec3 ground=vec3(.002,.005,.009);
 float lake=smoothstep(-1.,-.82,p.y)*(1.-smoothstep(-.74,-.68,p.y));
 vec2 reflected=vec2(p.x+.0025*sin(p.y*180.+iTime*.18),-1.30-p.y);
 ground+=curtains(reflected)*lake*.17;c=mix(c,ground,terrain);
 c*=1.-.18*smoothstep(.9,2.1,length(p));
 color=vec4(pow(1.-exp(-c*1.55),vec3(.94)),1.);
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
  s.surface = {canvas, gl, program, resolution, time, bands};
  s.dispose = () => {
    canvas.remove();
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
const {canvas, gl, program, resolution, time, bands} = s.surface;
const scale = Math.min(a.drawFinishedShader ? .80 : .65, a.renderScale ?? .65);
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
