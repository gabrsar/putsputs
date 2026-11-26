(() => {
  const guide = document.getElementById('capture-guide');
  const start = document.getElementById('capture-start');
  const note = document.getElementById('capture-browser-note');
  const firefox = /Firefox\//.test(navigator.userAgent);
  const text = (source) => window.PutsI18n?.t(source) ?? source;

  function blockedReason(kind = 'system') {
    const system = kind === 'system';
    if (!window.isSecureContext) {
      return text('Abra o site por HTTPS para compartilhar áudio ou use um arquivo de música.');
    }
    if (system && !navigator.mediaDevices?.getDisplayMedia) {
      return text('Este navegador não oferece captura de tela. Use um arquivo ou tente compartilhar uma aba no Chrome ou Edge de computador.');
    }
    if (!system && !navigator.mediaDevices?.getUserMedia) {
      return text('Este navegador não oferece captura por microfone. Você pode abrir um arquivo de música.');
    }
    return '';
  }

  function describeError(error, kind) {
    const blocked = blockedReason(kind);
    if (blocked) return blocked;
    const system = kind === 'system';
    if (error.code === 'no-audio-track' || error.message === 'no-audio-track') {
      return system
        ? text('A fonte veio sem áudio. Escolha uma aba com som e marque “Compartilhar áudio” no seletor. Para som de todo o PC, use “Tela inteira” se ela oferecer essa opção.')
        : text('O microfone não forneceu áudio. Confira o dispositivo de entrada nas configurações do navegador.');
    }
    switch (error.name) {
      case 'NotAllowedError':
      case 'SecurityError':
        return system
          ? text('O compartilhamento foi cancelado ou bloqueado. Reabra o seletor para tentar novamente.')
          : text('O acesso ao microfone foi cancelado ou bloqueado. Confira a permissão do site no navegador.');
      case 'InvalidStateError':
        return text('Deixe esta aba em primeiro plano e clique novamente para compartilhar.');
      case 'NotReadableError':
        return text('Não foi possível acessar a fonte de áudio. Confira as permissões no sistema ou tente outra fonte.');
      case 'NotFoundError':
        return text('Nenhuma fonte disponível. Tente outra fonte ou abra um arquivo de música.');
      default:
        return text('Não foi possível iniciar a captura. Tente novamente ou use um arquivo de música.');
    }
  }

  function updateNote() {
    const blocked = blockedReason();
    note.hidden = !blocked && !firefox;
    if (blocked || firefox) {
      const status = blocked || text('O Firefox pode abrir o seletor sem oferecer áudio. Se a opção não aparecer, use um arquivo de música ou tente compartilhar no Chrome ou Edge de computador.');
      if (note.textContent !== status) note.textContent = status;
    }
    start.disabled = Boolean(blocked);
    const secureLink = document.getElementById('capture-https-link');
    if (secureLink) {
      secureLink.hidden = window.isSecureContext || location.protocol !== 'http:';
      if (!secureLink.hidden) secureLink.href = location.href.replace(/^http:/, 'https:');
    }
  }

  window.captureGuide = {
    blockedReason,
    describeError,
    refresh: updateNote,
    open() {
      document.getElementById('source-close').click();
      updateNote();
      guide.showModal();
    }
  };
  document.getElementById('capture-guide-close').onclick = () => guide.close();
  start.onclick = () => {
    if (blockedReason()) return;
    guide.close();
    capture('system');
  };
  document.getElementById('capture-guide-file').onclick = () => {
    guide.close();
    document.getElementById('file').click();
  };
  document.getElementById('system').onclick = () => window.captureGuide.open();
  document.addEventListener('puts-language-change', updateNote);
})();
