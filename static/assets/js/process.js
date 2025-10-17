(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  // 1) Проброс data-step с <li> на .process__card
  $$('.process__step[data-step]').forEach(step=>{
    const card = step.querySelector('.process__card');
    if (card && !card.hasAttribute('data-step')){
      card.setAttribute('data-step', step.getAttribute('data-step'));
    }
  });

  const steps = $$('.process__step');
  if (!steps.length) return;

  // Детект мобильного / отключения анимаций
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(pointer: coarse)').matches;

  // Если reduce или тач — используем IntersectionObserver (минимум анимаций)
  if (reduce || isTouch || !window.gsap || !window.ScrollTrigger){
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(e=>{
        if (e.isIntersecting) e.target.classList.add('is-in');
        // если нужно обратно прятать — иначе оставляем показанными
        else e.target.classList.remove('is-in');
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.2 });

    steps.forEach(s=>io.observe(s));
    return;
  }

  // ===== GSAP-вариант для десктопа =====
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // Если секция прокручивается НЕ окном (например, <main> с overflow:auto) — укажи скроллер:
  // const scrollerEl = document.querySelector('main'); // <-- поменяй на свой контейнер, если нужно
  const scrollerEl = null;

  // Стартовые состояния
  gsap.set('.process__rail', {transformOrigin: 'top center', scaleY: 0});
  gsap.set(steps, {autoAlpha: 0, y: 60});

  // Рельса растёт по скроллу секции
  gsap.to('.process__rail', {
    scaleY: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.process',
      start: 'top 80%',
      end: 'bottom 10%',
      scrub: true,
      fastScrollEnd: true,
      ...(scrollerEl ? { scroller: scrollerEl } : {})
    }
  });

  // Каждый шаг
  steps.forEach((step) => {
    const card = step.querySelector('.process__card');
    const tl = gsap.timeline({
      defaults: { duration: 0.6, ease: 'power2.out' },
      scrollTrigger: {
        trigger: step,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
        fastScrollEnd: true,
        ...(scrollerEl ? { scroller: scrollerEl } : {})
      }
    });

    tl.to(step, { autoAlpha: 1, y: 0 }, 0);
    if (card){
      tl.from(card, { scale: 0.985, y: 18 }, 0);
      tl.from(card, { opacity: 0.96 }, 0);
    }
  });

  // Обновляем расчёты после загрузки всего (картинки, шрифты)
  const doRefresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(doRefresh);
  window.addEventListener('load', doRefresh, { once: true });
  window.addEventListener('resize', gsap.utils.debounce(doRefresh, 200));

  // ===== Страховка: если за 1.2s ни один триггер не сработал — показываем контент =====
  setTimeout(() => {
    const anyActive = ScrollTrigger.getAll().some(st => st.isActive || st.progress > 0);
    if (!anyActive){
      steps.forEach(s => { s.style.opacity = '1'; s.style.transform = 'none'; });
    }
  }, 1200);
})();
