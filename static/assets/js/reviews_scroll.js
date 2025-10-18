(() => {
  const qs = (s, r=document)=>r.querySelector(s);
  const qsa = (s, r=document)=>Array.from(r.querySelectorAll(s));

  function initReviewsSnap(root){
    const track = qs('.reviews__grid', root);
    if (!track) return;

    const cards = qsa('.review', track);
    if (!cards.length) return;

    // Только для тач-устройств — на десктопах и так ок
    const isTouch = matchMedia('(pointer: coarse)').matches;
    if (!isTouch) return;

    // Определяем ближайшую карточку к центру видимой области
    const nearestIndex = () => {
      const tRect = track.getBoundingClientRect();
      const center = tRect.left + tRect.width / 2;
      let best = Infinity, idx = 0;
      cards.forEach((card, i) => {
        const cRect = card.getBoundingClientRect();
        const cCenter = cRect.left + cRect.width / 2;
        const d = Math.abs(cCenter - center);
        if (d < best){ best = d; idx = i; }
      });
      return idx;
    };

    const scrollToIndex = (i, smooth=true) => {
      i = Math.max(0, Math.min(i, cards.length - 1));
      const tRect = track.getBoundingClientRect();
      const cRect = cards[i].getBoundingClientRect();
      const delta = (cRect.left + cRect.width/2) - (tRect.left + tRect.width/2);
      track.scrollBy({ left: delta, behavior: smooth ? 'smooth' : 'auto' });
    };

    // Используем scrollend, если есть; иначе — таймаут после скролла
    let timer;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => scrollToIndex(nearestIndex(), true), 120);
    };

    const hasScrollEnd = 'onscrollend' in document || 'onscrollend' in window;
    if (hasScrollEnd) {
      track.addEventListener('scrollend', () => scrollToIndex(nearestIndex(), true), { passive: true });
    } else {
      track.addEventListener('scroll', onScroll, { passive: true });
    }

    // Пересчёт при изменении размеров/раскладки
    const ro = new ResizeObserver(() => scrollToIndex(nearestIndex(), false));
    ro.observe(track);
    cards.forEach(c => ro.observe(c));
  }

  document.addEventListener('DOMContentLoaded', () => {
    qsa('.reviews').forEach(initReviewsSnap);
  });
})();
