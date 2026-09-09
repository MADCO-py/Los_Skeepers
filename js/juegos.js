// ---- SALA DE JUEGOS: consola "SKEEPER BOY" ----
try{
  const GAMES = [
    { slug:'quiz',     name:'¿QUÉ SKEEPER SOS?',      ready:true  },
    { slug:'codigos',  name:'LOS CÓDIGOS SECRETOS',     ready:false },
    { slug:'memorama', name:'MEMORAMA SKEEPER',         ready:false },
    { slug:'atrapa',   name:'ATRAPA AL SKEEPER',        ready:true  },
    { slug:'corre',    name:'CORRE Y ESQUIVA',          ready:false },
    { slug:'puzzle',   name:'ROMPECABEZAS DESLIZANTE',  ready:false },
    { slug:'trivia',   name:'TRIVIA SKEEPER',           ready:false },
    { slug:'rasca',    name:'RASCA Y GANA',             ready:false },
  ];
  let gbIndex = 0;
  const gbTitle = document.getElementById('gb-title');
  const gbStatus = document.getElementById('gb-status');
  const gbCounter = document.getElementById('gb-counter');
  const gbScreen = document.getElementById('gb-screen');
  const gameOverlay = document.getElementById('game-overlay');
  const gameOverlayTag = document.getElementById('game-overlay-tag');

  function renderGame(){
    const g = GAMES[gbIndex];
    gbCounter.textContent = (gbIndex + 1) + '/' + GAMES.length;
    gbTitle.textContent = g.name;
    gbStatus.classList.remove('soon');
    gbStatus.textContent = g.ready ? '▶ PRESIONA A' : 'PRÓXIMAMENTE';
    gbTitle.classList.remove('flip');
    void gbTitle.offsetWidth; // reinicia la animación
    gbTitle.classList.add('flip');
  }

  function moveGame(dir){
    gbIndex = (gbIndex + dir + GAMES.length) % GAMES.length;
    renderGame();
  }

  function shakeNotReady(){
    gbStatus.textContent = 'PRÓXIMAMENTE';
    gbStatus.classList.remove('soon');
    void gbStatus.offsetWidth;
    gbStatus.classList.add('soon');
    gbScreen.classList.add('gb-shake');
    setTimeout(() => gbScreen.classList.remove('gb-shake'), 400);
  }

  // abre el minijuego como si fuera "otra pestaña": pantalla completa, con botón de volver
  function openGame(slug){
    const g = GAMES.find(x => x.slug === slug);
    if (!g){ return; }
    if (!g.ready){ shakeNotReady(); return; }

    document.querySelectorAll('.game-slot').forEach(el => el.classList.remove('active'));
    const slot = document.getElementById('game-slot-' + slug);
    if (slot) slot.classList.add('active');

    gameOverlayTag.textContent = g.name;
    gameOverlay.classList.add('open');
    document.body.classList.add('lock');
    gameOverlay.scrollTop = 0;
    // history.replaceState puede tronar (SecurityError) si el archivo se abre con file://
    try { history.replaceState(null, '', '#' + slug); } catch(e){}
  }

  function closeGame(){
    gameOverlay.classList.remove('open');
    document.body.classList.remove('lock');
    try { history.replaceState(null, '', '#juegos'); } catch(e){}
    const juegosSection = document.getElementById('juegos');
    if (juegosSection) juegosSection.scrollIntoView({ behavior:'auto', block:'start' });
  }

  document.getElementById('game-back').addEventListener('click', closeGame);

  document.getElementById('gb-left').addEventListener('click', () => moveGame(-1));
  document.getElementById('gb-right').addEventListener('click', () => moveGame(1));
  document.getElementById('gb-a').addEventListener('click', () => openGame(GAMES[gbIndex].slug));
  document.getElementById('gb-b').addEventListener('click', () => {
    gbIndex = Math.floor(Math.random() * GAMES.length);
    renderGame();
  });

  // navegación por teclado cuando la consola tiene el foco (accesibilidad)
  document.getElementById('gameboy').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') moveGame(-1);
    if (e.key === 'ArrowRight') moveGame(1);
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGame(GAMES[gbIndex].slug); }
  });

  // el link del nav "¿Qué Skeeper Sos?" abre el overlay directo, no hace scroll nativo
  document.querySelectorAll('.nav-game-link').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = a.dataset.game;
      const idx = GAMES.findIndex(g => g.slug === slug);
      if (idx !== -1) gbIndex = idx;
      renderGame();
      openGame(slug);
    });
  });

  renderGame();

  // link directo compartible: tusitio.com/#quiz abre el minijuego de una vez (igual que los integrantes)
  window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '');
    const idx = GAMES.findIndex(g => g.slug === hash);
    if (idx !== -1){
      gbIndex = idx;
      renderGame();
      openGame(hash);
    }
  });
}catch(e){}

