import Plot from "react-plotly.js";
import { Box, Text, SimpleGrid } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

// Данные из таблицы
const taskData = [
  {
    id: 1,
    name: "Task 1",
    type: "Task",
    status: "To Do",
    priority: "High",
    assignee: "John Doe",
    dueDate: "2023-10-26",
    createdDate: "2023-10-20",
    lastUpdated: "2023-10-25 10:30",
    storyPoints: 5,
    timeEstimate: 8,
    timeSpent: 6,
    progress: 75,
    project: "Project A",
    sprint: "Sprint 1",
  },
  {
    id: 2,
    name: "Task 2",
    type: "Bug",
    status: "In Progress",
    priority: "Medium",
    assignee: "Jane Smith",
    dueDate: "2023-11-01",
    createdDate: "2023-10-21",
    lastUpdated: "2023-10-25 11:00",
    storyPoints: 8,
    timeEstimate: 16,
    timeSpent: 10,
    progress: 60,
    project: "Project B",
    sprint: "Sprint 2",
  },
  {
    id: 3,
    name: "Task 3",
    type: "Feature",
    status: "Done",
    priority: "Low",
    assignee: "Alice Johnson",
    dueDate: "2023-10-20",
    createdDate: "2023-10-15",
    lastUpdated: "2023-10-25 09:45",
    storyPoints: 3,
    timeEstimate: 4,
    timeSpent: 4,
    progress: 100,
    project: "Project A",
    sprint: "Sprint 1",
  },
  {
    id: 4,
    name: "Task 4",
    type: "Story",
    status: "Blocked",
    priority: "Critical",
    assignee: "Bob Williams",
    dueDate: "2023-11-15",
    createdDate: "2023-10-22",
    lastUpdated: "2023-10-25 12:15",
    storyPoints: 13,
    timeEstimate: 24,
    timeSpent: 12,
    progress: 50,
    project: "Project C",
    sprint: "Sprint 3",
  },
  {
    id: 5,
    name: "Task 5",
    type: "Epic",
    status: "Review",
    priority: "Urgent",
    assignee: "Charlie Brown",
    dueDate: "2023-12-01",
    createdDate: "2023-10-18",
    lastUpdated: "2023-10-25 08:00",
    storyPoints: 20,
    timeEstimate: 40,
    timeSpent: 0,
    progress: 0,
    project: "Project B",
    sprint: "Sprint 2",
  },
  {
    id: 6,
    name: "Task 6",
    type: "Subtask",
    status: "Closed",
    priority: "Normal",
    assignee: "David Green",
    dueDate: "2023-10-28",
    createdDate: "2023-10-23",
    lastUpdated: "2023-10-25 13:00",
    storyPoints: 2,
    timeEstimate: 2,
    timeSpent: 1,
    progress: 50,
    project: "Project A",
    sprint: "Sprint 1",
  },
];

