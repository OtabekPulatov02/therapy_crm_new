import Plot from "react-plotly.js";
import { Box, Text, SimpleGrid, Button, Spinner, Alert, AlertIcon, HStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  extractSheetId,
  loadDataFromGoogleSheets,
  parseCSV,
  transformToPatientData,
  PatientData,
} from "../utils/googleSheets";
import { useRef } from "react";
import { useFilters } from "../store/filters";

// Маппинг проектов к Google Sheets URL
const PROJECT_SHEETS_MAP: Record<string, string> = {
  "550e8400-e29b-41d4-a716-446655440001": "https://docs.google.com/spreadsheets/d/1tjx8Q1uarTiZDYhCPraci_3twGR26GfwrXok1-iHuAA/edit?usp=sharing", // PRIM-01-08
  "550e8400-e29b-41d4-a716-446655440002": "https://docs.google.com/spreadsheets/d/1tjx8Q1uarTiZDYhCPraci_3twGR26GfwrXok1-iHuAA/edit?usp=sharing", // FZ-2020103185
  "550e8400-e29b-41d4-a716-446655440003": "https://docs.google.com/spreadsheets/d/1tjx8Q1uarTiZDYhCPraci_3twGR26GfwrXok1-iHuAA/edit?usp=sharing", // FZ-2020103184
  "550e8400-e29b-41d4-a716-446655440004": "https://docs.google.com/spreadsheets/d/1tjx8Q1uarTiZDYhCPraci_3twGR26GfwrXok1-iHuAA/edit?usp=sharing", // АL-492598621
  "550e8400-e29b-41d4-a716-446655440005": "https://docs.google.com/spreadsheets/d/1tjx8Q1uarTiZDYhCPraci_3twGR26GfwrXok1-iHuAA/edit?usp=sharing", // FL-9524114982
};

// URL по умолчанию
const DEFAULT_GOOGLE_SHEETS_URL = "https://docs.google.com/spreadsheets/d/1tjx8Q1uarTiZDYhCPraci_3twGR26GfwrXok1-iHuAA/edit?usp=sharing";

type MedicalDashboardChartsProps = {
  customData?: PatientData[];
};

