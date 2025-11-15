import { Box, Button, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

const blocks = ["analysis.descriptive", "analysis.hypothesis", "analysis.survival", "analysis.ml"];

export default function AnalysisPage() {
  const { t } = useTranslation();

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        {t("analysis.title")}
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {blocks.map((key) => (
          <Box key={key} borderWidth="1px" borderRadius="xl" p={5}>
            <Text fontWeight="semibold" mb={3}>
              {t(key)}
            </Text>
            <VStack align="stretch" spacing={2} fontSize="sm" color="gray.600">
              <Text>• CSV / SQL</Text>
              <Text>• Filters & groups</Text>
              <Text>• Export ready</Text>
            </VStack>
            <Button mt={4} colorScheme="brand" size="sm">
              {t("analysis.run")}
            </Button>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}

