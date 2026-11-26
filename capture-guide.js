(() => {
 const guide=document.getElementById('capture-guide');
 window.captureGuide={open(){document.getElementById('source-panel').hidden=true;document.getElementById('source-toggle').setAttribute('aria-expanded','false');document.getElementById('capture-browser-note').hidden=!/Firefox\//.test(navigator.userAgent);guide.showModal();}};
 document.getElementById('capture-guide-close').onclick=()=>guide.close();
 document.getElementById('capture-start').onclick=()=>{guide.close();capture('system');};
 document.getElementById('capture-guide-file').onclick=()=>{guide.close();document.getElementById('file').click();};
 document.getElementById('system').onclick=()=>window.captureGuide.open();
})();
