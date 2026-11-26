// Portable analysis of the bundled example; no AudioContext is needed for the silent entrance.
(() => {
 class PreviewAnalysis {
  constructor(buffer){
   const h=new DataView(buffer);if(buffer.byteLength<32||h.getUint32(0,true)!==0x31535641)throw Error('Análise inválida');
   this.sampleRate=h.getUint32(4,true);this.fft=h.getUint32(8,true);this.bins=h.getUint32(12,true);this.waveSize=h.getUint32(16,true);this.fps=h.getUint32(20,true);this.frames=h.getUint32(24,true);this.duration=h.getFloat32(28,true);
   this.stride=this.bins+this.waveSize+4;
   if(this.bins!==2048||this.waveSize!==256||this.sampleRate!==48000||this.fps!==12||this.frames<1||!Number.isFinite(this.duration)||this.duration<=0||buffer.byteLength!==32+this.frames*this.stride)throw Error('Análise incompatível');
   this.bytes=new Uint8Array(buffer);this.view=h;this.packet={sampleRate:this.sampleRate,bins:new Float32Array(this.bins),wave:new Float32Array(this.waveSize),rms:0};
  }
  read(seconds){
   const at=Math.max(0,Math.min(this.frames-1,seconds*this.fps)),first=Math.floor(at),next=Math.min(this.frames-1,first+1),mix=at-first;
   const a=32+first*this.stride,b=32+next*this.stride,out=this.packet;
   for(let i=0;i<this.bins;i++)out.bins[i]=this.bytes[a+i]+(this.bytes[b+i]-this.bytes[a+i])*mix;
   for(let i=0;i<this.waveSize;i++){const x=this.view.getInt8(a+this.bins+i),y=this.view.getInt8(b+this.bins+i);out.wave[i]=(x+(y-x)*mix)/127;}
   const x=this.view.getFloat32(a+this.stride-4,true),y=this.view.getFloat32(b+this.stride-4,true);out.rms=x+(y-x)*mix;return out;
  }
 }
 window.PreviewAnalysis=PreviewAnalysis;
})();
