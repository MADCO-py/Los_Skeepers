let prefersReducedMotion = false;
try { prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e) {}

// ---- floating member cutouts: wobble while scrolling, spring back upright ----
try {
const floatChars = document.querySelectorAll('.floating-char');
if (floatChars.length && !prefersReducedMotion) {
  let lastY = window.scrollY;
  let wobbleTimeout;
  window.addEventListener('scroll', () => {
    const currentY = window.scrollY;
    const delta = currentY - lastY;
    lastY = currentY;
    const angle = Math.max(-16, Math.min(16, delta * 1.4));
    floatChars.forEach(c => {
      c.style.transition = 'transform 0.12s linear';
      c.style.transform = `rotate(${angle}deg)`;
    });
    clearTimeout(wobbleTimeout);
    wobbleTimeout = setTimeout(() => {
      floatChars.forEach(c => {
        c.style.transition = 'transform 0.6s cubic-bezier(.34,1.56,.64,1)';
        c.style.transform = 'rotate(0deg)';
      });
    }, 150);
  }, { passive: true });
}
} catch(e) { console.error(e); }

// ---- glitch XP progresivo: se intensifica con la profundidad de scroll de toda la página ----
try {
const glitchThresholds = [
  ['glitch-low', 0.15],
  ['glitch-mid', 0.40],
  ['glitch-high', 0.70],
  ['glitch-max', 0.92]
];
if (prefersReducedMotion) document.body.classList.add('no-motion');
let glitchTicking = false;
function updateGlitch(){
  glitchTicking = false;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const p = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  document.documentElement.style.setProperty('--glitch', p.toFixed(3));
  // el hero se apaga rápido y siempre, a 1.1 alturas de pantalla, sin importar qué tan larga sea la página
  const heroFade = Math.min(1, window.scrollY / (window.innerHeight * 1.1));
  document.documentElement.style.setProperty('--hero-fade', heroFade.toFixed(3));
  glitchThresholds.forEach(([cls, min]) => {
    document.body.classList.toggle(cls, p >= min);
  });
}
window.addEventListener('scroll', () => {
  if (!glitchTicking) {
    glitchTicking = true;
    requestAnimationFrame(updateGlitch);
  }
}, { passive: true });
updateGlitch();
} catch(e) { console.error(e); }

// ---- side star spins with scroll ----
try {
const sideStar = document.getElementById('side-star');
if (sideStar) {
  window.addEventListener('scroll', () => {
    sideStar.style.transform = `rotate(${window.scrollY * 0.35}deg) translateZ(0)`;
  }, { passive: true });
}
} catch(e) { console.error(e); }

// ---- gallery videos: load + play only while visible (fixes black tiles from too many simultaneous autoplays) ----
try {
const galleryVideos = document.querySelectorAll('.glitch-video video');
const videoIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const vid = entry.target;
    if (entry.isIntersecting) {
      if (!vid.src && vid.dataset.src) {
        const source = vid.querySelector('source');
        if (source) source.src = source.dataset.src;
        vid.load();
      }
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  });
}, { threshold: 0.25 });
galleryVideos.forEach(v => videoIO.observe(v));
} catch(e) { console.error(e); }

// ---- TIENDA: catálogo, detalle por producto, carrito y checkout por WhatsApp ----
try {
  const WHATSAPP_NUMBER = '50239688410'; // 39688410 Guatemala (+502)

  const MERCH_ITEMS = [
    { id: 'star-azul',   name: 'LaSkeeperCamisa', variant: 'Azul',   img: 'assets/merch-star-azul.jpg', price: 100,
      desc: 'Es azul. Combina con el cielo, con los jeans, y con esa personalidad misteriosa que todavía no tenés — pero esta camisa sí.' },
    { id: 'star-verde',  name: 'LaSkeeperCamisa', variant: 'Verde',  img: 'assets/merch-star-verde.jpg', price: 100,
      desc: 'Verde como el pasto del wallpaper de Windows XP. Si te la ponés, técnicamente ya sos parte del fondo de pantalla.' },
    { id: 'star-roja',   name: 'LaSkeeperCamisa', variant: 'Roja',   img: 'assets/merch-star-roja.jpg', price: 100,
      desc: 'Es roja. Como el logo. Como la pasión. Como cuando te avisan que ya se agotaron las otras tallas.' },
    { id: 'star-marino', name: 'LaSkeeperCamisa', variant: 'Marino', img: 'assets/merch-star-marino.jpg', price: 100,
      desc: 'Azul marino, el color favorito de nadie en particular, pero le queda bien a todo el mundo. El amigo confiable de tu clóset.' },
    { id: 'arte-banda',  name: 'Playera Arte de la Banda', variant: null, img: 'assets/merch-arte-blanca.jpg', price: 100,
      desc: 'Tiene arte de la banda. Literal. Es lo que dice el nombre — no le busqués más explicación, solo comprala.' },
    { id: 'hoodie-loteria', name: 'Hoodie Skeeper-Lotería', variant: null, img: null, price: null,
      desc: 'Inspirado en la lotería pero con Skeepers en vez de El Diablito. Calientito, con suerte, y 0% relacionado con apuestas.' },
  ];

  const SIZE_SCALE = { S: 'scale(0.78, 0.88)', M: 'scale(1, 1)', L: 'scale(1.18, 1.06)', XL: 'scale(1.5, 1.12)' };

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('sk-cart') || '[]'); } catch(e) { cart = []; }

  const grid = document.getElementById('merch-grid');
  MERCH_ITEMS.forEach(item => {
    const card = document.createElement('div');
    card.className = 'merch-card xp-glitch-target';
    card.innerHTML = item.img
      ? `<div class="merch-thumb has-photo" style="background-image:url('${item.img}')"></div>`
      : `<div class="merch-thumb">Foto próximamente</div>`;
    const info = document.createElement('div');
    info.className = 'merch-info';
    info.innerHTML = `<h3>${item.name}${item.variant ? ' — ' + item.variant : ''}</h3><p class="price">${item.price ? 'Q' + item.price : 'Q--'}</p>`;
    card.appendChild(info);
    card.addEventListener('click', () => openShopDetail(item.id));
    grid.appendChild(card);
  });

  const shopOverlay = document.getElementById('shop-overlay');
  const cartOverlay = document.getElementById('cart-overlay');
  const scatterWrap = document.getElementById('shop-photo-scatter');
  let currentItemId = null;
  let currentSize = 'M';
  let currentQty = 1;
  let currentImgSrc = null;
  let scatterPhotos = []; // fotos extra ya colocadas — no se mueven al cambiar de talla

  function updateQtyDisplay(){
    document.getElementById('shop-qty-value').textContent = currentQty;
  }

  function rectsOverlap(x, y, w, h, rect){
    return !(x + w < rect.left || x > rect.right || y + h < rect.top || y > rect.bottom);
  }

  function addScatterPhoto(){
    const infoPanel = document.querySelector('.shop-detail-info');
    const infoRect = infoPanel ? infoPanel.getBoundingClientRect() : null;
    const mainPhoto = document.querySelector('.shop-detail-photo-wrap');
    const size = mainPhoto ? mainPhoto.getBoundingClientRect().width : 200; // mismo tamaño que la original
    const vw = window.innerWidth || 1200;
    const vh = window.innerHeight || 800;
    let left, top, tries = 0;
    do {
      left = Math.random() * Math.max(vw - size, 0);
      top = 80 + Math.random() * Math.max(vh - size - 100, 0);
      tries++;
    } while (infoRect && rectsOverlap(left, top, size, size, infoRect) && tries < 25);
    const img = document.createElement('img');
    img.src = currentImgSrc;
    img.className = 'shop-scatter-photo';
    img.style.width = size + 'px';
    img.style.height = size + 'px';
    img.style.left = left + 'px';
    img.style.top = top + 'px';
    img.style.transform = SIZE_SCALE[currentSize];
    scatterWrap.appendChild(img);
    scatterPhotos.push(img);
  }

  // el total de fotos visibles debe ser igual a la cantidad elegida (contando la del recuadro
  // principal como 1). Solo se agregan o quitan fotos extra — las que ya estaban puestas
  // no cambian de lugar. De 6 en adelante vuelve a ser solo 1.
  function syncScatterCount(){
    if (!currentImgSrc) return;
    const target = (currentQty >= 2 && currentQty <= 5) ? currentQty - 1 : 0;
    while (scatterPhotos.length > target){
      const el = scatterPhotos.pop();
      el.remove();
    }
    while (scatterPhotos.length < target){
      addScatterPhoto();
    }
  }

  function applySizeTransform(){
    document.querySelector('.shop-detail-photo-wrap').style.transform = SIZE_SCALE[currentSize];
    scatterPhotos.forEach(el => { el.style.transform = SIZE_SCALE[currentSize]; });
  }

  function openShopDetail(id){
    const item = MERCH_ITEMS.find(i => i.id === id);
    if (!item) return;
    currentItemId = id;
    currentSize = 'M';
    currentQty = 1;
    currentImgSrc = item.img || null;
    scatterWrap.innerHTML = '';
    scatterPhotos = [];
    updateQtyDisplay();
    document.getElementById('shop-tag').textContent = item.name + (item.variant ? ' — ' + item.variant : '');
    document.getElementById('shop-detail-name').textContent = item.name + (item.variant ? ' — ' + item.variant : '');
    document.getElementById('shop-detail-desc').textContent = item.desc;
    document.getElementById('shop-detail-price').textContent = item.price ? 'Q' + item.price : 'Q--';
    const img = document.getElementById('shop-detail-img');
    const photoWrap = document.querySelector('.shop-detail-photo-wrap');
    if (item.img){ img.src = item.img; img.style.display = ''; } else { img.style.display = 'none'; }
    photoWrap.style.transform = SIZE_SCALE.M;
    document.querySelectorAll('.shop-size-btn').forEach(b => b.classList.toggle('active', b.dataset.size === 'M'));
    document.getElementById('shop-added-msg').classList.remove('show');
    shopOverlay.classList.add('open');
    document.body.classList.add('lock');
    shopOverlay.scrollTop = 0;
  }

  document.getElementById('shop-qty-minus').addEventListener('click', () => {
    if (currentQty > 1) { currentQty--; updateQtyDisplay(); syncScatterCount(); }
  });
  document.getElementById('shop-qty-plus').addEventListener('click', () => {
    if (currentQty < 20) { currentQty++; updateQtyDisplay(); syncScatterCount(); }
  });

  function closeShopDetail(){
    shopOverlay.classList.remove('open');
    document.body.classList.remove('lock');
    scatterWrap.innerHTML = '';
    scatterPhotos = [];
  }

  document.querySelectorAll('.shop-size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentSize = btn.dataset.size;
      document.querySelectorAll('.shop-size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applySizeTransform();
    });
  });


  function saveCart(){
    try { localStorage.setItem('sk-cart', JSON.stringify(cart)); } catch(e){}
    renderCartBar();
  }

  function renderCartBar(){
    const count = cart.reduce((n, c) => n + c.qty, 0);
    const label = document.getElementById('cart-count-label');
    label.textContent = count === 0 ? 'Tu carrito está vacío' : `Tu carrito: ${count} artículo${count > 1 ? 's' : ''}`;
  }

  document.getElementById('shop-add-btn').addEventListener('click', () => {
    const item = MERCH_ITEMS.find(i => i.id === currentItemId);
    if (!item) return;
    const existing = cart.find(c => c.id === item.id && c.size === currentSize);
    if (existing) { existing.qty += currentQty; } else {
      cart.push({ id: item.id, name: item.name, variant: item.variant, size: currentSize, qty: currentQty, price: item.price, img: item.img });
    }
    saveCart();
    document.getElementById('shop-added-msg').classList.add('show');
  });

  document.getElementById('shop-view-cart-link').addEventListener('click', (e) => {
    e.preventDefault();
    closeShopDetail();
    openCart();
  });

  function openCart(){
    renderCart();
    cartOverlay.classList.add('open');
    document.body.classList.add('lock');
    cartOverlay.scrollTop = 0;
  }
  function closeCart(){
    cartOverlay.classList.remove('open');
    document.body.classList.remove('lock');
  }

  function renderCart(){
    const wrap = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('cart-empty-msg');
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    wrap.innerHTML = '';
    if (cart.length === 0){
      emptyMsg.style.display = 'block';
      checkoutBtn.style.display = 'none';
      return;
    }
    emptyMsg.style.display = 'none';
    checkoutBtn.style.display = 'inline-block';
    let allPriced = true;
    let total = 0;
    cart.forEach((c, idx) => {
      const row = document.createElement('div');
      row.className = 'cart-row';
      const priceTxt = c.price ? `Q${c.price * c.qty}` : 'Q--';
      if (c.price) { total += c.price * c.qty; } else { allPriced = false; }
      row.innerHTML = `
        ${c.img ? `<img class="cart-row-thumb" src="${c.img}" alt="${c.name}">` : `<div class="cart-row-thumb cart-row-thumb-empty"></div>`}
        <div class="cart-row-main">
          <span class="cart-row-name">${c.name}${c.variant ? ' — ' + c.variant : ''} · Talla ${c.size}</span>
          <div class="cart-row-qty">
            <button class="cart-row-qty-btn" data-action="minus" aria-label="Restar">−</button>
            <span class="cart-row-qty-value">${c.qty}</span>
            <button class="cart-row-qty-btn" data-action="plus" aria-label="Sumar">+</button>
          </div>
        </div>
        <span class="cart-row-price">${priceTxt}</span>
        <button class="cart-row-remove" aria-label="Quitar">✕</button>
      `;
      row.querySelector('[data-action="minus"]').addEventListener('click', () => {
        if (c.qty > 1) { c.qty--; saveCart(); renderCart(); } else { cart.splice(idx, 1); saveCart(); renderCart(); }
      });
      row.querySelector('[data-action="plus"]').addEventListener('click', () => {
        if (c.qty < 20) { c.qty++; saveCart(); renderCart(); }
      });
      row.querySelector('.cart-row-remove').addEventListener('click', () => {
        cart.splice(idx, 1);
        saveCart();
        renderCart();
      });
      wrap.appendChild(row);
    });
    const totalRow = document.createElement('div');
    totalRow.className = 'cart-total-row';
    totalRow.textContent = allPriced ? `Total: Q${total}` : `Total parcial: Q${total} (+ artículos por confirmar)`;
    wrap.appendChild(totalRow);
  }

  document.getElementById('cart-checkout-btn').addEventListener('click', () => {
    if (cart.length === 0) return;
    let total = 0;
    let allPriced = true;
    let msg = 'HOLA VOS MANO REGALA:\n';
    cart.forEach(c => {
      const priceTxt = c.price ? ` Q${c.price * c.qty}` : '';
      if (c.price) { total += c.price * c.qty; } else { allPriced = false; }
      msg += `${c.name}${c.variant ? ' ' + c.variant : ''} Talla ${c.size} x${c.qty}${priceTxt}\n`;
    });
    msg += allPriced
      ? `TOTAL: Q${total} ¿cómo se paga?`
      : `TOTAL (falta cotizar lo demás): Q${total} ¿cómo se paga?`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');
  });

  document.getElementById('cart-open-btn').addEventListener('click', openCart);
  document.getElementById('shop-back').addEventListener('click', closeShopDetail);
  document.getElementById('cart-back').addEventListener('click', closeCart);

  renderCartBar();
} catch(e) { console.error(e); }

