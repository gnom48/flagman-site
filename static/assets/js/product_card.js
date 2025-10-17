(() => {
  // ===== Аккордеоны =====
  const items = document.querySelectorAll('.acc .acc-item');
  
  

  function setPanel(panel, expanded){
    if (expanded){
      panel.classList.add('is-open');
      // сначала задаём явную высоту для анимации
      panel.style.height = panel.scrollHeight + 'px';
      panel.style.opacity = '1';
    } else {
      // фикс для плавного закрытия
      panel.style.height = panel.scrollHeight + 'px';
      requestAnimationFrame(() => {
        panel.classList.remove('is-open');
        panel.style.height = '0px';
        panel.style.opacity = '0';
      });
    }
  }

  items.forEach((item) => {
    const btn   = item.querySelector('.acc-btn');
    const panel = item.querySelector('.acc-panel');
    if(!btn || !panel) return;

    // начальное состояние по aria-expanded
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    setPanel(panel, expanded);

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      setPanel(panel, !isOpen);
    });

    panel.addEventListener('transitionend', (e) => {
      if (e.propertyName !== 'height') return;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        // после открытия фиксируем auto, чтобы контент мог растягиваться
        panel.style.height = 'auto';
      }
    });
  });

  // Пересчитать высоты при ресайзе
  window.addEventListener('resize', () => {
    document.querySelectorAll('.acc .acc-item').forEach(item => {
      const btn = item.querySelector('.acc-btn');
      const panel = item.querySelector('.acc-panel');
      if (!btn || !panel) return;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen){
        panel.style.height = 'auto';
        const h = panel.scrollHeight;
        panel.style.height = h + 'px';
      }
    });
  });

  // ===== Модалка =====
  const modal    = document.getElementById('priceModal');
  const btnPrice = document.getElementById('btnPrice');
  const mClose   = document.getElementById('mClose');
  const mPhone   = document.getElementById('mPhone');
  const mForm    = document.getElementById('priceForm');
  const mName    = document.getElementById('mName');

  // Берём заголовок товара
  const productTitle =
    btnPrice?.dataset.title?.trim() ||
    document.querySelector('.p-title')?.textContent.trim() ||
    '';

  if (modal){
    const openM = ()=>{
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden','false');
      // Фокус на имя
      setTimeout(()=> mName?.focus(), 10);
    };
    const closeM = ()=>{
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden','true');
    };
    btnPrice && btnPrice.addEventListener('click', openM);
    mClose   && mClose.addEventListener('click', closeM);
    modal.addEventListener('click', (e)=>{ if(e.target===modal) closeM(); });
    window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeM(); });

    // ===== Маска телефона: +7 (XXX) XXX-XX-XX =====
    if (mPhone){
      const DIGITS_MAX = 11; // 7 + 10 цифр

      const onlyDigits = s => (s||'').replace(/\D/g,'');
      const ensure7 = d => d.startsWith('7') ? d : ('7' + d);
      const clamp11 = d => d.slice(0, DIGITS_MAX);

      function formatPhoneFromDigits(d){
        // d — только цифры, максимум 11, начинается с 7
        let out = '+7';
        const a = d.slice(1,4);     // код
        const b = d.slice(4,7);     // xxx
        const c = d.slice(7,9);     // xx
        const e = d.slice(9,11);    // xx
        if (a) out += ' (' + a;
        if (d.length >= 4) out += ')';
        if (b) out += ' ' + b;
        if (c) out += '-' + c;
        if (e) out += '-' + e;
        return out;
      }

      function digitsBeforeCaret(str, caret){
        // сколько цифр находится слева от позиции caret в текущей строке
        let cnt = 0;
        for (let i=0; i<Math.min(caret, str.length); i++){
          if (/\d/.test(str[i])) cnt++;
        }
        return cnt;
      }

      function caretPosForDigitIndex(formatted, digitIndex){
        // позиция каретки так, чтобы слева было digitIndex цифр
        if (digitIndex <= 0) {
          // после "+7"
          const i = formatted.indexOf('7');
          return i >= 0 ? i+1 : 2;
        }
        let cnt = 0;
        for (let i=0; i<formatted.length; i++){
          if (/\d/.test(formatted[i])){
            cnt++;
            if (cnt === digitIndex) return i+1;
          }
        }
        return formatted.length;
      }

      function applyMask(input, forceToEnd = false){
        const prev = input.value;
        const selStart = input.selectionStart ?? prev.length;

        // Считаем, сколько цифр было слева от каретки
        const leftDigits = digitsBeforeCaret(prev, selStart);

        // Пересобираем
        let d = onlyDigits(prev);
        d = ensure7(d);
        d = clamp11(d);
        const next = formatPhoneFromDigits(d);

        input.value = next;

        // Восстановим каретку примерно на то же число цифр слева
        let newPos = forceToEnd ? next.length : caretPosForDigitIndex(next, Math.min(leftDigits, d.length));
        input.setSelectionRange(newPos, newPos);
      }

      // Инициализация по фокусу (если поле пустое — ставим +7)
      mPhone.addEventListener('focus', ()=>{
        if (!mPhone.value.trim()){
          mPhone.value = '+7 ';
          mPhone.setSelectionRange(mPhone.value.length, mPhone.value.length);
        } else {
          applyMask(mPhone);
        }
      });

      // Основной обработчик
      mPhone.addEventListener('input', ()=>{
        applyMask(mPhone);
      });

      // Backspace/Delete: даём поработать браузеру и сразу чиним маску
      mPhone.addEventListener('keydown', (e)=>{
        // Разрешаем базовые навигационные
        const navKeys = ['ArrowLeft','ArrowRight','Home','End','Tab'];
        if (navKeys.includes(e.key)) return;

        // Разрешаем удаление/цифры
        const isDigit = /^[0-9]$/.test(e.key);
        const isEdit  = (e.key === 'Backspace' || e.key === 'Delete');

        if (!isDigit && !isEdit){
          // Запретим ввод букв и прочего
          e.preventDefault();
          return;
        }

        // Особый случай: не даём стереть ведущий +7
        if (e.key === 'Backspace'){
          const pos = mPhone.selectionStart ?? 0;
          if (pos <= 3){ // "+7 " — первые 3 символа
            e.preventDefault();
          }
        }
      });

      // Вставка буфера обмена — оставляем только цифры и форматируем
      mPhone.addEventListener('paste', (e)=>{
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        let d = clamp11(ensure7(onlyDigits(text)));
        mPhone.value = formatPhoneFromDigits(d);
        mPhone.setSelectionRange(mPhone.value.length, mPhone.value.length);
      });

      // На blur — если только "+7", очищаем поле
      mPhone.addEventListener('blur', ()=>{
        if (onlyDigits(mPhone.value).length <= 1){
          mPhone.value = '';
        }
      });
    }

    // ===== Отправка в Telegram =====
    if (mForm){
      mForm.addEventListener('submit', async (e)=>{
        e.preventDefault();

        const name  = mForm.name.value.trim();
        const phone = mForm.phone.value.trim();

        if (name.length < 2){
          alert('Введите корректное имя');
          mForm.name.focus();
          return;
        }
        // Маска формирует длину 18 символов у полного номера: "+7 (XXX) XXX-XX-XX"
        if (phone.length < 18){
          alert('Введите корректный телефон');
          mPhone?.focus();
          return;
        }

        // ⚠️ Токен лучше прятать на бэкенде; оставляю как у тебя
        const TOKEN  = "8387488094:AAFnoUPls5oBcPhH4OdO5xNg_O-D7U14H58";
        const CHATID = "1115007593";

        const msg =
          `🧾 Запрос цены\n` +
          `📦 Товар: ${productTitle}\n` +
          `👤 Имя: ${name}\n` +
          `📞 Телефон: ${phone}`;

        try{
          await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ chat_id: CHATID, text: msg })
          });
          alert('Заявка отправлена. Мы свяжемся с вами.');
          mForm.reset();
          // Сброс маски: чтобы при повторном фокусе она снова сформировалась
          if (mPhone) mPhone.value = '';
          closeM();
        }catch(err){
          console.error(err);
          alert('Ошибка при отправке. Попробуйте позже.');
        }
      });
    }
  }
})();
