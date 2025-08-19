import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Button,
  Input,
  Divider,
} from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { FaChevronLeft, FaChevronRight, FaUser, FaLock, FaKey } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  // onboarding slides (5 pages)
  const onboardingSlides = [
    {
      smallHeader: "INTRO",
      title: "Pawly",
      subtitle: "Your smart pet assistant",
      bg: "/1.jpg",
      bottomText:
        "Pawly keeps daily pet care simple and reliable. Capture feeding schedules, medication notes, and grooming tasks in seconds — then let the app remind you so nothing slips through the cracks.",
    },
    {
      smallHeader: "FEATURE",
      title: "Create Tasks",
      subtitle: "Plan & Remind",
      bg: "/2.jpg",
      bottomText:
        "Turn routines into automated tasks. Schedule recurring feeds, set one-off reminders, add notes for each pet and get unobtrusive nudges when something needs attending. Less worry, more play.",
    },
    {
      smallHeader: "GUEST ACCESS",
      title: "Share Access",
      subtitle: "Guest mode for sitters",
      bg: "/3.jpg",
      bottomText:
        "Give a friend or sitter temporary guest access with a secure one-time code. They can follow your schedule and mark tasks done without creating a full account — safe and convenient.",
    },
    {
      smallHeader: "HEALTH",
      title: "Track Health",
      subtitle: "Notes & records",
      bg: "/4.jpg",
      bottomText:
        "Store vaccination dates, vet notes and grooming history in a single timeline. When health decisions come up, caregivers have the context they need at a glance.",
    },
    {
      smallHeader: "GET STARTED",
      title: "Ready?",
      subtitle: "Start caring better",
      bg: "/5.jpg",
      bottomText:
        "Pawly is intentionally lightweight, privacy-first, and focused on the tasks that actually help. Create an account or try guest mode to see how fast it is to get set up.",
    },
  ];

  // index flows 0..(onboardingSlides.length-1) for onboarding, onboardingSlides.length === auth screen
  const finalAuthIndex = onboardingSlides.length; // e.g. 5
  const lastOnboardingIndex = finalAuthIndex - 1; // e.g. 4

  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const pointerStartX = useRef(null);

  // auth form state for the final page (no overlay)
  const [authTab, setAuthTab] = useState("login"); // 'login' | 'signup' | 'guest'
  const [login, setLogin] = useState({ email: "", password: "" });
  const [signup, setSignup] = useState({ name: "", email: "", password: "" });
  const [guestCode, setGuestCode] = useState("");

  useEffect(() => {
    const handleTouchMove = (e) => {};
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => document.removeEventListener("touchmove", handleTouchMove);
  }, []);

  // Extra guard: when on auth (login) block pointer/touchmove to prevent accidental swipes
  useEffect(() => {
    if (index === finalAuthIndex && authTab === "login") {
      const blockMove = (e) => {
        // prevent scrolling/swiping when on login
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
      };
      document.addEventListener("touchmove", blockMove, { passive: false });
      document.addEventListener("pointermove", blockMove, { passive: false });
      return () => {
        document.removeEventListener("touchmove", blockMove);
        document.removeEventListener("pointermove", blockMove);
      };
    }
  }, [index, authTab]);

  function next() {
    if (index < lastOnboardingIndex) setIndex((i) => i + 1);
  }
  function prev() {
    if (index > 0) setIndex((i) => i - 1);
  }

  // when user clicks CTA from last onboarding slide, jump to auth slide (signup by default)
  function goToFinal() {
    setIndex(finalAuthIndex);
    setAuthTab("signup");
  }

  function handlePointerDown(e) {
    // Block all swipe gestures while on the auth screen with Login tab active
    if (index === finalAuthIndex && authTab === "login") return;
    pointerStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
  }
  function handlePointerUp(e) {
    // Block all swipe gestures while on the auth screen with Login tab active
    if (index === finalAuthIndex && authTab === "login") {
      pointerStartX.current = null;
      return;
    }

    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    if (pointerStartX.current == null || endX == null) return;
    const dx = endX - pointerStartX.current;
    const threshold = 50;

    // Onboarding swipe bounds: 0 .. lastOnboardingIndex
    // IMPORTANT: when on last onboarding slide, do NOT allow left-swipe to jump to auth.
    if (dx < -threshold) {
      // swipe left -> next (only while still within onboarding slides before the last)
      if (index < lastOnboardingIndex) {
        next();
      } else {
        // on last onboarding: intentionally do nothing (prevent swipe to auth)
      }
    } else if (dx > threshold) {
      // swipe right -> prev
      if (index > 0 && index <= lastOnboardingIndex) {
        prev();
      } else if (index === finalAuthIndex) {
        // allow swipe-back from auth -> last onboarding only when authTab !== 'login'
        if (authTab !== "login") setIndex(lastOnboardingIndex);
      }
    }

    pointerStartX.current = null;
  }

  // stubbed handlers (no backend yet)
  function handleLoginSubmit(e) {
    e?.preventDefault?.();
    console.log("login", login);
    navigate("/dashboard");
  }
  function handleSignupSubmit(e) {
    e?.preventDefault?.();
    console.log("signup", signup);
    navigate("/dashboard");
  }
  function handleGuestSubmit(e) {
    e?.preventDefault?.();
    console.log("guest code", guestCode);
    navigate("/dashboard");
  }

  // Quit action: try to close window; fallback to navigate to root
  function handleQuit() {
    try { window.close(); } catch (err) { /* ignore */ }
    navigate("/");
  }

  // choose background for auth left image from last onboarding slide
  const finalAuthBg = onboardingSlides[lastOnboardingIndex].bg;

  // helper for tab button props to ensure outline-only selected and white text
  const tabButtonProps = (isSelected) => ({
    size: "sm",
    variant: isSelected ? "outline" : "ghost",
    color: "white",
    bg: "transparent",
    borderColor: isSelected ? "whiteAlpha.700" : undefined,
    borderWidth: isSelected ? 1 : 0,
    _hover: { bg: "transparent", borderColor: isSelected ? "white" : "whiteAlpha.400" },
    _active: { bg: "transparent" },
  });

  return (
    <Box
      w="100%"
      h="100vh"
      position="relative"
      overflow="hidden"
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <Global
        styles={`
          @font-face { font-family: 'Luckiest Guy'; src: local('Luckiest Guy'), url('/fonts/LuckiestGuy-Regular.woff2') format('woff2'); font-display: swap; }
          @keyframes zoomOut { 0% { transform: scale(1.12); } 100% { transform: scale(1); } }
          .bgZoom { animation: zoomOut 15s ease forwards; transform-origin: center center; will-change: transform, opacity; }
          @media (prefers-reduced-motion: reduce) { .bgZoom { animation: none !important; } }
          html, body, #root { height: 100%; overflow: hidden; }
          * { -webkit-tap-highlight-color: transparent; }
        `}
      />

      {/* Onboarding slides (index < finalAuthIndex) */}
      {index < finalAuthIndex ? (
        <>
          <Box position="relative" w="100%" h="70vh" zIndex={0} overflow="hidden">
            <Box
              key={`bg-${index}`}
              className="bgZoom"
              position="absolute"
              inset={0}
              bgImage={`url(${onboardingSlides[index].bg})`}
              bgSize="cover"
              bgPos="center"
            />
            {/* slightly darker overlay for improved contrast */}
            <Box position="absolute" inset={0} bg="rgba(0,0,0,0.44)" />

            {/* Header logo */}
            <Box position="absolute" top={3} left={6} zIndex={4}>
              <Heading
                fontSize={{ base: "2xl", md: "3xl" }}
                fontWeight={700}
                color="white"
                fontFamily="'Luckiest Guy', cursive"
                lineHeight="1"
              >
                Pawly
              </Heading>
              <Text fontSize="sm" color="whiteAlpha.900" mt={0.3} fontWeight={600}>Simplify pet care</Text>
            </Box>

            {/* Skip -> go to final auth */}
            <Box position="absolute" top={4} right={6} zIndex={4} cursor="pointer" onClick={() => setIndex(finalAuthIndex)} role="button" tabIndex={0}>
              <Text fontSize="md" color="whiteAlpha.900" fontWeight={700} px={2} py={1}>Skip</Text>
            </Box>

            {/* slide content */}
            <Box position="absolute" left={{ base: 6, md: 12 }} bottom={{ base: 6, md: 12 }} zIndex={5} maxW={{ base: "90%", md: "720px" }}>
              <VStack align="start" spacing={2} color="white">
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  letterSpacing="widest"
                  textTransform="uppercase"
                  opacity={0.95}
                  fontWeight={700}
                  color="white"
                >
                  {onboardingSlides[index].smallHeader}
                </Text>
                <Heading
                  fontSize={{ base: "2xl", md: "4xl" }}
                  fontWeight={800}
                  textAlign="left"
                  letterSpacing="0.04em"
                  color="white"
                  style={{ textShadow: "0 6px 18px rgba(0,0,0,0.6)" }}
                >
                  {onboardingSlides[index].title}
                </Heading>
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  maxW="container.md"
                  opacity={0.95}
                  textAlign="left"
                  fontWeight={600}
                  color="white"
                >
                  {onboardingSlides[index].subtitle}
                </Text>
              </VStack>
            </Box>

            {/* CTA button: only show on the final onboarding page */}
            {index === lastOnboardingIndex && (
              <Box position="absolute" right={6} bottom={4} zIndex={5}>
                <Button
                  variant="outline"
                  borderColor="whiteAlpha.900"
                  color="white"
                  borderWidth={2}
                  borderRadius="full"
                  fontWeight={700}
                  fontSize="md"
                  px={6}
                  py={4}
                  _hover={{ bg: "rgba(255,255,255,0.04)" }}
                  onClick={goToFinal}
                >
                  Get Started
                </Button>
              </Box>
            )}
          </Box>

          {/* Bottom panel */}
          <Box h="30vh" bg="black" color="white" zIndex={6} position="absolute" bottom={0} w="100%">
            <Box borderTopLeftRadius={{ base: "20px", md: "28px" }} borderTopRightRadius={{ base: "20px", md: "28px" }} px={{ base: 6, md: 12 }} py={{ base: 3, md: 4 }} display="flex" flexDirection="column" justifyContent="flex-start" height="100%">
              <VStack align="stretch" spacing={3} flexShrink={0}>
                <Text
                  fontSize={{ base: "md", md: "xl" }}
                  lineHeight={1.6}
                  textAlign="left"
                  fontWeight={700}
                  color="whiteAlpha.900"
                  maxW="container.md"
                >
                  {onboardingSlides[index].bottomText}
                </Text>
              </VStack>

              <Box mt={2}>
                <HStack justify="center" align="center" spacing={5} style={{ transform: "translateY(-8px)" }}>
                  <IconButton aria-label="Previous" icon={<FaChevronLeft />} onClick={prev} isDisabled={index === 0} variant="ghost" color="white" size="lg" _hover={{ bg: "rgba(255,255,255,0.06)" }} />

                  <HStack spacing={3}>
                    {onboardingSlides.map((_, i) => (
                      <Box
                        key={i}
                        w={i === index ? "14px" : "10px"}
                        h="10px"
                        borderRadius="999px"
                        bg={i === index ? "white" : "rgba(255,255,255,0.3)"}
                      />
                    ))}
                  </HStack>

                  {/* Next button: always shown during onboarding, disabled on last onboarding slide */}
                  <IconButton
                    aria-label="Next"
                    icon={<FaChevronRight />}
                    onClick={() => { if (index < lastOnboardingIndex) next(); }}
                    variant="ghost"
                    color={index === lastOnboardingIndex ? "gray.400" : "white"}
                    size="lg"
                    isDisabled={index === lastOnboardingIndex}
                    _hover={{ bg: index === lastOnboardingIndex ? "transparent" : "rgba(255,255,255,0.06)" }}
                  />
                </HStack>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        /* FINAL AUTH PAGE (index === finalAuthIndex) */
        <Box w="100%" h="100vh" position="relative" bg="#171717" color="white">
          {/* Quit */}
          <Box position="absolute" top={4} right={6} zIndex={30}>
            <Text fontSize="md" color="whiteAlpha.800" cursor="pointer" onClick={handleQuit} fontWeight={600}>Quit</Text>
          </Box>

          <Box display="flex" alignItems="center" justifyContent="center" h="100%" px={4}>
            <Box maxW={{ base: "96%", md: "760px" }} w="100%">
              <Box display={{ base: "block", md: "flex" }} gap={8} alignItems="center" justifyContent="center">
                {/* Left illustration hidden on mobile */}
                <Box flex="1" display={{ base: "none", md: "block" }}>
                  <Box h="520px" borderRadius="lg" overflow="hidden" bgImage={`url(${finalAuthBg})`} bgSize="cover" bgPos="center" boxShadow="lg" style={{ filter: "brightness(0.6)" }} />
                </Box>

                {/* Auth card */}
                <Box flex={{ base: "1", md: authTab === "login" ? "0 0 620px" : "0 0 520px" }}  display="flex" justifyContent="center">
                  <Box bg="#171717" color="white" borderRadius="25px" p={{ base: 3, md: 6 }} boxShadow="lg">
                    {/* Tabs arranged left/center/right */}
                    <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" alignItems="center" mb={3}>
                      <Box justifySelf="start">
                        <Button {...tabButtonProps(authTab === "login")} onClick={() => setAuthTab("login")}>Login</Button>
                      </Box>

                      <Box justifySelf="center">
                        <Button {...tabButtonProps(authTab === "signup")} onClick={() => setAuthTab("signup")}>Sign up</Button>
                      </Box>

                      <Box justifySelf="end">
                        <Button {...tabButtonProps(authTab === "guest")} onClick={() => setAuthTab("guest")}>Guest</Button>
                      </Box>
                    </Box>

                    <Divider mb={4} borderColor="whiteAlpha.100" />

                    {/* Forms: give both login & signup a consistent min-height so they look identical */}
                    {authTab === "login" && (
                      <Box as="form" onSubmit={handleLoginSubmit} minH={{ base: "auto", md: "260px" }}>
                        <Text id="heading" textAlign="center" mb={6} fontSize={{ base: "18px", md: "20px" }} fontWeight={700} color="white">Login</Text>

                        <VStack spacing={3} align="stretch">
                          <Box display="flex" alignItems="center" gap={3} borderRadius="25px" p={3} bg="#171717" boxShadow="inset 2px 5px 10px rgba(0,0,0,0.6)">
                            <Box as="span" aria-hidden><FaUser /></Box>
                            <Input variant="unstyled" placeholder="Username" value={login.email} onChange={(e) => setLogin((s) => ({ ...s, email: e.target.value }))} color="#d3d3d3" fontSize={{ base: "14px", md: "16px" }} />
                          </Box>

                          <Box display="flex" alignItems="center" gap={3} borderRadius="25px" p={3} bg="#171717" boxShadow="inset 2px 5px 10px rgba(0,0,0,0.6)">
                            <Box as="span" aria-hidden><FaLock /></Box>
                            <Input variant="unstyled" placeholder="Password" type="password" value={login.password} onChange={(e) => setLogin((s) => ({ ...s, password: e.target.value }))} color="#d3d3d3" fontSize={{ base: "14px", md: "16px" }} />
                          </Box>

                          <HStack justify="center" mt={6}>
                            <Button type="submit" bg="#252525" _hover={{ bg: "black" }} color="white" px={6} borderRadius="6px" fontWeight={600} fontSize={{ base: "14px", md: "16px" }}>Login</Button>
                            <Button bg="#252525" _hover={{ bg: "black" }} color="white" px={6} borderRadius="6px" fontWeight={600} fontSize={{ base: "14px", md: "16px" }} onClick={() => setAuthTab("signup")}>Sign Up</Button>
                          </HStack>

                          <Button mt={4} bg="#252525" _hover={{ bg: "#b91c1c" }} color="white" w="full" fontSize={{ base: "14px", md: "16px" }}>Forgot Password</Button>
                        </VStack>
                      </Box>
                    )}

                    {authTab === "signup" && (
                      <Box as="form" onSubmit={handleSignupSubmit} minH={{ base: "auto", md: "260px" }}>
                        <Text id="heading" textAlign="center" mb={6} fontSize={{ base: "18px", md: "20px" }} fontWeight={700} color="white">Create account</Text>
                        <VStack spacing={3} align="stretch">
                          <Box display="flex" alignItems="center" gap={3} borderRadius="25px" p={3} bg="#171717" boxShadow="inset 2px 5px 10px rgba(0,0,0,0.6)">
                            <Box as="span" aria-hidden><FaUser /></Box>
                            <Input variant="unstyled" placeholder="Full name" value={signup.name} onChange={(e) => setSignup((s) => ({ ...s, name: e.target.value }))} color="#d3d3d3" fontSize={{ base: "14px", md: "16px" }} />
                          </Box>

                          <Box display="flex" alignItems="center" gap={3} borderRadius="25px" p={3} bg="#171717" boxShadow="inset 2px 5px 10px rgba(0,0,0,0.6)">
                            <Box as="span" aria-hidden><FaUser /></Box>
                            <Input variant="unstyled" placeholder="Email" value={signup.email} onChange={(e) => setSignup((s) => ({ ...s, email: e.target.value }))} color="#d3d3d3" fontSize={{ base: "14px", md: "16px" }} />
                          </Box>

                          <Box display="flex" alignItems="center" gap={3} borderRadius="25px" p={3} bg="#171717" boxShadow="inset 2px 5px 10px rgba(0,0,0,0.6)">
                            <Box as="span" aria-hidden><FaLock /></Box>
                            <Input variant="unstyled" placeholder="Password" type="password" value={signup.password} onChange={(e) => setSignup((s) => ({ ...s, password: e.target.value }))} color="#d3d3d3" fontSize={{ base: "14px", md: "16px" }} />
                          </Box>

                          <HStack justify="center" mt={6}>
                            <Button type="submit" bg="#252525" _hover={{ bg: "black" }} color="white" px={6} borderRadius="6px" fontWeight={600} fontSize={{ base: "14px", md: "16px" }}>Create account</Button>
                            <Button variant="ghost" color="white" onClick={() => setAuthTab("login")}>Already have an account?</Button>
                          </HStack>
                        </VStack>
                      </Box>
                    )}

                    {authTab === "guest" && (
                      <Box as="form" onSubmit={handleGuestSubmit} minH={{ base: "auto", md: "260px" }}>
                        <Text id="heading" textAlign="center" mb={6} fontSize={{ base: "18px", md: "20px" }} fontWeight={700} color="white">Guest access</Text>
                        <VStack spacing={3} align="stretch">
                          <Box display="flex" alignItems="center" gap={3} borderRadius="25px" p={3} bg="#171717" boxShadow="inset 2px 5px 10px rgba(0,0,0,0.6)">
                            <Box as="span" aria-hidden><FaKey /></Box>
                            <Input variant="unstyled" placeholder="Enter guest code" value={guestCode} onChange={(e) => setGuestCode(e.target.value)} color="#d3d3d3" fontSize={{ base: "14px", md: "16px" }} />
                          </Box>

                          <HStack justify="center" mt={6}>
                            <Button type="submit" bg="#252525" _hover={{ bg: "black" }} color="white" px={6} borderRadius="6px" fontWeight={600} fontSize={{ base: "14px", md: "16px" }}>Use guest code</Button>
                            <Button variant="ghost" color="white" onClick={() => setAuthTab("login")}>Back to sign in</Button>
                          </HStack>
                        </VStack>
                      </Box>
                    )}
                  </Box>

                  {/* user agreement at bottom of page (centered and slightly raised) */}
                  <Box position="absolute" bottom={{ base: 20, md: 12 }} left={0} right={0} textAlign="center" px={4}>
                    <Text fontSize="11px" color="gray.300">By continuing you agree to Pawly's <a href="/terms" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'underline', color: 'inherit'}}>Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'underline', color: 'inherit'}}>Privacy Policy</a>.</Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
