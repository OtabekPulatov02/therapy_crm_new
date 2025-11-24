import { Box, Button, SimpleGrid, Text, VStack, Input, useToast, Alert, AlertIcon } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
import ChartsPreview from "../components/ChartsPreview";
import MedicalDashboardCharts from "../components/MedicalDashboardCharts";
import { parseCSV, transformToPatientData, PatientData } from "../utils/googleSheets";

export default function ChartsPage() {
  const { t } = useTranslation();
  const [uploadedData, setUploadedData] = useState<PatientData[]>([]);
  const [showCharts, setShowCharts] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log('Загрузка CSV файла:', file.name);
      const text = await file.text();
      const csvData = parseCSV(text);
      
      if (csvData.length === 0) {
        toast({
          status: "error",
          title: "Ошибка",
          description: "Не удалось распарсить CSV файл. Убедитесь, что файл содержит данные.",
        });
        return;
      }
      
      const patientData = transformToPatientData(csvData);
      
      if (patientData.length === 0) {
        toast({
          status: "error",
          title: "Ошибка",
          description: "Не удалось преобразовать данные. Проверьте структуру CSV файла.",
        });
        return;
      }

      setUploadedData(patientData);
      setShowCharts(true);
      
      toast({
        status: "success",
        title: "Успешно",
        description: `Загружено ${patientData.length} записей пациентов`,
      });
    } catch (err) {
      toast({
        status: "error",
        title: "Ошибка загрузки",
        description: err instanceof Error ? err.message : "Неизвестная ошибка",
      });
      console.error("Ошибка загрузки файла:", err);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Загрузка CSV */}
        <Box borderWidth="1px" borderRadius="xl" p={6}>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            {t("charts.title")}
          </Text>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" color="gray.600" mb={2}>
                Загрузите CSV файл с данными пациентов для построения графиков
              </Text>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                display="none"
              />
              <Button
                leftIcon={<AddIcon />}
                colorScheme="brand"
                onClick={() => fileInputRef.current?.click()}
              >
                Загрузить CSV файл
              </Button>
            </Box>
          </VStack>
        </Box>

        {/* Графики из загруженного CSV */}
        {showCharts && uploadedData.length > 0 && (
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={4} color="brand.600">
              Графики по загруженным данным ({uploadedData.length} записей)
            </Text>
            <MedicalDashboardCharts customData={uploadedData.length > 0 ? uploadedData : undefined} />
          </Box>
        )}

        {/* Демо графики */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box borderWidth="1px" borderRadius="xl" p={6}>
            <Text fontSize="lg" fontWeight="semibold" mb={2}>
              {t("charts.recent")}
            </Text>
            <Text fontSize="sm" color="gray.500" mb={4}>
              Примеры графиков
            </Text>
          </Box>
          <ChartsPreview />
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
