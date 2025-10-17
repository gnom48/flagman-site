(() => {
  // зеркалим data-step с <li> на .process__card (если ещё не сделали)
  document.querySelectorAll('.process__step[data-step]').forEach(step=>{
    const card = step.querySelector('.process__card');
    if (card && !card.hasAttribute('data-step')){
      card.setAttribute('data-step', step.getAttribute('data-step'));
    }
  });

  const steps = Array.from(document.querySelectorAll('.process__step'));

  // === Fallback, если GSAP нет ===
  if (!window.gsap || !window.ScrollTrigger){
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(e=>{
        if (e.isIntersecting) e.target.classList.add('is-in');
        else e.target.classList.remove('is-in');
      });
    }, {rootMargin: '0px 0px -10% 0px', threshold: 0.2});
    steps.forEach(s=>io.observe(s));
    return;
  }

  // === GSAP вариант ===
  gsap.registerPlugin(ScrollTrigger);

  // стартовые состояния (без моргания)
  gsap.set(".process__rail", {transformOrigin: "top center", scaleY: 0});
  gsap.set(steps, {autoAlpha: 0, y: 60});

  // анимация "рельсы" — растёт по мере прокрутки секции
  gsap.to(".process__rail", {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".process",
      start: "top 80%",
      end: "bottom 10%",
      scrub: true,
      fastScrollEnd: true
    }
  });

  // каждый шаг — лёгкий «въезд» + микро-зум
  steps.forEach((step, i) => {
    const card = step.querySelector('.process__card');
    const tl = gsap.timeline({
      defaults: {duration: 0.6, ease: "power2.out"},
      scrollTrigger: {
        trigger: step,
        start: "top 85%",              // видно, но не слишком рано
        toggleActions: "play none none reverse",
        fastScrollEnd: true
      }
    });

    tl.to(step, {autoAlpha: 1, y: 0}, 0);
    if (card){
      tl.from(card, {scale: 0.985, y: 18}, 0);          // микро-зум
      tl.from(card, {opacity: 0.96}, 0);                // мягкий fade
    }
  });

  // пересчёт позиций после полной загрузки и на ресайз
  const refresh = () => ScrollTrigger.refresh();
  window.addEventListener('load', refresh, {once:true});
  window.addEventListener('resize', gsap.utils.debounce(refresh, 180));
})();
