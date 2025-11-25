import { Box, HStack, Select } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useFilters } from "../store/filters";
import apiClient from "../api/client";

interface Project {
  id: string;
  title: string;
  diagnosis: string | null;
  status: string;
}

export default function FiltersBar() {
  const { t } = useTranslation();
  const setFilter = useFilters((state) => state.setFilter);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get<Project[]>("/projects");
        if (response.data && Array.isArray(response.data)) {
          setProjects(response.data);
        }
      } catch (error) {
        console.error("Ошибка загрузки проектов:", error);
        // Не ломаем страницу, просто не показываем проекты в списке
        setProjects([]);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={6}>
      <HStack spacing={4}>
        <Select placeholder={t("filters.date") ?? ""} size="sm" onChange={(e) => setFilter("dateRange", e.target.value)} />
        <Select placeholder={t("filters.diagnosis") ?? ""} size="sm" onChange={(e) => setFilter("diagnosis", e.target.value)} />
        <Select placeholder={t("filters.project") ?? ""} size="sm" onChange={(e) => setFilter("project", e.target.value)}>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </Select>
        <Select placeholder={t("filters.group") ?? ""} size="sm" onChange={(e) => setFilter("patientGroup", e.target.value)} />
      </HStack>
    </Box>
  );
}

