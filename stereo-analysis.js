// Real L/R analysis. Mono preview files remain explicitly marked as unavailable.
class StereoAnalysis {
 constructor(context){this.split=context.createChannelSplitter(2);this.channels=[0,1].map(i=>{const node=context.createAnalyser();node.fftSize=1024;node.smoothingTimeConstant=.15;this.split.connect(node,i);return {node,wave:new Float32Array(1024),spectrum:new Uint8Array(512)};});}
 connect(source){source.connect(this.split);}
 read(gain=1){const data=this.channels.map(c=>{c.node.getFloatTimeDomainData(c.wave);c.node.getByteFrequencyData(c.spectrum);let sum=0;for(const v of c.wave)sum+=v*v;const rms=Math.sqrt(sum/c.wave.length)*gain;const region=(lo,hi)=>{let sum=0,n=0;for(let i=Math.ceil(lo/(c.node.context.sampleRate/1024));i<=Math.min(511,Math.floor(hi/(c.node.context.sampleRate/1024)));i++){sum+=c.spectrum[i]/255;n++;}return Math.min(1,sum/Math.max(1,n)*Math.min(1,rms*12));};return {energy:Math.min(1,rms*3),rms,low:region(25,250),mid:region(250,4000),high:region(4000,16000),waveform:c.wave};});return {available:true,left:data[0],right:data[1]};}
}
window.StereoAnalysis=StereoAnalysis;
