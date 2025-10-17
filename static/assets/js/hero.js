// Появление стеклянной панели
(function () {
  const els = document.querySelectorAll('[data-animate]');
  if (!('IntersectionObserver' in window)) { els.forEach(e=>e.classList.add('reveal')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('reveal');
        io.unobserve(entry.target);
      }
    });
  }, {threshold: 0.2});
  els.forEach(el => io.observe(el));
})();

// Лёгкий параллакс для фото атомов
(function () {
  const img = document.querySelector('[data-parallax]');
  if (!img) return;
  let rafId=null, tx=0, ty=0, cx=0, cy=0;
  const lerp=(a,b,t)=>a+(b-a)*t;
  function onMove(e){
    const r = img.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width/2)) / r.width;  // -0.5..0.5
    const y = (e.clientY - (r.top  + r.height/2)) / r.height;
    tx = x * 16; ty = y * 16; // смещение до 16px
    if(!rafId) rafId = requestAnimationFrame(update);
  }
  function update(){
    cx = lerp(cx, tx, .08); cy = lerp(cy, ty, .08);
    img.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    if (Math.abs(cx-tx)>.1 || Math.abs(cy-ty)>.1) rafId = requestAnimationFrame(update);
    else rafId=null;
  }
  window.addEventListener('mousemove', onMove, {passive:true});
})();




 // включаем ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // уважение к prefers-reduced-motion
  const R = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = "power3.out";

  // базовые установки (избегаем «дёрга» при первом кадре)
  gsap.set(".glass-card", {opacity: 0, y: 24, filter: "blur(8px)"});
  gsap.set(".navbar .brand, .navbar .menu .menu__item, .navbar .social .icon-btn", {opacity: 0, y: -12});
  gsap.set(".hero__title", {opacity: 0, y: 18, clipPath: "inset(0 0 100% 0)"});
  gsap.set(".hero__subtitle", {opacity: 0, y: 14});
  gsap.set(".stats .stat", {opacity: 0, y: 16, scale: 0.96});
  gsap.set(".button#btnPrice", {opacity: 0, y: 16, scale: 0.98});
  gsap.set(".glow", {opacity: 0, scale: 0.96});
  gsap.set(".atoms", {opacity: 0, y: 20, scale: 1.02});

  // главная таймлиния (запускается при появлении секции hero в вьюпорте)
  const tl = gsap.timeline({
    defaults: {duration: 0.8, ease},
    scrollTrigger: {
      trigger: ".hero",
      start: "top 70%",
      once: true
    }
  });

  // 1) стеклянные панели
  tl.to(".glass-card:nth-of-type(1)", {opacity: 1, y: 0, filter: "blur(0px)"}, 0)
    .to(".glass-card:nth-of-type(2)", {opacity: 1, y: 0, filter: "blur(0px)"}, 0.05);

  // 2) навбар по элементам
  tl.to(".navbar .brand", {opacity: 1, y: 0}, "-=0.55")
    .to(".navbar .menu .menu__item", {opacity: 1, y: 0, stagger: 0.06}, "<+0.05")
    .to(".navbar .social .icon-btn", {opacity: 1, y: 0, stagger: 0.06}, "<");

  // 3) заголовок с «занавесом» (clipPath)
  tl.to(".hero__title", {opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)"}, "<+0.05");

  // 4) подзаголовок
  tl.to(".hero__subtitle", {opacity: 1, y: 0}, "<+0.05");

  // 5) статистика (плитки + счётчики)
  tl.to(".stats .stat", {
      opacity: 1, y: 0, scale: 1, stagger: 0.08,
      onComplete: () => !R && animateNumbers(".stats .stat__value")
    }, "<+0.05");

  // 6) кнопка с лёгким всплеском
  tl.to(".button#btnPrice", {opacity: 1, y: 0, scale: 1}, "<+0.05")
    .to(".button #btnPrice, .button#btnPrice .btn-glow", {duration: 0.9, scale: 1.02, repeat: 1, yoyo: true}, "<");

  // 7) свечение фона и «атомы»
  tl.to(".glow", {opacity: 1, scale: 1, stagger: 0.05}, "<-0.2")
    .to(".atoms", {opacity: 1, y: 0, scale: 1}, "<");


  function animateNumbers(selector){
  const fmt = new Intl.NumberFormat('ru-RU');

  document.querySelectorAll(selector).forEach(el => {
    // если уже анимировали — не трогаем
    if (el.dataset.animated === "1") return;
    el.dataset.animated = "1";

    // цель и суффикс
    const targetAttr = el.getAttribute('data-target');
    // запасной парсинг, если забыли data-target
    const fallback = (el.textContent.match(/\d[\d\s.,]*/)?.[0] || "0")
                      .replace(/[^\d,\.]/g, '')
                      .replace(',', '.');
    const target = Number(targetAttr ?? fallback);
    const suffix = el.getAttribute('data-suffix') || (el.textContent.replace(/.*?\d[\d\s.,]*/, '') || '');

    // сбрасываем видимое значение к 0 перед стартом
    el.textContent = suffix ? `0${suffix}` : '0';

    // на всякий — убить старые твины по этому элементу
    gsap.killTweensOf(el);

    // твиним «виртуальное» число, обновляем текст форматированно
    const obj = { val: 0 };
    const dur = Math.min(1.6, Math.max(0.8, target / 1500));

    gsap.to(obj, {
      val: target,
      duration: dur,
      ease: "power3.out",
      onUpdate: () => {
        const n = Math.floor(obj.val);
        el.textContent = fmt.format(n) + suffix;
      }
    });
  });
}

