'use client';

import {
  Box,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
  Button,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { useStore } from '@/store/useStore';
import { ShoppingList } from './ShoppingList';

export function IngredientList() {
  const myIngredients = useStore((state) => state.myIngredients);
  const removeIngredient = useStore((state) => state.removeIngredient);
  const clearIngredients = useStore((state) => state.clearIngredients);
  const loadDefaultIngredients = useStore((state) => state.loadDefaultIngredients);

  const bgEmpty = useColorModeValue('gray.100', 'gray.700');
  const textMuted = useColorModeValue('gray.500', 'gray.400');
  const textPrimary = useColorModeValue('gray.700', 'gray.200');

  if (myIngredients.length === 0) {
    return (
      <Box
        p={6}
        textAlign="center"
        bg={bgEmpty}
        borderRadius="md"
      >
        <Text color={textMuted} mb={4}>
          No ingredients added yet. Search and add ingredients above.
        </Text>
        <Button
          size="sm"
          colorScheme="teal"
          variant="outline"
          onClick={loadDefaultIngredients}
        >
          Load Default Bar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={3}>
        <Text fontWeight="medium" color={textPrimary}>
          Your Ingredients ({myIngredients.length})
        </Text>
        <Flex gap={2}>
          <Button
            size="xs"
            variant="ghost"
            colorScheme="teal"
            onClick={loadDefaultIngredients}
          >
            Reset
          </Button>
          <Button
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={clearIngredients}
          >
            Clear
          </Button>
        </Flex>
      </Flex>

      <Wrap spacing={2}>
        {myIngredients.map((ingredient) => (
          <WrapItem key={ingredient}>
            <Tag
              size="md"
              colorScheme="teal"
              borderRadius="full"
              variant="subtle"
            >
              <TagLabel>{ingredient}</TagLabel>
              <TagCloseButton onClick={() => removeIngredient(ingredient)} />
            </Tag>
          </WrapItem>
        ))}
      </Wrap>

      <ShoppingList />
    </Box>
  );
}
