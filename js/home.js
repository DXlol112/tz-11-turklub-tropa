/* Подбор и альбомы работают в браузере; данные никуда не отправляются. */
(() => {
  'use strict';

  function initPicker() {
    const difficulty = document.querySelector('#home-difficulty');
    const days = document.querySelector('#home-days');
    if (!difficulty || !days) return;

    const storageKey = 'tropa.homeFilters.v1';
    const flagLinks = document.querySelectorAll('.flag-link, .static-flag');

    function validValue(select, value) {
      return [...select.options].some(option => option.value === value) ? value : 'all';
    }

    function updateFlag() {
      const params = new URLSearchParams({ difficulty: difficulty.value, days: days.value });
      flagLinks.forEach(link => {
        link.href = `trips.html?${params}`;
      });
    }

    function saveSelection() {
      updateFlag();
      try {
        localStorage.setItem(storageKey, JSON.stringify({ difficulty: difficulty.value, days: days.value }));
      } catch {
        // Если хранилище недоступно, текущий выбор всё равно передаётся через флаг.
      }
    }

    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      difficulty.value = validValue(difficulty, saved?.difficulty);
      days.value = validValue(days, saved?.days);
    } catch {
      // Повреждённая запись или запрет хранилища не мешают подбору.
    }

    difficulty.addEventListener('change', saveSelection);
    days.addEventListener('change', saveSelection);
    window.addEventListener('pageshow', updateFlag);
    updateFlag();
  }

  function node(tag, text, className) {
    const el = document.createElement(tag);
    el.textContent = text;
    if (className) el.className = className;
    return el;
  }

  function renderDepartures() {
    const data = window.TropaSchedule;
    const pages = document.querySelector('#upcoming-departures');
    if (!data || !pages) return;

    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const departures = data.departures.filter(item => item.trip_date >= iso)
      .sort((a, b) => a.trip_date.localeCompare(b.trip_date) || a.trip_id.localeCompare(b.trip_id)).slice(0, 4);

    pages.replaceChildren();
    if (!departures.length) {
      pages.append(node('p', 'Зимний сезон завершён. Новые даты уточняй у клуба.', 'home-fallback'));
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
      link.href = alternative ? `contacts.html?${new URLSearchParams({ trip_id: alternative.trip_id, trip_date: alternative.trip_date, participants: '1' })}` : 'contacts.html';
      card.append(link);
      pages.append(card);
    });
  }

  function initAlbum(album) {
    const cards = [...album.querySelectorAll('.album-pages > article')];
    const controls = album.querySelector('.album-controls');
    const counter = album.querySelector('[data-album-counter]');
    if (!cards.length) return;
    let current = 0;

    cards.forEach((card, index) => {
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'слайд');
      card.setAttribute('aria-label', `${index + 1} из ${cards.length}`);
    });

    function show(index) {
      current = (index + cards.length) % cards.length;
      cards.forEach((card, cardIndex) => {
        card.hidden = cardIndex !== current;
      });
      counter.textContent = `${current + 1} / ${cards.length}`;
      counter.setAttribute('aria-label', `${current + 1} из ${cards.length}: ${cards[current].querySelector('h3').textContent}`);
    }

    album.querySelector('[data-album-prev]').addEventListener('click', () => show(current - 1));
    album.querySelector('[data-album-next]').addEventListener('click', () => show(current + 1));
    controls.hidden = cards.length < 2;
    show(0);
  }

  initPicker();
  renderDepartures();
  document.querySelectorAll('[data-album]').forEach(initAlbum);
})();
