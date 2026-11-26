(() => {
  const storageKey = 'avs-persistent-audio';
  const popupName = 'avs-capture:' + location.origin;
  const text = (source) => window.PutsI18n?.t(source) ?? source;
  let channel, active = false;
  try {
    channel = new BroadcastChannel('avs-audio-v1');
    active = sessionStorage.getItem(storageKey) === 'yes';
  } catch {
    // Browser storage and local communication can be disabled independently.
  }
  let restoring = active;
  let latest, popup, pending = false, running = false, connected = false;
  let lastRequest = 0, lastReply = 0;
  let state = 'Captura persistente inativa';

  function remember(value) {
    try { sessionStorage.setItem(storageKey, value ? 'yes' : 'no'); } catch {}
  }

  function clear() {
    active = false;
    restoring = false;
    connected = false;
    running = false;
    pending = false;
    latest = null;
    state = 'Captura persistente inativa';
    remember(false);
  }

  function restorePreview() {
    if (!restoring) return;
    clear();
    if (mode === 'silence') window.avsPlayer?.startPreview();
  }

  const remote = {
    get state() { return text(state); },
    get needsResume() { return connected && !running; },
    get waitingForHost() { return restoring; },
    open() {
      if (!channel) {
        message(text('A conexão com a janela de captura está indisponível. Compartilhe áudio diretamente nesta página.'));
        return;
      }
      const target = window.open('', popupName, 'popup,width=540,height=460');
      if (!target) {
        message(text('Permita a abertura da janela de captura no navegador.'));
        return;
      }
      if (mode !== 'remote') disconnect();
      popup = target;
      active = true;
      try { if (popup.location.href === 'about:blank') popup.location.href = 'capture.html'; } catch {}
      popup.focus();
      channel.postMessage({ type: 'hello' });
      message(text('Na janela de captura, clique em Compartilhar áudio e deixe a janela aberta.'));
    },
    detach() {
      if (active) channel?.postMessage({ type: 'stop' });
      clear();
    },
    resume() {
      if (!active) return;
      channel.postMessage({ type: 'resume' });
      if (popup && !popup.closed) popup.focus();
      message(text('Se o áudio continuar pausado, clique em Retomar na janela de captura.'));
    },
    read() {
      if (!active) return null;
      const now = performance.now();
      const fft = Number($('fft').value);
      if (!pending || now - lastRequest > 500) {
        pending = true;
        lastRequest = now;
        channel.postMessage({ type: 'sample', fft, smooth: Number($('smooth').value) });
      }
      if (connected && now - lastReply > 3000) {
        connected = false;
        remember(false);
        state = 'A janela de captura parou de responder. Selecione a fonte para reconectar.';
      }
      return latest && now - latest.received < 750 && latest.wave.length === fft ? latest : null;
    }
  };

  if (channel) {
    channel.onmessage = ({ data }) => {
      if (!active || !['state', 'data'].includes(data?.type)) return;
      if (!data.active && restoring) {
        restorePreview();
        return;
      }
      restoring = false;
      pending = false;
      if (connected !== data.active) remember(data.active);
      connected = data.active;
      running = data.running;
      lastReply = performance.now();
      state = !connected ? 'Compartilhamento encerrado. Abra a janela de captura para reconectar.'
        : !running ? 'Captura pausada. Clique em Retomar áudio.'
          : data.muted ? 'A fonte está temporariamente sem áudio.' : 'Captura persistente conectada.';
      if (data.active && mode !== 'remote') {
        groupEngine.reset();
        mode = 'remote';
      }
      if (data.type === 'data' && data.wave && running && !data.muted) {
        latest = { ...data, received: lastReply };
      } else if (!connected || !running || data.muted) {
        latest = null;
      }
    };
    if (restoring) {
      channel.postMessage({ type: 'hello' });
      setTimeout(restorePreview, 1000);
    }
  }
  window.remoteAudio = remote;
})();
