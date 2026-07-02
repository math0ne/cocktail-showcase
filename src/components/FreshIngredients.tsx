'use client';

import {
  Box,
  Wrap,
  WrapItem,
  Button,
  SimpleGrid,
} from '@chakra-ui/react';
import { useStore } from '@/store/useStore';

const INGREDIENT_CATEGORIES = [
  {
    name: 'Fresh',
    color: 'green',
    bgColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.2)',
    items: [
      'Lime',
      'Lemon',
      'Orange',
      'Mint',
      'Basil',
      'Ginger',
      'Cucumber',
      'Egg White',
      'Cream',
      'Milk',
    ],
  },
  {
    name: 'Juices',
    color: 'orange',
    bgColor: 'rgba(251, 146, 60, 0.08)',
    borderColor: 'rgba(251, 146, 60, 0.2)',
    items: [
      'Orange Juice',
      'Cranberry Juice',
      'Pineapple Juice',
      'Grapefruit Juice',
      'Lime Juice',
      'Lemon Juice',
      'Tomato Juice',
      'Apple Juice',
    ],
  },
  {
    name: 'Sodas',
    color: 'blue',
    bgColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    items: [
      'Tonic Water',
      'Soda Water',
      'Cola',
      'Ginger Ale',
      'Ginger Beer',
      'Lemon-Lime Soda',
      'Sparkling Water',
    ],
  },
];

export function FreshIngredients() {
  const myIngredients = useStore((state) => state.myIngredients);
  const addIngredient = useStore((state) => state.addIngredient);
  const removeIngredient = useStore((state) => state.removeIngredient);

  const isActive = (ingredient: string) =>
    myIngredients.some((i) => i.toLowerCase() === ingredient.toLowerCase());

  const toggleIngredient = (ingredient: string) => {
    if (isActive(ingredient)) {
      removeIngredient(ingredient);
    } else {
      addIngredient(ingredient);
    }
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3}>
      {INGREDIENT_CATEGORIES.map((category) => (
        <Box
          key={category.name}
          bg={category.bgColor}
          border="1px solid"
          borderColor={category.borderColor}
          borderRadius="xl"
          p={3}
        >
          <Wrap spacing={2}>
            {category.items.map((ingredient) => {
              const active = isActive(ingredient);
              return (
                <WrapItem key={ingredient}>
                  <Button
                    size="xs"
                    h="26px"
                    px={2.5}
                    bg={active ? `${category.color}.500` : 'whiteAlpha.100'}
                    color={active ? 'white' : 'gray.400'}
                    borderRadius="full"
                    _hover={{
                      bg: active ? `${category.color}.400` : 'whiteAlpha.200',
                    }}
                    onClick={() => toggleIngredient(ingredient)}
                    fontWeight={active ? 'medium' : 'normal'}
                    fontSize="xs"
                  >
                    {ingredient}
                  </Button>
                </WrapItem>
              );
            })}
          </Wrap>
        </Box>
      ))}
    </SimpleGrid>
  );
}