// (el quiz y el share sheet vivían dentro del mismo try grande de integrantes/chat en site.js;
// acá les damos su propio try para que un error en uno no tumbe el juego de abajo)
try {
// ---- QUIZ: QUE SKEEPER ERES ----
const QUIZ_QUESTIONS = [
  {
    q: '¿Cuál es tu canción favorita de Los Skeepers?',
    type: 'text',
    options: [
      { label: 'SIEMPRE', members: ['joaquin','danniel'] },
      { label: 'NADA MÁS +', members: ['alex','juan'] },
      { label: 'JUANILLO REGUETÓN', members: ['shipi'] },
      { label: 'Lo Que Duele', members: ['jeremy'] }
    ]
  },
  {
    q: '¿Cuál es tu hobby favorito?',
    type: 'text',
    options: [
      { label: 'Salir a pasear al chucho', members: ['joaquin'] },
      { label: 'Dar clases de Jollybeat y Aura', members: ['alex'] },
      { label: 'Estudiar cómo la IA anuncia el colapso del capitalismo tardío', members: ['shipi'] },
      { label: 'Probar hobbies hasta encontrar otro que me guste más+', members: ['danniel'] },
      { label: 'Aventar globos con agua a los haters', members: ['jeremy'] },
      { label: 'Hacerme el interesante en letterboxd y dormir', members: ['juan'] }
    ]
  },
  {
    q: '¿En qué casa vivirías?',
    type: 'photo',
    options: [
      { label: 'Casita en la isla', img: 'assets/quiz/casa-juan.jpg', members: ['juan'] },
      { label: 'Casa-zapato', img: 'assets/quiz/casa-jeremy.jpg', members: ['jeremy'] },
      { label: 'Iglú', img: 'assets/quiz/casa-shipi.jpg', members: ['shipi'] },
      { label: 'Casa clásica', img: 'assets/quiz/casa-danniel.jpg', members: ['danniel'] },
      { label: 'Casa embrujada', img: 'assets/quiz/casa-joaquin.jpg', members: ['joaquin'] },
      { label: 'Mansión', img: 'assets/quiz/casa-alex.jpg', members: ['alex'] }
    ]
  },
  {
    q: '¿Qué corte de cabello te harías?',
    type: 'photo',
    options: [
      { label: 'La flecha', img: 'assets/quiz/pelo-juan.jpg', members: ['juan'] },
      { label: 'Hello Kitty mohawk', img: 'assets/quiz/pelo-jeremy.jpg', members: ['jeremy'] },
      { label: 'Piojo Alvarado cut', img: 'assets/quiz/pelo-alex.jpg', members: ['alex'] },
      { label: 'Claire cut', img: 'assets/quiz/pelo-shipi.jpg', members: ['shipi'] },
      { label: 'Espinas pelo chikito', img: 'assets/quiz/pelo-danniel.jpg', members: ['danniel'] },
      { label: 'Bob corto', img: 'assets/quiz/pelo-joaquin.jpg', members: ['joaquin'] }
    ]
  },
  {
    q: '¿Qué superpoder tendrías?',
    type: 'text',
    options: [
      { label: 'Poder comer brócoli o ser increíble jugando boliche', members: ['joaquin'] },
      { label: 'Saber exactamente cómo responder cada pregunta para no quedar como idiota', members: ['alex'] },
      { label: 'Poder explotar una sola vez', members: ['jeremy'] },
      { label: 'Poder hablar con la boca cerrada MUY fuerte', members: ['danniel'] },
      { label: 'Hacer feliz a todos mis amigos o dormir extra sin llegar tarde', members: ['juan'] }
    ]
  },
  {
    q: 'Tu crush te acepta una cita, ¿a dónde le llevarías?',
    type: 'photo',
    options: [
      { label: 'El bowling alley', img: 'assets/quiz/cita-joaquin.jpg', members: ['joaquin'] },
      { label: 'Perimágico de Perinorte', img: 'assets/quiz/cita-alex.jpg', members: ['alex'] },
      { label: 'A controlar nuestro chakra', img: 'assets/quiz/cita-danniel.jpg', members: ['danniel'] },
      { label: 'Un acuario', img: 'assets/quiz/cita-shipi.jpg', members: ['shipi'] },
      { label: 'Chernóbil', img: 'assets/quiz/cita-jeremy.jpg', members: ['jeremy'] },
      { label: 'Un viaje por la era mesozoica', img: 'assets/quiz/cita-juan.jpg', members: ['juan'] }
    ]
  }
];

let quizStep = 0;
let quizScores = {};

const quizIntro = document.getElementById('quiz-intro');
const quizFlow = document.getElementById('quiz-flow');
const quizResultPanel = document.getElementById('quiz-result');
const quizStart = document.getElementById('quiz-start');
const quizOptionsEl = document.getElementById('quiz-options');
const quizQuestionEl = document.getElementById('quiz-question');
const quizStepLabel = document.getElementById('quiz-step-label');
const quizProgressBar = document.getElementById('quiz-progress-bar');

function startQuiz(){
  quizStep = 0;
  quizScores = {};
  Object.keys(MEMBERS).forEach(k => quizScores[k] = 0);
  quizIntro.style.display = 'none';
  quizResultPanel.style.display = 'none';
  quizFlow.style.display = 'block';
  renderQuizStep();
}

function renderQuizStep(){
  const step = QUIZ_QUESTIONS[quizStep];
  quizStepLabel.textContent = `Pregunta ${quizStep + 1} de ${QUIZ_QUESTIONS.length}`;
  quizProgressBar.style.width = `${(quizStep / QUIZ_QUESTIONS.length) * 100}%`;
  quizQuestionEl.textContent = step.q;
  quizOptionsEl.innerHTML = '';
  quizOptionsEl.className = 'quiz-options' + (step.type === 'photo' ? ' photo-options' : '');
  step.options.forEach(opt => {
    const btn = document.createElement('div');
    btn.className = 'quiz-option';
    btn.innerHTML = step.type === 'photo'
      ? `<img src="${opt.img}" alt="${opt.label}" loading="lazy">`
      : `<span>${opt.label}</span>`;
    btn.addEventListener('click', () => {
      opt.members.forEach(m => { quizScores[m] = (quizScores[m] || 0) + 1; });
      quizStep++;
      // sube la vista para que se lea la nueva pregunta desde el inicio, no desde donde quedó el scroll
      const quizFlowPanel = document.getElementById('quiz-flow');
      if (quizFlowPanel) quizFlowPanel.scrollTop = 0;
      if (quizStep < QUIZ_QUESTIONS.length) {
        renderQuizStep();
      } else {
        quizProgressBar.style.width = '100%';
        setTimeout(showQuizResult, 300);
      }
    });
    quizOptionsEl.appendChild(btn);
  });
}

function showQuizResult(){
  let winner = 'danniel', top = -1;
  Object.entries(quizScores).forEach(([slug, score]) => {
    if (score > top) { top = score; winner = slug; }
  });
  const totalAnswers = QUIZ_QUESTIONS.length;
  const pct = Math.round((top / totalAnswers) * 100);
  const data = MEMBERS[winner];

  document.getElementById('result-img').src = 'assets/group-hero.jpg';
  document.getElementById('result-img').alt = data.name;
  document.getElementById('result-name').textContent = data.name;
  document.getElementById('result-match').textContent = `Sos ${pct}% ${data.name}`;
  document.getElementById('result-fact').textContent = data.fact;

  quizFlow.style.display = 'none';
  quizResultPanel.style.display = 'block';
}

quizStart.addEventListener('click', startQuiz);
document.getElementById('result-retry').addEventListener('click', startQuiz);

// ---- ATRAPA AL SKEEPER: snake clásico, los 6 en fila recogiendo fans, pantalla completa ----
// escenario arriba (de ahí "salen") + pista de baile subterránea de noche abajo
try{
  const CELL = 58; // tamaño estándar +20%
  const FIXED_COLS = 20, FIXED_ROWS = 12; // se camina en toda la pantalla; +1 fila por quitar la barra de arriba
  const FLOOR_DARK = '#1a1424', FLOOR_DARK2 = '#241b2f';
  const MEMBER_ORDER = ['danniel','joaquin','juan','jeremy','alex','shipi'];
  // descripciones de puro sabor — solo cambian quién va al frente, no afectan el juego en nada más
  const SELECT_OPTIONS = [
    { slug:'danniel', name:'Danniel', desc:'Hace que sea más cool atrapar a los fans.' },
    { slug:'joaquin', name:'Joaquín', desc:'Le pone flow a la fila — todos entran con más estilo.' },
    { slug:'juan',    name:'Juan',    desc:'Hace que hasta la pista sepa a ketchup.' },
    { slug:'jeremy',  name:'Jeremy',  desc:'Hace que bailen los fans.' },
    { slug:'alex',    name:'Alex',    desc:'Le pone el perfect pitch — todos van al ritmo.' },
    { slug:'shipi',   name:'Shipi',   desc:'Hace que caminen más rápido.' }
  ];
  const MEMBER_COLORS = { danniel:'#C50300', joaquin:'#F0B429', juan:'#2B4C3F', jeremy:'#191512', alex:'#8B5E3C', shipi:'#9C8248' };
  const SKIN_TONE = '#C68958', HAIR_TONE = '#191512', PANTS_TONE = '#191512';
  const NEON_COLORS = ['#F0B429', '#C50300', '#2B4C3F', '#8B5E3C'];
  const START_TICK = 260, MIN_TICK = 160, TICK_STEP = 2;
  const FAN_WANDER_EVERY = 3, FAN_SPAWN_MS = 5000;

  const SHEET_COLS = 4, SHEET_ROWS = 3; // filas: 0=frente 1=lado 2=espalda; columnas = frames de caminata
  const SHEET_ROW_FOR_VIEW = { front: 0, side: 1, back: 2 };

  function loadImg(src){ const img = new Image(); img.src = src; return img; }

  // un solo spritesheet por integrante (3 filas: frente/lado/espalda, 4 columnas = ciclo de caminata)
  const memberSheets = {};
  MEMBER_ORDER.forEach(slug => {
    memberSheets[slug] = loadImg('assets/atrapa/' + slug + '-sheet.png');
  });

  // varias apariencias de fan, cada una con su spritesheet "caminando" y su spritesheet
  // "ya atrapado" (el que se usa cuando se une animado atrás de la fila)
  const FAN_PHOTO_SETS = ['fan1', 'fan2', 'fan4', 'fan5'].map(name => ({
    name: name,
    sheet: loadImg('assets/atrapa/' + name + '-sheet.png'),
    caughtSheet: loadImg('assets/atrapa/' + name + '-caught-sheet.png')
  }));

  // ---- sprite pixel-art de respaldo 8x10 (por si algún día falta una foto) ----
  const SPRITE_ROWS = [
    '..HHHH..',
    '.HHHHHH.',
    '.HSESES.',
    '.HSSSSH.',
    '..SSSS..',
    '.BBBBBB.',
    '.BBBBBB.',
    '.BBBBBB.',
    '.PP..PP.',
    '.PP..PP.'
  ];
  const SPRITE_W = 8, SPRITE_H = 10;

  function drawPixelPerson(px, py, cell, bodyColor, hairColor){
    const subW = cell / SPRITE_W, subH = cell / SPRITE_H;
    for (let r = 0; r < SPRITE_H; r++){
      const row = SPRITE_ROWS[r];
      for (let c = 0; c < SPRITE_W; c++){
        const ch = row[c];
        if (ch === '.') continue;
        ctx.fillStyle = ch === 'H' ? hairColor
          : ch === 'S' ? SKIN_TONE
          : ch === 'E' ? '#191512'
          : ch === 'B' ? bodyColor
          : PANTS_TONE;
        ctx.fillRect(px + c * subW, py + r * subH, Math.ceil(subW), Math.ceil(subH));
      }
    }
  }

  const slotEl = document.getElementById('game-slot-atrapa');
  const canvas = document.getElementById('atrapa-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('atrapa-score');
  const startScreen = document.getElementById('atrapa-start-screen');
  const overScreen = document.getElementById('atrapa-over-screen');
  const selectScreen = document.getElementById('atrapa-select-screen');
  const selectPortrait = document.getElementById('atrapa-select-portrait');
  const selectNameEl = document.getElementById('atrapa-select-name');
  const selectDescEl = document.getElementById('atrapa-select-desc');
  const selectPrevBtn = document.getElementById('atrapa-select-prev');
  const selectNextBtn = document.getElementById('atrapa-select-next');
  const selectConfirmBtn = document.getElementById('atrapa-select-confirm');
  const overScoreEl = document.getElementById('atrapa-over-score');
  const muteBtn = document.getElementById('atrapa-mute');
  const canvasWrap = document.getElementById('atrapa-canvas-wrap');

  let COLS = 20, ROWS = 12, boardTexture = null;
  let snake, segmentIdentities, dir, nextDir, fans, score, tickInterval, loopHandle, running, tickCount, spawnTimer, fanTarget, fanMax;
  let animFrame = 0; // frame del ciclo de caminata (0-3), avanza en cada paso
  let uiState = 'select'; // 'select' | 'start' | 'playing' | 'over'
  let selectedLeaderIndex = 0; // se mantiene entre partidas de la misma sesión, no se resetea solo

  function safeGetMuted(){
    try { return localStorage.getItem('skeepers-atrapa-muted') === '1'; } catch(e){ return false; }
  }
  function safeSetMuted(v){
    try { localStorage.setItem('skeepers-atrapa-muted', v ? '1' : '0'); } catch(e){}
  }
  let muted = safeGetMuted();

  // helper: coordenada de grilla -> pixel real (la pista empieza después del escenario)
  function pxY(gridY){ return gridY * CELL; }

  function buildBoard(){
    boardTexture = document.createElement('canvas');
    boardTexture.width = canvas.width; boardTexture.height = canvas.height;
    const octx = boardTexture.getContext('2d');

    // ---- pista de baile subterránea: piso oscuro parejo, se camina en toda la pantalla ----
    for (let y = 0; y < ROWS; y++){
      for (let x = 0; x < COLS; x++){
        octx.fillStyle = (x + y) % 2 === 0 ? FLOOR_DARK : FLOOR_DARK2;
        octx.fillRect(x * CELL, pxY(y), CELL, CELL);
      }
    }

    // hilera de lucecitas pixeladas apenas arriba de todo, de puro adorno (no bloquea nada)
    const bulbGap = Math.max(18, CELL * 0.4);
    let bi = 0;
    for (let bx = bulbGap / 2; bx < canvas.width; bx += bulbGap){
      const c = NEON_COLORS[bi % NEON_COLORS.length];
      octx.fillStyle = c;
      octx.fillRect(bx - 4, 6, 8, 8);
      octx.fillStyle = c + '55';
      octx.fillRect(bx - 7, 3, 14, 14);
      bi++;
    }

    // algunas losetas "encendidas" al azar, como pista de baile iluminada
    for (let y = 0; y < ROWS; y++){
      for (let x = 0; x < COLS; x++){
        if (Math.random() < 0.07){
          const glow = octx.createRadialGradient(
            x * CELL + CELL / 2, pxY(y) + CELL / 2, 1,
            x * CELL + CELL / 2, pxY(y) + CELL / 2, CELL * 0.7
          );
          const c = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
          glow.addColorStop(0, c + '88');
          glow.addColorStop(1, c + '00');
          octx.fillStyle = glow;
          octx.fillRect(x * CELL, pxY(y), CELL, CELL);
        }
      }
    }
  }

  // tamaño fijo/estándar — no se ajusta a la pantalla; el canvas se escala solo por CSS
  // (width:100%;height:auto) para no verse enorme en pantallas grandes
  function sizeCanvas(cb){
    COLS = FIXED_COLS;
    ROWS = FIXED_ROWS;
    canvas.width = COLS * CELL;
    canvas.height = ROWS * CELL;
    fanTarget = Math.min(10, Math.max(4, Math.round((COLS * ROWS) / 70)));
    fanMax = fanTarget + 2;
    buildBoard();
    if (cb) cb();
  }

  // ---- audio 8-bit sencillo (WebAudio, sin archivos) ----
  let audioCtx = null;
  function ensureAudio(){
    if (audioCtx) return;
    try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){}
  }
  function beep(freq, dur, type, vol){
    if (muted || !audioCtx) return;
    try{
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type || 'square';
      osc.frequency.value = freq;
      gain.gain.value = vol || 0.05;
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      osc.stop(audioCtx.currentTime + dur);
    }catch(e){}
  }
  function sfxMove(){ beep(110, 0.02, 'square', 0.015); }
  function sfxEat(){ beep(520, 0.07, 'square', 0.05); setTimeout(() => beep(760, 0.08, 'square', 0.05), 60); }
  function sfxLose(){ beep(200, 0.18, 'sawtooth', 0.06); setTimeout(() => beep(120, 0.22, 'sawtooth', 0.06), 120); }

  function updateMuteBtn(){ muteBtn.textContent = muted ? '✕' : '♪'; }
  function toggleMute(){
    muted = !muted;
    safeSetMuted(muted);
    updateMuteBtn();
  }
  updateMuteBtn();
  muteBtn.addEventListener('click', toggleMute);

  function randCell(){ return { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
  function cellFree(x, y){
    if (snake.some(s => s.x === x && s.y === y)) return false;
    if (fans.some(f => f.x === x && f.y === y)) return false;
    return true;
  }
  function freeCell(){
    let c = randCell(), tries = 0;
    while (!cellFree(c.x, c.y) && tries < 300){ c = randCell(); tries++; }
    return c;
  }
  function makeFan(){
    const c = freeCell();
    c.spriteSet = FAN_PHOTO_SETS[Math.floor(Math.random() * FAN_PHOTO_SETS.length)];
    c.dir = { x: 0, y: 1 };
    return c;
  }

  function resetState(){
    // arrancan arriba de toda la pista, caminando hacia abajo
    const startY = 0;
    const startX = Math.floor(COLS / 2);
    snake = [];
    for (let i = 0; i < 6; i++) snake.push({ x: startX, y: startY - i });
    // identidad fija por puesto en la fila: el elegido en la pantalla de selección va al
    // frente, el resto mantiene su orden de siempre atrás; cada fan que se atrapa se agrega
    // al final y se queda ahí para siempre
    const leaderSlug = SELECT_OPTIONS[selectedLeaderIndex].slug;
    const order = [leaderSlug, ...MEMBER_ORDER.filter(s => s !== leaderSlug)];
    segmentIdentities = order.map(slug => ({ kind: 'skeeper', slug: slug }));
    dir = { x: 0, y: 1 };
    nextDir = { x: 0, y: 1 };
    fans = [];
    score = 0;
    tickCount = 0;
    tickInterval = START_TICK;
    for (let i = 0; i < fanTarget; i++) fans.push(makeFan());
    scoreEl.textContent = 'FANS: 0';
  }

  // ---- pantalla de selección de líder ----
  const selectPortraitCtx = selectPortrait.getContext('2d');
  function drawSelectPortrait(slug){
    const sheet = memberSheets[slug];
    selectPortraitCtx.clearRect(0, 0, selectPortrait.width, selectPortrait.height);
    if (sheet && sheet.complete && sheet.naturalWidth){
      const fw = sheet.naturalWidth / SHEET_COLS, fh = sheet.naturalHeight / SHEET_ROWS;
      const scale = Math.min(selectPortrait.width / fw, selectPortrait.height / fh);
      const w = fw * scale, h = fh * scale;
      const dx = (selectPortrait.width - w) / 2, dy = selectPortrait.height - h;
      selectPortraitCtx.imageSmoothingEnabled = false;
      selectPortraitCtx.drawImage(sheet, 0, 0, fw, fh, dx, dy, w, h);
    } else {
      // el spritesheet puede seguir cargando — reintenta si la selección sigue siendo esta
      setTimeout(() => {
        if (SELECT_OPTIONS[selectedLeaderIndex].slug === slug) drawSelectPortrait(slug);
      }, 150);
    }
  }
  function renderSelect(){
    const opt = SELECT_OPTIONS[selectedLeaderIndex];
    selectNameEl.textContent = opt.name.toUpperCase();
    selectDescEl.textContent = opt.desc;
    drawSelectPortrait(opt.slug);
  }
  function selectMove(delta){
    selectedLeaderIndex = (selectedLeaderIndex + delta + SELECT_OPTIONS.length) % SELECT_OPTIONS.length;
    renderSelect();
  }
  function showSelectScreen(){
    uiState = 'select';
    selectScreen.style.display = 'flex';
    startScreen.style.display = 'none';
    overScreen.style.display = 'none';
    renderSelect();
  }
  function confirmLeader(){
    uiState = 'start';
    selectScreen.style.display = 'none';
    startScreen.style.display = 'flex';
  }

  // ---- elegir qué vista (frente/espalda/lado) mostrar según hacia dónde se mueve, y si hay que voltearla ----
  // las fotos "de lado" miran hacia la izquierda por defecto, así que para la derecha se voltean
  function pickView(d){
    if (d.y === -1) return { view: 'back', flip: false };
    if (d.y === 1) return { view: 'front', flip: false };
    if (d.x === -1) return { view: 'side', flip: false };
    return { view: 'side', flip: true };
  }

  // dibuja un recuadro de un spritesheet (fila según la vista, columna según el frame de animación)
  function drawSheetSprite(sheet, gx, gy, flip, targetH, view, frame, fallbackColor, fallbackHair){
    const cx = gx * CELL + CELL / 2;
    const groundY = pxY(gy) + CELL;
    if (sheet && sheet.complete && sheet.naturalWidth){
      const fw = sheet.naturalWidth / SHEET_COLS, fh = sheet.naturalHeight / SHEET_ROWS;
      const row = SHEET_ROW_FOR_VIEW[view];
      const sx = (frame % SHEET_COLS) * fw, sy = row * fh;
      const scale = targetH / fh;
      const w = fw * scale;
      ctx.save();
      if (flip){ ctx.translate(cx, 0); ctx.scale(-1, 1); ctx.translate(-cx, 0); }
      ctx.drawImage(sheet, sx, sy, fw, fh, cx - w / 2, groundY - targetH, w, targetH);
      ctx.restore();
    } else {
      drawPixelPerson(gx * CELL + CELL * 0.06, pxY(gy) + CELL * 0.02, CELL * 0.88, fallbackColor, fallbackHair || HAIR_TONE);
    }
  }

  function draw(){
    ctx.drawImage(boardTexture, 0, 0);

    // orden de dibujo por fila (de arriba hacia abajo) para que se tapen bien entre sí
    const entities = [];
    fans.forEach(f => entities.push({ y: f.y, kind: 'fan', data: f }));
    snake.forEach((s, i) => entities.push({ y: s.y, kind: 'skeeper-slot', data: s, idx: i }));
    entities.sort((a, b) => a.y - b.y);

    entities.forEach(e => {
      if (e.kind === 'fan'){
        const f = e.data;
        const { view, flip } = pickView(f.dir);
        drawSheetSprite(f.spriteSet.sheet, f.x, f.y, flip, CELL * 1.9, view, animFrame, '#FFFDF6', HAIR_TONE);
      } else {
        const id = segmentIdentities[e.idx] || segmentIdentities[segmentIdentities.length - 1];
        // cada puesto de la fila mira hacia donde está el que va justo adelante suyo — así
        // recién gira cuando llega a la esquina donde giró el de adelante, no todos de golpe
        const { view, flip } = pickView(segDir(e.idx));
        if (id.kind === 'fan'){
          drawSheetSprite(id.spriteSet.caughtSheet, e.data.x, e.data.y, flip, CELL * 1.9, view, animFrame, '#FFFDF6', HAIR_TONE);
        } else {
          drawSheetSprite(memberSheets[id.slug], e.data.x, e.data.y, flip, CELL * 1.9, view, animFrame, MEMBER_COLORS[id.slug], HAIR_TONE);
        }
      }
    });
  }

  // dirección "efectiva" de un puesto de la fila: el líder usa la dirección real del juego;
  // el resto mira hacia dónde está el puesto de adelante (su próximo destino), que es
  // exactamente donde ese puesto giró — por eso el giro se propaga casilla por casilla
  function segDir(i){
    if (i === 0) return dir;
    const cur = snake[i], ahead = snake[i - 1];
    const dx = ahead.x - cur.x, dy = ahead.y - cur.y;
    if (dx === 0 && dy === 0) return dir;
    return { x: Math.sign(dx), y: Math.sign(dy) };
  }

  function queueDir(x, y){
    // no permitir invertir directo sobre la fila (regla estándar de snake)
    if (snake.length > 1 && dir.x === -x && dir.y === -y) return;
    nextDir = { x, y };
  }

  function wanderFans(){
    // siempre se mueven (antes se quedaban quietos la mitad de las veces) — el ritmo lento
    // ahora viene de FAN_WANDER_EVERY (revisa cada varios ticks) y no de quedarse parados
    const opts = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
    fans.forEach(f => {
      const order = [...opts].sort(() => Math.random() - 0.5);
      for (const o of order){
        const nx = f.x + o.x, ny = f.y + o.y;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
        if (!cellFree(nx, ny)) continue;
        f.x = nx; f.y = ny; f.dir = o;
        break;
      }
    });
  }

  function maybeSpawnFan(){
    if (fans.length < fanMax) fans.push(makeFan());
  }

  function tick(){
    dir = nextDir;
    const head = snake[0];
    const nx = head.x + dir.x, ny = head.y + dir.y;

    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS){ return gameOver(); }
    if (snake.some(s => s.x === nx && s.y === ny)){ return gameOver(); }

    const eatenIdx = fans.findIndex(f => f.x === nx && f.y === ny);
    snake.unshift({ x: nx, y: ny });

    if (eatenIdx !== -1){
      // se atrapa: desaparece de la pista y se une atrás de la fila con su versión de atrapado
      // (sin animación — de una vez pasa a formar parte de la cola)
      const eaten = fans[eatenIdx];
      fans.splice(eatenIdx, 1);
      segmentIdentities.push({ kind: 'fan', spriteSet: eaten.spriteSet });
      score++;
      scoreEl.textContent = 'FANS: ' + score;
      sfxEat();
      fans.push(makeFan());
      tickInterval = Math.max(MIN_TICK, START_TICK - score * TICK_STEP);
      restartInterval();
    } else {
      snake.pop();
      sfxMove();
    }

    tickCount++;
    if (tickCount % FAN_WANDER_EVERY === 0) wanderFans();
    draw();
  }

  function restartInterval(){
    if (loopHandle) clearInterval(loopHandle);
    loopHandle = setInterval(tick, tickInterval);
  }

  // el ciclo de caminata anda a su propio ritmo (más fluido), sin importar qué tan lento
  // se mueva la fila por la pista — así no se ve tiesa aunque el juego vaya despacio
  const ANIM_MS = 120; // un poco más rápido que antes, se siente menos tieso
  let animHandle = null;
  function startAnim(){
    if (animHandle) clearInterval(animHandle);
    animHandle = setInterval(() => {
      animFrame = (animFrame + 1) % SHEET_COLS;
      if (running) draw();
    }, ANIM_MS);
  }
  function stopAnim(){
    if (animHandle) { clearInterval(animHandle); animHandle = null; }
  }

  function stopLoop(){
    running = false;
    if (loopHandle) { clearInterval(loopHandle); loopHandle = null; }
    if (spawnTimer) { clearInterval(spawnTimer); spawnTimer = null; }
    stopAnim();
  }

  function startGame(){
    ensureAudio();
    // reinicia el estado siempre (arranque inicial y "jugar otra vez" por igual) — si no,
    // al reintentar la serpiente seguía en la posición/dirección donde había chocado y
    // perdía de nuevo al instante
    resetState();
    uiState = 'playing';
    running = true;
    startScreen.style.display = 'none';
    overScreen.style.display = 'none';
    draw();
    restartInterval();
    startAnim();
    spawnTimer = setInterval(maybeSpawnFan, FAN_SPAWN_MS);
  }

  function gameOver(){
    stopLoop();
    uiState = 'over';
    sfxLose();
    overScoreEl.textContent = score + ' FANS';
    overScreen.style.display = 'flex';
  }

  function showIdle(){
    stopLoop();
    sizeCanvas(() => { resetState(); draw(); showSelectScreen(); });
  }

  document.getElementById('atrapa-start-btn').addEventListener('click', startGame);
  document.getElementById('atrapa-retry-btn').addEventListener('click', startGame);
  document.getElementById('atrapa-change-btn').addEventListener('click', () => { showSelectScreen(); });
  canvasWrap.addEventListener('click', () => { if (uiState === 'start') startGame(); });

  selectPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); selectMove(-1); });
  selectNextBtn.addEventListener('click', (e) => { e.stopPropagation(); selectMove(1); });
  document.getElementById('atrapa-select-portrait-wrap').addEventListener('click', (e) => { e.stopPropagation(); selectMove(1); });
  selectConfirmBtn.addEventListener('click', (e) => { e.stopPropagation(); confirmLeader(); });

  document.querySelectorAll('#atrapa-touch button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!slotEl.classList.contains('active')) return;
      if (uiState === 'select') return;
      const dirMap = { up:{x:0,y:-1}, down:{x:0,y:1}, left:{x:-1,y:0}, right:{x:1,y:0} };
      const d = dirMap[btn.dataset.dir];
      if (!running){ startGame(); return; }
      queueDir(d.x, d.y);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (!slotEl.classList.contains('active')) return;
    const k = e.key;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D',' '].includes(k)) e.preventDefault();
    if (k === 'm' || k === 'M'){ toggleMute(); return; }

    if (uiState === 'select'){
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') selectMove(-1);
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') selectMove(1);
      else if (k === ' ' || k === 'Enter') confirmLeader();
      return;
    }
    if (!running){
      if (k === ' ' || k === 'r' || k === 'R') startGame();
      return;
    }
    switch (k){
      case 'ArrowUp': case 'w': case 'W': queueDir(0, -1); break;
      case 'ArrowDown': case 's': case 'S': queueDir(0, 1); break;
      case 'ArrowLeft': case 'a': case 'A': queueDir(-1, 0); break;
      case 'ArrowRight': case 'd': case 'D': queueDir(1, 0); break;
      case 'r': case 'R': startGame(); break;
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden){
      if (loopHandle){ clearInterval(loopHandle); loopHandle = null; }
      stopAnim();
    } else if (running){
      if (!loopHandle) restartInterval();
      if (!animHandle) startAnim();
    }
  });

  // se resetea a la pantalla de inicio cada vez que se entra a este juego desde la Sala de Juegos,
  // y se detiene el loop tanto si se cambia de juego (slot pierde 'active') como si se cierra
  // el overlay completo con "Volver" (el slot se queda 'active' pero el overlay pierde 'open')
  const gameOverlayEl = document.getElementById('game-overlay');
  const atrapaSlotObserver = new MutationObserver(() => {
    if (slotEl.classList.contains('active') && gameOverlayEl.classList.contains('open')) showIdle();
    else stopLoop();
  });
  atrapaSlotObserver.observe(slotEl, { attributes: true, attributeFilter: ['class'] });
  atrapaSlotObserver.observe(gameOverlayEl, { attributes: true, attributeFilter: ['class'] });
}catch(e){}




