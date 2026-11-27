// Shadertoy-style single Image pass, with audio supplied as iBands (bass, mid, treble).
const fragment = `
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iBands;
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
vec2 p=fragCoord/iResolution.xy;
float plume=0.;
for(int j=1;j<=5;j++){
 float k=float(j);
 plume+=sin(p.x*k*13.+p.y*k*7.-iTime*(2.+k)+cos(p.y*8.-iTime))* .18/k;
}
float fuel=.20+iBands.x*.36+plume;
float flame=smoothstep(-.08,.14,fuel-p.y)*(.78+.22*cos(p.x*42.+iTime*4.));
float heat=clamp(flame*(1.2-p.y),0.,1.);
fragColor=vec4(vec3(pow(heat,.7),heat*heat*.72,pow(heat,5.)*.42)+vec3(.022,.012,.035),1.);
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
