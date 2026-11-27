'use strict';
const $=id=>document.getElementById(id);
const presets={
'01 · Órbita / feedback':`p.background(5, 8, 14, 24);
p.translate(p.width/2, p.height/2);
p.rotate(a.time * 0.12);
p.noFill();
for (let i=0; i<180; i++) {
  const angle = i / 180 * p.TWO_PI;
  const energy = a.spectrum[Math.floor(i/180*a.spectrum.length*0.3)] || 0;
  const r = 80 + a.bass*130 + energy*170;
  p.stroke(100+155*energy, 255, 130+100*Math.sin(angle+a.time), 180);
  p.line(Math.cos(angle)*r, Math.sin(angle)*r,
    Math.cos(angle+.025)*(r+15+energy*80),
    Math.sin(angle+.025)*(r+15+energy*80));
}`,
'02 · Osciloscópio':`p.background(4, 10, 18, 35);
p.noFill();
p.stroke(110, 255, 175);
p.strokeWeight(2);
p.beginShape();
for (let i=0; i<a.waveform.length; i+=2) {
  p.vertex(i/a.waveform.length*p.width,
    p.height/2+a.waveform[i]*p.height*.4);
}
p.endShape();`,
'03 · Túnel AVS':`p.background(5, 5, 15, 45);
p.translate(p.width/2, p.height/2);
p.noFill();
for(let j=0;j<30;j++) {
  const z=(j/30+a.time*.16)%1;
  const r=z*z*p.width;
  p.push();
  p.rotate(a.time*.3+j*.08+a.bass*.4);
  p.stroke(90+160*z, 100+a.mid*155, 255, z*255);
  p.strokeWeight(1+a.treble*4);
  p.rectMode(p.CENTER);
  p.rect(0,0,r,r);
  p.pop();
}`,
'04 · Partículas':`p.background(3, 8, 12, 30);
s.dots ||= Array.from({length:240},()=>({
  x:p.random(p.width), y:p.random(p.height), t:p.random(p.TWO_PI)
}));
p.noStroke();
for(const d of s.dots) {
  d.t += (p.noise(d.x*.004,d.y*.004,a.time*.1)-.5)*.2;
  const speed=(20+a.bass*180)*a.dt;
  d.x=(d.x+Math.cos(d.t)*speed+p.width)%p.width;
  d.y=(d.y+Math.sin(d.t)*speed+p.height)%p.height;
  p.fill(120+a.treble*135,255,170,200);
  p.circle(d.x,d.y,1+a.level*6);
}`};
const groupEngine=new AudioGroups($('audio-groups'));
let detailMagnitude=new Float32Array(2048);
const magnitudeTable = new Float64Array(256);
let magnitudeMinDb, magnitudeMaxDb;
function magnitudeByByte(minDb,maxDb){
 if(minDb!==magnitudeMinDb||maxDb!==magnitudeMaxDb){
  for(let byte=1;byte<256;byte++)magnitudeTable[byte]=Math.pow(10,(minDb+byte/255*(maxDb-minDb))/20);
  magnitudeMinDb=minDb;magnitudeMaxDb=maxDb;
 }
 return magnitudeTable;
}
let detailAnalyser,detailRaw=new Uint8Array(2048),detailSpectrum=new Float32Array(2048);
let stereoAnalysis;
let context,analyser,source,stream,media,url,outputGain,mode='silence',generation=0;
let raw=new Uint8Array(1024),wave=new Float32Array(2048),demoMagnitude=new Float32Array(1024);
const a={spectrum:new Float32Array(1024),waveform:wave,bass:0,mid:0,treble:0,level:0,time:0,dt:0,sampleRate:48000,binHz:48000/2048};
// Visual compression of normalized levels; not a calibrated dB measurement.
a.amplitude=value=>{
  const v=Math.max(0,Math.min(1,Number(value)||0));
  const scale=$('amplitude-scale').value;
  if(scale==='linear')return v;
  if(scale==='sqrt')return Math.sqrt(v);
  const curve=+$('amplitude-curve').value;
  return Math.log1p(curve*v)/Math.log1p(curve);
};
// Curvas aplicadas à amplitude física: não apenas ao percentual de uma FFT em dB.
a.visualLevel=db=>{
  if(!Number.isFinite(db)||db<=-80)return 0;
  const floor=1e-4,reference=Math.pow(10,-25/20);
  return a.amplitude(Math.max(0,Math.min(1,(Math.pow(10,db/20)-floor)/(reference-floor))));
};
a.energy=(lo,hi)=>{let start=Math.max(0,Math.ceil(lo/a.binHz)),end=Math.min(a.spectrum.length-1,Math.floor(hi/a.binHz)),sum=0;for(let i=start;i<=end;i++)sum+=a.spectrum[i];return sum/Math.max(1,end-start+1)};
function message(t){$('status').textContent=t}
function resizeFFT(){const n=+$('fft').value;if(analyser)analyser.fftSize=n;if(wave.length!==n){raw=new Uint8Array(n/2);wave=new Float32Array(n);a.spectrum=new Float32Array(n/2);demoMagnitude=new Float32Array(n/2);a.waveform=wave;}a.binHz=a.sampleRate/n}
function disconnect(){window.avsPlayer?.onDisconnect();$('example-player').replaceChildren();$('example-player').hidden=true;window.avsMusic?.reset();window.remoteAudio?.detach();generation++;groupEngine.reset();if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;if(source)source.disconnect();source=null;if(media){media.pause();media.removeAttribute('src');media.load();media=null}if(url)URL.revokeObjectURL(url);url=null;mode='silence'}
async function init(){const AudioEngine=window.AudioContext||window.webkitAudioContext;context ||= new AudioEngine();if(!outputGain){outputGain=context.createGain();outputGain.connect(context.destination);}analyser ||= context.createAnalyser();if(!detailAnalyser){detailAnalyser=context.createAnalyser();detailAnalyser.fftSize=4096;detailAnalyser.smoothingTimeConstant=0.05;detailAnalyser.minDecibels=-110;detailAnalyser.maxDecibels=0;}stereoAnalysis ||= new StereoAnalysis(context);a.sampleRate=context.sampleRate;resizeFFT();await context.resume();}
let captureRequest=0;
async function capture(kind){
 const request=++captureRequest;
 let ticket=generation,captured,nextSource;
 try{
  const devices=navigator.mediaDevices;
  const blocked=window.captureGuide?.blockedReason(kind);
  if(blocked){message(blocked);return;}
  if(kind==='system'&&!devices?.getDisplayMedia){message('O compartilhamento de áudio precisa de um navegador compatível e uma conexão segura.');return;}
  if(kind==='mic'&&!devices?.getUserMedia){message('O acesso ao microfone precisa de um navegador compatível e uma conexão segura.');return;}
  const pending=kind==='system'?devices.getDisplayMedia({video:{frameRate:{ideal:1,max:1}},audio:{suppressLocalAudioPlayback:false},systemAudio:'include',surfaceSwitching:'include'}):devices.getUserMedia({audio:true});
  let engineError;
  init().catch(error=>{engineError=error;});
  captured=await pending;
  if(ticket!==generation||request!==captureRequest)return;
  const tracks=captured.getTracks(),audioTracks=captured.getAudioTracks();
  if(!audioTracks.length)throw Object.assign(new Error('no-audio-track'),{code:'no-audio-track'});
  if(!analyser||!detailAnalyser||!stereoAnalysis)throw engineError||new Error('O motor de áudio não foi iniciado.');
  if(tracks.some(track=>track.readyState==='ended'))throw new Error('O compartilhamento foi encerrado antes de conectar.');
  nextSource=context.createMediaStreamSource(new MediaStream(audioTracks));
  nextSource.connect(analyser);nextSource.connect(detailAnalyser);stereoAnalysis.connect(nextSource);
  disconnect();ticket=generation;
  stream=captured;captured=null;a.captureKind=kind;source=nextSource;nextSource=null;mode='live';
  const ended=()=>{if(ticket===generation){disconnect();message('Captura encerrada.');}};
  tracks.forEach(track=>track.addEventListener('ended',ended,{once:true}));
  window.avsPlayer?.refresh();message(kind==='system'?'Áudio compartilhado conectado nesta página.':'Microfone conectado.');
 }catch(error){
  if(ticket===generation&&request===captureRequest)message(window.captureGuide?.describeError(error,kind)||'Captura não iniciada: '+error.message);
 }finally{
  nextSource?.disconnect();captured?.getTracks().forEach(track=>track.stop());
 }
}
$('system').onclick=()=>capture('system');$('mic').onclick=()=>capture('mic');
$('stop').onclick=()=>{disconnect();message('Áudio parado.')};$('demo').onclick=()=>{disconnect();mode='demo';message('Demo sintética visual · sem áudio real.')};
$('file').onclick=()=>$('upload').click();$('upload').onchange=async e=>{const f=e.target.files[0];if(!f)return;disconnect();const ticket=generation;try{await init();if(ticket!==generation)return;url=URL.createObjectURL(f);media=new Audio(url);media.loop=false;media.onended=()=>{if(ticket===generation)message('Música encerrada. Abra outro arquivo para continuar.')};source=context.createMediaElementSource(media);source.connect(analyser);source.connect(detailAnalyser);stereoAnalysis.connect(source);source.connect(outputGain);await media.play();if(ticket===generation){mode='live';window.avsPlayer?.fileStarted(f.name);message('')}}catch(err){if(ticket===generation){disconnect();message(err.message)}}e.target.value=''};
$('fft').onchange=resizeFFT;
let drawCode,state={},sketch;
let directWebGL=false, canBlend=true;
a.presentWebGL=(canvas,overlay=false)=>{
 if(canvas.parentElement===$('stage')&&canvas.classList.contains('direct-webgl-stage'))return;
 canvas.classList.add('direct-webgl-stage');
 canvas.classList.toggle('direct-webgl-overlay',overlay);
 canvas.setAttribute('aria-hidden','true');
 $('stage').append(canvas);
};
const qualityControl=$('render-quality'),libraryDialog=$('library-dialog');
const touchScreen=matchMedia('(pointer: coarse)');
let autoScale=1,slowFrameTime=0;
function resetAutoQuality(){autoScale=1;slowFrameTime=0;}
function setRenderQuality(p){
 const quality=qualityControl?.value||'auto';
 const screenDensity=Math.min(2,Math.max(1,window.devicePixelRatio||1));
 const density=quality==='ultra'?2:quality==='detail'?screenDensity:1;
 if(p.pixelDensity()!==density)p.pixelDensity(density);
 a.pixelDensity=density;
 const budget=touchScreen.matches?360000:1400000;
 const nativeScale=Math.min(1,Math.sqrt(budget/Math.max(1,p.width*p.height)));
 a.renderScale=quality==='auto'?Math.max(.4,nativeScale*autoScale):
  ({performance:.55,balanced:.85,detail:screenDensity,ultra:2})[quality]||1;
 a.drawFinishedShader=quality==='performance'?null:window.drawFinishedShader;
 const ctx=p.drawingContext;
 ctx.imageSmoothingEnabled=true;
 ctx.imageSmoothingQuality=quality==='performance'||a.renderScale<.85?'low':'high';
}
function observeFrameTime(p){
 // Ignore time spent in a modal, switching presets, or resuming a background tab.
 if(qualityControl?.value!=='auto'||libraryDialog?.open||window.visualTransition?.active||p.deltaTime>250)return;
 if(p.deltaTime<=23){slowFrameTime=0;return;}
 slowFrameTime+=p.deltaTime;
 if(slowFrameTime>=900){autoScale=Math.max(.55,autoScale*.8);slowFrameTime=0;}
}
function disposeCurrentState(){
 const dispose=state.dispose;state.dispose=null;
 if(typeof dispose==='function')try{dispose()}catch(error){console.warn('Preset cleanup:',error.message)}
}

