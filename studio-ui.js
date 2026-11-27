(() => {
 const $=id=>document.getElementById(id),body=document.body;
 const sampleCredits=$('sample-credits');if(sampleCredits)for(const track of Object.values(window.PutsTracks||{})){const row=document.createElement('li'),link=document.createElement('a');link.href=track.source;link.textContent=track.name+' — '+track.author;const license=document.createElement('small');if(track.licenseUrl){const terms=document.createElement('a');terms.href=track.licenseUrl;terms.textContent=track.license;license.append(terms);}else license.textContent=track.license;row.append(link,license);sampleCredits.append(row);}
 const categories={organic:'Orgânico',geometry:'Geometria',worlds:'Mundos',lounge:'Lounge',science:'Ciência',classic:'AVS',local:'Seus presets'};
 const palette={organic:'#ba8bc9',geometry:'#84b4ad',worlds:'#b6c880',lounge:'#cc906c',science:'#8fa3cf',classic:'#ac9ac5',local:'#a3be83'};
 let favorites=new Set(),cards=new Map(),dirty=false,draftTimer;
 try{favorites=new Set(JSON.parse(localStorage.getItem('avs-favorites-v1')||'[]'));}catch{}
 const icon=name=>'<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+name+'"/></svg>';
 function category(entry){if(entry.value.startsWith('local:'))return 'local';if(/avs-/i.test(entry.value))return 'classic';if(/fractal|lorenz|lissajous/i.test(entry.value))return 'science';if(/wine|negroni|waiting-room/i.test(entry.value))return 'lounge';if(/hyperdrive|terrain|matrix|doom|visual.js/i.test(entry.value))return 'worlds';if(/aurora|mycelium|psychedelic|polar|permanent/i.test(entry.value))return 'organic';return 'geometry';}
 const title=name=>name.replace(/^★\s*/,'').replace(/ · visual\.js$/,'');
 function setMode(value){
  const next=['discover','play','studio'].includes(value)?value:'discover';
  body.dataset.mode=next;$('play-panel').hidden=next!=='play';$('code-panel').hidden=next!=='studio';
  document.querySelectorAll('[data-mode-switch]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.modeSwitch===next)));
  if(next==='studio'){window.presetLibrary.hold();$('watch-script').checked=false;}
  try{localStorage.setItem('avs-palco-mode',next);}catch{}window.dispatchEvent(new Event('resize'));
 }
 document.querySelectorAll('[data-mode-switch]').forEach(b=>b.onclick=()=>setMode(b.dataset.modeSwitch));
 document.querySelectorAll('[data-close-panel]').forEach(b=>b.onclick=()=>{setMode('discover');document.querySelector('[data-mode-switch=discover]').focus();});
 let sourceAnchor=$('track-picker');
 function placeSource(){const panel=$('source-panel');if(panel.hidden)return;const r=sourceAnchor.getBoundingClientRect(),gap=8,edge=8;const w=Math.min(470,innerWidth-edge*2);panel.style.width=w+'px';panel.style.left=Math.max(edge,Math.min(r.left,innerWidth-w-edge))+'px';panel.style.right='auto';const below=innerHeight-r.bottom-gap-edge,above=r.top-gap-edge;const down=below>=Math.min(panel.scrollHeight,260)||below>=above;panel.style.maxHeight=Math.max(100,down?below:above)+'px';panel.style.top=(down?r.bottom+gap:Math.max(edge,r.top-gap-panel.offsetHeight))+'px';}
 function sourcePanel(open,anchor){if(anchor)sourceAnchor=anchor;if(!open&&$('source-panel').contains(document.activeElement))sourceAnchor.focus();$('source-panel').hidden=!open;$('source-toggle').setAttribute('aria-expanded',String(open));$('track-picker').setAttribute('aria-expanded',String(open));if(open)placeSource();}
 for(const id of ['source-toggle','track-picker'])$(id).onclick=()=>sourcePanel($('source-panel').hidden||sourceAnchor!==$(id),$(id));$('source-close').onclick=()=>sourcePanel(false);
 window.addEventListener('resize',placeSource);document.addEventListener('puts-language-change',()=>requestAnimationFrame(placeSource));
 $('about-toggle').onclick=()=>{sourcePanel(false);$('about-dialog').showModal();};$('about-close').onclick=()=>$('about-dialog').close();
 $('about-dialog').addEventListener('click',e=>{if(e.target!==$('about-dialog'))return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();});
 document.querySelectorAll('[data-about-tab]').forEach(button=>button.onclick=()=>{document.querySelectorAll('[data-about-tab]').forEach(tab=>tab.setAttribute('aria-pressed',String(tab===button)));document.querySelectorAll('[data-about-panel]').forEach(panel=>panel.hidden=panel.dataset.aboutPanel!==button.dataset.aboutTab);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')sourcePanel(false);});
 document.addEventListener('pointerdown',e=>{if(!$('source-panel').hidden&&!e.target.closest('#source-panel,#source-toggle,#track-picker'))sourcePanel(false);});
 $('examples-tab').onclick=()=>$('example-track').focus();
 $('library-toggle').onclick=()=>{$('library-dialog').showModal();};
 $('library-close').onclick=()=>$('library-dialog').close();
 $('library-dialog').addEventListener('click',event=>{if(event.target===$('library-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close();}});
 $('deck-prev').onclick=()=>$('preset-prev').click();$('deck-next').onclick=()=>$('preset-next').click();
 $('preset-hold').onclick=()=>{if(window.presetLibrary.shuffling)window.presetLibrary.hold();else $('shuffle-presets').click();};
 function sequence(){const running=window.presetLibrary.shuffling;$('preset-hold').textContent=running?'Ⅱ Pausar troca':'▶ Retomar troca';$('preset-hold').setAttribute('aria-label',running?'Pausar troca de visuais':'Retomar troca de visuais');$('preset-hold').setAttribute('aria-pressed',String(!running));$('sequence-state').textContent=running?'Troca automática':'Visual fixado';}
 document.addEventListener('avs-sequence-changed',sequence);
 // Capture before preset-specific listeners: app shortcuts never reach the camera or scripts.
 document.addEventListener('keydown',event=>{
  if(event.repeat||event.ctrlKey||event.altKey||event.metaKey||event.shiftKey||event.target.closest('button,a,summary,input,textarea,select,[contenteditable],.ace_editor')||$('library-dialog').open||$('capture-guide').open||$('about-dialog').open)return;
  const target={ArrowLeft:'deck-prev',ArrowRight:'deck-next',KeyF:'full',Space:'preset-hold'}[event.code];
  if(target){event.preventDefault();event.stopImmediatePropagation();$(target).click();}
 },true);
 let theme='night';try{theme=localStorage.getItem('avs-theme')||'night';}catch{}
 function setTheme(value){theme=value==='day'?'day':'night';body.dataset.theme=theme;$('theme-toggle').setAttribute('aria-pressed',String(theme==='day'));$('theme-toggle').setAttribute('aria-label',theme==='day'?'Ativar modo noite':'Ativar modo dia');document.querySelector('meta[name="theme-color"]').content=theme==='day'?'#e5e9ee':'#151820';try{localStorage.setItem('avs-theme',theme);}catch{}}
 $('theme-toggle').onclick=()=>setTheme(theme==='day'?'night':'day');setTheme(theme);
 function favorite(value){if(!value)return;if(favorites.has(value))favorites.delete(value);else favorites.add(value);try{localStorage.setItem('avs-favorites-v1',JSON.stringify([...favorites]));}catch{}renderLibrary();updateSelected();}
 $('favorite-preset').onclick=()=>favorite($('preset').value);
 function renderLibrary(){
  const entries=window.presetLibrary.entries(),query=$('preset-search').value.toLocaleLowerCase(),filter=$('preset-category').value;
  $('preset-count').textContent=entries.length;$('enabled-count').textContent=entries.filter(e=>e.enabled).length+' de '+entries.length+' na sessão';
  const fragment=document.createDocumentFragment();cards.clear();let count=0;
  for(const entry of entries){
   const family=category(entry);if(filter==='favorites'&&!favorites.has(entry.value))continue;if(!['all','favorites'].includes(filter)&&family!==filter)continue;if(query&&!((entry.name+' '+entry.text+' '+(window.PutsI18n?.t(title(entry.name))||'')+' '+(window.PutsI18n?.t(entry.text)||'')).toLocaleLowerCase().includes(query)))continue;
   const card=document.createElement('article');card.className='preset-card';card.dataset.active=String(entry.value===$('preset').value);card.dataset.enabled=String(entry.enabled);
   const pick=document.createElement('button');pick.className='preview-pick';pick.setAttribute('aria-label','Ver '+entry.name);pick.title=entry.text;
   const art=document.createElement('div');art.className='preset-art';art.style.setProperty('--art-color',palette[family]);art.setAttribute('aria-hidden','true');window.AvsPreviews?.register(art,entry);
   const name=document.createElement('span');name.className='preset-card-name';if(entry.value.startsWith('local:'))name.setAttribute('data-i18n-skip','');name.textContent=title(entry.name);
   const tag=document.createElement('span');tag.className='preset-card-tag';tag.textContent=categories[family];pick.append(art,name,tag);
   pick.onclick=()=>{window.presetLibrary.load(entry.value);$('library-dialog').close();};
   const label=document.createElement('label');label.className='preset-enable';const check=document.createElement('input');check.type='checkbox';check.checked=entry.enabled;check.setAttribute('aria-label','Incluir '+entry.name+' na sessão');check.onchange=()=>window.presetLibrary.setEnabled(entry.value,check.checked);label.append(check,document.createTextNode('Na sessão'));
   const heart=document.createElement('button');heart.className='preset-favorite';heart.innerHTML=icon('heart');heart.setAttribute('aria-label','Favoritar '+entry.name);heart.setAttribute('aria-pressed',String(favorites.has(entry.value)));heart.onclick=()=>favorite(entry.value);
   card.append(pick,label,heart);fragment.append(card);cards.set(entry.value,card);count++;
  }
  $('preset-cards').replaceChildren(fragment);$('library-empty').hidden=count>0;window.AvsPreviews?.refresh();
 }
 function updateSelected(){
  const selected=window.presetLibrary.entries().find(e=>e.value===$('preset').value);$('favorite-preset').disabled=!selected;
  $('favorite-preset').setAttribute('aria-pressed',String(favorites.has($('preset').value)));
  if(!selected)return;$('visual-title').toggleAttribute('data-i18n-skip',selected.value.startsWith('local:'));$('visual-title').textContent=title(selected.name);$('visual-family').textContent=categories[category(selected)].toUpperCase();
  for(const [value,card]of cards)card.dataset.active=String(value===selected.value);
 }
 $('preset-search').oninput=renderLibrary;$('preset-category').onchange=renderLibrary;
 $('presets-enable-all').onclick=()=>window.presetLibrary.setAllEnabled(true);$('presets-disable-all').onclick=()=>window.presetLibrary.setAllEnabled(false);
 document.addEventListener('avs-library-changed',renderLibrary);
 document.addEventListener('puts-language-change',()=>{renderLibrary();updateSelected();});
 document.addEventListener('avs-preset-loaded',event=>{dirty=false;clearTimeout(draftTimer);updateSelected();try{localStorage.setItem('avs-last-preset',event.detail.value);}catch{}if(body.dataset.mode==='studio')$('watch-script').checked=false;});
 document.addEventListener('avs-preset-draft',()=>{$('visual-title').textContent='Novo preset';$('visual-family').textContent='SEU EXPERIMENTO';$('favorite-preset').disabled=true;stashDraft();});
 $('open-create').onclick=()=>{$('library-dialog').close();setMode('studio');$('local-new').click();};
 $('vary-visual').onclick=()=>$('new-seed').click();
 $('visual-speed').oninput=()=>$('motion-value').textContent=Number($('visual-speed').value).toFixed(2)+'×';
 $('visual-brightness').oninput=()=>{const value=+$('visual-brightness').value;body.style.setProperty('--visual-brightness',value);$('brightness-value').textContent=Math.round(value*100)+'%';};
 $('reset-look').onclick=()=>{$('visual-speed').value='1';$('visual-brightness').value='1';$('visual-speed').oninput();$('visual-brightness').oninput();};
 $('gain').addEventListener('input',()=>$('gain-value').textContent=Number($('gain').value).toFixed(1)+'×');$('smooth').addEventListener('input',()=>$('smooth-value').textContent=Math.round(+$('smooth').value*100)+'%');
 const updateLog=()=>$('log-control').hidden=$('amplitude-scale').value!=='log';$('amplitude-scale').addEventListener('change',updateLog);updateLog();
 function stashDraft(){try{localStorage.setItem('avs-draft-v1',JSON.stringify({code:codeEditor.getValue(),name:$('local-preset-name').value,seed:$('preset-seed').value}));$('draft-state').textContent='Rascunho guardado neste navegador';$('recover-draft').hidden=false;}catch{$('draft-state').textContent='Sem espaço para guardar rascunho. Exporte seu código.';}}
 document.addEventListener('avs-editor-user-edit',()=>{dirty=true;clearTimeout(draftTimer);draftTimer=setTimeout(stashDraft,350);});
 window.addEventListener('pagehide',()=>{if(dirty)stashDraft();});
 $('recover-draft').onclick=()=>{try{const d=JSON.parse(localStorage.getItem('avs-draft-v1'));if(!d||typeof d.code!=='string')return;window.presetLibrary.pause();$('preset').value='';codeEditor.setValue(d.code);$('local-preset-name').value=d.name||'Rascunho';$('preset-seed').value=d.seed||'1337';apply();document.dispatchEvent(new Event('avs-preset-draft'));}catch{$('draft-state').textContent='Não foi possível recuperar este rascunho.';}};
 try{$('recover-draft').hidden=!localStorage.getItem('avs-draft-v1');}catch{}
 let fps=60;setInterval(()=>{fps+=(Math.max(0,a.fps||0)-fps)*.25;$('fps-pill').textContent=Math.round(fps)+' FPS'+(Number.isFinite(a.renderFrameMs)?' · CPU '+a.renderFrameMs.toFixed(2)+' ms':'')+(Number.isFinite(a.gpuFrameMs)?' · GPU '+a.gpuFrameMs.toFixed(2)+' ms':'');$('visual-error').hidden=!$('error').textContent.trim();},400);
 let initial='discover';try{initial=localStorage.getItem('avs-palco-mode')||'discover';}catch{}
 setMode(initial);renderLibrary();updateSelected();
 const sharedParams=new URLSearchParams(location.search);
 const bundled=new Map(window.presetLibrary.entries().filter(entry=>entry.value.startsWith('file:')).map(entry=>[entry.value.replace(/^file:presets\//,'').replace(/\.js$/,''),entry.value]));
 const sharedPreset=bundled.get(sharedParams.get('preset'));
 if(sharedPreset?.startsWith('file:presets/shader-laser'))$('fps-pill').classList.remove('studio-only');
 const settings=['visual-speed','visual-brightness','render-quality','preset-seed'];
 if(sharedPreset){
  for(const id of settings){
   const value=sharedParams.get(id);
   if(value!==null&&value.length<=80){const field=$(id);const previous=field.value;field.value=value;if(!field.value)field.value=previous;}
  }
  $('visual-speed').oninput();
  $('visual-brightness').oninput();
 }
 $('share-visual').onclick=async()=>{
  const key=[...bundled].find(([,value])=>value===$('preset').value)?.[0];
  if(!key){window.prompt('Escolha um visual integrado para compartilhar.');return;}
  const url=new URL(location.pathname,location.origin);
  url.searchParams.set('preset',key);
  if(key==='shader-laser'&&sharedParams.get('renderer')==='webgl')url.searchParams.set('renderer','webgl');
  for(const id of settings)url.searchParams.set(id,$(id).value);
  try{await navigator.clipboard.writeText(url.href);$('share-visual').textContent='Link copiado';}
  catch{window.prompt('Copie o link do visual:',url.href);}
 };
 $('library-dialog').addEventListener('close',()=>{$('share-visual').textContent='Compartilhar';});
 let remembered='file:presets/moire-fluid.js';
 try{const saved=localStorage.getItem('avs-last-preset');if(saved&&window.presetLibrary.entries().some(e=>e.value===saved))remembered=saved;}catch{}
 window.presetLibrary.load(sharedPreset||remembered);
 if(!sharedPreset&&initial!=='studio')$('shuffle-presets').click();
 sequence();
// Cut a clear window in the veil; the real canvas fills the viewport behind the UI.
 let maskFrame;function placeWindow(){cancelAnimationFrame(maskFrame);maskFrame=requestAnimationFrame(()=>{const rect=document.querySelector('.stage-shell').getBoundingClientRect(),style=document.documentElement.style;for(const [key,value]of Object.entries({left:rect.left,top:rect.top,width:rect.width,height:rect.height}))style.setProperty('--window-'+key,value+'px');});}
 const windowObserver=new ResizeObserver(placeWindow);for(const el of [document.querySelector('.stage-shell'),document.querySelector('.app-header'),document.querySelector('.music-player')])windowObserver.observe(el);
 window.addEventListener('resize',placeWindow);document.addEventListener('fullscreenchange',placeWindow);document.addEventListener('puts-language-change',placeWindow);placeWindow();
})();
