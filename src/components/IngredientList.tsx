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
} from '@chakra-ui/react';
import { useStore } from '@/store/useStore';
import { ShoppingList } from './ShoppingList';

export function IngredientList() {
  const myIngredients = useStore((state) => state.myIngredients);
  const removeIngredient = useStore((state) => state.removeIngredient);
  const loadDefaultIngredients = useStore((state) => state.loadDefaultIngredients);

  if (myIngredients.length === 0) {
    return (
      <Box
        p={6}
        textAlign="center"
        border="2px dashed"
        borderColor="whiteAlpha.200"
        borderRadius="xl"
      >
        <Text color="gray.400" mb={4}>
          No ingredients added yet. Search and add ingredients above.
        </Text>
        <Button
          size="sm"
          bgGradient="linear(to-r, purple.600, purple.500)"
          color="white"
          _hover={{ bgGradient: 'linear(to-r, purple.500, purple.400)' }}
          onClick={loadDefaultIngredients}
          borderRadius="xl"
        >
          Load Default Bar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Wrap spacing={2} overflow="visible">
        {myIngredients.map((ingredient) => (
          <WrapItem key={ingredient}>
            <Tag
              size="md"
              bg="purple.500"
              color="white"
              borderRadius="full"
              fontWeight="medium"
              px={3}
              py={1}
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
