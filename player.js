(() => {
 const tracks={cipher:{name:'Cipher',duration:231.262},'local-forecast':{name:'Local Forecast',duration:165.2},'dream-culture':{name:'Dream Culture',duration:214.2}};
 let preview,clock=performance.now(),position=0,paused=false,muted=true,volume=.4,kind='none',title='',switching=false;
 let visualPaused=false,starting=false,loadingPreview=false,cancelPending;
 const icon=name=>'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+name+'"/></svg>';
 const duration=()=>kind==='preview'?preview?.duration||tracks.cipher.duration:media&&Number.isFinite(media.duration)?media.duration:0;
 const time=()=>kind==='preview'?Math.min(duration(),position+(paused?0:(performance.now()-clock)/1000)):media?.currentTime||0;
 function pausedNow(){return kind==='preview'?paused:media?media.paused:visualPaused;}
 function gain(){if(outputGain)outputGain.gain.setTargetAtTime(muted?0:volume,context.currentTime,.05);}
 function updateUI(){
  const remote=mode==='remote'||!!stream;document.body.dataset.externalAudio=String(remote);const canSeek=kind==='preview'||!!media,t=time(),end=duration();
  $('track-title').textContent=title||(mode==='remote'?'Áudio compartilhado':stream?(a.captureKind==='system'?'Áudio do computador':'Microfone'):mode==='demo'?'Sinal sintético':'Sem áudio');
  $('track-credit').textContent=kind==='preview'||kind==='example'?'Kevin MacLeod · CC BY 4.0':remote?'O som continua na fonte original':kind==='file'?'Arquivo do seu computador':'';
  $('source-label').textContent=kind==='preview'||kind==='example'?'♫ Música de exemplo':kind==='file'?'♫ Seu arquivo':remote?'♫ Áudio de aba ou do computador':'♫ Escolher áudio';
  $('unmute-stage').hidden=!(muted&&(kind==='preview'||kind==='example'||kind==='file'));
  $('music-mute').disabled=remote||(!media&&kind!=='preview');$('music-volume').disabled=remote;
  $('music-mute').innerHTML=icon(muted?'mute':'sound');$('music-mute').setAttribute('aria-label',muted?'Ligar som':'Silenciar');
  $('music-play').innerHTML=icon(pausedNow()?'play':'pause');$('music-play').setAttribute('aria-label',remote?(visualPaused?'Retomar animação':'Pausar animação'):(pausedNow()?'Retomar música':'Pausar música'));
  $('music-seek').disabled=!canSeek||starting;$('music-seek').max=String(end||1);if(document.activeElement!==$('music-seek'))$('music-seek').value=String(t);
  $('music-time').textContent=Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
  $('playback-status').textContent=starting||loadingPreview?'Carregando…':pausedNow()?'Pausado':kind==='none'&&!remote&&mode!=='demo'?'Sem áudio':muted&&!remote?'Sem som':remote?'Ao vivo':'Tocando';
  document.body.dataset.visualPaused=String(visualPaused);
 }
 function onDisconnect(){cancelPending?.();cancelPending=null;kind='none';preview=null;position=0;paused=false;visualPaused=false;title='';starting=false;loadingPreview=false;switching=false;}
 async function liveExample(key,seek=0,keepMuted=false){
  if(!tracks[key])return;
  disconnect();const ticket=generation;kind='example';title=tracks[key].name;muted=keepMuted;starting=true;updateUI();
  try{
   await init();if(ticket!==generation)return;gain();
   const element=new Audio();media=element;element.preload='auto';element.loop=true;
   source=context.createMediaElementSource(element);source.connect(analyser);source.connect(detailAnalyser);stereoAnalysis.connect(source);source.connect(outputGain);
   const ready=new Promise((resolve,reject)=>{cancelPending=()=>reject(Error('Reprodução cancelada'));element.addEventListener('loadedmetadata',resolve,{once:true});element.addEventListener('error',()=>reject(Error('Arquivo indisponível')),{once:true});});
   element.src='./assets/audio/'+key+'.mp3';element.load();await ready;cancelPending=null;if(ticket!==generation)return;
   element.currentTime=Math.min(seek,Math.max(0,element.duration-.1));await element.play();if(ticket!==generation)return;
   mode='live';starting=false;message('');updateUI();
   element.onerror=()=>{if(ticket===generation){disconnect();message('Não foi possível tocar. Escolha outro exemplo.');updateUI();}};
  }catch(error){if(ticket===generation){disconnect();message('Não foi possível tocar: '+error.message);updateUI();}}
 }
 async function startPreview(){
  if(sessionStorage.getItem('avs-persistent-audio')==='yes')return;
  disconnect();const ticket=generation;muted=true;kind='preview';title=tracks.cipher.name;mode='demo';loadingPreview=true;updateUI();
  try{
   const response=await fetch('./assets/audio/cipher-analysis.bin.gz');if(!response.ok)throw Error('Análise indisponível');
   const data=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
   if(ticket!==generation)return;preview=new PreviewAnalysis(data);position=0;clock=performance.now();loadingPreview=false;mode='preview';groupEngine.reset();message('');updateUI();
  }catch(error){if(ticket===generation){loadingPreview=false;message('Prévia visual · clique em Ligar som para ouvir o exemplo.');updateUI();}}
 }
 async function unmute(){
  if(starting)return;
  if(kind==='preview'){const t=time();await liveExample('cipher',t);return;}
  if(media){muted=false;await init();gain();if(media.paused)await media.play();visualPaused=false;message('');updateUI();}
 }
 async function toggle(){
  if(starting)return;
  if(kind==='preview'){
   position=time();paused=!paused;clock=performance.now();visualPaused=paused;
   if(position>=duration()){position=0;paused=false;visualPaused=false;}
  }else if(media){
   try{if(media.paused){await context.resume();await media.play();visualPaused=false;}else{media.pause();visualPaused=true;}}catch(error){message('Não foi possível retomar: '+error.message);}
  }else{visualPaused=!visualPaused;}
  updateUI();
 }
 $('play-example').onclick=()=>{liveExample($('example-track').value);$('source-panel').hidden=true;$('source-toggle').setAttribute('aria-expanded','false');};
 $('music-play').onclick=toggle;
 $('music-mute').onclick=async()=>{if(muted){try{await unmute();}catch(error){message(error.message)}}else{muted=true;gain();updateUI();}};
 $('unmute-stage').onclick=event=>{event.stopPropagation();unmute().catch(error=>message(error.message));};
 let pointer;
 $('stage').addEventListener('pointerdown',event=>{pointer={x:event.clientX,y:event.clientY};});
 $('stage').addEventListener('pointerup',event=>{if(pointer&&Math.hypot(event.clientX-pointer.x,event.clientY-pointer.y)<6&&muted)unmute().catch(error=>message(error.message));pointer=null;});
 $('music-volume').oninput=()=>{volume=+$('music-volume').value;if(muted&&volume>0)unmute().catch(error=>message(error.message));gain();};
 $('music-seek').oninput=()=>{const value=+$('music-seek').value;if(kind==='preview'){position=value;clock=performance.now();}else if(media&&Number.isFinite(media.duration))media.currentTime=value;window.avsMusic?.reset();groupEngine.reset();};
 window.avsPlayer={
  onDisconnect, toggle, unmute, startPreview,
  get visualPaused(){return visualPaused;},get isPaused(){return pausedNow();},
  fileStarted(name){kind='file';title=name;muted=false;visualPaused=false;gain();updateUI();},
  read(){if(!preview||kind!=='preview')return null;if(time()>=duration()){position=0;clock=performance.now();groupEngine.reset();}return preview.read(time());},
  refresh:updateUI
 };
 setInterval(updateUI,250);updateUI();startPreview();
})();
