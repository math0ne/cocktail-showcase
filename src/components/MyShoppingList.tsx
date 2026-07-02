'use client';

import {
  Box,
  Text,
  VStack,
  HStack,
  Flex,
  Button,
  IconButton,
  Badge,
  Center,
  Heading,
  Image,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { useStore } from '@/store/useStore';

function getIngredientImageUrl(ingredient: string): string {
  return `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(ingredient)}-Small.png`;
}

export function MyShoppingList() {
  const shoppingList = useStore((state) => state.shoppingList);
  const removeFromShoppingList = useStore((state) => state.removeFromShoppingList);
  const moveFromShoppingListToBar = useStore((state) => state.moveFromShoppingListToBar);

  return (
    <VStack align="stretch" spacing={4}>
      <HStack>
        <Heading size="md" color="gray.100">
          Shopping List
        </Heading>
        {shoppingList.length > 0 && (
          <Badge bg="purple.500" color="white" borderRadius="full" px={3} py={1}>
            {shoppingList.length}
          </Badge>
        )}
      </HStack>

      {shoppingList.length === 0 ? (
        <Center py={6}>
          <Text color="gray.400" textAlign="center" fontSize="sm">
            Your shopping list is empty.
            <br />
            Add ingredients from the picker or from cocktail details.
          </Text>
        </Center>
      ) : (
        <VStack align="stretch" spacing={2}>
          {shoppingList.map((ingredient) => (
        <Flex
          key={ingredient}
          align="center"
          p={3}
          bg="whiteAlpha.50"
          borderRadius="xl"
          _hover={{ bg: 'whiteAlpha.100' }}
          transition="background 0.2s"
        >
          <HStack flex={1} spacing={3}>
            <Image
              src={getIngredientImageUrl(ingredient)}
              alt={ingredient}
              boxSize="28px"
              borderRadius="md"
              objectFit="cover"
              bg="whiteAlpha.100"
              fallback={
                <Box
                  boxSize="28px"
                  borderRadius="md"
                  bg="whiteAlpha.100"
                />
              }
            />
            <Text fontWeight="medium" fontSize="sm" color="gray.100">
              {ingredient}
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Button
              size="xs"
              bg="#10b981"
              color="white"
              _hover={{ bg: '#059669' }}
              borderRadius="full"
              leftIcon={<CheckIcon boxSize={2} />}
              onClick={() => moveFromShoppingListToBar(ingredient)}
              fontSize="xs"
            >
              Add to Bar
            </Button>
            <IconButton
              aria-label="Remove from shopping list"
              icon={<CloseIcon boxSize={2} />}
              size="xs"
              variant="ghost"
              color="gray.500"
              _hover={{ color: 'red.400', bg: 'whiteAlpha.100' }}
              borderRadius="full"
              onClick={() => removeFromShoppingList(ingredient)}
            />
          </HStack>
        </Flex>
      ))}
        </VStack>
      )}
    </VStack>
  );
}
