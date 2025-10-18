document.addEventListener('DOMContentLoaded', () => {
  const reduce   = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch  = matchMedia('(pointer: coarse)').matches;
  const isNarrow = window.innerWidth < 992;
  const isMobile = reduce || isTouch || isNarrow;

  const show = (sel, extra={}) =>
    document.querySelectorAll(sel).forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.clipPath = 'none';
      Object.assign(el.style, extra);
    });

  if (isMobile) {
    show('.steps__title');
    show('.steps .step');
    show('.steps .step .corner', { opacity: '1', transform: 'none' });
    show('.steps .step .step__num', { transform: 'none' });
    return;
  }

  // ===== Fallback, если GSAP/ScrollTrigger нет (десктоп)
  if (!window.gsap || !window.ScrollTrigger) {
    // плавно показываем шаги, когда они входят во вьюпорт
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(e=>{
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
        }
      });
    }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.2 });

    document.querySelectorAll('.steps .step').forEach(step=>{
      step.style.opacity = '0';
      step.style.transform = 'translateY(16px)';
      io.observe(step);
    });
    // заголовок
    const title = document.querySelector('.steps__title');
    if (title){
      title.style.opacity = '0';
      title.style.transform = 'translateY(18px)';
      io.observe(title);
    }
    return;
  }

  // ===== ДЕСКТОП: GSAP-анимации (твоя логика)
  const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  const DUR = {
    title:   reduce ? 0.6 : 0.9,
    step:    reduce ? 0.45 : 0.8,
    corners: reduce ? 0.25 : 0.45,
    num:     reduce ? 0.25 : 0.35
  };
  const STAGGER = { steps: reduce ? 0.10 : 0.18, corners: 0.08 };

  // заголовок
  gsap.set('.steps__title', {opacity: 0, y: 18, clipPath: 'inset(0 0 100% 0)'});
  gsap.to('.steps__title', {
    opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: DUR.title, ease: 'power3.out',
    scrollTrigger: { trigger: '.steps', start: 'top 82%', once: true }
  });

  // стартовые позиции карточек
  gsap.set('.steps .step', { opacity: 0, y: 16, x: i => (i % 2 ? 56 : -56) });

  // каждая карточка
  gsap.utils.toArray('.steps .step').forEach((step) => {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: step, start: 'top 88%', toggleActions: 'play none none reverse' }
    });

    tl.to(step, { opacity: 1, x: 0, y: 0, duration: DUR.step });

    const corners = step.querySelectorAll('.corner');
    if (corners.length){
      tl.to(corners, { opacity: 1, scale: 1, duration: DUR.corners, stagger: STAGGER.corners },
        `-=${Math.min(0.35, DUR.step * 0.45)}`);
    }

    const num = step.querySelector('.step__num');
    if (num) tl.fromTo(num, {scale: 0.95}, {scale: 1, duration: DUR.num, ease: 'back.out(2.2)'}, '<');
  });

  // каскад, если сразу много в кадре
  const grid = document.querySelector('.steps__grid');
  if (grid) {
    ScrollTrigger.batch('.steps .step', {
      start: 'top 88%',
      interval: STAGGER.steps,
      onEnter: batch => gsap.to(batch, {
        opacity: 1, x: 0, y: 0, duration: DUR.step, ease: 'power3.out', stagger: STAGGER.steps
      }),
      onLeaveBack: batch => gsap.to(batch, {
        opacity: 0, y: 14, x: (i)=> (i%2? 56 : -56), duration: 0.45, ease: 'power2.in'
      })
    });
  }

  // рефреш после загрузки шрифтов/картинок (важно для iOS)
  const doRefresh = () => ScrollTrigger.refresh();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(doRefresh);
  const imgs = document.querySelectorAll('.steps img');
  let pending = imgs.length;
  if (pending === 0) doRefresh();
  imgs.forEach(img=>{
    if (img.complete) { if (--pending === 0) doRefresh(); }
    else {
      img.addEventListener('load',  () => { if (--pending === 0) doRefresh(); }, {once:true});
      img.addEventListener('error', () => { if (--pending === 0) doRefresh(); }, {once:true});
    }
  });

  gsap.ticker.lagSmoothing(500, 30);
});
  
