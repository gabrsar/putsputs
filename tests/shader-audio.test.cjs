const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'music-window.js'),'utf8'),context);
const update=context.window.avsShaderAudio;
function frame(time,enabled=true,hit=false){
 return {time,dt:1/60,groups:{
  lo:{low:25,high:250,enabled,level:.8,hit},
  mid:{low:250,high:4000,enabled,level:.4},
  hi:{low:4000,high:20000,enabled,level:.2}},
  music:{energy:enabled?.7:0,spectralCenter:.6},
  stereo:{available:true,left:{energy:.1},right:{energy:.9}}};
}
test('attacks decay independently of sustained notes and disabled bands fade out',()=>{
 const s={};update(frame(0,true,true),s);
 assert.equal(s.shaderAudio.attack[0],.8);
 for(let i=1;i<180;i++)update(frame(i/60),s);
 assert(Math.abs(s.shaderAudio.body[0]-.8)<.001);
 assert(s.shaderAudio.attack[0]<.001);
 for(let i=180;i<600;i++)update(frame(i/60,false),s);
 assert(s.shaderAudio.body.every(x=>x<.001));
 assert(s.shaderAudio.phrase<.05);
});
test('renderers have independent state; backward time resets envelopes',()=>{
 const a={},b={};for(let i=0;i<180;i++)update(frame(i/60),a);
 update(frame(0),b);assert(a.shaderAudio.motion>b.shaderAudio.motion);
 update(frame(-1),a);assert.equal(a.shaderAudio.motion,b.shaderAudio.motion);
 assert.notEqual(a.shaderAudio,b.shaderAudio);
});
test('envelope integration is consistent at 30 and 60 fps; stereo falls back to center',()=>{
 const sample=rate=>{const s={};for(let i=0;i<rate;i++){const a=frame(i/rate);a.dt=1/rate;update(a,s);}return s.shaderAudio;};
 const a=sample(30),b=sample(60);assert(Math.abs(a.body[0]-b.body[0])<.001);
 assert(b.pan>.5);
 const s={};for(let i=0;i<60;i++){const a=frame(i/60);a.stereo={available:false};update(a,s);}assert.equal(s.shaderAudio.pan,0);
});
test('all shader presets parse and the two laser renderers retain the same fragment',()=>{
 const files=fs.readdirSync(path.join(root,'presets')).filter(f=>f.startsWith('shader-')||['fractal-julia.js','fractal-mandelbrot.js','cloud-creatures.js','negroni-amber.js'].includes(f));
 assert.equal(files.length,15);
 for(const f of files)new Function('p','a','s',fs.readFileSync(path.join(root,'presets',f),'utf8'));
 const fragment=f=>fs.readFileSync(path.join(root,'presets',f),'utf8').split('const fragment = `')[1].split('`;')[0];
 assert.equal(fragment('shader-laser.js'),fragment('shader-laser-direct.js'));
});
test('spatial memories are bounded, retain their birth position and expire in silence',()=>{
 const s={};update(frame(0,true,true),s);
 assert.equal(s.shaderAudio.events.length,32);
 const position=s.shaderAudio.events[3];
 for(let i=1;i<30;i++)update(frame(i/60),s);
 assert.equal(s.shaderAudio.events[3],position);
 assert(s.shaderAudio.events[0]>.4);
 assert(Math.abs(s.shaderAudio.events[1]-.8)<1e-6);
 for(let i=30;i<600;i++)update(frame(i/60,false),s);
 for(let i=1;i<32;i+=4)assert.equal(s.shaderAudio.events[i],0);
 for(let i=600;i<1800;i++)update(frame(i/60,true,true),s);
 assert.equal(s.shaderAudio.events.length,32);
 assert(s.shaderAudio.eventCount>8);
 assert([...s.shaderAudio.events].every(Number.isFinite));
});
test('spectral detail follows frequency overlap through regrouping and disabled controls',()=>{
 const s={};for(let i=0;i<120;i++)update(frame(i/60),s);
 assert(s.shaderAudio.spectrum[0]>s.shaderAudio.spectrum[10]);
 for(let i=120;i<240;i++){
  const a=frame(i/60);a.groups={wide:{low:25,high:20000,enabled:true,level:.6}};update(a,s);
 }
 for(const level of s.shaderAudio.spectrum)assert(Math.abs(level-.6)<.001);
 for(let i=240;i<480;i++)update(frame(i/60,false),s);
 assert([...s.shaderAudio.spectrum].every(x=>x<.001));
});
test('minute-scale evolution remains finite, continuous and depends on musical activity',()=>{
 const loud={},quiet={};
 for(let i=0;i<1800;i++){
  const a=frame(i*.1,true,i%7===0),b=frame(i*.1,false);a.dt=b.dt=.1;
  const previous=loud.shaderAudio?.journey||0;update(a,loud);update(b,quiet);
  assert(loud.shaderAudio.journey>=previous);
  assert(loud.shaderAudio.journey-previous<.01);
 }
 assert(loud.shaderAudio.journey>quiet.shaderAudio.journey*1.5);
 assert(loud.shaderAudio.activity>0);
 assert(Number.isFinite(loud.shaderAudio.motion));
});
