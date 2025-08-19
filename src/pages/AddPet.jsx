// src/pages/AddPet.jsx
import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Heading,
  IconButton,
  Input,
  Textarea,
  Text,
  Select,
  useColorModeValue,
  VStack,
  Center,
  Icon,
  Image,
} from "@chakra-ui/react";
import { FaPen, FaPaw } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AddPet() {
  const navigate = useNavigate();
  const [petName, setPetName] = useState("");
  const [age, setAge] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const inputFileRef = useRef(null);

  const borderColor = useColorModeValue("black", "white");

  const handleSave = () => {
    if (!petName.trim()) {
      setError("Pet name is compulsory");
      return;
    }
    console.log({ petName, age, description, gender, image });
    navigate("/pets");
  };

  const handleImageClick = () => {
    inputFileRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const glassBg = useColorModeValue(
    "rgba(255, 255, 255, 0.15)",
    "rgba(0, 0, 0, 0.2)"
  );

  return (
    <Box minH="100vh" px={{ base: 4, md: 8 }} py={6} display="flex" justifyContent="center">
      {/* Glass container */}
      <Box
        w="full"
        maxW="600px"
        p={6}
        borderRadius="16px"
        backdropFilter="blur(12px)"
        bg={glassBg}
        border={`1px solid ${useColorModeValue("rgba(0,0,0,0.1)", "rgba(255,255,255,0.2)")}`}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" mb={6}>
          <Heading fontSize="2xl" fontWeight="bold">
            Create Pet Profile
          </Heading>
          <Button fontWeight="bold" variant="link" onClick={() => navigate(-1)}>
            Exit
          </Button>
        </Box>

        <VStack spacing={6} align="stretch">
          {/* Image Placeholder (Square) */}
          <Box
            position="relative"
            w="200px"
            h="200px"
            border={`2px solid ${borderColor}`}
            borderRadius="12px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            mx="auto"
            bg="transparent"
          >
            {image ? (
              <Image
                src={image}
                alt="Pet"
                boxSize="200px"
                borderRadius="12px"
                objectFit="cover"
              />
            ) : (
              <Center w="full" h="full">
                <Icon
                  as={FaPaw}
                  boxSize={20}
                  color={useColorModeValue("gray.300", "gray.600")}
                />
              </Center>
            )}

            {/* Pen Icon */}
            <IconButton
              aria-label="Edit Image"
              icon={<FaPen />}
              position="absolute"
              bottom={2}
              right={2}
              colorScheme="blue"
              borderRadius="full"
              size="sm"
              onClick={handleImageClick}
            />
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={inputFileRef}
              onChange={handleFileChange}
            />
          </Box>

          {/* Name Field */}
          <Box border={`1px solid ${borderColor}`} borderRadius="10px" p={4}>
            <Text fontWeight="bold" mb={1}>
              Pet Name
            </Text>
            <Input
              placeholder="Enter pet's name"
              value={petName}
              onChange={(e) => {
                setPetName(e.target.value);
                if (error) setError("");
              }}
            />
            {error && <Text color="red.400" mt={1}>{error}</Text>}
          </Box>

          {/* Age Field */}
          <Box border={`1px solid ${borderColor}`} borderRadius="10px" p={4}>
            <Text fontWeight="bold" mb={1}>
              Age (optional)
            </Text>
            <Input
              placeholder="Enter pet's age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </Box>

          {/* Description Field */}
          <Box border={`1px solid ${borderColor}`} borderRadius="10px" p={4}>
            <Text fontWeight="bold" mb={1}>
              Description (optional)
            </Text>
            <Textarea
              placeholder="Enter any description or notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Box>

          {/* Gender Field */}
          <Box border={`1px solid ${borderColor}`} borderRadius="10px" p={4}>
            <Text fontWeight="bold" mb={1}>
              Gender (optional)
            </Text>
            <Select
              placeholder="Select Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unknown">Unknown</option>
            </Select>
          </Box>

          {/* Save Button */}
          <Button
            colorScheme="teal"
            size="md"
            variant="outline"
            onClick={handleSave}
            alignSelf="flex-start"
          >
            Save Pet
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
