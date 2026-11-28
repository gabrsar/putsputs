// @putsputs-direct-webgl
// @putsputs-blendable
// Negroni: original amber rectangles, now layered refractive glass and copper.
const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime,iMotion,iSeed,iFlow;
uniform vec3 iBands,iAttack;
uniform vec4 iPhrase,iJourney,iEvents[8],iSpectrum[3];
uniform vec4 iLiquid; // inertial x/y displacement, torsion, ripple amplitude
uniform vec3 iLiquidVelocity;
out vec4 outputColor;
const float PI=3.14159265;
mat2 rot(float a){return mat2(cos(a),sin(a),-sin(a),cos(a));}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
 vec2 a=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(a),hash(a+vec2(1.,0.)),f.x),mix(hash(a+vec2(0.,1.)),hash(a+1.),f.x),f.y);
}
float band(int n){int k=n%12;return iSpectrum[k/4][k%4];}
float roundedBox(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return min(max(q.x,q.y),0.)+length(max(q,0.))-r;}
vec2 boxNormal(vec2 p,vec2 b,float r){
 vec2 q=abs(p)-b+r;
 vec2 n=length(max(q,0.))>.0001?normalize(max(q,0.)):(q.x>q.y?vec2(1.,0.):vec2(0.,1.));
 return n*sign(p);
}
mat3 frameBasis(float z,float x,float y){
 mat3 rz=mat3(cos(z),sin(z),0.,-sin(z),cos(z),0.,0.,0.,1.);
 mat3 rx=mat3(1.,0.,0.,0.,cos(x),sin(x),0.,-sin(x),cos(x));
 mat3 ry=mat3(cos(y),0.,-sin(y),0.,1.,0.,sin(y),0.,cos(y));
 return rz*rx*ry;
}
// Broad studio lights make the bevels readable; the dark environment preserves
// transparent interiors. No texture downloads or random frame-to-frame flicker.
vec3 environment(vec3 r,float era){
 float key=pow(max(0.,dot(r,normalize(vec3(-.65,.85,1.3)))),40.);
 float strip=exp(-pow((r.x+.33*r.y-.20)/.055,2.))*smoothstep(-.5,.5,r.y);
 float ruby=pow(max(0.,dot(r,normalize(vec3(.9,-.3,.8)))),17.);
 return vec3(.08,.018,.008)+vec3(3.8,1.65,.55)*key+vec3(1.4,.7,.28)*strip+vec3(.75,.035,.022)*ruby;
}
vec3 backdrop(vec2 p,float era){
 vec2 q=rot(-.18+sin(era*.21)*.07+iLiquid.z*.18)*(p+iLiquid.xy*.25);
 float smoke=noise(q*2.1+vec2(era*.045,0.))*.6+noise(q*4.7-vec2(0.,era*.029))*.3;
 vec3 c=mix(vec3(.016,.004,.008),vec3(.052,.012,.008),smoke);
 c+=vec3(.065,.016,.004)*exp(-length(q-vec2(-.55,.2))*1.9)*(.65+iBands.x*.7);
 // Music animates refracted liquid caustics in the distant velvet.
 // Liquid caustics stretch and shear through velvet, never an outlined pulse.
 for(int j=0;j<8;j++){
  vec4 e=iEvents[j];float fade=e.y*smoothstep(0.,.12,e.x)*exp(-e.x*.8);
  vec2 v=rot(.35+e.w*.3)*(q-vec2(e.w*.42,0.));
  float bend=.06*sin(v.y*5.+e.x*.8)+.025*sin(v.y*13.-era*.3);
  float caustic=exp(-abs(v.x+bend)*100.)*exp(-v.y*v.y*1.6);
  c+=vec3(.17,.065,.012)*caustic*fade*.25;
 }
 // Fine caustic embroidery is hidden in the shadows between the larger frames.
 float lattice=abs(sin(q.x*8.+sin(q.y*6.+era*.17)))*abs(sin(q.y*11.-q.x*3.));
 float caustic=pow(max(0.,1.-lattice),22.);
 c+=vec3(.05,.013,.004)*caustic*exp(-dot(p,p)*.6)*(.2+iJourney.y*.5);
 return c;
}
void mainImage(out vec4 color,in vec2 pixel){
 vec2 screen=(2.*pixel-iResolution.xy)/iResolution.y;
 float aspect=iResolution.x/iResolution.y,fit=min(1.,aspect/1.5);
 vec2 p=screen/max(.25,fit);
 float era=iJourney.x,phase=iSeed+iFlow*.0025;
 // Geometry follows a calm clock, independent of musical amplitude and stereo.
 float calm=iFlow*.018;
 float procession=iFlow*.12,birth=floor(procession),advance=fract(procession);
 vec3 ro=vec3(0.,0.,3.8);
 vec3 rd=normalize(vec3(p,-2.5));
 vec3 light=vec3(0.),transmission=vec3(1.);
 float aa=2./(iResolution.y*max(.25,fit));
 // Front-to-back glass intersections refract the ray seen by later frames.
 // The composition retains the original eighteen slowly fanning rectangles.
 for(int j=0;j<30;j++){
  // On wrap a frame changes loop slot, but keeps its serial/material identity.
  // New rails are born below pixel scale; the outermost ones dissolve gradually.
  float k=float(j)-12.,n=(k-advance)/18.,age=1.-n,serial=birth+k;
  // Twelve additional near slots retain growing rails until they cover the entire
  // viewport and leave it. Opacity softens but never cuts a visible rail off.
  float visibility=smoothstep(.015,.14,age)*exp(-max(0.,age-.85)*.7);
  float angle=.12*phase+serial*.035+.025*sin(calm*.29+n*1.8);
  mat3 basis=frameBasis(angle,.08*sin(calm*.27+n*2.),.10*cos(calm*.23+n*2.3));
  vec3 center=vec3(.13*sin(phase+n*2.1),.065*cos(phase*.7+n),.40-n*2.88);
  vec3 normal=basis[2];
  float along=dot(center-ro,normal)/dot(rd,normal);
  if(along<=.05)continue;
  vec3 hit=ro+rd*along,local=transpose(basis)*(hit-center);
  vec2 b=max(vec2(.0002),vec2(1.75,.95)*pow(max(0.,age),1.65));
  float radius=min(.038+.008*sin(n*PI),min(b.x,b.y)*.18),d=roundedBox(local.xy,b,radius);
  vec2 grad=boxNormal(local.xy,b,radius);
  float pixelWidth=aa*along*.5;
  float width=min(.010+.008*(1.-n),min(b.x,b.y)*.18);
  float core=1.-smoothstep(width,width+pixelWidth,abs(d));
  float bevel=exp(-pow(d/(.018+.006*(1.-n)),2.));
  float halo=exp(-abs(d)*25.);
  float inside=1.-smoothstep(-pixelWidth,pixelWidth,d);
  // Copper, ruby and orange stay in different layers, with champagne highlights.
  vec3 copper=mix(vec3(.78,.21,.045),vec3(.48,.022,.035),.5+.5*sin(serial*.42+calm*.14));
  float shoulder=clamp(abs(d)/(width*2.),0.,1.);
  vec3 bevelNormal=normalize(basis*vec3(grad*(.30+shoulder*.8),1.-shoulder*.50));
  vec3 reflected=reflect(rd,bevelNormal);
  vec3 specular=environment(reflected,era);
  float fresnel=.045+.955*pow(1.-abs(dot(-rd,bevelNormal)),5.);
  float perimeter=abs(local.x/b.x)>abs(local.y/b.y)?local.y:local.x;
  float engraving=pow(.5+.5*cos(perimeter*94.+serial*2.7),14.);
  float doubleEdge=exp(-abs(abs(d)-.021)*200.);
  vec3 emission=copper*(core*.48+bevel*.11+halo*.032);
  emission+=specular*(bevel*(.20+fresnel*.65)+core*.10);
  emission+=copper*doubleEdge*(.025+engraving*.045);
  // Grazing reflections reveal microscopic scratches only on a few outer rails.
  float brushed=.5+.5*sin(perimeter*290.+sin(perimeter*73.)*.7);
  emission+=vec3(.35,.15,.045)*bevel*brushed*.015;
  light+=transmission*emission*visibility;
  vec3 absorption=mix(vec3(.010,.026,.036),vec3(.014,.031,.043),n);
  transmission*=exp((-absorption*inside*.36-vec3(bevel*.075))*visibility);
  // Local edge refraction, bounded and independent of absolute clock speed.
  rd=normalize(rd+basis*vec3(grad*bevel*.0016*visibility,0.));
 }
 vec3 background=backdrop(p,era);
 // Dust is sparse, behind the glass, at three parallax depths.
 for(int j=0;j<3;j++){
  float k=float(j);vec2 grid=p*(28.+k*19.)+vec2(iMotion*.025*(k+1.),era*.3);
  vec2 id=floor(grid),v=fract(grid)-vec2(hash(id+k),hash(id+3.+k));
  float dust=exp(-dot(v,v)*(180.+k*60.))*step(.992,hash(id+17.+k));
  background+=vec3(.4,.19,.065)*dust*(.06+band(7+j)*.20);
 }
 light+=transmission*background;
 float vignette=1.-.25*smoothstep(.5,2.1,length(screen));
 light*=vignette;
 // Smooth filmic shoulder keeps hot reflections colored instead of clipping.
 vec3 film=1.-exp(-light*1.28);
 film=pow(max(film,0.),vec3(.92));
 film+=(hash(floor(pixel))-.5)/650.;
 color=vec4(clamp(film,0.,1.),1.);
}
void main(){mainImage(outputColor,gl_FragCoord.xy);}
`;
if (!s.surface) {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2',{alpha:false,antialias:false,depth:false});
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
  const liquid=gl.getUniformLocation(program,'iLiquid');
  const liquidVelocity=gl.getUniformLocation(program,'iLiquidVelocity');
  const flow=gl.getUniformLocation(program,'iFlow');
  const seed=gl.getUniformLocation(program,'iSeed');
  const phase=a.rand?a.rand(0,6.283185):(Number(a.seed)||1337)*.001;
  s.surface = {canvas, gl, program, resolution, time, bands, seed, phase, liquid, liquidVelocity, flow};
  s.dispose = () => {
    canvas.remove();
    gl.deleteProgram(program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
}
const {canvas, gl, program, resolution, time, bands, seed, phase} = s.surface;
const scale = Math.min(a.drawFinishedShader ? .85 : .65, a.renderScale ?? .65);
const width = Math.max(1, Math.round(p.width * scale));
const height = Math.max(1, Math.round(p.height * scale));
if (canvas.width !== width) canvas.width = width;
if (canvas.height !== height) canvas.height = height;
gl.viewport(0, 0, width, height);
gl.useProgram(program);
gl.uniform3f(resolution, width, height, 1);
gl.uniform1f(time, a.time || 0);
const audio=window.avsShaderUniforms(a,s,s.surface);
// Underdamped spring motion: musical force excites the liquid, rather than
// attaching geometry directly to a fluctuating amplitude. Small integration
// steps preserve the same motion on slow displays and in library previews.
if(!s.liquid||a.time<s.liquid.lastTime)s.liquid={x:0,y:0,twist:0,vx:0,vy:0,vt:0,previousAttack:0,lastTime:a.time};
const fluid=s.liquid,dt=Math.max(.001,Math.min(.1,a.dt||1/60));
const impulse=Math.max(0,audio.attack[0]-fluid.previousAttack);
fluid.previousAttack=audio.attack[0];
const direction=Math.sin(audio.eventCount*2.399963+phase);
fluid.vx+=impulse*(direction*.28+audio.pan*.15);
fluid.vy+=impulse*.19;
fluid.vt+=Math.max(0,audio.attack[1]-.35)*dt*direction*.25;
const targetX=audio.pan*.10+(audio.body[0]-audio.body[1])*.10;
const targetY=(audio.body[1]-audio.body[2])*.065;
const targetTwist=(audio.body[1]-audio.body[0])*.12+(a.music?.trend||0)*.045;
const steps=Math.ceil(dt/.012),step=dt/steps;
for(let i=0;i<steps;i++){
 fluid.vx+=((targetX-fluid.x)*10.5-fluid.vx*2.0)*step;
 fluid.vy+=((targetY-fluid.y)*13.0-fluid.vy*2.3)*step;
 fluid.vt+=((targetTwist-fluid.twist)*6.0-fluid.vt*1.65)*step;
 fluid.x+=fluid.vx*step;fluid.y+=fluid.vy*step;fluid.twist+=fluid.vt*step;
}
fluid.lastTime=a.time;
s.negroniFlow=(s.negroniFlow||0)+dt;
gl.uniform1f(s.surface.flow,s.negroniFlow);
gl.uniform4f(s.surface.liquid,fluid.x,fluid.y,fluid.twist,Math.hypot(fluid.vx,fluid.vy));
gl.uniform3f(s.surface.liquidVelocity,fluid.vx,fluid.vy,fluid.vt);
gl.uniform1f(seed,phase);
if (a.drawFinishedShader) a.drawFinishedShader(s.surface, width, height);
else gl.drawArrays(gl.TRIANGLES, 0, 3);
if (a.directWebGL && a.presentWebGL) a.presentWebGL(canvas);
else p.drawingContext.drawImage(canvas, 0, 0, p.width, p.height);
