/* Форма работает только в браузере: адрес приёмника пока не задан. */
(() => {
  "use strict";

  const form = document.querySelector("#booking-form");
  if (!form) return;
  const fields = [...form.querySelectorAll("[data-validate]")];
  const trip = form.elements.trip_id;
  const participants = form.elements.participants;
  const submit = document.querySelector("#booking-submit");
  const status = document.querySelector("#booking-status");
  const currency = new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });

  function updateTotal() {
    const price = Number(trip.selectedOptions[0]?.dataset.price);
    const count = Number(participants.value);
    const validCount = Number.isInteger(count) && count >= 1 && count <= 6;
    document.querySelector("#booking-price").textContent = price ? currency.format(price) : "—";
    document.querySelector("#booking-sum").textContent = price && validCount ? currency.format(price * count) : "—";
    document.querySelector("#booking-deposit").textContent = price && validCount ? currency.format(price * count * .3) : "—";
  }

  function validDate(value) {
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
    if (!match) return false;
    const [, day, month, year] = match.map(Number);
    if (year < 1000) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  function errorFor(field) {
    const value = field.value.trim();
    switch (field.name) {
      case "trip_id": return trip.selectedOptions[0]?.dataset.price ? "" : "Выберите маршрут.";
      case "trip_date": return validDate(value) ? "" : "Укажите существующую дату в формате ДД.ММ.ГГГГ.";
      case "participants": return /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 6 ? "" : "Укажите от 1 до 6 участников.";
      case "name": return value.length >= 2 && value.length <= 60 ? "" : "Введите имя длиной от 2 до 60 символов.";
      case "phone": return /^[+\d\s()-]+$/.test(value) && /^\+7\d{10}$/.test(value.replace(/[\s()-]/g, "")) ? "" : "Введите номер: +7 и 10 цифр.";
      case "email": return !value || (!field.validity.typeMismatch && value.length <= 200) ? "" : "Проверьте адрес электронной почты.";
      case "consent": return field.checked ? "" : "Подтвердите согласие на обработку данных.";
      case "age_consent": return field.checked ? "" : "Подтвердите условие участия по возрасту.";
      default: return "";
    }
  }

  function validate(field) {
    const message = errorFor(field);
    document.querySelector(`#${field.id}-error`).textContent = message;
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
    return !message;
  }

  function checkForm() {
    status.textContent = "";
    const invalid = fields.filter(field => !validate(field));
    if (invalid.length) {
      status.textContent = "Проверьте отмеченные поля.";
      invalid[0].focus();
      return;
    }
    // Подключение приёмника заявок — отдельный этап. Здесь нет сетевой отправки.
    status.textContent = "Отправка заявок пока недоступна. Свяжитесь с клубом";
  }

  const requested = new URLSearchParams(window.location.search).get("trip_id");
  trip.value = [...trip.options].some(option => option.value === requested) ? requested : "";
  fields.forEach(field => {
    field.addEventListener("input", () => {
      status.textContent = "";
      if (field.hasAttribute("aria-invalid")) validate(field);
      if (field === trip || field === participants) updateTotal();
    });
    field.addEventListener("change", () => {
      status.textContent = "";
      if (field.hasAttribute("aria-invalid")) validate(field);
      if (field === trip || field === participants) updateTotal();
    });
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    checkForm();
  });
  submit.addEventListener("click", checkForm);
  window.addEventListener("pageshow", updateTotal);
  updateTotal();
  submit.disabled = false;
})();
