// src/pages/Pets.jsx
import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Center,
  Avatar,
  Button,
  Icon,
  IconButton,
  useColorModeValue,
  List,
  ListItem,
  ListIcon,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { FaPaw, FaPlus, FaStar, FaTrash, FaTasks } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/**
 * Pets page with anchored side menu (appears beside the selected card).
 * - Long-press or right-click a card to open the menu next to that card.
 * - Click anywhere else to dismiss.
 * - Delete action shows confirmation dialog (Continue / Cancel).
 */

export default function Pets() {
  const navigate = useNavigate();

  // ---------- Data (UI placeholders for now; replace with API/Firestore later) ----------
  const initialPets = [
    { id: "p1", name: "Milo", image: "" },
    { id: "p2", name: "Luna", image: "" },
    { id: "p3", name: "Simba", image: "" },
    { id: "p4", name: "Nala", image: "" },
    { id: "p5", name: "Ollie", image: "" },
  ];

  const [pets, setPets] = useState(initialPets);
  const [recent, setRecent] = useState([initialPets[2], initialPets[0], initialPets[1]]);
  const [favorites, setFavorites] = useState(new Set());
  const [recentExpanded, setRecentExpanded] = useState(false);
  const [loading] = useState(false);

  // ---------- UI tokens ----------
  const textColor = useColorModeValue("gray.800", "gray.100");
  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("#edf2f7", "rgba(255,255,255,0.02)");
  const cardShadow = useColorModeValue("0 8px 20px rgba(15,23,42,0.06)", "0 8px 26px rgba(2,6,23,0.6)");
  const gradients = [
    "linear(to-br, teal.400, blue.500)",
    "linear(to-br, orange.400, pink.400)",
    "linear(to-br, purple.400, blue.400)",
    "linear(to-br, green.300, teal.500)",
    "linear(to-br, pink.300, red.500)",
  ];

  // ---------- Root UX tweaks ----------
  const scrollbarThumb = useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.06)");
  const rootSx = {
    userSelect: "none",
    WebkitUserSelect: "none",
    WebkitTapHighlightColor: "transparent",
    'button:focus, button:active, button:focus-visible': { boxShadow: "none", outline: "none" },
    '[role="button"]:focus, [role="button"]:active, [role="button"]:focus-visible': { boxShadow: "none", outline: "none" },
    '::-webkit-scrollbar': { height: "6px", width: "6px" },
    '::-webkit-scrollbar-thumb': { background: scrollbarThumb, borderRadius: "8px" },
    '::-webkit-scrollbar-track': { background: "transparent" },
  };

  // ---------- Anchored menu state ----------
  // menu: { open: bool, petId: string|null, top: number, left: number, placement: 'right'|'left' }
  const [menu, setMenu] = useState({ open: false, petId: null, top: 0, left: 0, placement: "right" });
  const menuRef = useRef(null);
  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);
  const LONG_PRESS_MS = 600;

  // Delete dialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const cancelRef = useRef();

  // ---------- Helpers ----------
  function openPet(pet) {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return; // suppress navigation if long press opened the menu
    }
    setRecent((r) => {
      const filtered = r.filter((x) => x.id !== pet.id);
      return [pet, ...filtered].slice(0, 5);
    });
    navigate(`/pets/${pet.id}`);
  }

  function toggleFav(id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    // close menu after action
    setMenu({ ...menu, open: false, petId: null });
  }

  function addTaskForPet(id) {
    navigate(`/tasks?pet=${id}`);
    setMenu({ ...menu, open: false, petId: null });
  }

  function deletePetConfirmed(id) {
    setPets((prev) => prev.filter((p) => p.id !== id));
    setFavorites((prev) => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
    setRecent((r) => r.filter((x) => x.id !== id));
    setConfirmDeleteOpen(false);
    setMenu({ open: false, petId: null, top: 0, left: 0, placement: "right" });
  }

  // open anchored menu beside card using its bounding rect
  function openAnchoredMenu(petId, rect) {
    const menuWidth = 220; // px approximation of menu width
    const gutter = 12; // gap between card and menu
    const rightSpace = window.innerWidth - rect.right;
    let placement = "right";
    let left = rect.right + gutter;
    if (rightSpace < menuWidth + gutter) {
      // not enough space on right, place on left
      placement = "left";
      left = rect.left - gutter - menuWidth;
      if (left < 8) left = 8; // clamp
    }
    // vertical align center-ish
    const top = Math.min(Math.max(rect.top + rect.height / 2 - 60, 8), window.innerHeight - 120);
    setMenu({ open: true, petId, top, left, placement });
  }

  // start/stop long press (mouse/touch)
  function handlePressStart(e, petId) {
    if (e.type === "touchstart") e.preventDefault();
    longPressTriggered.current = false;
    clearTimeout(longPressTimer.current);
    // capture the bounding rect from currentTarget (box)
    const rect = e.currentTarget.getBoundingClientRect();
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      openAnchoredMenu(petId, rect);
    }, LONG_PRESS_MS);
  }
  function handlePressEnd() {
    clearTimeout(longPressTimer.current);
  }

  // right-click handler (desktop)
  function handleContextMenu(e, petId) {
    e.preventDefault();
    longPressTriggered.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    openAnchoredMenu(petId, rect);
  }

  // close menu on outside click
  useEffect(() => {
    function onDocClick(ev) {
      if (!menu.open) return;
      if (menuRef.current && !menuRef.current.contains(ev.target)) {
        setMenu({ open: false, petId: null, top: 0, left: 0, placement: "right" });
      }
    }
    window.addEventListener("mousedown", onDocClick);
    window.addEventListener("touchstart", onDocClick);
    return () => {
      window.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("touchstart", onDocClick);
    };
  }, [menu.open]);

  const favoriteList = pets.filter((p) => favorites.has(p.id));
  const recentList = recentExpanded ? pets : recent;

  const activePet = pets.find((p) => p.id === menu.petId) || null;

  // ---------- Render ----------
  return (
    <Box minH="100vh" px={{ base: 3, md: 6 }} pt={6} pb={24} sx={rootSx}>
      {/* Header */}
      <Box mb={4}>
        <Heading as="h2" fontSize={{ base: "xl", md: "2xl" }} fontWeight={800} letterSpacing="-0.3px" mb={1} color={textColor}>
          Your pets
        </Heading>
        <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")}>
          Tap a profile to view details — hold (press & hold) or right-click for quick actions.
        </Text>
      </Box>

      {/* Grid */}
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={{ base: 3, md: 5 }} mb={6}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Box key={i} p={3} borderRadius="12px" border={`1px solid ${border}`} bg={cardBg} minH="170px" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
              <Box w="64px" h="64px" borderRadius="full" bg={useColorModeValue("gray.200", "gray.700")} />
              <Box mt={3} w="60%" h="12px" bg={useColorModeValue("gray.200", "gray.300")} borderRadius="6px" />
            </Box>
          ))
        ) : pets.length === 0 ? (
          <Box p={6} borderRadius="12px" border={`1px solid ${border}`} bg={cardBg} gridColumn="1/-1">
            <Text fontWeight={700}>No pets yet</Text>
            <Text mt={2} color="gray.500">Add a pet using the + button to get started.</Text>
          </Box>
        ) : (
          pets.map((pet, index) => {
            const isFavorite = favorites.has(pet.id);
            return (
              <Box
                key={pet.id}
                bg={cardBg}
                border={`1px solid ${border}`}
                borderRadius="12px"
                p={4}
                minH="170px"
                textAlign="center"
                cursor="pointer"
                onClick={() => openPet(pet)}
                onMouseDown={(e) => handlePressStart(e, pet.id)}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={(e) => handlePressStart(e, pet.id)}
                onTouchEnd={handlePressEnd}
                onContextMenu={(e) => handleContextMenu(e, pet.id)}
                position="relative"
                role="button"
                aria-label={`Open ${pet.name}'s profile`}
                transition="transform 180ms cubic-bezier(.2,.9,.2,1), box-shadow 180ms ease"
                _hover={{ transform: "translateY(-6px)", boxShadow: cardShadow }}
                _active={{ transform: "translateY(-2px)" }}
                _focus={{ boxShadow: "none", outline: "none" }}
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                {/* Favorite toggle */}
                <IconButton
                  aria-label={isFavorite ? "Unfavorite" : "Favorite"}
                  icon={<Icon as={FaPaw} />}
                  size="sm"
                  position="absolute"
                  top={3}
                  right={3}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(pet.id);
                  }}
                  _focus={{ boxShadow: "none" }}
                  _active={{ bg: "transparent" }}
                  color={isFavorite ? "red.400" : useColorModeValue("gray.500", "gray.400")}
                  variant="ghost"
                />

                {/* Avatar / placeholder */}
                <Box display="flex" justifyContent="center" alignItems="center">
                  {pet.image ? (
                    <Avatar
                      name={pet.name}
                      src={pet.image}
                      size="lg"
                      imgProps={{
                        loading: "lazy",
                        draggable: false,
                        onDragStart: (e) => e.preventDefault(),
                        onContextMenu: (e) => e.preventDefault(),
                      }}
                      borderRadius="full"
                      boxShadow="sm"
                    />
                  ) : (
                    <Center
                      w={{ base: 20, md: 24 }}
                      h={{ base: 20, md: 24 }}
                      borderRadius="full"
                      bgGradient={gradients[index % gradients.length]}
                      onContextMenu={(e) => e.preventDefault()}
                      boxShadow="sm"
                      aria-hidden
                    >
                      <Icon as={FaPaw} boxSize={{ base: 6, md: 8 }} color="white" />
                    </Center>
                  )}
                </Box>

                {/* Name */}
                <Text mt={4} fontWeight={700} color={textColor} fontSize={{ base: "sm", md: "md" }}>
                  {pet.name}
                </Text>

                <Text mt={1} fontSize="xs" color="gray.400">
                  Tap to view profile
                </Text>
              </Box>
            );
          })
        )}
      </SimpleGrid>

      {/* Favorites */}
      <Box mb={6}>
        <HStack justify="space-between" mb={3} alignItems="center">
          <Text fontSize="sm" fontWeight={700} textTransform="uppercase">
            Favorites
          </Text>
          <Button variant="link" size="sm" onClick={() => { /* optional */ }}>
            View all
          </Button>
        </HStack>

        {favoriteList.length === 0 ? (
          <Box p={3} borderRadius="10px" bg={useColorModeValue("whiteAlpha.900", "gray.800")} border={`1px solid ${border}`}>
            <Text fontSize="sm" color="gray.500">No favorites yet — tap the paw on a pet to add them here.</Text>
          </Box>
        ) : (
          <Box py={2} mb={2} sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            <HStack spacing={3}>
              {favoriteList.map((p) => (
                <Box key={p.id} minW="120px" onClick={() => openPet(p)} cursor="pointer">
                  <VStack spacing={2} align="start">
                    <Box
                      w={14}
                      h={14}
                      borderRadius={12}
                      bg={cardBg}
                      border={`1px solid ${border}`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow={cardShadow}
                    >
                      {p.image ? (
                        <Avatar name={p.name} src={p.image} size="sm" imgProps={{ loading: "lazy" }} />
                      ) : (
                        <Center w="full" h="full">
                          <Icon as={FaPaw} boxSize={4} color={useColorModeValue("gray.700", "white")} />
                        </Center>
                      )}
                    </Box>

                    <Text fontWeight={600}>{p.name}</Text>
                  </VStack>
                </Box>
              ))}
            </HStack>
          </Box>
        )}
      </Box>

      {/* Recently viewed */}
      <Box mb={20}>
        <HStack justify="space-between" mb={3} alignItems="center">
          <Text fontSize="sm" fontWeight={700} textTransform="uppercase">
            Recently viewed
          </Text>
          <Button variant="link" size="sm" onClick={() => setRecentExpanded((s) => !s)}>
            {recentExpanded ? "Collapse" : "View all"}
          </Button>
        </HStack>

        <Box py={2} mb={2} sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch", transition: "max-height 220ms ease, opacity 220ms ease", maxHeight: recentExpanded ? "220px" : "120px" }}>
          <HStack spacing={3}>
            {recent.length === 0 ? (
              <Box p={3} borderRadius="10px" bg={useColorModeValue("whiteAlpha.900", "gray.800")} border={`1px solid ${border}`}>
                <Text fontSize="sm" color="gray.500">No recent pets</Text>
              </Box>
            ) : (
              recentList.map((p) => (
                <Box key={p.id} minW={recentExpanded ? "160px" : "120px"} onClick={() => openPet(p)} cursor="pointer">
                  <VStack spacing={2} align="start">
                    <Box w={recentExpanded ? 16 : 14} h={recentExpanded ? 16 : 14} borderRadius={recentExpanded ? 10 : 12} bg={cardBg} border={`1px solid ${border}`} display="flex" alignItems="center" justifyContent="center" boxShadow={cardShadow}>
                      {p.image ? (
                        <Avatar name={p.name} src={p.image} size="sm" imgProps={{ loading: "lazy" }} />
                      ) : (
                        <Center w="full" h="full">
                          <Icon as={FaPaw} boxSize={4} color={useColorModeValue("gray.700", "white")} />
                        </Center>
                      )}
                    </Box>

                    <Text fontWeight={600}>{p.name}</Text>
                  </VStack>
                </Box>
              ))
            )}
          </HStack>
        </Box>
      </Box>

      {/* Add Pet button - below Recently viewed section */}
      <Center mt={2} mb={1} flexDirection="column">
        <IconButton
          aria-label="Add pet"
          icon={<Icon as={FaPlus} />}
          size="lg"
          borderRadius="full"
          boxShadow={cardShadow}
          onClick={() => navigate("/pets/add")}
          _focus={{ boxShadow: "none" }}
          _active={{ bg: "transparent" }}
          bg={useColorModeValue("teal.400", "cyan.500")}
          color="white"
        />
        <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")} mt={2}>
          Add new pet
        </Text>
      </Center>

      {/* ---------- Anchored quick-action menu (appears near the selected card) ---------- */}
      {menu.open && (
        <Box
          ref={menuRef}
          position="fixed"
          top={`${menu.top}px`}
          left={`${menu.left}px`}
          w="220px"
          bg={useColorModeValue("white", "gray.800")}
          border={`1px solid ${border}`}
          borderRadius="10px"
          boxShadow="0 10px 30px rgba(2,6,23,0.12)"
          p={3}
          zIndex={90}
          onClick={(e) => e.stopPropagation()}
        >
          <Text fontWeight={700} mb={2}>
            {activePet ? activePet.name : "Pet"} — Quick actions
          </Text>

          <List spacing={2} styleType="disc" pl={4}>
            <ListItem display="flex" alignItems="center" gap={2}>
              <ListIcon as={FaStar} color={useColorModeValue("teal.400", "cyan.300")} />
              <Button variant="ghost" size="sm" justifyContent="flex-start" onClick={() => toggleFav(menu.petId)}>
                {favorites.has(menu.petId) ? "Remove from Favorites" : "Add to Favorites"}
              </Button>
            </ListItem>

            <ListItem display="flex" alignItems="center" gap={2}>
              <ListIcon as={FaTasks} color={useColorModeValue("gray.500", "gray.300")} />
              <Button variant="ghost" size="sm" justifyContent="flex-start" onClick={() => addTaskForPet(menu.petId)}>
                Add a new task
              </Button>
            </ListItem>

            <ListItem display="flex" alignItems="center" gap={2}>
              <ListIcon as={FaTrash} color="red.400" />
              <Button variant="ghost" size="sm" justifyContent="flex-start" colorScheme="red" onClick={() => setConfirmDeleteOpen(true)}>
                Delete Pet Profile
              </Button>
            </ListItem>
          </List>

          <Box mt={3}>
            <Button size="sm" variant="link" onClick={() => setMenu({ open: false, petId: null, top: 0, left: 0, placement: "right" })}>
              Close
            </Button>
          </Box>
        </Box>
      )}

      {/* ---------- Confirm Delete Dialog ---------- */}
      <AlertDialog isOpen={confirmDeleteOpen} leastDestructiveRef={cancelRef} onClose={() => setConfirmDeleteOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete pet profile
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this pet profile? This will remove it from your app (mock). The action can't be undone here.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setConfirmDeleteOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={() => deletePetConfirmed(menu.petId)} ml={3}>
                Continue
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
