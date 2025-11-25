import { SimpleGrid, Box, Text, Flex, Button, VStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardCards from "../components/DashboardCards";
import DataUploadCTA from "../components/DataUploadCTA";
import ChartsPreview from "../components/ChartsPreview";
import MedicalDashboardCharts from "../components/MedicalDashboardCharts";
import DocumentUpload, { DocumentRecord } from "../components/DocumentUpload";
import ErrorBoundary from "../components/ErrorBoundary";

export default function DataPage() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  // Загружаем документы из localStorage при монтировании
  useEffect(() => {
    const savedDocs = localStorage.getItem("uploaded_documents");
    if (savedDocs) {
      try {
        setDocuments(JSON.parse(savedDocs));
      } catch (e) {
        console.error("Ошибка загрузки документов из localStorage:", e);
      }
    }
  }, []);

  // Сохраняем документы в localStorage при изменении
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem("uploaded_documents", JSON.stringify(documents));
    }
  }, [documents]);

  const handleNewReport = () => {
    // Переход на страницу отчетов для создания нового отчета
    window.location.href = "/reports";
  };

  return (
    <>
      <ErrorBoundary>
        <DashboardCards />
      </ErrorBoundary>
      <ErrorBoundary>
        <DataUploadCTA />
      </ErrorBoundary>

      {/* Графики проектов */}
      <Box mt={6}>
        <ErrorBoundary>
          <ChartsPreview />
        </ErrorBoundary>
      </Box>

      {/* Медицинские графики из Google Sheets */}
      <Box mt={6}>
        <Text fontSize="xl" fontWeight="bold" mb={4} color="brand.600">
          {t("charts.medicalAnalytics")}
        </Text>
        <ErrorBoundary>
          <MedicalDashboardCharts />
        </ErrorBoundary>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={6}>
        <DocumentUpload documents={documents} onUpload={setDocuments} />
        <Box borderWidth="1px" borderRadius="xl" p={6}>
          <Flex justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold">
              {t("common.quickReports")}
            </Text>
            <Button leftIcon={<AddIcon />} colorScheme="brand" size="sm" onClick={handleNewReport}>
              {t("common.newReport")}
            </Button>
          </Flex>
          <VStack align="stretch">
            {documents.length > 0 ? (
              documents.slice(0, 3).map((doc) => (
                <Box key={doc.id} p={4} borderWidth="1px" borderRadius="md">
                  <Text fontWeight="medium">{doc.name}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(doc.uploadedAt).toLocaleString()} • {(doc.size / 1024).toFixed(1)} KB
                  </Text>
                </Box>
              ))
            ) : (
              <Box p={4} borderWidth="1px" borderRadius="md">
                <Text fontWeight="medium">{t("reports.conference")} 2025</Text>
                <Text fontSize="sm" color="gray.500">
                  {t("data.docLastUpdated", { time: "2h" })} • PDF, PPT
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </SimpleGrid>
    </>
  );
}