// ---- share sheet ----
const shareSheet = document.getElementById('share-sheet');
document.getElementById('result-share').addEventListener('click', () => {
  shareSheet.classList.add('open');
});
document.getElementById('share-close').addEventListener('click', () => {
  shareSheet.classList.remove('open');
});

async function getResultBlob(){
  const card = document.getElementById('result-card');
  const canvas = await html2canvas(card, { backgroundColor: '#191512', scale: 2 });
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

async function shareResultImage(){
  try {
    const blob = await getResultBlob();
    const file = new File([blob], 'que-skeeper-eres.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: '¿Qué Skeeper Sos?', text: 'Este es mi resultado del quiz de Los Skeepers' });
      return true;
    }
  } catch(e) { console.error(e); }
  return false;
}

document.getElementById('share-whatsapp').addEventListener('click', async () => {
  const shared = await shareResultImage();
  if (!shared) {
    window.open('https://wa.me/?text=' + encodeURIComponent('¿Qué Skeeper eres tú? Hazte el quiz: ' + window.location.href.split('#')[0] + '#quiz'), '_blank');
  }
  shareSheet.classList.remove('open');
});

document.getElementById('share-instagram').addEventListener('click', async () => {
  const shared = await shareResultImage();
  if (!shared) {
    alert('Para compartir a tu historia: descarga la imagen y súbela desde la app de Instagram.');
  }
  shareSheet.classList.remove('open');
});

document.getElementById('share-download').addEventListener('click', async () => {
  try {
    const blob = await getResultBlob();
    const file = new File([blob], 'que-skeeper-eres.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: '¿Qué Skeeper Sos?', text: 'Este es mi resultado del quiz de Los Skeepers' });
      shareSheet.classList.remove('open');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'que-skeeper-eres.png';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  } catch(err) {
    if (!(err && err.name === 'AbortError')) console.error(err);
  }
  shareSheet.classList.remove('open');
});
} catch(e) { console.error(e); }

