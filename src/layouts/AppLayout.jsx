// src/layouts/AppLayout.jsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Box,
  Flex,
  Icon,
  Text,
  Center,
  useColorMode,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaHome, FaPaw, FaClipboardList, FaCog } from "react-icons/fa";

// Improved, accessible NavItem with active indicator + better focus + larger tap targets
const NavItem = ({ to, icon, label }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Theme tokens (single/two-color approach)
  const lightAccent = "#2563eb"; // blue
  const lightMuted = "#374151"; // neutral dark gray

  const darkAccent = "#60a5fa"; // light blue accent on dark
  const darkMuted = "#d1d5db"; // light gray for unselected in dark mode

  const selectedIconColor = isDark ? darkAccent : lightAccent;
  const defaultIconColor = isDark ? darkMuted : lightMuted;

  // sizes responsive - slightly reduced for a more compact nav
  const iconSize = useBreakpointValue({ base: 5, md: 5 });
  const padY = useBreakpointValue({ base: 1, sm: 1.25 });

  return (
    <NavLink to={to} style={{ textDecoration: "none" }} aria-label={label}>
      {({ isActive }) => {
        // active pill behind icon
        const pillBg = isActive ? (isDark ? "rgba(96,165,250,0.12)" : "rgba(37,99,235,0.08)") : "transparent";
        const iconColor = isActive ? selectedIconColor : defaultIconColor;

        return (
          <Flex
            as="button"
            direction="column"
            align="center"
            justify="center"
            py={padY}
            px={2}
            minW="60px"
            role="link"
            aria-current={isActive ? "page" : undefined}
            transition="transform 140ms ease, color 140ms ease"
            _hover={{ transform: "translateY(-2px)" }}
            _focusVisible={{ boxShadow: "0 0 0 4px rgba(99,102,241,0.10)", outline: "none" }}
            cursor="pointer"
          >
            <Box position="relative" display="flex" alignItems="center" justifyContent="center" mb={1}>
              {/* Active pill / background */}
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width={{ base: "40px", md: "40px" }}
                height={{ base: "40px", md: "40px" }}
                borderRadius="full"
                bg={pillBg}
                transition="background 160ms ease, transform 140ms ease, box-shadow 180ms ease"
                pointerEvents="none"
                aria-hidden
              />

              <Box zIndex={1} p={1.5} borderRadius="full">
                <Icon as={icon} boxSize={iconSize} color={iconColor} aria-hidden />
              </Box>
            </Box>

            <Text mt={0} fontSize="xs" color={iconColor} opacity={0.95} userSelect="none">
              {label}
            </Text>
          </Flex>
        );
      }}
    </NavLink>
  );
};

export default function AppLayout() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  // Backgrounds: make light bg slightly off-white so cards (white) stand out
  const lightBg = useColorModeValue("#f4f7fb", "#070708");
  const darkBg = "#070708"; // kept explicit

  // Content surface token: cards and panels should use this token (white in light mode)
  // Suggestion: other components use useColorModeValue('#ffffff', '#0f1113') for their surfaces

  // Bottom nav background + border + subtle shadow tuned for very dark gray theme
  const navBg = useColorModeValue("rgba(255,255,255,0.92)", "#0f1113");
  const navBorder = useColorModeValue("rgba(16,24,40,0.06)", "rgba(255,255,255,0.04)");
  const navShadow = useColorModeValue(
    "0 6px 18px rgba(16,24,40,0.06)",
    "0 8px 26px rgba(0,0,0,0.6)"
  );

  // responsive width clamp so nav looks balanced on large screens
  const navWidth = useBreakpointValue({ base: "100%", sm: "640px", md: "740px" });

  return (
    <Box position="relative" minH="100vh" overflow="hidden" bg={isDark ? darkBg : lightBg}>
      {/* Decorative layers intentionally minimal for a clean, modern look */}

      <Box
        as="main"
        pb={{ base: `calc(74px + env(safe-area-inset-bottom))`, md: "74px" }}
        maxW="900px"
        mx="auto"
        px={{ base: 4, md: 6 }}
        pt={6}
        position="relative"
        zIndex={10}
      >
        <Outlet />
      </Box>

      <Center>
        <Flex
          as="nav"
          role="navigation"
          aria-label="Main navigation"
          position="fixed"
          bottom={0}
          left="50%"
          transform="translateX(-50%)"
          bg={navBg}
          borderRadius="xl"
          boxShadow={navShadow}
          px={{ base: 2, sm: 5 }}
          py={{ base: 1, sm: 1.25 }}
          align="center"
          justify="space-between"
          width={navWidth}
          maxW="900px"
          zIndex={70}
          border={`1px solid ${navBorder}`}
          style={{
            backdropFilter: "blur(8px) saturate(1.03)",
            WebkitBackdropFilter: "blur(8px) saturate(1.03)",
            WebkitTapHighlightColor: "transparent",
            // Ensure the nav sits flush to the bottom while respecting safe-area insets on mobile
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <NavItem to="/" icon={FaHome} label="Dashboard" />
          <NavItem to="/pets" icon={FaPaw} label="Pets" />
          <NavItem to="/tasks" icon={FaClipboardList} label="Tasks" />
          <NavItem to="/settings" icon={FaCog} label="Settings" />
        </Flex>
      </Center>
    </Box>
  );
}
