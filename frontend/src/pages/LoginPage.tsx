import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await login(username, password);
    
    if (!success) {
      setError(t("login.invalidCredentials"));
    }
    
    setIsLoading(false);
  };

  return (
    <Container
      maxW="md"
      centerContent
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        w="100%"
        p={8}
        bg={bgColor}
        borderWidth="1px"
        borderRadius="xl"
        borderColor={borderColor}
        boxShadow="lg"
      >
        <VStack spacing={6}>
          <Text fontSize="2xl" fontWeight="bold" color="brand.600">
            {t("common.appTitle")}
          </Text>
          
          <Text fontSize="md" color="gray.600" textAlign="center">
            {t("login.subtitle")}
          </Text>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Box as="form" w="100%" onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t("login.username")}</FormLabel>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("login.usernamePlaceholder")}
                  size="lg"
                  borderColor={borderColor}
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px #0080FF" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>{t("login.password")}</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  size="lg"
                  borderColor={borderColor}
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px #0080FF" }}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                w="100%"
                isLoading={isLoading}
                loadingText={t("login.loggingIn")}
              >
                {t("login.loginButton")}
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
}

