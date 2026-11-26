// The library shares one offscreen renderer and warms only cards near the scroll viewport.
(() => {
 const dialog=document.getElementById('library-dialog');
 const cache=new Map(),sourceCache=new Map(),targets=new Map(),visible=new Set();
 const thumbWidth=192,thumbHeight=108,warmFrames=8,previewFps=12;
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let ready,engine,running=false,hover=null,hoverTimer;
 const available=()=>dialog.open&&!document.hidden;
 const nextPaint=()=>new Promise(resolve=>requestAnimationFrame(resolve));
 const waitForFrame=()=>new Promise(resolve=>setTimeout(resolve,1000/previewFps));
 function attachImage(target,url){
  if(!target.el.isConnected)return;
  let img=target.el.querySelector('img');
  if(!img){img=document.createElement('img');img.alt='';img.decoding='async';target.el.prepend(img);}
  img.src=url;target.el.classList.add('has-preview');
 }
 function renderer(){
  if(!ready){
   engine=document.createElement('div');engine.setAttribute('aria-hidden','true');
   engine.style.cssText='position:fixed;left:-10000px;top:0;pointer-events:none';document.body.append(engine);
   ready=new Promise(resolve=>{new p5(p=>{p.setup=()=>{p.pixelDensity(1);p.createCanvas(thumbWidth,thumbHeight);p.noLoop();resolve(p);};},engine);});
  }
  return ready;
 }
 function makeSampler(random){
  const input=typeof a==='undefined'?{}:a;
  const audible=(input.level||0)>.001||Object.values(input.groups||{}).some(g=>g.enabled&&(g.db??-120)>-65);
  const groups=Object.fromEntries(Object.entries(input.groups||{}).map(([key,g])=>[key,{...g}]));
  if(!Object.keys(groups).length)for(let i=0;i<24;i++)groups['f'+i]={low:25*480**(i/24),high:25*480**((i+1)/24),color:'#7edac6',enabled:true,gain:1};
  const bands=Object.entries(groups);
  const spectrum=new Float32Array(audible?input.spectrum.length:1024);
  const waveform=new Float32Array(audible?input.waveform.length:2048);
  const frame={...input,dt:1/previewFps,fps:previewFps,seed:1337,rand:random,groups,waveform,spectrum,
   binHz:input.binHz||48000/2048,renderScale:1,pixelDensity:1,showHUD:false,
   mouse:{inside:false,nx:.5,ny:.5,clicked:false,pressed:false,vx:0,vy:0},keyboard:{down:()=>false,pressed:()=>false},
   clock:input.clock||{hour:12,minute:30,second:0},music:input.music||{energy:.6,trend:0,pulse:.2,hue:190,brightness:.4,volatility:.2,flow:{x:0,y:0}}};
  return (index,live)=>{
   const time=index/previewFps;
   frame.time=frame.elapsed=time;frame.frame=index;
   if(audible){
    if(index===0||live){
     spectrum.set(input.spectrum.subarray(0,spectrum.length));waveform.set(input.waveform.subarray(0,waveform.length));
     for(const [key,band] of bands)Object.assign(band,input.groups?.[key]);
     frame.level=input.level;frame.bass=input.bass;frame.mid=input.mid;frame.treble=input.treble;
    }
   }else{
    for(const [i,[,band]] of bands.entries()){
     band.db=-45+Math.sin(time*2+i*.28)*14;band.magnitude=10**(band.db/20);
     band.level=band.energy=(band.db+59)/28;band.hit=index%12===0;
    }
    for(let i=0;i<waveform.length;i++)waveform[i]=Math.sin(i*.045+time*4)*(.18+.1*Math.sin(time*2));
    for(let i=0;i<spectrum.length;i++)spectrum[i]=(.4+.2*Math.sin(i*.05+time))*Math.exp(-i/200);
    frame.level=.22;frame.bass=.42;frame.mid=.24;frame.treble=.09;
   }
   return frame;
  };
 }
 function source(value){
  if(!sourceCache.has(value)){
   const request=window.presetLibrary.getCode(value).catch(error=>{
    if(sourceCache.get(value)===request)sourceCache.delete(value);
    throw error;
   });
   sourceCache.set(value,request);
  }
  return sourceCache.get(value);
 }
 function eligible(target){return target.el.isConnected&&visible.has(target)&&!target.failed;}
 function savePreview(p,target){
  const url=p.canvas.toDataURL('image/webp',.8);
  cache.set(target.entry.value,url);attachImage(target,url);
 }
 async function render(p,target,live){
  const key=target.entry.value,state={};
  const revision=target.revision;
  const current=()=>available()&&eligible(target)&&revision===target.revision&&
   (live?hover===target:!hover);
  let count=0,seed=1337;
  const random=(lo,hi)=>{
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;
   const unit=seed/4294967296;
   return lo===undefined?unit:hi===undefined?unit*lo:lo+unit*(hi-lo);
  };
  target.el.dataset.loading=String(!cache.has(key));
  try{
   const code=await source(key);
   if(!current())return;
   const draw=new Function('p','a','s',code),sample=makeSampler(random);
   p.resetMatrix();p.colorMode(p.RGB,255);p.background(3,6,12);
   if(live)target.el.append(p.canvas);
   while(current()&&(count<warmFrames||live)){
    p.push();try{p.resetMatrix();draw(p,sample(count,live),state);}finally{p.pop();}
    if(++count===warmFrames&&!cache.has(key)){
     savePreview(p,target);target.el.dataset.loading='false';
    }
    // Yield after each static frame and limit animated hover to twelve frames per second.
    if(count<warmFrames||live)await (live?waitForFrame():nextPaint());
   }
  }catch(error){
   if(revision!==target.revision)return;
   target.failed=true;
   if(hover===target)hover=null;
   target.el.title='Prévia indisponível · selecione para abrir';
   console.warn('Preset preview:',target.entry.name,error.message);
  }finally{
   target.el.dataset.loading='false';
   try{state.dispose?.();}catch{}
   if(live){engine.append(p.canvas);p.canvas.removeAttribute('aria-label');}
  }
 }
 async function pump(){
  if(running||!available()||typeof p5==='undefined')return;
  running=true;
  try{
   let target;
   while(available()){
    if(hover&&!eligible(hover))hover=null;
    target=hover||Array.from(visible).find(item=>eligible(item)&&!cache.has(item.entry.value));
    if(!target)break;
    const p=await renderer();
    await render(p,target,hover===target);
   }
  }finally{running=false;}
 }
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   const target=targets.get(entry.target);
   if(!target)continue;
   if(entry.isIntersecting)visible.add(target);else visible.delete(target);
  }
  pump();
 },{root:dialog,rootMargin:'80px'});
 window.AvsPreviews={
  register(el,entry){
   const target={el,entry,revision:0,failed:false};
   targets.set(el,target);observer.observe(el);
   if(cache.has(entry.value))queueMicrotask(()=>{const url=cache.get(entry.value);if(url)attachImage(target,url);});
   el.addEventListener('pointerenter',event=>{
    if(event.pointerType!=='mouse'||reducedMotion.matches)return;
    clearTimeout(hoverTimer);
    hoverTimer=setTimeout(()=>{if(eligible(target)){hover=target;pump();}},140);
   });
   el.addEventListener('pointerleave',()=>{
    clearTimeout(hoverTimer);
    if(hover===target){hover=null;pump();}
   });
  },
  refresh(){
   for(const [el,target] of targets)if(!el.isConnected){observer.unobserve(el);targets.delete(el);visible.delete(target);}
   pump();
  },
  get rendered(){return cache.size;}
 };
 function stopHover(){clearTimeout(hoverTimer);hover=null;}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopHover();else pump();});
 new MutationObserver(()=>{if(available())pump();else stopHover();}).observe(dialog,{attributes:true,attributeFilter:['open']});
 document.addEventListener('avs-library-changed',()=>{
  for(const key of sourceCache.keys())if(key.startsWith('local:')){sourceCache.delete(key);cache.delete(key);}
  for(const target of targets.values())if(target.entry.value.startsWith('local:')){
   target.revision++;target.failed=false;target.el.querySelector('img')?.remove();target.el.classList.remove('has-preview');
  }
  pump();
 });
})();