export default function MedicalDashboardCharts({ customData }: MedicalDashboardChartsProps) {
  const { t } = useTranslation();
  const selectedProject = useFilters((state) => state.project);
  const [patients, setPatients] = useState<PatientData[]>(customData || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipAutoLoad, setSkipAutoLoad] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Получаем URL для выбранного проекта
  const getGoogleSheetsUrl = () => {
    if (selectedProject && PROJECT_SHEETS_MAP[selectedProject]) {
      return PROJECT_SHEETS_MAP[selectedProject];
    }
    return DEFAULT_GOOGLE_SHEETS_URL;
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const sheetsUrl = getGoogleSheetsUrl();
      const sheetId = extractSheetId(sheetsUrl);
      if (!sheetId) {
        throw new Error("Не удалось извлечь ID таблицы из URL. Проверьте правильность ссылки.");
      }

      console.log("Загрузка данных из Google Sheets, ID:", sheetId);
      const csvText = await loadDataFromGoogleSheets(sheetId);
      console.log("Данные загружены, размер:", csvText.length, "символов");
      
      const csvData = parseCSV(csvText);
      console.log("CSV распарсен, строк:", csvData.length);
      
      const patientData = transformToPatientData(csvData);
      console.log("Данные пациентов преобразованы, записей:", patientData.length);
      
      if (patientData.length === 0) {
        throw new Error(
          "Не удалось распарсить данные.\n\n" +
          "Возможные причины:\n" +
          "1. Таблица не публичная - сделайте ее доступной для всех по ссылке\n" +
          "2. Структура таблицы не соответствует ожидаемому формату\n" +
          "3. Данные в таблице отсутствуют или имеют другой формат\n\n" +
          "Альтернатива: экспортируйте таблицу в CSV и загрузите через функцию загрузки файлов."
        );
      }

      setPatients(patientData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки данных";
      setError(errorMessage);
      console.error("Ошибка загрузки данных:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      console.log('Загрузка файла:', file.name, 'размер:', file.size, 'байт');
      const text = await file.text();
      console.log('Файл прочитан, размер текста:', text.length, 'символов');
      console.log('Первые 500 символов:', text.substring(0, 500));
      
      const csvData = parseCSV(text);
      console.log('CSV распарсен, строк:', csvData.length);
      
      if (csvData.length === 0) {
        throw new Error(
          "Не удалось распарсить данные из файла.\n\n" +
          "Возможные причины:\n" +
          "1. Файл не в формате CSV\n" +
          "2. Файл пустой или содержит только заголовки\n" +
          "3. Неправильная кодировка файла\n\n" +
          "Попробуйте:\n" +
          "1. Убедитесь, что экспортируете как CSV (File → Download → Comma Separated Values)\n" +
          "2. Проверьте, что файл содержит данные (не пустой)"
        );
      }
      
      console.log('Пример первой строки данных:', csvData[0]);
      const patientData = transformToPatientData(csvData);
      console.log('Данные пациентов преобразованы, записей:', patientData.length);

      if (patientData.length === 0) {
        throw new Error(
          "Не удалось преобразовать данные в формат пациентов.\n\n" +
          "Возможные причины:\n" +
          "1. Структура таблицы не соответствует ожидаемому формату\n" +
          "2. Отсутствуют обязательные колонки (Ф.И.О., Возраст и т.д.)\n" +
          "3. Данные в неправильном формате\n\n" +
          "Проверьте, что CSV файл содержит колонки:\n" +
          "- Ф.И.О. (или F.I.O.)\n" +
          "- Возраст (или Age)\n" +
          "- Пол (или Gender)\n" +
          "И другие медицинские показатели"
        );
      }

      setPatients(patientData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ошибка загрузки файла";
      setError(errorMessage);
      console.error("Ошибка загрузки файла:", err);
    } finally {
      setLoading(false);
      // Сбрасываем input для возможности повторной загрузки того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    // Если переданы кастомные данные, используем их
    if (customData && customData.length > 0) {
      setPatients(customData);
      setLoading(false);
      setError(null);
      return;
    }
    // Иначе автоматически загружаем данные при монтировании компонента или при смене проекта
    // Только если пользователь не пропустил автоматическую загрузку
    if (!skipAutoLoad) {
      loadData();
    }
  }, [customData, skipAutoLoad, selectedProject]); // Добавили selectedProject в зависимости

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" color="brand.600" />
        <Text mt={4}>{t("charts.loadingData")}</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert status="error" mb={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold" mb={2}>Ошибка загрузки данных</Text>
            <Text whiteSpace="pre-line" fontSize="sm">{error}</Text>
          </Box>
        </Alert>
        <HStack spacing={2} mb={2}>
          <Button onClick={loadData} colorScheme="brand">
            {t("charts.retry")}
          </Button>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            colorScheme="blue"
            variant="outline"
          >
            Загрузить CSV
          </Button>
          <Button 
            onClick={() => {
              setSkipAutoLoad(true);
              setError(null);
              setLoading(false);
            }} 
            variant="outline"
          >
            Пропустить автоматическую загрузку
          </Button>
        </HStack>
        <Box mt={4} p={4} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" fontWeight="bold" mb={2}>Как исправить:</Text>
          <Text fontSize="sm" whiteSpace="pre-line" mb={4}>
            {`1. Откройте таблицу в Google Sheets:
   https://docs.google.com/spreadsheets/d/1UfsqhA6xln9-fZJWihgeT5OxxY-2gPGyWhLhMUBJnxY/edit

2. Нажмите кнопку "Настройки доступа" (Share) в правом верхнем углу

3. Измените доступ на "Все, у кого есть ссылка" (Anyone with the link)

4. Убедитесь, что разрешение установлено на "Читатель" (Viewer)

5. Нажмите "Готово" (Done)

6. Обновите эту страницу и попробуйте загрузить данные снова`}
          </Text>
          <Text fontSize="sm" fontWeight="bold" mb={2}>Или загрузите CSV файл вручную:</Text>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            colorScheme="blue"
            variant="outline"
            mb={2}
          >
            Выбрать CSV файл
          </Button>
          <Text fontSize="xs" color="gray.600">
            Экспортируйте таблицу: File → Download → Comma Separated Values (.csv)
          </Text>
        </Box>
      </Box>
    );
  }

  if (patients.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text mb={4}>{t("charts.noData")}</Text>
        <Button onClick={loadData} colorScheme="brand">
          {t("charts.loadData")}
        </Button>
      </Box>
    );
  }

  // Подготовка данных для графиков
  const validPatients = patients.filter(p => p.before);

  // Распределение по полу
  const genderDistribution = validPatients.reduce((acc, p) => {
    const gender = p.gender || "Не указан";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Распределение по возрасту
  const ageGroups = validPatients.reduce((acc, p) => {
    const age = p.age || 0;
    let group = "Не указан";
    if (age > 0) {
      if (age < 40) group = "< 40";
      else if (age < 50) group = "40-49";
      else if (age < 60) group = "50-59";
      else if (age < 70) group = "60-69";
      else group = "≥ 70";
    }
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Данные для сравнения до/после (только для пациентов с данными после 24ч)
  const beforeAfterData = validPatients.filter(p => p.after24h);
  
  const systolicBPBefore = beforeAfterData.map(p => p.before.systolicBP).filter((v): v is number => v !== undefined);
  const systolicBPAfter = beforeAfterData.map(p => p.after24h?.systolicBP).filter((v): v is number => v !== undefined);
  
  const diastolicBPBefore = beforeAfterData.map(p => p.before.diastolicBP).filter((v): v is number => v !== undefined);
  const diastolicBPAfter = beforeAfterData.map(p => p.after24h?.diastolicBP).filter((v): v is number => v !== undefined);

  const glucoseBefore = beforeAfterData.map(p => p.before.glucose).filter((v): v is number => v !== undefined);
  const glucoseAfter = beforeAfterData.map(p => p.after24h?.glucose).filter((v): v is number => v !== undefined);

  const creatinineBefore = beforeAfterData.map(p => p.before.creatinine).filter((v): v is number => v !== undefined);
  const creatinineAfter = beforeAfterData.map(p => p.after24h?.creatinine).filter((v): v is number => v !== undefined);

  // Липидный профиль
  const cholesterolValues = validPatients.map(p => p.before.cholesterol).filter((v): v is number => v !== undefined);
  const triglyceridesValues = validPatients.map(p => p.before.triglycerides).filter((v): v is number => v !== undefined);
  const hdlValues = validPatients.map(p => p.before.hdl).filter((v): v is number => v !== undefined);
  const ldlValues = validPatients.map(p => p.before.ldl).filter((v): v is number => v !== undefined);

  // Интерлейкины
  const il1Values = validPatients.map(p => p.before.il1).filter((v): v is number => v !== undefined);
  const il6Values = validPatients.map(p => p.before.il6).filter((v): v is number => v !== undefined);
  const il10Values = validPatients.map(p => p.before.il10).filter((v): v is number => v !== undefined);
  const crpValues = validPatients.map(p => p.before.crp).filter((v): v is number => v !== undefined);

  const commonLayout = {
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    margin: { t: 30, b: 40, l: 50, r: 20 },
    font: { size: 12 },
  };

  return (
    <>
      <Box mb={4}>
        <HStack justify="space-between" align="center" mb={2}>
          <Text fontSize="sm" color="gray.600">
            {t("charts.loadedPatients", { count: validPatients.length })}
          </Text>
          <HStack spacing={2}>
            <Button size="sm" onClick={loadData} variant="outline">
              {t("charts.refresh")}
            </Button>
            <Button 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
              colorScheme="blue"
              variant="outline"
            >
              Загрузить CSV
            </Button>
          </HStack>
        </HStack>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        {/* Pie Chart: Распределение по полу */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.genderDistribution")}
          </Text>
          <Plot
            data={[
              {
                labels: Object.keys(genderDistribution),
                values: Object.values(genderDistribution),
                type: "pie",
                marker: {
                  colors: ["#3182CE", "#38A169", "#D69E2E"],
                },
              },
            ]}
            layout={{
              ...commonLayout,
              showlegend: true,
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: 300 }}
          />
        </Box>

        {/* Bar Chart: Распределение по возрасту */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.ageDistribution")}
          </Text>
          <Plot
            data={[
              {
                x: Object.keys(ageGroups),
                y: Object.values(ageGroups),
                type: "bar",
                marker: { color: "#805AD5" },
              },
            ]}
            layout={{
              ...commonLayout,
              xaxis: { title: t("charts.ageGroup") },
              yaxis: { title: t("charts.count") },
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: 300 }}
          />
        </Box>

        {/* Сравнение: САД до и после */}
        {systolicBPBefore.length > 0 && systolicBPAfter.length > 0 && (
          <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              {t("charts.systolicBPComparison")}
            </Text>
            <Plot
              data={[
                {
                  x: Array.from({ length: systolicBPBefore.length }, (_, i) => i + 1),
                  y: systolicBPBefore,
                  type: "scatter",
                  mode: "lines+markers",
                  name: t("charts.before"),
                  line: { color: "#E53E3E", width: 2 },
                  marker: { size: 6 },
                },
                {
                  x: Array.from({ length: systolicBPAfter.length }, (_, i) => i + 1),
                  y: systolicBPAfter,
                  type: "scatter",
                  mode: "lines+markers",
                  name: t("charts.after24h"),
                  line: { color: "#38A169", width: 2 },
                  marker: { size: 6 },
                },
              ]}
              layout={{
                ...commonLayout,
                xaxis: { title: t("charts.patientNumber") },
                yaxis: { title: t("charts.systolicBP") },
              }}
              config={{ displayModeBar: false }}
              style={{ width: "100%", height: 300 }}
            />
          </Box>
        )}

        {/* Сравнение: ДАД до и после */}
        {diastolicBPBefore.length > 0 && diastolicBPAfter.length > 0 && (
          <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              {t("charts.diastolicBPComparison")}
            </Text>
            <Plot
              data={[
                {
                  x: Array.from({ length: diastolicBPBefore.length }, (_, i) => i + 1),
                  y: diastolicBPBefore,
                  type: "scatter",
                  mode: "lines+markers",
                  name: t("charts.before"),
                  line: { color: "#E53E3E", width: 2 },
                  marker: { size: 6 },
                },
                {
                  x: Array.from({ length: diastolicBPAfter.length }, (_, i) => i + 1),
                  y: diastolicBPAfter,
                  type: "scatter",
                  mode: "lines+markers",
                  name: t("charts.after24h"),
                  line: { color: "#38A169", width: 2 },
                  marker: { size: 6 },
                },
              ]}
              layout={{
                ...commonLayout,
                xaxis: { title: t("charts.patientNumber") },
                yaxis: { title: t("charts.diastolicBP") },
              }}
              config={{ displayModeBar: false }}
              style={{ width: "100%", height: 300 }}
            />
          </Box>
        )}

        {/* Сравнение: Глюкоза до и после */}
        {glucoseBefore.length > 0 && glucoseAfter.length > 0 && (
          <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              {t("charts.glucoseComparison")}
            </Text>
            <Plot
              data={[
                {
                  x: Array.from({ length: glucoseBefore.length }, (_, i) => i + 1),
                  y: glucoseBefore,
                  type: "bar",
                  name: t("charts.before"),
                  marker: { color: "#E53E3E" },
                },
                {
                  x: Array.from({ length: glucoseAfter.length }, (_, i) => i + 1),
                  y: glucoseAfter,
                  type: "bar",
                  name: t("charts.after24h"),
                  marker: { color: "#38A169" },
                },
              ]}
              layout={{
                ...commonLayout,
                xaxis: { title: t("charts.patientNumber") },
                yaxis: { title: t("charts.glucose") },
                barmode: "group",
              }}
              config={{ displayModeBar: false }}
              style={{ width: "100%", height: 300 }}
            />
          </Box>
        )}

        {/* Сравнение: Креатинин до и после */}
        {creatinineBefore.length > 0 && creatinineAfter.length > 0 && (
          <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              {t("charts.creatinineComparison")}
            </Text>
            <Plot
              data={[
                {
                  x: Array.from({ length: creatinineBefore.length }, (_, i) => i + 1),
                  y: creatinineBefore,
                  type: "scatter",
                  mode: "lines+markers",
                  name: t("charts.before"),
                  line: { color: "#E53E3E", width: 2 },
                  marker: { size: 6 },
                },
                {
                  x: Array.from({ length: creatinineAfter.length }, (_, i) => i + 1),
                  y: creatinineAfter,
                  type: "scatter",
                  mode: "lines+markers",
                  name: t("charts.after24h"),
                  line: { color: "#38A169", width: 2 },
                  marker: { size: 6 },
                },
              ]}
              layout={{
                ...commonLayout,
                xaxis: { title: t("charts.patientNumber") },
                yaxis: { title: t("charts.creatinine") },
              }}
              config={{ displayModeBar: false }}
              style={{ width: "100%", height: 300 }}
            />
          </Box>
        )}

        {/* Липидный профиль */}
        {cholesterolValues.length > 0 && (
          <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              {t("charts.lipidProfile")}
            </Text>
            <Plot
              data={[
                {
                  y: cholesterolValues,
                  type: "box",
                  name: t("charts.cholesterol"),
                  marker: { color: "#3182CE" },
                },
                {
                  y: triglyceridesValues.length > 0 ? triglyceridesValues : [],
                  type: "box",
                  name: t("charts.triglycerides"),
                  marker: { color: "#38A169" },
                },
                {
                  y: hdlValues.length > 0 ? hdlValues : [],
                  type: "box",
                  name: t("charts.hdl"),
                  marker: { color: "#D69E2E" },
                },
                {
                  y: ldlValues.length > 0 ? ldlValues : [],
                  type: "box",
                  name: t("charts.ldl"),
                  marker: { color: "#E53E3E" },
                },
              ]}
              layout={{
                ...commonLayout,
                yaxis: { title: t("charts.value") },
              }}
              config={{ displayModeBar: false }}
              style={{ width: "100%", height: 300 }}
            />
          </Box>
        )}

        {/* Интерлейкины и маркеры воспаления */}
        {(il1Values.length > 0 || il6Values.length > 0 || il10Values.length > 0 || crpValues.length > 0) && (
          <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              {t("charts.inflammatoryMarkers")}
            </Text>
            <Plot
              data={[
                ...(il1Values.length > 0 ? [{
                  y: il1Values,
                  type: "box",
                  name: "ИЛ-1",
                  marker: { color: "#3182CE" },
                }] : []),
                ...(il6Values.length > 0 ? [{
                  y: il6Values,
                  type: "box",
                  name: "ИЛ-6",
                  marker: { color: "#38A169" },
                }] : []),
                ...(il10Values.length > 0 ? [{
                  y: il10Values,
                  type: "box",
                  name: "ИЛ-10",
                  marker: { color: "#D69E2E" },
                }] : []),
                ...(crpValues.length > 0 ? [{
                  y: crpValues,
                  type: "box",
                  name: "вчСРБ",
                  marker: { color: "#E53E3E" },
                }] : []),
              ]}
              layout={{
                ...commonLayout,
                yaxis: { title: t("charts.value") },
              }}
              config={{ displayModeBar: false }}
              style={{ width: "100%", height: 300 }}
            />
          </Box>
        )}
      </SimpleGrid>
    </>
  );
}

