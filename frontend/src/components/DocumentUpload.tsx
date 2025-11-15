import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  List,
  ListIcon,
  ListItem,
  Text,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, AttachmentIcon, CloseIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";

export type DocumentRecord = {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
};

type DocumentUploadProps = {
  documents: DocumentRecord[];
  onUpload: (docs: DocumentRecord[]) => void;
};

export default function DocumentUpload({ documents, onUpload }: DocumentUploadProps) {
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const toast = useToast();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setSelectedFiles(fileArray);
  };

  const handleUpload = () => {
    if (!selectedFiles.length) {
      toast({
        status: "info",
        title: t("common.uploadDocs"),
        description: t("data.docListEmpty"),
      });
      return;
    }
    const newDocs = selectedFiles.map<DocumentRecord>((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      uploadedAt: new Date().toISOString(),
    }));
    onUpload([...newDocs, ...documents]);
    setSelectedFiles([]);
    toast({
      status: "success",
      title: t("common.documents"),
      description: `${newDocs.length} ${t("common.add").toLowerCase()}`,
    });
  };

  const removeDoc = (id: string) => {
    onUpload(documents.filter((doc) => doc.id !== id));
  };

  return (
    <Box borderWidth="1px" borderRadius="xl" p={6}>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="lg" fontWeight="semibold">
          {t("common.documents")}
        </Text>
        <Button size="sm" leftIcon={<AddIcon />} onClick={handleUpload}>
          {t("common.uploadDocs")}
        </Button>
      </Flex>
      <HStack spacing={3} mb={4}>
        <Input type="file" multiple onChange={(e) => handleFiles(e.target.files)} />
        <Button variant="outline" onClick={handleUpload}>
          {t("common.add")}
        </Button>
      </HStack>
      <List spacing={2} maxH="220px" overflowY="auto">
        {documents.length === 0 && (
          <Text color="gray.500" fontSize="sm">
            {t("data.docListEmpty")}
          </Text>
        )}
        {documents.map((doc) => (
          <ListItem key={doc.id} display="flex" alignItems="center" justifyContent="space-between">
            <HStack spacing={3}>
              <ListIcon as={AttachmentIcon} color="brand.500" />
              <Box>
                <Text fontWeight="medium">{doc.name}</Text>
                <Text fontSize="xs" color="gray.500">
                  {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleString()}
                </Text>
              </Box>
            </HStack>
            <IconButton
              aria-label="remove"
              icon={<CloseIcon />}
              size="xs"
              variant="ghost"
              onClick={() => removeDoc(doc.id)}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

