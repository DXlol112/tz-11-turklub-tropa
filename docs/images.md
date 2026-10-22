# Фотографии страницы маршрутов

Все фотографии загружены 20.10.2026 и хранятся локально в `img/trips/`.
Браузер посетителя не обращается к Unsplash. Это фотоиллюстрации похожих
пейзажей, а не фотографии маршрутов вымышленного турклуба из учебного ТЗ.

На страницах источников указана бесплатная **Unsplash License**:
https://unsplash.com/license. Она разрешает загрузку, изменение и использование
фотографий, в том числе в коммерческих проектах; продажа неизменённых фотографий
и создание конкурирующей коллекции не разрешены. Unsplash+ не используется.

| Локальный файл | Назначение | Фотограф | Страница источника |
| --- | --- | --- | --- |
| `waterfalls.webp` | Ледяные водопады | Johny Goerend | [Water falls in the middle of the forest](https://unsplash.com/photos/water-falls-in-the-middle-of-the-forest-H1hRKMF_phE) |
| `snowshoes.webp` | Снегоступы для начинающих | Dakota Corbin | [Person wearing black snowshoes](https://unsplash.com/photos/person-wearing-black-snowshoes-yznxTZ55lmk) |
| `sunrise.webp` | Рассвет на Седой горе | Slava Auchynnikau | [Snowy mountain peaks at sunrise with warm light](https://unsplash.com/photos/snowy-mountain-peaks-at-sunrise-with-warm-light-48YVbxcmqec) |
| `plateau.webp` | Снежное плато | Jimmy Liu | [Two hikers walk through a snowy mountain landscape](https://unsplash.com/photos/two-hikers-walk-through-a-snowy-mountain-landscape-gt_3C-FO3v4) |
| `ski.webp` | Лыжный траверс | Mohammad Eskandari | [Two skiers traverse a vast snowy mountain landscape](https://unsplash.com/photos/two-skiers-traverse-a-vast-snowy-mountain-landscape-2iKYdhFf4Uk) |
| `cabin.webp` | Новогодняя изба | Kris Tian | [A cabin in the middle of a forest covered in snow](https://unsplash.com/photos/a-cabin-in-the-middle-of-a-forest-covered-in-snow-jGba-6kmYmo) |
| `forest.webp` | Фон: лес без тропинки | HAMZA-CHERIF Elias | [Leafless trees on forest during fog](https://unsplash.com/photos/leafless-trees-on-forest-during-fog--SVW5wqvaHI) |

Изображения уменьшены и сохранены в WebP, каждый файл меньше 300 КБ.
Ширина фотографий карточек — 600 px; фон — 1400 px.
Кадрирование на странице выполнено через `object-fit` / `object-position`.
Подпись «Фотоиллюстрация» присутствует у каждой фотографии маршрута.

Дерево, пробка, канцелярские кнопки и персонаж — CSS/SVG-графика проекта.
Персонаж адаптирован из иллюстрации главной страницы.

## Снаряжение

Фотографии для `gear.html` загружены 21.10.2026 с Wikimedia Commons и
сохранены локально в `img/gear/`. Каждый WebP меньше 300 КБ, длинная сторона
не больше 720 px. Это иллюстрации типов предметов, а не моделей проката клуба;
температурный режим спальника на фото не заявляется. Источники и лицензии
также доступны посетителю в раскрывающемся блоке под дверцей холодильника.

| Файл | Автор | Источник | Лицензия |
| --- | --- | --- | --- |
| `sleeping-bag.webp` | Smack | [Mummy bag](https://commons.wikimedia.org/wiki/File:Mummy_bag.jpg) | Public domain |
| `tent.webp` | Paste | [Dome tent](https://commons.wikimedia.org/wiki/File:Dome_tent.JPG) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| `snowshoes.webp` | Willmcw | [Atlas snowshoes](https://commons.wikimedia.org/wiki/File:Atlas_snowshoes.jpg) | Public domain |
| `mat.webp` | Pierrelagrange | [Self-inflating mat](https://commons.wikimedia.org/wiki/File:Self-inflating_mat.jpg) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |
| `stove.webp` | Gvjekoslav | [Gas stove cooking](https://commons.wikimedia.org/wiki/File:Gas_stove_cooking.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `poles.webp` | Sarang | [Retracted trekking poles](https://commons.wikimedia.org/wiki/File:Retracted_trekking_poles.jpg) | Public domain |

Изменения: уменьшение разрешения, преобразование в WebP; отображение и
кадрирование через CSS. Производные изображения сохраняют лицензию оригинала.
Дверца, самоклейки, лист и калькулятор созданы средствами CSS.
`og-gear.jpg` — собственная графика проекта 1200 × 630, без сторонних фотографий.

Сегментные шрифты DSEG7 Classic Italic и DSEG14 Classic Italic (v0.46) —
[keshikan/DSEG](https://github.com/keshikan/DSEG), SIL Open Font License 1.1.
Файлы находятся в `fonts/`, текст лицензии — `fonts/DSEG-LICENSE.txt`.
`og-trips.jpg` — локальное изображение страницы для Open Graph (1200 × 630).

## Шрифты

Для страницы маршрутов из существующих TTF-файлов получены локальные WOFF2-версии
Inter Variable и Russo One. Сохранены латиница, кириллица, знаки валют,
пунктуация и используемые стрелки. Исходные TTF и лицензии SIL OFL в `fonts/`
сохранены. Преобразование выполнено FontTools; утилита не является зависимостью сайта.