// ---- prensa: se manda la lista completa y se muestra 1 mención al azar por visita ----
// para actualizar por lanzamiento, solo agregar/quitar objetos de este array.
try {
  const PRESS_ITEMS = [
    { source: 'Indie Hoy', img: 'assets/press-indiehoy.jpg', imgAlt: 'Indie Hoy — 10 lanzamientos para escuchar esta semana',
      title: '10 lanzamientos para escuchar esta semana',
      body: 'El medio argentino sumó a Los Skeepers a su selección semanal junto a Francisca Valenzuela y Andrés Ruiz, destacando cómo "Nada Más+" cruza cumbia, pop y producción electrónica para hablar de los vínculos en la era de las pantallas.',
      meta: 'Delfina Montagna · 15 julio, 2026',
      url: 'https://indiehoy.com/noticias/10-lanzamientos-para-escuchar-esta-semana-2026-07-15/' },
    { source: 'Stereogum', img: 'assets/press-stereogum.jpg', imgAlt: 'Stereogum — Los Skeepers, NADA MÁS+',
      title: 'Los Skeepers comparten su nuevo sencillo "NADA MÁS+"',
      body: 'Margaret Farrell describió el tema como una mezcla luminosa de alt-pop que recuerda a Remi Wolf y Dominic Fike — suave casi todo el camino, hasta que los últimos treinta segundos distorsionan el bajo y la batería se acelera.',
      meta: 'Margaret Farrell · 12 julio, 2026',
      url: 'https://stereogum.com/2504990/los-skeepers-nada-mas/music' },
    { source: 'Remezcla', img: 'assets/press-remezcla.jpg', imgAlt: 'Remezcla — 20 New Songs to Listen to This Week',
      title: '20 canciones nuevas para escuchar esta semana',
      body: 'Remezcla incluyó "NADA MÁS+" junto a lanzamientos de Feid y Villano Antillano, describiéndola como un matrimonio perfecto entre sonidos orgánicos y digitales, con un giro final hacia guitarras emo y un momento rave estilo Jersey club.',
      meta: 'Cheky · 10 julio, 2026',
      url: 'https://remezcla.com/lists/music/20-new-songs-to-listen-to-this-week-from-feid-to-villano-antillano/' },
    { source: 'Diario de Centro América', img: 'assets/press-dca.jpg', imgAlt: 'Los Skeepers en vivo',
      title: 'Los Skeepers y el valor de probar',
      body: 'Un perfil sobre cómo la banda pasó de ensayos nocturnos improvisados a construir una audiencia real: ya suman cinco canciones publicadas y cerca de 20 mil oyentes mensuales.',
      meta: 'Isa Enríquez · 20 enero, 2026',
      url: 'https://dca.gob.gt/noticias-guatemala-diario-centro-america/los-skeepers-y-el-valor-de-probar/' },
    { source: 'NPR Music — Alt.Latino', img: 'assets/press-npr.jpg', imgAlt: 'Fabuloso',
      title: 'Salsa, bossa nova y lo nuevo de Argentina',
      body: 'NPR Music incluyó "Si Te Gusta", junto a Fabuloso, en su repaso de las voces más interesantes de la música latina actual — al lado de nombres como Nathy Peluso y Mon Laferte.',
      meta: 'Felix Contreras &amp; Anamaria Sayre · 29 octubre, 2025',
      url: 'https://www.npr.org/2025/10/29/nx-s1-5589243/salsa-bossa-nova-and-argentinas-next-big-thing' },
  ];

  const pick = PRESS_ITEMS[Math.floor(Math.random() * PRESS_ITEMS.length)];
  const pressGrid = document.getElementById('press-grid');
  if (pressGrid && pick){
    pressGrid.innerHTML = `
      <div class="press-card xp-glitch-target">
        <div class="press-photo"><img src="${pick.img}" alt="${pick.imgAlt}"></div>
        <div class="press-card-body">
          <div class="press-source"><span class="dot"></span>${pick.source}</div>
          <h3>${pick.title}</h3>
          <p>${pick.body}</p>
          <p class="press-meta">${pick.meta}</p>
          <a class="btn small alt" href="${pick.url}" target="_blank" rel="noopener">Leer nota completa →</a>
        </div>
      </div>
    `;
  }
} catch(e) { console.error(e); }

