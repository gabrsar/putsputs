// A quiet source can still have a healthy connection.
(() => {
  const label = document.getElementById('capture-health');
  const resumeButton = document.getElementById('resume-audio');
  const text = (source) => window.PutsI18n?.t(source) ?? source;

  function report() {
    const remote = mode === 'remote';
    const local = mode === 'live';
    const needsResume = (remote && window.remoteAudio?.needsResume) ||
      (local && context && ['suspended', 'interrupted'].includes(context.state));
    resumeButton.hidden = !needsResume;
    const parts = [];
    if (remote) {
      parts.push(window.remoteAudio.state);
    } else if (local) {
      const track = stream?.getAudioTracks()[0];
      if (stream) {
        if (!track || track.readyState === 'ended') {
          parts.push(text('Compartilhamento encerrado. Selecione a fonte para reconectar.'));
        } else if (track.muted) {
          parts.push(text('A fonte está temporariamente sem áudio.'));
        } else if (context?.state === 'running') {
          parts.push(a.level < .0001
            ? text('Áudio conectado. Aguardando som na fonte.')
            : text('Recebendo áudio da fonte.'));
        }
      } else if (media) {
        parts.push(media.ended ? text('A música terminou.') : media.paused
          ? text('Reprodução pausada.')
          : text('Reprodução ativa.'));
      }
      if (needsResume) parts.push(text('Clique em Retomar áudio.'));
    } else if (mode === 'preview') {
      parts.push(text('Prévia visual sem som.'));
    } else if (mode === 'demo') {
      parts.push(text('Demonstração com sinal sintético.'));
    } else {
      parts.push(text('Captura inativa.'));
    }
    if (document.hidden) parts.push(text('A animação pode pausar quando a aba fica em segundo plano.'));
    const status = parts.join(' · ');
    if (label.textContent !== status) label.textContent = status;
  }

  resumeButton.onclick = async () => {
    if (mode === 'remote') {
      window.remoteAudio.resume();
    } else if (mode === 'live' && context && context.state !== 'closed') {
      try {
        await context.resume();
      } catch {
        message(text('Não foi possível retomar o áudio. Selecione a fonte para reconectar.'));
      }
    }
    report();
  };
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && mode === 'live' && context && ['suspended', 'interrupted'].includes(context.state)) {
      context.resume().then(report, report);
    }
    report();
  });
  document.addEventListener('puts-language-change', report);
  setInterval(report, 500);
  report();
})();
