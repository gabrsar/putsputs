(() => {
  const tracks = window.PutsTracks || {};
  const trackKeys = Object.keys(tracks);
  const initialKey = trackKeys[0];
  const picker = $('example-track');
  const stageMute = $('unmute-stage');
  const mute = $('music-mute');
  const play = $('music-play');
  const seekBar = $('music-seek');
  const volumeBar = $('music-volume');
  const previous = $('music-prev');
  const next = $('music-next');
  const text = (source) => window.PutsI18n?.t(source) ?? source;
  let preview, previewLoad, clock = performance.now(), position = 0;
  let paused = false, muted = true, visualPaused = false, starting = false;
  let volume = Number(volumeBar.value), lastVolume = volume, kind = 'none', trackKey, fileName = '';

  if (initialKey) {
    picker.replaceChildren(...trackKeys.map(key => new Option(tracks[key].name, key)));
  }

  function setText(id, value) {
    const element = $(id);
    if (element.textContent !== value) element.textContent = value;
  }

  function setButton(button, icon, label) {
    if (button.dataset.icon !== icon) {
      button.innerHTML = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-' + icon + '"/></svg>';
      button.dataset.icon = icon;
    }
    if (button.getAttribute('aria-label') !== label) button.setAttribute('aria-label', label);
  }

  function duration() {
    if (kind === 'preview') return preview?.duration || tracks[trackKey]?.duration || 0;
    if (media && Number.isFinite(media.duration)) return media.duration;
    return tracks[trackKey]?.duration || 0;
  }

  function time() {
    if (kind === 'preview') {
      if(!preview)return 0;
      return Math.min(duration(), position + (paused ? 0 : (performance.now() - clock) / 1000));
    }
    return media?.currentTime || 0;
  }

  const pausedNow = () => kind === 'preview' ? paused : media ? media.paused : visualPaused;
  const isMuted = () => muted || volume === 0;
  const hasLocalMusic = () => kind === 'preview' || kind === 'example' || kind === 'file';

  function gain(immediate = false) {
    if (!outputGain) return;
    const target = isMuted() ? 0 : volume;
    const now = context.currentTime;
    outputGain.gain.cancelScheduledValues(now);
    if (immediate) outputGain.gain.setValueAtTime(target, now);
    else outputGain.gain.setTargetAtTime(target, now, .05);
  }

  function updateUI() {
    const external = mode === 'remote' || Boolean(stream);
    const sample = Boolean(trackKey);
    const track = tracks[trackKey];
    const canUnmute = !external && hasLocalMusic() && isMuted() && !starting;
    const playbackTime = time();
    const end = duration();
    const isPaused = pausedNow();

    document.body.dataset.externalAudio = String(external);
    document.body.dataset.audioMuted = String(canUnmute);
    document.body.dataset.visualPaused = String(visualPaused);
    stageMute.hidden = !canUnmute;
    const sourceTitle = mode === 'remote' ? text('Áudio compartilhado')
      : stream ? (a.captureKind === 'system' ? text('Áudio do computador') : text('Microfone'))
        : mode === 'demo' ? text('Sinal sintético') : text('Sem áudio');
    $('track-title').toggleAttribute('data-i18n-ignore', Boolean(track || fileName));
    setText('track-title', track?.name || fileName || sourceTitle);
    setText('track-credit', track ? `${track.author} · ${track.license}`
      : external ? text('O som continua na fonte original')
        : kind === 'file' ? text('Arquivo do seu computador') : '');
    setText('source-label', sample ? text('♫ Música de exemplo')
      : kind === 'file' ? text('♫ Seu arquivo')
        : external ? text('♫ Áudio de aba ou do computador') : text('♫ Escolher áudio'));

    mute.disabled = external || !hasLocalMusic() || starting;
    volumeBar.disabled = external;
    play.disabled = starting;
    if (previous) previous.disabled = external || kind === 'file' || trackKeys.length < 2;
    if (next) next.disabled = external || kind === 'file' || trackKeys.length < 2;
    setButton(mute, isMuted() ? 'mute' : 'sound', isMuted() ? text('Ligar som') : text('Silenciar'));
    setButton(play, isPaused ? 'play' : 'pause', external || !hasLocalMusic()
      ? (isPaused ? text('Retomar animação') : text('Pausar animação'))
      : (isPaused ? text('Retomar música') : text('Pausar música')));
    seekBar.disabled = !end || starting;
    seekBar.max = String(end || 1);
    if (document.activeElement !== seekBar) seekBar.value = String(playbackTime);
    setText('music-time', `${Math.floor(playbackTime / 60)}:${String(Math.floor(playbackTime % 60)).padStart(2, '0')}`);
    setText('playback-status', starting || previewLoad ? text('Carregando…')
      : isPaused ? text('Pausado')
        : external ? text('Ao vivo')
          : isMuted() && hasLocalMusic() ? text('Sem som')
            : hasLocalMusic() ? text('Tocando') : text('Sem áudio'));
  }

  function onDisconnect() {
    previewLoad?.abort();
    previewLoad = null;
    kind = 'none';
    trackKey = null;
    fileName = '';
    preview = null;
    position = 0;
    paused = false;
    visualPaused = false;
    starting = false;
  }

  async function liveExample(key, seek = 0, keepMuted = false) {
    if (!Object.hasOwn(tracks, key)) return;
    disconnect();
    const ticket = generation;
    kind = 'example';
    trackKey = key;
    picker.value = key;
    muted = keepMuted;
    starting = true;
    updateUI();

    try {
      const engineReady = init();
      engineReady.catch(() => {});
      const element = new Audio();
      element.preload = 'auto';
      element.loop = true;
      media = element;
      source = context.createMediaElementSource(element);
      source.connect(analyser);
      source.connect(detailAnalyser);
      stereoAnalysis.connect(source);
      source.connect(outputGain);
      gain(true);
      element.src = tracks[key].file || './assets/audio/' + key + '.mp3';
      if (seek > 0) element.currentTime = Math.min(seek, tracks[key].duration - .1);
      await Promise.all([engineReady, element.play()]);
      if (ticket !== generation) return;
      mode = 'live';
      starting = false;
      message('');
      updateUI();
      element.onerror = () => {
        if (ticket !== generation) return;
        disconnect();
        message(text('Não foi possível tocar. Escolha outra música de exemplo.'));
        updateUI();
      };
    } catch {
      if (ticket !== generation) return;
      if (key === initialKey) {
        startPreview(seek);
      } else {
        disconnect();
        updateUI();
      }
      message(text('Não foi possível tocar. Escolha outra música de exemplo.'));
    }
  }

  async function startPreview(seek = 0) {
    if (!initialKey || window.remoteAudio?.waitingForHost) return;
    disconnect();
    const ticket = generation;
    kind = 'preview';
    trackKey = initialKey;
    picker.value = initialKey;
    muted = true;
    mode = 'demo';
    if(tracks[initialKey].preview === false){updateUI();return;}
    previewLoad = new AbortController();
    updateUI();
    try {
      const response = await fetch('./assets/audio/' + trackKey + '-analysis.bin.gz', { signal: previewLoad.signal });
      if (!response.ok) throw Error('Preview unavailable');
      const data = await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      if (ticket !== generation) return;
      preview = new PreviewAnalysis(data);
      position = Math.min(seek, preview.duration - .1);
      clock = performance.now();
      mode = 'preview';
      groupEngine.reset();
    } catch {
      if (ticket === generation) message(text('Prévia visual. Clique em Ligar som para ouvir o exemplo.'));
    } finally {
      if (ticket === generation) {
        previewLoad = null;
        updateUI();
      }
    }
  }

  async function unmute() {
    if (starting || !hasLocalMusic() || !isMuted()) return;
    const fromStage = document.activeElement === stageMute;
    if (volume === 0) {
      volume = lastVolume || .4;
      volumeBar.value = String(volume);
    }
    if (kind === 'preview') {
      await liveExample(trackKey, time());
    } else if (media) {
      const ticket = generation;
      muted = false;
      gain();
      try {
        await Promise.all([init(), media.paused ? media.play() : undefined]);
        if (ticket !== generation) return;
        visualPaused = false;
        message('');
      } catch {
        if (ticket !== generation) return;
        muted = true;
        gain();
        message(text('Não foi possível retomar a reprodução. Selecione uma música para tentar novamente.'));
      }
      updateUI();
    }
    if (fromStage && stageMute.hidden && !mute.disabled && document.activeElement === document.body) mute.focus();
  }

  async function toggle() {
    if (starting) return;
    if (kind === 'preview') {
      position = time();
      paused = !paused;
      clock = performance.now();
      visualPaused = paused;
      if (position >= duration()) position = 0;
    } else if (media) {
      const ticket = generation;
      if (media.paused) {
        try {
          await Promise.all([init(), media.play()]);
          if (ticket !== generation) return;
          visualPaused = false;
        } catch {
          if (ticket !== generation) return;
          message(text('Não foi possível retomar a reprodução. Selecione uma música para tentar novamente.'));
        }
      } else {
        media.pause();
        visualPaused = true;
      }
    } else {
      visualPaused = !visualPaused;
    }
    updateUI();
  }

  function step(by) {
    const current = trackKeys.indexOf(trackKey || initialKey);
    const selected = trackKeys[(current + by + trackKeys.length) % trackKeys.length];
    const playback = liveExample(selected, 0, isMuted());
    $('source-close')?.click();
    return playback;
  }

  picker.onchange = () => liveExample(picker.value);
  if (previous) previous.onclick = () => step(-1);
  if (next) next.onclick = () => step(1);
  play.onclick = toggle;
  mute.onclick = () => {
    if (isMuted()) {
      unmute();
    } else {
      muted = true;
      gain();
      updateUI();
    }
  };
  stageMute.onclick = unmute;

  let pointer;
  const stage = $('stage');
  stage.addEventListener('pointerdown', event => {
    if (event.isPrimary && event.button === 0) pointer = event;
  });
  stage.addEventListener('pointerup', event => {
    if (pointer?.pointerId !== event.pointerId) return;
    const tapped = Math.hypot(event.clientX - pointer.clientX, event.clientY - pointer.clientY) < 6;
    pointer = null;
    if (tapped) unmute();
  });
  stage.addEventListener('pointercancel', () => { pointer = null; });
  volumeBar.oninput = () => {
    volume = Number(volumeBar.value);
    if (volume > 0) lastVolume = volume;
    if (muted && volume > 0) unmute();
    gain();
    updateUI();
  };
  seekBar.oninput = () => {
    const value = Number(seekBar.value);
    if (kind === 'preview') {
      position = value;
      clock = performance.now();
    } else if (media && Number.isFinite(media.duration)) {
      media.currentTime = value;
    }
    window.avsMusic?.reset();
    groupEngine.reset();
  };

  window.avsPlayer = {
    onDisconnect, toggle, unmute, startPreview,
    selectExample: liveExample,
    get currentTrack() { return tracks[trackKey]; },
    get visualPaused() { return visualPaused; },
    get isPaused() { return pausedNow(); },
    fileStarted(name) {
      kind = 'file';
      fileName = name;
      muted = false;
      visualPaused = false;
      gain();
      updateUI();
    },
    read() {
      if (!preview || kind !== 'preview') return null;
      const at = time();
      if (at < duration() || paused) return preview.read(at);
      position = 0;
      clock = performance.now();
      groupEngine.reset();
      return preview.read(0);
    },
    refresh: updateUI
  };
  document.addEventListener('puts-language-change', updateUI);
  setInterval(updateUI, 250);
  updateUI();
  startPreview();
})();
