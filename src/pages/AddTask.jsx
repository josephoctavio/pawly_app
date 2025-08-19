// src/pages/AddTask.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Button,
  HStack,
  VStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Checkbox,
  CheckboxGroup,
  Select,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Divider,
  Icon,
  Spinner,
  SimpleGrid,
  IconButton,
} from "@chakra-ui/react";
import {
  FaInfoCircle,
  FaPaw,
  FaSave,
  FaTimes,
  FaUtensils,
  FaBath,
  FaBell,
  FaArrowLeft,
} from "react-icons/fa";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

/**
 * AddTask.jsx — updated:
 * - Modal overlay now has a slightly opaque bg for readability.
 * - Exit replaced with small back icon (top-left).
 * - Priority & Type selects restyled (outline + custom chevron).
 * - 2s Save spinner kept.
 *
 * Notes: mobile OS may still show native pickers; that's expected.
 */

export default function AddTask() {
  const navigate = useNavigate();

  // === placeholder pet data (replace with real pets later) ===
  const placeholderPets = useMemo(
    () => [
      { id: "p1", label: "Tom" },
      { id: "p2", label: "Grug" },
      { id: "p3", label: "Ham" },
      { id: "p4", label: "Whiskers" },
    ],
    []
  );

  // === form state ===
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPets, setSelectedPets] = useState([]);
  const [reminderOption, setReminderOption] = useState("off");
  const [customDateTime, setCustomDateTime] = useState("");
  const [priority, setPriority] = useState("normal");
  const [taskType, setTaskType] = useState("");
  const [errors, setErrors] = useState({});
  const [petsModalOpen, setPetsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // === dynamic title placeholder (random suggestion on mount) ===
  const verbsForPlaceholder = [
    "Feed",
    "Bathe",
    "Groom",
    "Walk",
    "Give meds to",
    "Play with",
    "Check",
  ];
  const [titlePlaceholder, setTitlePlaceholder] = useState("Add task");

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  useEffect(() => {
    const names = placeholderPets.map((p) => p.label).filter(Boolean);
    if (names.length === 0) {
      setTitlePlaceholder("Add task");
      return;
    }

    if (names.length > 1 && Math.random() < 0.3) {
      const verb = pickRandom(verbsForPlaceholder.slice(0, 3));
      setTitlePlaceholder(`${verb} all pets`);
      return;
    }

    const verb = pickRandom(verbsForPlaceholder);
    const name = pickRandom(names);
    setTitlePlaceholder(`${verb} ${name}`);
  }, [placeholderPets]);

  // === UI tokens & helpers ===
  const borderColor = useColorModeValue("rgba(11,20,34,0.06)", "rgba(255,255,255,0.06)");
  const surface = useColorModeValue("rgba(255,255,255,0.02)", "rgba(255,255,255,0.01)");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const pageStyle = { userSelect: "none", WebkitUserSelect: "none" };
  const btnFocus = { _focus: { boxShadow: "none" }, _active: { bg: "transparent" } };

  const allPetIds = useMemo(() => placeholderPets.map((p) => p.id), [placeholderPets]);
  const isAllSelected = selectedPets.length === allPetIds.length && allPetIds.length > 0;

  // overlay background for better readability (light vs dark)
  const modalOverlayBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(0,0,0,0.6)");

  // === reminder computation ===
  function computeReminderISO() {
    if (reminderOption === "off") return null;
    const now = Date.now();
    if (reminderOption === "15m") return new Date(now + 15 * 60 * 1000).toISOString();
    if (reminderOption === "30m") return new Date(now + 30 * 60 * 1000).toISOString();
    if (reminderOption === "1h") return new Date(now + 60 * 60 * 1000).toISOString();
    if (reminderOption === "tomorrow9") {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      t.setHours(9, 0, 0, 0);
      return t.toISOString();
    }
    if (reminderOption === "custom") {
      if (!customDateTime) return null;
      const parsed = new Date(customDateTime);
      if (isNaN(parsed.getTime())) return null;
      return parsed.toISOString();
    }
    return null;
  }

  // === validation ===
  function validate() {
    const e = {};
    if (!title.trim()) e.title = "Task title is required";
    if (!description.trim()) e.description = "Description is required";
    if (!selectedPets.length) e.pets = "Please select at least one pet";
    if (reminderOption === "custom" && !customDateTime) e.reminder = "Please choose a date & time for the custom reminder";
    return e;
  }

  // doSave after spinner
  function doSave() {
    const now = new Date();
    const task = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      pets: isAllSelected ? "all" : [...selectedPets],
      reminder: computeReminderISO(),
      priority,
      type: taskType || null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      completed: false,
    };

    console.log("Saved task (MVP):", task);

    // reset
    setTitle("");
    setDescription("");
    setSelectedPets([]);
    setReminderOption("off");
    setCustomDateTime("");
    setPriority("normal");
    setTaskType("");
    setErrors({});

    navigate("/tasks");
  }

  function handleSaveClick() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      doSave();
      setIsSaving(false);
    }, 2000);
  }

  // pets selection helpers
  function toggleSelectAll() {
    if (isAllSelected) setSelectedPets([]);
    else setSelectedPets([...allPetIds]);
  }
  function togglePet(id) {
    setSelectedPets((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function removePetTag(id) {
    setSelectedPets((prev) => prev.filter((x) => x !== id));
  }

  return (
    <Box minH="100vh" px={{ base: 4, md: 8 }} py={6} style={pageStyle}>
      {/* Header with compact back icon at top-left */}
      <Flex align="center" justify="flex-start" mb={6} position="relative">
        <IconButton
          aria-label="Back"
          icon={<FaArrowLeft />}
          variant="ghost"
          onClick={() => navigate(-1)}
          size="sm"
          {...btnFocus}
        />
        <Text ml={3} fontSize="2xl" fontWeight="bold" color={textColor}>
          Add Task
        </Text>
      </Flex>

      {/* Glass container */}
      <Box
        w={{ base: "100%", md: "720px" }}
        mx="auto"
        p={6}
        border={`1px solid ${borderColor}`}
        borderRadius="12px"
        backdropFilter="blur(6px)"
        bg={surface}
      >
        <Stack spacing={4}>
          {/* Title */}
          <FormControl isRequired isInvalid={!!errors.title}>
            <FormLabel>Task Title</FormLabel>
            <Input
              placeholder={titlePlaceholder}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              {...btnFocus}
              autoComplete="off"
            />
            <FormErrorMessage>{errors.title}</FormErrorMessage>
          </FormControl>

          {/* Description */}
          <FormControl isRequired isInvalid={!!errors.description}>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Details (required)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              {...btnFocus}
            />
            <FormErrorMessage>{errors.description}</FormErrorMessage>
          </FormControl>

          {/* Pets selector */}
          <FormControl isRequired isInvalid={!!errors.pets}>
            <FormLabel>Assign Pet(s)</FormLabel>

            <HStack spacing={3} mb={2}>
              <Button size="sm" variant="outline" onClick={() => setPetsModalOpen(true)} {...btnFocus} leftIcon={<FaPaw />}>
                Choose pets
              </Button>

              <Button size="sm" variant="ghost" onClick={toggleSelectAll} {...btnFocus} leftIcon={<FaInfoCircle />}>
                {isAllSelected ? "Unselect all" : "Select all"}
              </Button>

              <Text fontSize="sm" color="gray.500" ml="auto">
                {selectedPets.length === 0 ? "No pet selected" : `${selectedPets.length} selected`}
              </Text>
            </HStack>

            <HStack spacing={2} wrap="wrap">
              {isAllSelected ? (
                <Tag borderRadius="md" variant="solid" colorScheme="teal">
                  <TagLabel>All pets</TagLabel>
                  <TagCloseButton onClick={() => setSelectedPets([])} />
                </Tag>
              ) : selectedPets.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  Select pet(s)
                </Text>
              ) : (
                selectedPets.map((id) => {
                  const p = placeholderPets.find((x) => x.id === id);
                  return (
                    <Tag key={id} borderRadius="md">
                      <TagLabel>{p ? p.label : id}</TagLabel>
                      <TagCloseButton onClick={() => removePetTag(id)} />
                    </Tag>
                  );
                })
              )}
            </HStack>

            <FormErrorMessage>{errors.pets}</FormErrorMessage>
          </FormControl>

          {/* Restyled Reminder section */}
          <FormControl isInvalid={!!errors.reminder}>
            <FormLabel>
              <HStack spacing={2}>
                <Icon as={FaBell} />
                <Text>Reminder (optional)</Text>
              </HStack>
            </FormLabel>

            <Box
              p={3}
              borderRadius="10px"
              border={`1px dashed ${useColorModeValue("gray.200", "rgba(255,255,255,0.06)")}`}
              bg={useColorModeValue("whiteAlpha.50", "blackAlpha.200")}
            >
              <SimpleGrid columns={{ base: 2, md: 3 }} spacing={2} mb={3}>
                {[
                  { key: "off", label: "Off" },
                  { key: "15m", label: "In 15m" },
                  { key: "30m", label: "In 30m" },
                  { key: "1h", label: "In 1h" },
                  { key: "tomorrow9", label: "Tomorrow 9:00" },
                  { key: "custom", label: "Custom" },
                ].map((opt) => (
                  <Button
                    key={opt.key}
                    size="sm"
                    onClick={() => setReminderOption(opt.key)}
                    variant={reminderOption === opt.key ? "solid" : "outline"}
                    colorScheme={reminderOption === opt.key ? "teal" : undefined}
                    {...btnFocus}
                  >
                    {opt.label}
                  </Button>
                ))}
              </SimpleGrid>

              {reminderOption === "custom" && (
                <Box mb={2}>
                  <Input type="datetime-local" value={customDateTime} onChange={(e) => setCustomDateTime(e.target.value)} {...btnFocus} />
                </Box>
              )}

              {reminderOption !== "off" && reminderOption !== "custom" && (
                <Text fontSize="sm" color="gray.500">
                  Preview: <strong>{new Date(computeReminderISO() || Date.now()).toLocaleString()}</strong>
                </Text>
              )}

              {reminderOption === "custom" && customDateTime && (
                <Text fontSize="sm" color="gray.500">
                  Custom: <strong>{new Date(customDateTime).toLocaleString()}</strong>
                </Text>
              )}
            </Box>

            <FormErrorMessage>{errors.reminder}</FormErrorMessage>
          </FormControl>

          {/* Priority & Type - styled selects */}
          <HStack spacing={4}>
            <FormControl w="48%">
              <FormLabel>Priority</FormLabel>
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                variant="outline"
                icon={<ChevronDownIcon />}
                sx={{ appearance: "none", WebkitAppearance: "none" }}
                {...btnFocus}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </Select>
            </FormControl>

            <FormControl w="48%">
              <FormLabel>Type</FormLabel>
              <Select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                variant="outline"
                icon={<ChevronDownIcon />}
                sx={{ appearance: "none", WebkitAppearance: "none" }}
                {...btnFocus}
              >
                <option value="">(Unspecified)</option>
                <option value="feeding">Feeding</option>
                <option value="bath">Bath</option>
                <option value="medicine">Medicine</option>
                <option value="vet">Vet</option>
                <option value="other">Other</option>
              </Select>
            </FormControl>
          </HStack>

          <Divider />

          {/* Actions centered */}
          <Flex justify="center" gap={3}>
            <HStack spacing={3} justify="center">
              <Button variant="ghost" onClick={() => navigate(-1)} {...btnFocus} leftIcon={<FaTimes />}>
                Cancel
              </Button>

              <Button
                colorScheme="teal"
                variant="outline"
                onClick={handleSaveClick}
                leftIcon={isSaving ? undefined : <FaSave />}
                {...btnFocus}
                isDisabled={isSaving}
              >
                {isSaving ? (
                  <HStack spacing={2}>
                    <Spinner size="sm" />
                    <Text>Saving...</Text>
                  </HStack>
                ) : (
                  "Save Task"
                )}
              </Button>
            </HStack>
          </Flex>
        </Stack>
      </Box>

      {/* Pets selection modal — overlay uses a slightly opaque bg for readability */}
      <Modal isOpen={petsModalOpen} onClose={() => setPetsModalOpen(false)} isCentered>
        <ModalOverlay bg={modalOverlayBg} />
        <ModalContent borderRadius="12px" border={`1px solid ${borderColor}`} bg={surface}>
          <ModalHeader>Select pets</ModalHeader>
          <ModalCloseButton {...btnFocus} />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              <HStack justify="space-between">
                <Text fontWeight={700}>Pets</Text>
                <Button size="sm" variant="ghost" onClick={toggleSelectAll} {...btnFocus}>
                  {isAllSelected ? "Unselect all" : "Select all"}
                </Button>
              </HStack>

              <CheckboxGroup value={selectedPets}>
                <VStack align="stretch">
                  {placeholderPets.map((p) => (
                    <Checkbox
                      key={p.id}
                      value={p.id}
                      isChecked={selectedPets.includes(p.id)}
                      onChange={() => togglePet(p.id)}
                      {...btnFocus}
                    >
                      <HStack>
                        <Icon as={FaPaw} />
                        <Text>{p.label}</Text>
                      </HStack>
                    </Checkbox>
                  ))}
                </VStack>
              </CheckboxGroup>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setPetsModalOpen(false)} {...btnFocus}>
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedPets.length === 0) setSelectedPets([...allPetIds]);
                setPetsModalOpen(false);
              }}
              {...btnFocus}
            >
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
