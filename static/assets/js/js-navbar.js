
(() => {
  const floatNav = document.getElementById('nav-float');
  if (!floatNav) return;

  const baseNav  = document.querySelector('.glass-card .navbar');
  const isProduct = /^\/product\/\d+/.test(location.pathname);

  // 1) Контент для плавающего меню
  if (baseNav) {
    floatNav.innerHTML = baseNav.innerHTML;
  } else {
    // Фолбэк (на всякий случай для product.html)
    floatNav.innerHTML = `
      <div class="brand">flagman</div>
      <nav class="menu" aria-label="Главное меню">
        <a class="menu__item" href="/">Главная</a>
        <a class="menu__item" href="/catalog">Каталог</a>
        <a class="menu__item" href="/about">О нас</a>
        <a class="menu__item" href="/contact">Контакты</a>
      </nav>
      <div class="social">
        <a href="#" class="icon-btn" aria-label="Telegram" rel="noopener">
          <img class="icon-img" src="/static/images/telega.svg" alt="Telegram">
        </a>
        <a href="#" class="icon-btn" aria-label="VK" rel="noopener">
          <img class="icon-img" src="/static/images/vkon.svg" alt="VK">
        </a>
      </div>
    `;
  }

  // 2) Подсветка активного пункта
  const links = floatNav.querySelectorAll('.menu .menu__item');
  if (!links.length) return;

  const BASE = document.documentElement.dataset.base || '';
  const norm = (path) => {
    try {
      const u = new URL(path, location.origin);
      let p = u.pathname;
      if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length) || '/';
      p = p.replace(/\/index\.html?$/i, '/').replace(/\/+$/,'');
      return p || '/';
    } catch { return '/'; }
  };

  const current = norm(location.pathname);
  links.forEach(a => {
    const hrefPath = norm(a.getAttribute('href') || '/');
    const match =
      hrefPath === current ||
      (isProduct && hrefPath === '/catalog'); // товары → активен "Каталог"
    a.classList.toggle('is-active', match);
  });

  // 3) Для якорных ссылок (если будут)
  floatNav.querySelectorAll('.menu__item[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id) || document.querySelector(`[name="${id}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      links.forEach(l => l.classList.remove('is-active'));
      a.classList.add('is-active');
    }, { passive: true });
  });

  // 4) На product-странице делаем меню всегда видимым
  if (isProduct) {
    document.body.classList.add('page-product');
    floatNav.classList.add('is-visible');
    // На случай, если в твоём CSS появление завязано на инлайновые стили:
    floatNav.style.top = '16px';
    floatNav.style.opacity = '1';
    floatNav.style.pointerEvents = 'auto';
    floatNav.style.backdropFilter = 'blur(16px) saturate(120%)';
    floatNav.style.webkitBackdropFilter = 'blur(16px) saturate(120%)';
    floatNav.style.background = 'rgba(22,28,36,.85)';
    floatNav.style.borderColor = 'rgba(255,255,255,.12)';
    floatNav.style.boxShadow = '0 10px 24px rgba(0,0,0,.18)';
  }
})();

