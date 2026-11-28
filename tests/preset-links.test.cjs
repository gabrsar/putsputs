const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../preset-links.js'),'utf8');
function setup(href='http://127.0.0.1:8791/?other=kept#stage',navigator={}){
 class Element extends EventTarget{constructor(value=''){super();this.value=value;this.textContent='';this.disabled=false;this.type='text';}}
 const ids={'share-current':'','share-visual':'','share-status':'','visual-speed':'1','visual-brightness':'1','render-quality':'auto','preset-seed':'1337','new-seed':''};
 const elements=Object.fromEntries(Object.entries(ids).map(([id,value])=>[id,new Element(value)]));
 const document=new EventTarget();document.getElementById=id=>elements[id]||null;
 const events=new EventTarget(),loaded=[],copied=[],prompts=[],replaced=[];
 const entries=[{value:'file:visual.js',name:'History'},{value:'file:presets/negroni-amber.js',name:'Negroni'},{value:'file:presets/shader-warp-stars.js',name:'Warp'},{value:'local:private',name:'Custom'}];
 const location={href};const history={state:{keep:true},replaceState(state,title,url){this.state=state;location.href=url;replaced.push(url);}};
 const window={presetLibrary:{entries:()=>entries,hold(){loaded.push('hold');},load(value){loaded.push(value);}},addEventListener:events.addEventListener.bind(events),prompt:(...args)=>prompts.push(args)};
 navigator={clipboard:{async writeText(text){copied.push(text);}},...navigator};
 vm.runInNewContext(source,{window,document,location,history,URL,navigator,setTimeout:()=>1,clearTimeout(){}});
 const announce=value=>document.dispatchEvent(new CustomEvent('avs-preset-loaded',{detail:{value}}));
 return {window,document,elements,location,history,events,loaded,copied,prompts,replaced,announce};
}
test('shared URLs accept only known built-ins and support the main history preset',()=>{
 assert.equal(setup('https://example.test/?preset=negroni-amber').window.PresetLinks.initialPreset,'file:presets/negroni-amber.js');
 assert.equal(setup('https://example.test/?preset=visual').window.PresetLinks.initialPreset,'file:visual.js');
 for(const id of ['../secret','local:private','https://evil.test/code.js'])assert.equal(setup('https://example.test/?preset='+encodeURIComponent(id)).window.PresetLinks.initialPreset,null);
});
test('successful manual and automatic changes replace the URL, preserving unrelated parameters and hash',()=>{
 const f=setup();f.announce('file:presets/negroni-amber.js');
 let url=new URL(f.location.href);assert.equal(url.searchParams.get('preset'),'negroni-amber');assert.equal(url.searchParams.get('other'),'kept');assert.equal(url.hash,'#stage');
 f.announce('file:presets/shader-warp-stars.js');url=new URL(f.location.href);assert.equal(url.searchParams.get('preset'),'shader-warp-stars');
 assert.equal(f.replaced.length,2);assert.equal(f.history.state.keep,true);
});
test('setting changes and seed variations are reflected in the copied URL',async()=>{
 const f=setup();f.announce('file:presets/negroni-amber.js');
 f.elements['visual-speed'].value='.65';f.elements['visual-speed'].dispatchEvent(new Event('change'));
 f.elements['preset-seed'].value='âmbar & cobre';f.elements['new-seed'].dispatchEvent(new Event('click'));
 await f.elements['share-current'].onclick();
 const url=new URL(f.copied[0]);assert.equal(url.searchParams.get('visual-speed'),'.65');assert.equal(url.searchParams.get('preset-seed'),'âmbar & cobre');assert.equal(f.copied[0],f.location.href);assert.equal(f.elements['share-status'].textContent,'Link copiado');
});
test('local and edited presets clear stale public identity instead of sharing another shader',()=>{
 const f=setup();f.announce('file:presets/negroni-amber.js');f.announce('local:private');assert.equal(new URL(f.location.href).searchParams.has('preset'),false);assert.equal(f.elements['share-current'].disabled,true);
 f.announce('file:presets/shader-warp-stars.js');f.document.dispatchEvent(new Event('avs-editor-user-edit'));assert.equal(new URL(f.location.href).searchParams.has('preset'),false);
});
test('native sharing uses the current visual; cancelling does not copy unexpectedly',async()=>{
 const calls=[],f=setup(undefined,{share:async payload=>calls.push(payload)});f.announce('file:presets/negroni-amber.js');await f.window.PresetLinks.share();assert.equal(calls[0].url,f.location.href);assert.equal(calls[0].title,'Negroni');assert.equal(f.copied.length,0);
 const cancelled=setup(undefined,{share:async()=>{throw Object.assign(new Error(),{name:'AbortError'});}});cancelled.announce('file:presets/negroni-amber.js');await cancelled.window.PresetLinks.share();assert.equal(cancelled.copied.length,0);
});
test('clipboard failures expose a selectable link and native sharing failures fall back',async()=>{
 const f=setup(undefined,{share:async()=>{throw new Error('unavailable');},clipboard:{writeText:async()=>{throw new Error('denied');}}});f.announce('file:presets/negroni-amber.js');await f.window.PresetLinks.share();assert.equal(f.prompts[0][1],f.location.href);
});
test('browser navigation restores settings, holds the sequence and loads the linked preset',()=>{
 const f=setup();f.location.href='https://example.test/?preset=shader-warp-stars&visual-speed=.5&preset-seed=42';f.events.dispatchEvent(new Event('popstate'));assert.deepEqual(f.loaded,['hold','file:presets/shader-warp-stars.js']);assert.equal(f.elements['visual-speed'].value,'.5');assert.equal(f.elements['preset-seed'].value,'42');
});
