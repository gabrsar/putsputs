(() => {
  const select=document.getElementById('preset');
  const description=document.getElementById('preset-description');
  const library=[
    {name:'★ Histórico 3D · visual.js',path:'visual.js',text:'Seu visual principal: 48 bandas, histórico e câmera manual.'},
    {"name": "Rádios · frequência recursiva", "path": "presets/recursive-radios.js", "text": "Um rádio contém outro rádio no mostrador: sete níveis de recursão, grades de alto-falante, sintonia e vibração por frequência."},
    {"name": "Caleidoscópio · pétalas em transe", "path": "presets/kaleido-petals.js", "text": "Doze espelhos, ondas musicais, filamentos e rastros que alternam de densidade ao longo da frase."},
    {"name": "Caleidoscópio · mandala líquida", "path": "presets/kaleido-liquid.js", "text": "Espelhos de Perlin, filamentos cromáticos e memória com bloom; a música faz a mandala abrir e fechar."},
    {"name": "Sofá · trama pulsante", "path": "presets/couch-dancing-weave.js", "text": "Variação de tecido com deformação e pulsação intensas por graves, médios e waveform."},
    {"name": "Sofá · ondas de veludo", "path": "presets/couch-velvet-waves.js", "text": "Variação de tecido com ondas contínuas, fios e paleta de veludo."},
    {"name": "Perlin · correntes musicais", "path": "presets/perlin-current.js", "text": "Campo vetorial com uma família de fios por frequência, ventos Perlin e rajadas nos ataques."},
    {"name": "Nuvens · bichos de algodão", "path": "presets/cloud-creatures.js", "text": "Céu com 22 nuvens em camadas de profundidade, animais e objetos fofos. Mouse sopra; clique troca as pareidolias."},
    {"name": "Violão · madeira e ressonância", "path": "presets/guitar-resonance.js", "text": "Violão deitado, seis cordas excitadas pelo áudio. Passe o mouse pressionado sobre as cordas para dedilhar."},
    {"name": "Handdrawing · sismógrafo à mão", "path": "presets/handdrawn-garden.js", "text": "A caneta vai e volta sobre o sulfite; o histórico fica imóvel e apaga devagar. Frequência e amplitude desenham os arcos. P pausa o traço; N limpa."},
    {"name": "Infinity · desenho por frequência", "path": "presets/infinity-ribbon.js", "text": "Inspirado no seu Infinity Hand Drawer: uma linha por faixa, centro e tamanho em Perlin, traços acumulados e reversão de sentido."},
    {"name": "Sofá · trama setentista", "path": "presets/couch-jacquard.js", "text": "Tecido retro de chevrons entrelaçados, fios e cores de estofado. Os graves franzem a trama; clique troca a paleta."},
    {"name": "Bordado · picos de linha", "path": "presets/embroidery-bloom.js", "text": "A agulha costura os picos da música em fileiras de tecido, com cor por frequência, tensão e fio solto. Clique começa outro pano."},
    {"name": "VFD · observatório de fósforo", "path": "presets/vfd-observatory.js", "text": "Vidro, grades de eletrodos, fósforo apagado, filamentos, contatos e trilhas. Barras com peak hold e modo waveform. Clique alterna."},
    {"name": "VFD · matriz de pixels", "path": "presets/vfd-pixel-matrix.js", "text": "Display fluorescente de 104 × 36 pontos, relógio em dot matrix, grade física e persistência luminosa. Clique alterna espectro/waveform."},
    {"name": "Polarizer · tensões de luz", "path": "presets/polarizer-film.js", "text": "Filmes birrefringentes simulados em baixa resolução; mouse gira o analisador; clique muda as camadas."},
    {"name": "Tinta · sprays e gotas", "path": "presets/painting-drying.js", "text": "Vozes viram sprays finos, graves depositam gotas grossas e a amplitude escolhe a carga de tinta. Pigmentos secam nas bordas."},
    {"name": "Sound Waves · matéria em interferência", "path": "presets/sound-wave-field.js", "text": "Campo de ondas de duas fontes; waveform real move a malha; clique posiciona uma fonte; W alterna linhas e pontos."},
    {name:'Aurora · cortinas espectrais',path:'presets/aurora.js',text:'Faixas de ruído Perlin que respiram com as frequências.'},
    {"name": "Lissajous · néon XY", "path": "presets/lissajous.js", "text": "Waveform XY com ganho visual, persistência de fósforo, cores vivas e órbitas que respiram."},
    {name:'Moiré · interferência',path:'presets/moire.js',text:'Duas tramas de linhas revelam padrões de interferência ligados às bandas.'},
    {name:'Moiré Fluido · zoom e metamorfose',path:'presets/moire-fluid.js',text:'Moiré com espessura, cores, ângulos, zoom e proporções seguindo alvos aleatórios independentes e suaves.'},
    {name:'Túnel prismático · AVS',path:'presets/prism-tunnel.js',text:'Seis segundos de ecos geométricos com o espectro nas bordas.'},
    {name:'Caleidoscópio · seda',path:'presets/kaleido-silk.js',text:'Seda que transborda a tela, rotação lenta, espessuras variáveis e blur leve.'},
    {name:'Caleidoscópio · vitral',path:'presets/kaleido-glass.js',text:'Peças de vidro colorido com bloom suave e bordas preservadas.'},
    {"name": "Braseiro · fogo vivo", "path": "presets/doom-fire.js", "text": "Fogo de alta resolução com advecção longa, combustível por frequência, rajadas Perlin e brasas que sobem."},
    {name:'Polar · tear espectral',path:'presets/polar-loom.js',text:'Observatório polar facetado, amostragem espelhada e doze segundos de memória.'},
    {"name": "Polar · rosas luminosas", "path": "presets/polar-rose.js", "text": "Rosas harmônicas com nervuras, bloom, centelhas e respiração musical. Detalhes surgem e somem com as frases."},
    {"name": "Color Mix · sirenes na noite", "path": "presets/color-additive.js", "text": "Reflexos vermelhos e azuis como luzes de polícia através de vidro, alternância musical e manchas de luz."},
    {name:'Color Mix · tinta CMY',path:'presets/color-ink.js',text:'Fitas de tinta ciano, magenta e amarelo com MULTIPLY.'},
    {"name": "Hyperdrive · nascedouro musical", "path": "presets/hyperdrive.js", "text": "O túnel nasce no centro a partir do espectro e vem em sua direção. Memória contínua, paredes completas e sem obstáculos."},
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
    {"name": "Negroni · líquido em órbita", "path": "presets/negroni-amber.js", "text": "O copo balança, o líquido gira e as ondas batem nas paredes; âmbar, cobre e reflexos de gelo."},
    {name:'Ambiente · brisa da sala de espera',path:'presets/waiting-room.js',text:'Planos suaves e discretos, sem flashes ou reação brusca ao som.'},
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
  let revision=0,loading=false,shuffle=false,nextAt=0,bag=[],lastSwitch=0,detector=null,changeFrames=0;
  const shuffleButton=document.getElementById('shuffle-presets');
  const interval=document.getElementById('shuffle-interval');
  const schedule=()=>{
    lastSwitch=Date.now();
    nextAt=interval.value==='dynamic'?Infinity:lastSwitch+Math.max(5000,Number(interval.value)*1000);
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
    if(Date.now()-lastSwitch<9000){changeFrames=0;return false;}
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
  function stopShuffle(){shuffle=false;shuffleButton.textContent='Troca automática: desligada';shuffleButton.setAttribute('aria-pressed','false');announceSequence();}
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
    if(!shuffle||loading||document.hidden||window.avsPlayer?.isPaused)return;
    const phraseChange=interval.value==='dynamic'?musicalTurn():false;
    // Dynamic mode changes on musical phrases; its safety ceiling is newly drawn each phrase.
    if(interval.value==='dynamic'){
      if(!Number.isFinite(nextAt))nextAt=lastSwitch+45000+Math.random()*75000;
      if(!phraseChange&&Date.now()<nextAt)return;
    }else if(Date.now()<nextAt)return;
    if(!bag.length){
      bag=library.map(entryValue).filter(value=>value!==select.value&&!disabled.has(value));
      for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
    }
    bag=bag.filter(value=>!disabled.has(value));
    const value=bag.pop();if(!value){schedule();return;}
    varyReading();select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));schedule();
  },500);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
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
