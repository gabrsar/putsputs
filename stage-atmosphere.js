// Fade chrome without hiding open menus or interrupting keyboard editing.
(() => {
 const stage=document.getElementById('visual-screen'),body=document.body;let timer;
 const pin=document.getElementById('pin-ui');let pinned=false;
 try{pinned=localStorage.getItem('putsputs-ui-pinned')==='yes';}catch{}
 function renderPin(){pin.setAttribute('aria-pressed',String(pinned));const label=pinned?'Desafixar interface':'Fixar interface';pin.setAttribute('aria-label',window.PutsI18n?.t(label)??label);pin.title=window.PutsI18n?.t(label)??label;}
 pin.addEventListener('click',()=>{pinned=!pinned;try{localStorage.setItem('putsputs-ui-pinned',pinned?'yes':'no');}catch{}renderPin();wake();});
 document.addEventListener('puts-language-change',renderPin);renderPin();
 const busy=()=>{
  const name=document.getElementById('visual-title'),selection=window.getSelection();
  return document.querySelector('dialog[open]')||!document.getElementById('source-panel').hidden||document.activeElement===name||selection?.anchorNode&&name.contains(selection.anchorNode)||document.activeElement?.matches('input,select,textarea,[contenteditable],.ace_text-input,:focus-visible');
 };
 function wake(){body.classList.remove('chrome-idle');stage.classList.remove('ui-idle');clearTimeout(timer);if(!pinned)timer=setTimeout(rest,4000);}
 function rest(){if(pinned)return;if(busy()){timer=setTimeout(rest,1000);return;}body.classList.add('chrome-idle');}
 for(const event of ['pointermove','pointerdown','wheel','touchstart','focusin','keydown','click'])document.addEventListener(event,wake,{passive:true});
 document.addEventListener('selectionchange',wake);
 document.addEventListener('fullscreenchange',wake);
 for(const id of ['source-toggle','full']){
  const button=document.getElementById(id),key='putsputs-hint-used-'+id;
  let used=false;try{used=localStorage.getItem(key)==='yes';}catch{}
  if(!used)button.classList.add('discovery-glow');
  button.addEventListener('click',()=>{button.classList.remove('discovery-glow');try{localStorage.setItem(key,'yes');}catch{}},{once:true});
 }
 // Click events also cover buttons activated by application shortcuts.
 const feedbackTimers=new WeakMap();
 document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||button.disabled)return;
  wake();button.classList.remove('action-feedback');
  void button.offsetWidth;
  button.classList.add('action-feedback');
  clearTimeout(feedbackTimers.get(button));
  feedbackTimers.set(button,setTimeout(()=>button.classList.remove('action-feedback'),460));
 },true);
 // A single frame updates only nearby visible controls, with no layout mutations.
 const hoverPointer=matchMedia('(hover:hover) and (pointer:fine)');
 let lightFrame=0,pointerPosition;
 const lit=new Set();
 function clearLight(){for(const element of lit){element.style.removeProperty('--proximity');element.classList.remove('cursor-near');}lit.clear();document.querySelectorAll('.cursor-lit').forEach(element=>element.classList.remove('cursor-lit'));}
 function paintLight(){
  lightFrame=0;if(!pointerPosition||!hoverPointer.matches)return;
  const {x,y}=pointerPosition;
  for(const panel of document.querySelectorAll('.app-header,.preset-deck,.side-panel,#source-panel,dialog[open]')){
   const r=panel.getBoundingClientRect();
   const near=r.width&&r.height&&!panel.hidden&&x>=r.left-200&&x<=r.right+200&&y>=r.top-200&&y<=r.bottom+200;
   panel.classList.toggle('cursor-lit',Boolean(near));
   if(near){panel.style.setProperty('--cursor-x',(x-r.left)+'px');panel.style.setProperty('--cursor-y',(y-r.top)+'px');}
  }
  const next=new Set();
  for(const element of document.querySelectorAll('button:not(:disabled),.language-control,select:not(:disabled),input:not([type=hidden]):not(:disabled)')){
   const r=element.getBoundingClientRect();if(!r.width||!r.height||!element.checkVisibility())continue;
   const distance=Math.hypot(Math.max(r.left-x,0,x-r.right),Math.max(r.top-y,0,y-r.bottom));
   if(distance>=220)continue;
   const strength=(1-distance/220)**1.6;
   element.style.setProperty('--proximity',strength.toFixed(3));element.style.setProperty('--edge-light-x',((x-(r.left+r.width/2))/Math.max(r.width,1)*2).toFixed(2)+'px');element.style.setProperty('--edge-light-y',((y-(r.top+r.height/2))/Math.max(r.height,1)*2).toFixed(2)+'px');element.classList.add('cursor-near');next.add(element);
  }
  for(const element of lit)if(!next.has(element)){element.style.removeProperty('--proximity');element.classList.remove('cursor-near');}
  lit.clear();for(const element of next)lit.add(element);
 }
 document.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||!hoverPointer.matches)return;pointerPosition={x:event.clientX,y:event.clientY};if(!lightFrame)lightFrame=requestAnimationFrame(paintLight);},{passive:true});
 document.documentElement.addEventListener('pointerleave',()=>{pointerPosition=null;if(lightFrame)cancelAnimationFrame(lightFrame);lightFrame=0;clearLight();});
 window.addEventListener('blur',clearLight);
 hoverPointer.addEventListener('change',clearLight);
 document.getElementById('preset-random').onclick=()=>window.presetLibrary?.random();
 wake();
})();
