document.addEventListener('DOMContentLoaded', () => {
  const reduce   = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch  = matchMedia('(pointer: coarse)').matches;
  const isNarrow = window.innerWidth < 992;
  const isMobile = reduce || isTouch || isNarrow;

  // ===== МОБИЛЬНЫЕ / REDUCED: БЕЗ АНИМАЦИЙ =====
  if (isMobile) {
    const show = (sel, extra={}) =>
      document.querySelectorAll(sel).forEach(el => {
        el.style.opacity   = '1';
        el.style.transform = 'none';
        if ('filter' in el.style)   el.style.filter   = 'none';
        if ('clipPath' in el.style) el.style.clipPath = 'none';
        Object.assign(el.style, extra);
      });

    // каталог: сетка категорий и элементы внутри
    show('.cats-grid .cat-card', { boxShadow: 'none' });
    show('.cats-grid .cat-card .cat-card__media img');
    show('.cats-grid .cat-card .cat-card__btn');

    // блок результатов (если показывается)
    show('#catalogResults');
    show('#productsGrid .product-card');

    // на всякий — уберём возможные слушатели hover-tilt, если где-то были навешаны
    document.querySelectorAll('.cats-grid .cat-card').forEach(card => {
      card.onmouseenter = card.onmousemove = card.onmouseleave = null;
      card.style.transform = 'none';
      card.style.boxShadow = 'none';
    });

    return; // ничего из GSAP не запускаем
  }

  // ===== ДЕСКТОП: прежние анимации =====
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  // ===== 1) Wave-вход карточек каталога =====
  const cards = gsap.utils.toArray('.cats-grid .cat-card');
  if (cards.length) {
    const grid = document.querySelector('.cats-grid');
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length || 3;

    gsap.set(cards, { opacity: 0, y: 18, scale: 0.98 });

    const waveTl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: '.catalog-cats', start: 'top 75%', once: true }
    });

    cards.forEach((card, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const waveIndex = row + col;
      const delay = waveIndex * 0.08;

      waveTl.to(card, { opacity: 1, y: 0, scale: 1, duration: 0.7 }, delay);

      const media = card.querySelector('.cat-card__media img');
      const btn   = card.querySelector('.cat-card__btn');
      if (media) waveTl.fromTo(media, {scale: 1.02}, {scale: 1, duration: 0.6}, delay);
      if (btn)   waveTl.fromTo(btn,   {y: 6, opacity: 0}, {y: 0, opacity: 1, duration: 0.4}, delay + 0.1);
    });
  }

  // ===== 2) 3D-tilt на ховер (только десктоп) =====
  document.querySelectorAll('.cats-grid .cat-card').forEach(card => {
    let rx = gsap.quickTo(card, 'rotateX', { duration: 0.2, ease: 'power2.out' });
    let ry = gsap.quickTo(card, 'rotateY', { duration: 0.2, ease: 'power2.out' });
    let sc = gsap.quickTo(card, 'scale',   { duration: 0.2, ease: 'power2.out' });
    let sh = gsap.quickTo(card, 'boxShadow',{ duration: 0.2, ease: 'power2.out' });

    card.style.transformStyle = 'preserve-3d';
    card.style.boxShadow = '0 6px 18px rgba(0,0,0,0.10)';

    function onMove(e){
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      const dx = (e.clientX - cx) / (r.width/2);
      const dy = (e.clientY - cy) / (r.height/2);
      ry(gsap.utils.clamp(-1, 1, dx) * 8);
      rx(gsap.utils.clamp(-1, 1, -dy) * 8);
      sc(1.015);
      sh('0 14px 32px rgba(0,0,0,0.14)');
    }
    function onLeave(){
      rx(0); ry(0); sc(1); sh('0 6px 18px rgba(0,0,0,0.10)');
    }

    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', onLeave);
    card.addEventListener('blur', onLeave);
  });

  // ===== 3) Мягкий вход блока результатов =====
  const results = document.getElementById('catalogResults');
  if (results) {
    window.revealCatalogResults = function(){
      const wrap = results.querySelector('.catalog-results__container');
      gsap.set(results, { opacity: 0, y: 20 });
      results.hidden = false;
      gsap.to(results, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });

      const grid = document.getElementById('productsGrid');
      if (grid) {
        const cards = grid.querySelectorAll('.product-card');
        gsap.set(cards, { opacity: 0, y: 16, scale: 0.98 });
        gsap.to(cards, {
          opacity: 1, y: 0, scale: 1,
          duration: 0.5, ease: 'power2.out', stagger: 0.06, delay: 0.1
        });
      }
    }
  }

  gsap.ticker.lagSmoothing(500, 30);
});