// ---- KARAOKE: catálogo de canciones, portadas y letras (más reciente primero) ----
// NOTA: el scroll "karaoke" es un estimado por línea, no está sincronizado en tiempo real
// con el audio de Spotify (el embed público no expone la posición de reproducción vía JS).
try {
  const SONGS = [
    { id: 'idiota', title: 'Idiota.', credit: 'Los Skeepers', cover: 'assets/covers/idiota.jpg', trackId: '6t8ViDruJ5KPsuAB9ltfRF',
      lyrics: [
        `Dime por qué sigo esperándote`, `El tiempo pasa`, `Y no pretendo frenar del tirón`, `Aunque me llegue a estrellar`,
        `A más de 200 por hora`, `Eso ya no importa`, ``,
        `Dime por qué sigo buscándote`, `Hay algo que hace que no pueda parar`, `Ni dejar de seguirte`,
        `Y si llegara a rendirme`, ``,
        `Me haría quedar como un idiota`, `Me haría quedar como un idiota`, `Me haría quedar como un idiota`,
        `Como un idiota`, `Como un idiota`,
        `Me haría quedar como un idiota`, `Me haría quedar como un idiota`, `Me haría quedar como un idiota`,
        `Como un idiota`, `Como un idiota`, ``,
        `Si el tiempo es oro`, `Si el tiempo es oro`, `Voy a robarlo`, `Es un tesoro`,
        `Ese diamante se queda corto`, `Números rojos`, `El tiempo es oro`, ``,
        `Dime por qué sigo buscándote`, `Hay algo que hace que no pueda parar`, `Ni dejar de seguirte`,
        `Y si llegara a rendirme`, ``,
        `Voy a quedar como un idiota`, `Voy a quedar como un idiota`, `Voy a quedar como un idiota`,
        `Como un idiota`, `Como un idiota`,
        `Voy a quedar como un idiota`, `Voy a quedar como un idiota`, `Voy a quedar como un idiota`,
        `Como un idiota`, `Como un idiota`, `Como un idiota`,
      ] },
    { id: 'nada-mas', title: 'NADA MÁS+', credit: 'Los Skeepers', cover: 'assets/covers/nada-mas.jpg', trackId: '4wghV1vcoQ7t25iH3JD06t',
      lyrics: [
        `Ya nada me sabe igual`, `Ya no quiero nada más`, ``,
        `Ya nada me sabe igual`, `(Ya nada me sabe igual)`, `Ya no quiero nada más`, `(Ya no quiero nada)`, ``,
        `¿Será que es obra del destino?`, `¿Será que Dios así lo quiso?`, `Desde un inicio`,
        `¿Será que no lo vimos?`, `Que somos to' lo que quisimos`,
        `Y cuando veas ese futuro conmigo`, `Que no lo sientas como un gusto adquirido`,
        `Ojos cerrados, pero ves el camino`, `(Ves el camino)`, `(Ves el camino)`, ``,
        `Ya nada me sabe igual`, `(Si me apuro, aún te encuentro)`, `Ya no quiero nada más`, ``,
        `Ya nada me sabe igual`, `(Ya nada me sabe igual)`, `Ya no quiero nada más`, ``,
        `Ya nada me sabe igual`, `(Ya nada me sabe igual)`, `Ya no quiero nada más`, `(Ya no quiero nada)`, ``,
        `Desde hace tiempo que ya no te veo`, `Cierro los ojos y te vuelvo a ver`,
        `A veces trato de no recordarlo`, `Y a veces`, `Daría mi vida para retroceder`, ``,
        `Ya nada me sabe igual`, `(Cada que te miro, pienso)`, `Ya no quiero nada más`, `(Si me apuro, aún te encuentro)`,
        `Ya nada me sabe igual`, `(Ya nada me sabe igual)`, `Ya no quiero nada más`, `(Ya no quiero nada más)`, ``,
        `Tengo un beso guardado en mí`, `Y creo que si no te lo doy me muero`,
        `Tú ganas, solo dime cuánto te debo`, `No quiero perdernos`, ``,
        `Ya nada me sabe igual`, `(Ya nada me sabe igual)`, `Ya no quiero nada más`, `Ya no quiero nada`,
      ] },
    { id: 'juanillo', title: 'Juanillo Reguetón', credit: 'Los Skeepers', cover: 'assets/covers/juanillo-reggueton.jpg', trackId: null,
      lyrics: [
        `Y si te tengo`, `Si estás cerca de mí`, `Otra vez`, `Y aunque no lo diga`,
        `Aún recuerdo el olor de tu piel`, `Eres tú`, `Solamente tú`, `Y eres tú`, ``,
        `Si yo aún te quería`, `Y ya no te tenía aquí`, `Junto a mí`,
        `Y ya no tengo tiempo que perder`, `(Ya no tengo tiempo que perder)`, ``,
        `Si yo aún te quería`, `Y ya no te tenía aquí`, `Junto a mí`,
        `Y algún día te volveré a ver`, `(Y algún día te volveré a...)`, ``,
        `Si yo aún te quería aquí`, `Son las cinco y no puedo dormir`,
        `El tiempo será eterno en ti`, `El tiempo será eterno en ti`, ``,
        `Y todo camino`, `Siempre me guía a ti`, `Otra vez`, `Y aunque no lo intente`,
        `Serás parte de mi`, `Otra vez`, `Y eres tú`, `Solamente tú`, `Y eres tú`, ``,
        `Si yo aún te quería`, `Y ya no te tenía aquí`, `Junto a mí`,
        `Y ya no tengo tiempo que perder`, `(Ya no tengo tiempo que perder)`, ``,
        `Si yo aún te quería`, `Y ya no te tenía aquí`, `Junto a mí`,
        `Y algún día te volveré a ver`, `(Y algún día te volveré a...)`, ``,
        `(Si yo aún te quería aquí)`, `(Son las cinco y no puedo dormir)`,
        `(El tiempo será eterno en ti)`, `(El tiempo será eterno en ti)`,
      ] },
    { id: 'hora-y-media', title: 'Hora y Media', credit: 'Los Skeepers', cover: 'assets/covers/hora-y-media.jpg', trackId: null,
      lyrics: [
        `Voy pensándolo otra vez`, `Y no puedo avanzar`, `Mil razones para regresar`,
        `Y ya voy tarde y al revés`, `Por hora y media más`, `Condenados a esperar`, ``,
        `Dicen que se pierde lento`, `Por querer tenerte cerca`,
        `Dicen que el amor se muere en estas horas lentas`, ``,
        `Rodando a donde estés tú`, `En calles y a contraluz`, `Ya nada`, `Ya nada`, `Nada me suena mejor`,
        `Y aunque se vaya el tiempo`, `Y nunca cambie la luz`, `Ya nada me quita tu color`, ``,
        `Estoy pensándolo otra vez`, `Tratando de ignorar`, `Mil razones para terminar`,
        `Yo sé que he pagado caro`, `El querer tenerte cerca`, `Dicen que el amor se muere`, `En una hora y media`, ``,
        `Rodando a donde estés tú`, `En calles y a contraluz`, `Ya nada`, `Ya nada`, `Nada me suena mejor`,
        `Y aunque se vaya el tiempo`, `Y nunca cambie la luz`, `Ya nada me quita tu color`, ``,
        `No hay nada`, `No hay nada`, `No hay nada`, `No hay nada`, ``,
        `Rodando a donde estés tú`, `En calles y a contraluz`, `Ya nada`, `Ya nada`, `Ya nada me suena mejor`,
        `Y aunque se vaya el tiempo`, `Y nunca cambie la luz`, `Ya nada me quita tu color`,
      ] },
    { id: 'si-te-gusta', title: 'Si Te Gusta', credit: 'Fabuloso & Los Skeepers', cover: 'assets/covers/si-te-gusta.jpg', trackId: '0AdlQyT3mRtIe33mOwBQEE',
      lyrics: [
        `Va subiendo la altitud`, `Más cerca del ataúd`, `Solo rolas con mi crew`, `Baby, what you wanna do?`, ``,
        `¿Qué lo que?`, `Dime qué quieres hacer`, `Si me quieres conocer a mí`, `Piénsalo`, `No me veas así`, `Dímelo`, ``,
        `¿Por qué si te gusta?`, `¿Por qué no me buscas?`, `¿Acaso hay algo malo en mí?`, `¿Acaso hay algo malo en ti?`,
        `¿Por qué si te gusta?`, `¿Por qué no me buscas?`, `¿Acaso hay algo malo en mí?`, `¿Acaso hay algo malo en ti?`, ``,
        `No sé`, `Cómo hacer`, `Para poner`, `Las piezas en su lugar`,
        `Estoy enamorado de ti`, `Me gusta porque mis días`, `Ya no son más gris`, ``,
        `Pero me gustas`, `Me gustas`, `Me gustas`, `(Me gustas)`, `(Me gustas)`, `¡Jaja!`, `(Me gustas)`, ``,
        `¿Por qué si te gusta?`, `¿Por qué no me buscas?`, `¿Acaso hay algo malo en mí?`, `¿Acaso hay algo malo en ti?`,
        `¿Por qué si te gusta?`, `¿Por qué no me buscas?`, `¿Acaso hay algo malo en mí?`, `¿Acaso hay algo malo en ti?`, ``,
        `Dime qué hiciste`, `Explícate`, `Y pon en palabras`, `De esas que no sabes hallar`,
        `Una clase hechizo`, `Que no sabe fallar`, `Dónde sea que miro`, `Sé que ahí estará`, ``,
        `¿Por qué si te gusta?`, `¿Por qué no me buscas?`, `¿Acaso hay algo malo en mí?`, `¿Acaso hay algo malo en ti?`,
      ] },
    { id: 'tu-y-yo', title: 'tú y yo (y todo lo que falta)', credit: 'Los Skeepers & Cata Contreras', cover: 'assets/covers/tu-y-yo.jpg', trackId: null,
      lyrics: [
        `¿Será que te gusto?`, `¿Qué piensas tú de mí?`, `¿Será que si hablo sabré de tu sentir?`,
        `De todas las cosas que pueden salir mal`, `Ya dime que piensas`, `Dame una señal`, ``,
        `Caigo en lo ambiguo`, `La incerteza de tu ser`, `Caigo y todo fondo`, `No me puedo componer`, ``,
        `Tú y yo`, `Y todo lo que falta`, `Mírame`, `No me des la espalda`,
        `Y aunque ya no pueda pedírtelo otra vez`, `Tú y yo`, `Y todo lo que falta`, ``,
        `Aunque te digas que no puede ser verdad`, `A esta hora ya no deberías contestar`,
        `A veces no me alcanza el tiempo para hablar de ti`, ``,
        `Caigo en lo ambiguo`, `La incerteza de tu ser`, `Caigo y todo fondo`, `No me puedo componer`, ``,
        `Tú y yo`, `Y todo lo que falta`, `Mírame`, `No me des la espalda`,
        `Y aunque ya no pueda pedírtelo otra vez`, `Tú y yo`, `Y todo lo que falta`, ``,
        `Tú y yo`, `Y todo lo que falta`, `Mírame`, `No me des la espalda`,
        `Y aunque ya no pueda pedírtelo otra vez`, `Tú y yo`, `Y todo lo que falta`, ``,
        `Tú y yo`, `Y todo lo que falta`, `Mírame`, `No me des la espalda`,
        `Y aunque ya no pueda pedírtelo otra vez`, `Tú y yo`, `Y todo lo que falta`,
      ] },
    { id: 'lo-que-duele', title: 'Lo Que Duele', credit: 'Los Skeepers', cover: 'assets/covers/lo-que-duele.jpg', trackId: null,
      lyrics: [
        `¿A quién estás mirando?`, `Solo dime, por favor`, `¿A quién estás mirando?`, `Me quedé pensando lo peor`, ``,
        `No hace falta que diga algo que ya sabes`, `Y no es normal que te cueste tanto entender`, ``,
        `Si tú`, `Sabes lo que duele tener que verte`, `Y tú`, `Sabes que no puedo detenerte aunque`,
        `Odio tus palabras`, `Y tu forma de mirarme`, `Cuando tú`, `Sabes lo que duele`, `Lo que duele`, `Lo que duele`, ``,
        `Y si tú`, `Tú no piensas en mí`, `Cuando pienso en ti`, `Te buscaré en alguien más`, ``,
        `Si tú`, `Sabes lo que duele tener que verte`, `Y tú`, `Sabes que no puedo detenerte aunque`,
        `Odio tus palabras`, `Y tu forma de mirarme`, `Cuando tú`, `Sabes lo que duele`, `Lo que duele`, `Lo que duele`, ``,
        `Lo que duele`, `Lo que duele`, `Lo que duele`, `Lo que duele`, `Lo que duele`, `Lo que duele`,
      ] },
    { id: 'siempre', title: 'Siempre', credit: 'Los Skeepers', cover: 'assets/covers/siempre.jpg', trackId: null,
      lyrics: [
        `Ya no queda más`, `Que pensar qué puede ser`, `Ya no queda más`, `Sabes que no sé perder`, ``,
        `Me dejaste en la puerta`, `Sólo con tu voz`, ``,
        `Sabes lo que te diría`, `Si pudiera verte`, `Lo que daría por dejar de verte`, `Nunca termina`,
        `Somos siempre y ni una vez`, ``,
        `Ya no puedo más`, `Todo se quedó en "tal vez"`, `¿Y adónde se fue`, `Todo lo que pudimos ser?`, ``,
        `Te quedaste en la puerta`, `Sola con mi voz`, ``,
        `Sabes lo que te diría`, `Si pudiera verte`, `Lo que daría por dejar de verte`, `Nunca termina`,
        `Y somos siempre y ni una vez`, ``,
        `Lo que haría para resolverte`, `No demos vueltas`, `Solo dímelo una vez`,
      ] },
    { id: 'luismigirl', title: 'Luismigirl', credit: 'Los Skeepers', cover: 'assets/covers/luismigirl.jpg', trackId: null,
      lyrics: [
        `Si otra vez me desperté en la recepción`, `Si no me miras`, `Y nunca estás`, `No hay otra explicación`, ``,
        `Desde hace rato no hay calor`, `¿Y cómo se siente?`, `Que te deshaces de mi nombre`, ``,
        `Yo sé de dónde vienes`, `Sabes a dónde vas`, `Es lo que quieres`, `Aunque te duela`,
        `Ojos en las paredes`, `Nadie en tu lugar`, `Es lo que quieres`, `Aunque te duela`, ``,
        `Escrito en tu mirada`, `Hoy poco a poco me quedo sin sol`,
        `Déjame otra palabra`, `Deja de ser la que pierde el control`, ``,
        `Desde hace rato no hay calor`, `Y te deshaces de mi nombre`, ``,
        `Yo sé de dónde vienes`, `Sabes a dónde vas`, `Es lo que quieres`, `Aunque te duela`,
        `Ojos en las paredes`, `Nadie en tu lugar`, `Es lo que quieres`, `Aunque te duela`, ``,
        `Y yo sé de dónde vienes`, `Sabes a dónde vas`, `Es lo que quieres`, `Aunque te duela`,
        `Ojos en las paredes`, `Alguien en mi lugar`, `Es lo que quieres`, `Aunque te duela`,
      ] },
  ];

  const songsGrid = document.getElementById('songs-grid');
  SONGS.forEach(song => {
    const tile = document.createElement('div');
    tile.className = 'song-tile';
    tile.innerHTML = `<img src="${song.cover}" alt="${song.title}" loading="lazy"><div class="song-tile-label">${song.title}</div>`;
    tile.addEventListener('click', () => openKaraoke(song.id));
    songsGrid.appendChild(tile);
  });

  // sidebar del karaoke: lista de las 9 canciones para saltar entre ellas sin salir del overlay
  const karaokeSidebarLinks = document.getElementById('karaoke-sidebar-links');
  SONGS.forEach(song => {
    const btn = document.createElement('button');
    btn.className = 'karaoke-sidebar-link';
    btn.textContent = song.title;
    btn.dataset.songId = song.id;
    btn.addEventListener('click', () => openKaraoke(song.id));
    karaokeSidebarLinks.appendChild(btn);
  });

  const karaokeOverlay = document.getElementById('karaoke-overlay');
  const karaokeBg = document.getElementById('karaoke-bg');
  let karaokeTimer = null;
  let karaokeOn = false;
  let karaokeLineEls = [];
  let karaokeIndex = 0;

  function stopKaraoke(){
    karaokeOn = false;
    if (karaokeTimer) clearInterval(karaokeTimer);
    karaokeTimer = null;
    const btn = document.getElementById('karaoke-toggle');
    btn.textContent = '▶ Modo karaoke';
    btn.classList.remove('playing');
    karaokeLineEls.forEach(el => el.classList.remove('active'));
  }

  function startKaraoke(){
    karaokeOn = true;
    karaokeIndex = 0;
    const btn = document.getElementById('karaoke-toggle');
    btn.textContent = '⏸ Pausar';
    btn.classList.add('playing');
    const nonBlank = karaokeLineEls.filter(el => !el.classList.contains('blank'));
    if (nonBlank.length === 0) return;
    karaokeTimer = setInterval(() => {
      karaokeLineEls.forEach(el => el.classList.remove('active'));
      if (karaokeIndex >= nonBlank.length){ stopKaraoke(); return; }
      const el = nonBlank[karaokeIndex];
      el.classList.add('active');
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      karaokeIndex++;
    }, 2600);
  }

  function openKaraoke(id){
    const song = SONGS.find(s => s.id === id);
    if (!song) return;
    document.getElementById('karaoke-tag').textContent = song.title;
    document.getElementById('karaoke-cover').src = song.cover;
    document.getElementById('karaoke-cover').alt = song.title;
    document.getElementById('karaoke-title').textContent = song.title;
    document.getElementById('karaoke-credit').textContent = song.credit;
    karaokeBg.style.backgroundImage = `url('${song.cover}')`;

    document.querySelectorAll('.karaoke-sidebar-link').forEach(b => {
      b.classList.toggle('active', b.dataset.songId === id);
    });

    const player = document.getElementById('karaoke-player');
    if (song.trackId){
      player.innerHTML = `<iframe src="https://open.spotify.com/embed/track/${song.trackId}?utm_source=generator" width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>`;
    } else {
      player.innerHTML = `<a class="btn small" href="https://open.spotify.com/artist/3q9JMhPqxoWXTqoYfJs2RP" target="_blank" rel="noopener">Escuchála en Spotify ↗</a>`;
    }

    const lyricsWrap = document.getElementById('karaoke-lyrics');
    lyricsWrap.innerHTML = '';
    karaokeLineEls = song.lyrics.map(line => {
      const div = document.createElement('div');
      div.className = 'karaoke-line' + (line === '' ? ' blank' : '');
      div.textContent = line;
      lyricsWrap.appendChild(div);
      return div;
    });

    stopKaraoke();
    karaokeOverlay.classList.add('open');
    document.body.classList.add('lock');
    karaokeOverlay.scrollTop = 0;
  }

  function closeKaraoke(){
    stopKaraoke();
    karaokeOverlay.classList.remove('open');
    document.body.classList.remove('lock');
    document.getElementById('karaoke-player').innerHTML = '';
  }

  document.getElementById('karaoke-toggle').addEventListener('click', () => {
    if (karaokeOn) stopKaraoke(); else startKaraoke();
  });
  document.getElementById('karaoke-back').addEventListener('click', closeKaraoke);
} catch(e) { console.error(e); }

