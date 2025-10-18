(() => {
  const $all = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function initMobileCarousel(root){
    const track = root.querySelector('.cat-track');
    if (!track) return;

    const cards = Array.from(track.querySelectorAll('.cat-card'));
    if (!cards.length) return;

    const isTouch = matchMedia('(pointer: coarse)').matches;

    // === утилиты ===
    const getNearestIndex = () => {
      // считаем относительно видимого окна трека (центр)
      const tRect = track.getBoundingClientRect();
      const center = tRect.left + tRect.width / 2;
      let idx = 0, best = Infinity;
      cards.forEach((card, i) => {
        const cRect = card.getBoundingClientRect();
        const cCenter = cRect.left + cRect.width / 2;
        const d = Math.abs(cCenter - center);
        if (d < best){ best = d; idx = i; }
      });
      return idx;
    };

    const scrollToIndex = (i, smooth = true) => {
      i = Math.max(0, Math.min(i, cards.length - 1));
      const tRect = track.getBoundingClientRect();
      const cRect = cards[i].getBoundingClientRect();
      // смещаем так, чтобы центр карточки совпал с центром трека
      const delta = (cRect.left + cRect.width/2) - (tRect.left + tRect.width/2);
      track.scrollBy({ left: delta, behavior: smooth ? 'smooth' : 'auto' });
    };

    // === МОБИЛЬНЫЙ РЕЖИМ: оставляем нативный свайп + snap ===
    if (isTouch){
      // Поддержка snap и аккуратный догон, если платформа не «доснипала»
      let snapTimer;
      const onScroll = () => {
        clearTimeout(snapTimer);
        snapTimer = setTimeout(() => scrollToIndex(getNearestIndex(), true), 120);
      };

      // если есть событие scrollend — используем его (Safari 16+)
      const supportsScrollEnd = 'onscrollend' in window || 'onscrollend' in document;
      if (supportsScrollEnd){
        track.addEventListener('scrollend', () => scrollToIndex(getNearestIndex(), true), { passive: true });
      } else {
        track.addEventListener('scroll', onScroll, { passive: true });
      }

      // ресайз/изменение карточек — пересчитать позицию
      const ro = new ResizeObserver(() => scrollToIndex(getNearestIndex(), false));
      ro.observe(track);
      cards.forEach(c => ro.observe(c));

      return; // Никакого кастомного drag/wheel на мобильных!
    }

    // === ДЕСКТОП: колесо по оси X + drag мышью + прилипаем после инерции ===
    let snapTimer = null;
    track.addEventListener('scroll', () => {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => scrollToIndex(getNearestIndex(), true), 100);
    }, { passive: true });

    track.addEventListener('wheel', (e) => {
      // вертикальное колесо скроллит горизонтально
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        track.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });

    // drag мышью
    let isDown = false, startX = 0, startLeft = 0, moved = false;
    const start = (x) => {
      isDown = true; startX = x; startLeft = track.scrollLeft; moved = false;
      track.classList.add('is-drag');
    };
    const move = (x) => {
      if (!isDown) return;
      const dx = x - startX;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = startLeft - dx;
    };
    const end = () => {
      isDown = false; track.classList.remove('is-drag');
      scrollToIndex(getNearestIndex(), true);
    };

    track.addEventListener('mousedown', e => start(e.clientX));
    window.addEventListener('mousemove', e => move(e.clientX));
    window.addEventListener('mouseup', end);

    // отменяем клики при реальном свайпе
    track.addEventListener('click', e => { if (moved) e.preventDefault(); }, true);

    const ro = new ResizeObserver(() => scrollToIndex(getNearestIndex(), false));
    ro.observe(track);
    cards.forEach(c => ro.observe(c));
  }

  $all('.cat-wrap').forEach(initMobileCarousel);
})();