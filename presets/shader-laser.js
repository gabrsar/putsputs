// Shadertoy-style single Image pass, with audio supplied as iBands (bass, mid, treble).
const fragment = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
vec2 uv=(2.*fragCoord-iResolution.xy)/iResolution.y;
vec3 light=vec3(.008,.014,.03);
for(int j=0;j<3;j++){
 float k=float(j);
 vec2 p=uv-vec2((k-1.)*.63,sin(iTime*.7+k*2.)*.24);
 float r=length(p),a=atan(p.y,p.x)+iTime*(.8-k*.55);
 float dots=pow(.5+.5*cos(a*14.),28.)*pow(.5+.5*cos(r*30.-iTime*3.),20.);
 float ray=pow(.5+.5*cos(a*14.),130.)*exp(-r*4.);
 vec3 hue=.52+.48*cos(vec3(0.,2.,4.)+k*2.);
 light+=hue*(dots*(.65+iBands.z)+ray*(.11+iBands.x*.4));
}
fragColor=vec4(light,1.);
}
void main(){mainImage(gl_FragColor,gl_FragCoord.xy);}
`;
if (!s.surface) {
  s.surface = p.createGraphics(64, 64, p.WEBGL);
  s.surface.pixelDensity(1);
  s.program = s.surface.createShader(
    'attribute vec3 aPosition; void main(){gl_Position=vec4(aPosition.xy*2.0-1.0,0.0,1.0);}',
    fragment
  );
  s.dispose = () => s.surface.remove();
}
const g = s.surface;
const scale = Math.min(.65, a.renderScale ?? .65);
const width = Math.max(1, Math.round(p.width * scale));
const height = Math.max(1, Math.round(p.height * scale));
if (g.width !== width || g.height !== height) g.resizeCanvas(width, height);
g.shader(s.program);
s.program.setUniform('iResolution', [width, height, 1]);
s.program.setUniform('iTime', a.time || 0);
s.program.setUniform('iBands', [a.bass || 0, a.mid || 0, a.treble || 0]);
g.noStroke();
g.beginShape(g.TRIANGLE_STRIP);
g.vertex(0, 0);
g.vertex(1, 0);
g.vertex(0, 1);
g.vertex(1, 1);
g.endShape();
p.imageMode(p.CORNER);
p.image(g, 0, 0, p.width, p.height);
