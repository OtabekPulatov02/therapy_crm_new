/**
 * Утилита для загрузки данных из Google Sheets
 * 
 * Для публичных таблиц использует CSV экспорт
 * Для приватных таблиц требуется OAuth или API ключ
 */

export interface PatientData {
  id: number;
  name: string;
  age: number;
  gender: string;
  // До вмешательства
  before: {
    systolicBP?: number; // САД
    diastolicBP?: number; // ДАД
    heartRate?: number; // ЧСС
    glucose?: number; // Глюкоза
    hba1c?: number; // HbA1c
    alt?: number; // АЛТ
    ast?: number; // АСТ
    creatinine?: number; // Креатинин
    gfr?: number; // СКФ
    cholesterol?: number; // ОХ
    triglycerides?: number; // ТГ
    hdl?: number; // ЛПВП
    ldl?: number; // ЛПНП
    il1?: number; // ИЛ-1
    il6?: number; // ИЛ-6
    il10?: number; // ИЛ-10
    crp?: number; // вчСРБ
    ejectionFraction?: number; // ФВ
    abi?: number; // ABI
  };
  // После вмешательства (24 часа)
  after24h?: {
    systolicBP?: number;
    diastolicBP?: number;
    heartRate?: number;
    glucose?: number;
    alt?: number;
    ast?: number;
    creatinine?: number;
    gfr?: number;
  };
  // После вмешательства (7 дней)
  after7d?: {
    erythrocytes?: number;
    platelets?: number;
    leukocytes?: number;
    hemoglobin?: number;
    esr?: number;
    hba1c?: number;
    cholesterol?: number;
    triglycerides?: number;
    hdl?: number;
    ldl?: number;
    ejectionFraction?: number;
    abi?: number;
  };
}

/**
 * Извлекает ID таблицы из URL Google Sheets
 */
export function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
}

/**
 * Загружает данные из Google Sheets через CSV экспорт
 * Сначала пробует прямую загрузку, затем через backend proxy
 * 
 * @param sheetId - ID таблицы Google Sheets
 * @param gid - ID листа (опционально, по умолчанию 0)
 */
