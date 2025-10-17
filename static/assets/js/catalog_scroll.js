(() => {
  const $all = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function initMobileCarousel(root){
    const track = root.querySelector('.cat-track');
    if (!track) return;

    const cards = Array.from(track.querySelectorAll('.cat-card'));
    if (!cards.length) return;

    // определяем ближайшую карточку к scrollLeft
    const nearestIndex = () => {
      const sl = track.scrollLeft;
      let nearest = 0, bestDiff = Infinity;
      cards.forEach((card, i) => {
        const diff = Math.abs(card.offsetLeft - sl);
        if (diff < bestDiff){ bestDiff = diff; nearest = i; }
      });
      return nearest;
    };

    const scrollToIndex = (i, smooth=true) => {
      i = Math.max(0, Math.min(i, cards.length - 1));
      const target = cards[i].offsetLeft;
      track.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
    };

    // прилипаем после инерционного скролла
    let snapTimer = null;
    track.addEventListener('scroll', () => {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => scrollToIndex(nearestIndex()), 100);
    }, { passive: true });

    // горизонтальное колесо мыши
    track.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        track.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, { passive: false });

    // свайп мышью / пальцем
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
    };

    track.addEventListener('mousedown', e => start(e.clientX));
    window.addEventListener('mousemove', e => move(e.clientX));
    window.addEventListener('mouseup', end);

    track.addEventListener('touchstart', e => start(e.touches[0].clientX), { passive: true });
    track.addEventListener('touchmove', e => move(e.touches[0].clientX), { passive: true });
    track.addEventListener('touchend', end);

    // отменяем клики при свайпе
    track.addEventListener('click', e => {
      if (moved) e.preventDefault();
    }, true);

    // корректируем snap при изменении размеров
    const ro = new ResizeObserver(() => scrollToIndex(nearestIndex(), false));
    ro.observe(track);
  }

  // применяем ко всем оберткам .cat-wrap
  $all('.cat-wrap').forEach(initMobileCarousel);
})();
