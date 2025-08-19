// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Box, Heading, Text, VStack, HStack, Spacer, Checkbox, useColorModeValue, Icon, Badge, Button, SimpleGrid, Flex, Center, CircularProgress, CircularProgressLabel, Input, InputGroup, InputLeftElement, Tooltip, useToast, } from "@chakra-ui/react";
import { FaUtensils, FaWalking, FaBath, FaPaw, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Global } from "@emotion/react";

const VISIBLE_COUNT = 3;
const TASK_REMOVE_DELAY = 340; // ms for the fade/slide animation
const TASK_SHOW_COMPLETED_MS = 480; // show "Task Completed" briefly before starting animation

function formatTime(ts = Date.now()) {
  return new Date(ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function TaskItem({ task, onComplete }) {
  const surface = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.100", "rgba(255,255,255,0.03)");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const [entered, setEntered] = useState(false);
  useEffect(() => {
    let raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const removing = !!task.removing;

  return (
    <Box
      role="listitem"
      aria-live="polite"
      key={task.id}
      transition="opacity 320ms cubic-bezier(.2,.9,.2,1), transform 320ms cubic-bezier(.2,.9,.2,1), max-height 320ms ease, padding 320ms ease, margin 320ms ease"
      w="100%"
      sx={{
        transform: removing ? "translateY(-8px)" : entered ? "translateY(0)" : "translateY(6px)",
        opacity: removing ? 0 : entered ? 1 : 0,
        maxHeight: removing ? "0px" : "160px",
        padding: removing ? "0px 12px" : "12px",
        marginBottom: removing ? "0px" : "12px",
        overflow: "hidden",
      }}
      borderRadius="12px"
      border={`1px solid ${border}`}
      boxShadow={useColorModeValue("0 6px 18px rgba(15,23,42,0.04)", "0 8px 22px rgba(2,6,23,0.6)")}
      bg={surface}
    >
      <HStack spacing={3} align="center">
        <Checkbox
          aria-label={`Mark ${task.title} complete`}
          isChecked={task.localChecked}
          onChange={() => onComplete(task.id)}
          size="md"
          colorScheme="teal"
          _focus={{ boxShadow: "none" }}
        />

        <VStack spacing={0} align="stretch" flex="1">
          <HStack justify="space-between">
            <HStack spacing={3} align="center">
              <Icon as={task.icon} boxSize={5} color={task.color || "teal.400"} aria-hidden />

              <Text fontWeight={700} color={textColor} fontSize="md">
                {task.localChecked ? "Task Completed" : task.title}
              </Text>
            </HStack>

            {task.localChecked ? (
              <Badge variant="subtle" colorScheme="green" fontWeight={600}>
                Task Completed
              </Badge>
            ) : (
              <Text fontSize="xs" color="gray.400">
                {task.time || "Today"}
              </Text>
            )}
          </HStack>

          {task.note ? (
            <Text fontSize="xs" color="gray.500" mt={2}>
              {task.note}
            </Text>
          ) : null}
        </VStack>
      </HStack>
    </Box>
  );
}

export default function Dashboard() {
  // ---------- Hooks (all up front; never call hooks conditionally) ----------
  const navigate = useNavigate();
  const toast = useToast();
  const username = "Xavier";

  const [tasks, setTasks] = useState(() => [
    { id: "t1", title: "Feed cats", icon: FaUtensils, time: "8:00 AM", note: "Dry + wet food", color: "orange.400", localChecked: false, removing: false, petId: "p1" },
    { id: "t2", title: "Go for a walk", icon: FaWalking, time: "10:30 AM", note: "15–20 mins", color: "green.300", localChecked: false, removing: false, petId: "p5" },
    { id: "t3", title: "Bathe the cat", icon: FaBath, time: "3:00 PM", note: "Use gentle shampoo", color: "blue.300", localChecked: false, removing: false, petId: "p3" },
    { id: "t4", title: "Give meds", icon: FaUtensils, time: "6:00 PM", note: "Pill with food", color: "pink.300", localChecked: false, removing: false, petId: "p1" },
    { id: "t5", title: "Clip claws", icon: FaBath, time: "7:30 PM", note: "Short session", color: "purple.300", localChecked: false, removing: false, petId: "p2" },
  ]);

  // snapshot denominator so progress math stays stable while items animate/remove
  const [initialTotal] = useState(() => tasks.length);
  const [, forceRerender] = useState(0);

  // small UI toggles / tip text
  const [showAlert, setShowAlert] = useState(true);
  const tips = useMemo(
    () => [
      "Cats sleep about 12–16 hours a day — be a little jealous.",
      "Dogs can learn up to ~250 words and gestures.",
      "You’re doing great keeping your pets healthy!",
      "Short daily play sessions reduce pet anxiety.",
      "Regular grooming prevents mats for long-haired pets.",
    ],
    []
  );
  const [tip, setTip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);
  useEffect(() => {
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, [tips]);

  // connectivity UI
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  // search
  const [query, setQuery] = useState("");

  // derived memoized pets (UI-only sample) — force Milo & Simba to no-pic so they use gradient paw
  const pets = useMemo(
    () => [
      { id: "p1", name: "Milo", pic: null, type: "Cat", alert: "Meds in 1h" },
      { id: "p2", name: "Luna", pic: null, type: "Cat", alert: null },
      { id: "p3", name: "Simba", pic: null, type: "Cat", alert: "Groom overdue" },
      { id: "p4", name: "Nala", pic: null, type: "Cat", alert: null },
      { id: "p5", name: "Ollie", pic: "/avatars/avatar5.png", type: "Dog", alert: null },
    ],
    []
  );

  // ---------- UI tokens (all hooks called unconditionally here) ----------
  const surface = useColorModeValue("transparent", "transparent");
  const headingColor = useColorModeValue("gray.800", "gray.100");
  const subtitleColor = useColorModeValue("gray.600", "gray.400");
  const dividerColor = useColorModeValue("teal.200", "teal.600");
  const circularTrackColor = useColorModeValue("gray.100", "gray.700");

  const gradientFallback = useColorModeValue(
    "linear-gradient(135deg,#FDE68A 0%,#FCA5A5 100%)",
    "linear-gradient(135deg,#334155 0%,#0f172a 100%)"
  );

  // additional centralized tokens to avoid conditional hooks in JSX
  const textPrimary = useColorModeValue('gray.700','gray.300');
  const emptyBoxBg = useColorModeValue('white','gray.800');
  const emptyBoxBorder = useColorModeValue('gray.100','rgba(255,255,255,0.02)');
  const petCardBg = useColorModeValue('white','gray.800');
  const petCardBorder = useColorModeValue('#edf2f7','rgba(255,255,255,0.02)');
  const petHoverBg = useColorModeValue('gray.50','rgba(255,255,255,0.02)');
  const tipCardBg = useColorModeValue('teal.50','gray.800');
  const tipCardBorder = useColorModeValue('teal.100','rgba(255,255,255,0.02)');

  // helper: detect and ignore dicebear/avatar svgs as "real" pics
  function isValidPic(url) {
    if (!url) return false;
    return !/dicebear|avatars\.dicebear|avatar(\.|-)svg/i.test(url);
  }

  // ---------- Core logic (derived state) ----------
  const stableTasks = tasks.filter((t) => !t.removing);
  const filteredTasks = stableTasks.filter((t) => {
    const matchesQuery = !query || t.title.toLowerCase().includes(query.toLowerCase()) || (t.note && t.note.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery;
  });

  const visibleTasks = filteredTasks.slice(0, VISIBLE_COUNT);
  const hiddenCount = Math.max(0, filteredTasks.length - VISIBLE_COUNT);
  const showMore = hiddenCount > 0;

  // robust progress calculation
  const completed = Math.max(0, initialTotal - stableTasks.length);
  const percentComplete = initialTotal === 0 ? 0 : Math.min(100, Math.max(0, Math.round((completed / initialTotal) * 100)));
  const remaining = Math.max(initialTotal - completed, 0);

  const today = new Date();
  const dateStr = today.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // ---------- Effects ----------
  useEffect(() => {
    function onOnline() {
      setOnline(true);
      toast({ title: "Connection", description: "Connection restored", status: "info", duration: 1600 });
    }
    function onOffline() {
      setOnline(false);
      toast({ title: "Offline", description: "You are offline", status: "warning", duration: 1600 });
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [toast]);

  // ---------- Actions ----------
  function handleComplete(id) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, localChecked: true } : t)));

    setTimeout(() => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, removing: true } : t)));
      forceRerender((n) => n + 1);

      setTimeout(() => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }, TASK_REMOVE_DELAY + 20);
    }, TASK_SHOW_COMPLETED_MS);
  }

  // ---------- Render ----------
  return (
    <Box minH="100vh" px={{ base: 3, md: 6 }} pt={6} pb={12} style={{ WebkitTapHighlightColor: "transparent" }}>
      <Global
        styles={`
          button:focus{outline:none;box-shadow:none}
          button:active{transform:none}
          .chakra-button:focus{outline:none;box-shadow:none}
          .chakra-button:active{transform:none}
          *:not(input):not(textarea):not([contenteditable="true"]) { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
          html, body, a, button { -webkit-tap-highlight-color: transparent; }
        `}
      />

      {/* Header / top controls (no background, left-aligned top) */}
      <Box mb={4}>
        <Box
          borderRadius="0"
          p={{ base: 0, md: 0 }}
          bg="transparent"
          boxShadow="none"
          border="none"
          display="flex"
          flexDirection="row"
          alignItems="flex-start"
          flexWrap="nowrap"
          gap={3}
        >
          <Box flexBasis="auto" flexGrow={1} textAlign="left" minW={0}>
            <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} fontWeight={800} color={headingColor} mb={0}>
              {`Welcome, ${username}`}
            </Heading>
            <Text fontSize="sm" color={subtitleColor} mt={1}>{dateStr}</Text>
          </Box>

          <Flex align="flex-start" gap={3} ml="auto" mt={{ base: 0, md: 0 }}>
            <Box>
              <CircularProgress value={percentComplete} size={{ base: "64px", md: "80px" }} thickness={10} color="teal.400" trackColor={circularTrackColor}>
                <CircularProgressLabel fontSize={{ base: "xs", md: "sm" }}>{percentComplete}%</CircularProgressLabel>
              </CircularProgress>
            </Box>

            <Tooltip label={online ? "Online" : "Offline"} placement="bottom">
              <Badge colorScheme={online ? "green" : "red"} mt={1}>{online ? "Online" : "Offline"}</Badge>
            </Tooltip>
          </Flex>
        </Box>
      </Box>

      {/* Main grid: left = tasks, right = pets + tip */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {/* Left column - tasks and controls (search bar stretched and styled) */}
        <Box gridColumn={{ base: "1", md: "1 / span 2" }}>
          <Box mb={4}>
            <HStack spacing={3} align="center" mb={3}>
              <InputGroup flex={1}>
                <InputLeftElement pointerEvents="none">
                  <FaSearch />
                </InputLeftElement>
                <Input
                  placeholder="Search tasks or notes"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  _focus={{ boxShadow: "none" }}
                  size="lg"
                  borderRadius="xl"
                />
              </InputGroup>

              <Spacer />
            </HStack>

            <Text fontSize="sm" fontWeight={700} textTransform="uppercase" mb={2} color={textPrimary}>Today's Tasks</Text>
            <Box height="4px" width="72px" bg={dividerColor} mb={4} borderRadius="xl" />

            <VStack spacing={3} align="stretch" role="list">
              {visibleTasks.length === 0 ? (
                <Box p={6} borderRadius="12px" bg={emptyBoxBg} boxShadow="sm" border={`1px solid ${emptyBoxBorder}`}>
                  <Text fontWeight={700}>No tasks match your search</Text>
                  <Text fontSize="sm" color="gray.500" mt={2}>Try clearing the search or add a task from Tasks page.</Text>
                </Box>
              ) : (
                visibleTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onComplete={handleComplete} />
                ))
              )}
            </VStack>

            <Box mt={4} textAlign="center" transition="opacity 280ms ease, transform 280ms ease" opacity={showMore ? 1 : 0} transform={showMore ? "translateY(0)" : "translateY(6px)"} pointerEvents={showMore ? "auto" : "none"} aria-hidden={!showMore}>
              <Button variant="link" size="sm" onClick={() => navigate('/tasks')}>More tasks</Button>
            </Box>
          </Box>
        </Box>

        {/* Right column - pets + tip (pet cards clickable; use pic or gradient paw) */}
        <Box>
          <Box mb={4} borderRadius="12px" p={3} bg={petCardBg} border={`1px solid ${petCardBorder}`}>
            <HStack justify="space-between" mb={3} alignItems="center">
              <Text fontSize="sm" fontWeight={700} textTransform="uppercase">Your pets</Text>
              <Button variant="link" size="sm" onClick={() => navigate('/pets')}>View all</Button>
            </HStack>

            <SimpleGrid columns={2} spacing={3}>
              {pets.slice(0, 4).map((p) => (
                <Box
                  key={p.id}
                  textAlign="center"
                  p={2}
                  borderRadius="10px"
                  cursor="pointer"
                  onClick={() => navigate(`/pets/${p.id}`)}
                  _hover={{ bg: petHoverBg }}
                >
                  <Center>
                    {isValidPic(p.pic) ? (
                      <Box as="img" src={p.pic} alt={p.name} width="84px" height="84px" borderRadius="12px" style={{ objectFit: 'cover' }} />
                    ) : (
                      <Box width="84px" height="84px" borderRadius="12px" display="flex" alignItems="center" justifyContent="center" bg={gradientFallback}>
                        <FaPaw color="white" size={32} />
                      </Box>
                    )}
                  </Center>
                  <Text fontWeight={700} mt={2}>{p.name}</Text>
                  <Text fontSize="xs" color="gray.500">{p.type}</Text>
                  {p.alert && <Badge mt={2} colorScheme="orange" fontSize="xs">{p.alert}</Badge>}
                </Box>
              ))}
            </SimpleGrid>
          </Box>

          <Box borderRadius="12px" p={4} bg={tipCardBg} border={`1px solid ${tipCardBorder}`}>
            <HStack spacing={3}>
              <Center w="10" h="10" borderRadius="md" bg={useColorModeValue('teal.100','gray.700')}>
                <FaPaw color={useColorModeValue('#0ea5a4','white')} />
              </Center>
              <Box>
                <Text fontWeight={700}>Daily tip</Text>
                <Text fontSize="sm" color="gray.500">{tip}</Text>
              </Box>
            </HStack>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
