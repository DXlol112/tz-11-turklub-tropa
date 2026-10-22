/* Локальный подбор маршрутов: без отправки данных и сохранения настроек. */
(() => {
  "use strict";

  const filters = document.querySelector("#trip-filters");
  if (!filters) return;
  const difficulty = document.querySelector("#trip-difficulty");
  const duration = document.querySelector("#trip-duration");
  const papers = [...document.querySelectorAll(".trip-paper")];
  const result = document.querySelector("#trip-result");
  const empty = document.querySelector("#trips-empty");

  function applyFilters() {
    let count = 0;
    papers.forEach(paper => {
      const matches = (difficulty.value === "all" || paper.dataset.difficulty === difficulty.value)
        && (duration.value === "all" || paper.dataset.days === duration.value);
      paper.hidden = !matches;
      if (matches) count += 1;
    });
    const word = count === 1 ? "маршрут" : count >= 2 && count <= 4 ? "маршрута" : "маршрутов";
    result.textContent = `${count} ${word} из ${papers.length}`;
    empty.hidden = count !== 0;
  }

  function applyHash() {
    const params = new URLSearchParams(window.location.search);
    const requestedDifficulty = params.get("difficulty");
    const requestedDays = params.get("days");
    difficulty.value = window.location.hash === "#easy" ? "easy"
      : ["easy", "moderate", "hard"].includes(requestedDifficulty) ? requestedDifficulty : "all";
    duration.value = ["1", "2", "3"].includes(requestedDays) ? requestedDays : "all";
    applyFilters();
  }

  difficulty.addEventListener("change", applyFilters);
  duration.addEventListener("change", applyFilters);
  document.querySelectorAll("[data-reset-filters]").forEach(button => {
    button.addEventListener("click", () => {
      const focusWillBeHidden = empty.contains(button);
      difficulty.value = "all";
      duration.value = "all";
      applyFilters();
      if (focusWillBeHidden) difficulty.focus({ preventScroll: true });
    });
  });
  window.addEventListener("hashchange", applyHash);
  // Синхронизирует карточки с восстановленными браузером значениями select.
  window.addEventListener("pageshow", applyFilters);
  applyHash();
  filters.hidden = false;
})();
