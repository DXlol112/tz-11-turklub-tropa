# Турклуб «Тропа» — ТЗ-11/2026

Курсовая работа по дисциплине ОП.03 «Информационные технологии», ТЗ-11/2026.
Исполнитель: Иванов Иван, группа ___.

Сайт зимних походов турклуба «Тропа»: каждый посетитель приходит
с меткой источника, каждая заявка попадает в Google Таблицу, а руководитель
видит на дашборде, какой канал приводит клиентов.

![Схема работы](docs/scheme.png)

## Ссылки

| Что | Ссылка |
|---|---|
| Сайт | [](https://dxlol112.github.io/tz-11-turklub-tropa/) |
| Таблица заявок | [Tropa — Bookings](https://docs.google.com/spreadsheets/d/1S3dj2mVHnYTkhYRlXSbk8RAz_gYbAO4Xotx75UuMREk/edit?usp=sharing) |
| Приёмник Apps Script | [Проект](https://script.google.com/d/1DDz-kRBazCG31Rv9-6BTXJdlNgrb5SwEKc3lFVJsE-PR3ezRwehbJlTd/edit?usp=sharing)|
| Дашборд DataLens | ___ |
| Instagram и Reel с автоответом | ___ |
| ВКонтакте · Telegram · YouTube | ___ · ___ · ___ |
| Описание работы | [docs/opisanie.md](docs/opisanie.md) |
| Презентация к защите | [presentation/zashchita.pdf](presentation/zashchita.pdf) |

Ресурс GA4: `G-W8SQ3LHX0Z`. Доступ Viewer к ресурсу GA4 выдан: ___ (e-mail Заказчика).

## Что сделано

| Часть | Результат |
|---|---|
| Сайт | ___ страниц, статический HTML, Vercel, Lighthouse: ___ / ___ / ___ |
| GA4 | ___ событий, ___ пользовательских параметров, ключевые: `generate_lead`, ___ |
| UTM | ___ ссылок в реестре, публикации в ___ соцсетях, QR на афише |
| Заявки | форма → Apps Script → лист `leads`, проверка полей и повторов |
| Instagram | ManyChat, две ветки: `___` и `___` |
| Отчёты | Reports, Explore, воронка, путь, дашборд DataLens из трёх вкладок |

## Технологии

HTML, CSS, JavaScript · Google Analytics 4 · Google Таблицы и Apps Script ·
ManyChat · Yandex DataLens · GitHub и Vercel. Сайт создан с помощью ___
(запросы — в [docs/prompts.md](docs/prompts.md)).

## Структура

```text
index.html …         страницы сайта
robots.txt           запрет обхода поисковыми роботами
js/analytics.js      все события GA4
js/form.js           UTM, отправка формы, номер заявки
apps-script/Code.gs  приёмник заявок
docs/                описание, реестр UTM, события, записка, схема
screens/             кадры-доказательства по разделам ТЗ
presentation/        презентация к защите
```

## Итог

Проверки приёмника и UTM: `node --test tests/bookings.test.cjs`.
Apps Script опубликован; адрес `/exec` указан в `data-endpoint` формы в `contacts.html`. Подробности — в [инструкции приёмника](apps-script/README.md).

Не получилось: ___
Нейросеть использовалась для: ___
