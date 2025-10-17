/* ===================== 1) ЭФФЕКТ НАКЛОНА ДЛЯ .cat-card ===================== */
(function(){
  const cards = document.querySelectorAll('.cat-card');
  if (!cards.length) return;

  cards.forEach(card => {
    let rAF = null, mx = 0, my = 0, cx = 0, cy = 0;
    const lerp = (a,b,t)=>a+(b-a)*t;

    const update = () => {
      cx = lerp(cx, mx, .12);
      cy = lerp(cy, my, .12);
      card.style.transform = `rotateX(${cy}deg) rotateY(${cx}deg) translateY(-2px)`;
      rAF = (Math.abs(cx-mx)>0.01 || Math.abs(cy-my)>0.01) ? requestAnimationFrame(update) : null;
    };

    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width/2)) / (r.width/2);   // -1..1
      const y = (e.clientY - (r.top  + r.height/2)) / (r.height/2); // -1..1
      mx = x * 6;   // угол по Y
      my = -y * 6;  // угол по X
      if(!rAF) rAF = requestAnimationFrame(update);
    });

    card.addEventListener('mouseleave', ()=>{
      mx = 0; my = 0;
      if(!rAF) rAF = requestAnimationFrame(update);
    });
  });
})();

/* ===================== 2) КАТАЛОГ, ПОИСК, РЕНДЕР ===================== */
/* ===================== 2) КАТАЛОГ, ПОИСК, РЕНДЕР (надёжный) ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const RESULTS = document.getElementById('catalogResults');
  const GRID    = document.getElementById('productsGrid');
  const TITLE   = document.getElementById('resTitle');
  const CATS    = document.querySelector('.cats-grid');
  const BTN     = document.getElementById('btnNameSearch');
  const RESCNT  = document.getElementById('resCount');
  const FOOT    = document.getElementById('resultsFoot');

  // если чего-то нет — выходим аккуратно
  if (!CATS || !GRID || !RESULTS || !TITLE || !RESCNT) return;

  const IMG_BASE = document.documentElement.dataset.static || '/assets/images/';
  const IMG_PH   = IMG_BASE + 'product-placeholder.jpg';
  const img = (name) => IMG_BASE + name;

  // === Каталог продуктов (как у вас) ===
  const PRODUCTS = {
    // Противогололёдные реагенты
    'anti-ice': [
      { id: 1,  title: 'Соль техническая «РУССОЛЬ» (фас. 25 кг / 1 т)', tags:['соль','реагент','25кг','1т'], img: img('rusalt.png') },
      { id: 2,  title: 'Концентрат минеральный Галит марка «А» (25 кг / 1 т)', tags:['галит','реагент','25кг','1т'], img: img('galit.png') },
      { id: 3,  title: 'Песко-соляная смесь для посыпки дорог (25 кг / 1 т)', tags:['смесь','дороги','25кг','1т'], img: img('sandSalt.png') },
      { id: 4,  title: 'Противогололёдный реагент «ЭКО-ЗИМА» (25 кг)', tags:['реагент','эко','25кг'], img: img('regent_ecowinter.png') },
    ],

    // Промышленная химия для нефтегазовой отрасли
    'oilgas': [
      { id: 10, title: 'Глина бентонитовая ПБМА/ПБМБ/ПБМВ/ПБМГ', tags:['бентонит','нефтегаз'], img: img('glayBentonit.png') },
      { id: 11, title: 'Бентонит для бурения (мин. заказ 25 кг)', tags:['бурение','бентонит','25кг'], img: img('bentonit.png') },
      { id: 12, title: 'Бентонит для ГНБ (мин. заказ 25 кг)', tags:['гнб','бентонит','25кг'], img: img('BentonitForGNB.png') },
      { id: 13, title: 'Баритовый концентрат', tags:['барит','концентрат'], img: img('barito.png') },
      { id: 14, title: 'Биополимер — ксантановая камедь', tags:['биополимер','ксантан'], img: img('ksantan.png') },
      { id: 15, title: 'Флокулянты на основе ПАА', tags:['флокулянт','паа'], img: img('flokulant.png')},
      { id: 16, title: 'Смазочная добавка для буровых растворов', tags:['бурение','добавка'], img: img('lubricant.png') },
      { id: 17, title: 'Кольматант на основе кедрового ореха', tags:['кольматант'], img: img('nut.png') },
      { id: 18, title: 'КМЦ (карбоксиметилцеллюлоза)', tags:['кмц','целлюлоза'], img: img('kmc.png') },
      { id: 19, title: 'Пеногаситель', tags:['пеногаситель'], img: img('bubble.png') },
      { id: 20, title: 'Опил древесный фр. 0,1–5 мм', tags:['опил','фракции'], img: img('tree.png') },
    ],

    // Химия широкого спектра
    'wide-chem': [
      { id: 30, title: 'Кальций хлористый двуводный', tags:['кальций','хлорид'], img: img('Calcum.png') },
      { id: 31, title: 'Каустическая сода (едкий натрий)', tags:['сода','NaOH'], img: img('Soda.png') },
      { id: 32, title: 'Калий хлористый', tags:['калий','хлорид'], img: img('Potassium.png') },
      { id: 33, title: 'Жидкое стекло', tags:['силикат'], img: img('liquid_glass.png') },
      { id: 34, title: 'Натрий триполифосфат', tags:['триполифосфат'], img: img('Natrium.png') },
      { id: 35, title: 'Тринатрийфосфат', tags:['тринатрийфосфат'], img: img('trinatrium.png') },
      { id: 36, title: 'Известь пушонка (гидратная)', tags:['известь','Ca(OH)2'], img: img('lime.png') },
      { id: 37, title: 'Формиат натрия технический', tags:['формиат','натрий'], img: img('formiatNatrium.png') },
      { id: 38, title: 'Квасцы хромокалиевые', tags:['квасцы'], img: img('kvasci_hrom.png') },
      { id: 39, title: 'Мел природный обогащённый ММС-1', tags:['мел','ммс-1'], img: img('chalk.png')},
      { id: 40, title: 'Минеральный порошок МП-1 / МП-2', tags:['минпорошок'], img: img('mineral.png') },
      { id: 41, title: 'ГЭЦ (гидроксиэтилцеллюлоза)', tags:['гэц'], img: img('hydroetil.png') },
      { id: 42, title: 'Пеногаситель Полидеформ', tags:['пеногаситель'], img: img('penogasitel.png') },
      { id: 43, title: 'Пластификатор СП-1 (С-3) Полипласт', tags:['пластификатор'], img: img('plasificator.png') },
      { id: 44, title: 'Суперпластификатор СП-1 (С-3) Полипласт', tags:['суперпластификатор'], img: img('SuperPlastificator.png') },
    ],

    // Дисперсии / декор
    'dispersions': [
      { id: 50, title: 'Двуокись титана пигментная', tags:['титан','пигмент'], img: img('naturalTitanium.png') },
      { id: 51, title: 'Дисперсия Novopol 001A', tags:['novopol'], img: img('Novopol001.png') },
      { id: 52, title: 'Загуститель Novopol 007', tags:['загуститель'], img: img('novopol007.png') },
      { id: 53, title: 'Водная дисперсия Arakril ADC 7500A', tags:['arakril'], img: img('arakril.png') },
      { id: 54, title: 'Загуститель акриловый Hisol D201', tags:['hisol'], img: img('hisol.png') },
      { id: 55, title: 'Пластификатор ДОА (диоктил адипат)', tags:['доа'], img: img('doa.png') },
      { id: 56, title: 'Дисперсия ПВА ДФ51/15В', tags:['пва'], img: img('pva_dispers.png') },
      { id: 57, title: 'Метокаолин ВМК-45', tags:['метакаолин'], img: img('metakaolin.png') },
      { id: 58, title: 'Пигменты железооксидные', tags:['пигменты'], img: img('iron.png') },
    ],

    // Сыпучие материалы
    'bulk': [
      { id: 70, title: 'Кварцевый песок 0,2–0,8', tags:['кварцевый-песок','0.2-0.8'], img: img('kvarz02.png') },
      { id: 71, title: 'Кварцевый песок 0,8–2,0', tags:['кварцевый-песок','0.8-2.0'], img: img('kvarz20.png') },
      { id: 72, title: 'Кварцевый песок 0,2–0,6', tags:['кварцевый-песок','0.2-0.6'], img: img('kvarz06.png') },
      { id: 73, title: 'Кварцевый песок 0,1–0,5', tags:['кварцевый-песок','0.1-0.5'], img: img('kvarz05.png') },
      { id: 74, title: 'Кварцевый песок 0,4–0,8', tags:['кварцевый-песок','0.4-0.8'], img: img('kvarz04.png') },
      { id: 75, title: 'Кварцевый песок 1,0–2,0', tags:['кварцевый-песок','1.0-2.0'], img: img('kvarz10.png') },
      { id: 76, title: 'Кварцевый песок 2,0–3,0', tags:['кварцевый-песок','2.0-3.0'], img: img('kvarz30.png') },
      { id: 77, title: 'Кварцевый песок 5,0–10,0', tags:['кварцевый-песок','5.0-10.0'], img: img('kvarz50.png') },
    ],

    // Мрамор
    'marble': [
      { id: 90, title: 'Мраморная мука 40–500 мкм', tags:['мрамор','мука'], img: img('mramor40.png') },
      { id: 91, title: 'Мрамор молотый фракция РМ-2', tags:['мрамор','РМ-2'], img: img('mramorRm2.png') },
      { id: 92, title: 'Мрамор молотый фракция РМ-5', tags:['мрамор','РМ-5'], img: img('mramorRm5.png') },
      { id: 93, title: 'Крошка мраморная фр. 0,2–0,5', tags:['крошка','0.2-0.5'], img: img('chipsMramor.png') },
      { id: 94, title: 'Крошка мраморная фр. 0,5–1', tags:['крошка','0.5-1'], img: img('chipsMramor05.png') },
      { id: 95, title: 'Крошка мраморная фр. 1–1,5', tags:['крошка','1-1.5'], img: img('chipsMramor1.png') },
      { id: 96, title: 'Крошка мраморная фр. 1,5–2', tags:['крошка','1.5-2'], img: img('chipsMramor15.png') },
      { id: 97, title: 'Крошка мраморная фр. 2–3', tags:['крошка','2-3'], img: img('chipsMramor2.png') },
      { id: 98, title: 'Крошка мраморная фр. 3–5', tags:['крошка','3-5'], img: img('chipsMramor5.png') },
      { id: 99, title: 'Фракционный щебень 5–10', tags:['щебень','5-10'], img: img('rock5.png') },
      { id: 100,title: 'Фракционный щебень 10–20', tags:['щебень','10-20'], img: img('rock10.png') },
    ], /* ... ваш объект PRODUCTS без изменений ... */ };

  const ALL = Object.entries(PRODUCTS).flatMap(([cat, arr]) =>
    (arr || []).map(p => ({ ...p, cat }))
  );

  let state = { cat: null, q: '' };

  // Клик по категории
  CATS.addEventListener('click', (e) => {
    const btn  = e.target.closest('.cat-card__btn');
    if (!btn) return;

    const card = btn.closest('.cat-card');
    const cat  = card?.dataset.cat;
    if (!cat) return;

    state = { cat, q: '' };
    TITLE.dataset.default = card.querySelector('.cat-card__title')?.textContent.trim() || 'Результаты';
    TITLE.textContent = TITLE.dataset.default;

    openResults();
    render();
  });

  // Глобальный поиск
  BTN?.addEventListener('click', () => {
    const current = state.q || '';
    const q = prompt('Введите название для поиска:', current);
    if (q === null) return;
    state.q = q.trim().toLowerCase();
    openResults();
    render();
  });

  function render(){
    const base = state.q ? ALL : (PRODUCTS[state.cat] || []);
    const q = state.q;
    const filtered = q ? base.filter(p => p.title.toLowerCase().includes(q)) : base;

    // Заголовок и счётчик
    TITLE.textContent = q ? `Найдено по запросу «${q}»` : (TITLE.dataset?.default || 'Результаты');
    RESCNT.textContent = `· ${filtered.length} товар(ов)`;

    // Сетка товаров
    GRID.innerHTML = filtered.map(p => `
      <article class="product">
        <div class="product__media">
          <img src="${p.img}" alt="${p.title}" onerror="this.src='${IMG_PH}'; this.onerror=null;">
        </div>
        <div class="product__body">
          <h4 class="product__title">${p.title}</h4>
          ${p.tags?.length ? `<div class="product__tags">${p.tags.map(t=>`<span>#${t}</span>`).join(' ')}</div>` : ''}
        </div>
        <a class="product__overlay" href="/product/${p.id}" aria-label="Открыть ${p.title}"></a>
        <a class="product__cta" href="/product/${p.id}" title="Уточнить цену" aria-label="Уточнить цену">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M7 17L17 7M9 7h8v8"/>
          </svg>
        </a>
      </article>
    `).join('');

    // Делегирование кликов
    GRID.onclick = (e) => {
      const card = e.target.closest('.product');
      if (!card || e.target.closest('.product__cta')) return;
      const link = card.querySelector('.product__overlay');
      if (link?.href) location.href = link.href;
    };

    // Подвал
    if (q){
      FOOT?.classList.remove('results-foot--empty');
      FOOT.innerHTML = `<button type="button" class="btn-reset-search" id="btnResetSearch">Сбросить поиск</button>`;
      document.getElementById('btnResetSearch')?.addEventListener('click', () => {
        state.q = '';
        render();
      }, { once: true });
    } else {
      FOOT?.classList.add('results-foot--empty');
      FOOT.innerHTML = '';
    }

    // Анимации — после того как DOM обновлён
    requestAnimationFrame(() => {
      animateProductsWave(GRID);
      if (window.gsap) animateCount(RESCNT, filtered.length);
    });
  }

  function openResults(){
    RESULTS.hidden = false;
    RESULTS.classList.add('is-open');
    RESULTS.style.opacity = 1;
    RESULTS.style.transform = 'translateY(0)';
    if (window.gsap) {
      gsap.fromTo(RESULTS, {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 0.45, ease: 'power2.out'});
    }
    RESULTS.scrollIntoView({ behavior:'smooth', block:'start' });
  }

  // ---- helpers ----
  function animateProductsWave(gridEl){
    if (!window.gsap || !gridEl) return;

    if (gridEl._waveCtx) { gridEl._waveCtx.revert(); gridEl._waveCtx = null; }

    const ctx = gsap.context(() => {
      // БЕЗ :scope — совместимо с Safari
      const cards = Array.from(gridEl.children).filter(el => el.classList?.contains('product'));
      if (!cards.length) return;

      // очистим возможные inline-стили с прошлой анимации
      gsap.set(cards, { clearProps: 'opacity,transform,filter' });

      // кол-во колонок
      let cols = 0;
      const gtc = getComputedStyle(gridEl).gridTemplateColumns;
      if (gtc && gtc !== 'none') cols = gtc.split(' ').length;
      if (!cols) cols = Math.max(1, Math.floor(gridEl.clientWidth / 240));

      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const baseDur = reduce ? 0.35 : 0.6;
      const stepDelay = reduce ? 0.04 : 0.09;

      gsap.killTweensOf(cards);

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      cards.forEach((card, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const delay = (row + col) * stepDelay;
        tl.from(card, {
          opacity: 0,
          y: 16,
          scale: 0.98,
          duration: baseDur,
          clearProps: 'opacity,transform',
          overwrite: true
        }, delay);
      });

      // страховка: вдруг что-то осталось невидимым
      setTimeout(() => {
        const invisible = cards.some(el => parseFloat(getComputedStyle(el).opacity) < 0.05);
        if (invisible) gsap.set(cards, { opacity: 1, y: 0, scale: 1, clearProps: 'opacity,transform' });
      }, 600);
    }, gridEl);

    gridEl._waveCtx = ctx;
  }

  function animateCount(el, to){
    const from = parseInt((el.textContent.match(/\d+/) || [0])[0], 10) || 0;
    const obj = { v: from };
    gsap.to(obj, {
      v: to, duration: 0.8, ease: 'power2.out',
      onUpdate: () => {
        const n = Math.round(obj.v);
        const tail =
          (n % 10 === 1 && n % 100 !== 11) ? ' товар' :
          ((n % 10 >= 2 && n % 10 <= 4) && (n % 100 < 10 || n % 100 >= 20)) ? ' товара' : ' товаров';
        el.textContent = `${n.toLocaleString('ru-RU')}${tail}`;
      }
    });
  }
});


