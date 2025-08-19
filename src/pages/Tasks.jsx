// src/pages/Tasks.jsx
import React, { useState } from "react";
import {
  Box,
  Checkbox,
  Flex,
  HStack,
  Icon,
  Text,
  VStack,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaCheck, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Tasks() {
  const [tasks, setTasks] = useState([]); // starts empty
  const navigate = useNavigate();

  const handleToggle = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDelete = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const bgBox = useColorModeValue("white", "gray.700");
  const outlineColor = useColorModeValue("black", "white");
  const completedColor = useColorModeValue("gray.400", "gray.500");

  const todaysTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const textStyle = { userSelect: "none" };

  return (
    <Box minH="100vh" px={{ base: 4, md: 8 }} py={6} style={textStyle}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">
          Tasks
        </Text>
        <Button
          variant="outline"
          colorScheme="blue"
          onClick={() => navigate("/tasks/new")}
          _focus={{ boxShadow: "none" }}
        >
          + Add Task
        </Button>
      </Flex>

      {/* Today's Tasks Section */}
      <Text
        fontSize="xl"
        fontWeight="semibold"
        mb={2}
        borderBottom="1px"
        borderColor={outlineColor}
        pb={1}
      >
        Today's Tasks
      </Text>
      <VStack spacing={4} align="stretch" mb={6}>
        {tasks.length === 0 ? (
          <Box
            p={4}
            textAlign="center"
            borderWidth="1px"
            borderColor={outlineColor}
            borderRadius="md"
          >
            <Text>
              No tasks available.{" "}
              <Text
                as="span"
                color="blue.500"
                cursor="pointer"
                onClick={() => navigate("/tasks/new")}
              >
                Add Task
              </Text>
            </Text>
          </Box>
        ) : todaysTasks.length === 0 ? (
          <Box
            p={4}
            textAlign="center"
            borderWidth="1px"
            borderColor={outlineColor}
            borderRadius="md"
          >
            <Text>
              You have completed your pets' daily tasks.{" "}
              <Text
                as="span"
                color="blue.500"
                cursor="pointer"
                onClick={() => navigate("/tasks/new")}
              >
                Add Task
              </Text>
            </Text>
          </Box>
        ) : (
          todaysTasks.map((task) => (
            <Flex
              key={task.id}
              p={4}
              bg={bgBox}
              borderWidth="1px"
              borderColor={outlineColor}
              borderRadius="md"
              justify="space-between"
              align="center"
            >
              <HStack>
                <Checkbox
                  isChecked={task.completed}
                  onChange={() => handleToggle(task.id)}
                  _focus={{ boxShadow: "none" }}
                />
                <Text>{task.title}</Text>
              </HStack>
              <FaTrash
                style={{ cursor: "pointer", fontSize: "14px", color: "red" }}
                onClick={() => handleDelete(task.id)}
              />
            </Flex>
          ))
        )}
      </VStack>

      {/* Completed Tasks Section */}
      <Text
        fontSize="xl"
        fontWeight="semibold"
        mb={2}
        borderBottom="1px"
        borderColor={outlineColor}
        pb={1}
      >
        Completed Tasks
      </Text>
      <VStack spacing={4} align="stretch">
        {completedTasks.length > 0 ? (
          completedTasks.map((task) => (
            <Flex
              key={task.id}
              p={4}
              bg={bgBox}
              borderWidth="1px"
              borderColor={outlineColor}
              borderRadius="md"
              justify="space-between"
              align="center"
              opacity={0.6}
            >
              <HStack>
                <Icon as={FaCheck} color={completedColor} />
                <Text>{task.title}</Text>
              </HStack>
            </Flex>
          ))
        ) : (
          <Box
            p={4}
            textAlign="center"
            borderWidth="1px"
            borderColor={outlineColor}
            borderRadius="md"
          >
            <Text>
              No tasks have been completed.{" "}
              <Text
                as="span"
                color="blue.500"
                cursor="pointer"
                onClick={() => navigate("/tasks/new")}
              >
                Add Task
              </Text>
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
