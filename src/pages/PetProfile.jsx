// src/pages/PetProfile.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Image,
  Heading,
  Text,
  HStack,
  VStack,
  Badge,
  IconButton,
  Button,
  Stack,
  useColorModeValue,
  Center,
  SimpleGrid,
  Divider,
  Icon,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaPaw, FaEdit, FaPlus, FaTrash } from "react-icons/fa";

// --- Mock data for UI-only (replace with real backend later) ---
const MOCK_PETS = {
  p1: {
    id: "p1",
    name: "Milo",
    age: "2 yrs",
    gender: "Male",
    breed: "Domestic Shorthair",
    weight: "4.2 kg",
    notes:
      "Milo is a calm, affectionate cat who enjoys long naps in sunbeams and a carefully curated selection of tuna flakes. He is social with adults, patient with children, and warms up slowly to new people. Milo naps up to 18 hours a day but lights up for play sessions with feather toys. Keep dry food accessible and a small bowl of wet food for special treats. He responds well to routine and prefers low-stress, predictable environments.",
    image: "",
    gallery: [],
    schedule: [
      { id: "s1", title: "Feed", time: "8:00 AM" },
      { id: "s2", title: "Walk", time: "10:30 AM" },
      { id: "s3", title: "Bathe", time: "3:00 PM" },
    ],
    logs: [
      { id: "l1", date: "2025-08-01", text: "Vaccination — Rabies shot recorded." },
      { id: "l2", date: "2025-07-18", text: "Vet visit — mild ear infection; prescribed drops." },
    ],
  },
  p2: {
    id: "p2",
    name: "Luna",
    age: "1 yr",
    gender: "Female",
    breed: "Siamese mix",
    weight: "3.8 kg",
    notes:
      "Luna is curious and energetic. She explores everything and loves high perches. She needs daily mental stimulation — puzzle feeders, interactive toys, or short play sessions. She's shy at first but affectionate once comfortable. Watch for overstimulation during grooming and introduce new people slowly.",
    image: "",
    gallery: [],
    schedule: [],
    logs: [],
  },
  p3: {
    id: "p3",
    name: "Simba",
    age: "4 yrs",
    gender: "Male",
    breed: "Tabby",
    weight: "5.0 kg",
    notes:
      "Simba is athletic and playful. He loves chasing laser pointers and fetch-style games. Needs regular exercise to prevent boredom and weight gain. Prefers structured play sessions and responds well to positive reinforcement. Keep treats as a training reward and maintain a consistent vet schedule.",
    image: "",
    gallery: [],
    schedule: [],
    logs: [],
  },
  p4: {
    id: "p4",
    name: "Nala",
    age: "3 yrs",
    gender: "Female",
    breed: "Persian",
    weight: "3.5 kg",
    notes:
      "Nala requires regular grooming due to her long coat. She's affectionate and enjoys slow, gentle petting. Monitor for matting and keep nails trimmed. Nala prefers calm environments and short, predictable routines.",
    image: "",
    gallery: [],
    schedule: [],
    logs: [],
  },
  p5: {
    id: "p5",
    name: "Ollie",
    age: "5 yrs",
    gender: "Male",
    breed: "Mixed",
    weight: "6.1 kg",
    notes:
      "Ollie is mellow and loves cuddles. He's a great companion for quieter households and tolerates handling well. Keep an eye on weight and provide gentle exercise daily. Ollie appreciates soft beds and consistent feeding times.",
    image: "",
    gallery: [],
    schedule: [],
    logs: [],
  },
};

