/* ТЗ-11/2026: метки сохраняются на всех страницах до отправки формы. */
(() => {
  "use strict";
  const params = new URLSearchParams(window.location.search);
  const defaults = { utm_source: "direct", utm_medium: "none", utm_campaign: "not_set", utm_content: "not_set" };
  let saved = {};
  try { saved = JSON.parse(sessionStorage.getItem("tropa.utm.v1")) || {}; } catch { /* Используем текущий адрес. */ }
  // Новый размеченный переход заменяет предыдущий источник целиком.
  const tagged = Object.keys(defaults).some(key => params.has(key));
  const utm = {};
  Object.keys(defaults).forEach(key => {
    const value = tagged ? params.get(key) : saved[key];
    utm[key] = typeof value === "string" && value.trim() ? value.trim() : defaults[key];
  });
  try { sessionStorage.setItem("tropa.utm.v1", JSON.stringify(utm)); } catch { /* Private mode может запретить хранилище. */ }
  window.TropaUtm = utm;

  const output = document.querySelector("#request-number");
  if (output) {
    const id = params.get("request_id") || "";
    if (/^REQ-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      output.textContent = id;
      output.setAttribute("aria-label", "Номер заявки " + id);
      document.querySelector("#request-caption").textContent = "Сохраните номер и назовите его при обращении в клуб.";
      document.querySelector("#request-notice").textContent = "Спасибо! Ваша заявка отправлена. Свяжитесь с клубом для подтверждения выезда.";
    }
  }
})();

/* Существующий интерфейс выбора маршрута, календаря и расчёта стоимости. */
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
  const requestField = form.elements.request_id;
  let sending = false;
  let completed = false;
  try { requestField.value = sessionStorage.getItem("tropa.pendingRequest.v1") || ""; } catch { /* ID останется в форме. */ }
  if (!/^REQ-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestField.value)) requestField.value = "REQ-" + crypto.randomUUID();
  try { sessionStorage.setItem("tropa.pendingRequest.v1", requestField.value); } catch { /* Повтор в этой вкладке сохраняет ID. */ }
  Object.entries(window.TropaUtm).forEach(([key, value]) => { form.elements[key].value = value; });

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

  async function checkForm() {
    if (sending || completed) return;
    status.textContent = "";
    const invalid = fields.filter(field => !validate(field));
    if (invalid.length) {
      status.textContent = "Проверьте отмеченные поля.";
      (invalid[0] === dateField ? calendarLink : invalid[0]).focus();
      return;
    }
    const endpoint = form.dataset.endpoint;
    if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(endpoint)) {
      status.textContent = "Приём заявок ещё не подключён. Свяжитесь с клубом по контактам ниже.";
      return;
    }
    const payload = new URLSearchParams(new FormData(form));
    payload.set("trip_date", selectedDate);
    payload.set("phone", form.elements.phone.value.replace(/[\s()-]/g, ""));
    payload.set("name", form.elements.name.value.trim());
    payload.set("email", form.elements.email.value.trim());
    sending = true;
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    status.textContent = "Отправляем заявку…";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      // URLSearchParams: обычный POST без CORS preflight; ответ JSON обязательно читается.
      const response = await fetch(endpoint, { method: "POST", body: payload, signal: controller.signal, credentials: "omit", redirect: "follow" });
      if (!response.ok) throw new Error("Сервис временно недоступен. Повторите попытку с тем же номером заявки.");
      const result = await response.json();
      if (result.ok !== true) {
        const field = fields.find(item => item.name === result.field);
        if (field) {
          field.setAttribute("aria-invalid", "true");
          document.querySelector(`#${field.id}-error`).textContent = result.error || "Проверьте поле.";
          (field === dateField ? calendarLink : field).focus();
        }
        throw new Error(result.error || "Не удалось отправить заявку. Попробуйте ещё раз.");
      }
      if (result.request_id !== requestField.value) throw new Error("Приёмник вернул другой номер заявки. Свяжитесь с клубом.");
      completed = true;
      document.dispatchEvent(new CustomEvent("booking_result", { detail: {
        ok: true, trip_id: payload.get("trip_id"), participants: payload.get("participants"), lead_source: payload.get("utm_source")
      } }));
      clearDraft();
      try { sessionStorage.removeItem("tropa.pendingRequest.v1"); } catch { /* Номер уже подтверждён сервером. */ }
      status.textContent = "Заявка принята. Номер: " + result.request_id;
      window.location.href = "thanks.html?request_id=" + encodeURIComponent(result.request_id);
    } catch (error) {
      status.textContent = error.name === "AbortError" || error instanceof TypeError
        ? "Подтверждение не получено. Проверьте интернет и повторите отправку с тем же номером: " + requestField.value
        : error.message;
      document.dispatchEvent(new CustomEvent("booking_result", { detail: { ok: false } }));
    } finally {
      clearTimeout(timeout);
      sending = false;
      submit.disabled = completed;
      form.removeAttribute("aria-busy");
    }
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
