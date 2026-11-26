// Stage-only idle behavior; never hides an open dialog or keyboard focus.
(() => {
 const stage=document.getElementById('visual-screen');let timer;
 const immersive=()=>document.fullscreenElement===stage||stage.classList.contains('immersive');
 const wake=()=>{stage.classList.remove('ui-idle');clearTimeout(timer);timer=setTimeout(()=>{
   if(immersive()&&!document.querySelector('dialog[open]')&&!(document.activeElement?.matches(':focus-visible')&&document.activeElement.closest('.preset-deck')))stage.classList.add('ui-idle');
 },3200);};
 for(const event of ['pointermove','pointerdown','wheel','touchstart','focusin'])stage.addEventListener(event,wake,{passive:true});
 document.addEventListener('keydown',wake);
 document.addEventListener('fullscreenchange',wake);let wasImmersive=immersive();new MutationObserver(()=>{const next=immersive();if(next!==wasImmersive){wasImmersive=next;wake();}}).observe(stage,{attributes:true,attributeFilter:['class']});
 document.getElementById('preset-random').onclick=()=>window.presetLibrary?.random();
 // Mouse clicks shouldn't pin the controls indefinitely; keyboard focus still keeps them visible.
 stage.addEventListener('pointerup',event=>{if(event.target.closest('button')&&!event.target.closest('input,select'))event.target.closest('button').blur();});
 wake();
})();
