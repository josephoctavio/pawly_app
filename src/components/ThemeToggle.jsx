// src/components/ThemeToggle.jsx
import React from "react";
import { HStack, Icon, Switch, useColorMode } from "@chakra-ui/react";
import { SunIcon, MoonIcon } from "@chakra-ui/icons";

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <HStack spacing={4} align="center">
      {/* Sun Icon */}
      <Icon
        as={SunIcon}
        boxSize={6}
        color={colorMode === "light" ? "yellow.400" : "gray.500"}
        filter={colorMode === "light" ? "drop-shadow(0 0 6px rgba(245,158,11,0.7))" : "none"}
        transition="all 0.3s ease"
        aria-hidden="true"
      />

      {/* Switch */}
      <Switch
        isChecked={colorMode === "dark"}
        onChange={toggleColorMode} // actual theme change happens here
        size="lg"
        colorScheme="yellow"
        _focus={{ boxShadow: "none" }}
      />

      {/* Moon Icon */}
      <Icon
        as={MoonIcon}
        boxSize={6}
        color={colorMode === "dark" ? "white" : "gray.500"}
        filter={colorMode === "dark" ? "drop-shadow(0 0 6px rgba(255,255,255,0.6))" : "none"}
        transition="all 0.3s ease"
        aria-hidden="true"
      />
    </HStack>
  );
}
