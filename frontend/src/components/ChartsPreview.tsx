import Plot from "react-plotly.js";
import { Box, Text, SimpleGrid } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useFilters } from "../store/filters";

// Типы данных для графиков
type KMData = {
  groupA: { x: number[]; y: number[] };
  groupB: { x: number[]; y: number[] };
};

type ROCData = {
  fpr: number[];
  tpr: number[];
  auc: number;
};

type BoxPlotData = {
  groupA: number[];
  groupB: number[];
  label: string;
};

type ScatterData = {
  x: number[];
  y: number[];
  labels: string[];
};

type ChartData = {
  km: KMData;
  roc: ROCData;
  boxPlot: BoxPlotData[];
  scatter: ScatterData;
};

// Данные для каждого проекта
const projectChartData: Record<string, ChartData> = {
  "550e8400-e29b-41d4-a716-446655440001": {
    // PRIM-01-08 - Артериальная гипертензия
    km: {
      groupA: { x: [0, 5, 10, 15, 20], y: [1, 0.88, 0.75, 0.62, 0.48] },
      groupB: { x: [0, 5, 10, 15, 20], y: [1, 0.94, 0.86, 0.78, 0.70] },
    },
    roc: {
      fpr: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      tpr: [0, 0.15, 0.32, 0.48, 0.62, 0.74, 0.84, 0.91, 0.96, 0.99, 1.0],
      auc: 0.85,
    },
    boxPlot: [
      { groupA: [120, 130, 125, 135, 140, 128, 132, 138], groupB: [115, 120, 118, 122, 125, 120, 119, 123], label: "САД, мм рт.ст." },
      { groupA: [85, 90, 88, 92, 95, 87, 90, 93], groupB: [80, 82, 81, 85, 83, 82, 84, 81], label: "ДАД, мм рт.ст." },
      { groupA: [5.2, 5.8, 5.5, 6.1, 6.3, 5.6, 5.9, 6.0], groupB: [4.8, 5.2, 5.0, 5.4, 5.3, 5.1, 5.2, 5.1], label: "Глюкоза, ммоль/л" },
    ],
    scatter: {
      x: [120, 130, 125, 135, 140, 128, 132, 138, 115, 120, 118, 122],
      y: [85, 90, 88, 92, 95, 87, 90, 93, 80, 82, 81, 85],
      labels: ["A", "A", "A", "A", "A", "A", "A", "A", "B", "B", "B", "B"],
    },
  },
  "550e8400-e29b-41d4-a716-446655440002": {
    // FZ-2020103185 - Сахарный диабет 2 типа
    km: {
      groupA: { x: [0, 5, 10, 15, 20], y: [1, 0.85, 0.70, 0.55, 0.42] },
      groupB: { x: [0, 5, 10, 15, 20], y: [1, 0.92, 0.84, 0.76, 0.68] },
    },
    roc: {
      fpr: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      tpr: [0, 0.18, 0.35, 0.51, 0.65, 0.77, 0.86, 0.93, 0.97, 0.99, 1.0],
      auc: 0.82,
    },
    boxPlot: [
      { groupA: [8.5, 9.2, 9.0, 9.8, 10.1, 9.3, 9.6, 9.9], groupB: [6.8, 7.2, 7.0, 7.5, 7.3, 7.1, 7.2, 7.0], label: "Глюкоза, ммоль/л" },
      { groupA: [7.5, 8.2, 7.9, 8.5, 8.8, 8.0, 8.3, 8.6], groupB: [6.2, 6.8, 6.5, 7.0, 6.9, 6.6, 6.7, 6.8], label: "HbA1c, %" },
      { groupA: [150, 165, 158, 172, 178, 162, 168, 175], groupB: [120, 132, 128, 138, 135, 130, 133, 132], label: "Инсулин, мкЕд/мл" },
    ],
    scatter: {
      x: [8.5, 9.2, 9.0, 9.8, 10.1, 9.3, 9.6, 9.9, 6.8, 7.2, 7.0, 7.5],
      y: [7.5, 8.2, 7.9, 8.5, 8.8, 8.0, 8.3, 8.6, 6.2, 6.8, 6.5, 7.0],
      labels: ["A", "A", "A", "A", "A", "A", "A", "A", "B", "B", "B", "B"],
    },
  },
  "550e8400-e29b-41d4-a716-446655440003": {
    // FZ-2020103184 - Ишемическая болезнь сердца
    km: {
      groupA: { x: [0, 5, 10, 15, 20], y: [1, 0.90, 0.80, 0.68, 0.55] },
      groupB: { x: [0, 5, 10, 15, 20], y: [1, 0.96, 0.91, 0.85, 0.78] },
    },
    roc: {
      fpr: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      tpr: [0, 0.22, 0.42, 0.58, 0.71, 0.81, 0.89, 0.94, 0.97, 0.99, 1.0],
      auc: 0.88,
    },
    boxPlot: [
      { groupA: [5.2, 5.8, 5.5, 6.1, 6.4, 5.7, 6.0, 6.2], groupB: [4.5, 4.9, 4.7, 5.1, 5.0, 4.8, 4.9, 5.0], label: "Общий холестерин, ммоль/л" },
      { groupA: [3.2, 3.8, 3.5, 4.1, 4.3, 3.7, 4.0, 4.2], groupB: [2.5, 2.9, 2.7, 3.1, 3.0, 2.8, 2.9, 3.0], label: "ЛПНП, ммоль/л" },
      { groupA: [0.9, 1.1, 1.0, 1.2, 1.3, 1.05, 1.15, 1.25], groupB: [1.2, 1.4, 1.3, 1.5, 1.45, 1.35, 1.4, 1.42], label: "ЛПВП, ммоль/л" },
    ],
    scatter: {
      x: [5.2, 5.8, 5.5, 6.1, 6.4, 5.7, 6.0, 6.2, 4.5, 4.9, 4.7, 5.1],
      y: [3.2, 3.8, 3.5, 4.1, 4.3, 3.7, 4.0, 4.2, 2.5, 2.9, 2.7, 3.1],
      labels: ["A", "A", "A", "A", "A", "A", "A", "A", "B", "B", "B", "B"],
    },
  },
  "550e8400-e29b-41d4-a716-446655440004": {
    // АL-492598621 - Хроническая сердечная недостаточность
    km: {
      groupA: { x: [0, 5, 10, 15, 20], y: [1, 0.82, 0.65, 0.50, 0.38] },
      groupB: { x: [0, 5, 10, 15, 20], y: [1, 0.93, 0.87, 0.80, 0.72] },
    },
    roc: {
      fpr: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      tpr: [0, 0.12, 0.28, 0.45, 0.59, 0.71, 0.82, 0.90, 0.95, 0.98, 1.0],
      auc: 0.79,
    },
    boxPlot: [
      { groupA: [55, 62, 58, 68, 72, 60, 65, 70], groupB: [58, 62, 60, 65, 63, 61, 64, 62], label: "ФВ, %" },
      { groupA: [250, 320, 280, 380, 420, 300, 350, 400], groupB: [180, 220, 200, 240, 230, 210, 225, 220], label: "NT-proBNP, пг/мл" },
      { groupA: [120, 140, 130, 150, 155, 135, 145, 152], groupB: [95, 110, 105, 115, 112, 108, 113, 110], label: "Креатинин, мкмоль/л" },
    ],
    scatter: {
      x: [55, 62, 58, 68, 72, 60, 65, 70, 58, 62, 60, 65],
      y: [250, 320, 280, 380, 420, 300, 350, 400, 180, 220, 200, 240],
      labels: ["A", "A", "A", "A", "A", "A", "A", "A", "B", "B", "B", "B"],
    },
  },
  "550e8400-e29b-41d4-a716-446655440005": {
    // FL-9524114982 - Метаболический синдром
    km: {
      groupA: { x: [0, 5, 10, 15, 20], y: [1, 0.87, 0.73, 0.60, 0.48] },
      groupB: { x: [0, 5, 10, 15, 20], y: [1, 0.95, 0.89, 0.82, 0.75] },
    },
    roc: {
      fpr: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      tpr: [0, 0.16, 0.33, 0.49, 0.63, 0.75, 0.85, 0.92, 0.96, 0.99, 1.0],
      auc: 0.83,
    },
    boxPlot: [
      { groupA: [95, 105, 100, 110, 115, 102, 108, 112], groupB: [82, 88, 85, 92, 90, 87, 89, 91], label: "Окружность талии, см" },
      { groupA: [1.8, 2.2, 2.0, 2.4, 2.6, 2.1, 2.3, 2.5], groupB: [1.2, 1.5, 1.35, 1.6, 1.55, 1.4, 1.5, 1.52], label: "Триглицериды, ммоль/л" },
      { groupA: [28, 32, 30, 35, 38, 31, 33, 36], groupB: [22, 25, 24, 27, 26, 24, 25, 26], label: "ИМТ, кг/м²" },
    ],
    scatter: {
      x: [95, 105, 100, 110, 115, 102, 108, 112, 82, 88, 85, 92],
      y: [28, 32, 30, 35, 38, 31, 33, 36, 22, 25, 24, 27],
      labels: ["A", "A", "A", "A", "A", "A", "A", "A", "B", "B", "B", "B"],
    },
  },
};

