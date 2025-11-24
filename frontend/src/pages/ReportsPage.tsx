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
  VStack,
  Input,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { AddIcon, AttachmentIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";

export type ReportRecord = {
  id: string;
  name: string;
  type: string;
  format: string;
  file?: File;
  uploadedAt: string;
  size?: number;
};

export default function ReportsPage() {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [newReportName, setNewReportName] = useState("");
  const [newReportType, setNewReportType] = useState("conference");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Загружаем отчеты из localStorage при монтировании
  useEffect(() => {
    const savedReports = localStorage.getItem("saved_reports");
    if (savedReports) {
      try {
        const parsed = JSON.parse(savedReports);
        // Конвертируем uploadedAt строки обратно в даты
        setReports(parsed.map((r: ReportRecord) => ({
          ...r,
          uploadedAt: r.uploadedAt,
        })));
      } catch (e) {
        console.error("Ошибка загрузки отчетов из localStorage:", e);
      }
    }
  }, []);

  // Сохраняем отчеты в localStorage при изменении
  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem("saved_reports", JSON.stringify(reports));
    }
  }, [reports]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCreateReport = () => {
    if (!newReportName.trim()) {
      toast({
        status: "warning",
        title: "Внимание",
        description: "Введите название отчета",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        status: "warning",
        title: "Внимание",
        description: "Выберите файл для загрузки",
      });
      return;
    }

    const fileExtension = selectedFile.name.split('.').pop()?.toUpperCase() || 'PDF';
    const newReport: ReportRecord = {
      id: crypto.randomUUID(),
      name: newReportName,
      type: newReportType,
      format: fileExtension,
      uploadedAt: new Date().toISOString(),
      size: selectedFile.size,
    };

    setReports([newReport, ...reports]);
    setNewReportName("");
    setNewReportType("conference");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();

    toast({
      status: "success",
      title: "Успешно",
      description: `Отчет "${newReportName}" сохранен`,
    });
  };

  const handleExport = (report: ReportRecord) => {
    toast({
      status: "info",
      title: "Экспорт",
      description: `Экспорт отчета "${report.name}" в формате ${report.format}`,
    });
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box borderWidth="1px" borderRadius="xl" p={6}>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold">
              {t("reports.title")}
            </Text>
            <Button size="sm" leftIcon={<AddIcon />} colorScheme="brand" onClick={onOpen}>
              {t("common.newReport")}
            </Button>
          </HStack>

          {reports.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500" mb={4}>
                Нет сохраненных отчетов
              </Text>
              <Button leftIcon={<AddIcon />} colorScheme="brand" onClick={onOpen}>
                Создать первый отчет
              </Button>
            </Box>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Название</Th>
                  <Th>Тип</Th>
                  <Th>Формат</Th>
                  <Th>Дата загрузки</Th>
                  <Th textAlign="right">Действия</Th>
                </Tr>
              </Thead>
              <Tbody>
                {reports.map((report) => (
                  <Tr key={report.id}>
                    <Td>
                      <HStack>
                        <AttachmentIcon color="brand.500" />
                        <Text fontWeight="medium">{report.name}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Tag colorScheme="green">{t(`reports.${report.type}`)}</Tag>
                    </Td>
                    <Td>
                      <Tag>{report.format}</Tag>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.500">
                        {new Date(report.uploadedAt).toLocaleString()}
                      </Text>
                    </Td>
                    <Td textAlign="right">
                      <Button size="xs" variant="outline" onClick={() => handleExport(report)}>
                        {report.format}
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      </VStack>

      {/* Модальное окно создания отчета */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Создать новый отчет</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Название отчета</FormLabel>
                <Input
                  value={newReportName}
                  onChange={(e) => setNewReportName(e.target.value)}
                  placeholder="Введите название отчета"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Тип отчета</FormLabel>
                <Select value={newReportType} onChange={(e) => setNewReportType(e.target.value)}>
                  <option value="conference">{t("reports.conference")}</option>
                  <option value="clinical">{t("reports.clinical")}</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Файл отчета</FormLabel>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  onChange={handleFileSelect}
                />
                {selectedFile && (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Выбран: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </Text>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Отмена
            </Button>
            <Button colorScheme="brand" onClick={handleCreateReport}>
              Сохранить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
