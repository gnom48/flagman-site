(() => {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const panel  = document.getElementById('navPanel');
  if (!nav) return;

  // ==== 1) Всегда видимая шапка на /product/<pid> ====
  const path = location.pathname;
  const forceVisible = path === '/product' || path.startsWith('/product/');

  if (forceVisible) {
    nav.classList.add('is-visible'); // всегда показываем
  } else {
    // Sentinel + IO
    const sentinel = document.createElement('div');
    sentinel.setAttribute('data-nav-sentinel', '');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;right:0;height:1px;';
    document.body.prepend(sentinel);

    const io = new IntersectionObserver((entries) => {
      const topVisible = entries[0].isIntersecting;
      if (topVisible) nav.classList.remove('is-visible');
      else nav.classList.add('is-visible');
    }, { threshold: 0 });

    io.observe(sentinel);

    // Фолбэк на скролл/ресайз
    const reveal = () => {
      const y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (y > 40) nav.classList.add('is-visible');
      else nav.classList.remove('is-visible');
    };
    reveal();
    window.addEventListener('scroll', reveal, { passive: true });
    window.addEventListener('resize', reveal);
  }

  // ==== 2) Подсветка активного пункта меню ====
  (function highlightActive() {
    const cur = location.pathname.replace(/\/+$/, ''); // без завершающих /
    const links = nav.querySelectorAll('a[href]');
    links.forEach(a => {
      const hrefPath = new URL(a.href, location.origin).pathname.replace(/\/+$/, '');
      // точное совпадение или «начинается с», кроме корня
      if (cur === hrefPath || (cur.startsWith(hrefPath) && hrefPath !== '/')) {
        a.classList.add('is-active');
      } else {
        a.classList.remove('is-active');
      }
    });
  })();

  // ==== 3) Мобильная панель ====
  const openPanel = () => {
    if (!panel || !burger) return;
    panel.hidden = false;
    requestAnimationFrame(() => {
      panel.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('body--lock');
    });
  };
  const closePanel = () => {
    if (!panel || !burger) return;
    panel.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('body--lock');
    setTimeout(() => { panel.hidden = true; }, 260);
  };

  burger?.addEventListener('click', () => {
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    expanded ? closePanel() : openPanel();
  });
  panel?.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

  const mq = window.matchMedia('(min-width: 961px)');
  mq.addEventListener?.('change', () => { if (mq.matches) closePanel(); });

  // Телепорт панели в body (если нужно)
  (function teleportPanel(){
    const p = document.getElementById('navPanel');
    if (p && p.parentElement !== document.body) document.body.appendChild(p);
  })();
})();