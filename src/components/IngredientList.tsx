'use client';

import {
  Box,
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
  const loadDefaultIngredients = useStore((state) => state.loadDefaultIngredients);

  const bgEmpty = useColorModeValue('gray.100', 'gray.700');
  const textMuted = useColorModeValue('gray.500', 'gray.400');

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
