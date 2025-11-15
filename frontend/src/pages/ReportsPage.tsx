import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Tag,
  HStack,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";

const rows = [
  { name: "Biomarker Insights", type: "conference", format: "PDF" },
  { name: "Survival curves 2025", type: "clinical", format: "PPT" },
];

export default function ReportsPage() {
  const { t } = useTranslation();

  return (
    <Box borderWidth="1px" borderRadius="xl" p={6}>
      <HStack justify="space-between" mb={4}>
        <Text fontSize="lg" fontWeight="semibold">
          {t("reports.title")}
        </Text>
        <Button size="sm" leftIcon={<AddIcon />} colorScheme="brand">
          {t("common.newReport")}
        </Button>
      </HStack>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>{t("nav.reports")}</Th>
            <Th>{t("common.documents")}</Th>
            <Th textAlign="right">{t("reports.export")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row) => (
            <Tr key={row.name}>
              <Td>{row.name}</Td>
              <Td>
                <Tag colorScheme="green">{t(`reports.${row.type}`)}</Tag>
              </Td>
              <Td textAlign="right">
                <Button size="xs" variant="outline">
                  {row.format}
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

