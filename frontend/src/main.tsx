import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./i18n/config";

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "white",
        color: "gray.800",
      },
    },
  },
  colors: {
    brand: {
      500: "#0080FF",
      600: "#0066CC",
      700: "#004C99",
      200: "#00B894",
    },
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>,
);