export async function loadDataFromGoogleSheets(
  sheetId: string,
  gid: string = "0"
): Promise<string> {
  // Пробуем несколько вариантов URL для экспорта
  // Для публичных таблиц Google Sheets используем разные форматы
  const urls = [
    // Формат через gviz (часто работает для публичных таблиц)
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`,
    // Стандартный экспорт CSV
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
    // Альтернативный формат
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&id=${sheetId}&gid=${gid}`,
    // Формат для публичных таблиц
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&usp=sharing`,
  ];

  let lastError: Error | null = null;

  // Сначала пробуем прямую загрузку
  for (const csvUrl of urls) {
    try {
      const response = await fetch(csvUrl, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
      });

      if (!response.ok) {
        // Если 403 или 401 - таблица приватная
        if (response.status === 403 || response.status === 401) {
          throw new Error(
            `Таблица недоступна. Убедитесь, что таблица публичная:\n` +
            `1. Откройте таблицу в Google Sheets\n` +
            `2. Нажмите "Настройки доступа" (Share)\n` +
            `3. Выберите "Все, у кого есть ссылка" (Anyone with the link)\n` +
            `4. Убедитесь, что разрешение установлено на "Читатель" (Viewer)`
          );
        }
        
        // Если 400 - возможно неправильный формат запроса или таблица не публичная
        if (response.status === 400) {
          // Пробуем получить больше информации из ответа
          try {
            const errorText = await response.text();
            console.warn('Ошибка 400, ответ сервера:', errorText.substring(0, 200));
          } catch (e) {
            // Игнорируем ошибку чтения ответа
          }
          lastError = new Error(
            `Ошибка доступа к таблице (400). ` +
            `Таблица может быть не публичной или требуется авторизация.\n\n` +
            `Попробуйте:\n` +
            `1. Сделать таблицу публичной (Share → Anyone with the link)\n` +
            `2. Или загрузите CSV файл вручную`
          );
          continue; // Пробуем следующий URL
        }

        lastError = new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`);
        continue;
      }

      const text = await response.text();
      
      // Проверяем, что получили валидные данные (не HTML страницу с ошибкой)
      if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
        lastError = new Error('Получен HTML вместо CSV. Пробуем через backend proxy...');
        break; // Переходим к backend proxy
      }

      if (text.trim().length === 0) {
        lastError = new Error('Получены пустые данные.');
        continue;
      }

      return text;
    } catch (error) {
      // Если это не ошибка доступа, пробуем следующий URL
      if (error instanceof Error && error.message.includes('Таблица недоступна')) {
        throw error; // Немедленно выбрасываем ошибку доступа
      }
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  // Если прямая загрузка не сработала, пробуем через backend proxy
  try {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    if (apiUrl) {
      console.log('Пробуем загрузить через backend proxy:', apiUrl);
      const proxyUrl = `${apiUrl}/api/v1/google-sheets/export?sheet_id=${sheetId}&gid=${gid}&format=csv`;
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          console.log('Данные успешно загружены через backend proxy');
          return data.data;
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Backend proxy вернул ошибку:', errorData);
        // Если backend тоже не помог, выбрасываем понятную ошибку
        throw new Error(
          errorData.detail?.message || 
          errorData.detail?.error || 
          `Backend proxy вернул ошибку: ${response.status}`
        );
      }
    }
  } catch (proxyError) {
    // Если proxy тоже не сработал, продолжаем с исходной ошибкой
    console.warn('Backend proxy не доступен или вернул ошибку:', proxyError);
    // Не перезаписываем lastError, если он уже есть
    if (!lastError) {
      lastError = proxyError instanceof Error ? proxyError : new Error(String(proxyError));
    }
  }

  // Если все способы не сработали
  throw lastError || new Error(
    'Не удалось загрузить данные из Google Sheets.\n\n' +
    'Возможные решения:\n' +
    '1. Сделайте таблицу публичной:\n' +
    '   - Откройте таблицу в Google Sheets\n' +
    '   - Нажмите "Настройки доступа" (Share)\n' +
    '   - Выберите "Все, у кого есть ссылка"\n' +
    '   - Установите разрешение "Читатель"\n' +
    '   - Нажмите "Готово"\n\n' +
    '2. Альтернатива: экспортируйте таблицу вручную:\n' +
    '   - File → Download → Comma Separated Values (.csv)\n' +
    '   - Загрузите CSV файл через кнопку "Выбрать CSV файл"'
  );
}

/**
 * Парсит CSV строку в массив объектов
 * Поддерживает различные форматы CSV (запятая, точка с запятой, табуляция)
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  // Удаляем BOM символы если есть
  let text = csvText.replace(/^\uFEFF/, '');
  
  // Нормализуем окончания строк
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    console.warn('CSV файл содержит менее 2 строк');
    return [];
  }

  // Определяем разделитель
  // Считаем количество запятых и точек с запятой в первой строке
  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  
  let delimiter = ',';
  if (tabCount > commaCount && tabCount > semicolonCount) {
    delimiter = '\t';
  } else if (semicolonCount > commaCount) {
    delimiter = ';';
  }
  
  console.log('Определен разделитель CSV:', delimiter === '\t' ? 'TAB' : delimiter);

  // Парсим заголовки с учетом кавычек
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Двойные кавычки - экранированная кавычка
          current += '"';
          i++; // Пропускаем следующую кавычку
        } else {
          // Переключаем режим кавычек
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        // Найден разделитель вне кавычек
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Добавляем последнее поле
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  console.log('Заголовки CSV:', headers.slice(0, 10), '... (всего:', headers.length, ')');
  
  const data: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Пропускаем пустые строки
    
    const values = parseCSVLine(line);
    
    // Если количество значений не совпадает с заголовками, пробуем исправить
    if (values.length !== headers.length) {
      console.warn(`Строка ${i + 1}: количество полей (${values.length}) не совпадает с заголовками (${headers.length})`);
      
      // Если значений меньше, дополняем пустыми
      while (values.length < headers.length) {
        values.push('');
      }
      
      // Если значений больше, обрезаем
      if (values.length > headers.length) {
        values.splice(headers.length);
      }
    }
    
    // Пропускаем строки, где все значения пустые
    if (values.every(v => !v || v.trim() === '')) {
      continue;
    }
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }

  console.log('Распарсено строк данных:', data.length);
  return data;
}

/**
 * Находит значение колонки по паттерну в названии
 */
