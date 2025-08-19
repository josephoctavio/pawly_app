// src/components/CompactThemeSwitch.jsx
import React from "react";
import {
  Box,
  Icon,
  useColorMode,
  useColorModeValue,
  chakra,
  usePrefersReducedMotion,
} from "@chakra-ui/react";
import { BsSunFill, BsMoonFill } from "react-icons/bs";
import { motion } from "framer-motion";

const MotionBox = chakra(motion.div);

export default function CompactThemeSwitch({ ariaLabel = "Toggle color mode", ...props }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const checked = colorMode === "dark";
  const prefersReducedMotion = usePrefersReducedMotion();

  const trackLight = useColorModeValue(
    "linear-gradient(90deg,#f8fafc,#eef2ff)",
    "linear-gradient(90deg,#111827,#0b1220)"
  );
  const trackBorder = useColorModeValue("rgba(15,23,42,0.06)", "rgba(255,255,255,0.04)");
  const knobBg = useColorModeValue("white", "#0f1724");

  const sunColor = useColorModeValue("#f59e0b", "#9ca3af");
  const moonColor = useColorModeValue("#64748b", "#fff");

  // travel distance for the knob (px)
  const knobTranslateX = 52;

  const motionTransition = prefersReducedMotion
    ? { duration: 0.12 }
    : { type: "spring", stiffness: 700, damping: 40 };

  const onKeyDown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      toggleColorMode();
    }
  };

  return (
    <Box
      as="button"
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={0}
      onClick={toggleColorMode}
      onKeyDown={onKeyDown}
      _focus={{ outline: "none" }}
      _focusVisible={{ boxShadow: "0 0 0 3px rgba(99,102,241,0.18)" }}
      cursor="pointer"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      p={0}
      m={0}
      border="0"
      background="transparent"
      {...props}
    >
      <Box
        position="relative"
        width="96px"
        height="44px"
        borderRadius="999px"
        bg={trackLight}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        boxShadow={`inset 0 1px 0 ${trackBorder}`}
        userSelect="none"
        px="8px"
      >
        {/* Sun icon (left) */}
        <Box
          zIndex={2}
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="34px"
          h="34px"
          borderRadius="full"
          aria-hidden={true}
        >
          <MotionBox
            initial={false}
            animate={{
              scale: checked ? 0.85 : 1,
              opacity: checked ? 0 : 1,
            }}
            transition={motionTransition}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={BsSunFill} boxSize={4} color={sunColor} />
          </MotionBox>
        </Box>

        {/* Moon icon (right) */}
        <Box
          zIndex={2}
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="34px"
          h="34px"
          borderRadius="full"
          aria-hidden={true}
        >
          <MotionBox
            initial={false}
            animate={{
              scale: checked ? 1 : 0.85,
              opacity: checked ? 1 : 0,
            }}
            transition={motionTransition}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={BsMoonFill} boxSize={4} color={moonColor} />
          </MotionBox>
        </Box>

        {/* Knob slides under the active icon */}
        <MotionBox
          position="absolute"
          top="5px"
          left="5px"
          width="34px"
          height="34px"
          borderRadius="full"
          bg={knobBg}
          boxShadow="0 6px 18px rgba(2,6,23,0.12), inset 0 1px 0 rgba(255,255,255,0.04)"
          zIndex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
          initial={false}
          animate={{ x: checked ? knobTranslateX : 0 }}
          transition={motionTransition}
        />
      </Box>
    </Box>
  );
}
