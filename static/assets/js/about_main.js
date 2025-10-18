(function(){
  document.addEventListener('DOMContentLoaded', () => {
    // ===== детектор мобильных =====
    const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 992;

    // если мобильный — без анимаций: всё сразу видимо и без ScrollTrigger
    if (isMobile) {
      const img = document.querySelector(".about__media img");
      const titleEl = document.querySelector(".about__title");
      const textEl  = document.querySelector(".about__text");

      if (img)  { img.style.opacity = 1; img.style.transform = 'none'; }
      if (titleEl) {
        // если были нарезанные спаны — делаем их видимыми
        titleEl.querySelectorAll('span').forEach(s => { s.style.opacity = 1; s.style.transform = 'none'; });
        titleEl.style.opacity = 1; titleEl.style.transform = 'none';
      }
      if (textEl) { textEl.style.opacity = 1; textEl.style.transform = 'none'; }

      document.querySelectorAll(".pill-btn,.about-card,.about__content").forEach(el=>{
        el.style.opacity = 1; el.style.transform = 'none';
      });

      // ничего не инициализируем — выходим
      return;
    }

    // ===== ниже — прежняя десктопная логика с GSAP/ScrollTrigger =====
    if (!window.gsap || !window.ScrollTrigger) return;
    if (!document.querySelector('.about')) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const allowParallax = !reduce && (window.innerWidth >= 992);

    function getDirectSpans(el){
      try { return el.querySelectorAll(':scope > span'); }
      catch(e){ return Array.from(el.children).filter(n => n.tagName === 'SPAN'); }
    }
    function splitIntoChunks(el, maxChunks = 9){
      if (!el) return [];
      if (el.dataset.split === "1") return [...getDirectSpans(el)];
      const words = el.textContent.trim().split(/\s+/);
      const chunks = Math.min(maxChunks, Math.max(3, Math.ceil(words.length / 3)));
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
      return [...getDirectSpans(el)];
    }

    gsap.set(".about__media img", {opacity: 0, y: 24, scale: 1.01, force3D: true});
    gsap.set(".pill-btn", {opacity: 0, y: 10, force3D: true});
    gsap.set(".about-card", {opacity: 0, y: 20, rotate: -2, force3D: true});

    const titleEl = document.querySelector('.about__title');
    const textEl  = document.querySelector('.about__text');
    const titleChunks = splitIntoChunks(titleEl);

    if (!reduce) gsap.set(titleChunks, {y: '0.7em', opacity: 0, force3D: true});
    else gsap.set(titleChunks, {opacity: 0});

    gsap.set(textEl, {opacity: 0, yPercent: 30, force3D: true});

    const tl = gsap.timeline({
      defaults: {duration: 0.6, ease: "power2.out"},
      scrollTrigger: { trigger: ".about", start: "top 76%", once: true }
    });

    tl.to(".about__media img", {opacity: 1, y: 0, scale: 1}, 0)
      .to(titleChunks, {y: 0, opacity: 1, stagger: 0.04, duration: 0.5}, "<+0.05")
      .to(textEl, {opacity: 1, yPercent: 0, duration: 0.5}, "<+0.06")
      .to(".pill-btn", {opacity: 1, y: 0, duration: 0.4}, "<+0.05");

    gsap.utils.toArray(".about-card").forEach((card, i) => {
      gsap.fromTo(card,
        {opacity: 0, y: 22, rotate: i % 2 ? 2 : -2},
        {
          opacity: 1, y: 0, rotate: 0, duration: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 88%", toggleActions: "play none none reverse" }
        }
      );
    });

    if (!reduce){
      tl.call(() => gsap.to(".pill-btn", { scale: 1.02, duration: 0.6, ease: "power1.inOut", yoyo: true, repeat: 1 }));
    }

    if (allowParallax){
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

    const img = document.querySelector(".about__media img");
    if (img) {
      if (img.complete) ScrollTrigger.refresh();
      else {
        img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
        img.addEventListener('error', () => ScrollTrigger.refresh(), { once: true });
      }
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    gsap.ticker.lagSmoothing(500, 30);
    window.addEventListener('load', () => ScrollTrigger.refresh());
  });
})();