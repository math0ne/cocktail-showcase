'use client';

import {
  Box,
  Wrap,
  WrapItem,
  Button,
  Text,
} from '@chakra-ui/react';
import { useStore } from '@/store/useStore';

const INGREDIENT_CATEGORIES = [
  {
    name: 'Fresh',
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
    <Wrap spacing={1} align="center">
      {INGREDIENT_CATEGORIES.map((category, idx) => (
        <>
          {idx > 0 && <WrapItem key={`sep-${category.name}`}><Box w={2} /></WrapItem>}
          <WrapItem key={`label-${category.name}`}>
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color="gray.500"
              mr={1}
              textTransform="uppercase"
              letterSpacing="wider"
            >
              {category.name}:
            </Text>
          </WrapItem>
          {category.items.map((ingredient) => {
            const active = isActive(ingredient);
            return (
              <WrapItem key={ingredient}>
                <Button
                  size="sm"
                  h="28px"
                  px={3}
                  bg={active ? 'purple.600' : 'gray.800'}
                  color={active ? 'white' : 'gray.400'}
                  borderRadius="full"
                  _hover={{
                    bg: active ? 'purple.500' : 'gray.700',
                  }}
                  onClick={() => toggleIngredient(ingredient)}
                  fontWeight={active ? 'medium' : 'normal'}
                  fontSize="sm"
                >
                  {ingredient}
                </Button>
              </WrapItem>
            );
          })}
        </>
      ))}
    </Wrap>
  );
}
