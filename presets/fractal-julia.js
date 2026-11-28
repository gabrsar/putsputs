// @putsputs-canvas-webgl
// @putsputs-blendable
// FRACTAL / Julia, variação do parâmetro complexo com o som.
/* global p, a, s */
const dt=Math.min(a.dt||1/60,.06),t=a.time,w=p.width,h=p.height;
const audio=window.avsShaderAudio(a,s);
const low=audio.body[0];
const high=audio.body[2];
p.blendMode(p.BLEND);p.colorMode(p.RGB,255);

const JULIA=true;
if(!s.g){
  s.g=p.createGraphics(64,64,p.WEBGL);s.g.pixelDensity(1);s.g.setAttributes('antialias',true);s.dispose=()=>{s.g.canvas.remove();s.g.remove();};
  s.shader=s.g.createShader(`
    precision highp float;
    attribute vec3 aPosition;attribute vec2 aTexCoord;varying vec2 uv;
    void main(){uv=aTexCoord;gl_Position=vec4(aPosition.xy*2.0-1.0,0.,1.);}
  `,`
    precision highp float;varying vec2 uv;
    uniform vec3 attacks;uniform vec2 phrase;
    uniform vec4 events[8],spectralDetail[3],journey;
    uniform vec2 resolution,cameraCenter;uniform float cameraZoom;uniform float time,bass,treble,isJulia;
    vec3 sampleFractal(vec2 tex){
      vec2 q=(tex-.5)*vec2(resolution.x/resolution.y,1.)*2.7/cameraZoom+cameraCenter;
      vec2 z=isJulia>.5?q:vec2(0.);
      vec2 c=isJulia>.5?vec2(-.73+sin(time*.025)*.012+bass*.012,.245+treble*.022):q;
      float n=0.;float trap=10.,crossTrap=10.,petalTrap=10.,stripes=0.;
      for(int i=0;i<100;i++){
        z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;
        trap=min(trap,abs(length(z)-.6));
        crossTrap=min(crossTrap,min(abs(z.x-.12),abs(z.y+.08)));
        float petals=.44+.10*cos(atan(z.y,z.x)*5.+journey.x*.16);
        petalTrap=min(petalTrap,abs(length(z)-petals));
        stripes+=sin(atan(z.y,z.x)*3.+journey.x*.12)*exp(-float(i)*.1);
        if(dot(z,z)>128.){n=float(i);break;}
      }
      float smoothN=n>0.?n+1.-log2(max(.01,log2(max(1.01,length(z))))):0.;
      float tone=clamp(smoothN/55.,0.,1.);
      vec3 pal=mix(vec3(.025,.055,.11),vec3(.12,.54,.58),pow(tone,.65));
      pal=mix(pal,vec3(.94,.84,.64),smoothstep(.40,.95,tone));
      pal=n>0.?pal:vec3(.008,.015,.035);
      pal=mix(pal,pal.bgr,phrase.y*.32);
      vec3 ink=.5+.5*cos(vec3(.3,2.4,4.4)+stripes*.25+journey.x*.23);
      float veins=exp(-crossTrap*65.),petals=exp(-petalTrap*46.);
      float ornament=isJulia>.5?petals:veins;
      float fine=isJulia>.5?veins:petals;
      pal+=ink*ornament*(.025+spectralDetail[1].y*.11);
      pal+=ink.bgr*fine*(.012+spectralDetail[2].z*.065);
      pal+=vec3(.035,.065,.075)*exp(-trap*18.)*(1.+attacks.y*3.+attacks.z);
      // Color flows along the Julia petal traps, revealing branch topology.
      float sap=pow(.5+.5*sin(stripes*.7-time*.24),10.);
      pal+=ink*petals*sap*(.025+attacks.y*.14+spectralDetail[1].z*.09);
      return pal;
    }
    void main(){
      vec2 d=.30/resolution;
      vec3 color=sampleFractal(uv+vec2(-d.x,-d.y))+sampleFractal(uv+vec2(d.x,-d.y))+sampleFractal(uv+vec2(-d.x,d.y))+sampleFractal(uv+d);
      color*=.25;
      // All accents belong to the orbit geometry, not a screen-space overlay.
      gl_FragColor=vec4(1.-exp(-color*1.12),1.);
    }
  `);
}
// Passeio em coordenadas complexas: deslocamento e zoom têm limites de velocidade.
if(!s.travel)s.travel={x:JULIA?0:-.55,y:.02,logZoom:Math.log(1.05),low:0,high:0,clock:0,waypoint:0,next:18};
const cam=s.travel;cam.clock+=dt*(.35+audio.phrase*.65);
for(const [key,value]of [['low',low],['high',high]])cam[key]+=(value-cam[key])*(1-Math.exp(-dt/2.8));
const route=JULIA?[[0,.02],[-.50,.13],[.42,-.13],[-.25,-.30],[.18,.32],[-.61,-.06],[.32,.24],[.06,-.42]]:
  [[-.55,.02],[-.74,.15],[-.32,.52],[.18,.36],[-1.05,.04],[-.70,-.32],[-.16,.71],[-1.23,.08]];
if(cam.clock>cam.next){cam.waypoint=(cam.waypoint+1)%route.length;cam.next=cam.clock+24+audio.center*18;}
const target=route[cam.waypoint],zoom=Math.exp(cam.logZoom);
const desiredZoom=1.2+audio.phrase*.65+(.5+.5*Math.sin(cam.clock*.09))*.5;
const desiredLog=Math.log(Math.min(4.2,desiredZoom));
// No máximo ~4,5% de zoom por segundo; sem rotação ou pulsação por batida.
cam.logZoom+=Math.max(-dt*.045,Math.min(dt*.045,(desiredLog-cam.logZoom)*(1-Math.exp(-dt/4))));
const dx=target[0]-cam.x,dy=target[1]-cam.y,length=Math.hypot(dx,dy);
const limit=dt*.035/zoom;
if(length>1e-7){const move=Math.min(limit,length*(1-Math.exp(-dt/5)));cam.x+=dx/length*move;cam.y+=dy/length*move;}
const g=s.g,rw=Math.max(64,Math.floor(w*(a.renderScale??1))),rh=Math.max(64,Math.floor(h*(a.renderScale??1)));
if(g.width!==rw||g.height!==rh)g.resizeCanvas(rw,rh);
g.clear();g.resetMatrix();g.shader(s.shader);g.noStroke();
for(const [name,value]of Object.entries({events:Array.from(audio.events),spectralDetail:Array.from(audio.spectrum),journey:[audio.journey,audio.activity,audio.elapsed,audio.phrase],attacks:audio.attack,phrase:[audio.phrase,audio.center],resolution:[g.width,g.height],time:cam.clock,bass:cam.low,treble:cam.high,isJulia:JULIA?1:0,cameraCenter:[cam.x,cam.y],cameraZoom:Math.exp(cam.logZoom)}))s.shader.setUniform(name,value);
g.rect(0,0,1,1);
if(a.directWebGL&&a.presentWebGL)a.presentWebGL(g.canvas);
else{p.background(2,3,10);p.imageMode(p.CORNER);p.image(g,0,0,w,h);}