function findColumnByPattern(row: Record<string, string>, pattern: RegExp): string | undefined {
  for (const [key, value] of Object.entries(row)) {
    if (pattern.test(key)) {
      return value;
    }
  }
  return undefined;
}

/**
 * Преобразует сырые данные CSV в структурированные данные пациентов
 */
export function transformToPatientData(csvData: Record<string, string>[]): PatientData[] {
  return csvData
    .filter((row, index) => {
      // Пропускаем заголовки и пустые строки
      const name = row['Ф.И.О.'] || row['F.I.O.'] || '';
      return name && index > 0 && name.trim() !== '';
    })
    .map((row, index) => {
      const parseNumber = (value: string | undefined): number | undefined => {
        if (!value || value === '-' || value.trim() === '') return undefined;
        const num = parseFloat(value.replace(',', '.'));
        return isNaN(num) ? undefined : num;
      };

      const parseAge = (value: string | undefined): number => {
        const num = parseNumber(value);
        return num || 0;
      };

      return {
        id: index + 1,
        name: row['Ф.И.О.'] || row['F.I.O.'] || `Пациент ${index + 1}`,
        age: parseAge(row['Возраст'] || row['Age']),
        gender: row['Пол'] || row['Gender'] || '',
        before: {
          systolicBP: parseNumber(row['САД мм.рт.ст.'] || row['Systolic BP']),
          diastolicBP: parseNumber(row['ДАД мм.рт.ст.'] || row['Diastolic BP']),
          heartRate: parseNumber(row['ЧСС уд в мин.'] || row['Heart Rate']),
          glucose: parseNumber(row['Глюкоза крови (из вены), ммоль/л'] || row['Glucose']),
          hba1c: parseNumber(row['HbA1c, %'] || row['HbA1c']),
          alt: parseNumber(row['АЛТ, Ед/л'] || row['ALT']),
          ast: parseNumber(row['АСТ, Ед/л'] || row['AST']),
          creatinine: parseNumber(row['Креатинин, мкмоль/л'] || row['Creatinine']),
          gfr: parseNumber(row['СКФ (по CKD-EPI), мл/мин/1,73м²'] || row['GFR']),
          cholesterol: parseNumber(row['ОХ ммоль/л'] || row['Total Cholesterol']),
          triglycerides: parseNumber(row['ТГ, ммоль/л'] || row['Triglycerides']),
          hdl: parseNumber(row['ЛПВП, ммоль/л'] || row['HDL']),
          ldl: parseNumber(row['ЛПНП, ммоль/л'] || row['LDL']),
          il1: parseNumber(row['ИЛ-1, пг/мл'] || row['IL-1']),
          il6: parseNumber(row['ИЛ-6, пг/мл'] || row['IL-6']),
          il10: parseNumber(row['ИЛ-10, пг/мл'] || row['IL-10']),
          crp: parseNumber(row['вчСРБ, МЕ/л'] || row['CRP']),
          ejectionFraction: parseNumber(row['ФВ, %'] || row['Ejection Fraction']),
          abi: parseNumber(row['Индекс лодыжечно-плечевой (ABI)'] || row['ABI']),
        },
        after24h: {
          // Ищем колонки "после 24ч" - они могут быть в разных форматах
          systolicBP: parseNumber(
            row['Значение после вмешательства (после 24 ч) САД мм.рт.ст.'] ||
            findColumnByPattern(row, /САД.*24|24.*САД|After.*24.*SBP/i)
          ),
          diastolicBP: parseNumber(
            row['Значение после вмешательства (после 24 ч) ДАД мм.рт.ст.'] ||
            findColumnByPattern(row, /ДАД.*24|24.*ДАД|After.*24.*DBP/i)
          ),
          heartRate: parseNumber(
            row['Значение после вмешательства (после 24 ч) ЧСС уд в мин.'] ||
            findColumnByPattern(row, /ЧСС.*24|24.*ЧСС|After.*24.*HR/i)
          ),
          glucose: parseNumber(
            row['Значение после вмешательства (после 24 ч) Глюкоза крови (из вены), ммоль/л'] ||
            findColumnByPattern(row, /Глюкоза.*24|24.*Глюкоза|After.*24.*Glucose/i)
          ),
          alt: parseNumber(
            row['Значение после вмешательства (после 24 ч) АЛТ, Ед/л'] ||
            findColumnByPattern(row, /АЛТ.*24|24.*АЛТ|After.*24.*ALT/i)
          ),
          ast: parseNumber(
            row['Значение после вмешательства (после 24 ч) АСТ, Ед/л'] ||
            findColumnByPattern(row, /АСТ.*24|24.*АСТ|After.*24.*AST/i)
          ),
          creatinine: parseNumber(
            row['Значение после вмешательства (после 24 ч) Креатинин, мкмоль/л'] ||
            findColumnByPattern(row, /Креатинин.*24|24.*Креатинин|After.*24.*Creatinine/i)
          ),
          gfr: parseNumber(
            row['Значение после вмешательства (после 24 ч) СКФ (по CKD-EPI), мл/мин/1,73м²'] ||
            findColumnByPattern(row, /СКФ.*24|24.*СКФ|After.*24.*GFR/i)
          ),
        },
        after7d: {
          erythrocytes: parseNumber(
            row['Значение после вмешательства (после 7 дней) Эритроциты, 10*12/л'] ||
            findColumnByPattern(row, /Эритроциты.*7|7.*Эритроциты|After.*7.*Erythrocytes/i)
          ),
          platelets: parseNumber(
            row['Значение после вмешательства (после 7 дней) Тромбоциты, 10*9/л'] ||
            findColumnByPattern(row, /Тромбоциты.*7|7.*Тромбоциты|After.*7.*Platelets/i)
          ),
          leukocytes: parseNumber(
            row['Значение после вмешательства (после 7 дней) Лейкоцит, 10*6/л'] ||
            findColumnByPattern(row, /Лейкоцит.*7|7.*Лейкоцит|After.*7.*Leukocytes/i)
          ),
          hemoglobin: parseNumber(
            row['Значение после вмешательства (после 7 дней) Гемоглобин, г/л'] ||
            findColumnByPattern(row, /Гемоглобин.*7|7.*Гемоглобин|After.*7.*Hemoglobin/i)
          ),
          esr: parseNumber(
            row['Значение после вмешательства (после 7 дней) СОЭ, мм/ч'] ||
            findColumnByPattern(row, /СОЭ.*7|7.*СОЭ|After.*7.*ESR/i)
          ),
          hba1c: parseNumber(
            row['Значение после вмешательства (после 7 дней) HbA1c, %'] ||
            findColumnByPattern(row, /HbA1c.*7|7.*HbA1c|After.*7.*HbA1c/i)
          ),
          cholesterol: parseNumber(
            row['Значение после вмешательства (после 7 дней) ОХ ммоль/л'] ||
            findColumnByPattern(row, /ОХ.*7|7.*ОХ|Cholesterol.*7/i)
          ),
          triglycerides: parseNumber(
            row['Значение после вмешательства (после 7 дней) ТГ, ммоль/л'] ||
            findColumnByPattern(row, /ТГ.*7|7.*ТГ|Triglycerides.*7/i)
          ),
          hdl: parseNumber(
            row['Значение после вмешательства (после 7 дней) ЛПВП, ммоль/л'] ||
            findColumnByPattern(row, /ЛПВП.*7|7.*ЛПВП|HDL.*7/i)
          ),
          ldl: parseNumber(
            row['Значение после вмешательства (после 7 дней) ЛПНП, ммоль/л'] ||
            findColumnByPattern(row, /ЛПНП.*7|7.*ЛПНП|LDL.*7/i)
          ),
          ejectionFraction: parseNumber(
            row['Значение после вмешательства (после 7 дней) ФВ, %'] ||
            findColumnByPattern(row, /ФВ.*7|7.*ФВ|EF.*7/i)
          ),
          abi: parseNumber(
            row['Значение после вмешательства (после 7 дней) Индекс лодыжечно-плечевой (ABI)'] ||
            findColumnByPattern(row, /ABI.*7|7.*ABI/i)
          ),
        },
      };
    })
    .filter(patient => patient.name && patient.name.trim() !== '');
}

