(() => {
  // Работаем только внутри секции .consult
  const section = document.querySelector('.consult');
  if (!section) return;

  const form = section.querySelector('.consult__form');
  const nameInput = section.querySelector('#c-name');
  const phoneInput = section.querySelector('#c-phone');
  const submitBtn = section.querySelector('.consult__btn');

  // ===== Маска для телефона (только для этого поля) =====
  function formatPhone(value) {
    let input = String(value).replace(/\D/g, ""); // только цифры
    if (input === "") return "";

    if (!input.startsWith("7")) input = "7" + input;
    input = input.substring(0, 11);

    let f = "+7";
    if (input.length > 1) f += " (" + input.substring(1, Math.min(4, input.length));
    if (input.length >= 4) {
      f += ")";
      if (input.length > 4) f += " " + input.substring(4, Math.min(7, input.length));
    }
    if (input.length >= 7) f += "-" + input.substring(7, Math.min(9, input.length));
    if (input.length >= 9) f += "-" + input.substring(9, Math.min(11, input.length));
    return f;
  }

  phoneInput.addEventListener("input", () => {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  // Backspace удаляет последнюю цифру из маски корректно
  phoneInput.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
      let digits = phoneInput.value.replace(/\D/g, "");
      digits = digits.substring(0, digits.length - 1);
      phoneInput.value = formatPhone(digits);
      e.preventDefault();
    }
  });

  // ===== Отправка в Telegram (только эта форма) =====
  const TOKEN  = "8387488094:AAFnoUPls5oBcPhH4OdO5xNg_O-D7U14H58"; // <-- вставь свой токен
  const CHATID = "1115007593";            // <-- вставь свой chat_id

  let sending = false;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (sending) return;

    const name  = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (name.length < 2) {
      alert("Введите корректное имя");
      return;
    }
    if (phone.length < 18) { // формат +7 (xxx) xxx-xx-xx
      alert("Введите корректный номер телефона");
      return;
    }

    const message =
      `📩 Новая заявка (форма консультации)\n` +
      `👤 Имя: ${name}\n` +
      `📞 Телефон: ${phone}`;

    try {
      sending = true;
      submitBtn.disabled = true;

      await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHATID, text: message })
      });

      alert("Заявка успешно отправлена!");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Ошибка при отправке");
    } finally {
      sending = false;
      submitBtn.disabled = false;
    }
  });
})();
