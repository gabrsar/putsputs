(() => {
  'use strict';

  const languages = new Map([
    ['pt-BR', 'Português (Brasil)'],
    ['en', 'English'],
    ['zh-CN', '简体中文'],
    ['hi', 'हिन्दी'],
    ['es', 'Español'],
    ['ar', 'العربية']
  ]);
  const storageKey = 'avs-language-v1';
  const languageColumns = ['en', 'zh-CN', 'hi', 'es', 'ar'];

  // Each row gives the original Portuguese, then English, Chinese, Hindi, Spanish, and Arabic.
  const messages = new Map(`
Idioma|Language|语言|भाषा|Idioma|اللغة
Automático|Automatic|自动|स्वचालित|Automático|تلقائي
putsputs · veja o som|putsputs · see the sound|putsputs · 看见声音|putsputs · ध्वनि देखें|putsputs · mira el sonido|putsputs · شاهد الصوت
Uma música, infinitos visuais. Entre, curta, brinque e crie — no seu navegador.|One song, endless visuals. Enjoy, play, and create in your browser.|一首歌，无限种视觉效果。在浏览器中欣赏、探索和创作。|एक गीत, अनगिनत दृश्य। अपने ब्राउज़र में आनंद लें, प्रयोग करें और रचें।|Una canción, infinitos efectos visuales. Disfruta, juega y crea en tu navegador.|أغنية واحدة وتأثيرات بصرية بلا حدود. استمتع وجرّب وابتكر في متصفحك.
Pular para o visual|Skip to the visual|跳到视觉效果|दृश्य पर जाएँ|Ir a la visualización|انتقل إلى العرض البصري
putsputs · início|putsputs · home|putsputs · 主页|putsputs · मुखपृष्ठ|putsputs · inicio|putsputs · الرئيسية
Como você quer explorar?|How would you like to explore?|你想如何探索？|आप कैसे एक्सप्लोर करना चाहते हैं?|¿Cómo quieres explorar?|كيف تريد الاستكشاف؟
Curtir|Enjoy|欣赏|आनंद लें|Disfrutar|استمتع
Brincar|Play|玩转|प्रयोग करें|Jugar|جرّب
Criar|Create|创作|बनाएँ|Crear|ابتكر
Sobre · créditos · atalhos|About · credits · shortcuts|关于 · 制作人员 · 快捷键|परिचय · श्रेय · शॉर्टकट|Acerca de · créditos · atajos|حول الموقع · الاعتمادات · الاختصارات
F · tela cheia. ← / → · visuais. Espaço · pausar/retomar. Espaço controla a sequência de visuais. Arraste para mover a câmera dos visuais 3D.|F · fullscreen. ← / → · change visuals. Space · pause or resume the visual sequence. Drag to move the camera in 3D visuals.|F · 全屏。← / → · 切换视觉效果。空格 · 暂停或继续播放视觉序列。拖动可移动 3D 视觉效果的相机。|F · पूरी स्क्रीन। ← / → · दृश्य बदलें। स्पेस · दृश्यों का क्रम रोकें या जारी रखें। 3D दृश्यों में कैमरा खींचकर घुमाएँ।|F · pantalla completa. ← / → · cambiar de visual. Espacio · pausar o reanudar la secuencia de visuales. Arrastra para mover la cámara en los visuales 3D.|F · ملء الشاشة. ← / → · تبديل التأثيرات. مفتاح المسافة · إيقاف التسلسل البصري مؤقتًا أو استئنافه. اسحب لتحريك الكاميرا في العروض ثلاثية الأبعاد.
Músicas livres · créditos|Free music · credits|免费音乐 · 署名|मुक्त संगीत · श्रेय|Música libre · créditos|موسيقى حرة · الاعتمادات
). Licença|). License|）。授权许可：|)। लाइसेंस|). Licencia|). الترخيص
Creative Commons Atribuição 4.0|Creative Commons Attribution 4.0|知识共享署名 4.0|क्रिएटिव कॉमन्स एट्रिब्यूशन 4.0|Creative Commons Atribución 4.0|المشاع الإبداعي — نَسب المُصنَّف 4.0
. MP3 originais, sem alterações.|. Original MP3s, unmodified.|。原始 MP3 未经修改。|। मूल MP3 में बदलाव नहीं किए गए हैं।|. MP3 originales, sin modificaciones.|. ملفات MP3 الأصلية دون تعديل.
Fontes:|Sources:|来源：|स्रोत:|Fuentes:|المصادر:
◌ Seu áudio fica aqui.|◌ Your audio stays here.|◌ 你的音频留在此处。|◌ आपका ऑडियो यहीं रहता है।|◌ Tu audio se queda aquí.|◌ يبقى صوتك هنا.
Privacidade e funcionamento|Privacy and how it works|隐私与工作原理|गोपनीयता और कार्यप्रणाली|Privacidad y funcionamiento|الخصوصية وطريقة العمل
Os presets integrados não gravam nem enviam o áudio para servidores. A análise acontece no navegador. O código do editor, presets criados e preferências são salvos apenas neste navegador. As fontes são servidas por este site; p5.js e Ace são carregados por CDN.|Built-in presets neither record audio nor send it to servers. Your browser analyzes it locally. Editor code, custom presets, and preferences are saved only in this browser. This site hosts the fonts, and p5.js and Ace load from a CDN.|内置预设不会录音，也不会将音频发送到服务器。分析在浏览器中进行。编辑器代码、自定义预设和偏好设置仅保存在此浏览器中。字体由本站提供，p5.js 和 Ace 通过 CDN 加载。|बिल्ट-इन प्रीसेट ऑडियो रिकॉर्ड नहीं करते और उसे सर्वर पर नहीं भेजते। विश्लेषण ब्राउज़र में होता है। संपादक का कोड, आपके प्रीसेट और प्राथमिकताएँ इसी ब्राउज़र में सहेजे जाते हैं। फ़ॉन्ट इस साइट से और p5.js व Ace CDN से लोड होते हैं।|Los presets integrados no graban ni envían audio a servidores. El navegador realiza el análisis. El código del editor, los presets propios y las preferencias solo se guardan en este navegador. Las fuentes se sirven desde este sitio, y p5.js y Ace se cargan mediante una CDN.|لا تسجل الإعدادات المدمجة الصوت ولا ترسله إلى خوادم. يجري التحليل في المتصفح. تُحفظ شيفرة المحرر والإعدادات المخصصة والتفضيلات في هذا المتصفح فقط. يوفر الموقع الخطوط، ويُحمّل p5.js وAce عبر شبكة توصيل المحتوى.
Compartilhar o áudio de uma aba ou tela exige sua permissão. A captura acontece nesta página e precisa ser reconectada depois de recarregar. Presets personalizados executam o código que você carregar.|Sharing audio from a tab or screen requires your permission. Capture runs on this page and must be reconnected after a reload. Custom presets run the code you load.|共享标签页或屏幕音频需要你的许可。音频在此页面捕获，刷新后需重新连接。自定义预设会运行你加载的代码。|टैब या स्क्रीन का ऑडियो साझा करने के लिए आपकी अनुमति चाहिए। कैप्चर इसी पेज पर होता है और पेज फिर लोड करने पर उसे दोबारा कनेक्ट करना होगा। कस्टम प्रीसेट आपका लोड किया हुआ कोड चलाते हैं।|Compartir el audio de una pestaña o pantalla requiere tu permiso. La captura ocurre en esta página y hay que volver a conectarla al recargar. Los presets personalizados ejecutan el código que cargues.|تتطلب مشاركة صوت علامة تبويب أو شاشة إذنك. يجري التقاط الصوت في هذه الصفحة، وتلزم إعادة الاتصال بعد تحديثها. تشغّل الإعدادات المخصصة الشيفرة التي تحمّلها.
Feito com p5.js. Inspirado no AVS do Winamp.|Built with p5.js. Inspired by Winamp AVS.|使用 p5.js 制作，灵感来自 Winamp AVS。|p5.js से बनाया गया। Winamp AVS से प्रेरित।|Hecho con p5.js. Inspirado en AVS de Winamp.|صُنع باستخدام p5.js، واستُوحي من AVS في Winamp.
Dia / noite|Day / night|日间 / 夜间|दिन / रात|Día / noche|نهار / ليل
Ativar modo dia|Switch to day mode|切换到日间模式|दिन का मोड चालू करें|Activar modo de día|تفعيل الوضع النهاري
Ativar modo noite|Switch to night mode|切换到夜间模式|रात का मोड चालू करें|Activar modo de noche|تفعيل الوضع الليلي
Reprodução|Playback|播放|प्लेबैक|Reproducción|التشغيل
♫ Música de exemplo|♫ Sample music|♫ 示例音乐|♫ उदाहरण संगीत|♫ Música de ejemplo|♫ موسيقى تجريبية
♫ Seu arquivo|♫ Your file|♫ 你的文件|♫ आपकी फ़ाइल|♫ Tu archivo|♫ ملفك
♫ Áudio de aba ou do computador|♫ Tab or computer audio|♫ 标签页或电脑音频|♫ टैब या कंप्यूटर का ऑडियो|♫ Audio de pestaña o del ordenador|♫ صوت علامة تبويب أو الكمبيوتر
♫ Escolher áudio|♫ Choose audio|♫ 选择音频|♫ ऑडियो चुनें|♫ Elegir audio|♫ اختر الصوت
Pausar / retomar música|Pause / resume music|暂停 / 继续播放音乐|संगीत रोकें / जारी रखें|Pausar / reanudar música|إيقاف الموسيقى مؤقتًا / استئنافها
Pausar|Pause|暂停|रोकें|Pausar|إيقاف مؤقت
Pausar música|Pause music|暂停音乐|संगीत रोकें|Pausar música|إيقاف الموسيقى مؤقتًا
Retomar música|Resume music|继续播放音乐|संगीत जारी रखें|Reanudar música|استئناف الموسيقى
Pausar animação|Pause animation|暂停动画|ऐनिमेशन रोकें|Pausar animación|إيقاف الحركة مؤقتًا
Retomar animação|Resume animation|继续播放动画|ऐनिमेशन जारी रखें|Reanudar animación|استئناف الحركة
Posição na música|Playback position|播放位置|संगीत में स्थिति|Posición de reproducción|موضع التشغيل
Ligar som|Unmute|取消静音|आवाज़ चालू करें|Activar sonido|تشغيل الصوت
Silenciar|Mute|静音|आवाज़ बंद करें|Silenciar|كتم الصوت
Ligar / desligar som|Toggle sound|切换静音|आवाज़ चालू / बंद करें|Activar / desactivar sonido|تشغيل الصوت / كتمه
Volume|Volume|音量|वॉल्यूम|Volumen|مستوى الصوت
Carregando exemplo…|Loading sample…|正在加载示例…|उदाहरण लोड हो रहा है…|Cargando ejemplo…|جارٍ تحميل الموسيقى التجريبية…
Carregando…|Loading…|正在加载…|लोड हो रहा है…|Cargando…|جارٍ التحميل…
Pausado|Paused|已暂停|रुका हुआ|En pausa|متوقف مؤقتًا
Sem áudio|No audio|无音频|ऑडियो नहीं|Sin audio|لا يوجد صوت
Sem som|Muted|已静音|आवाज़ बंद है|Sin sonido|الصوت مكتوم
Ao vivo|Live|实时|लाइव|En directo|مباشر
Tocando|Playing|播放中|चल रहा है|Reproduciendo|قيد التشغيل
Escolher fonte de áudio|Choose an audio source|选择音频来源|ऑडियो स्रोत चुनें|Elegir fuente de audio|اختر مصدر الصوت
Usar meu áudio|Use my audio|使用我的音频|मेरा ऑडियो इस्तेमाल करें|Usar mi audio|استخدام صوتي
Escolher áudio|Choose audio|选择音频|ऑडियो चुनें|Elegir audio|اختر الصوت
Músicas de exemplo|Sample music|示例音乐|उदाहरण संगीत|Música de ejemplo|موسيقى تجريبية
Abrir arquivo|Open file|打开文件|फ़ाइल खोलें|Abrir archivo|فتح ملف
Áudio de aba ou do computador|Tab or computer audio|标签页或电脑音频|टैब या कंप्यूटर का ऑडियो|Audio de pestaña o del ordenador|صوت علامة تبويب أو الكمبيوتر
Microfone|Microphone|麦克风|माइक्रोफ़ोन|Micrófono|الميكروفون
Áudio compartilhado|Shared audio|共享音频|साझा ऑडियो|Audio compartido|صوت مشترك
Áudio do computador|Computer audio|电脑音频|कंप्यूटर का ऑडियो|Audio del ordenador|صوت الكمبيوتر
Arquivo do seu computador|File from your computer|电脑中的文件|आपके कंप्यूटर की फ़ाइल|Archivo de tu ordenador|ملف من جهازك
O som continua na fonte original|Sound keeps playing at the source|声音继续在来源处播放|आवाज़ मूल स्रोत पर चलती रहती है|El sonido sigue reproduciéndose en la fuente original|يستمر تشغيل الصوت في المصدر الأصلي
Desconectar áudio|Disconnect audio|断开音频|ऑडियो डिस्कनेक्ट करें|Desconectar audio|قطع اتصال الصوت
Exemplos|Samples|示例|उदाहरण|Ejemplos|أمثلة
Cipher · eletrônica|Cipher · electronic|Cipher · 电子|Cipher · इलेक्ट्रॉनिक|Cipher · electrónica|Cipher · موسيقى إلكترونية
Local Forecast · groove|Local Forecast · groove|Local Forecast · 律动|Local Forecast · ग्रूव|Local Forecast · groove|Local Forecast · إيقاع
Dream Culture · ambiente|Dream Culture · ambient|Dream Culture · 氛围音乐|Dream Culture · ऐम्बिएंट|Dream Culture · ambiental|Dream Culture · موسيقى محيطية
Tocar|Play|播放|चलाएँ|Reproducir|تشغيل
Você escolhe o que compartilhar. O áudio é analisado aqui, sem gravação.|You choose what to share. Audio is analyzed here without recording.|你可以选择共享内容。音频在此分析，不会被录制。|आप चुनते हैं कि क्या साझा करना है। ऑडियो का विश्लेषण यहीं होता है और उसे रिकॉर्ड नहीं किया जाता।|Tú eliges qué compartir. El audio se analiza aquí sin grabarse.|أنت تختار ما تشاركه. يُحلَّل الصوت هنا من دون تسجيل.
Visualizador|Visualizer|可视化工具|विज़ुअलाइज़र|Visualizador|عارض المؤثرات
Palco|Stage|舞台|मंच|Escenario|المسرح
Este visual encontrou um problema. Escolha outro ou abra Criar.|This visual ran into a problem. Choose another one or open Create.|此视觉效果遇到问题。请选择其他效果或打开创作。|इस दृश्य में समस्या आई। कोई दूसरा दृश्य चुनें या बनाएँ टैब खोलें।|Hubo un problema con este visual. Elige otro o abre Crear.|حدثت مشكلة في هذا العرض. اختر عرضًا آخر أو افتح قسم الابتكار.
Visual anterior · ←|Previous visual · ←|上一个视觉效果 · ←|पिछला दृश्य · ←|Visual anterior · ←|العرض السابق · ←
Próximo visual · →|Next visual · →|下一个视觉效果 · →|अगला दृश्य · →|Siguiente visual · →|العرض التالي · →
Visual anterior|Previous visual|上一个视觉效果|पिछला दृश्य|Visual anterior|العرض السابق
Próximo visual|Next visual|下一个视觉效果|अगला दृश्य|Siguiente visual|العرض التالي
Fixar visual|Hold visual|固定视觉效果|दृश्य स्थिर रखें|Fijar visual|تثبيت العرض
Visual fixado|Visual held|视觉效果已固定|दृश्य स्थिर है|Visual fijado|العرض مثبت
Troca automática|Automatic cycling|自动切换|अपने आप दृश्य बदलें|Cambio automático|التبديل التلقائي
Ⅱ Pausar troca|Ⅱ Pause cycling|Ⅱ 暂停切换|Ⅱ बदलाव रोकें|Ⅱ Pausar cambio|Ⅱ إيقاف التبديل مؤقتًا
▶ Retomar troca|▶ Resume cycling|▶ 继续切换|▶ बदलाव जारी रखें|▶ Reanudar cambio|▶ استئناف التبديل
Pausar troca de visuais|Pause visual cycling|暂停切换视觉效果|दृश्य बदलना रोकें|Pausar cambio de visuales|إيقاف تبديل العروض مؤقتًا
Retomar troca de visuais|Resume visual cycling|继续切换视觉效果|दृश्य बदलना जारी रखें|Reanudar cambio de visuales|استئناف تبديل العروض
Visual aleatório|Random visual|随机视觉效果|कोई भी दृश्य|Visual aleatorio|عرض عشوائي
Um visual aleatório|Pick a random visual|选择随机视觉效果|कोई भी दृश्य चुनें|Elegir un visual al azar|اختر عرضًا عشوائيًا
Visuais|Visuals|视觉效果|दृश्य|Visuales|العروض البصرية
VISUAIS|VISUALS|视觉效果|दृश्य|VISUALES|العروض البصرية
Favoritar visual|Favorite visual|收藏视觉效果|दृश्य पसंदीदा में जोड़ें|Marcar visual como favorito|إضافة العرض إلى المفضلة
Tela cheia · F|Fullscreen · F|全屏 · F|पूरी स्क्रीन · F|Pantalla completa · F|ملء الشاشة · F
Tela cheia|Fullscreen|全屏|पूरी स्क्रीन|Pantalla completa|ملء الشاشة
Sair · Esc|Exit · Esc|退出 · Esc|बाहर निकलें · Esc|Salir · Esc|خروج · Esc
Retomar áudio|Resume audio|恢复音频|ऑडियो फिर चलाएँ|Reanudar audio|استئناف الصوت
Fechar ajustes|Close settings|关闭设置|सेटिंग बंद करें|Cerrar ajustes|إغلاق الإعدادات
Concluir ×|Done ×|完成 ×|हो गया ×|Listo ×|تم ×
SEU JEITO|MAKE IT YOURS|你的风格|अपने अंदाज़ में|A TU MANERA|على طريقتك
Brinque com o visual.|Play with the visual.|调整视觉效果。|दृश्य के साथ प्रयोग करें।|Juega con el visual.|جرّب تعديل العرض البصري.
Movimento|Motion|运动|गति|Movimiento|الحركة
Brilho|Brightness|亮度|चमक|Brillo|السطوع
↻ Variar visual|↻ Vary visual|↻ 变换视觉效果|↻ दृश्य में बदलाव करें|↻ Variar visual|↻ تنويع العرض
Restaurar ajustes|Reset settings|重置设置|सेटिंग रीसेट करें|Restablecer ajustes|إعادة ضبط الإعدادات
Resposta ao som|Audio response|音频响应|ऑडियो की प्रतिक्रिया|Respuesta al sonido|الاستجابة للصوت
Ajustes de som|Sound settings|声音设置|आवाज़ की सेटिंग|Ajustes de sonido|إعدادات الصوت
Ganho|Gain|增益|गेन|Ganancia|الكسب
Suavização|Smoothing|平滑|स्मूदिंग|Suavizado|التنعيم
Curva de amplitude|Amplitude curve|振幅曲线|आयाम वक्र|Curva de amplitud|منحنى السعة
Raiz quadrada|Square root|平方根|वर्गमूल|Raíz cuadrada|جذر تربيعي
Logarítmica|Logarithmic|对数|लघुगणकीय|Logarítmica|لوغاريتمي
Linear|Linear|线性|रैखिक|Lineal|خطي
Renderização|Rendering|渲染|रेंडरिंग|Renderizado|التصيير
Trocar a qualidade reinicia o visual atual e mantém o áudio.|Changing quality restarts the current visual while keeping audio running.|调整质量会重启当前视觉效果，音频继续播放。|गुणवत्ता बदलने पर मौजूदा दृश्य फिर शुरू होगा और ऑडियो चलता रहेगा।|Cambiar la calidad reinicia el visual actual y mantiene el audio.|يُعيد تغيير الجودة بدء العرض الحالي مع استمرار الصوت.
Alta · resolução nativa + AA|High · native resolution + AA|高 · 原生分辨率 + 抗锯齿|उच्च · नेटिव रिज़ॉल्यूशन + AA|Alta · resolución nativa + AA|عالية · الدقة الأصلية + تنعيم الحواف
Ultra · supersampling 2×|Ultra · 2× supersampling|超高 · 2× 超采样|अल्ट्रा · 2× सुपर सैंपलिंग|Ultra · supermuestreo 2×|فائقة · أخذ عينات مضاعف 2×
Equilibrada|Balanced|均衡|संतुलित|Equilibrada|متوازنة
Mais leve|Performance|流畅|बेहतर प्रदर्शन|Rendimiento|أداء أسرع
Compressão log|Log compression|对数压缩|लॉग कम्प्रेशन|Compresión logarítmica|ضغط لوغاريتمي
Agrupamento|Frequency grouping|频率分组|आवृत्ति समूहीकरण|Agrupación|تجميع الترددات
Detalhe · 48 bandas|Detailed · 48 bands|精细 · 48 个频带|विस्तृत · 48 बैंड|Detalle · 48 bandas|مفصّل · 48 نطاقًا
Equilibrado · 24 bandas|Balanced · 24 bands|均衡 · 24 个频带|संतुलित · 24 बैंड|Equilibrado · 24 bandas|متوازن · 24 نطاقًا
Terços de oitava|Third-octave bands|三分之一倍频程|तिहाई ऑक्टेव|Tercios de octava|نطاقات ثلث الأوكتاف
Oitavas|Octaves|倍频程|ऑक्टेव|Octavas|أوكتافات
Graves / percussão|Bass / percussion|低音 / 打击乐|बास / तालवाद्य|Graves / percusión|صوت جهير / إيقاع
Vozes / harmônicos|Voices / harmonics|人声 / 泛音|स्वर / हार्मोनिक्स|Voces / armónicos|أصوات بشرية / توافقيات
Corte dos agudos|High-frequency cutoff|高频截止|उच्च आवृत्ति कटऑफ़|Corte de agudos|حد الترددات العالية
Resolução FFT|FFT resolution|FFT 分辨率|FFT रिज़ॉल्यूशन|Resolución FFT|دقة FFT
Agrupamentos revelam regiões do som, não instrumentos isolados. O corte em 12 kHz evita bandas altas sem sinal.|Groups show frequency ranges in the sound. A 12 kHz cutoff avoids empty high-frequency bands.|分组显示声音的频率范围。12 kHz 截止可避开没有信号的高频带。|समूह ध्वनि की आवृत्ति सीमाएँ दिखाते हैं। 12 kHz की कटऑफ़ सीमा खाली उच्च-आवृत्ति बैंड छोड़ देती है।|Las agrupaciones muestran rangos de frecuencias del sonido. El corte a 12 kHz evita bandas altas sin señal.|تُظهر المجموعات نطاقات تردد الصوت. يستبعد حد 12 كيلوهرتز النطاقات العالية الخالية من الإشارة.
Editar bandas individualmente|Edit individual bands|逐个编辑频带|अलग-अलग बैंड संपादित करें|Editar bandas por separado|تعديل كل نطاق على حدة
De|From|从|से|Desde|من
até|to|到|तक|hasta|إلى
Sensibilidade|Sensitivity|灵敏度|संवेदनशीलता|Sensibilidad|الحساسية
frequência mínima|minimum frequency|最低频率|न्यूनतम आवृत्ति|frecuencia mínima|أدنى تردد
frequência máxima|maximum frequency|最高频率|अधिकतम आवृत्ति|frecuencia máxima|أقصى تردد
sensibilidade|sensitivity|灵敏度|संवेदनशीलता|sensibilidad|الحساسية
intensidade|intensity|强度|तीव्रता|intensidad|الشدة
Espectro e waveform|Spectrum and waveform|频谱与波形|स्पेक्ट्रम और वेवफ़ॉर्म|Espectro y forma de onda|طيف الترددات والشكل الموجي
Diagnóstico|Diagnostics|诊断|निदान|Diagnóstico|التشخيص
Sinal sintético|Synthetic signal|合成信号|कृत्रिम सिग्नल|Señal sintética|إشارة اصطناعية
Laboratório em tela cheia|Fullscreen lab|全屏实验室|पूरी स्क्रीन में लैब|Laboratorio en pantalla completa|المختبر بملء الشاشة
Fechar editor|Close editor|关闭编辑器|संपादक बंद करें|Cerrar editor|إغلاق المحرر
Editor de presets|Preset editor|预设编辑器|प्रीसेट संपादक|Editor de presets|محرر الإعدادات المسبقة
SEU PRESET|YOUR PRESET|你的预设|आपका प्रीसेट|TU PRESET|إعدادك المسبق
Crie a partir daqui.|Make something here.|在这里开始创作。|यहाँ से बनाना शुरू करें।|Crea desde aquí.|ابدأ الإبداع من هنا.
＋ Novo|＋ New|＋ 新建|＋ नया|＋ Nuevo|＋ جديد
Recuperar rascunho|Restore draft|恢复草稿|ड्राफ़्ट वापस लाएँ|Recuperar borrador|استعادة المسودة
▶ Aplicar|▶ Apply|▶ 应用|▶ लागू करें|▶ Aplicar|▶ تطبيق
Baixar código JavaScript|Download JavaScript code|下载 JavaScript 代码|JavaScript कोड डाउनलोड करें|Descargar código JavaScript|تنزيل شيفرة JavaScript
Exportar .js|Export .js|导出 .js|.js एक्सपोर्ट करें|Exportar .js|تصدير .js
Importar .js|Import .js|导入 .js|.js इम्पोर्ट करें|Importar .js|استيراد .js
Editor de código p5.js|p5.js code editor|p5.js 代码编辑器|p5.js कोड संपादक|Editor de código p5.js|محرر شيفرة p5.js
Nome do seu preset|Your preset name|预设名称|आपके प्रीसेट का नाम|Nombre de tu preset|اسم إعدادك المسبق
Uma boa ideia começa aqui|A good idea starts here|好点子从这里开始|एक अच्छा विचार यहीं से शुरू होता है|Una buena idea empieza aquí|تبدأ الفكرة الجيدة من هنا
Salvar|Save|保存|सहेजें|Guardar|حفظ
Salvar cópia|Save a copy|保存副本|कॉपी सहेजें|Guardar una copia|حفظ نسخة
Carregar presets|Load presets|加载预设|प्रीसेट लोड करें|Cargar presets|تحميل الإعدادات المسبقة
Exportar biblioteca|Export library|导出库|लाइब्रेरी एक्सपोर्ट करें|Exportar biblioteca|تصدير المكتبة
Seed|Seed|随机种子|सीड|Semilla|البذرة العشوائية
Gerar outra seed|Generate another seed|生成新种子|नई सीड बनाएँ|Generar otra semilla|توليد بذرة أخرى
Editar no WebStorm / arquivo externo|Edit in WebStorm / external file|在 WebStorm 中编辑 / 外部文件|WebStorm / बाहरी फ़ाइल में संपादित करें|Editar en WebStorm / archivo externo|التحرير في WebStorm / ملف خارجي
Voltar ao visual.js|Return to visual.js|返回 visual.js|visual.js पर लौटें|Volver a visual.js|العودة إلى visual.js
Acompanhar alterações no arquivo|Watch for file changes|监测文件改动|फ़ाइल के बदलाव देखें|Seguir cambios en el archivo|مراقبة تغييرات الملف
Carregando arquivo…|Loading file…|正在加载文件…|फ़ाइल लोड हो रही है…|Cargando archivo…|جارٍ تحميل الملف…
API para suas ideias|API for your ideas|创作用 API|आपके विचारों के लिए API|API para tus ideas|واجهة برمجة لأفكارك
p → p5.js · a → som + interação · s → estado|p → p5.js · a → sound + interaction · s → state|p → p5.js · a → 声音与交互 · s → 状态|p → p5.js · a → ध्वनि और इंटरैक्शन · s → स्थिति|p → p5.js · a → sonido e interacción · s → estado|p → p5.js · a → الصوت والتفاعل · s → الحالة
O editor é o corpo de draw(p,a,s).|The editor contains the body of draw(p,a,s).|编辑器中的内容是 draw(p,a,s) 的函数体。|संपादक में draw(p,a,s) फ़ंक्शन की बॉडी है।|El editor contiene el cuerpo de draw(p,a,s).|يحتوي المحرر على جسم الدالة draw(p,a,s).
Salvar guarda o código neste navegador.|Save stores the code in this browser.|保存会将代码保存在此浏览器中。|सहेजें बटन कोड को इसी ब्राउज़र में रखता है।|Guardar almacena el código en este navegador.|يحفظ زر الحفظ الشيفرة في هذا المتصفح.
Exportar biblioteca cria um backup em JSON.|Export library creates a JSON backup.|导出库会创建 JSON 备份。|लाइब्रेरी एक्सपोर्ट करने पर JSON बैकअप बनता है।|Exportar biblioteca crea una copia de seguridad en JSON.|يُنشئ تصدير المكتبة نسخة احتياطية بتنسيق JSON.
Fechar biblioteca|Close library|关闭预设库|लाइब्रेरी बंद करें|Cerrar biblioteca|إغلاق المكتبة
Biblioteca de visuais|Visual library|视觉效果库|दृश्य लाइब्रेरी|Biblioteca de visuales|مكتبة العروض
Sua sessão.|Your session.|你的会话。|आपका सत्र।|Tu sesión.|جلستك.
Preset anterior|Previous preset|上一个预设|पिछला प्रीसेट|Preset anterior|الإعداد السابق
Preset|Preset|预设|प्रीसेट|Preset|إعداد مسبق
Próximo preset|Next preset|下一个预设|अगला प्रीसेट|Siguiente preset|الإعداد التالي
DEIXA ROLAR|LET IT PLAY|自动播放|चलने दें|DÉJALO SONAR|اتركه يعمل
Troca automática de visuais.|Visuals change automatically.|自动切换视觉效果。|दृश्य अपने आप बदलते हैं।|Los visuales cambian automáticamente.|تبديل العروض البصرية تلقائيًا.
⇄ Shuffle: desligado|⇄ Shuffle off|⇄ 随机播放已关闭|⇄ शफ़ल बंद है|⇄ Aleatorio desactivado|⇄ التبديل العشوائي متوقف
Troca automática: desligada|Automatic cycling off|自动切换已关闭|अपने आप बदलाव बंद हैं|Cambio automático desactivado|التبديل التلقائي متوقف
Troca automática: ligada|Automatic cycling on|自动切换已开启|अपने आप बदलाव चालू हैं|Cambio automático activado|التبديل التلقائي مفعّل
Ajustar a sequência|Sequence settings|序列设置|क्रम की सेटिंग|Ajustar la secuencia|ضبط التسلسل
Tempo base|Base interval|基本间隔|मूल अंतराल|Intervalo base|الفاصل الزمني الأساسي
Dinâmico · seguir a música|Dynamic · follow the music|动态 · 跟随音乐|डायनमिक · संगीत के साथ|Dinámico · seguir la música|ديناميكي · يتبع الموسيقى
15 segundos|15 seconds|15 秒|15 सेकंड|15 segundos|15 ثانية
30 segundos|30 seconds|30 秒|30 सेकंड|30 segundos|30 ثانية
1 minuto|1 minute|1 分钟|1 मिनट|1 minuto|دقيقة واحدة
1 min 30|1 min 30 sec|1 分 30 秒|1 मिनट 30 सेकंड|1 min 30 s|دقيقة و30 ثانية
5 minutos|5 minutes|5 分钟|5 मिनट|5 minutos|5 دقائق
10 minutos|10 minutes|10 分钟|10 मिनट|10 minutos|10 دقائق
30 minutos|30 minutes|30 分钟|30 मिनट|30 minutos|30 دقيقة
Dinâmico acompanha as frases da música, sem contagem fixa. Nos demais modos, o tempo escolhido é respeitado.|Dynamic mode follows musical phrases. Other modes use your chosen interval.|动态模式跟随乐句。其他模式使用你选择的时间间隔。|डायनमिक मोड संगीत के फ़्रेज़ के साथ बदलता है। बाकी मोड चुना हुआ अंतराल इस्तेमाल करते हैं।|El modo dinámico sigue las frases musicales. Los otros modos usan el intervalo elegido.|يتبع الوضع الديناميكي الجمل الموسيقية. تستخدم الأوضاع الأخرى الفاصل الذي تختاره.
Seguir viradas da música|Follow changes in the music|跟随音乐变化|संगीत के बदलावों का अनुसरण करें|Seguir los cambios de la música|متابعة تغيّرات الموسيقى
Variar agrupamento e escala|Vary band grouping and scale|变换频带分组和比例|बैंड समूह और स्केल बदलें|Variar agrupación y escala|تنويع تجميع النطاقات والمقياس
Buscar um visual…|Search visuals…|搜索视觉效果…|दृश्य खोजें…|Buscar un visual…|ابحث عن عرض بصري…
Buscar presets|Search presets|搜索预设|प्रीसेट खोजें|Buscar presets|البحث عن إعدادات مسبقة
Filtrar coleção|Filter collection|筛选集合|संग्रह फ़िल्टर करें|Filtrar colección|تصفية المجموعة
Todos os climas|All moods|所有氛围|सभी मूड|Todos los ambientes|كل الأجواء
Favoritos|Favorites|收藏|पसंदीदा|Favoritos|المفضلة
Orgânicos e psicodélicos|Organic and psychedelic|有机与迷幻|ऑर्गैनिक और साइकेडेलिक|Orgánicos y psicodélicos|عضوية وحالمة
Geometria e moiré|Geometry and moiré|几何与摩尔纹|ज्यामिति और मोइरे|Geometría y muaré|أشكال هندسية وتموّجات مواريه
Mundos e viagens|Worlds and journeys|世界与旅程|दुनिया और यात्राएँ|Mundos y viajes|عوالم ورحلات
Lounge e ambientes|Lounge and ambient|休闲与氛围|लाउंज और ऐम्बिएंट|Lounge y ambiental|استرخاء وأجواء محيطية
Ciência e fractais|Science and fractals|科学与分形|विज्ञान और फ्रैक्टल|Ciencia y fractales|علوم وكسوريات
Clássicos AVS|AVS classics|AVS 经典|AVS क्लासिक|Clásicos de AVS|كلاسيكيات AVS
Meus presets|My presets|我的预设|मेरे प्रीसेट|Mis presets|إعداداتي المسبقة
Seus presets|Your presets|你的预设|आपके प्रीसेट|Tus presets|إعداداتك المسبقة
Orgânico|Organic|有机|ऑर्गैनिक|Orgánico|عضوي
Geometria|Geometry|几何|ज्यामिति|Geometría|هندسة
Mundos|Worlds|世界|दुनिया|Mundos|عوالم
Lounge|Lounge|休闲|लाउंज|Lounge|استرخاء
Ciência|Science|科学|विज्ञान|Ciencia|علوم
SEU EXPERIMENTO|YOUR EXPERIMENT|你的实验|आपका प्रयोग|TU EXPERIMENTO|تجربتك
Novo preset|New preset|新建预设|नया प्रीसेट|Nuevo preset|إعداد مسبق جديد
Na sessão|In session|加入会话|सत्र में|En la sesión|ضمن الجلسة
Ativos no shuffle|Active in shuffle|已加入随机播放|शफ़ल में शामिल|Activos en aleatorio|العروض المشاركة في التبديل
Ativar todos|Enable all|全部启用|सभी चालू करें|Activar todos|تفعيل الكل
Limpar|Clear|清除|साफ़ करें|Limpiar|مسح
Nenhum visual encontrado. Experimente outro termo.|No visuals found. Try another search term.|未找到视觉效果。请尝试其他关键词。|कोई दृश्य नहीं मिला। कोई दूसरा शब्द आज़माएँ।|No se encontraron visuales. Prueba otro término.|لم يُعثر على عرض. جرّب كلمة بحث مختلفة.
＋ Criar meu próprio preset|＋ Create my own preset|＋ 创建我的预设|＋ अपना प्रीसेट बनाएँ|＋ Crear mi propio preset|＋ أنشئ إعدادي المسبق
SEU SOM, SEU VISUAL|YOUR SOUND, YOUR VISUAL|你的声音，你的视觉效果|आपकी ध्वनि, आपका दृश्य|TU SONIDO, TU VISUAL|صوتك، عرضك
Compartilhe o som que está tocando.|Share the sound that's playing.|共享正在播放的声音。|चल रही आवाज़ साझा करें।|Comparte el sonido que está sonando.|شارك الصوت الذي تستمع إليه.
Fechar ajuda de áudio|Close audio help|关闭音频帮助|ऑडियो सहायता बंद करें|Cerrar ayuda de audio|إغلاق مساعدة الصوت
Compartilhar áudio|Share audio|共享音频|ऑडियो साझा करें|Compartir audio|مشاركة الصوت
Aba do navegador|Browser tab|浏览器标签页|ब्राउज़र टैब|Pestaña del navegador|علامة تبويب في المتصفح
Tela inteira|Entire screen|整个屏幕|पूरी स्क्रीन|Pantalla entera|الشاشة بأكملها
Sua música tocando|Your music playing|正在播放你的音乐|आपका संगीत चल रहा है|Tu música sonando|موسيقاك قيد التشغيل
Compartilhar|Share|共享|साझा करें|Compartir|مشاركة
Escolha a fonte.|Choose a source.|选择来源。|स्रोत चुनें।|Elige la fuente.|اختر المصدر.
Uma aba com música costuma ser a opção mais simples. Para som do PC, escolha a tela inteira quando o navegador oferecer áudio.|A tab playing music is usually easiest. For computer audio, choose the entire screen if your browser offers audio sharing.|播放音乐的标签页通常是最简单的选择。要共享电脑声音，请在浏览器支持共享音频时选择整个屏幕。|संगीत चलाने वाला टैब आम तौर पर सबसे आसान विकल्प है। कंप्यूटर की आवाज़ के लिए, अगर ब्राउज़र ऑडियो साझा करने देता है तो पूरी स्क्रीन चुनें।|Una pestaña con música suele ser la opción más sencilla. Para el sonido del ordenador, elige la pantalla entera si el navegador permite compartir audio.|غالبًا ما يكون اختيار علامة تبويب تشغّل الموسيقى هو الأبسط. لمشاركة صوت الجهاز اختر الشاشة بأكملها إذا أتاح المتصفح مشاركة الصوت.
Marque “Compartilhar áudio”.|Check “Share audio”.|勾选“共享音频”。|“ऑडियो साझा करें” चुनें।|Marca «Compartir audio».|فعّل «مشاركة الصوت».
A opção aparece no seletor do navegador.|You'll find the option in your browser's picker.|该选项在浏览器的共享选择器中。|यह विकल्प ब्राउज़र के चयन संवाद में दिखता है।|La opción aparece en el selector del navegador.|يظهر الخيار في نافذة الاختيار في المتصفح.
Confirme e curta.|Confirm and enjoy.|确认后即可欣赏。|पुष्टि करें और आनंद लें।|Confirma y disfruta.|أكّد واستمتع.
O visual recebe o som aqui, na própria página.|The visual gets its sound right here on the page.|视觉效果会在此页面接收音频。|दृश्य को इसी पेज पर आवाज़ मिलती है।|El visual recibe el sonido aquí mismo, en esta página.|يستقبل العرض الصوت هنا في الصفحة نفسها.
A ilustração é um guia. O seletor real será aberto pelo seu navegador; o site usa somente o áudio e não grava sua tela.|The illustration is a guide. Your browser opens the actual picker. This site uses only audio and does not record your screen.|插图仅供参考。浏览器会打开实际的共享选择器。本站只使用音频，不录制屏幕。|यह चित्र एक मार्गदर्शिका है। असली चयन संवाद आपका ब्राउज़र खोलेगा। यह साइट केवल ऑडियो इस्तेमाल करती है और आपकी स्क्रीन रिकॉर्ड नहीं करती।|La ilustración es una guía. Tu navegador abrirá el selector real. El sitio solo usa el audio y no graba tu pantalla.|الصورة توضيحية. يفتح المتصفح نافذة الاختيار الفعلية. يستخدم الموقع الصوت فقط ولا يسجل الشاشة.
O Firefox pode compartilhar a imagem sem fornecer áudio. Se isso acontecer, use um arquivo local, o microfone ou abra o site no Chrome/Edge para tentar capturar o som do PC.|Firefox may share the picture without audio. If that happens, use a local file, use the microphone, or open the site in Chrome or Edge to try capturing computer audio.|Firefox 可能只共享画面，不提供音频。如果遇到这种情况，请使用本地文件、麦克风，或在 Chrome 或 Edge 中打开本站以尝试捕获电脑音频。|Firefox वीडियो साझा कर सकता है लेकिन ऑडियो नहीं भी दे सकता है। ऐसे में स्थानीय फ़ाइल या माइक्रोफ़ोन इस्तेमाल करें, या कंप्यूटर का ऑडियो कैप्चर करने के लिए साइट को Chrome या Edge में खोलें।|Firefox puede compartir la imagen sin audio. Si ocurre, usa un archivo local o el micrófono, o abre el sitio en Chrome o Edge para intentar capturar el sonido del ordenador.|قد يشارك Firefox الصورة دون الصوت. إذا حدث ذلك، استخدم ملفًا محليًا أو الميكروفون، أو افتح الموقع في Chrome أو Edge لتجربة التقاط صوت الكمبيوتر.
Abrir versão HTTPS|Open HTTPS version|打开 HTTPS 版本|HTTPS संस्करण खोलें|Abrir versión HTTPS|افتح نسخة HTTPS
Abra o site por HTTPS para compartilhar áudio ou use um arquivo de música.|Open the HTTPS version to share audio, or use a music file.|请通过 HTTPS 打开网站以共享音频，或使用音乐文件。|ऑडियो साझा करने के लिए HTTPS साइट खोलें या संगीत फ़ाइल इस्तेमाल करें।|Abre la versión HTTPS para compartir audio o usa un archivo de música.|افتح الموقع عبر HTTPS لمشاركة الصوت، أو استخدم ملفًا موسيقيًا.
Este navegador não oferece captura de tela. Use um arquivo ou tente compartilhar uma aba no Chrome ou Edge de computador.|This browser cannot capture a screen. Open a file or try sharing a tab in desktop Chrome or Edge.|此浏览器不支持屏幕捕获。请打开文件，或尝试在桌面版 Chrome 或 Edge 中共享标签页。|यह ब्राउज़र स्क्रीन कैप्चर नहीं कर सकता। फ़ाइल खोलें या डेस्कटॉप Chrome या Edge में टैब साझा करके देखें।|Este navegador no ofrece captura de pantalla. Abre un archivo o intenta compartir una pestaña en Chrome o Edge de escritorio.|لا يدعم هذا المتصفح التقاط الشاشة. افتح ملفًا أو جرّب مشاركة تبويب في Chrome أو Edge على الكمبيوتر.
Este navegador não oferece captura por microfone. Você pode abrir um arquivo de música.|This browser cannot capture microphone audio. You can open a music file.|此浏览器不支持麦克风录音。你可以打开音乐文件。|यह ब्राउज़र माइक्रोफ़ोन ऑडियो कैप्चर नहीं कर सकता। आप संगीत फ़ाइल खोल सकते हैं।|Este navegador no ofrece captura por micrófono. Puedes abrir un archivo de música.|لا يدعم هذا المتصفح التقاط الصوت من الميكروفون. يمكنك فتح ملف موسيقي.
A fonte veio sem áudio. Escolha uma aba com som e marque “Compartilhar áudio” no seletor. Para som de todo o PC, use “Tela inteira” se ela oferecer essa opção.|The source came through without audio. Pick a tab playing sound and check “Share audio”. To share all computer sound, select “Entire screen” if it offers audio sharing.|来源未提供音频。请选择正在播放声音的标签页，并勾选“共享音频”。要共享电脑所有声音，请在支持时选择“整个屏幕”。|स्रोत से ऑडियो नहीं मिला। आवाज़ चला रहा टैब चुनें और “ऑडियो साझा करें” चुनें। पूरे कंप्यूटर की आवाज़ के लिए, विकल्प मिलने पर “पूरी स्क्रीन” चुनें।|La fuente llegó sin audio. Elige una pestaña con sonido y marca «Compartir audio». Para compartir todo el sonido del ordenador, elige «Pantalla entera» si ofrece esa opción.|وصل المصدر من دون صوت. اختر تبويبًا يشغّل صوتًا وفعّل خيار «مشاركة الصوت» في نافذة الاختيار. لمشاركة كل أصوات الكمبيوتر، اختر «الشاشة بالكامل» إذا كان خيار مشاركة الصوت متاحًا.
O microfone não forneceu áudio. Confira o dispositivo de entrada nas configurações do navegador.|The microphone didn't provide audio. Check the input device in your browser settings.|麦克风未提供音频。请在浏览器设置中检查输入设备。|माइक्रोफ़ोन से ऑडियो नहीं मिला। ब्राउज़र की सेटिंग में इनपुट डिवाइस जाँचें।|El micrófono no proporcionó audio. Comprueba el dispositivo de entrada en los ajustes del navegador.|لم يرسل الميكروفون أي صوت. تحقّق من جهاز الإدخال في إعدادات المتصفح.
O compartilhamento foi cancelado ou bloqueado. Reabra o seletor para tentar novamente.|Sharing was canceled or blocked. Reopen the picker to try again.|共享已取消或被阻止。请重新打开选择器再试。|शेयरिंग रद्द हुई या रोक दी गई। फिर से कोशिश करने के लिए चयन संवाद खोलें।|Se canceló o bloqueó el uso compartido. Vuelve a abrir el selector para intentarlo de nuevo.|أُلغيت المشاركة أو حُجبت. افتح نافذة الاختيار مرة أخرى للمحاولة.
O acesso ao microfone foi cancelado ou bloqueado. Confira a permissão do site no navegador.|Microphone access was canceled or blocked. Check this site's permissions in your browser.|麦克风访问已取消或被阻止。请检查浏览器中的网站权限。|माइक्रोफ़ोन की अनुमति रद्द हुई या रोकी गई। ब्राउज़र में साइट की अनुमतियाँ जाँचें।|Se canceló o bloqueó el acceso al micrófono. Comprueba los permisos del sitio en tu navegador.|أُلغي الوصول إلى الميكروفون أو حُجب. تحقّق من أذونات هذا الموقع في المتصفح.
Deixe esta aba em primeiro plano e clique novamente para compartilhar.|Bring this tab to the foreground and click again to share.|将此标签页切到前台，然后再次点击以共享。|इस टैब को सामने लाएँ और साझा करने के लिए फिर क्लिक करें।|Pon esta pestaña en primer plano y vuelve a pulsar para compartir.|انتقل إلى هذا التبويب وانقر مجددًا للمشاركة.
Não foi possível acessar a fonte de áudio. Confira as permissões no sistema ou tente outra fonte.|Couldn't access the audio source. Check system permissions or try another source.|无法访问音频来源。请检查系统权限或尝试其他来源。|ऑडियो स्रोत तक पहुँच नहीं मिली। सिस्टम की अनुमतियाँ जाँचें या दूसरा स्रोत आज़माएँ।|No se pudo acceder a la fuente de audio. Comprueba los permisos del sistema o prueba otra fuente.|تعذّر الوصول إلى مصدر الصوت. تحقّق من أذونات النظام أو جرّب مصدرًا آخر.
Nenhuma fonte disponível. Tente outra fonte ou abra um arquivo de música.|No source available. Try another source or open a music file.|无可用来源。请尝试其他来源或打开音乐文件。|कोई स्रोत उपलब्ध नहीं है। दूसरा स्रोत आज़माएँ या संगीत फ़ाइल खोलें।|No hay fuentes disponibles. Prueba otra fuente o abre un archivo de música.|لا يوجد مصدر متاح. جرّب مصدرًا آخر أو افتح ملفًا موسيقيًا.
Não foi possível iniciar a captura. Tente novamente ou use um arquivo de música.|Couldn't start capture. Try again or use a music file.|无法开始捕获。请重试或使用音乐文件。|कैप्चर शुरू नहीं हुआ। फिर कोशिश करें या संगीत फ़ाइल इस्तेमाल करें।|No se pudo iniciar la captura. Inténtalo de nuevo o usa un archivo de música.|تعذّر بدء الالتقاط. حاول مرة أخرى أو استخدم ملفًا موسيقيًا.
O Firefox pode abrir o seletor sem oferecer áudio. Se a opção não aparecer, use um arquivo de música ou tente compartilhar no Chrome ou Edge de computador.|Firefox may open the picker without an audio option. If it is missing, open a music file or try sharing in desktop Chrome or Edge.|Firefox 打开的选择器可能不提供音频选项。如果没有该选项，请打开音乐文件，或尝试在桌面版 Chrome 或 Edge 中共享。|Firefox में चयन संवाद ऑडियो का विकल्प दिखाए बिना खुल सकता है। विकल्प न मिले तो संगीत फ़ाइल खोलें या डेस्कटॉप Chrome या Edge में शेयर करके देखें।|Firefox puede abrir el selector sin ofrecer audio. Si la opción no aparece, abre un archivo de música o prueba compartir en Chrome o Edge de escritorio.|قد يفتح Firefox نافذة الاختيار من دون خيار مشاركة الصوت. إذا لم يظهر الخيار، فافتح ملفًا موسيقيًا أو جرّب المشاركة في Chrome أو Edge على الكمبيوتر.
Compartilhamento encerrado. Selecione a fonte para reconectar.|Sharing ended. Select the source to reconnect.|共享已结束。请选择来源以重新连接。|शेयरिंग समाप्त हुई। दोबारा कनेक्ट करने के लिए स्रोत चुनें।|Compartición finalizada. Selecciona la fuente para volver a conectar.|انتهت المشاركة. اختر المصدر لإعادة الاتصال.
A fonte está temporariamente sem áudio.|The source is temporarily silent.|来源暂时没有声音。|स्रोत में फ़िलहाल आवाज़ नहीं है।|La fuente está temporalmente en silencio.|المصدر صامت مؤقتًا.
Áudio conectado. Aguardando som na fonte.|Audio connected. Waiting for sound from the source.|音频已连接，正在等待来源发出声音。|ऑडियो कनेक्ट है। स्रोत से आवाज़ आने की प्रतीक्षा है।|Audio conectado. Esperando sonido de la fuente.|تم توصيل الصوت. بانتظار صدور صوت من المصدر.
Recebendo áudio da fonte.|Receiving audio from the source.|正在接收来源的音频。|स्रोत से ऑडियो मिल रहा है।|Recibiendo audio de la fuente.|جارٍ استقبال الصوت من المصدر.
A música terminou.|The music ended.|音乐已播放完毕。|संगीत समाप्त हुआ।|La música terminó.|انتهى تشغيل الموسيقى.
Reprodução pausada.|Playback paused.|播放已暂停。|प्लेबैक रुका हुआ है।|Reproducción en pausa.|التشغيل متوقف مؤقتًا.
Reprodução ativa.|Playback active.|正在播放。|प्लेबैक चल रहा है।|Reproducción activa.|التشغيل جارٍ.
Clique em Retomar áudio.|Click Resume audio.|请点击恢复音频。|ऑडियो फिर चलाएँ पर क्लिक करें।|Pulsa Reanudar audio.|انقر على «استئناف الصوت».
Prévia visual sem som.|Silent visual preview.|无声视觉预览。|बिना आवाज़ का दृश्य पूर्वावलोकन।|Vista previa visual sin sonido.|معاينة مرئية صامتة.
Demonstração com sinal sintético.|Synthetic signal demo.|合成信号演示。|कृत्रिम सिग्नल का डेमो।|Demostración con señal sintética.|عرض تجريبي بإشارة اصطناعية.
Captura inativa.|Capture inactive.|捕获未开启。|कैप्चर बंद है।|Captura inactiva.|الالتقاط غير نشط.
A animação pode pausar quando a aba fica em segundo plano.|The animation may pause when the tab is in the background.|标签页在后台时，动画可能暂停。|टैब बैकग्राउंड में होने पर ऐनिमेशन रुक सकता है।|La animación puede pausarse cuando la pestaña queda en segundo plano.|قد تتوقف الرسوم المتحركة مؤقتًا عندما ينتقل التبويب إلى الخلفية.
Não foi possível retomar o áudio. Selecione a fonte para reconectar.|Couldn't resume audio. Select the source to reconnect.|无法恢复音频。请选择来源以重新连接。|ऑडियो फिर नहीं चल सका। दोबारा कनेक्ट करने के लिए स्रोत चुनें।|No se pudo reanudar el audio. Selecciona la fuente para volver a conectar.|تعذّر استئناف الصوت. اختر المصدر لإعادة الاتصال.
Não foi possível tocar. Escolha outra música de exemplo.|Couldn't play. Choose another sample track.|无法播放。请选择其他示例曲目。|संगीत नहीं चला। कोई और उदाहरण गीत चुनें।|No se pudo reproducir. Elige otra pista de ejemplo.|تعذّر التشغيل. اختر مقطعًا تجريبيًا آخر.
Não foi possível retomar a reprodução. Selecione uma música para tentar novamente.|Couldn't resume playback. Select a track to try again.|无法恢复播放。请选择歌曲重试。|प्लेबैक जारी नहीं हो सका। फिर कोशिश करने के लिए गीत चुनें।|No se pudo reanudar la reproducción. Elige una pista para intentarlo de nuevo.|تعذّر استئناف التشغيل. اختر مقطعًا للمحاولة مرة أخرى.
Prévia visual. Clique em Ligar som para ouvir o exemplo.|Visual preview. Click Unmute to hear the sample.|视觉预览。请点击取消静音以试听示例。|दृश्य पूर्वावलोकन। उदाहरण सुनने के लिए आवाज़ चालू करें पर क्लिक करें।|Vista previa visual. Activa el sonido para escuchar el ejemplo.|معاينة مرئية. انقر على «تشغيل الصوت» لسماع المقطع التجريبي.
A conexão com a janela de captura está indisponível. Compartilhe áudio diretamente nesta página.|The capture window connection is unavailable. Share audio directly on this page.|无法连接捕获窗口。请直接在此页面共享音频。|कैप्चर विंडो से कनेक्शन उपलब्ध नहीं है। इसी पेज पर सीधे ऑडियो साझा करें।|La conexión con la ventana de captura no está disponible. Comparte el audio directamente en esta página.|الاتصال بنافذة الالتقاط غير متاح. شارك الصوت مباشرة من هذه الصفحة.
Permita a abertura da janela de captura no navegador.|Allow the capture window to open in your browser.|请允许浏览器打开捕获窗口。|ब्राउज़र में कैप्चर विंडो खोलने की अनुमति दें।|Permite que el navegador abra la ventana de captura.|اسمح للمتصفح بفتح نافذة الالتقاط.
Na janela de captura, clique em Compartilhar áudio e deixe a janela aberta.|Click Share audio in the capture window and leave the window open.|请在捕获窗口中点击共享音频，然后保持窗口打开。|कैप्चर विंडो में ऑडियो साझा करें पर क्लिक करें और विंडो खुली रखें।|Pulsa Compartir audio en la ventana de captura y déjala abierta.|انقر على «مشاركة الصوت» في نافذة الالتقاط واتركها مفتوحة.
Se o áudio continuar pausado, clique em Retomar na janela de captura.|If audio stays paused, click Resume in the capture window.|如果音频仍暂停，请在捕获窗口中点击继续。|अगर ऑडियो रुका रहे, तो कैप्चर विंडो में जारी रखें पर क्लिक करें।|Si el audio sigue en pausa, pulsa Reanudar en la ventana de captura.|إذا ظل الصوت متوقفًا مؤقتًا، فانقر على «استئناف» في نافذة الالتقاط.
A janela de captura parou de responder. Selecione a fonte para reconectar.|The capture window stopped responding. Select the source to reconnect.|捕获窗口无响应。请选择来源以重新连接。|कैप्चर विंडो ने जवाब देना बंद कर दिया। दोबारा कनेक्ट करने के लिए स्रोत चुनें।|La ventana de captura dejó de responder. Selecciona la fuente para volver a conectar.|توقفت نافذة الالتقاط عن الاستجابة. اختر المصدر لإعادة الاتصال.
Compartilhamento encerrado. Abra a janela de captura para reconectar.|Sharing ended. Open the capture window to reconnect.|共享已结束。请打开捕获窗口以重新连接。|शेयरिंग समाप्त हुई। दोबारा कनेक्ट करने के लिए कैप्चर विंडो खोलें।|Compartición finalizada. Abre la ventana de captura para volver a conectar.|انتهت المشاركة. افتح نافذة الالتقاط لإعادة الاتصال.
Captura pausada. Clique em Retomar áudio.|Capture paused. Click Resume audio.|捕获已暂停。请点击恢复音频。|कैप्चर रुका है। ऑडियो फिर चलाएँ पर क्लिक करें।|Captura en pausa. Pulsa Reanudar audio.|الالتقاط متوقف مؤقتًا. انقر على «استئناف الصوت».
Captura persistente conectada.|Persistent capture connected.|持续捕获已连接。|लगातार कैप्चर कनेक्ट है।|Captura persistente conectada.|تم الاتصال بالالتقاط المستمر.
Abra o site por HTTPS para compartilhar áudio.|Open the HTTPS version to share audio.|请通过 HTTPS 打开网站以共享音频。|ऑडियो साझा करने के लिए HTTPS साइट खोलें।|Abre la versión HTTPS para compartir audio.|افتح الموقع عبر HTTPS لمشاركة الصوت.
A conexão com a janela está indisponível. Compartilhe áudio na página principal.|The window connection is unavailable. Share audio from the main page.|窗口连接不可用。请在主页面共享音频。|विंडो का कनेक्शन उपलब्ध नहीं है। मुख्य पेज पर ऑडियो साझा करें।|La conexión con la ventana no está disponible. Comparte audio en la página principal.|الاتصال بالنافذة غير متاح. شارك الصوت من الصفحة الرئيسية.
Este navegador não oferece acesso ao microfone.|This browser does not offer microphone access.|此浏览器不支持麦克风访问。|यह ब्राउज़र माइक्रोफ़ोन इस्तेमाल करने की अनुमति नहीं देता।|Este navegador no ofrece acceso al micrófono.|لا يتيح هذا المتصفح الوصول إلى الميكروفون.
Use Chrome ou Edge no computador ou abra um arquivo de música.|Use desktop Chrome or Edge, or open a music file.|请使用桌面版 Chrome 或 Edge，或打开音乐文件。|डेस्कटॉप Chrome या Edge इस्तेमाल करें या संगीत फ़ाइल खोलें।|Usa Chrome o Edge de escritorio o abre un archivo de música.|استخدم Chrome أو Edge على الكمبيوتر، أو افتح ملفًا موسيقيًا.
Nenhuma entrada de microfone disponível.|No microphone input available.|没有可用的麦克风输入。|माइक्रोफ़ोन इनपुट उपलब्ध नहीं है।|No hay ninguna entrada de micrófono disponible.|لا يوجد جهاز إدخال متاح للميكروفون.
Escolha uma aba com som e marque “Compartilhar áudio” no seletor.|Pick a tab playing sound and check “Share audio” in the picker.|请选择正在播放声音的标签页，并在选择器中勾选“共享音频”。|आवाज़ चला रहा टैब चुनें और चयन संवाद में “ऑडियो साझा करें” चुनें।|Elige una pestaña con sonido y marca «Compartir audio» en el selector.|اختر تبويبًا يشغّل صوتًا وفعّل خيار «مشاركة الصوت» في نافذة الاختيار.
Compartilhamento cancelado ou bloqueado. Abra o seletor para tentar novamente.|Sharing canceled or blocked. Open the picker to try again.|共享已取消或被阻止。请打开选择器再试。|शेयरिंग रद्द हुई या रोक दी गई। फिर से कोशिश करने के लिए चयन संवाद खोलें।|Se canceló o bloqueó el uso compartido. Abre el selector para intentarlo de nuevo.|أُلغيت المشاركة أو حُجبت. افتح نافذة الاختيار للمحاولة مرة أخرى.
O compartilhamento de áudio precisa de um navegador compatível e uma conexão segura.|Audio sharing requires a compatible browser and a secure connection.|共享音频需要兼容浏览器和安全连接。|ऑडियो शेयरिंग के लिए संगत ब्राउज़र और सुरक्षित कनेक्शन चाहिए।|Compartir audio requiere un navegador compatible y una conexión segura.|تتطلب مشاركة الصوت متصفحًا متوافقًا واتصالًا آمنًا.
O acesso ao microfone precisa de um navegador compatível e uma conexão segura.|Microphone access requires a compatible browser and a secure connection.|使用麦克风需要兼容浏览器和安全连接。|माइक्रोफ़ोन के लिए संगत ब्राउज़र और सुरक्षित कनेक्शन चाहिए।|El acceso al micrófono requiere un navegador compatible y una conexión segura.|يتطلب الوصول إلى الميكروفون متصفحًا متوافقًا واتصالًا آمنًا.
O compartilhamento foi encerrado antes de conectar.|Sharing ended before it could connect.|建立连接前共享已结束。|कनेक्शन होने से पहले शेयरिंग समाप्त हुई।|La compartición terminó antes de establecer la conexión.|انتهت المشاركة قبل اكتمال الاتصال.
Preset inválido: faltam nome ou código.|Invalid preset: missing name or code.|无效预设：缺少名称或代码。|अमान्य प्रीसेट: नाम या कोड नहीं है।|Preset no válido: falta el nombre o el código.|إعداد مسبق غير صالح، إذ ينقصه الاسم أو الشيفرة.
Código muito grande (limite: 1 MB por preset).|Code too large (limit: 1 MB per preset).|代码过大（每个预设限 1 MB）。|कोड बहुत बड़ा है (हर प्रीसेट की सीमा 1 MB है)।|El código es demasiado grande (límite: 1 MB por preset).|الشيفرة أكبر من الحد المسموح به البالغ 1 ميغابايت لكل إعداد مسبق.
Biblioteca inválida.|Invalid library.|无效预设库。|अमान्य लाइब्रेरी।|Biblioteca no válida.|المكتبة غير صالحة.
JSON sem uma lista presets.|JSON does not contain a preset list.|JSON 中没有预设列表。|JSON में प्रीसेट की सूची नहीं है।|El JSON no contiene una lista de presets.|لا يحتوي ملف JSON على قائمة بالإعدادات المسبقة.
Abrir seletor de áudio|Open audio picker|打开音频选择器|ऑडियो चयन संवाद खोलें|Abrir selector de audio|فتح نافذة اختيار الصوت
Prefiro um arquivo de música|Use a music file instead|使用音乐文件|संगीत फ़ाइल इस्तेमाल करें|Usar un archivo de música|أفضل استخدام ملف موسيقى

Sobre o putsputs|About putsputs|关于 putsputs|putsputs के बारे में|Acerca de putsputs|حول putsputs
Fechar sobre|Close About|关闭关于|परिचय बंद करें|Cerrar información|إغلاق المعلومات
VEJA O SOM|SEE THE SOUND|看见声音|ध्वनि देखें|MIRA EL SONIDO|شاهد الصوت
Sobre|About|关于|परिचय|Acerca de|حول
Atalhos|Shortcuts|快捷键|शॉर्टकट|Atajos|الاختصارات
Créditos|Credits|鸣谢|श्रेय|Créditos|الاعتمادات
Informações|Information|信息|जानकारी|Información|معلومات
Seu som, seu visual.|Your sound, your visual.|你的声音，你的视觉。|आपकी ध्वनि, आपका दृश्य।|Tu sonido, tu visual.|صوتك، وعرضك البصري.
Escolha uma música para começar. Troque os visuais, ajuste o movimento e o brilho ou crie seu próprio preset.|Choose a track to begin. Switch visuals, adjust motion and brightness, or create your own preset.|选择一首音乐开始。切换视觉效果、调整运动与亮度，或创建自己的预设。|शुरू करने के लिए एक गीत चुनें। दृश्य बदलें, गति और चमक समायोजित करें या अपना प्रीसेट बनाएँ।|Elige una canción para empezar. Cambia los visuales, ajusta el movimiento y el brillo o crea tu propio preset.|اختر مقطعًا للبدء. بدّل العروض واضبط الحركة والسطوع أو أنشئ إعدادك الخاص.
Seu áudio fica aqui.|Your audio stays here.|你的音频留在这里。|आपका ऑडियो यहीं रहता है।|Tu audio se queda aquí.|يبقى صوتك هنا.
A análise acontece no navegador, sem gravar ou enviar seu áudio. Seus presets e preferências ficam neste dispositivo.|Analysis runs in your browser without recording or uploading audio. Your presets and preferences stay on this device.|分析在浏览器中进行，不录制或上传音频。预设和偏好保存在本设备上。|विश्लेषण ब्राउज़र में होता है, बिना ऑडियो रिकॉर्ड या अपलोड किए। आपके प्रीसेट और पसंद इसी डिवाइस पर रहते हैं।|El análisis ocurre en tu navegador sin grabar ni subir audio. Tus presets y preferencias se guardan en este dispositivo.|يتم التحليل في متصفحك دون تسجيل الصوت أو رفعه. تبقى إعداداتك وتفضيلاتك على هذا الجهاز.
Para capturar o computador, use HTTPS e marque “Compartilhar áudio” no seletor do navegador. A disponibilidade depende do navegador e do sistema.|To capture computer audio, use HTTPS and enable “Share audio” in the browser picker. Availability depends on your browser and system.|要捕获电脑音频，请使用 HTTPS，并在浏览器选择器中勾选“分享音频”。可用性取决于浏览器和系统。|कंप्यूटर ऑडियो के लिए HTTPS इस्तेमाल करें और ब्राउज़र के चयन में “ऑडियो साझा करें” चालू करें। उपलब्धता ब्राउज़र और सिस्टम पर निर्भर है।|Para capturar el audio del ordenador, usa HTTPS y activa “Compartir audio” en el selector. La disponibilidad depende del navegador y del sistema.|لالتقاط صوت الكمبيوتر، استخدم HTTPS وفعّل «مشاركة الصوت» في منتقي المتصفح. يعتمد التوفر على المتصفح والنظام.
Menos cliques, mais música.|Fewer clicks, more music.|更少点击，更多音乐。|कम क्लिक, अधिक संगीत।|Menos clics, más música.|نقرات أقل وموسيقى أكثر.
Trocar visual|Change visual|切换视觉效果|दृश्य बदलें|Cambiar visual|تغيير العرض
Pausar ou retomar a troca de visuais|Pause or resume visual cycling|暂停或继续自动切换|दृश्य बदलना रोकें या जारी रखें|Pausar o reanudar el cambio de visuales|إيقاف تبديل العروض مؤقتًا أو استئنافه
Fechar painéis ou sair da tela cheia|Close panels or exit fullscreen|关闭面板或退出全屏|पैनल बंद करें या पूरी स्क्रीन से बाहर आएँ|Cerrar paneles o salir de pantalla completa|إغلاق اللوحات أو مغادرة ملء الشاشة
Aplicar código no editor|Apply code in the editor|应用编辑器代码|संपादक में कोड लागू करें|Aplicar código en el editor|تطبيق الكود في المحرر
Nos visuais 3D, arraste para mover a câmera. Os atalhos não interrompem a digitação no editor.|Drag to move the camera in 3D visuals. Shortcuts do not interrupt typing in the editor.|在 3D 视觉效果中拖动可移动相机。快捷键不会干扰编辑器中的输入。|3D दृश्यों में कैमरा घुमाने के लिए खींचें। शॉर्टकट संपादक में टाइपिंग को बाधित नहीं करते।|Arrastra para mover la cámara en los visuales 3D. Los atajos no interrumpen la escritura en el editor.|اسحب لتحريك الكاميرا في العروض ثلاثية الأبعاد. لا تتداخل الاختصارات مع الكتابة في المحرر.
Música de gente de verdade.|Music made by real people.|真人创作的音乐。|असली लोगों का बनाया संगीत।|Música creada por personas.|موسيقى يصنعها أشخاص حقيقيون.
Faixas de Kevin MacLeod (|Tracks by Kevin MacLeod (|Kevin MacLeod 的音乐（|Kevin MacLeod के गीत (|Canciones de Kevin MacLeod (|مقاطع من Kevin MacLeod (
), sob|), under|），采用|), लाइसेंस|), bajo|)، بترخيص
. MP3 originais, sem alterações.|. Original, unmodified MP3s.|。原始 MP3，未经修改。|. मूल MP3, बिना बदलाव।|. MP3 originales, sin cambios.|. ملفات MP3 أصلية دون تعديل.
Feito com|Made with|制作工具|इनसे बनाया गया|Hecho con|صُنع باستخدام
 e| and| 和| और| y| و
. Inspirado no AVS do Winamp.|. Inspired by Winamp AVS.|。灵感来自 Winamp AVS。|. Winamp AVS से प्रेरित।|. Inspirado en AVS de Winamp.|. مستوحى من AVS في Winamp.

Uma música, infinitos visuais.|One track, endless visuals.|一首音乐，无限视觉。|एक गीत, अनगिनत दृश्य।|Una canción, infinitos visuales.|مقطع واحد، عروض بصرية بلا حدود.
Espaço|Space|空格|स्पेस|Espacio|مسافة

Consulte a origem e a licença de cada faixa.|See the source and license for each track.|查看每首音乐的来源和许可。|हर गीत का स्रोत और लाइसेंस देखें।|Consulta el origen y la licencia de cada canción.|راجع مصدر كل مقطع وترخيصه.
`.trim().split('\n').map(row => {
    const [source, ...translations] = row.split('|');
    return [source, translations];
  }));
  const supplemental = `
★ Histórico 3D · visual.js|★ 3D History · visual.js|★ 3D 历史 · visual.js|★ 3D इतिहास · visual.js|★ Historial 3D · visual.js|★ سجل ثلاثي الأبعاد · visual.js
Histórico 3D|3D History|3D 历史|3D इतिहास|Historial 3D|سجل ثلاثي الأبعاد
Rádios · frequência recursiva|Radios · recursive frequency|收音机 · 递归频率|रेडियो · रिकर्सिव आवृत्ति|Radios · frecuencia recursiva|أجهزة الراديو · التردد التكراري
Caleidoscópio · pétalas em transe|Kaleidoscope · petals in a trance|万花筒 · 迷幻花瓣|कैलिडोस्कोप · झूमती पंखुड़ियाँ|Caleidoscopio · pétalos en trance|المشكال · بتلات حالمة
Caleidoscópio · mandala líquida|Kaleidoscope · liquid mandala|万花筒 · 流体曼陀罗|कैलिडोस्कोप · तरल मंडल|Caleidoscopio · mandala líquida|المشكال · ماندالا سائلة
Sofá · trama pulsante|Couch · pulsing weave|沙发 · 脉动织纹|सोफ़ा · धड़कती बुनावट|Sofá · trama pulsante|الأريكة · نسيج نابض
Sofá · ondas de veludo|Couch · velvet waves|沙发 · 丝绒波浪|सोफ़ा · मखमली लहरें|Sofá · ondas de terciopelo|الأريكة · أمواج مخملية
Perlin · correntes musicais|Perlin · musical currents|Perlin · 音乐流|Perlin · संगीत की धाराएँ|Perlin · corrientes musicales|Perlin · تيارات موسيقية
Nuvens · bichos de algodão|Clouds · cotton creatures|云海 · 棉絮生灵|बादल · रुई के जीव|Nubes · criaturas de algodón|السحب · كائنات قطنية
Violão · madeira e ressonância|Guitar · wood and resonance|吉他 · 木质与共鸣|गिटार · लकड़ी और अनुनाद|Guitarra · madera y resonancia|الغيتار · خشب ورنين
Handdrawing · sismógrafo à mão|Handdrawing · hand-drawn seismograph|手绘 · 手绘地震仪|हैंडड्रॉइंग · हाथ से बना भूकंपमापी|Dibujo a mano · sismógrafo a mano|رسم يدوي · راسم اهتزازات
Infinity · desenho por frequência|Infinity · drawing by frequency|Infinity · 频率绘图|Infinity · आवृत्ति से चित्र|Infinity · dibujo por frecuencia|Infinity · الرسم بالتردد
Sofá · trama setentista|Couch · seventies weave|沙发 · 七十年代织纹|सोफ़ा · सत्तर के दशक की बुनावट|Sofá · trama setentera|الأريكة · نسيج السبعينيات
Bordado · picos de linha|Embroidery · thread peaks|刺绣 · 丝线峰值|कढ़ाई · धागे की चोटियाँ|Bordado · picos de hilo|التطريز · قمم الخيوط
VFD · observatório de fósforo|VFD · phosphor observatory|VFD · 荧光观测站|VFD · फ़ॉस्फ़र वेधशाला|VFD · observatorio de fósforo|VFD · مرصد الفوسفور
VFD · matriz de pixels|VFD · pixel matrix|VFD · 像素矩阵|VFD · पिक्सेल मैट्रिक्स|VFD · matriz de píxeles|VFD · مصفوفة البكسلات
Polarizer · tensões de luz|Polarizer · tensions of light|偏振器 · 光的张力|पोलराइज़र · प्रकाश का तनाव|Polarizador · tensiones de luz|المستقطب · توترات الضوء
Tinta · sprays e gotas|Paint · sprays and drops|颜料 · 喷雾与液滴|रंग · फुहारें और बूँदें|Pintura · aerosoles y gotas|الطلاء · رذاذ وقطرات
Sound Waves · matéria em interferência|Sound Waves · interfering matter|声波 · 物质干涉|ध्वनि तरंगें · पदार्थ में व्यतिकरण|Ondas sonoras · materia en interferencia|الموجات الصوتية · تداخل المادة
Aurora · cortinas espectrais|Aurora · spectral curtains|极光 · 频谱帷幕|ऑरोरा · स्पेक्ट्रम के पर्दे|Aurora · cortinas espectrales|الشفق · ستائر طيفية
Lissajous · néon XY|Lissajous · neon XY|李萨如 · 霓虹 XY|लिसाजू · नियॉन XY|Lissajous · neón XY|ليساژو · نيون XY
Moiré · interferência|Moiré · interference|摩尔纹 · 干涉|मोइरे · व्यतिकरण|Muaré · interferencia|مواريه · تداخل
Moiré Fluido · zoom e metamorfose|Fluid Moiré · zoom and metamorphosis|流体摩尔纹 · 缩放与变形|तरल मोइरे · ज़ूम और रूपांतरण|Muaré fluido · zoom y metamorfosis|مواريه سائل · تقريب وتحول
Moiré fluido|Fluid Moiré|流体摩尔纹|तरल मोइरे|Muaré fluido|مواريه سائل
Túnel prismático · AVS|Prismatic tunnel · AVS|棱镜隧道 · AVS|प्रिज़्मीय सुरंग · AVS|Túnel prismático · AVS|نفق منشوري · AVS
Caleidoscópio · seda|Kaleidoscope · silk|万花筒 · 丝绸|कैलिडोस्कोप · रेशम|Caleidoscopio · seda|المشكال · حرير
Caleidoscópio · vitral|Kaleidoscope · stained glass|万花筒 · 彩色玻璃|कैलिडोस्कोप · रंगीन काँच|Caleidoscopio · vitral|المشكال · زجاج معشّق
Braseiro · fogo vivo|Brazier · live fire|火盆 · 跳动火焰|अँगीठी · जीवंत आग|Brasero · fuego vivo|المجمرة · نار متقدة
Polar · tear espectral|Polar · spectral loom|极坐标 · 频谱织机|ध्रुवीय · स्पेक्ट्रम का करघा|Polar · telar espectral|قطبي · منسج طيفي
Polar · rosas luminosas|Polar · luminous roses|极坐标 · 发光玫瑰|ध्रुवीय · चमकते गुलाब|Polar · rosas luminosas|قطبي · ورود مضيئة
Color Mix · sirenes na noite|Color Mix · sirens at night|色彩混合 · 夜间警灯|रंग मिश्रण · रात में सायरन|Mezcla de color · sirenas en la noche|مزج الألوان · أضواء الطوارئ ليلًا
Color Mix · tinta CMY|Color Mix · CMY ink|色彩混合 · CMY 墨水|रंग मिश्रण · CMY स्याही|Mezcla de color · tinta CMY|مزج الألوان · حبر CMY
Hyperdrive · nascedouro musical|Hyperdrive · musical origin|超空间引擎 · 音乐起源|हाइपरड्राइव · संगीत का उद्गम|Hyperdrive · origen musical|المحرّك الفائق · منبع الموسيقى
Fractal · Julia|Fractal · Julia|分形 · 朱利亚集|फ्रैक्टल · जूलिया|Fractal · Julia|كسورية · جوليا
Fractal · Mandelbrot|Fractal · Mandelbrot|分形 · 曼德博集|फ्रैक्टल · मैंडलब्रॉट|Fractal · Mandelbrot|كسورية · ماندلبروت
Lorenz · seda caótica|Lorenz · chaotic silk|洛伦兹 · 混沌丝绸|लॉरेंज़ · अराजक रेशम|Lorenz · seda caótica|لورنتز · حرير فوضوي
Lorenz · órbitas gêmeas|Lorenz · twin orbits|洛伦兹 · 双生轨道|लॉरेंज़ · जुड़वाँ कक्षाएँ|Lorenz · órbitas gemelas|لورنتز · مداران توأمان
Pontos · tinta permanente|Dots · permanent ink|点阵 · 永久墨水|बिंदु · स्थायी स्याही|Puntos · tinta permanente|نقاط · حبر دائم
Terreno · mundo musical|Terrain · musical world|地形 · 音乐世界|भूभाग · संगीतमय दुनिया|Terreno · mundo musical|تضاريس · عالم موسيقي
AVS · Bass Spin néon|AVS · neon Bass Spin|AVS · 霓虹 Bass Spin|AVS · नियॉन Bass Spin|AVS · Bass Spin de neón|AVS · Bass Spin بالنيون
Psicodélico · plasma líquido|Psychedelic · liquid plasma|迷幻 · 流体等离子|साइकेडेलिक · तरल प्लाज़्मा|Psicodélico · plasma líquido|خيالي · بلازما سائلة
Micélio · raízes por frequência|Mycelium · roots by frequency|菌丝体 · 频率之根|मायसीलियम · आवृत्ति से जड़ें|Micelio · raíces por frecuencia|الغزل الفطري · جذور حسب التردد
Lounge · veludo e vinho|Lounge · velvet and wine|休闲 · 丝绒与葡萄酒|लाउंज · मखमल और वाइन|Lounge · terciopelo y vino|استرخاء · مخمل ونبيذ
Negroni · líquido em órbita|Negroni · liquid in orbit|尼格罗尼 · 旋转液体|नेग्रोनी · कक्षा में तरल|Negroni · líquido en órbita|نيغروني · سائل يدور
Ambiente · brisa da sala de espera|Ambient · waiting-room breeze|氛围 · 候车室微风|ऐम्बिएंट · प्रतीक्षालय की हवा|Ambiental · brisa de la sala de espera|أجواء · نسيم غرفة الانتظار
Tapeçaria · espectrograma|Tapestry · spectrogram|织锦 · 声谱图|टेपेस्ट्री · स्पेक्ट्रोग्राम|Tapiz · espectrograma|نسيج · مخطط طيفي
Seu visual principal: 48 bandas, histórico e câmera manual.|Your main visual has 48 bands, a history, and manual camera controls.|主视觉效果包含 48 个频带、历史记录和手动相机控制。|मुख्य दृश्य में 48 बैंड, इतिहास और मैन्युअल कैमरा नियंत्रण है।|Tu visual principal tiene 48 bandas, historial y controles manuales de cámara.|العرض الرئيسي يضم 48 نطاقًا وسجلًا وتحكمًا يدويًا بالكاميرا.
Um rádio contém outro rádio no mostrador: sete níveis de recursão, grades de alto-falante, sintonia e vibração por frequência.|One radio contains another in its display, with seven recursive levels and speaker grilles that vibrate by frequency.|收音机屏幕中还有一台收音机，共七层递归，扬声器格栅随频率振动。|एक रेडियो के डिस्प्ले में दूसरा रेडियो है। सात रिकर्सिव स्तर हैं और स्पीकर की जाली आवृत्ति के साथ काँपती है।|Una radio contiene otra en su pantalla, con siete niveles de recursión y rejillas de altavoz que vibran según la frecuencia.|يحتوي الراديو على راديو آخر في شاشته، بسبعة مستويات تكرارية وشبكات مكبرات تهتز بحسب التردد.
Moiré com espessura, cores, ângulos, zoom e proporções seguindo alvos aleatórios independentes e suaves.|Moiré with thickness, colors, angles, zoom, and proportions that ease toward independent random targets.|摩尔纹的线条粗细、颜色、角度、缩放和比例分别平滑地趋向随机目标。|मोइरे की मोटाई, रंग, कोण, ज़ूम और अनुपात अलग-अलग यादृच्छिक लक्ष्यों की ओर धीरे बदलते हैं।|Muaré con grosor, colores, ángulos, zoom y proporciones que se acercan suavemente a objetivos aleatorios independientes.|تتغير سماكة تموّجات مواريه وألوانها وزواياها وتقريبها ونسبها بسلاسة نحو قيم عشوائية مستقلة.
Céu com 22 nuvens em camadas de profundidade, animais e objetos fofos. Mouse sopra; clique troca as pareidolias.|A sky with 22 clouds layered in depth, animals, and soft shapes. Move the mouse to blow and click to swap shapes.|22 朵云分布于不同深度，构成动物和柔软的物体。移动鼠标吹动云朵，点击切换形状。|आकाश की अलग-अलग परतों में 22 बादल, जीव और मुलायम आकार हैं। माउस घुमाने से हवा चलती है और क्लिक से आकार बदलते हैं।|Un cielo con 22 nubes en capas de profundidad, animales y formas suaves. Mueve el ratón para soplar y haz clic para cambiar las formas.|سماء بها 22 سحابة في طبقات متعددة، وحيوانات وأشكال ناعمة. حرّك الفأرة لتنفخ، وانقر لتبدّل الأشكال.
Escolha seu som|Choose your sound|选择声音来源|अपनी आवाज़ चुनें|Elige tu sonido|اختر صوتك
Fechar opções de áudio|Close audio options|关闭音频选项|ऑडियो विकल्प बंद करें|Cerrar opciones de audio|إغلاق خيارات الصوت
Música anterior|Previous track|上一首|पिछला गीत|Pista anterior|المقطع السابق
Próxima música|Next track|下一首|अगला गीत|Pista siguiente|المقطع التالي
Trocar música|Change track|切换歌曲|गीत बदलें|Cambiar de pista|تغيير المقطع
Toque para começar a ouvir|Tap to start listening|点按开始收听|सुनना शुरू करने के लिए टैप करें|Toca para empezar a escuchar|المس لبدء الاستماع
Automática|Automatic|自动|स्वचालित|Automática|تلقائية
Ative pelo menos dois presets para usar o shuffle.|Enable at least two presets to use shuffle.|至少启用两个预设才能随机切换。|शफ़ल के लिए कम से कम दो प्रीसेट चालू करें।|Activa al menos dos presets para usar el modo aleatorio.|فعّل إعدادين مسبقين على الأقل لاستخدام التبديل العشوائي.
Preset clássico · código editável|Classic preset · editable code|经典预设 · 可编辑代码|क्लासिक प्रीसेट · संपादन योग्य कोड|Preset clásico · código editable|إعداد كلاسيكي · شيفرة قابلة للتحرير
Erro ao aplicar · consulte o editor|Couldn't apply the preset. See the editor.|无法应用预设，请查看编辑器。|प्रीसेट लागू नहीं हुआ। संपादक देखें।|No se pudo aplicar el preset. Consulta el editor.|تعذّر تطبيق الإعداد. راجع المحرر.
Preset local · salvo neste navegador|Local preset · saved in this browser|本地预设 · 保存在此浏览器中|लोकल प्रीसेट · इसी ब्राउज़र में सहेजा गया|Preset local · guardado en este navegador|إعداد محلي · محفوظ في هذا المتصفح
Biblioteca · editáveis no WebStorm|Library · editable in WebStorm|预设库 · 可在 WebStorm 中编辑|लाइब्रेरी · WebStorm में संपादन योग्य|Biblioteca · editables en WebStorm|المكتبة · قابلة للتحرير في WebStorm
Rascunho guardado neste navegador|Draft saved in this browser|草稿已保存在此浏览器中|ड्राफ़्ट इसी ब्राउज़र में सहेजा गया|Borrador guardado en este navegador|حُفظت المسودة في هذا المتصفح
Sem espaço para guardar rascunho. Exporte seu código.|There's no room to save the draft. Export your code.|存储空间不足，无法保存草稿。请导出代码。|ड्राफ़्ट सहेजने के लिए जगह नहीं है। अपना कोड एक्सपोर्ट करें।|No hay espacio para guardar el borrador. Exporta tu código.|لا توجد مساحة لحفظ المسودة. صدّر الشيفرة.
Não foi possível recuperar este rascunho.|Couldn't restore this draft.|无法恢复此草稿。|यह ड्राफ़्ट वापस नहीं लाया जा सका।|No se pudo recuperar este borrador.|تعذّرت استعادة المسودة.
Novo rascunho · dê um nome e clique em Salvar local.|New draft · give it a name and click Save.|新草稿 · 输入名称并点击保存。|नया ड्राफ़्ट · नाम दें और सहेजें पर क्लिक करें।|Nuevo borrador · ponle un nombre y pulsa Guardar.|مسودة جديدة · اختر اسمًا واضغط حفظ.
Biblioteca exportada como JSON. Use Carregar presets para restaurar.|Library exported as JSON. Use Load presets to restore it.|预设库已导出为 JSON。使用加载预设可恢复。|लाइब्रेरी JSON में एक्सपोर्ट हुई। उसे वापस लाने के लिए प्रीसेट लोड करें।|Biblioteca exportada a JSON. Usa Cargar presets para restaurarla.|صُدّرت المكتبة بتنسيق JSON. استخدم تحميل الإعدادات لاستعادتها.
Seed aplicada. Salve o preset para guardá-la.|Seed applied. Save the preset to keep it.|种子已应用。保存预设即可保留。|सीड लागू हो गई। इसे रखने के लिए प्रीसेट सहेजें।|Semilla aplicada. Guarda el preset para conservarla.|طُبّقت البذرة. احفظ الإعداد للاحتفاظ بها.
Editor manual · arquivo não acompanhado|Manual editor · file watching off|手动编辑器 · 未监测文件|मैन्युअल संपादक · फ़ाइल के बदलाव ट्रैक नहीं हो रहे|Editor manual · seguimiento de archivo desactivado|محرر يدوي · مراقبة الملف متوقفة
Acompanhamento pausado|File watching paused|文件监测已暂停|फ़ाइल के बदलाव देखना रुका हुआ है|Seguimiento de archivo en pausa|مراقبة الملف متوقفة مؤقتًا
Animação que reage ao áudio. Clique para usar mouse e teclado.|Audio-reactive animation. Click to use mouse and keyboard.|音频响应动画。点击后可使用鼠标和键盘。|ध्वनि पर प्रतिक्रिया देने वाला ऐनिमेशन। माउस और कीबोर्ड इस्तेमाल करने के लिए क्लिक करें।|Animación que reacciona al audio. Haz clic para usar el ratón y el teclado.|حركة تستجيب للصوت. انقر لاستخدام الفأرة ولوحة المفاتيح.
Visual 3D: arraste para orbitar, scroll para zoom, setas para direção, R para restaurar|3D visual. Drag to orbit, scroll to zoom, use the arrow keys to steer or R to reset.|3D 视觉效果。拖动旋转，滚动缩放，方向键控制方向，按 R 重置。|3D दृश्य। घुमाने के लिए खींचें, ज़ूम के लिए स्क्रॉल करें, दिशा बदलने के लिए तीर कुंजियाँ दबाएँ और रीसेट के लिए R दबाएँ।|Visual 3D. Arrastra para orbitar, desplázate para acercar o alejar, usa las flechas para dirigir o R para restablecer.|عرض ثلاثي الأبعاد. اسحب للدوران، ومرّر للتكبير، واستخدم الأسهم للتوجيه أو R لإعادة الضبط.
Captura encerrada.|Capture ended.|捕获已结束。|कैप्चर समाप्त हुआ।|Captura finalizada.|انتهى الالتقاط.
Áudio compartilhado conectado nesta página.|Shared audio connected on this page.|共享音频已在此页面连接。|साझा ऑडियो इस पेज पर कनेक्ट हो गया।|Audio compartido conectado en esta página.|تم توصيل الصوت المشترك بهذه الصفحة.
Microfone conectado.|Microphone connected.|麦克风已连接。|माइक्रोफ़ोन कनेक्ट हो गया।|Micrófono conectado.|تم توصيل الميكروفون.
Compartilhamento cancelado. Você pode tentar novamente quando quiser.|Sharing canceled. You can try again whenever you're ready.|共享已取消。你可以随时重试。|शेयरिंग रद्द हुई। जब चाहें फिर कोशिश करें।|Compartir se canceló. Puedes volver a intentarlo cuando quieras.|أُلغيت المشاركة. يمكنك المحاولة مجددًا عندما تريد.
Áudio parado.|Audio stopped.|音频已停止。|ऑडियो रुक गया।|Audio detenido.|توقف الصوت.
Demo sintética visual · sem áudio real.|Synthetic visual demo · no live audio.|合成视觉演示 · 无真实音频。|कृत्रिम दृश्य डेमो · असली ऑडियो नहीं।|Demo visual sintética · sin audio real.|عرض تجريبي بصري بإشارة اصطناعية.
Música encerrada. Abra outro arquivo para continuar.|Playback ended. Open another file to continue.|播放已结束。打开其他文件即可继续。|संगीत समाप्त हुआ। जारी रखने के लिए कोई दूसरी फ़ाइल खोलें।|La música terminó. Abre otro archivo para continuar.|انتهت الموسيقى. افتح ملفًا آخر للمتابعة.
Não foi possível carregar p5.js. Confira sua conexão e recarregue.|Couldn't load p5.js. Check your connection and reload.|无法加载 p5.js。请检查连接并刷新。|p5.js लोड नहीं हुआ। अपना कनेक्शन जाँचें और फिर लोड करें।|No se pudo cargar p5.js. Comprueba tu conexión y recarga.|تعذّر تحميل p5.js. تحقّق من اتصالك وأعد تحميل الصفحة.
Não foi possível tocar. Escolha outro exemplo.|Couldn't play. Choose another sample.|无法播放。请选择其他示例。|संगीत नहीं चला। कोई और उदाहरण चुनें।|No se pudo reproducir. Elige otro ejemplo.|تعذّر التشغيل. اختر مقطعًا تجريبيًا آخر.
Prévia visual · clique em Ligar som para ouvir o exemplo.|Visual preview · choose Unmute to hear the sample.|视觉预览 · 点击取消静音即可试听示例。|दृश्य पूर्वावलोकन · उदाहरण सुनने के लिए आवाज़ चालू करें।|Vista previa visual · activa el sonido para escuchar el ejemplo.|معاينة بصرية · فعّل الصوت لسماع المقطع التجريبي.
Reprodução cancelada|Playback canceled|播放已取消|प्लेबैक रद्द हुआ|Reproducción cancelada|أُلغي التشغيل
Arquivo indisponível|File unavailable|文件不可用|फ़ाइल उपलब्ध नहीं है|Archivo no disponible|الملف غير متاح
Análise indisponível|Analysis unavailable|分析不可用|विश्लेषण उपलब्ध नहीं है|Análisis no disponible|التحليل غير متاح
Permita a janela de captura no Chrome.|Allow the capture window in Chrome.|请在 Chrome 中允许打开捕获窗口。|Chrome में कैप्चर विंडो खोलने की अनुमति दें।|Permite la ventana de captura en Chrome.|اسمح بفتح نافذة الالتقاط في Chrome.
Na janela de captura, clique em Compartilhar. Depois mantenha-a aberta.|In the capture window, click Share and leave the window open.|在捕获窗口中点击共享，并保持窗口打开。|कैप्चर विंडो में साझा करें पर क्लिक करें और उसे खुला रखें।|En la ventana de captura, pulsa Compartir y déjala abierta.|اضغط مشاركة في نافذة الالتقاط واتركها مفتوحة.
Captura persistente inativa|Persistent capture inactive|持续捕获未开启|लगातार कैप्चर बंद है|Captura persistente inactiva|الالتقاط المستمر غير نشط
Compartilhamento encerrado · abra a janela de captura|Sharing ended · open the capture window|共享已结束 · 请打开捕获窗口|शेयरिंग समाप्त हुई · कैप्चर विंडो खोलें|Compartición finalizada · abre la ventana de captura|انتهت المشاركة · افتح نافذة الالتقاط
Motor suspenso · Retomar áudio|Audio engine suspended · resume audio|音频引擎已挂起 · 恢复音频|ऑडियो इंजन निलंबित है · ऑडियो फिर चलाएँ|Motor suspendido · reanudar audio|محرك الصوت معلّق · استئناف الصوت
Fonte temporariamente sem áudio|Source temporarily has no audio|来源暂时无音频|स्रोत में फ़िलहाल ऑडियो नहीं है|Fuente temporalmente sin audio|لا صوت في المصدر مؤقتًا
Captura persistente conectada|Persistent capture connected|持续捕获已连接|लगातार कैप्चर कनेक्ट है|Captura persistente conectada|الالتقاط المستمر متصل
Captura inativa|Capture inactive|捕获未开启|कैप्चर बंद है|Captura inactiva|الالتقاط غير نشط
Demo sintética|Synthetic demo|合成演示|कृत्रिम डेमो|Demo sintética|عرض بإشارة اصطناعية
Compartilhamento encerrado · selecione Áudio do PC / aba|Sharing ended · select Tab or computer audio|共享已结束 · 选择标签页或电脑音频|शेयरिंग समाप्त हुई · टैब या कंप्यूटर का ऑडियो चुनें|Compartición finalizada · elige Audio de pestaña o del ordenador|انتهت المشاركة · اختر صوت علامة تبويب أو الكمبيوتر
Fonte temporariamente sem fornecer áudio|The source is temporarily silent|来源暂时未提供音频|स्रोत फ़िलहाल ऑडियो नहीं दे रहा है|La fuente está temporalmente en silencio|المصدر لا يرسل صوتًا مؤقتًا
Faixa conectada|Track connected|音轨已连接|ट्रैक कनेक्ट है|Pista conectada|المسار متصل
sem sinal audível|no audible signal|无可听信号|सुनाई देने वाला सिग्नल नहीं है|sin señal audible|لا توجد إشارة مسموعة
recebendo sinal|receiving signal|正在接收信号|सिग्नल मिल रहा है|recibiendo señal|يجري استقبال إشارة
Arquivo terminou|File ended|文件播放结束|फ़ाइल चलना समाप्त हुआ|El archivo terminó|انتهى تشغيل الملف
Arquivo pausado|File paused|文件已暂停|फ़ाइल रुकी हुई है|Archivo en pausa|تشغيل الملف متوقف مؤقتًا
Arquivo em reprodução|File playing|正在播放文件|फ़ाइल चल रही है|Archivo en reproducción|الملف قيد التشغيل
Clique em Retomar áudio|Click Resume audio|点击恢复音频|ऑडियो फिर चलाएँ पर क्लिक करें|Pulsa Reanudar audio|اضغط استئناف الصوت
Página em segundo plano · desenho pode pausar|Page in background · rendering may pause|页面在后台 · 渲染可能暂停|पेज बैकग्राउंड में है · रेंडरिंग रुक सकती है|Página en segundo plano · el renderizado puede pausarse|الصفحة في الخلفية · قد يتوقف العرض مؤقتًا
running|running|正在运行|चल रहा है|en marcha|قيد التشغيل
suspended|suspended|已挂起|निलंबित|suspendido|معلّق
interrupted|interrupted|已中断|बाधित|interrumpido|منقطع
closed|closed|已关闭|बंद|cerrado|مغلق
inativo|inactive|未开启|बंद|inactivo|غير نشط
fonte sem áudio|source has no audio|来源无音频|स्रोत में ऑडियो नहीं है|fuente sin audio|المصدر بلا صوت
putsputs · conexão de áudio|putsputs · audio connection|putsputs · 音频连接|putsputs · ऑडियो कनेक्शन|putsputs · conexión de audio|putsputs · اتصال الصوت
putsputs / CONEXÃO DE ÁUDIO|putsputs / AUDIO CONNECTION|putsputs / 音频连接|putsputs / ऑडियो कनेक्शन|putsputs / CONEXIÓN DE AUDIO|putsputs / اتصال الصوت
Uma janela.|One window.|一个窗口。|एक विंडो।|Una ventana.|نافذة واحدة.
Uma conexão contínua.|One continuous connection.|持续连接。|एक लगातार कनेक्शन।|Una conexión continua.|اتصال مستمر.
Compartilhe o áudio de uma aba ou tela. Depois, deixe esta janela aberta enquanto explora o laboratório.|Share audio from a tab or screen. Leave this window open while you explore the lab.|共享标签页或屏幕的音频。探索实验室时，请保持此窗口打开。|टैब या स्क्रीन का ऑडियो साझा करें। लैब देखते समय इस विंडो को खुला रखें।|Comparte el audio de una pestaña o pantalla. Deja esta ventana abierta mientras exploras el laboratorio.|شارك صوت علامة تبويب أو شاشة. اترك هذه النافذة مفتوحة بينما تستكشف المختبر.
Retomar|Resume|继续|जारी रखें|Reanudar|استئناف
Parar|Stop|停止|रोकें|Detener|إيقاف
Aguardando compartilhamento.|Waiting for audio sharing.|正在等待共享音频。|ऑडियो साझा किए जाने की प्रतीक्षा है।|Esperando que se comparta el audio.|بانتظار مشاركة الصوت.
No seletor do navegador, ative a opção de compartilhar áudio. Recarregar a aba da animação preserva esta conexão; recarregar ou fechar esta janela encerra a captura.|In the browser picker, turn on audio sharing. Reloading the animation tab preserves this connection. Reload or close this window to end capture.|在浏览器的共享选择器中启用共享音频。刷新动画标签页可保留连接。刷新或关闭此窗口会结束捕获。|ब्राउज़र के चयन संवाद में ऑडियो शेयरिंग चालू करें। ऐनिमेशन टैब फिर लोड करने से कनेक्शन बना रहेगा। इस विंडो को फिर लोड या बंद करने पर कैप्चर समाप्त होगा।|En el selector del navegador, activa la opción de compartir audio. Recargar la pestaña de la animación mantiene la conexión. Recargar o cerrar esta ventana finaliza la captura.|فعّل مشاركة الصوت في نافذة اختيار المتصفح. يبقى الاتصال قائمًا عند تحديث علامة تبويب العرض، وينتهي الالتقاط عند تحديث هذه النافذة أو إغلاقها.
O áudio é analisado neste navegador. Não é gravado nem enviado para servidores.|Audio is analyzed in this browser. It is never recorded or sent to servers.|音频在此浏览器中分析，不会被录制或发送到服务器。|ऑडियो का विश्लेषण इसी ब्राउज़र में होता है। इसे रिकॉर्ड या सर्वर पर नहीं भेजा जाता।|El audio se analiza en este navegador. No se graba ni se envía a servidores.|يُحلَّل الصوت في هذا المتصفح. لا يُسجَّل ولا يُرسل إلى خوادم.
Selecione compartilhar áudio.|Select Share audio.|请选择共享音频。|ऑडियो साझा करें चुनें।|Selecciona Compartir audio.|اختر مشاركة الصوت.
“Cipher”, “Local Forecast” e “Dream Culture” — Kevin MacLeod (|“Cipher”, “Local Forecast” and “Dream Culture” — Kevin MacLeod (|《Cipher》《Local Forecast》和《Dream Culture》— Kevin MacLeod（|“Cipher”, “Local Forecast” और “Dream Culture” — Kevin MacLeod (|«Cipher», «Local Forecast» y «Dream Culture» — Kevin MacLeod (|«Cipher» و«Local Forecast» و«Dream Culture» — Kevin MacLeod (
{enabled} de {total} na sessão|{enabled} of {total} in session|已有 {enabled}/{total} 个加入会话|सत्र में {total} में से {enabled}|{enabled} de {total} en la sesión|{enabled} من {total} في الجلسة
{count} preset(s) carregado(s) e salvo(s) localmente.|{count} preset(s) loaded and saved locally.|已加载并在本地保存 {count} 个预设。|{count} प्रीसेट लोड हुए और स्थानीय रूप से सहेजे गए।|{count} preset(s) cargado(s) y guardado(s) localmente.|تم تحميل الإعدادات وحفظها محليًا. العدد: {count}.
Carregando {name}…|Loading {name}…|正在加载 {name}…|{name} लोड हो रहा है…|Cargando {name}…|جارٍ تحميل {name}…
Ver {name}|View {name}|查看 {name}|{name} देखें|Ver {name}|شاهد {name}
Incluir {name} na sessão|Include {name} in session|将 {name} 加入会话|सत्र में {name} शामिल करें|Incluir {name} en la sesión|أضف {name} إلى الجلسة
Favoritar {name}|Favorite {name}|收藏 {name}|{name} पसंदीदा में जोड़ें|Marcar {name} como favorito|أضف {name} إلى المفضلة
Não foi possível ler a biblioteca local: {detail}|Couldn't read the local library: {detail}|无法读取本地预设库：{detail}|लोकल लाइब्रेरी नहीं पढ़ी जा सकी: {detail}|No se pudo leer la biblioteca local: {detail}|تعذّرت قراءة المكتبة المحلية: {detail}
Salvo neste navegador: {name}|Saved in this browser: {name}|已保存在此浏览器：{name}|इसी ब्राउज़र में सहेजा गया: {name}|Guardado en este navegador: {name}|حُفظ في هذا المتصفح: {name}
Não foi salvo: {detail}|Couldn't save: {detail}|无法保存：{detail}|सहेजा नहीं जा सका: {detail}|No se pudo guardar: {detail}|تعذّر الحفظ: {detail}
Importação cancelada: {detail}|Import canceled: {detail}|导入已取消：{detail}|इम्पोर्ट रद्द हुआ: {detail}|Importación cancelada: {detail}|أُلغي الاستيراد: {detail}
Não foi possível carregar: {detail}|Couldn't load: {detail}|无法加载：{detail}|लोड नहीं हो सका: {detail}|No se pudo cargar: {detail}|تعذّر التحميل: {detail}
Não foi possível tocar: {detail}|Couldn't play: {detail}|无法播放：{detail}|चलाया नहीं जा सका: {detail}|No se pudo reproducir: {detail}|تعذّر التشغيل: {detail}
Não foi possível retomar: {detail}|Couldn't resume: {detail}|无法继续：{detail}|जारी नहीं हो सका: {detail}|No se pudo reanudar: {detail}|تعذّر الاستئناف: {detail}
Não foi possível retomar o motor: {detail}|Couldn't resume the audio engine: {detail}|无法恢复音频引擎：{detail}|ऑडियो इंजन फिर नहीं चल सका: {detail}|No se pudo reanudar el motor de audio: {detail}|تعذّر استئناف تشغيل محرك الصوت: {detail}
Não foi possível abrir tela cheia: {detail}|Couldn't open fullscreen: {detail}|无法进入全屏：{detail}|पूरी स्क्रीन नहीं खुल सकी: {detail}|No se pudo abrir la pantalla completa: {detail}|تعذّر الانتقال إلى ملء الشاشة: {detail}
Captura não iniciada: {detail}|Capture couldn't start: {detail}|无法开始捕获：{detail}|कैप्चर शुरू नहीं हुआ: {detail}|No se pudo iniciar la captura: {detail}|تعذّر بدء الالتقاط: {detail}
Erro ao aplicar {path} · consulte o editor|Couldn't apply {path} · see the editor|无法应用 {path} · 请查看编辑器|{path} लागू नहीं हुआ · संपादक देखें|No se pudo aplicar {path} · consulta el editor|تعذّر تطبيق {path} · راجع المحرر
{path} aplicado às {time}|{path} applied at {time}|已于 {time} 应用 {path}|{path} को {time} पर लागू किया गया|{path} aplicado a las {time}|طُبّق {path} في {time}
Preset: {path} · acompanhando alterações no WebStorm|Preset: {path} · watching for changes in WebStorm|预设：{path} · 监测 WebStorm 中的改动|प्रीसेट: {path} · WebStorm के बदलाव देखे जा रहे हैं|Preset: {path} · siguiendo cambios en WebStorm|الإعداد: {path} · تجري مراقبة التغييرات في WebStorm
{band}: {label}|{band}: {label}|{band}：{label}|{band}: {label}|{band}: {label}|{band}: {label}
Motor: {state}|Engine: {state}|引擎：{state}|इंजन: {state}|Motor: {state}|المحرك: {state}
Captura conectada · motor {state}|Capture connected · engine {state}|捕获已连接 · 引擎{state}|कैप्चर कनेक्ट है · इंजन {state}|Captura conectada · motor {state}|الالتقاط متصل · المحرك {state}
{source} · GRAVE {bass} · MÉDIO {mid} · AGUDO {treble} · RMS {rms} · {fps} FPS|{source} · BASS {bass} · MID {mid} · TREBLE {treble} · RMS {rms} · {fps} FPS|{source} · 低频 {bass} · 中频 {mid} · 高频 {treble} · RMS {rms} · {fps} FPS|{source} · बास {bass} · मिड {mid} · ट्रेबल {treble} · RMS {rms} · {fps} FPS|{source} · GRAVES {bass} · MEDIOS {mid} · AGUDOS {treble} · RMS {rms} · {fps} FPS|{source} · منخفض {bass} · متوسط {mid} · مرتفع {treble} · RMS {rms} · {fps} إطار/ث
LIVE|LIVE|实时|लाइव|EN DIRECTO|مباشر
PREVIEW|PREVIEW|预览|पूर्वावलोकन|VISTA PREVIA|معاينة
DEMO|DEMO|演示|डेमो|DEMO|تجريبي
REMOTE|REMOTE|远程|रिमोट|REMOTO|عن بُعد
NONE|NONE|无音频|ऑडियो नहीं|SIN AUDIO|لا يوجد صوت
`.trim();
  for (const row of supplemental.split('\n')) {
    const [source, ...translations] = row.split('|');
    messages.set(source, translations);
  }

  function resolveLanguage(value) {
    if (typeof value !== 'string') return undefined;
    const primary = value.toLowerCase().split(/[-_]/, 1)[0];
    if (primary === 'pt') return 'pt-BR';
    if (primary === 'zh') return 'zh-CN';
    return languages.has(primary) ? primary : undefined;
  }

  function preferenceFor(value) {
    return resolveLanguage(value) ?? 'auto';
  }

  function detectLanguage() {
    const browserLanguages = [...(navigator.languages || []), navigator.language];
    return browserLanguages.map(resolveLanguage).find(Boolean) ?? 'en';
  }

  let preference = 'auto';
  try {
    preference = preferenceFor(localStorage.getItem(storageKey));
  } catch {}
  let activeLanguage = preference === 'auto' ? detectLanguage() : preference;

  function t(source, values = {}) {
    if (typeof source !== 'string') return source;
    const column = languageColumns.indexOf(activeLanguage);
    const translated = messages.get(source)?.[column] ?? source;
    return translated.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
  }

  const dynamicText = [
    ['enabled-count', /^(\d+) de (\d+) na sessão$/, '{enabled} de {total} na sessão', ['enabled', 'total']],
    ['local-preset-status', /^(\d+) preset\(s\) carregado\(s\) e salvo\(s\) localmente\.$/, '{count} preset(s) carregado(s) e salvo(s) localmente.', ['count']],
    ['local-preset-status', /^Salvo neste navegador: (.+)$/s, 'Salvo neste navegador: {name}', ['name']],
    ['preset-description', /^Carregando (.+)…$/s, 'Carregando {name}…', ['name']],
    ['script-status', /^Erro ao aplicar (.+) · consulte o editor$/, 'Erro ao aplicar {path} · consulte o editor', ['path']],
    ['script-status', /^(.+) aplicado às (.+)$/, '{path} aplicado às {time}', ['path', 'time']],
    ['script-status', /^Preset: (.+) · acompanhando alterações no WebStorm$/, 'Preset: {path} · acompanhando alterações no WebStorm', ['path']],
    ['meters', /^(\w+) · GRAVE (\S+) · MÉDIO (\S+) · AGUDO (\S+) · RMS (\S+) · (\d+) FPS$/, '{source} · GRAVE {bass} · MÉDIO {mid} · AGUDO {treble} · RMS {rms} · {fps} FPS', ['source', 'bass', 'mid', 'treble', 'rms', 'fps']]
  ];

  const errorPrefixes = [
    'Não foi possível ler a biblioteca local',
    'Não foi salvo',
    'Importação cancelada',
    'Não foi possível carregar',
    'Não foi possível tocar',
    'Não foi possível retomar',
    'Não foi possível retomar o motor',
    'Não foi possível abrir tela cheia',
    'Captura não iniciada'
  ];

  function translateDiagnostic(source) {
    return source.split(' · ').map(part => {
      if (messages.has(part)) return t(part);
      if (part.startsWith('Motor: ')) return t('Motor: {state}', { state: t(part.slice(7)) });
      if (part.startsWith('motor ')) return t('Captura conectada · motor {state}', { state: t(part.slice(6)) });
      return part;
    }).join(' · ');
  }

  function translate(source, element, attribute) {
    if (activeLanguage === 'pt-BR') return source;
    const id = element.id;
    if (attribute === 'aria-label') {
      if (element.closest('.preset-card')) {
        const include = /^Incluir (.+) na sessão$/s.exec(source);
        if (include) return t('Incluir {name} na sessão', { name: include[1] });
        for (const verb of ['Ver', 'Favoritar']) {
          if (source.startsWith(verb + ' ')) return t(verb + ' {name}', { name: source.slice(verb.length + 1) });
        }
      }
      if (element.closest('.group-row')) {
        const band = /^(.+): (.+)$/.exec(source);
        if (band) return t('{band}: {label}', { band: band[1], label: t(band[2]) });
      }
    }

    if (messages.has(source)) return t(source);
    if (attribute) return source;

    if (id === 'visual-family') {
      const lowerCase = source.toLocaleLowerCase('pt-BR');
      const titleCase = lowerCase.charAt(0).toLocaleUpperCase('pt-BR') + lowerCase.slice(1);
      return t(titleCase).toLocaleUpperCase(activeLanguage);
    }
    if (id === 'capture-health') return translateDiagnostic(source);
    if (id === 'state' && source.startsWith('Captura conectada · motor ')) {
      return translateDiagnostic(source.replace('Captura conectada · ', ''));
    }
    if (element.matches('pre')) return source.split('\n').map(line => t(line)).join('\n');

    for (const [target, parse, template, parameters] of dynamicText) {
      if (target !== id) continue;
      const match = parse.exec(source);
      if (!match) continue;
      const values = Object.fromEntries(parameters.map((key, index) => [key, match[index + 1]]));
      if (id === 'meters') values.source = t(values.source);
      return t(template, values);
    }
    if (['status', 'local-preset-status', 'preset-description', 'state'].includes(id)) {
      for (const prefix of errorPrefixes) {
        if (source.startsWith(prefix + ': ')) {
          return t(prefix + ': {detail}', { detail: t(source.slice(prefix.length + 2)) });
        }
      }
    }
    return source;
  }

  const textState = new WeakMap();
  const attributeState = new WeakMap();
  const observedAttributes = ['aria-label', 'placeholder', 'title', 'label', 'content'];
  const trackedAttributes = new Set(observedAttributes);
  const blockedText = 'script,style,textarea,svg,.ace_editor,[contenteditable],#error,#stage';
  const blockedAttributes = 'script,style,svg,.ace_editor,[contenteditable],#error,[data-i18n-ignore]';

  function authoredText(node) {
    const previous = textState.get(node);
    return node.data === previous?.rendered ? previous.source : node.data;
  }

  const sourceByStatus = new Map();
  for (const [source, translations] of messages) {
    for (const value of translations) sourceByStatus.set(value, source);
  }

  function updateText(node) {
    const element = node.parentElement;
    if (!element || element.closest(blockedText) || element.closest('[data-i18n-ignore],[data-i18n-skip]')) return;
    const authored = authoredText(node);
    const source = element.id === 'status' && !messages.has(authored)
      ? sourceByStatus.get(authored) ?? authored : authored;
    const significant = source.trim();
    if (!significant || /^[\d\s.:%×]+$/.test(significant)) return;
    const exampleOption = element.matches('option') ? element.closest('select')?.id : '';
    if (exampleOption === 'preset' && element.value.startsWith('local:')) return;

    const translated = translate(significant, element);
    const rendered = translated === significant ? source : source.replace(significant, () => translated);
    textState.set(node, { source, rendered });
    if (node.data !== rendered) node.data = rendered;
  }

  function updateAttribute(element, name) {
    const value = element.getAttribute(name);
    if (!value || element.closest(blockedAttributes)) return;
    if (name === 'content' && !element.matches('meta[name="description"]')) return;
    if (name === 'label' && !element.matches('optgroup')) return;
    if (name === 'title' && element.matches('.preview-pick') && element.closest('.preset-card')?.querySelector('.preset-card-tag')?.textContent === t('Seus presets')) return;

    let attributes = attributeState.get(element);
    if (!attributes) attributeState.set(element, attributes = new Map());
    const previous = attributes.get(name);
    const source = value === previous?.rendered ? previous.source : value;
    const rendered = translate(source, element, name);
    attributes.set(name, { source, rendered });
    if (value !== rendered) element.setAttribute(name, rendered);
  }

  const attributeSelector = observedAttributes.map(name => '[' + name + ']').join(',');

  function apply(root = document.documentElement) {
    if (root.nodeType === Node.TEXT_NODE) {
      updateText(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    if (root.matches('svg,script,style,.ace_editor,[data-i18n-ignore]')) return;
    for (const name of observedAttributes) updateAttribute(root, name);
    for (const child of root.querySelectorAll(attributeSelector)) {
      for (const name of observedAttributes) updateAttribute(child, name);
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let text = walker.nextNode(); text; text = walker.nextNode()) updateText(text);
  }

  let languageSelect;
  function updateSelector() {
    if (!languageSelect) return;
    const label = t('Idioma');
    languageSelect.title = label;
    languageSelect.setAttribute('aria-label', label);
    languageSelect.options[0].textContent = t('Automático');
    languageSelect.value = preference;
  }

  function setLanguage(value, persist = true) {
    preference = preferenceFor(value);
    activeLanguage = preference === 'auto' ? detectLanguage() : preference;
    document.documentElement.lang = activeLanguage;
    document.documentElement.dir = activeLanguage === 'ar' ? 'rtl' : 'ltr';
    if (persist) {
      try { localStorage.setItem(storageKey, preference); } catch {}
    }
    updateSelector();
    apply();
    document.dispatchEvent(new CustomEvent('puts-language-change', { detail: { language: activeLanguage, preference } }));
    return activeLanguage;
  }

  function mountLanguageSelect() {
    const header = document.querySelector('.app-header');
    if (languageSelect || !header) return languageSelect;
    languageSelect = document.createElement('select');
    languageSelect.id = 'language-select';
    languageSelect.className = 'language-select';
    languageSelect.setAttribute('data-i18n-ignore', '');
    languageSelect.add(new Option('', 'auto'));
    for (const [code, label] of languages) {
      const option = new Option(label, code);
      option.lang = code;
      languageSelect.add(option);
    }
    languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
    header.insertBefore(languageSelect, header.querySelector('#theme-toggle'));
    updateSelector();
    return languageSelect;
  }

  window.PutsI18n = {
    t,
    apply,
    setLanguage,
    mountLanguageSelect,
    get language() { return activeLanguage; },
    get preference() { return preference; }
  };

  mountLanguageSelect();
  setLanguage(preference, false);
  const observer = new MutationObserver(records => {
    const changedNodes = new Set();
    const changedAttributes = new Map();
    for (const record of records) {
      if (record.type === 'attributes') {
        if (!trackedAttributes.has(record.attributeName)) continue;
        if (!changedAttributes.has(record.target)) changedAttributes.set(record.target, new Set());
        changedAttributes.get(record.target).add(record.attributeName);
      } else if (record.type === 'characterData') {
        changedNodes.add(record.target);
      } else {
        for (const added of record.addedNodes) changedNodes.add(added);
      }
    }
    for (const node of changedNodes) if (node.isConnected) apply(node);
    for (const [element, names] of changedAttributes) {
      if (element.isConnected) for (const name of names) updateAttribute(element, name);
    }
  });
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: observedAttributes
  });
  window.addEventListener('languagechange', () => {
    if (preference === 'auto') setLanguage('auto', false);
  });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) setLanguage(event.newValue, false);
  });
})();
