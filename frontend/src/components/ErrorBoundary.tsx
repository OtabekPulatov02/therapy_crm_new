import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Text, Button } from "@chakra-ui/react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box p={6} borderWidth="1px" borderRadius="md" bg="red.50">
          <Text fontSize="lg" fontWeight="bold" mb={2} color="red.600">
            Произошла ошибка
          </Text>
          <Text fontSize="sm" color="gray.600" mb={4}>
            {this.state.error?.message || "Неизвестная ошибка"}
          </Text>
          <Button
            colorScheme="red"
            size="sm"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Перезагрузить страницу
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