const frameRenderSamples = [];
let measuredState;
function apply(){try{const code=codeEditor.getValue(),fn=new Function('p','a','s',code);const renderer=new URLSearchParams(location.search).get('renderer');
 const direct=renderer==='webgl'&&code.startsWith('// @putsputs-canvas-webgl')||renderer!=='canvas'&&code.startsWith('// @putsputs-direct-webgl');
 const blendable=!direct||/^\/\/ @putsputs-(?:direct|canvas)-webgl\r?\n\/\/ @putsputs-blendable/.test(code);
 if(blendable&&canBlend&&sketch?.canvas&&drawCode&&window.visualTransition){
  // During the dissolve, the existing compositor draws both presets into its 2D layers.
  if(directWebGL)$('stage').querySelector('.direct-webgl-stage')?.remove();
  window.visualTransition.begin(sketch.canvas,{fn:drawCode,state,canBlend,directWebGL});
 }else{
  window.visualTransition?.cancel();
  disposeCurrentState();
 }
 directWebGL=direct;canBlend=blendable;drawCode=fn;state={};frameRenderSamples.length=0;a.renderFrameMs=a.gpuFrameMs=undefined;resetAutoQuality();window.avsInputs?.reset(sketch?.canvas?sketch:null);if(sketch?.canvas){sketch.canvas.setAttribute('aria-label','Animação que reage ao áudio. Clique para usar mouse e teclado.');sketch.background(0);}$('error').textContent='';try{localStorage.setItem('avs-code',codeEditor.getValue())}catch{}return true}catch(e){$('error').textContent=e.message;return false}}
