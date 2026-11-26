// Real preset thumbnails use one isolated renderer, not dozens of simultaneous WebGL contexts.
(() => {
 const cache=new Map(),sourceCache=new Map(),pending=new Map(),targets=new Map();
 let mini,ready,engine,running=false,epoch=0,hover=null;
 const dialog=()=>document.getElementById('library-dialog');
 const tick=()=>new Promise(resolve=>requestAnimationFrame(resolve));
 const available=()=>dialog()?.open&&!document.hidden;
 function attachImage(target,url){
  if(!target.el.isConnected)return;
  let img=target.el.querySelector('img');if(!img){img=document.createElement('img');img.alt='';img.decoding='async';target.el.prepend(img);}
  img.src=url;target.el.classList.add('has-preview');target.el.dataset.loading='false';
 }
 function renderer(){
  if(ready)return ready;
  engine=document.createElement('div');engine.setAttribute('aria-hidden','true');engine.style.cssText='position:fixed;left:-10000px;top:0;width:256px;height:144px;pointer-events:none';document.body.append(engine);
  ready=new Promise(resolve=>{new p5(p=>{mini=p;p.setup=()=>{p.createCanvas(256,144);p.pixelDensity(1);p.noLoop();resolve(p);};},engine);});return ready;
 }
 function sample(time,random){
  const input=typeof a==='undefined'?{}:a,audible=(input.level||0)>.001||Object.values(input.groups||{}).some(g=>g.enabled&&(g.db??-120)>-65);
  let groups=Object.fromEntries(Object.entries(input.groups||{}).map(([key,g])=>[key,{...g}]));
  if(!Object.keys(groups).length)groups=Object.fromEntries(Array.from({length:24},(_,i)=>['f'+i,{low:25*480**(i/24),high:25*480**((i+1)/24),color:'#7edac6',enabled:true,gain:1}]));
  if(!audible)Object.values(groups).forEach((g,i)=>{g.db=-45+Math.sin(time*2+i*.28)*14;g.magnitude=Math.pow(10,g.db/20);g.hit=Math.floor(time*8)%15===0;});
  const waveform=audible?Float32Array.from(input.waveform||[]):Float32Array.from({length:1024},(_,i)=>Math.sin(i*.045+time*4)*(.18+.1*Math.sin(time*2)));
  return {...input,time,elapsed:time,dt:1/24,frame:Math.round(time*24),fps:24,seed:1337,rand:random,groups,waveform,
   spectrum:audible?Float32Array.from(input.spectrum||[]):Float32Array.from({length:1024},(_,i)=>(.4+.2*Math.sin(i*.05+time))*Math.exp(-i/200)),binHz:input.binHz||48000/2048,
   level:audible?input.level:.22,renderScale:1,pixelDensity:1,showHUD:false,
   mouse:{inside:false,nx:.5,ny:.5,clicked:false,pressed:false,vx:0,vy:0},keyboard:{down:()=>false,pressed:()=>false},
   clock:input.clock||{hour:12,minute:30,second:0},music:input.music||{energy:.6,trend:0,pulse:.2,hue:190,brightness:.4,volatility:.2,flow:{x:0,y:0}}};
 }
 async function source(value){if(!sourceCache.has(value))sourceCache.set(value,window.presetLibrary.getCode(value).catch(error=>{sourceCache.delete(value);throw error;}));return sourceCache.get(value);}
 async function pump(){
  if(running||!available())return;running=true;
  try{
   const p=await renderer();
   while(available()&&(pending.size||hover)){
    let target=hover||pending.values().next().value;if(!target)break;pending.delete(target.entry.value);
    if(!target.el.isConnected){if(hover===target)hover=null;continue;}
    const ticket=epoch,state={};let count=0,seed=1337;
    const random=(lo,hi)=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;const unit=seed/4294967296;return lo===undefined?unit:hi===undefined?unit*lo:lo+unit*(hi-lo);};
    target.el.dataset.loading='true';
    try{
     const draw=new Function('p','a','s',await source(target.entry.value));p.resetMatrix();p.colorMode(p.RGB,255);p.background(3,6,12);
     if(hover===target)target.el.append(p.canvas);
     while(available()&&target.el.isConnected&&ticket===epoch&&(count<24||hover===target)){
      p.push();try{p.resetMatrix();draw(p,sample(count/24,random),state);}finally{p.pop();}count++;
      if(count===24){const url=p.canvas.toDataURL('image/webp',.82);cache.set(target.entry.value,url);attachImage(target,url);}
      await tick();
     }
     if(count>24&&target.el.isConnected){const url=p.canvas.toDataURL('image/webp',.82);cache.set(target.entry.value,url);attachImage(target,url);}
     if(count<24&&!cache.has(target.entry.value)&&target.el.isConnected)pending.set(target.entry.value,target);
    }catch(error){target.el.dataset.loading='false';target.el.title='Prévia indisponível · selecione para abrir';console.warn('Preset preview:',target.entry.name,error.message);}
    finally{try{state.dispose?.();}catch{}engine.append(p.canvas);p.canvas.removeAttribute('aria-label');}
   }
  }finally{running=false;}
 }
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){const target=targets.get(entry.target);if(target&&!cache.has(target.entry.value)){pending.delete(target.entry.value);const rest=[...pending];pending.clear();pending.set(target.entry.value,target);for(const pair of rest)pending.set(...pair);}}pump();},{rootMargin:'160px'});
 window.AvsPreviews={
  register(el,entry){
   const target={el,entry};targets.set(el,target);observer.observe(el);
   if(cache.has(entry.value))queueMicrotask(()=>attachImage(target,cache.get(entry.value)));else pending.set(entry.value,target);
   el.addEventListener('pointerenter',()=>{hover=target;epoch++;pump();});
   el.addEventListener('pointerleave',()=>{if(hover===target){hover=null;epoch++;pump();}});
  },
  refresh(){for(const [el,target]of targets)if(!el.isConnected){observer.unobserve(el);targets.delete(el);if(pending.get(target.entry.value)===target)pending.delete(target.entry.value);}pump();},
  get rendered(){return cache.size;}
 };
 function stop(){hover=null;epoch++;}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else pump();});
 new MutationObserver(()=>{if(available())pump();else stop();}).observe(dialog(),{attributes:true,attributeFilter:['open']});
 document.addEventListener('avs-library-changed',()=>{for(const key of cache.keys())if(key.startsWith('local:')){cache.delete(key);sourceCache.delete(key);}});
})();
