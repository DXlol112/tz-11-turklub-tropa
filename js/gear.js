/* Только локальный интерфейс. Отметки и расчёты никуда не отправляются. */
(() => {
  "use strict";
  const form = document.querySelector("#rental-form");
  if (!form) return;
  const schedule = window.TropaSchedule;
  const trip = document.querySelector("#gear-trip");
  const days = document.querySelector("#rental-days");
  const checks = [...document.querySelectorAll('input[name="gear"]')];
  const screen = document.querySelector("#calculator-screen");
  const value = document.querySelector("#screen-value");
  const detail = document.querySelector("#screen-detail");
  const label = document.querySelector("#screen-label");
  const promo = document.querySelector("#promo");
  const error = document.querySelector("#calc-error");
  const copyStatus = document.querySelector("#copy-status");
  let copyAttempt = 0;

  schedule.routes.forEach(route => {
    const option = document.createElement("option");
    option.value = route.id;
    option.textContent = `${route.name} · ${schedule.money(route.price)}`;
    trip.append(option);
  });

  // Слагаемое каждого предмета уже включает всё выбранное число суток.
  function calculate() {
    const duration = Number(days.value);
    const selected = checks.filter(input => input.checked);
    const base = schedule.route(trip.value)?.price || 0;
    const daily = selected.reduce((sum, input) => sum + Number(input.dataset.rate), 0);
    const rental = daily * duration;
    const total = base + rental;
    const valid = days.value !== "" && days.validity.valid && Number.isSafeInteger(duration) && duration >= 1 && Number.isSafeInteger(total);
    return { selected, base, rental, total, valid, terms: [...(base ? [base] : []), ...selected.map(input => Number(input.dataset.rate) * duration)] };
  }

  function showError(message) {
    error.textContent = message;
    error.hidden = !message;
    days.setAttribute("aria-invalid", String(Boolean(message)));
  }

  function writeExpression(terms) {
    value.replaceChildren();
    (terms.length ? terms : [0]).forEach((number, index) => {
      const term = document.createElement("span");
      term.className = "screen-term";
      if (index) {
        const plus = document.createElement("span");
        plus.className = "screen-plus";
        plus.textContent = "+ ";
        term.append(plus);
      }
      term.append(String(number));
      value.append(term);
      if (index < terms.length - 1) value.append(" ");
    });
  }

  function render() {
    copyAttempt += 1;
    const result = calculate();
    promo.hidden = true;
    copyStatus.textContent = "";
    screen.classList.remove("is-result");
    label.textContent = "ТВОЙ РАСЧЁТ";
    document.querySelector("#gear-count").textContent = `Выбрано: ${result.selected.length} из ${checks.length}`;
    checks.forEach(input => document.querySelector(`[data-note="${input.value}"]`).classList.toggle("is-selected", input.checked));
    showError(result.valid ? "" : "Укажи целое число суток от 1. Значение должно позволять точно рассчитать сумму.");
    if (!result.valid) {
      value.textContent = "—";
      detail.textContent = "Проверь количество суток";
      return;
    }
    writeExpression(result.terms);
    detail.textContent = result.selected.length || result.base
      ? `Поход: ${schedule.money(result.base)} · Аренда: ${schedule.money(result.rental)}`
      : "Выбери поход или начни со снаряжения";
  }

  checks.forEach(input => input.addEventListener("change", render));
  trip.addEventListener("change", () => {
    const route = schedule.route(trip.value);
    if (route) days.value = route.days;
    render();
  });
  days.addEventListener("input", render);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const result = calculate();
    if (!result.valid) {
      render();
      days.focus();
      return;
    }
    value.textContent = String(result.total);
    label.textContent = "ИТОГО";
    screen.classList.add("is-result");
    promo.hidden = false;
  });

  document.querySelector("#copy-promo").addEventListener("click", async () => {
    const attempt = ++copyAttempt;
    try {
      await navigator.clipboard.writeText("SNOW300");
      if (attempt === copyAttempt) copyStatus.textContent = "Промокод скопирован";
    } catch {
      if (attempt !== copyAttempt) return;
      const range = document.createRange();
      range.selectNodeContents(document.querySelector("#promo-code"));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      copyStatus.textContent = "Код выделен. Нажми Ctrl+C или выбери «Копировать».";
    }
  });

  // Восстановленные браузером флажки не должны расходиться с дисплеем.
  window.addEventListener("pageshow", render);
  render();
})();