// Данные по умолчанию
const defaultData: ChartData = {
  km: {
    groupA: { x: [0, 5, 10, 15, 20], y: [1, 0.92, 0.85, 0.7, 0.55] },
    groupB: { x: [0, 5, 10, 15, 20], y: [1, 0.95, 0.89, 0.77, 0.65] },
  },
  roc: {
    fpr: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    tpr: [0, 0.15, 0.30, 0.45, 0.60, 0.72, 0.82, 0.90, 0.95, 0.98, 1.0],
    auc: 0.81,
  },
  boxPlot: [
    { groupA: [100, 110, 105, 115, 120, 108, 112, 118], groupB: [90, 95, 92, 98, 96, 93, 94, 97], label: "Показатель 1" },
    { groupA: [50, 55, 52, 58, 60, 53, 56, 59], groupB: [45, 48, 46, 50, 49, 47, 48, 49], label: "Показатель 2" },
  ],
  scatter: {
    x: [100, 110, 105, 115, 120, 108, 112, 118, 90, 95, 92, 98],
    y: [50, 55, 52, 58, 60, 53, 56, 59, 45, 48, 46, 50],
    labels: ["A", "A", "A", "A", "A", "A", "A", "A", "B", "B", "B", "B"],
  },
};

const commonLayout = {
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  margin: { t: 30, b: 40, l: 50, r: 20 },
  font: { size: 12 },
};

