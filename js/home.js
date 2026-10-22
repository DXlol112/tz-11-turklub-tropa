/* Ближайшие выезды используют общее расписание; данные никуда не отправляются. */
(() => {
  'use strict';
  const data = window.TropaSchedule;
  const grid = document.querySelector('#upcoming-departures');
  if (!data || !grid) return;
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const departures = data.departures.filter(item => item.trip_date >= iso)
    .sort((a, b) => a.trip_date.localeCompare(b.trip_date) || a.trip_id.localeCompare(b.trip_id)).slice(0, 4);
  function node(tag, text, className) {
    const el = document.createElement(tag);
    el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  grid.replaceChildren();
  if (!departures.length) {
    grid.append(node('p', 'Зимний сезон завершён. Новые даты уточняй у клуба.', 'home-fallback'));
  }
  departures.forEach(item => {
    const route = data.route(item.trip_id);
    const card = node('article', '', 'story-card home-paper');
    card.append(node('p', data.range(item), 'home-date'), node('h3', route.name),
      node('p', `${route.days} ${route.days === 1 ? 'день' : 'дня'} · ${route.difficulty}`),
      node('p', data.money(route.price), 'home-price'),
      node('p', item.seats_left ? `Свободных мест: ${item.seats_left}` : 'Мест нет', item.seats_left ? 'seats-available' : 'seats-full'));
    const alternative = item.seats_left ? item : data.departures.filter(other => other.trip_id === item.trip_id && other.trip_date >= iso && other.seats_left > 0)
      .sort((a, b) => Math.abs(new Date(a.trip_date) - new Date(item.trip_date)) - Math.abs(new Date(b.trip_date) - new Date(item.trip_date)))[0];
    const link = node('a', item.seats_left ? 'Выбрать выезд ↗' : alternative ? `Другая дата: ${data.formatDate(alternative.trip_date)} ↗` : 'Связаться с клубом ↗', 'text-link');
    link.href = alternative ? `contacts.html?${new URLSearchParams({trip_id: alternative.trip_id, trip_date: alternative.trip_date, participants: '1'})}` : 'contacts.html';
    card.append(link);
    grid.append(card);
  });
})();
