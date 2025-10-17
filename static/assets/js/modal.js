(() => {
  const modal   = document.getElementById('mainModal');
  const mClose  = document.getElementById('mClose');
  const mPhone  = document.getElementById('mPhone');
  const mForm   = document.getElementById('mainForm');
  const mName   = document.getElementById('mName');
  const btnPrice = document.getElementById('btnPrice'); // <-- ваш триггер

  if (!modal) return;

  // Открыть/закрыть
  const openM = (e) => {
    e?.preventDefault();                 // <a> не должен навигироваться вверх
    modal.hidden = false;                // снимаем hidden
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('body--lock');
    setTimeout(() => mName?.focus(), 80);
  };
  const closeM = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('body--lock');
    // Подождём анимацию и снова спрячем из потока
    setTimeout(() => { modal.hidden = true; }, 300);
  };

  // Триггеры
  btnPrice?.addEventListener('click', openM);
  mClose?.addEventListener('click', closeM);
  modal.addEventListener('click', (e)=>{ if (e.target === modal) closeM(); });
  window.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeM(); });

  const navCtas = document.querySelectorAll('a.nav__cta, a[href="#consult"]');
  navCtas.forEach(a => a.addEventListener('click', openM));

  // 2) делегирование (если кнопки появятся динамически)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#consult"]');
    if (!a) return;
    openM(e); // preventDefault уже внутри openM
  });

  // Маска телефона (ваша логика, компактная версия)
  if (mPhone){
    const digits = s => (s||'').replace(/\D/g,'');
    const fmt = d => {
      d = d.startsWith('7') ? d : '7'+d;
      d = d.slice(0,11);
      let out = '+7';
      const a=d.slice(1,4), b=d.slice(4,7), c=d.slice(7,9), e=d.slice(9,11);
      if(a) out+=` (${a}`; if(d.length>=4) out+=')';
      if(b) out+=` ${b}`; if(c) out+=`-${c}`; if(e) out+=`-${e}`;
      return out;
    };
    mPhone.addEventListener('focus',()=>{ if(!mPhone.value.trim()) mPhone.value = '+7 '; });
    mPhone.addEventListener('input',()=>{ const d=digits(mPhone.value); mPhone.value = fmt(d); });
    mPhone.addEventListener('keydown',e=>{
      const nav=['ArrowLeft','ArrowRight','Home','End','Tab']; if(nav.includes(e.key)) return;
      const ok=/^[0-9]$/.test(e.key)||['Backspace','Delete'].includes(e.key); if(!ok) e.preventDefault();
      if(e.key==='Backspace' && (mPhone.selectionStart??0)<=3) e.preventDefault();
    });
    mPhone.addEventListener('paste',e=>{
      e.preventDefault(); const t=(e.clipboardData||window.clipboardData).getData('text');
      mPhone.value = fmt(digits(t));
    });
    mPhone.addEventListener('blur',()=>{ if(digits(mPhone.value).length<=1) mPhone.value=''; });
  }

  // Отправка в Telegram
  if (mForm){
    mForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const name  = mForm.name.value.trim();
      const phone = mForm.phone.value.trim();
      if (name.length < 2){ alert('Введите корректное имя'); mForm.name.focus(); return; }
      if (phone.length < 18){ alert('Введите корректный телефон'); mPhone?.focus(); return; }

      const TOKEN  = "8387488094:AAFnoUPls5oBcPhH4OdO5xNg_O-D7U14H58";
      const CHATID = "1115007593";
      const msg = `📩 *Новая заявка*\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n🕓 ${new Date().toLocaleString()}`;

      try{
        await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`,{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ chat_id: CHATID, text: msg, parse_mode:'Markdown' })
        });
        alert('✅ Заявка отправлена! Мы скоро свяжемся с вами.');
        mForm.reset(); if (mPhone) mPhone.value='';
        closeM();
      }catch(err){
        console.error(err);
        alert('⚠️ Ошибка отправки. Попробуйте позже.');
      }
    });
  }
})();