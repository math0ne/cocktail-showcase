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
  useColorModeValue,
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

  // Colors
  const dividerColor = useColorModeValue('gray.200', 'gray.600');
  const textMuted = useColorModeValue('gray.500', 'gray.400');
  const textPrimary = useColorModeValue('gray.700', 'gray.200');
  const bgItem = useColorModeValue('gray.100', 'gray.700');
  const bgItemHover = useColorModeValue('gray.200', 'gray.600');
  const bgExpanded = useColorModeValue('gray.50', 'gray.750');
  const borderExpanded = useColorModeValue('gray.200', 'gray.600');
  const greenText = useColorModeValue('green.600', 'green.300');
  const orangeText = useColorModeValue('orange.600', 'orange.300');

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
      <Divider my={4} borderColor={dividerColor} />
      <Heading size="md" mb={4} color={textPrimary}>
        What to Buy Next
      </Heading>

      <VStack align="stretch" spacing={1}>
        {suggestions.map((suggestion) => (
          <Box key={suggestion.ingredient}>
            <Flex
              align="center"
              p={2}
              bg={bgItem}
              borderRadius="md"
              cursor="pointer"
              onClick={() => toggleExpand(suggestion.ingredient)}
              _hover={{ bg: bgItemHover }}
              transition="background 0.2s"
            >
              <Icon
                as={expandedIngredient === suggestion.ingredient ? ChevronDownIcon : ChevronRightIcon}
                mr={2}
                color={textMuted}
                boxSize={4}
              />
              <Text flex={1} fontWeight="medium" fontSize="sm" color={textPrimary}>
                {suggestion.ingredient}
              </Text>
              <HStack spacing={1}>
                {suggestion.fullUnlocks.length > 0 && (
                  <Badge colorScheme="green" fontSize="xs" variant="subtle">
                    +{suggestion.fullUnlocks.length}
                  </Badge>
                )}
                <Badge colorScheme="gray" fontSize="xs" variant="subtle">
                  {suggestion.cocktailsUnlocked.length}
                </Badge>
                <Button
                  size="xs"
                  colorScheme="teal"
                  variant="ghost"
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
                bg={bgExpanded}
                borderRadius="md"
                mt={1}
                ml={6}
                border="1px solid"
                borderColor={borderExpanded}
              >
                {suggestion.fullUnlocks.length > 0 && (
                  <Box mb={suggestion.cocktailsUnlocked.length > suggestion.fullUnlocks.length ? 3 : 0}>
                    <Text fontSize="xs" color={greenText} fontWeight="medium" mb={1}>
                      Ready to make:
                    </Text>
                    <VStack align="stretch" spacing={0}>
                      {suggestion.fullUnlocks.map((cocktail) => (
                        <HStack key={cocktail.id} fontSize="xs" py={0.5}>
                          <Text color={textPrimary}>{cocktail.name}</Text>
                          <Badge colorScheme="purple" fontSize="2xs" variant="subtle">
                            {cocktail.category}
                          </Badge>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )}

                {suggestion.cocktailsUnlocked.length > suggestion.fullUnlocks.length && (
                  <Box>
                    <Text fontSize="xs" color={orangeText} fontWeight="medium" mb={1}>
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
                            <Text color={textMuted}>{cocktail.name}</Text>
                          </HStack>
                        ))}
                      {suggestion.cocktailsUnlocked.length - suggestion.fullUnlocks.length > 5 && (
                        <Text fontSize="xs" color={textMuted}>
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
