(function(){
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (!document.querySelector('.about')) return;

    gsap.registerPlugin(ScrollTrigger);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;

    // ===== helper: разбить заголовок на немного "кусков" (8–10 макс) =====
    function splitIntoChunks(el, maxChunks = 9){
      if (!el) return [];
      if (el.dataset.split === "1") return [...el.querySelectorAll(':scope > span')];

      const words = el.textContent.trim().split(/\s+/);
      const chunks = Math.min(maxChunks, Math.max(3, Math.ceil(words.length / 3))); // примерно по 3 слова в куске
      const size = Math.ceil(words.length / chunks);

      const frag = document.createDocumentFragment();
      for (let i = 0; i < words.length; i += size){
        const span = document.createElement('span');
        span.textContent = words.slice(i, i + size).join(' ') + (i + size < words.length ? ' ' : '');
        frag.appendChild(span);
      }
      el.textContent = '';
      el.appendChild(frag);
      el.classList.add('reveal-chunks');
      el.dataset.split = "1";
      return [...el.querySelectorAll(':scope > span')];
    }

    // ===== стартовые состояния (минимум анимаций) =====
    gsap.set(".about__media img", {opacity: 0, y: 24, scale: 1.01});
    gsap.set(".pill-btn", {opacity: 0, y: 10});
    gsap.set(".about-card", {opacity: 0, y: 20, rotate: -2});

    const titleEl = document.querySelector('.about__title');
    const textEl  = document.querySelector('.about__text');
    const titleChunks = splitIntoChunks(titleEl);

    // заголовок: кусочки слегка снизу
    if (!reduce) gsap.set(titleChunks, {y: '0.7em', opacity: 0});
    else gsap.set(titleChunks, {opacity: 0});

    // абзац: цельный, «шторка» без спанов
    gsap.set(textEl, {opacity: 0, y: 10, clipPath: "inset(0 0 100% 0)"});

    // ===== вход секции (лёгкие значения) =====
    const tl = gsap.timeline({
      defaults: {duration: 0.6, ease: "power2.out"},
      scrollTrigger: { trigger: ".about", start: "top 76%", once: true }
    });

    tl.to(".about__media img", {opacity: 1, y: 0, scale: 1}, 0)
      .to(titleChunks, {y: 0, opacity: 1, stagger: 0.04, duration: 0.5}, "<+0.05")
      .to(textEl, {opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.5}, "<+0.06")
      .to(".pill-btn", {opacity: 1, y: 0, duration: 0.4}, "<+0.05");

    // карточки — по одной (минимум эффекта)
    gsap.utils.toArray(".about-card").forEach((card, i) => {
      gsap.fromTo(card,
        {opacity: 0, y: 22, rotate: i % 2 ? 2 : -2},
        {
          opacity: 1, y: 0, rotate: 0, duration: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none reverse" }
        }
      );
    });

    // лёгкое дыхание кнопки (один раз)
    if (!reduce){
      tl.call(() => gsap.to(".pill-btn", {
        scale: 1.02, duration: 0.6, ease: "power1.inOut", yoyo: true, repeat: 1
      }));
    }

    // ПАРАЛЛАКС — только на десктопе и без reduce
    if (!reduce && !isTouch){
      gsap.set(".about__media img", { scale: 1.01, transformOrigin: "50% 50%" });
      gsap.to(".about__media img", {
        yPercent: -5, ease: "none",
        scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true }
      });
      gsap.to(".about__content", {
        y: 18, ease: "none",
        scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true }
      });
    }

    // корректный расчёт после загрузки изображения
    const img = document.querySelector(".about__media img");
    if (img) {
      if (img.complete) ScrollTrigger.refresh();
      else {
        img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
        img.addEventListener('error', () => ScrollTrigger.refresh(), { once: true });
      }
    }

    // лёгкая защита от фризов
    gsap.ticker.lagSmoothing(500, 30);
    window.addEventListener('load', () => ScrollTrigger.refresh());
  });
})();