export default function PetProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Local pet state so edit modal can modify UI without backend
  const [petData, setPetData] = useState(() => ({ ...MOCK_PETS[id] }));

  useEffect(() => {
    setPetData({ ...MOCK_PETS[id] });
  }, [id]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", breed: "", age: "", weight: "", notes: "" });

  // Improved contrast for light theme: subtle card surface instead of pure white
  const surface = useColorModeValue("gray.50", "gray.800");
  const muted = useColorModeValue("gray.600", "gray.300");
  const subtle = useColorModeValue("gray.100", "gray.700");
  const accent = useColorModeValue("teal.500", "cyan.300");

  function handleDelete() {
    // Mock delete: go back to pets list after "deletion"
    setConfirmOpen(false);
    navigate("/pets");
  }

  function openEdit() {
    setEditForm({
      name: petData.name || "",
      breed: petData.breed || "",
      age: petData.age || "",
      weight: petData.weight || "",
      notes: petData.notes || "",
    });
    setIsEditOpen(true);
  }

  function saveEdit() {
    setPetData((p) => ({ ...p, ...editForm }));
    setIsEditOpen(false);
  }

  return (
    <Box
      minH="100vh"
      pb={20}
      px={{ base: 3, md: 6 }}
      sx={{
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTapHighlightColor: "transparent"
      }}
    >
      {/* Top bar (minimal) */}
      <Box display="flex" alignItems="center" justifyContent="space-between" pt={4}>
        <Heading as="h2" size="md" fontWeight={800} color={useColorModeValue("gray.800", "white")}> 
          Pet Profile
        </Heading>
        <IconButton
          aria-label="Back"
          icon={<FaArrowLeft />}
          variant="ghost"
          onClick={() => navigate(-1)}
          _focus={{ boxShadow: "none", outline: "none" }}
          _active={{ bg: "transparent" }}
        />
      </Box>

      {/* Avatar + name (clean, slightly lowered) */}
      <Center mt={6}>
        <VStack spacing={3} align="center">
          <Box
            borderRadius="12px"
            overflow="hidden"
            border={`3px solid ${useColorModeValue("white", "#0b1220")}`}
            boxShadow="md"
            w={{ base: "160px", md: "220px" }}
            h={{ base: "160px", md: "220px" }}
            bg={petData.image ? "transparent" : subtle}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {petData.image ? (
              <Image src={petData.image} alt={petData.name} objectFit="cover" w="full" h="full" />
            ) : (
              <Icon as={FaPaw} boxSize={{ base: 10, md: 14 }} color={accent} />
            )}
          </Box>

          <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight={800}>
            {petData.name}
          </Text>

          {/* Summary chips (improved contrast on light theme) */}
          <HStack spacing={2} mt={2}>
            <Badge bg={useColorModeValue("gray.100", "gray.700")} color={useColorModeValue("gray.800", "whiteAlpha.900")} fontWeight={600} px={2} py={1} borderRadius="md">
              {petData.breed}
            </Badge>
            <Badge bg={useColorModeValue("gray.100", "gray.700")} color={useColorModeValue("gray.800", "whiteAlpha.900")} fontWeight={600} px={2} py={1} borderRadius="md">
              {petData.age}
            </Badge>
            <Badge bg={useColorModeValue("gray.100", "gray.700")} color={useColorModeValue("gray.800", "whiteAlpha.900")} fontWeight={600} px={2} py={1} borderRadius="md">
              {petData.gender}
            </Badge>
            <Badge bg={useColorModeValue("gray.100", "gray.700")} color={useColorModeValue("gray.800", "whiteAlpha.900")} fontWeight={600} px={2} py={1} borderRadius="md">
              {petData.weight}
            </Badge>
          </HStack>
        </VStack>
      </Center>

      {/* Main: single column with description card that includes the action buttons and sections inside */}
      <Box maxW={{ base: "96%", md: "880px" }} mx="auto" mt={6}>
        <Box bg={surface} borderRadius="12px" p={{ base: 4, md: 6 }} boxShadow="sm">
          <Text fontSize="sm" color={muted} mb={2}>
            Description
          </Text>

          {/* Longer description */}
          <Text mb={4} lineHeight="1.6">
            {petData.notes}
          </Text>

          {/* Action buttons now live inside this card, side-by-side */}
          <HStack spacing={3} mb={4}>
            <Button
              leftIcon={<FaPlus />}
              size="md"
              flex="1"
              onClick={() => navigate(`/tasks?pet=${petData.id}`)}
              _focus={{ boxShadow: "none", outline: "none" }}
              _active={{ bg: "transparent" }}
            >
              Add Task
            </Button>
            <Button
              leftIcon={<FaEdit />}
              size="md"
              variant="outline"
              flex="1"
              onClick={openEdit}
              _focus={{ boxShadow: "none", outline: "none" }}
              _active={{ bg: "transparent" }}
            >
              Edit
            </Button>
            <Button
              leftIcon={<FaTrash />}
              size="md"
              variant="ghost"
              colorScheme="red"
              onClick={() => setConfirmOpen(true)}
              _focus={{ boxShadow: "none", outline: "none" }}
              _active={{ bg: "transparent" }}
            >
              Delete
            </Button>
          </HStack>

          <Divider mb={4} />

          {/* Schedule (inside same card) */}
          <Box mb={4}>
            <Text fontSize="sm" color={muted} mb={2}>
              Schedule
            </Text>
            {petData.schedule.length === 0 ? (
              <Text color="gray.500">No scheduled items.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                {petData.schedule.map((s) => (
                  <Box key={s.id} p={3} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="8px">
                    <HStack justify="space-between">
                      <Text>{s.title}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {s.time}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>

          {/* Gallery (inside same card) */}
          <Box mb={4}>
            <Text fontSize="sm" color={muted} mb={2}>
              Gallery
            </Text>
            {petData.gallery.length === 0 ? (
              <Text color="gray.500">No photos yet — add images when editing the profile.</Text>
            ) : (
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
                {petData.gallery.map((src, i) => (
                  <Box key={i} borderRadius="8px" overflow="hidden">
                    <Image src={src} alt={`${petData.name}-${i}`} objectFit="cover" w="full" h="120px" />
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </Box>

          {/* Logs (inside same card) */}
          <Box>
            <Text fontSize="sm" color={muted} mb={2}>
              Logs
            </Text>
            {petData.logs.length === 0 ? (
              <Text color="gray.500">No logs yet.</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {petData.logs.map((l) => (
                  <Box key={l.id} p={3} borderRadius="8px" bg={useColorModeValue("gray.50", "gray.700")}>
                    <Text fontSize="sm"><strong>{l.date}:</strong> {l.text}</Text>
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit modal (UI-only) */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit pet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Name</FormLabel>
              <Input value={editForm.name} onChange={(e) => setEditForm((s) => ({ ...s, name: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Breed</FormLabel>
              <Input value={editForm.breed} onChange={(e) => setEditForm((s) => ({ ...s, breed: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Age</FormLabel>
              <Input value={editForm.age} onChange={(e) => setEditForm((s) => ({ ...s, age: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Weight</FormLabel>
              <Input value={editForm.weight} onChange={(e) => setEditForm((s) => ({ ...s, weight: e.target.value }))} />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Notes</FormLabel>
              <Textarea value={editForm.notes} onChange={(e) => setEditForm((s) => ({ ...s, notes: e.target.value }))} rows={6} />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsEditOpen(false)}
              _focus={{ boxShadow: "none", outline: "none" }}
              _active={{ bg: "transparent" }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={saveEdit}
              _focus={{ boxShadow: "none", outline: "none" }}
              _active={{ bg: "transparent" }}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirm delete dialog */}
      <AlertDialog isOpen={confirmOpen} leastDestructiveRef={undefined} onClose={() => setConfirmOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete pet profile</AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this pet profile? This will remove the pet from the app (mock). This action cannot be undone here.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                variant="ghost"
                onClick={() => setConfirmOpen(false)}
                _focus={{ boxShadow: "none", outline: "none" }}
                _active={{ bg: "transparent" }}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                ml={3}
                onClick={handleDelete}
                _focus={{ boxShadow: "none", outline: "none" }}
                _active={{ bg: "transparent" }}
              >
                Continue
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