// ---- ONLYFANS: al pasar el mouse se prenden llamas a los lados y ya no se apagan ----
try {
  const onlyfansTitle = document.querySelector('.onlyfans-title');
  const fireLeft = document.getElementById('onlyfans-fire-left');
  const fireRight = document.getElementById('onlyfans-fire-right');
  onlyfansTitle.addEventListener('mouseenter', () => {
    fireLeft.classList.add('lit');
    fireRight.classList.add('lit');
  }, { once: true });
} catch(e) { console.error(e); }

// ---- secret star: se hace la difícil 3 veces, luego saca clones — hay que encontrar la real ----
try {
const cta = document.getElementById('secret-cta');
const starBtn = document.getElementById('secret-open');
const captionSpan = document.querySelector('#secret-star-caption span');
if (cta && starBtn && captionSpan) {
  const teaseMessages = [
    '¡A ver, intenta alcanzarla!',
    '¿Eso es todo lo que tienes?',
    'Ok ok, ya párale... ¡encuéntrala! 😅'
  ];
  let dodges = 0;
  let cooldown = false;
  let finaleTriggered = false;

  function spawnClones(){
    finaleTriggered = true;
    cta.classList.add('finale');
    const count = 7;
    const spots = [];
    for (let i = 0; i < count; i++) {
      spots.push({ left: 10 + Math.random() * 72, top: 60 + Math.random() * 220 });
    }
    const realIndex = Math.floor(Math.random() * spots.length);
    spots.forEach((pos, i) => {
      if (i === realIndex) {
        starBtn.style.left = pos.left + '%';
        starBtn.style.top = pos.top + 'px';
        return;
      }
      const clone = document.createElement('button');
      clone.type = 'button';
      clone.className = 'secret-star-clone';
      clone.setAttribute('aria-label', 'Estrella falsa');
      clone.style.left = pos.left + '%';
      clone.style.top = pos.top + 'px';
      clone.innerHTML = '<img src="assets/star-yellow.png" alt="">';
      clone.addEventListener('click', (e) => {
        e.preventDefault();
        if (clone.classList.contains('exploding')) return;
        clone.classList.add('exploding');
        setTimeout(() => clone.remove(), 380);
      });
      cta.appendChild(clone);
    });
  }

  function doDodge(){
    cooldown = true;
    dodges++;
    if (dodges >= 3) {
      captionSpan.textContent = teaseMessages[2];
      setTimeout(spawnClones, 500);
    } else {
      const nx = 50 + (Math.random() * 60 - 30);
      const ny = Math.max(50, Math.min(220, 110 + (Math.random() * 120 - 60)));
      starBtn.style.left = nx + '%';
      starBtn.style.top = ny + 'px';
      starBtn.classList.add('dodging');
      setTimeout(() => starBtn.classList.remove('dodging'), 300);
      captionSpan.textContent = teaseMessages[dodges - 1];
    }
    setTimeout(() => { cooldown = false; }, 450);
  }

  // desktop: esquiva cuando el mouse se acerca (hover real)
  cta.addEventListener('mousemove', (e) => {
    if (finaleTriggered || prefersReducedMotion || cooldown) return;
    const rect = starBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist < 90) doDodge();
  });

  // celular: no hay "acercarse" sin hover, así que los primeros 3 toques a la estrella la esquivan
  starBtn.addEventListener('touchstart', (e) => {
    if (finaleTriggered || prefersReducedMotion || cooldown || dodges >= 3) return;
    e.preventDefault();
    doDodge();
  }, { passive: false });

  // cuando encuentran la real: celebración de estrellas y limpiar las clones que queden
  starBtn.addEventListener('click', () => {
    if (!finaleTriggered) return;
    cta.querySelectorAll('.secret-star-clone').forEach(c => c.remove());
    if (prefersReducedMotion) return;
    for (let i = 0; i < 18; i++) {
      const bit = document.createElement('img');
      bit.src = 'assets/star-yellow.png';
      bit.className = 'secret-star-celebrate';
      bit.style.left = (10 + Math.random() * 80) + '%';
      bit.style.top = (Math.random() * 240) + 'px';
      bit.style.animationDelay = (Math.random() * 0.3) + 's';
      cta.appendChild(bit);
      setTimeout(() => bit.remove(), 1400);
    }
  });
}
} catch(e) { console.error(e); }

