/* Фиксированное учебное расписание. Цены и сложность — из ТЗ-11/2026. */
(() => {
  "use strict";
  const routes = [
    { id: "icefalls", name: "Ледяные водопады", days: 1, difficulty: "Легко", price: 3500, dates: ["2026-12-05", "2026-12-19", "2027-01-09", "2027-01-23"] },
    { id: "snowshoes", name: "Снегоступы для начинающих", days: 1, difficulty: "Легко", price: 2900, dates: ["2026-12-06", "2026-12-20", "2027-01-10", "2027-01-24"] },
    { id: "sunrise", name: "Рассвет на Седой горе", days: 1, difficulty: "Средне", price: 3900, dates: ["2026-12-12", "2026-12-26", "2027-01-16", "2027-01-30"] },
    { id: "plateau", name: "Снежное плато", days: 2, difficulty: "Средне", price: 7900, dates: ["2026-12-12", "2026-12-26", "2027-01-09", "2027-01-23"] },
    { id: "traverse", name: "Лыжный траверс", days: 3, difficulty: "Сложно", price: 11500, dates: ["2026-12-04", "2026-12-18", "2027-01-15", "2027-01-29"] },
    { id: "newyear_hut", name: "Новогодняя изба", days: 3, difficulty: "Легко", price: 15900, dates: ["2026-12-31"] }
  ];
  const departures = routes.flatMap(route => route.dates.map((date, i) => ({ trip_id: route.id, trip_date: date, seats_left: route.id === "newyear_hut" ? 8 : [0, 6, 12, 4][i] })));
  const route = id => routes.find(item => item.id === id);
  const departure = (id, date) => departures.find(item => item.trip_id === id && item.trip_date === date);
  const validCount = value => /^\d+$/.test(String(value)) && Number(value) >= 1 && Number(value) <= 6;
  const dateObject = iso => new Date(`${iso}T12:00:00`);
  const formatDate = iso => iso.split("-").reverse().join(".");
  const endDate = item => {
    const date = dateObject(item.trip_date);
    date.setDate(date.getDate() + route(item.trip_id).days - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };
  const range = item => route(item.trip_id).days === 1 ? formatDate(item.trip_date) : `${formatDate(item.trip_date)} — ${formatDate(endDate(item))}`;
  const money = value => new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
  const nearest = (item, count) => departures.filter(other => other.trip_id === item.trip_id && other.trip_date !== item.trip_date && other.seats_left >= count)
    .sort((a, b) => Math.abs(dateObject(a.trip_date) - dateObject(item.trip_date)) - Math.abs(dateObject(b.trip_date) - dateObject(item.trip_date)) || b.trip_date.localeCompare(a.trip_date))[0];
  window.TropaSchedule = { routes, departures, route, departure, validCount, formatDate, range, money, nearest, draftKey: "tropa.bookingDraft.v1" };
})();