for(const name of Object.keys(presets))$('preset').add(new Option(name,name));
$('preset').onchange=()=>{codeEditor.setValue(presets[$('preset').value]);apply()};
try{codeEditor.setValue(localStorage.getItem('avs-code')||Object.values(presets)[0])}catch{codeEditor.setValue(Object.values(presets)[0])}
$('run').onclick=apply;$('editor').onkeydown=e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();apply()}if(e.key==='Tab'){e.preventDefault();const t=e.target,start=t.selectionStart;t.setRangeText('  ',start,t.selectionEnd,'end')}};
$('save').onclick=()=>{const u=URL.createObjectURL(new Blob([codeEditor.getValue()],{type:'text/javascript'}));const link=document.createElement('a');link.href=u;link.download=(($('local-preset-name')?.value||'visual').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,64)||'visual')+'.js';link.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
$('import').onclick=()=>$('codefile').click();$('codefile').onchange=async e=>{if(e.target.files[0]){codeEditor.setValue(await e.target.files[0].text());apply()}e.target.value=''};
async function enterFullscreen(target){
  try{
    if(document.fullscreenElement===target)return;
    if(document.fullscreenElement)await document.exitFullscreen();
    await target.requestFullscreen();
  }catch(e){if(target===$('visual-screen')||target===document.documentElement){$('visual-screen').classList.add('immersive');$('full').setAttribute('aria-pressed','true');$('exit-full').hidden=false;window.dispatchEvent(new Event('resize'));}else message('Não foi possível abrir tela cheia: '+e.message)}
}
$('full').onclick=async()=>{if($('visual-screen').classList.contains('immersive')){$('visual-screen').classList.remove('immersive');$('full').setAttribute('aria-pressed','false');$('exit-full').hidden=true;window.dispatchEvent(new Event('resize'));return;}if(document.fullscreenElement)await document.exitFullscreen();else await enterFullscreen(document.documentElement);};
$('full-lab').onclick=()=>enterFullscreen(document.documentElement);
$('exit-full').onclick=async()=>{
  try{if($('visual-screen').classList.contains('immersive'))$('full').click();else if(document.fullscreenElement)await document.exitFullscreen()}
  catch(e){message(e.message)}
};
document.addEventListener('keydown',event=>{if(event.code==='Escape'&&$('visual-screen').classList.contains('immersive')&&!$('library-dialog').open)$('full').click();});
document.addEventListener('fullscreenchange',()=>{
  $('exit-full').hidden=!document.fullscreenElement;$('full').setAttribute('aria-pressed',String(!!document.fullscreenElement));
});
function audioAvailable(){
  if(!context || context.state!=='running')return false;
  if(stream){const track=stream.getAudioTracks()[0];return !!track && track.readyState==='live' && !track.muted;}
  return !!media && !media.paused && !media.ended;
}
let lastAnalysisTime,lastScopePaint=-Infinity,lastMeterLabel=-Infinity,visualTime=0;
function update(p){a.time=p.millis()/1000;a.dt=Math.min(.1,p.deltaTime/1000);if(lastAnalysisTime!==undefined && a.time-lastAnalysisTime>.5)groupEngine.reset();lastAnalysisTime=a.time;const gain=+$('gain').value,live=mode==='live'&&audioAvailable(),remote=mode==='remote'?window.remoteAudio.read():null;let silent=false;
if(mode==='preview'){
 const packet=window.avsPlayer?.read();
 if(packet){
  a.sampleRate=packet.sampleRate;a.binHz=a.sampleRate/wave.length;
  for(let i=0;i<a.spectrum.length;i++){const index=Math.min(2047,Math.floor(i*4096/wave.length));const db=-110+packet.bins[index]/255*110;a.spectrum[i]=Math.max(0,Math.min(1,(db+100)/70))*gain;}
  for(let i=0;i<wave.length;i++){const at=i*packet.wave.length/wave.length,j=Math.floor(at);wave[i]=(packet.wave[j]+(packet.wave[Math.min(packet.wave.length-1,j+1)]-packet.wave[j])*(at-j))*gain;}
  const magnitudes=magnitudeByByte(-110,0);
  for(let i=0;i<2048;i++){const byte=packet.bins[i];detailSpectrum[i]=byte/255*gain;detailMagnitude[i]=magnitudes[byte]*gain;}
 }else{a.spectrum.fill(0);wave.fill(0);detailSpectrum.fill(0);detailMagnitude.fill(0);}
}
else if(mode==='remote'){
const packet=remote;
if(packet){
  a.sampleRate=packet.sampleRate;
  if(wave.length!==packet.wave.length){$('fft').value=String(packet.wave.length);resizeFFT();}
  a.binHz=a.sampleRate/wave.length;
  for(let i=0;i<raw.length;i++)a.spectrum[i]=Math.min(1,packet.bins[i]/255*gain);
  for(let i=0;i<wave.length;i++)wave[i]=Math.max(-1,Math.min(1,packet.wave[i]*gain));
  silent=Math.sqrt(wave.reduce((sum,x)=>sum+x*x,0)/wave.length)<.0001;
  const magnitudes=magnitudeByByte(packet.minDb??-100,packet.maxDb??-30);
  for(let i=0;i<detailSpectrum.length;i++){
    const byte=packet.details[i];detailSpectrum[i]=silent?0:Math.min(1,byte/255*gain);
    detailMagnitude[i]=silent?0:magnitudes[byte]*gain;
  }
  if(silent){a.spectrum.fill(0);wave.fill(0);}
}else{a.spectrum.fill(0);wave.fill(0);detailSpectrum.fill(0);detailMagnitude.fill(0);}
}
else if(live){analyser.smoothingTimeConstant=+$('smooth').value;analyser.getByteFrequencyData(raw);analyser.getFloatTimeDomainData(wave);const rms=Math.sqrt(wave.reduce((sum,x)=>sum+x*x,0)/wave.length);silent=rms<0.0001;if(silent){raw.fill(0);wave.fill(0)}for(let i=0;i<raw.length;i++)a.spectrum[i]=Math.min(1,raw[i]/255*gain);for(let i=0;i<wave.length;i++)wave[i]=Math.max(-1,Math.min(1,wave[i]*gain))}
else if(mode==='demo'){for(let i=0;i<raw.length;i++)a.spectrum[i]=Math.min(1,gain*(.3+.25*Math.sin(i*.03+a.time*3))*Math.exp(-i/raw.length*4)*(.6+.4*Math.sin(a.time*6)));for(let i=0;i<wave.length;i++)wave[i]=Math.sin(i*.04+a.time*5)*(.15+.2*Math.sin(a.time*3))*gain}
else{a.spectrum.fill(0);wave.fill(0)}
a.bass=a.energy(20,250);a.mid=a.energy(250,4000);a.treble=a.energy(4000,16000);a.level=Math.sqrt(wave.reduce((sum,x)=>sum+x*x,0)/wave.length);
if(live){
  detailAnalyser.getByteFrequencyData(detailRaw);if(silent)detailRaw.fill(0);
  const magnitudes=magnitudeByByte(detailAnalyser.minDecibels,detailAnalyser.maxDecibels);
  for(let i=0;i<detailRaw.length;i++){
    const byte=detailRaw[i];detailSpectrum[i]=Math.min(1,byte/255*gain);
    detailMagnitude[i]=magnitudes[byte]*gain;
  }
  a.groups=groupEngine.update(detailSpectrum,a.sampleRate/4096,a.dt,a.time,detailMagnitude);
}else if(mode==='remote'||mode==='preview'){
  a.groups=groupEngine.update(detailSpectrum,a.sampleRate/4096,a.dt,a.time,detailMagnitude);
}else{
  if(mode==='demo')for(let i=0;i<demoMagnitude.length;i++)demoMagnitude[i]=a.spectrum[i]*.03;
  a.groups=groupEngine.update(a.spectrum,a.binHz,a.dt,a.time,mode==='demo'?demoMagnitude:null);
}
a.showHUD=document.body.dataset.mode==='studio';
a.stereo=live?stereoAnalysis.read(gain):remote?.stereo||{available:false};a.features=groupEngine.features();a.music=window.avsMusic?.update(a);window.avsInputs?.update(p,a);
if(!a.showHUD||libraryDialog?.open||a.time-lastScopePaint<1/30)return;lastScopePaint=a.time;
const c=$('scope'),g=c.getContext('2d'),ratio=Math.min(2,window.devicePixelRatio||1);
const w=Math.round(c.clientWidth*ratio),h=Math.round(120*ratio);
if(!w)return;
if(c.width!==w||c.height!==h){c.width=w;c.height=h;}
g.clearRect(0,0,w,h);g.fillStyle='#a9ff64';for(let i=0;i<100;i++){const hz=20*Math.pow(1000,i/99),v=a.spectrum[Math.min(raw.length-1,Math.floor(hz/a.binHz))];g.fillRect(i*w/100,h,Math.max(1,w/100-2),-v*h)}g.strokeStyle='#57baff';g.beginPath();for(let i=0;i<wave.length;i+=8){const x=i/wave.length*w,y=h/2+wave[i]*h*.4;if(!i)g.moveTo(x,y);else g.lineTo(x,y)}g.stroke();if(a.time-lastMeterLabel>=.2){lastMeterLabel=a.time;$('meters').textContent=`${mode.toUpperCase()} · GRAVE ${a.bass.toFixed(2)} · MÉDIO ${a.mid.toFixed(2)} · AGUDO ${a.treble.toFixed(2)} · RMS ${a.level.toFixed(2)} · ${Math.round(p.frameRate())} FPS`;}
}
apply();
if(typeof p5==='undefined')message('Não foi possível carregar p5.js. Confira sua conexão e recarregue.');
else new p5(p=>{
 const stage=$('stage');let targetFps=1000;
 sketch=p;window.avsP5=p;
 p.setup=()=>{
  p.frameRate(targetFps);p.pixelDensity(1);p.createCanvas(Math.max(1,stage.clientWidth),Math.max(1,stage.clientHeight));
  setRenderQuality(p);p.smooth();p.background(0);
  new ResizeObserver(()=>{
   const w=stage.clientWidth,h=stage.clientHeight;
   if(w&&h&&(p.width!==w||p.height!==h)){
    // Keep a paused visual visible when rotating a phone or opening a side panel.
    let frozen;
    if(window.avsPlayer?.visualPaused){frozen=document.createElement('canvas');frozen.width=p.canvas.width;frozen.height=p.canvas.height;frozen.getContext('2d').drawImage(p.canvas,0,0);}
    p.resizeCanvas(w,h,true);resetAutoQuality();
    if(frozen){const ctx=p.drawingContext;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(frozen,0,0,p.canvas.width,p.canvas.height);ctx.restore();frozen.width=frozen.height=0;}
   }
  }).observe(stage);
 };
 p.draw=()=>{
  const desiredFps=libraryDialog?.open?24:1000;
  if(desiredFps!==targetFps){targetFps=desiredFps;p.frameRate(targetFps);slowFrameTime=0;}
  if(window.avsPlayer?.visualPaused)return;
  observeFrameTime(p);setRenderQuality(p);update(p);
  const analysisTime=a.time,analysisDt=a.dt,speed=Number($('visual-speed')?.value)||1;
  visualTime+=analysisDt*speed;a.time=visualTime;a.dt=analysisDt*speed;
  const frameStarted=performance.now(), frameState=state, blending=window.visualTransition.active;
  if(drawCode){try{if(directWebGL&&!blending){a.directWebGL=true;try{drawCode(p,a,state);}finally{a.directWebGL=false;}}else window.visualTransition.render(p,a,()=>{p.push();try{drawCode(p,a,state)}finally{p.pop();}});}catch(e){$('error').textContent=e.stack||e.message;disposeCurrentState();const previous=window.visualTransition.recover();drawCode=previous?.fn||null;state=previous?.state||{};directWebGL=previous?.directWebGL||false;canBlend=previous?.canBlend??true;}}
  if(drawCode&&!blending&&state===frameState&&measuredState===frameState){
   frameRenderSamples.push(performance.now()-frameStarted);
   if(frameRenderSamples.length>120)frameRenderSamples.shift();
   a.renderFrameMs=frameRenderSamples.reduce((sum,ms)=>sum+ms,0)/frameRenderSamples.length;
   a.gpuFrameMs=state.gpuFrameMs;
  }
  measuredState=state;
  a.time=analysisTime;a.dt=analysisDt;
 };
},$('stage'));

// Quality changes rebuild only the current visual, retaining the audio connection.
$('render-quality')?.addEventListener('change',()=>apply());