// ---- secret / contenido exclusivo ----
try {
const secretOpenBtn = document.getElementById('secret-open');
const secretOverlay = document.getElementById('secret-overlay');
const secretClose = document.getElementById('secret-close');
const secretForm = document.getElementById('secret-form');
const secretEmail = document.getElementById('secret-email');
const secretThanks = document.getElementById('secret-thanks');
if (secretOpenBtn && secretOverlay) {
  secretOpenBtn.addEventListener('click', () => {
    document.body.classList.add('lock');
    secretOverlay.classList.add('open', 'glitching');
    setTimeout(() => secretOverlay.classList.remove('glitching'), 650);
  });
  const closeSecret = () => {
    secretOverlay.classList.remove('open');
    document.body.classList.remove('lock');
    setTimeout(() => {
      secretForm.style.display = '';
      secretThanks.classList.remove('show');
      secretForm.reset();
    }, 300);
  };
  if (secretClose) secretClose.addEventListener('click', closeSecret);
  if (secretForm) {
    secretForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // TODO: conectar a un servicio real (Mailchimp / Google Form) cuando se decida cuál usar.
      // Por ahora solo confirma en pantalla — no se envía ni se guarda el correo a ningún lado.
      if (!secretEmail.value || !secretEmail.checkValidity()) return;
      secretForm.style.display = 'none';
      secretThanks.classList.add('show');
    });
  }
}
} catch(e) { console.error(e); }

// ---- mobile nav toggle ----
try {
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}
} catch(e) { console.error(e); }

// ---- scroll reveal ----
try {
const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));
} catch(e) { console.error(e); }

// ---- countdown a un show: se reactiva cuando haya fecha confirmada de nuevo ----
// (queda comentado a propósito — no hay show próximo por ahora, ver sección Shows)

// ---- floating stars parallax ----
try {
const starsLayer = document.querySelector('.stars-layer');
if (starsLayer && !prefersReducedMotion) {
  const positions = [
    {top:'8%', left:'3%'}, {top:'22%', left:'90%'}, {top:'55%', left:'2%'},
    {top:'70%', left:'90%'}, {top:'40%', left:'3%'}, {top:'85%', left:'88%'}
  ];
  positions.forEach((p, i) => {
    const s = document.createElement('img');
    s.src = 'assets/star-logo.png';
    s.className = 'floating-star';
    s.style.top = p.top; s.style.left = p.left;
    s.dataset.depth = (0.5 + i * 0.15).toFixed(2);
    starsLayer.appendChild(s);
  });
  const stars = document.querySelectorAll('.floating-star');
  window.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
    stars.forEach(s => {
      const depth = parseFloat(s.dataset.depth);
      s.style.transform = `translate(${dx * 20 * depth}px, ${dy * 20 * depth}px) rotate(${dx * 15}deg)`;
    });
  });
}
} catch(e) { console.error(e); }

