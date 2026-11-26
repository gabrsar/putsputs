// Both renderers keep advancing. Each has its own feedback image during the dissolve.
(() => {
 let active=null;
 const dispose=record=>{if(!record)return;try{const fn=record.state.dispose;record.state.dispose=null;fn?.();}catch(error){console.warn('Transition cleanup:',error.message);}};
 const surface=canvas=>{const layer=document.createElement('canvas');layer.width=canvas.width;layer.height=canvas.height;return layer;};
 function paint(target,source,alpha=1,clear=true){const c=target.getContext('2d');c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;if(clear)c.clearRect(0,0,target.width,target.height);c.globalAlpha=alpha;c.drawImage(source,0,0,target.width,target.height);c.restore();}
 function finish(){if(!active)return;dispose(active.previous);active.old.width=active.old.height=active.next.width=active.next.height=0;active=null;}
 window.visualTransition={
  get active(){return !!active;},
  begin(canvas,previous){
   finish();if(!canvas?.width||!canvas.height){dispose(previous);return;}
   const old=surface(canvas),next=surface(canvas);paint(old,canvas);const ctx=next.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,next.width,next.height);
   active={canvas,old,next,previous,elapsed:0,duration:matchMedia('(prefers-reduced-motion: reduce)').matches?.35:1.8,oldFailed:false};
  },
  render(p,a,drawCurrent){
   const t=active;if(!t){drawCurrent();return;}
   // A resize is harmless: the independent buffers scale on copy, then follow the new canvas.
   paint(t.canvas,t.old);
   if(!t.oldFailed){p.push();try{t.previous.fn(p,a,t.previous.state);}catch(error){t.oldFailed=true;console.warn('Previous preset:',error.message);}finally{p.pop();}}
   if(t.old.width!==t.canvas.width||t.old.height!==t.canvas.height){t.old.width=t.canvas.width;t.old.height=t.canvas.height;t.next.width=t.canvas.width;t.next.height=t.canvas.height;}
   paint(t.old,t.canvas);paint(t.canvas,t.next);
   drawCurrent();paint(t.next,t.canvas);
   t.elapsed+=Math.min(.1,Math.max(0,p.deltaTime/1000));const x=Math.min(1,t.elapsed/t.duration),mix=x*x*(3-2*x);
   paint(t.canvas,t.old);paint(t.canvas,t.next,mix,false);if(x===1)finish();
  },
  recover(){if(!active)return null;const t=active,previous=t.previous;paint(t.canvas,t.old);t.previous=null;finish();return previous;},
  cancel:finish
 };
})();
