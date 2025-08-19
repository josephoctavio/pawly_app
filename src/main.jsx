import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import App from "./App.jsx";
import theme from "./theme.js";
import "@fontsource/poppins/700.css";
import "@fontsource/inter/400.css";

// Optional but helpful: import your global stylesheet here if you have one
// import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Ensures Chakra applies the correct color mode before React paints */}
    <ColorModeScript initialColorMode={theme.config?.initialColorMode ?? "light"} />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);
