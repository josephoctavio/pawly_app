import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === "light" ? "gray.100" : "#0a1e3c", // darker blue in dark mode
        color: props.colorMode === "light" ? "gray.800" : "whiteAlpha.900",
        transition: "background-color 0.25s ease, color 0.25s ease",
      },
      "h1, h2, h3, h4, h5, h6, p, span, div": {
        color: props.colorMode === "light" ? "gray.800" : "whiteAlpha.900",
      },
    }),
  },
});

export default theme;
