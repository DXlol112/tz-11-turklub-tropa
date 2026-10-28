// 1. page_view — автоматически собирает GA4.
// 2. scroll — автоматически собирает GA4.
// 3. click — автоматически собирает GA4.
// 4. file_download — автоматически собирает GA4.
// 5. form_start — автоматически собирает GA4.
// 6. form_submit — автоматически собирает GA4.

// 7. generate_lead — подтверждённая сервером заявка.
// form.js передаёт только подтверждённый ответ приёмника через booking_result.
document.addEventListener("booking_result", event => {
  if (event.detail.ok !== true || typeof gtag !== "function") return;
  gtag("event", "generate_lead", {
    lead_trip_id: event.detail.trip_id.slice(0, 100),
    participants: Number(event.detail.participants),
    lead_source: (event.detail.lead_source || "website").slice(0, 100)
  });
});

// 8. cta_click — клик по кнопке заявки.
document.addEventListener("click", event => {
  const button = event.target.closest('[data-event~="cta_click"]');
  if (!button) return;
  gtag("event", "cta_click", {
    button_name: button.dataset.buttonName,
    page_section: button.dataset.pageSection
  });
});

// 9. trip_filter — изменение или сброс фильтров маршрутов.
{
  const difficulty = document.querySelector("#home-difficulty, #trip-difficulty");
  const days = document.querySelector("#home-days, #trip-duration");
  const filters = document.querySelectorAll("#home-difficulty, #home-days, #trip-difficulty, #trip-duration, [data-reset-filters]");
  filters.forEach(filter => {
    const action = filter.matches("button") ? "click" : "change";
    filter.addEventListener(action, () => {
      gtag("event", "trip_filter", {
        difficulty: difficulty.value,
        duration_days: days.value === "all" ? "all" : Number(days.value)
      });
    });
  });
}

// 10. trip_view — клик по карточке маршрута.
document.addEventListener("click", event => {
  const card = event.target.closest('[data-event~="trip_view"]');
  if (!card) return;
  gtag("event", "trip_view", {
    trip_id: card.dataset.tripId,
    difficulty: card.dataset.difficulty
  });
});

// 11. date_select — выбор выезда в календаре.
document.addEventListener("click", event => {
  const date = event.target.closest('[data-event~="date_select"]');
  if (!date) return;
  gtag("event", "date_select", {
    trip_id: date.dataset.tripId,
    trip_date: date.dataset.tripDate,
    seats_left: Number(date.dataset.seatsLeft)
  });
});

// 12. guide_view — клик по карточке инструктора.
document.addEventListener("click", event => {
  const card = event.target.closest('[data-event~="guide_view"]');
  if (!card) return;
  gtag("event", "guide_view", {
    guide_id: card.dataset.guideId
  });
});

// 13. rental_calc — успешный расчёт аренды.
document.addEventListener("submit", event => {
  if (!event.target.matches("#rental-form")) return;
  if (!document.querySelector("#calculator-screen").classList.contains("is-result")) return;
  const days = Number(document.querySelector("#rental-days").value);
  const items = document.querySelectorAll('input[name="gear"]:checked');
  let rentalPrice = 0;
  items.forEach(item => {
    rentalPrice += Number(item.dataset.rate) * days;
  });
  gtag("event", "rental_calc", {
    items_count: items.length,
    days: days,
    rental_price: rentalPrice
  });
});

// 14. checklist_check — отметка пункта чек-листа.
document.addEventListener("change", event => {
  const item = event.target;
  if (!item.matches('input[name="gear"]') || !item.checked) return;
  gtag("event", "checklist_check", {
    item_id: item.value
  });
});

// 15. contact_click — клик по телефону или e-mail.
document.addEventListener("click", event => {
  const contact = event.target.closest('[data-event~="contact_click"]');
  if (!contact) return;
  gtag("event", "contact_click", {
    contact_type: contact.dataset.contactType
  });
});

// 16. messenger_click — клик по мессенджеру.
document.addEventListener("click", event => {
  const messenger = event.target.closest('[data-event~="messenger_click"]');
  if (!messenger) return;
  gtag("event", "messenger_click", {
    messenger: messenger.dataset.messenger
  });
});

// 17. social_click — клик по соцсети в подвале или на странице «Спасибо».
document.addEventListener("click", event => {
  const social = event.target.closest('[data-event~="social_click"]');
  if (!social) return;
  gtag("event", "social_click", {
    network: social.dataset.network,
    page_section: social.dataset.pageSection
  });
});

// 18. form_error — ошибки полей при отправке формы и ошибка сервера.
{
  for (const action of ["click", "submit"]) {
    document.addEventListener(action, event => {
      if (action === "click" && !event.target.closest("#booking-submit")) return;
      if (action === "submit" && !event.target.matches("#booking-form")) return;
      const fields = document.querySelectorAll('#booking-form [data-validate][aria-invalid="true"]');
      fields.forEach(field => {
        const missing = field.type === "checkbox" ? !field.checked : !field.value.trim();
        gtag("event", "form_error", {
          field_name: field.name,
          error_type: missing ? "required" : "invalid"
        });
      });
    });
  }
  document.addEventListener("booking_result", event => {
    if (event.detail.ok === true || typeof gtag !== "function") return;
    gtag("event", "form_error", {
      field_name: "booking_form",
      error_type: "server"
    });
  });
}

// 19. promo_copy — успешное копирование промокода кнопкой или вручную.
{
  const status = document.querySelector("#copy-status");
  if (status) {
    new MutationObserver(() => {
      if (status.textContent !== "Промокод скопирован") return;
      gtag("event", "promo_copy", {
        promo_code: document.querySelector("#promo-code").textContent.trim()
      });
    }).observe(status, { childList: true, characterData: true, subtree: true });
  }
  document.addEventListener("copy", event => {
    const code = document.querySelector("#promo-code");
    if (!code || event.defaultPrevented || window.getSelection()?.toString() !== code.textContent.trim()) return;
    gtag("event", "promo_copy", {
      promo_code: code.textContent.trim()
    });
  });
}

// 20. map_open — открытие карты с местом сбора.
document.addEventListener("click", event => {
  const map = event.target.closest('[data-event~="map_open"]');
  if (!map) return;
  gtag("event", "map_open", {
    map_service: map.dataset.mapService
  });
});
