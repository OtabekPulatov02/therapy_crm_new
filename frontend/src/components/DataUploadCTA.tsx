import { Box, Button, Text, VStack, List, ListItem, ListIcon } from "@chakra-ui/react";
import { AddIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";

const formats = ["CSV", "XLS/XLSX", "SQL", "API"];

export default function DataUploadCTA() {
  const { t } = useTranslation();
  return (
    <Box borderWidth="1px" borderRadius="xl" p={6} bg="gray.50">
      <VStack align="start" spacing={4}>
        <Text fontSize="lg" fontWeight="semibold">
          {t("common.uploadData")}
        </Text>
        <Text color="gray.600">{t("data.uploadHint")}</Text>
        <List spacing={2}>
          {formats.map((format) => (
            <ListItem key={format}>
              <ListIcon as={CheckCircleIcon} color="brand.200" />
              {format}
            </ListItem>
          ))}
        </List>
        <Button leftIcon={<AddIcon />} colorScheme="brand">
          {t("common.uploadData")}
        </Button>
      </VStack>
    </Box>
  );
}

