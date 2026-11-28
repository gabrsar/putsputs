// Canvas feedback uses 8-bit channels. Tiny alpha fades can round back to the
// same dark value forever; remove that quantization floor before fresh artwork.
(() => {
 const budgets=new WeakMap();
 window.avsDecayHistory=(surface,dt)=>{
  const canvas=surface?.canvas,ctx=surface?.drawingContext;
  if(!canvas||!ctx||typeof ctx.fillRect!=='function')return;
  const budget=(budgets.get(canvas)||0)+Math.max(0,Math.min(.1,Number(dt)||0))*60;
  const steps=Math.floor(budget);budgets.set(canvas,budget-steps);
  if(!steps)return;
  ctx.save();
  try{
   ctx.setTransform(1,0,0,1,0,0);ctx.filter='none';
   // One channel step per 1/60 s, shared across frame rates. Source-over handles
   // bright pixels; color-burn removes the dark floor while leaving zero at zero.
   ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.min(1,steps/255);
   ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.globalCompositeOperation='color-burn';ctx.globalAlpha=1;
   if(ctx.globalCompositeOperation==='color-burn'){
    const level=Math.max(0,255-steps);ctx.fillStyle=`rgb(${level},${level},${level})`;
   }else{
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.min(1,steps/64);ctx.fillStyle='#000';
   }
   ctx.fillRect(0,0,canvas.width,canvas.height);
  }finally{ctx.restore();}
 };
})();
