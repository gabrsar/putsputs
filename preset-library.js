(() => {
  const select=document.getElementById('preset');
  const description=document.getElementById('preset-description');
  const library=[
    {name:'★ Histórico 3D · visual.js',path:'visual.js',text:'Seu visual principal: 48 bandas, histórico e câmera manual.'},
    {"name": "Caleidoscópio · pétalas em transe", "path": "presets/kaleido-petals.js", "text": "Doze espelhos, ondas musicais, filamentos e rastros que alternam de densidade ao longo da frase."},
    {"name": "Caleidoscópio · mandala líquida", "path": "presets/kaleido-liquid.js", "text": "Espelhos de Perlin, filamentos cromáticos e memória com bloom; a música faz a mandala abrir e fechar."},
    {"name": "Sofá · ondas de veludo", "path": "presets/couch-velvet-waves.js", "text": "Variação de tecido com ondas contínuas, fios e paleta de veludo."},
    {"name": "Perlin · correntes musicais", "path": "presets/perlin-current.js", "text": "Campo vetorial com uma família de fios por frequência, ventos Perlin e rajadas nos ataques."},
    {"name": "Nuvens · camadas de vento", "path": "presets/cloud-creatures.js", "text": "Nuvens de ruído em camadas. O espectro move ventos em alturas diferentes e altera a densidade."},
    {"name": "Violão · madeira e ressonância", "path": "presets/guitar-resonance.js", "text": "Violão deitado, seis cordas excitadas pelo áudio. Passe o mouse pressionado sobre as cordas para dedilhar."},
    {"name": "Handdrawing · sismógrafo à mão", "path": "presets/handdrawn-garden.js", "text": "A caneta vai e volta sobre o sulfite; o histórico fica imóvel e apaga devagar. Frequência e amplitude desenham os arcos. P pausa o traço; N limpa."},
    {"name": "Infinity · desenho por frequência", "path": "presets/infinity-ribbon.js", "text": "Inspirado no seu Infinity Hand Drawer: uma linha por faixa, centro e tamanho em Perlin, traços acumulados e reversão de sentido."},
    {"name": "Sofá · trama setentista", "path": "presets/couch-jacquard.js", "text": "Tecido retro de chevrons entrelaçados, fios e cores de estofado. Ondulações suaves e reflexos passam pelos fios; clique troca a paleta."},
    {"name": "Bordado · picos de linha", "path": "presets/embroidery-bloom.js", "text": "A agulha costura os picos da música em fileiras de tecido, com cor por frequência, tensão e fio solto. Clique começa outro pano."},
    {"name": "VFD · observatório de fósforo", "path": "presets/vfd-observatory.js", "text": "Vidro, grades de eletrodos, fósforo apagado, filamentos, contatos e trilhas. Barras com peak hold e modo waveform. Clique alterna."},
    {"name": "VFD · matriz de pixels", "path": "presets/vfd-pixel-matrix.js", "text": "Display fluorescente laranja de 104 × 36 pontos, relógio em dot matrix, grade física e persistência luminosa. Clique alterna espectro/waveform."},
    {"name": "Sound Waves · matéria em interferência", "path": "presets/sound-wave-field.js", "text": "Campo de ondas de duas fontes; waveform real move a malha; clique posiciona uma fonte; W alterna linhas e pontos."},
    {name:'Aurora · cortinas espectrais',path:'presets/aurora.js',text:'Faixas de ruído Perlin que respiram com as frequências.'},
    {"name": "Lissajous · néon XY", "path": "presets/lissajous.js", "text": "Curvas XY lentas com memória de fósforo e detalhes suaves do waveform."},
    {name:'Moiré · interferência',path:'presets/moire.js',text:'Duas tramas de linhas revelam padrões de interferência ligados às bandas.'},
    {name:'Moiré Fluido · zoom e metamorfose',path:'presets/moire-fluid.js',text:'Moiré com espessura, cores, ângulos, zoom e proporções seguindo alvos aleatórios independentes e suaves.'},
    {name:'Túnel prismático · AVS',path:'presets/prism-tunnel.js',text:'Túnel de paredes sólidas, iluminadas pelo espectro.'},
    {"name": "Shader · túnel sólido", "path": "presets/shader-tunnel.js", "text": "Corredor curvo com luz e trajeto gravados a partir das bandas de áudio."},
    {"name": "Shader · fogo turbulento", "path": "presets/shader-fire.js", "text": "Shader GLSL em um passe, com reação ao áudio."},
    {"name": "Shader · difração de pista", "path": "presets/shader-laser.js", "text": "Shader GLSL em um passe, com reação ao áudio."},
    {name:"Shader · laser WebGL direto",path:"presets/shader-laser-direct.js",text:"Mesmo laser, desenhado direto no palco para comparar desempenho."},
    {name:"Shader · Octogramas orbitais",path:"presets/shader-octogram.js",text:"Estrelas de oito pontas em camadas, com zoom contínuo e halos que pulsam nos graves."},
    {name:"Shader · Jardim fractal",path:"presets/shader-bulb-atlas.js",text:"Fractal de Julia com filamentos de cor, nebulosa e estrelas."},
    {name:"Shader · Deriva estelar",path:"presets/shader-nebula-drift.js",text:"Voo por uma nebulosa fractal volumétrica com filamentos de luz."},
    {name:"Shader · Ruínas em trânsito",path:"presets/shader-ruin-flight.js",text:"Voo sobre uma cidade alienígena com luzes acionadas pelo espectro."},
    {name:"Shader · Laser na fumaça",path:"presets/shader-club-fog.js",text:"Três projetores RGB cruzam feixes na fumaça. Graves abrem os leques e os médios e agudos animam as estrelas."},
    {name:'Shader · Corredor de luz',path:'presets/shader-luminous-corridor.js',text:'Barras luminosas em um corredor curvo profundo; doze regiões do espectro e ecos musicais. Base: Jan Mróz (jaszunio15), CC BY 3.0; adaptação putsputs.'},
    {name:'Shader · Dobra estelar',path:'presets/shader-warp-stars.js',text:'Estrelas e rastros em velocidade de dobra; câmera estável, brilhos por frequência e ondas discretas no espaço.'},
    {name:'Laser · estrelas de pista',path:'presets/club-lasers.js',text:'Estrelas e feixes giratórios respondem às bandas do áudio.'},
    {name:'Sismógrafo 3D · órbita',path:'presets/seismograph-orbit.js',text:'Doze pontas de grafite virtual desenham curvas em paralelo, unidas em um volume visto em perspectiva.'},
    {name:'Caleidoscópio · seda',path:'presets/kaleido-silk.js',text:'Seda espelhada com rotação lenta e rastros luminosos.'},
    {name:'Caleidoscópio · vitral',path:'presets/kaleido-glass.js',text:'Peças de vidro colorido com histórico, bordas suavizadas e bloom.'},
    {"name": "Braseiro · fogo vivo", "path": "presets/doom-fire.js", "text": "Fogo em resolução reduzida com advecção longa, combustível por frequência, rajadas Perlin e brasas que sobem."},
    {name:'Polar · tear espectral',path:'presets/polar-loom.js',text:'Observatório polar facetado, amostragem espelhada e doze segundos de memória.'},
    {"name": "Polar · rosas luminosas", "path": "presets/polar-rose.js", "text": "Rosas harmônicas com nervuras, bloom, centelhas e respiração musical. Detalhes surgem e somem com as frases."},
    {"name": "Color Mix · sirenes na noite", "path": "presets/color-additive.js", "text": "Reflexos vermelhos e azuis como luzes de polícia através de vidro, alternância musical e manchas de luz."},
    {name:'Color Mix · tinta CMY',path:'presets/color-ink.js',text:'Fitas de tinta ciano, magenta e amarelo com MULTIPLY.'},
    {"name": "Hyperdrive · nascedouro musical", "path": "presets/hyperdrive.js", "text": "Túnel sólido cujas curvas e cores são gravadas pelo áudio a cada novo trecho."},
    {name:'Fractal · Julia',path:'presets/fractal-julia.js',text:'Julia em GPU com passeio lento, zoom amortecido e influência musical.'},
    {name:'Fractal · Mandelbrot',path:'presets/fractal-mandelbrot.js',text:'Mandelbrot com zoom limitado, passeio suave por pontos de interesse e cores espectrais.'},
    {name:'Lorenz · seda caótica',path:'presets/lorenz-silk.js',text:'Lorenz com até 200 partículas, avanço e rotação 3D influenciados pela música.'},
    {name:'Lorenz · órbitas gêmeas',path:'presets/lorenz-twin.js',text:'Atrator esquerdo e direito perturbados pelos canais reais do estéreo; a prévia mono usa sinal combinado.'},
    {name:'Pontos · tinta permanente',path:'presets/permanent-points.js',text:'Acumula pontos sem apagar enquanto estiver ativo. O áudio controla densidade e dispersão.'},
    {name:'Terreno · mundo musical',path:'presets/terrain-history.js',text:'Mundo musical com grade quadrada sem diagonais, faces opacas, antialiasing e 24 segundos de histórico.'},
    {"name": "AVS · Bass Spin néon", "path": "presets/avs-bass-spin.js", "text": "Lâminas guiadas pelos graves, memória de rotação, bloom e pequenos ecos nas viradas."},
    {name:'AVS · Dot Plane',path:'presets/avs-dot-plane.js',text:'Releitura do horizonte pontilhado modulado por ondas e espectro.'},
    {name:'AVS · Scope Star',path:'presets/avs-scope-star.js',text:'Superscope de estrela com waveform espelhado e brilho controlado.'},
    {name:'AVS · Roto Feedback',path:'presets/avs-roto-feedback.js',text:'Releitura de rotação/escala com realimentação visual e rastro contínuo.'},
    {"name": "Psicodélico · plasma líquido", "path": "presets/psychedelic-liquid.js", "text": "Rios cromáticos com memória desfocada, dobras Perlin, glow e centelhas que entram em certas frases."},
    {"name": "Micélio · raízes por frequência", "path": "presets/organic-mycelium.js", "text": "Cada faixa tem sua raiz e cor. A energia faz crescer, picos bifurcam e mudanças de timbre desviam os ramos."},
    {name:'Lounge · veludo e vinho',path:'presets/wine-velvet.js',text:'Fitas rubi e ameixa, um fio dourado e movimento discreto.'},
    {name:'Lounge · âmbar e negroni',path:'presets/negroni-amber.js',text:'Arcos de vidro âmbar e cobre crescem lentamente além da tela; a música move as ondas, a névoa e os reflexos ao fundo.'},
    {name:'Tapeçaria · espectrograma',path:'presets/spectral-weave.js',text:'Doze segundos em células de cor: frequência × tempo, com ataques destacados.'}
  ];
  const group=document.createElement('optgroup');group.label='Biblioteca · editáveis no WebStorm';
  for(const entry of library)group.append(new Option(entry.name,'file:'+entry.path));
  select.replaceChildren();select.prepend(group);select.value='file:visual.js';description.textContent=library[0].text;
  const legacyChange=select.onchange;
  let disabled=new Set();
  try{const stored=JSON.parse(localStorage.getItem('avs-disabled-presets-v1')||'[]');if(Array.isArray(stored))disabled=new Set(stored);}catch{}
  const entryValue=entry=>entry.value||'file:'+entry.path;
  const announceLibrary=()=>document.dispatchEvent(new Event('avs-library-changed'));
  function persistEnabled(){
    try{localStorage.setItem('avs-disabled-presets-v1',JSON.stringify([...disabled]));}catch{}
    bag=[];announceLibrary();
  }
  let revision=0,loading=false,shuffle=false,nextAt=0,bag=[],lastSwitch=0,pausedAt=null,detector=null,changeFrames=0;
  const shuffleButton=document.getElementById('shuffle-presets');
  const interval=document.getElementById('shuffle-interval');
  const progress=document.getElementById('sequence-progress');
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  function updateProgress(now){
    const fraction=shuffle&&!reducedMotion.matches?Math.min(1,Math.max(0,((pausedAt??now)-lastSwitch)/(nextAt-lastSwitch))):0;
    progress.setAttribute('stroke-dashoffset',String(1-fraction));
  }
  function syncClock(now){
    if(!shuffle)return;
    if(loading||document.hidden||window.avsPlayer?.isPaused){
      pausedAt??=now;
    }else if(pausedAt!==null){
      const pausedFor=now-pausedAt;
      lastSwitch+=pausedFor;nextAt+=pausedFor;pausedAt=null;
    }
  }
  const schedule=()=>{
    lastSwitch=performance.now();
    pausedAt=null;
    const duration=interval.value==='dynamic'?45000+Math.random()*75000:Math.max(5000,Number(interval.value)*1000);
    nextAt=lastSwitch+duration;
    syncClock(lastSwitch);
    updateProgress(lastSwitch);
  };
  function musicalTurn(){
    if((interval.value!=='dynamic'&&!document.getElementById('shuffle-musical').checked)||typeof a==='undefined'||!a.features)return false;
    const f=a.features;
    if(!detector||detector.revision!==f.revision){detector={revision:f.revision,db:f.db,shape:[...f.shape]};changeFrames=0;return false;}
    const levelChange=Math.abs(f.db-detector.db);
    const timbre=f.shape.reduce((sum,v,i)=>sum+Math.abs(v-detector.shape[i]),0);
    const audible=f.db>-65;
    const changed=(audible&&levelChange>9)||(audible&&timbre>.65)||(f.db<-85&&detector.db>-60);
    changeFrames=changed?changeFrames+1:Math.max(0,changeFrames-1);
    // Baseline tracks musical phrases, not individual frames.
    detector.db+=(f.db-detector.db)*.03;
    detector.shape=detector.shape.map((v,i)=>v+(f.shape[i]-v)*.03);
    if(performance.now()-lastSwitch<9000){changeFrames=0;return false;}
    if(changeFrames>=3){changeFrames=0;return true;}
    return false;
  }
  function varyReading(){
    if(!document.getElementById('shuffle-reading').checked)return;
    const layouts=['detail48','balanced24','thirds','octaves','bass','voices'];
    const scales=['sqrt','linear','log'];
    const layout=document.getElementById('band-layout'),scale=document.getElementById('amplitude-scale');
    layout.value=layouts[Math.floor(Math.random()*layouts.length)];
    scale.value=scales[Math.floor(Math.random()*scales.length)];
    layout.dispatchEvent(new Event('change',{bubbles:true}));detector=null;changeFrames=0;
  }
  function announceSequence(){document.dispatchEvent(new CustomEvent('avs-sequence-changed',{detail:{shuffle}}));}
  function stopShuffle(){shuffle=false;pausedAt=null;updateProgress(performance.now());shuffleButton.textContent='Troca automática: desligada';shuffleButton.setAttribute('aria-pressed','false');announceSequence();}
  shuffleButton.onclick=()=>{
    if(!shuffle&&library.filter(entry=>!disabled.has(entryValue(entry))).length<2){description.textContent='Ative pelo menos dois presets para usar o shuffle.';return;}
    shuffle=!shuffle;shuffleButton.textContent='Troca automática: '+(shuffle?'ligada':'desligada');
    shuffleButton.setAttribute('aria-pressed',String(shuffle));bag=[];schedule();announceSequence();
  };
  interval.onchange=schedule;
  for(const [id,event]of [['run','click'],['codefile','change'],['reload-script','click'],['watch-script','change']]){
    document.getElementById(id).addEventListener(event,stopShuffle,true);
  }
  setInterval(()=>{
    const now=performance.now();
    syncClock(now);
    if(!shuffle||pausedAt!==null)return;
    if(!(interval.value==='dynamic'&&musicalTurn())&&now<nextAt)return;
    if(!bag.length){
      bag=library.map(entryValue).filter(value=>value!==select.value&&!disabled.has(value));
      for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
    }
    bag=bag.filter(value=>!disabled.has(value));
    const value=bag.pop();if(!value){schedule();return;}
    varyReading();select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));schedule();
  },500);
  setInterval(()=>{
    if(!shuffle)return;
    const now=performance.now();
    syncClock(now);updateProgress(now);
  },100);
  document.addEventListener('visibilitychange',()=>syncClock(performance.now()));
  const invalidate=()=>{revision++;loading=false};
  document.addEventListener('avs-editor-user-edit',()=>{stopShuffle();invalidate();});
  for(const [id,event]of [['run','click'],['codefile','change'],['reload-script','click'],['watch-script','change']]){
    document.getElementById(id).addEventListener(event,invalidate,true);
  }
  select.onchange=async()=>{
    const ticket=++revision;loading=true;schedule();
    const entry=library.find(item=>(item.value||'file:'+item.path)===select.value);
    if(!entry){loading=false;description.textContent='Preset clássico · código editável';legacyChange();return;}
    description.textContent='Carregando '+entry.name+'…';
    try{
      let code=entry.code;
      if(typeof code!=='string'){const response=await fetch('./'+entry.path,{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);code=await response.text();}
      if(ticket!==revision)return;
      new Function('p','a','s',code);
      if(entry.seed!==undefined)document.getElementById('preset-seed').value=String(entry.seed);
      codeEditor.setValue(code);
      if(apply()){
        if(entry.path)window.followScript(entry.path,code);
        else document.getElementById('watch-script').checked=false;
        description.textContent=entry.text;
        document.getElementById('script-status').textContent=entry.path?'Preset: '+entry.path+' · acompanhando alterações no WebStorm':'Preset local · salvo neste navegador';
        document.dispatchEvent(new CustomEvent('avs-preset-loaded',{detail:{value:select.value,name:entry.name}}));
      }else description.textContent='Erro ao aplicar · consulte o editor';
    }catch(error){if(ticket===revision)description.textContent='Não foi possível carregar: '+error.message;}
    finally{if(ticket===revision)loading=false;}
  };
  for(const [id,step]of [['preset-prev',-1],['preset-next',1]]){
    document.getElementById(id).onclick=()=>{
      const eligible=library.map(entryValue).filter(value=>!disabled.has(value));
      if(!eligible.length)return;
      const index=eligible.indexOf(select.value);select.value=eligible[index<0?(step>0?0:eligible.length-1):(index+step+eligible.length)%eligible.length];
      select.dispatchEvent(new Event('change',{bubbles:true}));
    };
  }
  let localGroup;
  window.presetLibrary={
    setLocals(records){
      for(let i=library.length-1;i>=0;i--)if(library[i].value?.startsWith('local:'))library.splice(i,1);
      localGroup?.remove();localGroup=document.createElement('optgroup');localGroup.label='Meus presets · somente neste navegador';
      for(const record of records){
        library.push({name:record.name,value:'local:'+record.id,code:record.code,seed:record.seed,text:'Preset local: '+record.name});
        localGroup.append(new Option(record.name,'local:'+record.id));
      }
      select.append(localGroup);bag=[];announceLibrary();
    },
    async getCode(value){const entry=library.find(e=>entryValue(e)===value);if(!entry)throw Error('Visual indisponível');if(typeof entry.code==='string')return entry.code;const response=await fetch('./'+entry.path,{cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);return response.text();},
    entries(){return library.map(entry=>({value:entryValue(entry),name:entry.name,text:entry.text,enabled:!disabled.has(entryValue(entry))}));},
    setEnabled(value,enabled){if(enabled)disabled.delete(value);else disabled.add(value);persistEnabled();if(library.filter(entry=>!disabled.has(entryValue(entry))).length<2)stopShuffle();},
    setAllEnabled(enabled){disabled=new Set(enabled?[]:library.map(entryValue));persistEnabled();if(!enabled)stopShuffle();},
    load(value){select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));},
    random(){
      const eligible=library.filter(entry=>!disabled.has(entryValue(entry))&&entryValue(entry)!==select.value);
      if(!eligible.length)return;
      this.load(entryValue(eligible[Math.floor(Math.random()*eligible.length)]));schedule();
    },
    get shuffling(){return shuffle;},
    hold(){stopShuffle();},
    pause(){stopShuffle();invalidate();}
  };
  document.getElementById('reload-script').addEventListener('click',()=>{select.value='file:visual.js';description.textContent=library[0].text;});
})();