// ---- members data + grid render ----
try {
const MEMBERS = {
  alex:     { name: 'Alex',     age: 23, from: 'Cuautitlán Izcalli, Estado de México', fact: 'Si me ves en mi teléfono, probablemente estoy jugando Dream League Soccer. También tengo perfect pitch', refs: 'The Strokes, LATIN MAFIA, Primus, Frank Ocean, My Chemical Romance, Yamil Quiere Ser Artista', playlist: '6FMAhlFnUw1eSd7cgNeNeq', playlistNote: '[Pendiente: que Alex la describa con sus palabras]', bio: 'Otro de los seis que sube al escenario cada vez que hay show. Su playlist, directo de sus audífonos a los tuyos.' },
  danniel:  { name: 'Danniel',  age: 22, from: 'Los Angeles, California', fact: 'Antes de hacer música quería ser pro player de Call of Duty', refs: 'Dijon, Justin Bieber, Suei, Merges, Deftones', playlist: '2yKA9QVuVKaAzPqH6aajf8', playlistNote: '[Pendiente: que Danniel la describa con sus palabras]', bio: 'Su playlist es su tarjeta de presentación: lo que Danniel escucha antes de un show es lo que después escuchas en las canciones de Los Skeepers.' },
  jeremy:   { name: 'Jeremy',   age: 21, from: 'Amatitlán, Guatemala', fact: 'De pequeño estaba obsesionado con hacer trucos de magia', refs: 'Paramore, Rusowsky, Alanis Yuki, The Beatles', playlist: '5sWrzbPofUbVXha6HQ1CUo', playlistNote: '[Pendiente: que Jeremy la describa con sus palabras]', bio: 'Parte del núcleo original de Los Skeepers, de los ensayos nocturnos que arrancaron todo esto.' },
  joaquin:  { name: 'Joaquín',  age: 22, from: 'Guatemala, Guatemala', fact: 'Fui youtuber de Minecraft por un tiempo', refs: 'Mk.gee, Hippo Campus, Rusowsky, Jeff Buckley, Luis Miguel, Geese', playlist: '7cobANqWUoRUSkn5IfzWi2', playlistNote: '[Pendiente: que Joaquín la describa con sus palabras]', bio: 'Uno de los nombres que aparece una y otra vez en cada flyer de festival: Joaquín es de los que no se pierde un ensayo ni una tocada.' },
  juan:     { name: 'Juan',     age: 21, from: 'Guatemala, Guatemala', fact: 'Me gusta demasiado la ketchup', refs: 'Jane Remover, Modern Baseball, Yung Beef, Akriila, Black Kray, Sam Ray', playlist: '7wM4w0jJSi7ADwIZTjtSsc', playlistNote: '[Pendiente: que Juan la describa con sus palabras]', bio: 'El del "Juanillo Reguetón" — su release party llenó La Popular. Su playlist es la mejor pista de por dónde va su próximo sonido.' },
  shipi:    { name: 'Shipi',    age: 22, from: 'Guatemala, Guatemala', fact: 'Solía participar en batallas de freestyle que organizaba un amigo cuando estaba en el colegio', refs: 'Fiona Apple, Underscores, Arca, Alice Phoebe Lou, JPEGMAFIA', playlist: '2FxuQuEXXCwFMI5vAOapNd', playlistNote: '[Pendiente: que Shipi la describa con sus palabras]', bio: 'Shipi, tal como lo conoce la banda. Su playlist mezcla lo que suena en el cuarto de ensayo con lo que suena camino al show.' }
};
window.MEMBERS = MEMBERS; // el quiz (en js/juegos.js) lo necesita fuera de este try

// foto normal + foto "reveal" por integrante — cuando manden las fotos reales, solo se
// reemplaza el valor aquí, no hay que tocar nada más de la lógica.
const MEMBER_PHOTOS = {
  alex:    { photo: 'assets/member-alex-1.jpg',    reveal: 'assets/member-alex-2.jpg' },
  danniel: { photo: 'assets/member-danniel-1.jpg', reveal: 'assets/member-danniel-2.jpg' },
  jeremy:  { photo: 'assets/member-jeremy-1.jpg',  reveal: 'assets/member-jeremy-2.jpg' },
  joaquin: { photo: 'assets/member-joaquin-1.jpg', reveal: 'assets/member-joaquin-2.jpg' },
  juan:    { photo: 'assets/member-juan-1.jpg',    reveal: 'assets/member-juan-2.jpg' },
  shipi:   { photo: 'assets/member-shipi-1.jpg',   reveal: 'assets/member-shipi-2.jpg' }
};
window.MEMBER_PHOTOS = MEMBER_PHOTOS; // el quiz (en js/juegos.js) lo necesita fuera de este try

// dibujo a mano + sticker de cuerpo completo por integrante, para decorar el espacio vacío del sidebar
const MEMBER_ICONS = {
  alex:    { sketch: 'assets/sketch-alex.png',    char: 'assets/char-5.png' },
  danniel: { sketch: 'assets/sketch-danniel.png', char: 'assets/char-1.png' },
  jeremy:  { sketch: 'assets/sketch-jeremy.png',  char: 'assets/char-4.png' },
  joaquin: { sketch: 'assets/sketch-joaquin.png', char: 'assets/char-2.png' },
  juan:    { sketch: 'assets/sketch-juan.png',    char: 'assets/char-3.png' },
  shipi:   { sketch: 'assets/sketch-shipi.png',   char: 'assets/char-6.png' }
};

const grid = document.getElementById('members-grid');
Object.entries(MEMBERS).forEach(([slug, m]) => {
  const photos = MEMBER_PHOTOS[slug] || { photo: 'assets/group-hero.jpg', reveal: 'assets/group-hero.jpg' };
  const card = document.createElement('a');
  card.className = 'member-card';
  card.href = `#${slug}`;
  card.innerHTML = `<img src="${photos.photo}" alt="${m.name}"><div class="member-card-flash"></div><span class="member-tag">${m.name}</span>`;
  card.addEventListener('click', (e) => {
    e.preventDefault();
    if (card.classList.contains('revealing')) return;
    card.classList.add('revealing');
    const imgEl = card.querySelector('img');
    imgEl.classList.add('swap-out');
    setTimeout(() => {
      imgEl.src = photos.reveal;
      imgEl.classList.remove('swap-out');
      card.classList.add('flash');
      setTimeout(() => card.classList.remove('flash'), 260);
    }, 220);
    setTimeout(() => {
      card.classList.remove('revealing');
      openMember(slug);
    }, 2000);
  });
  grid.appendChild(card);
});

const overlay = document.getElementById('member-overlay');
function openMember(slug){
  const data = MEMBERS[slug] || MEMBERS.danniel;
  document.getElementById('m-name').textContent = data.name;
  document.getElementById('m-bio').textContent = data.bio;
  document.getElementById('m-lore').innerHTML = `
    <div class="member-lore-item"><span class="lore-label">Edad</span><span class="lore-value">${data.age} años</span></div>
    <div class="member-lore-item"><span class="lore-label">Lugar de nacimiento</span><span class="lore-value">${data.from}</span></div>
    <div class="member-lore-item wide"><span class="lore-label">Fun fact</span><span class="lore-value">${data.fact}</span></div>
    <div class="member-lore-item wide"><span class="lore-label">Referencias</span><span class="lore-value">${data.refs}</span></div>
  `;
  document.getElementById('m-playlist').src = `https://open.spotify.com/embed/playlist/${data.playlist}?utm_source=generator`;
  document.getElementById('m-playlist-note').textContent = data.playlistNote || '';

  const nav = document.getElementById('m-nav');
  nav.innerHTML = '';
  Object.entries(MEMBERS).forEach(([s, m]) => {
    const a = document.createElement('a');
    a.href = '#' + s;
    a.className = 'member-sidebar-link' + (s === slug ? ' active' : '');
    a.textContent = m.name;
    a.addEventListener('click', (e) => { e.preventDefault(); openMember(s); });
    nav.appendChild(a);
  });

  const icons = MEMBER_ICONS[slug];
  if (icons) {
    document.getElementById('m-icon-side-left').src = icons.sketch;
    document.getElementById('m-icon-side-right').src = icons.sketch;
  }

  document.getElementById('m-chat-toggle-name').textContent = data.name;
  document.getElementById('m-chat-name').textContent = data.name;
  document.getElementById('m-chat-avatar').src = `assets/chat-pp/${slug}.jpg`;
  window.currentChatMemberSlug = slug;
  if (window.resetMemberChat) window.resetMemberChat();
  const widgetTrack = document.getElementById('member-widget-track');
  if (widgetTrack){
    widgetTrack.classList.remove('show-chat');
    document.querySelectorAll('.widget-toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.view === 'playlist'));
  }

  const wasOpen = overlay.classList.contains('open');
  overlay.classList.add('open');
  document.body.classList.add('lock');
  if (!wasOpen) overlay.scrollTop = 0;
  history.replaceState(null, '', '#' + slug);
}
function closeMember(){
  overlay.classList.remove('open');
  document.body.classList.remove('lock');
  document.getElementById('m-playlist').src = '';
  document.querySelectorAll('#wa-body audio').forEach(a => a.pause());
  history.replaceState(null, '', '#integrantes');
}
document.getElementById('member-close').addEventListener('click', closeMember);

// ---- chat estilo WhatsApp dentro de cada integrante: el usuario escribe lo que quiera,
// las respuestas van saliendo en orden fijo (1a, 2a, 3a...) hasta un máximo de 5 mensajes.
// Por ahora el contenido es genérico e igual para los 6, incluyendo los mismos 2 audios. ----
try {
  const CHAT_QA = [
    { q: '¿Cuál es tu canción favorita de Los Skeepers?', type: 'text', sticker: true,
      a: 'Uy, esa pregunta es trampa… hoy te digo que "Nada Más+", mañana te digo otra jaja' },
    { q: '¿Qué hacés antes de subir al escenario?', type: 'text', sticker: true,
      a: 'Le echo agua fría a la cara, reviso que el in-ear esté bien puesto, y le rezo un poquito a la estrella' },
    { q: 'Mandame un audio', type: 'audio', audio: 'assets/audio/voice-1.mp3', duration: '0:20' },
    { q: 'Uno más porfa', type: 'audio', audio: 'assets/audio/voice-2.mp3', duration: '0:07' },
    { q: '¿Qué le dirías a alguien que nos acaba de descubrir?', type: 'text', sticker: true,
      a: 'Que le dé play de nuevo, ya en serio — gracias por escuchar' },
  ];

  let waSentCount = 0;
  let waStickerCount = 0;
  let waBusy = false;
  let waAudioPlaying = null;

  function waNowTime(){
    const d = new Date();
    return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
  }

  function waCheckmarks(){
    return `<span class="wa-time">${waNowTime()} <svg viewBox="0 0 16 15" fill="currentColor"><path d="M11.1 3.6L5.5 9.9 3.9 8.3a.6.6 0 0 0-.8.9l2 2c.2.2.5.2.7 0l6-7a.6.6 0 1 0-.7-.8l-.6.6zM14.6 4.4a.6.6 0 0 0-.9-.8l-6 7-.6-.6a.6.6 0 0 0-.8.9l1 1c.2.2.5.2.7 0l6.6-7.5z"></path></svg></span>`;
  }

  // como es una sola marca de check (no la doble azul), representa "enviado, no leído" —
  // el efecto de que ya no está para leer los mensajes.
  function waSingleCheck(){
    return `<span class="wa-time">${waNowTime()} <svg viewBox="0 0 16 15" fill="currentColor" style="color:#8696a0;"><path d="M11.1 3.6L5.5 9.9 3.9 8.3a.6.6 0 0 0-.8.9l2 2c.2.2.5.2.7 0l6-7a.6.6 0 1 0-.7-.8l-.6.6z"></path></svg></span>`;
  }

  function waEscape(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function waAppend(html){
    const body = document.getElementById('wa-body');
    const div = document.createElement('div');
    div.innerHTML = html;
    const el = div.firstElementChild;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function waBuildWave(count){
    let bars = '';
    for (let i = 0; i < count; i++){
      const h = 6 + Math.round(Math.sin(i * 1.3) * 5 + 5);
      bars += `<span style="height:${h}px"></span>`;
    }
    return bars;
  }

  function waAudioBubble(item){
    const el = waAppend(`
      <div class="wa-msg wa-msg-them">
        <div class="wa-bubble wa-audio-bubble">
          <button class="wa-audio-play" aria-label="Reproducir">
            <svg class="wa-icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
            <svg class="wa-icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none;"><rect x="6" y="5" width="4" height="14"></rect><rect x="14" y="5" width="4" height="14"></rect></svg>
          </button>
          <div class="wa-audio-wave">
            ${waBuildWave(22)}
            <div class="wa-audio-fill">${waBuildWave(22)}</div>
          </div>
          <span class="wa-audio-duration">${item.duration}</span>
          <audio src="${item.audio}" preload="none"></audio>
        </div>
      </div>
    `);
    const audio = el.querySelector('audio');
    const btn = el.querySelector('.wa-audio-play');
    const iconPlay = el.querySelector('.wa-icon-play');
    const iconPause = el.querySelector('.wa-icon-pause');
    const fill = el.querySelector('.wa-audio-fill');
    const durationLabel = el.querySelector('.wa-audio-duration');
    btn.addEventListener('click', () => {
      if (waAudioPlaying && waAudioPlaying !== audio){ waAudioPlaying.pause(); }
      if (audio.paused){
        audio.play();
        iconPlay.style.display = 'none';
        iconPause.style.display = '';
        waAudioPlaying = audio;
      } else {
        audio.pause();
        iconPlay.style.display = '';
        iconPause.style.display = 'none';
      }
    });
    audio.addEventListener('timeupdate', () => {
      if (audio.duration){
        fill.style.width = ((audio.currentTime / audio.duration) * 100) + '%';
        const remaining = Math.max(audio.duration - audio.currentTime, 0);
        const m = Math.floor(remaining / 60);
        const s = Math.floor(remaining % 60).toString().padStart(2,'0');
        durationLabel.textContent = m + ':' + s;
      }
    });
    audio.addEventListener('ended', () => {
      iconPlay.style.display = '';
      iconPause.style.display = 'none';
      fill.style.width = '0%';
      durationLabel.textContent = item.duration;
    });
  }

  // 3 stickers distintos por integrante, uno por cada respuesta de texto (ver assets/stickers/README.md)
  function waStickerBubble(stickerIndex){
    const slug = window.currentChatMemberSlug || 'danniel';
    waAppend(`<div class="wa-msg wa-msg-them"><img class="wa-sticker" src="assets/stickers/whatsapp/${slug}-${stickerIndex}.png" alt="sticker"></div>`);
  }

  function waSetStatus(text){
    const el = document.getElementById('m-chat-status');
    if (el) el.textContent = text;
  }

  function sendWaMessage(){
    const input = document.getElementById('wa-input');
    const text = input.value.trim();
    if (!text || waBusy) return;
    waBusy = true;
    document.getElementById('wa-send').disabled = true;
    input.value = '';

    const outOfQuestions = waSentCount >= CHAT_QA.length;

    if (outOfQuestions){
      // ya usó sus 5 preguntas: el mensaje se manda pero nadie lo lee ni contesta
      waAppend(`<div class="wa-msg wa-msg-me"><div class="wa-bubble">${waEscape(text)}${waSingleCheck()}</div></div>`);
      waBusy = false;
      document.getElementById('wa-send').disabled = false;
      return;
    }

    // no importa qué haya escrito: lo que se "envía" es la pregunta correspondiente en orden,
    // para que la conversación tenga sentido con la respuesta que sigue.
    const item = CHAT_QA[waSentCount];
    waAppend(`<div class="wa-msg wa-msg-me"><div class="wa-bubble">${waEscape(item.q)}${waCheckmarks()}</div></div>`);

    setTimeout(() => {
      const typingThem = waAppend(`<div class="wa-msg wa-msg-them"><div class="wa-bubble wa-typing-bubble"><span></span><span></span><span></span></div></div>`);
      setTimeout(() => {
        typingThem.remove();
        if (item.type === 'audio'){
          waAudioBubble(item);
        } else {
          waAppend(`<div class="wa-msg wa-msg-them"><div class="wa-bubble">${item.a}</div></div>`);
          if (item.sticker){
            waStickerCount++;
            setTimeout(() => waStickerBubble(waStickerCount), 400);
          }
        }
        waSentCount++;
        waBusy = false;
        document.getElementById('wa-send').disabled = false;
        if (waSentCount >= CHAT_QA.length){
          waSetStatus('últ. vez hace mucho');
        }
      }, 1300);
    }, 500);
  }

  document.getElementById('wa-send').addEventListener('click', sendWaMessage);
  document.getElementById('wa-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter'){ e.preventDefault(); sendWaMessage(); }
  });

  window.resetMemberChat = function(){
    waSentCount = 0;
    waStickerCount = 0;
    waBusy = false;
    if (waAudioPlaying){ waAudioPlaying.pause(); waAudioPlaying = null; }
    document.getElementById('wa-body').innerHTML = '';
    document.getElementById('wa-input').value = '';
    document.getElementById('wa-input').disabled = false;
    document.getElementById('wa-send').disabled = false;
    waSetStatus('en línea');
  };

  // ---- slider playlist / chat: un botón cambia cuál de los dos paneles se ve ----
  const widgetTrack = document.getElementById('member-widget-track');
  const toggleBtns = document.querySelectorAll('.widget-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const showChat = btn.dataset.view === 'chat';
      widgetTrack.classList.toggle('show-chat', showChat);
      toggleBtns.forEach(b => b.classList.toggle('active', b === btn));
    });
  });
} catch(e) { console.error(e); }

