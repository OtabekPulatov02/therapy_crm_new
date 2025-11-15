import { Box, Button, SimpleGrid, Text } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import ChartsPreview from "../components/ChartsPreview";

export default function ChartsPage() {
  const { t } = useTranslation();

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Box borderWidth="1px" borderRadius="xl" p={6}>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>
            {t("charts.title")}
          </Text>
          <Text fontSize="sm" color="gray.500" mb={4}>
            {t("charts.recent")}
          </Text>
          <Button leftIcon={<AddIcon />} colorScheme="brand" size="sm">
            {t("common.add")}
          </Button>
        </Box>
        <ChartsPreview />
      </SimpleGrid>
    </Box>
  );
}

