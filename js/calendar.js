/* Календарь и выбор выезда. */
(() => {
  "use strict";
  const data = window.TropaSchedule;
  const calendar = document.querySelector("#calendar-app");
  if (!data || !calendar) return;
  const params = new URLSearchParams(location.search);
  const filter = document.querySelector("#calendar-route");
  const grid = document.querySelector("#calendar-days");
  const sheet = document.querySelector("#calendar-sheet");
  const title = document.querySelector("#calendar-month");
  const panel = document.querySelector("#day-details");
  const content = document.querySelector("#day-content");
  const panelTitle = document.querySelector("#day-title");
  const previous = document.querySelector("#month-previous");
  const next = document.querySelector("#month-next");
  const count = data.validCount(params.get("participants")) ? Number(params.get("participants")) : 1;
  const selected = data.departure(params.get("trip_id"), params.get("trip_date"));
  let month = selected?.trip_date.startsWith("2027-01") ? 1 : 0;
  let trigger = null;
  let changing = false;
  let closing = false;
  let pinned = false;
  filter.value = data.route(params.get("trip_id")) ? params.get("trip_id") : "";
  document.querySelector("#calendar-count").textContent = `Мест нужно: ${count}. Выберите день с отметкой.`;

  function formUrl(item) {
    const query = new URLSearchParams({ participants: String(count) });
    const id = item?.trip_id || filter.value;
    if (data.route(id)) query.set("trip_id", id);
    if (item) query.set("trip_date", item.trip_date);
    return `contacts.html?${query}`;
  }
  // Отмена возвращает исходную дату; смена фильтра не меняет черновик формы.
  const backQuery = new URLSearchParams();
  if (data.route(params.get("trip_id"))) backQuery.set("trip_id", params.get("trip_id"));
  backQuery.set("participants", String(count));
  if (selected) backQuery.set("trip_date", selected.trip_date);
  document.querySelector("#calendar-back").href = `contacts.html?${backQuery}`;

  function hideDetails(restoreFocus = false) {
    closing = true;
    if (trigger) trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus && trigger?.isConnected) trigger.focus({ preventScroll: true });
    panel.hidden = true;
    trigger = null;
    pinned = false;
    closing = false;
  }
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function showDetails(button, pin = false) {
    if (closing || changing || !button.dataset.date) return;
    if (trigger === button && !panel.hidden) { pinned = pinned || pin; return; }
    hideDetails();
    pinned = pin;
    trigger = button;
    trigger.setAttribute("aria-expanded", "true");
    const date = button.dataset.date;
    panelTitle.textContent = data.formatDate(date);
    content.replaceChildren();
    const trips = data.departures.filter(item => item.trip_date === date && (!filter.value || item.trip_id === filter.value));
    if (!trips.length) content.append(element("p", "В этот день выездов нет.", "day-empty"));
    trips.forEach(item => {
      const route = data.route(item.trip_id);
      const card = element("article", "", "departure-card");
      card.append(element("h3", route.name));
      card.append(element("p", `${data.range(item)} · ${route.days} ${route.days === 1 ? "день" : "дня"} · ${route.difficulty}`, "departure-facts"));
      card.append(element("p", `${data.money(route.price)} за участника`, "departure-price"));
      const available = item.seats_left >= count;
      card.append(element("p", item.seats_left === 0 ? "Мест нет" : `Свободных мест: ${item.seats_left}${available ? "" : ` · недостаточно для ${count} участников`}`, available ? "seats-available" : "seats-full"));
      if (available) {
        const link = element("a", "Выбрать этот выезд ↗", "departure-select");
        link.href = formUrl(item);
        link.dataset.event = "date_select cta_click";
        link.dataset.tripId = item.trip_id;
        link.dataset.tripDate = item.trip_date;
        link.dataset.seatsLeft = item.seats_left;
        link.dataset.buttonName = "select_departure";
        link.dataset.pageSection = "calendar";
        card.append(link);
      } else {
        const other = data.nearest(item, count);
        if (other) {
          const alternative = element("button", `Другая дата: ${data.formatDate(other.trip_date)} →`, "departure-alternative");
          alternative.type = "button";
          alternative.addEventListener("click", event => {
            event.stopPropagation();
            filter.value = other.trip_id;
            month = other.trip_date.startsWith("2027-01") ? 1 : 0;
            render();
            const day = grid.querySelector(`[data-date="${other.trip_date}"]`);
            day.focus();
            showDetails(day, true);
            day.scrollIntoView({ block: "nearest", behavior: "instant" });
          });
          card.append(alternative);
        } else card.append(element("p", "Подходящих дат в этом сезоне больше нет. Свяжитесь с клубом."));
      }
      content.append(card);
    });
    panel.hidden = false;
    // На широком экране карточка привязана к строке дня, на узком — в потоке под сеткой.
    panel.style.top = `${button.offsetTop + button.offsetHeight + 8}px`;
  }

  function render() {
    hideDetails();
    const year = month === 0 ? 2026 : 2027;
    const monthIndex = month === 0 ? 11 : 0;
    title.textContent = month === 0 ? "Декабрь 2026" : "Январь 2027";
    previous.disabled = month === 0;
    next.disabled = month === 1;
    grid.replaceChildren();
    const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
    for (let i = 0; i < offset; i++) {
      const blank = element("span", "", "calendar-blank");
      blank.setAttribute("aria-hidden", "true");
      grid.append(blank);
    }
    for (let day = 1; day <= 31; day++) {
      const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const trips = data.departures.filter(item => item.trip_date === date && (!filter.value || item.trip_id === filter.value));
      const button = element("button", "", "calendar-day");
      button.type = "button";
      button.dataset.date = date;
      button.append(element("span", String(day)));
      const available = trips.some(item => item.seats_left >= count);
      const note = trips.length ? available ? `${trips.length} ${trips.length === 1 ? "выезд" : "выезда"}` : trips.every(item => item.seats_left === 0) ? "Мест нет" : "Мало мест" : "";
      const marker = element("small", note, "day-marker");
      marker.setAttribute("aria-hidden", "true");
      button.append(marker);
      button.classList.toggle("has-trips", trips.length > 0);
      button.classList.toggle("is-full", trips.length > 0 && !available);
      button.classList.toggle("is-selected", selected?.trip_date === date && (!filter.value || selected.trip_id === filter.value));
      button.setAttribute("aria-label", `${data.formatDate(date)}: ${trips.length ? note : "выездов нет"}`);
      button.setAttribute("aria-controls", "day-details");
      button.setAttribute("aria-expanded", "false");
      button.addEventListener("mouseenter", () => { if (!pinned && matchMedia("(hover: hover)").matches) showDetails(button); });
      button.addEventListener("focus", () => showDetails(button, true));
      button.addEventListener("click", event => {
        showDetails(button, true);
        if (event.detail === 0) document.querySelector("#day-close").focus();
      });
      button.addEventListener("keydown", event => {
        if (event.key === "Tab" && !event.shiftKey && !panel.hidden) {
          event.preventDefault();
          document.querySelector("#day-close").focus();
          return;
        }
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          const move = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
          const target = event.key === "Home" ? 1 : event.key === "End" ? 31 : Math.max(1, Math.min(31, day + move));
          grid.querySelectorAll("button")[target - 1].focus();
        }
      });
      grid.append(button);
    }
  }

  async function turnPage(direction) {
    if (changing || month + direction < 0 || month + direction > 1) return;
    changing = true;
    hideDetails();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) await sheet.animate([{ transform: "rotateX(0deg)", opacity: 1 }, { transform: `rotateX(${direction * -80}deg)`, opacity: .25 }], { duration: 180, easing: "ease-in", fill: "forwards" }).finished;
    month += direction;
    render();
    sheet.getAnimations().forEach(animation => animation.cancel());
    if (!reduce) await sheet.animate([{ transform: `rotateX(${direction * 80}deg)`, opacity: .25 }, { transform: "rotateX(0deg)", opacity: 1 }], { duration: 220, easing: "ease-out" }).finished;
    changing = false;
    (direction > 0 ? previous : next).focus({ preventScroll: true });
  }
  previous.addEventListener("click", () => turnPage(-1));
  next.addEventListener("click", () => turnPage(1));
  filter.addEventListener("change", render);
  document.querySelector("#day-close").addEventListener("click", () => hideDetails(true));
  document.addEventListener("keydown", event => { if (event.key === "Escape" && !panel.hidden) { event.preventDefault(); hideDetails(true); } });
  document.addEventListener("click", event => { if (!panel.contains(event.target) && !grid.contains(event.target)) hideDetails(); });
  document.addEventListener("focusin", event => { if (!panel.contains(event.target) && !grid.contains(event.target)) hideDetails(); });
  render();
  calendar.hidden = false;
  document.querySelector("#schedule-fallback").hidden = true;
})();
