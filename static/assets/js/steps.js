document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ⏱ настройки длительностей
  const DUR = {
    title:   reduce ? 0.6 : 0.9,   // заголовок
    step:    reduce ? 0.45 : 0.8,  // основной выезд карточки
    corners: reduce ? 0.25 : 0.45, // уголки
    num:     reduce ? 0.25 : 0.35  // «щёлчок» номера
  };
  const STAGGER = {
    steps:   reduce ? 0.10 : 0.18, // задержка между карточками
    corners: 0.08
  };

  // заголовок — шторка + выезд (мягче и дольше)
  gsap.set('.steps__title', {opacity: 0, y: 18, clipPath: 'inset(0 0 100% 0)'});
  gsap.to('.steps__title', {
    opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: DUR.title, ease: 'power3.out',
    scrollTrigger: { trigger: '.steps', start: 'top 82%', once: true }
  });

  // стартовые позиции карточек (слева/справа)
  gsap.set('.steps .step', { opacity: 0, y: 16, x: i => (i % 2 ? 56 : -56) });

  // карточки — по одной, дольше и мягче
  gsap.utils.toArray('.steps .step').forEach((step, i) => {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        trigger: step,
        start: 'top 88%',                 // запускаем чуть позже — ощущение «длиннее»
        toggleActions: 'play none none reverse'
      }
    });

    // основной выезд карточки (дольше)
    tl.to(step, { opacity: 1, x: 0, y: 0, duration: DUR.step });

    if (!reduce) {
      // уголки «рисуются» медленнее
      const corners = step.querySelectorAll('.corner');
      tl.to(corners, {
        opacity: 1, scale: 1, duration: DUR.corners, stagger: STAGGER.corners
      }, `-=${Math.min(0.35, DUR.step * 0.45)}`);

      // «щёлчок» номера — мягче
      const num = step.querySelector('.step__num');
      if (num) tl.fromTo(num, {scale: 0.95}, {scale: 1, duration: DUR.num, ease: 'back.out(2.2)'}, '<');
    }
  });

  // общий «каскад», если все три в кадре: дольше, с большим stagger
  const grid = document.querySelector('.steps__grid');
  if (grid && !reduce) {
    ScrollTrigger.batch('.steps .step', {
      start: 'top 88%',
      interval: STAGGER.steps,
      onEnter: batch => gsap.to(batch, {
        opacity: 1, x: 0, y: 0,
        duration: DUR.step,
        ease: 'power3.out',
        stagger: STAGGER.steps
      }),
      onLeaveBack: batch => gsap.to(batch, {
        opacity: 0, y: 14, x: (i)=> (i%2? 56 : -56),
        duration: 0.45, ease: 'power2.in'
      })
    });
  }

  gsap.ticker.lagSmoothing(500, 30);
});