export default function ChartsPreview() {
  const { t } = useTranslation();
  
  let selectedProject: string | undefined;
  try {
    selectedProject = useFilters((state) => state.project);
  } catch (error) {
    console.error("Ошибка получения фильтров:", error);
    selectedProject = undefined;
  }
  
  // Получаем данные для выбранного проекта или используем данные по умолчанию
  const chartData = selectedProject && projectChartData[selectedProject] 
    ? projectChartData[selectedProject] 
    : defaultData;

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
      {/* Kaplan-Meier - сохраняем как есть */}
      <Box borderWidth="1px" borderRadius="xl" p={6}>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          {t("charts.kmDemo")}
        </Text>
        <Plot
          data={[
            {
              x: chartData.km.groupA.x,
              y: chartData.km.groupA.y,
              type: "scatter",
              mode: "lines",
              name: "Группа A",
              line: { color: "#3182CE", width: 2 },
            },
            {
              x: chartData.km.groupB.x,
              y: chartData.km.groupB.y,
              type: "scatter",
              mode: "lines",
              name: "Группа B",
              line: { color: "#38A169", width: 2 },
            },
          ]}
          layout={{
            ...commonLayout,
            margin: { t: 10, b: 40, l: 40, r: 10 },
            xaxis: { title: "Время (мес)" },
            yaxis: { title: "Доля выживших", range: [0, 1] },
            legend: { orientation: "h" },
          }}
          config={{ displayModeBar: false }}
          style={{ width: "100%", height: 260 }}
        />
      </Box>

      {/* ROC кривая */}
      <Box borderWidth="1px" borderRadius="xl" p={6}>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          ROC кривая
        </Text>
        <Plot
          data={[
            {
              x: chartData.roc.fpr,
              y: chartData.roc.tpr,
              type: "scatter",
              mode: "lines",
              name: `ROC (AUC = ${chartData.roc.auc.toFixed(2)})`,
              line: { color: "#3182CE", width: 2 },
            },
            {
              x: [0, 1],
              y: [0, 1],
              type: "scatter",
              mode: "lines",
              name: "Диагональ",
              line: { color: "#E53E3E", width: 1, dash: "dash" },
            },
          ]}
          layout={{
            ...commonLayout,
            xaxis: { title: "Доля ложноположительных (1 - Специфичность)" },
            yaxis: { title: "Доля истинноположительных (Чувствительность)" },
            legend: { orientation: "h" },
          }}
          config={{ displayModeBar: false }}
          style={{ width: "100%", height: 260 }}
        />
      </Box>

      {/* Box Plot */}
      {chartData.boxPlot.slice(0, 2).map((plot, idx) => (
        <Box key={idx} borderWidth="1px" borderRadius="xl" p={6}>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {plot.label}
          </Text>
          <Plot
            data={[
              {
                y: plot.groupA,
                type: "box",
                name: "Группа A",
                marker: { color: "#3182CE" },
              },
              {
                y: plot.groupB,
                type: "box",
                name: "Группа B",
                marker: { color: "#38A169" },
              },
            ]}
            layout={{
              ...commonLayout,
              yaxis: { title: plot.label },
              legend: { orientation: "h" },
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: 260 }}
          />
        </Box>
      ))}

      {/* Scatter Plot */}
      <Box borderWidth="1px" borderRadius="xl" p={6} gridColumn={{ base: 1, md: "1 / -1" }}>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>
          Корреляционный анализ
        </Text>
        <Plot
          data={[
            {
              x: chartData.scatter.x.filter((_, i) => chartData.scatter.labels[i] === "A"),
              y: chartData.scatter.y.filter((_, i) => chartData.scatter.labels[i] === "A"),
              type: "scatter",
              mode: "markers",
              name: "Группа A",
              marker: { color: "#3182CE", size: 10 },
            },
            {
              x: chartData.scatter.x.filter((_, i) => chartData.scatter.labels[i] === "B"),
              y: chartData.scatter.y.filter((_, i) => chartData.scatter.labels[i] === "B"),
              type: "scatter",
              mode: "markers",
              name: "Группа B",
              marker: { color: "#38A169", size: 10 },
            },
          ]}
          layout={{
            ...commonLayout,
            xaxis: { title: "Показатель X" },
            yaxis: { title: "Показатель Y" },
            legend: { orientation: "h" },
          }}
          config={{ displayModeBar: false }}
          style={{ width: "100%", height: 300 }}
        />
      </Box>
    </SimpleGrid>
  );
}