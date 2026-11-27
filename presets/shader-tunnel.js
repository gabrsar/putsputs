// Shadertoy-style single Image pass, with audio supplied as iBands (bass, mid, treble).
const fragment = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
vec2 p=(2.*fragCoord-iResolution.xy)/iResolution.y;
vec2 q=p+vec2(sin(iTime*.7),cos(iTime*.55))*.16;
float d=max(.018,max(abs(q.x),abs(q.y))), z=1./d, a=atan(q.y,q.x);
float tiles=smoothstep(.06,.15,fract(z-iTime*2.))*smoothstep(.02,.07,fract(a*2.546));
float scan=pow(.5+.5*cos(z*5.-iTime*9.),6.);
vec3 wall=.48+.42*cos(vec3(0.,2.,4.)+a+z*.19);
fragColor=vec4(wall*(.19+tiles*.45+scan*(.3+iBands.x))*smoothstep(.02,.31,d),1.);
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
