// Only known bundled identifiers enter links; URL data never becomes executable code.
(() => {
 const $=id=>document.getElementById(id);
 const byKey=new Map(),byValue=new Map();
 for(const entry of window.presetLibrary.entries()){
  if(!entry.value.startsWith('file:'))continue;
  const key=entry.value==='file:visual.js'?'visual':entry.value.replace(/^file:presets\//,'').replace(/\.js$/,'');
  byKey.set(key,entry.value);byValue.set(entry.value,key);
 }
 const settings=['visual-speed','visual-brightness','render-quality','preset-seed'];
 const buttons=[$('share-current'),$('share-visual')].filter(Boolean);
 let current=null,resetTimer;
 const read=()=>byKey.get(new URL(location.href).searchParams.get('preset'))||null;
 function restoreSettings(){
  const params=new URL(location.href).searchParams;
  for(const id of settings){
   const field=$(id),value=params.get(id);
   if(!field||value===null||value.length>80)continue;
   if(field.type==='range'&&!Number.isFinite(Number(value)))continue;
   const previous=field.value;field.value=value;
   if(!field.value)field.value=previous;
  }
 }
 function address(){
  const url=new URL(location.href),key=byValue.get(current);
  if(key){
   url.searchParams.set('preset',key);
   for(const id of settings)url.searchParams.set(id,$(id).value);
  }else{
   url.searchParams.delete('preset');
   for(const id of settings)url.searchParams.delete(id);
  }
  return url;
 }
 function sync(){
  const url=address();
  // Shuffle and arrows update in place without flooding browser Back history.
  if(url.href!==location.href)history.replaceState(history.state,'',url.href);
  for(const button of buttons){
   button.disabled=!byValue.has(current);
   button.title=button.disabled?'Escolha um visual integrado para compartilhar.':'Compartilhar visual';
  }
 }
 function status(text){
  if($('share-status'))$('share-status').textContent=text;
  $('share-visual').textContent=text||'Compartilhar';
  clearTimeout(resetTimer);
  if(text)resetTimer=setTimeout(()=>{if($('share-status'))$('share-status').textContent='';$('share-visual').textContent='Compartilhar';},2500);
 }
 async function share(){
  if(!byValue.has(current))return;
  sync();
  const url=address().href;
  const entry=window.presetLibrary.entries().find(item=>item.value===current);
  if(navigator.share){
   try{await navigator.share({title:entry?.name||'putsputs',url});return;}
   catch(error){if(error.name==='AbortError')return;}
  }
  try{await navigator.clipboard.writeText(url);status('Link copiado');}
  catch{window.prompt('Copie o link do visual:',url);}
 }
 for(const button of buttons){button.disabled=true;button.onclick=share;}
 document.addEventListener('avs-preset-loaded',event=>{current=event.detail.value;sync();});
 const clear=()=>{current=null;sync();};
 document.addEventListener('avs-preset-draft',clear);
 document.addEventListener('avs-editor-user-edit',clear);
 $('codefile')?.addEventListener('change',event=>{if(event.target.files?.length)clear();});
 for(const id of settings)$(id)?.addEventListener('change',()=>{if(current)sync();});
 // New-seed applies synchronously in the app, so read the resulting field value.
 $('new-seed')?.addEventListener('click',()=>{if(current)sync();});
 window.addEventListener('popstate',()=>{
  const value=read();if(!value)return;
  restoreSettings();
  $('visual-speed').oninput?.();$('visual-brightness').oninput?.();
  window.presetLibrary.hold();window.presetLibrary.load(value);
 });
 window.PresetLinks={initialPreset:read(),restoreSettings,share};
})();
