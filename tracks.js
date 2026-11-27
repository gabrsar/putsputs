(() => {
 const author='Kevin MacLeod';
 const license='CC BY 4.0';
 const licenseUrl='https://creativecommons.org/licenses/by/4.0/';
 const entries=[
  ['cipher','Cipher',231.262,'USUAN1100844'],
  ['local-forecast','Local Forecast',165.224,'USUAN1300010'],
  ['dream-culture','Dream Culture',214.361,'USUAN1300046'],
  ['disco-con-tutti','Disco con Tutti',236.352,'USUAN1200091'],
  ['itty-bitty-8-bit','Itty Bitty 8 Bit',193.824,'USUAN1100764'],
  ['the-descent','The Descent',191.765,'USUAN1200094'],
  ['funkorama','Funkorama',201.456,'USUAN1100474'],
  ["carefree", "Carefree", 205, "USUAN1400037"],
  ["electrodoodle", "Electrodoodle", 166, "USUAN1200079"],
  ["night-of-the-owl", "Night of the Owl", 233, "USUAN1100597"]
 ];
 const macLeodTracks=Object.fromEntries(entries.map(([key,name,duration,isrc])=>[key,{
  name,duration,author,license,licenseUrl,
  source:`https://incompetech.com/music/royalty-free/index.html?isrc=${isrc}`,
  credit:`${name} — ${author} (incompetech.com) · ${license}`
 }]));
 window.PutsTracks={
  'beethoven-five':{
   name:'Beethoven · 5ª Sinfonia (Allegro con brio)',
   author:'Skidmore College Orchestra',
   duration:500.115,
   license:'Domínio público',
   source:'https://commons.wikimedia.org/wiki/File:Ludwig_van_Beethoven_-_symphony_no._5_in_c_minor,_op._67_-_i._allegro_con_brio.ogg'
  },
  ...macLeodTracks
 };
})();
