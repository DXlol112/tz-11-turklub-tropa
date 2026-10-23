/* Форма работает только в браузере: адрес приёмника пока не задан. */
(() => {
  "use strict";

  const form = document.querySelector("#booking-form");
  const data = window.TropaSchedule;
  if (!form || !data) return;
  const fields = [...form.querySelectorAll("[data-validate]")];
  const trip = form.elements.trip_id;
  const participants = form.elements.participants;
  const dateField = form.elements.trip_date;
  const calendarLink = document.querySelector("#choose-date");
  const draftNotice = document.querySelector("#draft-notice");
  let selectedDate = "";
  let proceedWithoutDraft = false;
  const submit = document.querySelector("#booking-submit");
  const status = document.querySelector("#booking-status");
  const priceOutput = document.querySelector("#booking-price");
  const sumOutput = document.querySelector("#booking-sum");
  const depositOutput = document.querySelector("#booking-deposit");

  function updateTotal() {
    const price = data.route(trip.value)?.price;
    const count = Number(participants.value);
    const validCount = Number.isInteger(count) && count >= 1 && count <= 6;
    priceOutput.textContent = price ? data.money(price) : "—";
    sumOutput.textContent = price && validCount ? data.money(price * count) : "—";
    depositOutput.textContent = price && validCount ? data.money(price * count * .3) : "—";
  }

  function dateError() {
    const departure = data.departure(trip.value, selectedDate);
    if (!departure) return "Выберите дату выезда в календаре.";
    if (!data.validCount(participants.value)) return "Сначала укажите от 1 до 6 участников.";
    if (departure.seats_left < Number(participants.value)) return "На эту дату недостаточно мест. Выберите другой выезд.";
    return "";
  }

  function updateCalendarLink() {
    const query = new URLSearchParams();
    if (data.route(trip.value)) query.set("trip_id", trip.value);
    if (data.validCount(participants.value)) query.set("participants", participants.value);
    if (data.departure(trip.value, selectedDate)) query.set("trip_date", selectedDate);
    calendarLink.href = `calendar.html?${query}`;
  }

  function restoreDraft() {
    try {
      const raw = sessionStorage.getItem(data.draftKey);
      if (!raw) return false;
      sessionStorage.removeItem(data.draftKey);
      const draft = JSON.parse(raw);
      if (!draft || typeof draft !== "object") return false;
      fields.forEach(field => {
        if (field.type === "checkbox") field.checked = draft[field.name] === true;
        else if (typeof draft[field.name] === "string") field.value = draft[field.name].slice(0, 200);
      });
      selectedDate = typeof draft.selectedDate === "string" ? draft.selectedDate : "";
      if (!data.departure(trip.value, selectedDate)) selectedDate = "";
      dateField.value = selectedDate ? data.formatDate(selectedDate) : "";
      return true;
    } catch { return false; }
  }

  function clearDraft() {
    try { sessionStorage.removeItem(data.draftKey); } catch { /* Хранилище может быть запрещено. */ }
  }

  function errorFor(field) {
    const value = field.value.trim();
    switch (field.name) {
      case "trip_id": return data.route(trip.value) ? "" : "Выберите маршрут.";
      case "trip_date": return dateError();
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
      (invalid[0] === dateField ? calendarLink : invalid[0]).focus();
      return;
    }
    // Подключение приёмника заявок — отдельный этап. Здесь нет сетевой отправки.
    clearDraft();
    window.location.href = "thanks.html";
  }

  restoreDraft();
  const params = new URLSearchParams(window.location.search);
  if (params.has("trip_id")) trip.value = data.route(params.get("trip_id")) ? params.get("trip_id") : "";
  if (params.has("participants")) participants.value = data.validCount(params.get("participants")) ? params.get("participants") : "1";
  if (params.has("trip_date")) selectedDate = data.departure(trip.value, params.get("trip_date")) ? params.get("trip_date") : "";
  if (!data.departure(trip.value, selectedDate)) selectedDate = "";
  dateField.value = selectedDate ? data.formatDate(selectedDate) : "";
  if (selectedDate && dateError()) validate(dateField);
  fields.forEach(field => {
    field.addEventListener("input", () => {
      status.textContent = "";
      if (field === trip) {
        selectedDate = "";
        dateField.value = "";
        dateField.removeAttribute("aria-invalid");
        document.querySelector("#booking-date-error").textContent = "";
      }
      if (field.hasAttribute("aria-invalid")) validate(field);
      if (field === trip || field === participants) {
        updateTotal();
        updateCalendarLink();
        if (selectedDate) validate(dateField);
      }
    });
  });
  calendarLink.addEventListener("click", event => {
    if (!data.validCount(participants.value)) {
      event.preventDefault();
      validate(participants);
      participants.focus();
      return;
    }
    updateCalendarLink();
    // Возврат браузером должен открыть текущий выбор, а не старые параметры входа.
    const returnUrl = new URL(calendarLink.href);
    returnUrl.pathname = returnUrl.pathname.replace(/calendar\.html$/, "contacts.html");
    try { history.replaceState(null, "", returnUrl.href); } catch { /* Некоторые file:// окружения запрещают изменение history. */ }
    try {
      const draft = { selectedDate };
      fields.forEach(field => { draft[field.name] = field.type === "checkbox" ? field.checked : field.value; });
      sessionStorage.setItem(data.draftKey, JSON.stringify(draft));
    } catch {
      if (!proceedWithoutDraft) {
        event.preventDefault();
        draftNotice.hidden = false;
        draftNotice.textContent = "Браузер не разрешает сохранить черновик. После календаря имя и контакты потребуется заполнить заново. Нажмите «Выбрать дату» ещё раз, чтобы продолжить.";
        proceedWithoutDraft = true;
      }
    }
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    checkForm();
  });
  submit.addEventListener("click", checkForm);
  window.addEventListener("pageshow", event => {
    if (!event.persisted) return;
    restoreDraft();
    updateTotal();
    updateCalendarLink();
  });
  updateCalendarLink();
  updateTotal();
  submit.disabled = false;
})();
