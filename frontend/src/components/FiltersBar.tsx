import { Box, HStack, Select } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useFilters } from "../store/filters";

export default function FiltersBar() {
  const { t } = useTranslation();
  const setFilter = useFilters((state) => state.setFilter);

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={6}>
      <HStack spacing={4}>
        <Select placeholder={t("filters.date") ?? ""} size="sm" onChange={(e) => setFilter("dateRange", e.target.value)} />
        <Select placeholder={t("filters.diagnosis") ?? ""} size="sm" onChange={(e) => setFilter("diagnosis", e.target.value)} />
        <Select placeholder={t("filters.project") ?? ""} size="sm" onChange={(e) => setFilter("project", e.target.value)} />
        <Select placeholder={t("filters.group") ?? ""} size="sm" onChange={(e) => setFilter("patientGroup", e.target.value)} />
      </HStack>
    </Box>
  );
}

