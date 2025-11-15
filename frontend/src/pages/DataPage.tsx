import { SimpleGrid, Box, Text, Flex, Button, VStack } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardCards from "../components/DashboardCards";
import DataUploadCTA from "../components/DataUploadCTA";
import ChartsPreview from "../components/ChartsPreview";
import DocumentUpload, { DocumentRecord } from "../components/DocumentUpload";

export default function DataPage() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);

  return (
    <>
      <DashboardCards />
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <DataUploadCTA />
        <ChartsPreview />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={6}>
        <DocumentUpload documents={documents} onUpload={setDocuments} />
        <Box borderWidth="1px" borderRadius="xl" p={6}>
          <Flex justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold">
              {t("common.quickReports")}
            </Text>
            <Button leftIcon={<AddIcon />} colorScheme="brand" size="sm">
              {t("common.newReport")}
            </Button>
          </Flex>
          <VStack align="stretch">
            <Box p={4} borderWidth="1px" borderRadius="md">
              <Text fontWeight="medium">{t("reports.conference")} 2025</Text>
              <Text fontSize="sm" color="gray.500">
                {t("data.docLastUpdated", { time: "2h" })} • PDF, PPT
              </Text>
            </Box>
          </VStack>
        </Box>
      </SimpleGrid>
    </>
  );
}

