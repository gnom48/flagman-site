document.addEventListener('DOMContentLoaded', () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(pointer: coarse)').matches;
  const isNarrow = window.innerWidth < 992;
  const isMobile = reduce || isTouch || isNarrow;

  // ===== МОБИЛЬНЫЙ/REDUCED-МОД РЕЖИМ: БЕЗ АНИМАЦИЙ =====
  if (isMobile) {
    const show = (sel, styles = {}) => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        if ('filter' in el.style) el.style.filter = 'none';
        if ('clipPath' in el.style) el.style.clipPath = 'none';
        Object.assign(el.style, styles);
      });
    };

    show('.catalog__glass');
    show('.catalog__title');
    show('.catalog__subtitle');
    show('.cat-track');
    show('.cat-card', { boxShadow: 'none', scale: '1' });
    show('.catalog__cta .button_сatalog');

    document.querySelectorAll('.cat-card').forEach(card => {
      card.onmouseenter = card.onmousemove = card.onmouseleave = null;
      card.style.transform = 'none';
      card.style.boxShadow = 'none';
    });
    return;
  }

  // ===== ДЕСКТОП: прежняя анимация =====
  if (!window.gsap || !window.ScrollTrigger) return;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  // стартовые состояния (минимум анимаций)
  gsap.set(".catalog__glass", {opacity: 0, y: 24, filter: "blur(6px)"});
  gsap.set(".catalog__title", {opacity: 0, y: 12, clipPath: "inset(0 0 100% 0)"});
  gsap.set(".catalog__subtitle", {opacity: 0, y: 12});
  gsap.set(".cat-track", {opacity: 0, y: 18});
  gsap.set(".cat-card", {opacity: 0, y: 16, scale: 0.96});
  gsap.set(".catalog__cta .button_сatalog", {opacity: 0, y: 12});

  // вход секции
  const tl = gsap.timeline({
    defaults: {duration: 0.6, ease: "power2.out"},
    scrollTrigger: { trigger: ".catalog", start: "top 76%", once: true }
  });

  tl.to(".catalog__glass", {opacity: 1, y: 0, filter: "blur(0px)"}, 0)
    .to(".catalog__title", {opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)"}, "<+0.05")
    .to(".catalog__subtitle", {opacity: 1, y: 0}, "<+0.05")
    .to(".cat-track", {opacity: 1, y: 0}, "<+0.05")
    .to(".cat-card", {opacity: 1, y: 0, scale: 1, stagger: {each: 0.08}, duration: 0.5}, "<+0.02")
    .to(".catalog__cta .button_сatalog", {opacity: 1, y: 0}, "<+0.05");

  // параллакс трека и лёгкий встречный сдвиг левой колонки
  gsap.to(".cat-track", {
    xPercent: -6, ease: "none",
    scrollTrigger: { trigger: ".catalog", start: "top bottom", end: "bottom top", scrub: true }
  });
  gsap.to(".catalog__left", {
    y: 18, ease: "none",
    scrollTrigger: { trigger: ".catalog", start: "top bottom", end: "bottom top", scrub: true }
  });

  // 3D-tilt ховер для карточек (десктоп)
  const maxTilt = 8, scaleOver = 1.02;
  document.querySelectorAll(".cat-card").forEach(card => {
    let rx = gsap.quickTo(card, "rotateX", {duration: 0.2, ease: "power2.out"});
    let ry = gsap.quickTo(card, "rotateY", {duration: 0.2, ease: "power2.out"});
    let sc = gsap.quickTo(card, "scale",   {duration: 0.2, ease: "power2.out"});
    let sh = gsap.quickTo(card, "boxShadow",{duration: 0.2, ease: "power2.out"});

    function onMove(e){
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      const dx = (e.clientX - cx) / (r.width/2);
      const dy = (e.clientY - cy) / (r.height/2);
      ry(gsap.utils.clamp(-1, 1, dx) * maxTilt);
      rx(gsap.utils.clamp(-1, 1, -dy) * maxTilt);
      sc(scaleOver);
      sh("0 12px 28px rgba(0,0,0,0.14)");
    }
    function onLeave(){
      rx(0); ry(0); sc(1); sh("0 6px 18px rgba(0,0,0,0.10)");
    }

    card.style.boxShadow = "0 6px 18px rgba(0,0,0,0.10)";
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    card.addEventListener("blur", onLeave);
  });

  // пульс колечек (если есть)
  tl.add(() => {
    gsap.fromTo(".cat-card__ring", {scale: 0.9, opacity: 0.0}, {
      scale: 1.02, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.08
    });
  }, "-=0.2");

  // рефреш после загрузки изображений
  const imgs = document.querySelectorAll(".cat-card img");
  let pending = imgs.length;
  if (pending === 0) ScrollTrigger.refresh();
  imgs.forEach(i => {
    if (i.complete) { if (--pending === 0) ScrollTrigger.refresh(); }
    else {
      i.addEventListener('load', () => { if (--pending === 0) ScrollTrigger.refresh(); }, {once:true});
      i.addEventListener('error', () => { if (--pending === 0) ScrollTrigger.refresh(); }, {once:true});
    }
  });

  gsap.ticker.lagSmoothing(500, 30);
});
