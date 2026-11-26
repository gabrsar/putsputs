'use strict';
let channel;
try{channel=new BroadcastChannel('avs-audio-v1');}catch{}
let context,stream,source,fft,detail,wave,bins,details,request=0,stereo;
const stateLabel=document.getElementById('state');
function status(){
  const track=stream?.getAudioTracks()[0];
  const active=!!track && track.readyState==='live';
  return {type:'state',active,running:context?.state==='running',muted:!!track?.muted};
}
function announce(){const state=status();channel?.postMessage(state);stateLabel.textContent=state.active?'Captura conectada · motor '+context.state+(state.muted?' · fonte sem áudio':''):'Captura inativa';}
function release(){if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;source?.disconnect();source=null;}
function stop(){request++;release();announce();}
async function start(mic){
  if(!window.isSecureContext){stateLabel.textContent='Abra o site por HTTPS para compartilhar áudio.';return;}
  if(!channel){stateLabel.textContent='A conexão com a janela está indisponível. Compartilhe áudio na página principal.';return;}
  const devices=navigator.mediaDevices;
  if(!(mic?devices?.getUserMedia:devices?.getDisplayMedia)){
    stateLabel.textContent=mic?'Este navegador não oferece acesso ao microfone.':'Use Chrome ou Edge no computador ou abra um arquivo de música.';
    return;
  }
  const id=++request;
  let captured, nextSource;
  try{
    context ||= new AudioContext();
    context.onstatechange=announce;
    const captureRequest=mic?devices.getUserMedia({audio:true}):devices.getDisplayMedia({
      video:{frameRate:{ideal:1,max:1}},audio:{suppressLocalAudioPlayback:false},systemAudio:'include'
    });
    context.resume().catch(()=>{});
    captured=await captureRequest;
    if(id!==request)return;
    const audioTracks=captured.getAudioTracks().filter(track=>track.readyState==='live');
    if(!audioTracks.length)throw Error(mic?'Nenhuma entrada de microfone disponível.':'Escolha uma aba com som e marque “Compartilhar áudio” no seletor.');
    fft ||= context.createAnalyser();detail ||= context.createAnalyser();detail.fftSize=4096;detail.smoothingTimeConstant=.05;detail.minDecibels=-110;detail.maxDecibels=0;
    nextSource=context.createMediaStreamSource(new MediaStream(audioTracks));
    nextSource.connect(fft);nextSource.connect(detail);
    stereo ||= new StereoAnalysis(context);stereo.connect(nextSource);
    release();
    stream=captured;source=nextSource;
    const current=stream;
    for(const track of current.getTracks()){track.onended=()=>{if(stream===current)stop()};track.onmute=announce;track.onunmute=announce;}
    announce();
  }catch(error){
    if(id===request){
      stateLabel.textContent=error.name==='NotAllowedError'?'Compartilhamento cancelado ou bloqueado. Abra o seletor para tentar novamente.':error.message;
    }
  }finally{
    if(captured && stream!==captured){captured.getTracks().forEach(track=>track.stop());nextSource?.disconnect();}
  }
}
if(channel)channel.onmessage=({data})=>{
  if(!data)return;
  if(data.type==='hello'){announce();return;}
  if(data.type==='stop'){stop();return;}
  if(data.type==='resume'){context?.resume().catch(()=>{});return;}
  if(data.type!=='sample')return;
  const state=status();
  if(!state.active){channel.postMessage(state);return;}
  const n=[512,1024,2048,4096,8192].includes(data.fft)?data.fft:2048;
  if(fft.fftSize!==n)fft.fftSize=n;
  fft.smoothingTimeConstant=Math.max(0,Math.min(.98,Number(data.smooth)||0));
  if(!bins||bins.length!==n/2){bins=new Uint8Array(n/2);wave=new Float32Array(n);}
  details ||= new Uint8Array(2048);
  fft.getByteFrequencyData(bins);fft.getFloatTimeDomainData(wave);detail.getByteFrequencyData(details);
  if(!state.running||state.muted){bins.fill(0);wave.fill(0);details.fill(0);}
  channel.postMessage({...state,type:'data',sampleRate:context.sampleRate,minDb:detail.minDecibels,maxDb:detail.maxDecibels,bins,wave,details,stereo:state.running&&!state.muted?stereo.read():{available:false}});
};
document.getElementById('share').onclick=()=>start(false);
document.getElementById('mic').onclick=()=>start(true);
document.getElementById('stop').onclick=stop;
document.getElementById('resume').onclick=()=>context?.resume().catch(error=>{stateLabel.textContent=error.message});
window.addEventListener('pagehide',stop);
announce();
