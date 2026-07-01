'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Spinner,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useIngredients } from '@/hooks/useIngredients';
import { useStore } from '@/store/useStore';
import { IngredientCard } from './IngredientCard';

export function IngredientPicker() {
  const [search, setSearch] = useState('');
  const { ingredients, loading, error } = useIngredients();
  const myIngredients = useStore((state) => state.myIngredients);
  const addIngredient = useStore((state) => state.addIngredient);

  const bgInput = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textMuted = useColorModeValue('gray.500', 'gray.400');
  const iconColor = useColorModeValue('gray.400', 'gray.500');

  const myIngredientsLower = useMemo(
    () => new Set(myIngredients.map((i) => i.toLowerCase())),
    [myIngredients]
  );

  const filteredIngredients = useMemo(() => {
    if (!search.trim()) return ingredients;
    const searchLower = search.toLowerCase();
    return ingredients.filter((i) => i.toLowerCase().includes(searchLower));
  }, [ingredients, search]);

  const handleSelect = (ingredient: string) => {
    addIngredient(ingredient);
  };

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md">
        <Text color="red.600">Failed to load ingredients: {error.message}</Text>
      </Box>
    );
  }

  return (
    <Box h="100%" display="flex" flexDirection="column">
      <InputGroup size="md" mb={4} flexShrink={0}>
        <InputLeftElement pointerEvents="none">
          {loading ? <Spinner size="sm" /> : <SearchIcon color={iconColor} />}
        </InputLeftElement>
        <Input
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          bg={bgInput}
          borderColor={borderColor}
          _focus={{ borderColor: 'teal.400', boxShadow: '0 0 0 1px var(--chakra-colors-teal-400)' }}
        />
      </InputGroup>

      <Box
        flex={1}
        minH={0}
        overflowY="auto"
        borderRadius="lg"
        pr={1}
      >
        {filteredIngredients.length > 0 ? (
          <SimpleGrid columns={{ base: 2, sm: 3, md: 3 }} spacing={3}>
            {filteredIngredients.map((ingredient) => {
              const isAdded = myIngredientsLower.has(ingredient.toLowerCase());
              return (
                <IngredientCard
                  key={ingredient}
                  ingredient={ingredient}
                  isAdded={isAdded}
                  onClick={() => handleSelect(ingredient)}
                />
              );
            })}
          </SimpleGrid>
        ) : !loading ? (
          <Box textAlign="center" py={8}>
            <Text color={textMuted} fontSize="sm">
              {search ? 'No ingredients found' : 'Start typing to search'}
            </Text>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
