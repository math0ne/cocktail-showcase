'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Collapse,
  Flex,
  Icon,
  Divider,
  Button,
  Heading,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon, AddIcon } from '@chakra-ui/icons';
import { useCocktails } from '@/hooks/useCocktails';
import { useStore } from '@/store/useStore';
import type { Cocktail } from '@/types';

interface IngredientSuggestion {
  ingredient: string;
  cocktailsUnlocked: Cocktail[];
  fullUnlocks: Cocktail[];
}

export function ShoppingList() {
  const { matches } = useCocktails();
  const myIngredients = useStore((state) => state.myIngredients);
  const addIngredient = useStore((state) => state.addIngredient);
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    const partialMatches = matches.filter(
      (m) => !m.isFullMatch && m.matchedIngredients.length > 0
    );

    const ingredientMap = new Map<string, { cocktails: Set<Cocktail>; fullUnlocks: Set<Cocktail> }>();

    for (const match of partialMatches) {
      const missingCount = match.missingIngredients.length;

      for (const missing of match.missingIngredients) {
        const normalized = missing.toLowerCase();
        if (!ingredientMap.has(normalized)) {
          ingredientMap.set(normalized, { cocktails: new Set(), fullUnlocks: new Set() });
        }
        const entry = ingredientMap.get(normalized)!;
        entry.cocktails.add(match.cocktail);

        if (missingCount === 1) {
          entry.fullUnlocks.add(match.cocktail);
        }
      }
    }

    const result: IngredientSuggestion[] = [];
    ingredientMap.forEach((value, key) => {
      let originalCase = key;
      for (const cocktail of Array.from(value.cocktails)) {
        const ing = cocktail.ingredients.find(
          (i) => i.name.toLowerCase() === key
        );
        if (ing) {
          originalCase = ing.name;
          break;
        }
      }

      result.push({
        ingredient: originalCase,
        cocktailsUnlocked: Array.from(value.cocktails).sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
        fullUnlocks: Array.from(value.fullUnlocks).sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      });
    });

    result.sort((a, b) => {
      if (b.fullUnlocks.length !== a.fullUnlocks.length) {
        return b.fullUnlocks.length - a.fullUnlocks.length;
      }
      return b.cocktailsUnlocked.length - a.cocktailsUnlocked.length;
    });

    return result.slice(0, 10);
  }, [matches]);

  if (myIngredients.length === 0 || suggestions.length === 0) {
    return null;
  }

  const toggleExpand = (ingredient: string) => {
    setExpandedIngredient(
      expandedIngredient === ingredient ? null : ingredient
    );
  };

  const handleAddIngredient = (ingredient: string, e: React.MouseEvent) => {
    e.stopPropagation();
    addIngredient(ingredient);
    setExpandedIngredient(null);
  };

  return (
    <Box>
      <Divider my={4} borderColor="whiteAlpha.100" />
      <Heading size="md" color="gray.100" mb={4}>
        What to Buy Next
      </Heading>

      <VStack align="stretch" spacing={1}>
        {suggestions.map((suggestion) => (
          <Box key={suggestion.ingredient}>
            <Flex
              align="center"
              p={2}
              bg="whiteAlpha.50"
              borderRadius="xl"
              cursor="pointer"
              onClick={() => toggleExpand(suggestion.ingredient)}
              _hover={{ bg: 'whiteAlpha.100' }}
              transition="background 0.2s"
            >
              <Icon
                as={expandedIngredient === suggestion.ingredient ? ChevronDownIcon : ChevronRightIcon}
                mr={2}
                color="gray.500"
                boxSize={4}
              />
              <Text flex={1} fontWeight="medium" fontSize="sm" color="gray.100">
                {suggestion.ingredient}
              </Text>
              <HStack spacing={1}>
                {suggestion.fullUnlocks.length > 0 && (
                  <Badge bg="#10b981" color="white" fontSize="xs" borderRadius="md" fontWeight="semibold" px={2} py={0.5}>
                    +{suggestion.fullUnlocks.length}
                  </Badge>
                )}
                <Badge bg="#6366f1" color="white" fontSize="xs" borderRadius="md" fontWeight="semibold" px={2} py={0.5}>
                  {suggestion.cocktailsUnlocked.length}
                </Badge>
                <Button
                  size="xs"
                  bg="#8b5cf6"
                  color="white"
                  _hover={{ bg: '#7c3aed' }}
                  borderRadius="full"
                  leftIcon={<AddIcon boxSize={2} />}
                  onClick={(e) => handleAddIngredient(suggestion.ingredient, e)}
                  fontSize="xs"
                >
                  Add
                </Button>
              </HStack>
            </Flex>

            <Collapse in={expandedIngredient === suggestion.ingredient}>
              <Box
                p={3}
                bg="whiteAlpha.50"
                borderRadius="xl"
                mt={1}
                ml={6}
                border="1px solid"
                borderColor="whiteAlpha.100"
              >
                {suggestion.fullUnlocks.length > 0 && (
                  <Box mb={suggestion.cocktailsUnlocked.length > suggestion.fullUnlocks.length ? 3 : 0}>
                    <Text fontSize="xs" color="#10b981" fontWeight="medium" mb={1}>
                      Ready to make:
                    </Text>
                    <VStack align="stretch" spacing={0}>
                      {suggestion.fullUnlocks.map((cocktail) => (
                        <HStack key={cocktail.id} fontSize="xs" py={0.5}>
                          <Text color="gray.100">{cocktail.name}</Text>
                          <Badge bg="#8b5cf6" color="white" fontSize="2xs" borderRadius="md" fontWeight="semibold" px={1.5} py={0.5}>
                            {cocktail.category}
                          </Badge>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}

                {suggestion.cocktailsUnlocked.length > suggestion.fullUnlocks.length && (
                  <Box>
                    <Text fontSize="xs" color="#f59e0b" fontWeight="medium" mb={1}>
                      Gets you closer:
                    </Text>
                    <VStack align="stretch" spacing={0}>
                      {suggestion.cocktailsUnlocked
                        .filter(
                          (c) => !suggestion.fullUnlocks.some((f) => f.id === c.id)
                        )
                        .slice(0, 5)
                        .map((cocktail) => (
                          <HStack key={cocktail.id} fontSize="xs" py={0.5}>
                            <Text color="gray.400">{cocktail.name}</Text>
                          </HStack>
                        ))}
                      {suggestion.cocktailsUnlocked.length - suggestion.fullUnlocks.length > 5 && (
                        <Text fontSize="xs" color="gray.500">
                          +{suggestion.cocktailsUnlocked.length - suggestion.fullUnlocks.length - 5} more
                        </Text>
                      )}
                    </VStack>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
