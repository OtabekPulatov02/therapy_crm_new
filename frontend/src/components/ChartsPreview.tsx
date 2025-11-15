import Plot from "react-plotly.js";
import { Box, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function ChartsPreview() {
  const { t } = useTranslation();
  return (
    <Box borderWidth="1px" borderRadius="xl" p={6}>
      <Text fontSize="lg" fontWeight="semibold" mb={4}>
        {t("charts.kmDemo")}
      </Text>
      <Plot
        data={[
          {
            x: [0, 5, 10, 15, 20],
            y: [1, 0.92, 0.85, 0.7, 0.55],
            type: "scatter",
            mode: "lines",
            name: "Группа A",
          },
          {
            x: [0, 5, 10, 15, 20],
            y: [1, 0.95, 0.89, 0.77, 0.65],
            type: "scatter",
            mode: "lines",
            name: "Группа B",
          },
        ]}
        layout={{
          paper_bgcolor: "transparent",
          plot_bgcolor: "transparent",
          margin: { t: 10, b: 40, l: 40, r: 10 },
          xaxis: { title: "Время (мес)" },
          yaxis: { title: "Доля выживших", range: [0, 1] },
          legend: { orientation: "h" },
        }}
        config={{ displayModeBar: false }}
        style={{ width: "100%", height: 260 }}
      />
    </Box>
  );
}

