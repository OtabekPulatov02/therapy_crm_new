import { Box, Button, Text, VStack, List, ListItem, ListIcon, Input } from "@chakra-ui/react";
import { AddIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useToast } from "@chakra-ui/react";
import { useRef } from "react";

const formats = ["CSV", "XLS/XLSX", "SQL", "API"];

export default function DataUploadCTA() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        status: "success",
        title: "Файл выбран",
        description: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
      });
      // Здесь можно добавить логику загрузки файла на сервер
      // Пока просто показываем уведомление
    }
  };

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
        <Input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={handleFileChange}
          display="none"
        />
        <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={handleUpload}>
          {t("common.uploadData")}
        </Button>
      </VStack>
    </Box>
  );
}