// open directly if URL already has a member hash (shareable link)
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (MEMBERS[hash]) openMember(hash);
});
} catch(e) { console.error(e); }
// (el try de arriba envuelve integrantes + chat; sigue en js/juegos.js con la sala de juegos, el quiz y el share sheet)

// ---- MONTAJE DE FOTOS: catálogo de stickers (ver assets/stickers/README.md) ----
try {
const STICKER_CATEGORIES = [
  { name: 'Integrantes', items: ['assets/stickers/collage/integrantes/danniel.png','assets/stickers/collage/integrantes/joaquin.png','assets/stickers/collage/integrantes/juan.png','assets/stickers/collage/integrantes/jeremy.png','assets/stickers/collage/integrantes/alex.png','assets/stickers/collage/integrantes/shipi.png'] },
  { name: 'Skeepers', items: ['assets/stickers/collage/skeepers/juan.png','assets/stickers/collage/skeepers/joaquin.png','assets/stickers/collage/skeepers/danniel.png','assets/stickers/collage/skeepers/jeremy.png','assets/stickers/collage/skeepers/alex.png','assets/stickers/collage/skeepers/shipi.png'] },
  { name: 'Logo', items: ['assets/stickers/collage/logo/logo-red.png','assets/stickers/collage/logo/logo-black.png'] },
  { name: 'Estrella', items: ['assets/stickers/collage/estrella/frame-star-art.png','assets/stickers/collage/estrella/star-sketch-outline.png'] }
];
const stickerCategoriesEl = document.getElementById('sticker-categories');
const tabsEl = document.createElement('div');
tabsEl.className = 'sticker-tabs';
const panelsEl = document.createElement('div');
panelsEl.className = 'sticker-panels';
stickerCategoriesEl.appendChild(tabsEl);
stickerCategoriesEl.appendChild(panelsEl);

STICKER_CATEGORIES.forEach((cat, i) => {
  const panel = document.createElement('div');
  panel.className = 'sticker-panel montaje-stickers' + (i === 0 ? ' active' : '');
  cat.items.forEach(src => {
    const wrap = document.createElement('div');
    wrap.className = 'sticker-pick';
    const img = document.createElement('img');
    img.src = src; img.alt = 'Skeeper sticker'; img.loading = 'lazy';
    wrap.appendChild(img);
    wrap.addEventListener('click', () => addSticker(src));
    panel.appendChild(wrap);
  });
  panelsEl.appendChild(panel);

  const tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'sticker-tab' + (i === 0 ? ' active' : '');
  tab.textContent = cat.name;
  tab.addEventListener('click', () => {
    tabsEl.querySelectorAll('.sticker-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    panelsEl.querySelectorAll('.sticker-panel').forEach(p => p.classList.remove('active'));
    panel.classList.add('active');
  });
  tabsEl.appendChild(tab);
});

const canvasWrap = document.getElementById('montaje-canvas-wrap');
const downloadBtn = document.getElementById('montaje-download');
let mCanvas = null;
let frameObjects = [];
let currentFrame = 'none';

function initCanvas(w, h){
  if (mCanvas) { mCanvas.dispose(); }
  mCanvas = new fabric.Canvas('montaje-canvas', { width: w, height: h, preserveObjectStacking: true });
  frameObjects = [];
}

document.getElementById('montaje-upload-btn').addEventListener('click', () => {
  document.getElementById('montaje-upload').click();
});

document.getElementById('montaje-upload').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    const imgEl = new Image();
    imgEl.onload = () => {
      // scale down to a reasonable editing size while keeping the uploaded photo's own aspect ratio
      const maxDim = 520;
      const scale = Math.min(maxDim / imgEl.width, maxDim / imgEl.height, 1);
      const w = Math.round(imgEl.width * scale);
      const h = Math.round(imgEl.height * scale);
      initCanvas(w, h);
      fabric.Image.fromURL(dataUrl, (fImg) => {
        fImg.set({ left: 0, top: 0, selectable: false, evented: false, isBase: true });
        fImg.scale(scale);
        mCanvas.add(fImg);
        fImg.moveTo(0);
        canvasWrap.classList.add('has-photo');
        downloadBtn.disabled = false;
        currentFrame = 'none';
        document.querySelectorAll('.frame-opt').forEach(b => b.classList.toggle('active', b.dataset.frame === 'none'));
      });
    };
    imgEl.src = dataUrl;
  };
  reader.readAsDataURL(file);
});

