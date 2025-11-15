import {
  Box,
  Container,
  Flex,
  HStack,
  IconButton,
  Text,
  Select,
  Link,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { BrowserRouter, NavLink, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FiltersBar from "./components/FiltersBar";
import DataPage from "./pages/DataPage";
import AnalysisPage from "./pages/AnalysisPage";
import ChartsPage from "./pages/ChartsPage";
import ReportsPage from "./pages/ReportsPage";

const navItems = [
  { key: "nav.data", path: "/data" },
  { key: "nav.analysis", path: "/analysis" },
  { key: "nav.charts", path: "/charts" },
  { key: "nav.reports", path: "/reports" },
];

function Layout() {
  const { t, i18n } = useTranslation();

  return (
    <Container maxW="7xl" py={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold" color="brand.600">
          {t("common.appTitle")}
        </Text>
        <HStack spacing={3}>
          <Select
            size="sm"
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
          >
            <option value="ru">RU</option>
            <option value="uz">UZ</option>
            <option value="en">EN</option>
          </Select>
          <IconButton aria-label="Notifications" icon={<AddIcon />} variant="outline" />
        </HStack>
      </Flex>

      <HStack spacing={6} mb={4}>
        {navItems.map((item) => (
          <Link
            as={NavLink}
            key={item.path}
            to={item.path}
            fontWeight="semibold"
            color="gray.600"
            _activeLink={{ color: "brand.600" }}
          >
            {t(item.key)}
          </Link>
        ))}
      </HStack>

      <FiltersBar />

      <Box mt={4}>
        <Outlet />
      </Box>
    </Container>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/data" replace />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

