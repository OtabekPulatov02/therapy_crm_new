import { SimpleGrid, Box, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function DashboardCards() {
  const { t } = useTranslation();
  const cards = [
    { label: t("dashboard.projects"), value: 28 },
    { label: t("dashboard.patients"), value: 1640 },
    { label: t("dashboard.biomarkers"), value: 42 },
    { label: t("dashboard.analyses"), value: 7 },
  ];

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
      {cards.map((card) => (
        <Box key={card.label} borderWidth="1px" borderRadius="lg" p={4} bg="white">
          <Stat>
            <StatLabel color="gray.500">{card.label}</StatLabel>
            <StatNumber color="brand.600">{card.value}</StatNumber>
          </Stat>
        </Box>
      ))}
    </SimpleGrid>
  );
}