function addSticker(src){
  if (!mCanvas) return;
  fabric.Image.fromURL(src, (fImg) => {
    // stickers anchos (logo, estrella) se escalan por ancho para que no se salgan del canvas;
    // los cutouts de cuerpo completo se escalan por alto como antes
    if (fImg.width > fImg.height) {
      fImg.scaleToWidth(mCanvas.width * 0.45);
    } else {
      fImg.scaleToHeight(mCanvas.height * 0.5);
    }
    fImg.set({
      left: mCanvas.width / 2 - (fImg.width * fImg.scaleX) / 2 + (Math.random() * 30 - 15),
      top: mCanvas.height / 2 - (fImg.height * fImg.scaleY) / 2 + (Math.random() * 30 - 15),
      cornerColor: '#C50300', cornerStyle: 'circle', transparentCorners: false, borderColor: '#C50300'
    });
    mCanvas.add(fImg);
    mCanvas.setActiveObject(fImg);
    reapplyFrameOnTop();
  });
}

document.getElementById('montaje-delete').addEventListener('click', () => {
  if (!mCanvas) return;
  const obj = mCanvas.getActiveObject();
  if (obj && !obj.isFrame && !obj.isBase) mCanvas.remove(obj);
});

document.getElementById('montaje-reset').addEventListener('click', () => {
  if (!mCanvas) return;
  mCanvas.dispose();
  mCanvas = null;
  canvasWrap.classList.remove('has-photo');
  downloadBtn.disabled = true;
  document.getElementById('montaje-upload').value = '';
});

function loadFabricImage(src){
  return new Promise((resolve) => { fabric.Image.fromURL(src, (img) => resolve(img)); });
}

async function buildFramePieces(type, w, h){
  const pieces = [];
  const mkRect = (l,t,rw,rh,fill) => new fabric.Rect({ left:l, top:t, width:Math.max(0,rw), height:Math.max(0,rh), fill, selectable:false, evented:false, strokeWidth:0 });

  if (type === 'star') {
    const bw = Math.max(12, Math.round(Math.min(w,h) * 0.05));
    // four filled bars forming the border — always fully inside canvas bounds, never clipped
    pieces.push(mkRect(0, 0, w, bw, '#F0B429'));            // top
    pieces.push(mkRect(0, h - bw, w, bw, '#F0B429'));        // bottom
    pieces.push(mkRect(0, 0, bw, h, '#F0B429'));             // left
    pieces.push(mkRect(w - bw, 0, bw, h, '#F0B429'));        // right
    const starSize = Math.max(26, bw * 1.7);
    const inset = bw * 0.12;
    const corners = [
      [inset, inset],
      [w - bw - starSize + inset, inset],
      [inset, h - bw - starSize + inset],
      [w - bw - starSize + inset, h - bw - starSize + inset]
    ];
    for (const [sx, sy] of corners) {
      const starImg = await loadFabricImage('assets/frame-star-art.png');
      starImg.set({ left: sx, top: sy, selectable:false, evented:false });
      starImg.scaleToWidth(starSize);
      pieces.push(starImg);
    }
    const logoImg = await loadFabricImage('assets/logo-skeepers-red.png');
    const logoH = bw * 0.7;
    logoImg.scaleToHeight(logoH);
    logoImg.set({ left: w/2 - (logoImg.width * logoImg.scaleX) / 2, top: h - bw + (bw - logoH) / 2, selectable:false, evented:false });
    pieces.push(logoImg);
  } else if (type === 'polaroid') {
    const bw = Math.max(10, Math.round(Math.min(w,h) * 0.035));
    const bandH = Math.max(54, h * 0.15);
    pieces.push(mkRect(0, 0, w, bw, '#191512'));                     // top
    pieces.push(mkRect(0, 0, bw, h, '#191512'));                     // left
    pieces.push(mkRect(w - bw, 0, bw, h, '#191512'));                // right
    pieces.push(mkRect(0, h - bandH, w, bandH, '#FFFDF6'));          // bottom caption band (covers bottom edge too)
    const logoImg = await loadFabricImage('assets/logo-skeepers-black.png');
    const logoH = bandH * 0.4;
    logoImg.scaleToHeight(logoH);
    logoImg.set({ left: bw + 10, top: h - bandH + (bandH - logoH) / 2, selectable:false, evented:false });
    pieces.push(logoImg);
  }
  pieces.forEach(p => p.isFrame = true);
  return pieces;
}

async function applyFrame(type){
  if (!mCanvas) return;
  frameObjects.forEach(p => mCanvas.remove(p));
  frameObjects = [];
  currentFrame = type;
  const built = await buildFramePieces(type, mCanvas.width, mCanvas.height);
  if (currentFrame !== type || !mCanvas) return; // el usuario cambió de marco mientras cargaba — descarta
  frameObjects = built;
  frameObjects.forEach(p => { mCanvas.add(p); p.bringToFront(); });
  mCanvas.requestRenderAll();
}
function reapplyFrameOnTop(){
  if (currentFrame !== 'none') applyFrame(currentFrame);
}

document.querySelectorAll('.frame-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.frame-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFrame(btn.dataset.frame);
  });
});

downloadBtn.addEventListener('click', async () => {
  if (!mCanvas) return;
  mCanvas.discardActiveObject();
  mCanvas.requestRenderAll();
  const originalLabel = downloadBtn.textContent;
  downloadBtn.disabled = true;
  downloadBtn.textContent = 'Preparando...';
  try {
    const dataUrl = mCanvas.toDataURL({ format: 'png', multiplier: 2 });
    // iOS Safari no soporta de forma confiable <a download> con data URLs —
    // por eso usamos Web Share API como método principal (mismo patrón que el share-sheet del quiz).
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'montaje-los-skeepers.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Los Skeepers', text: 'Mi montaje con Los Skeepers' });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'montaje-los-skeepers.png';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }
  } catch(err) {
    if (err && err.name === 'AbortError') {
      // el usuario cerró el share sheet a propósito — no es un error, no hacemos nada más
    } else {
      console.error(err);
      // último recurso: si algo falla (fetch bloqueado, share no disponible, etc.),
      // abrimos la imagen en una pestaña nueva para que la guarden con "mantener presionado → Guardar imagen"
      try {
        const dataUrl = mCanvas.toDataURL({ format: 'png', multiplier: 2 });
        window.open(dataUrl, '_blank');
      } catch(err2) { console.error(err2); }
    }
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.textContent = originalLabel;
  }
});
} catch(e) { console.error(e); }

