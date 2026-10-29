# События GA4

| Событие | Когда / где | Отправка: файл:строка | Параметры с примерами |
|---|---|---|---|
| `page_view` | Открытие любой страницы | Авто GA4 | `page_location="https://dxlol112.github.io/tz-11-turklub-tropa/index.html"`, `page_title="Тропа — выше гор, ближе к себе"` |
| `scroll` | Прокрутка до 90 % | Авто GA4 | `percent_scrolled=90` |
| `click` | Переход на внешний сайт | Авто GA4 | `link_url="https://t.me/tropa_trips"`, `outbound=true` |
| `file_download` | Скачивание PDF на `gear.html` | Авто GA4 | `file_name="/tz-11-turklub-tropa/files/gear-checklist.pdf"`, `file_extension="pdf"` |
| `form_start` | Начало заполнения формы на `contacts.html` | Авто GA4 | `form_id="booking-form"` |
| `form_submit` | Отправка формы на `contacts.html` | Авто GA4 | `form_id="booking-form"` |
| `generate_lead` | Приёмник заявки вернул `ok: true` | `js/analytics.js:12` | `lead_trip_id="icefalls"`, `participants=2`, `lead_source="telegram"` |
| `cta_click` | Клик по кнопке заявки | `js/analytics.js:23` | `button_name="book_trip"`, `page_section="routes"` |
| `trip_filter` | Изменение или сброс фильтров на главной / маршрутах | `js/analytics.js:37` | `difficulty="easy"`, `duration_days=1` |
| `trip_view` | Клик по карточке маршрута | `js/analytics.js:49` | `trip_id="icefalls"`, `difficulty="easy"` |
| `date_select` | Выбор выезда в календаре | `js/analytics.js:59` | `trip_id="icefalls"`, `trip_date="2026-12-19"`, `seats_left=6` |
| `guide_view` | Клик по карточке инструктора | `js/analytics.js:70` | `guide_id="anna"` |
| `rental_calc` | Расчёт аренды на `gear.html` | `js/analytics.js:85` | `items_count=2`, `days=2`, `rental_price=1300` |
| `checklist_check` | Отметка снаряжения в чек-листе | `js/analytics.js:96` | `item_id="sleeping-bag"` |
| `contact_click` | Клик по телефону или e-mail | `js/analytics.js:105` | `contact_type="phone"` или `"email"` |
| `messenger_click` | Клик по Telegram или WhatsApp | `js/analytics.js:114` | `messenger="telegram"` или `"whatsapp"` |
| `social_click` | Клик по соцсети в подвале / на `thanks.html` | `js/analytics.js:123` | `network="telegram"`, `page_section="footer"` |
| `form_error` | Ошибка поля или приёмника заявки | `js/analytics.js:138`, `147` | Поле: `field_name="phone"`, `error_type="invalid"`; сервер: `field_name="booking_form"`, `error_type="server"` |
| `promo_copy` (по выбору) | Копирование промокода | `js/analytics.js:160`, `168` | `promo_code="SNOW300"` |
| `map_open` (по выбору) | Открытие карты места сбора | `js/analytics.js:178` | `map_service="yandex"` |
