/* ТЗ-11/2026, раздел 6. Веб-приложение: выполнять от владельца таблицы. */
const SPREADSHEET_ID = '1S3dj2mVHnYTkhYRlXSbk8RAz_gYbAO4Xotx75UuMREk';
const HEADERS = ['request_id', 'created_at', 'name', 'phone', 'email', 'trip_id',
  'trip_date', 'participants', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'status'];
const TRIPS = ['icefalls', 'snowshoes', 'sunrise', 'plateau', 'traverse', 'newyear_hut'];
const MEDIA = ['social', 'affiliate', 'qr', 'email', 'cpc', 'referral', 'none'];

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function invalid(field, message) {
  const error = new Error(message);
  error.field = field;
  throw error;
}

function validateBooking(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid('', 'Некорректный запрос.');
  const data = {};
  ['request_id', 'name', 'phone', 'email', 'trip_id', 'trip_date', 'participants',
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'consent', 'age_consent'].forEach(function (field) {
    const value = input[field] == null ? '' : input[field];
    if (!['string', 'number', 'boolean'].includes(typeof value) || String(value).length > 200) {
      invalid(field, 'Поле должно содержать не более 200 символов.');
    }
    data[field] = String(value).trim();
  });
  if (!/^REQ-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.request_id)) {
    invalid('request_id', 'Неверный номер заявки. Обновите страницу.');
  }
  if (data.name.length < 2 || data.name.length > 60) invalid('name', 'Введите имя длиной от 2 до 60 символов.');
  if (!/^\+7\d{10}$/.test(data.phone)) invalid('phone', 'Введите телефон: +7 и 10 цифр.');
  if (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) invalid('email', 'Проверьте адрес электронной почты.');
  if (!TRIPS.includes(data.trip_id)) invalid('trip_id', 'Выберите маршрут из списка.');
  if (!/^[1-6]$/.test(data.participants)) invalid('participants', 'Укажите от 1 до 6 участников.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.trip_date)) invalid('trip_date', 'Выберите дату выезда в календаре.');
  const parsedDate = new Date(data.trip_date + 'T12:00:00Z');
  if (isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== data.trip_date) {
    invalid('trip_date', 'Такой даты не существует.');
  }
  ['consent', 'age_consent'].forEach(function (field) {
    if (!['true', 'on', '1'].includes(data[field])) invalid(field, 'Подтвердите согласие.');
  });
  const defaults = { utm_source: 'direct', utm_medium: 'none', utm_campaign: 'not_set', utm_content: 'not_set' };
  Object.keys(defaults).forEach(function (field) {
    data[field] = data[field] || defaults[field];
    if (!/^[a-z0-9_]+$/.test(data[field])) invalid(field, 'В метках допустимы латинские строчные буквы, цифры и подчёркивание.');
  });
  if (!MEDIA.includes(data.utm_medium)) invalid('utm_medium', 'Недопустимый тип источника.');
  return data;
}

// Ввод посетителя всегда остаётся текстом, в том числе строки, похожие на формулы.
function sheetText(value) {
  return /^[=+\-@']/.test(value) ? "'" + value : value;
}

function doPost(e) {
  let lock;
  try {
    if (!e || !e.postData || e.postData.length > 12000) invalid('', 'Некорректный размер запроса.');
    let input;
    if (/^(application\/json|text\/plain)/i.test(e.postData.type || '')) {
      try { input = JSON.parse(e.postData.contents); }
      catch (_) { invalid('', 'Некорректный JSON.'); }
    } else {
      input = e.parameter;
    }
    const data = validateBooking(input);
    lock = LockService.getScriptLock();
    if (!lock.tryLock(20000)) return jsonResponse({ ok: false, error: 'Приёмник занят. Повторите отправку с тем же номером.' });
    const book = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = book.getSheetByName('leads');
    if (!sheet || JSON.stringify(sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0]) !== JSON.stringify(HEADERS)) {
      throw new Error('Unexpected leads headers');
    }
    const lastRow = sheet.getLastRow();
    if (lastRow > 1 && sheet.getRange(2, 1, lastRow - 1, 1).createTextFinder(data.request_id)
      .matchEntireCell(true).matchCase(false).useRegularExpression(false).findNext()) {
      return jsonResponse({ ok: false, code: 'duplicate', error: 'Заявка с этим номером уже записана. Повторная строка не создана.' });
    }
    const row = Math.max(2, lastRow + 1);
    if (row > sheet.getMaxRows()) {
      sheet.insertRowsAfter(sheet.getMaxRows(), 100);
      sheet.getRange(2, 1, 1, HEADERS.length).copyTo(sheet.getRange(row, 1, 100, HEADERS.length), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
      sheet.getRange(2, 1, 1, HEADERS.length).copyTo(sheet.getRange(row, 1, 100, HEADERS.length), SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION, false);
    }
    const tripDate = Utilities.parseDate(data.trip_date + ' 12:00:00', book.getSpreadsheetTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(row, 1, 1, HEADERS.length).setValues([[
      data.request_id, new Date(), sheetText(data.name), sheetText(data.phone), sheetText(data.email),
      data.trip_id, tripDate, Number(data.participants), data.utm_source, data.utm_medium,
      data.utm_campaign, data.utm_content, 'new'
    ]]);
    SpreadsheetApp.flush();
    return jsonResponse({ ok: true, request_id: data.request_id });
  } catch (error) {
    return jsonResponse({ ok: false, error: error.field !== undefined ? error.message : 'Не удалось записать заявку. Повторите попытку с тем же номером.', field: error.field || '' });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

// Проверка доступности не возвращает содержимое таблицы.
function doGet() {
  return jsonResponse({ ok: true, service: 'Tropa Bookings', version: 1 });
}
