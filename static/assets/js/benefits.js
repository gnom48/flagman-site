(function(){
  const items = document.querySelectorAll('#benefit-acc .acc-item');
  if(!items.length) return;

  const hasGSAP = !!window.gsap;
  const D = .3;

  function openItem(item){
    const head = item.querySelector('.acc-head');
    const body = item.querySelector('.acc-body');
    head.setAttribute('aria-expanded','true');
    body.setAttribute('aria-hidden','false');

    if(hasGSAP){
      gsap.killTweensOf(body);
      gsap.to(body, {opacity:1, duration:D, ease:'power2.out'});
      if(!item.closest('.benefits')?.classList.contains('is-pinned')){
        gsap.fromTo(body, {height:0}, {height:'auto', duration:D, ease:'power2.out', onComplete:()=> body.style.height='auto'});
      }
    }else{
      body.style.opacity = 1;
      if(!item.closest('.benefits')?.classList.contains('is-pinned')){
        body.style.height = body.scrollHeight + 'px';
      }
    }
  }

  function closeItem(item){
    const head = item.querySelector('.acc-head');
    const body = item.querySelector('.acc-body');
    head.setAttribute('aria-expanded','false');
    body.setAttribute('aria-hidden','true');

    if(hasGSAP){
      gsap.killTweensOf(body);
      if(!item.closest('.benefits')?.classList.contains('is-pinned')){
        gsap.to(body, {height:0, duration:D, ease:'power2.in'});
      }
      gsap.to(body, {opacity:0, duration:D, ease:'power2.in'});
    }else{
      if(!item.closest('.benefits')?.classList.contains('is-pinned')){
        body.style.height = '0px';
      }
      body.style.opacity = 0;
    }
  }

  items.forEach((item)=>{
    const head = item.querySelector('.acc-head');
    head.addEventListener('click', ()=>{
      const isOpen = head.getAttribute('aria-expanded') === 'true';
      items.forEach(i => { if(i!==item) closeItem(i); });
      isOpen ? closeItem(item) : openItem(item);
    });
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  const reduce   = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch  = matchMedia('(pointer: coarse)').matches;
  const isNarrow = window.innerWidth < 992;
  const isMobile = reduce || isTouch || isNarrow;

  // ===== МОБИЛЬНЫЙ/REDUCED: БЕЗ АНИМАЦИЙ =====
  if (isMobile) {
    const show = sel =>
      document.querySelectorAll(sel).forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });

    show('.benefits__title');
    show('#benefit-acc .acc-head');
    show('.benefits__media img');
    return; // выходим — никаких gsap
  }

  // ===== ДЕСКТОП: анимации как раньше =====
  if (!window.gsap || !window.ScrollTrigger) return;
  const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  gsap.set('.benefits__title', {opacity: 0, y: 16});
  gsap.set('#benefit-acc .acc-head', {opacity: 0, y: 12});
  gsap.set('.benefits__media img', {opacity: 0, y: 16});

  // 1) мягкое появление секции (один раз)
  const tl = gsap.timeline({
    defaults: {duration: 0.5, ease: 'power2.out'},
    scrollTrigger: { trigger: '.benefits', start: 'top 75%', once: true }
  });

  tl.to('.benefits__title', {opacity: 1, y: 0}, 0)
    .to('.benefits__media img', {opacity: 1, y: 0}, '<+0.05')
    .to('#benefit-acc .acc-head', {opacity: 1, y: 0, stagger: 0.1}, '<+0.05');

  // 2) параллакс изображения (только десктоп)
  gsap.to('.benefits__media img', {
    y: -10, ease: 'none',
    scrollTrigger: { trigger: '.benefits', start: 'top bottom', end: 'bottom top', scrub: true }
  });

  gsap.ticker.lagSmoothing(500, 30);
});