export default function TaskDashboardCharts() {
  const { t } = useTranslation();

  // Подготовка данных для графиков
  const statusCounts = taskData.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityCounts = taskData.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeCounts = taskData.reduce((acc, task) => {
    acc[task.type] = (acc[task.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const projectCounts = taskData.reduce((acc, task) => {
    acc[task.project] = (acc[task.project] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const assigneeWorkload = taskData.reduce((acc, task) => {
    acc[task.assignee] = (acc[task.assignee] || 0) + task.storyPoints;
    return acc;
  }, {} as Record<string, number>);

  const storyPointsByProject = taskData.reduce((acc, task) => {
    acc[task.project] = (acc[task.project] || 0) + task.storyPoints;
    return acc;
  }, {} as Record<string, number>);

  // Данные для трендов
  const progressTrend = taskData.map((task) => task.progress);
  const timeEfficiency = taskData.map((task) => 
    task.timeEstimate > 0 ? (task.timeSpent / task.timeEstimate) * 100 : 0
  );
  const storyPointsTrend = taskData.map((task) => task.storyPoints);

  const commonLayout = {
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    margin: { t: 30, b: 40, l: 50, r: 20 },
    font: { size: 12 },
  };

  return (
    <>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        {/* Bar Chart: Распределение по статусам */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.statusDistribution")}
          </Text>
          <Plot
            data={[
              {
                x: Object.keys(statusCounts),
                y: Object.values(statusCounts),
                type: "bar",
                marker: { color: "#3182CE" },
              },
            ]}
            layout={{
              ...commonLayout,
              xaxis: { title: t("charts.status") },
              yaxis: { title: t("charts.count") },
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: 300 }}
          />
        </Box>

        {/* Pie Chart: Распределение по статусам */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.statusBreakdown")}
          </Text>
          <Plot
            data={[
              {
                labels: Object.keys(statusCounts),
                values: Object.values(statusCounts),
                type: "pie",
                hole: 0.4,
                marker: {
                  colors: ["#3182CE", "#38A169", "#D69E2E", "#E53E3E", "#805AD5", "#DD6B20"],
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

        {/* Bar Chart: Распределение по приоритетам */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.priorityDistribution")}
          </Text>
          <Plot
            data={[
              {
                x: Object.keys(priorityCounts),
                y: Object.values(priorityCounts),
                type: "bar",
                marker: { 
                  color: Object.keys(priorityCounts).map(p => {
                    if (p === "Critical" || p === "Urgent") return "#E53E3E";
                    if (p === "High") return "#DD6B20";
                    if (p === "Medium") return "#D69E2E";
                    return "#38A169";
                  })
                },
              },
            ]}
            layout={{
              ...commonLayout,
              xaxis: { title: t("charts.priority") },
              yaxis: { title: t("charts.count") },
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: 300 }}
          />
        </Box>

        {/* Pie Chart: Распределение по типам */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.typeBreakdown")}
          </Text>
          <Plot
            data={[
              {
                labels: Object.keys(typeCounts),
                values: Object.values(typeCounts),
                type: "pie",
                marker: {
                  colors: ["#3182CE", "#38A169", "#D69E2E", "#E53E3E", "#805AD5", "#DD6B20"],
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

        {/* Bar Chart: Нагрузка по исполнителям */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.assigneeWorkload")}
          </Text>
          <Plot
            data={[
              {
                x: Object.keys(assigneeWorkload),
                y: Object.values(assigneeWorkload),
                type: "bar",
                marker: { color: "#805AD5" },
              },
            ]}
            layout={{
              ...commonLayout,
              xaxis: { title: t("charts.assignee") },
              yaxis: { title: t("charts.storyPoints") },
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: 300 }}
          />
        </Box>

        {/* Pie Chart: Распределение по проектам */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.projectDistribution")}
          </Text>
          <Plot
            data={[
              {
                labels: Object.keys(projectCounts),
                values: Object.values(projectCounts),
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

        {/* Bar Chart: Story Points по проектам */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.storyPointsByProject")}
          </Text>
          <Plot
            data={[
              {
                x: Object.keys(storyPointsByProject),
                y: Object.values(storyPointsByProject),
                type: "bar",
                marker: { color: "#38A169" },
              },
            ]}
            layout={{
              ...commonLayout,
              xaxis: { title: t("charts.project") },
              yaxis: { title: t("charts.storyPoints") },
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: 300 }}
          />
        </Box>

        {/* Trend Chart: Прогресс задач */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.progressTrend")}
          </Text>
          <Plot
            data={[
              {
                x: taskData.map((_, i) => i + 1),
                y: progressTrend,
                type: "scatter",
                mode: "lines+markers",
                name: t("charts.progress"),
                line: { color: "#3182CE", width: 2 },
                marker: { size: 8 },
              },
            ]}
            layout={{
              ...commonLayout,
              xaxis: { title: t("charts.taskNumber") },
              yaxis: { title: t("charts.progressPercent"), range: [0, 100] },
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: 300 }}
          />
        </Box>

        {/* Trend Chart: Эффективность времени */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.timeEfficiency")}
          </Text>
          <Plot
            data={[
              {
                x: taskData.map((_, i) => i + 1),
                y: timeEfficiency,
                type: "scatter",
                mode: "lines+markers",
                name: t("charts.efficiency"),
                line: { color: "#38A169", width: 2 },
                marker: { size: 8 },
              },
            ]}
            layout={{
              ...commonLayout,
              xaxis: { title: t("charts.taskNumber") },
              yaxis: { title: t("charts.efficiencyPercent") },
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: 300 }}
          />
        </Box>

        {/* Trend Chart: Story Points тренд */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.storyPointsTrend")}
          </Text>
          <Plot
            data={[
              {
                x: taskData.map((_, i) => i + 1),
                y: storyPointsTrend,
                type: "scatter",
                mode: "lines+markers",
                name: t("charts.storyPoints"),
                line: { color: "#805AD5", width: 2 },
                marker: { size: 8 },
              },
            ]}
            layout={{
              ...commonLayout,
              xaxis: { title: t("charts.taskNumber") },
              yaxis: { title: t("charts.storyPoints") },
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: 300 }}
          />
        </Box>

        {/* Сравнение: Время оцененное vs потраченное */}
        <Box borderWidth="1px" borderRadius="xl" p={6} bg="white">
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.timeComparison")}
          </Text>
          <Plot
            data={[
              {
                x: taskData.map((t) => t.name),
                y: taskData.map((t) => t.timeEstimate),
                type: "bar",
                name: t("charts.estimated"),
                marker: { color: "#3182CE" },
              },
              {
                x: taskData.map((t) => t.name),
                y: taskData.map((t) => t.timeSpent),
                type: "bar",
                name: t("charts.spent"),
                marker: { color: "#38A169" },
              },
            ]}
            layout={{
              ...commonLayout,
              xaxis: { title: t("charts.task") },
              yaxis: { title: t("charts.hours") },
              barmode: "group",
            }}
            config={{ displayModeBar: false }}
            style={{ width: "100%", height: 300 }}
          />
        </Box>
      </SimpleGrid>
    </>
  );
}

