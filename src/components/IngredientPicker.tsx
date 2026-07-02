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
  IconButton,
  HStack,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon } from '@chakra-ui/icons';
import { useIngredients } from '@/hooks/useIngredients';
import { useStore } from '@/store/useStore';
import { IngredientCard } from './IngredientCard';
import { AddIngredientModal } from './AddIngredientModal';
import { fuzzyMatch } from '@/lib/fuzzyMatch';

export function IngredientPicker() {
  const [search, setSearch] = useState('');
  const { ingredients, loading, error } = useIngredients();
  const myIngredients = useStore((state) => state.myIngredients);
  const shoppingList = useStore((state) => state.shoppingList);
  const addIngredient = useStore((state) => state.addIngredient);
  const addToShoppingList = useStore((state) => state.addToShoppingList);
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();

  const myIngredientsLower = useMemo(
    () => new Set(myIngredients.map((i) => i.toLowerCase())),
    [myIngredients]
  );

  const shoppingListLower = useMemo(
    () => new Set(shoppingList.map((i) => i.toLowerCase())),
    [shoppingList]
  );

  const filteredIngredients = useMemo(() => {
    if (!search.trim()) return ingredients;
    return ingredients.filter((i) => fuzzyMatch(i, search));
  }, [ingredients, search]);

  const handleSelect = (ingredient: string) => {
    addIngredient(ingredient);
  };

  const handleOpenAddModal = () => {
    if (search.trim() && !myIngredientsLower.has(search.trim().toLowerCase())) {
      onAddModalOpen();
    }
  };

  const handleModalClose = () => {
    onAddModalClose();
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleOpenAddModal();
    }
  };

  if (error) {
    return (
      <Box p={4} bg="red.900" borderRadius="xl">
        <Text color="red.200">Failed to load ingredients: {error.message}</Text>
      </Box>
    );
  }

  return (
    <Box h="100%" display="flex" flexDirection="column" pt={1} px={1}>
      <HStack mb={5} flexShrink={0} spacing={2}>
        <InputGroup flex={1} h="40px">
          <InputLeftElement pointerEvents="none" h="40px">
            {loading ? (
              <Spinner size="sm" color="purple.500" />
            ) : (
              <SearchIcon color="gray.500" />
            )}
          </InputLeftElement>
          <Input
            placeholder="Search or add custom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            bg="gray.800"
            border="none"
            borderRadius="xl"
            color="gray.400"
            h="40px"
            fontSize="sm"
            fontWeight="semibold"
            _placeholder={{ color: 'gray.400' }}
            _focus={{
              bg: 'gray.800',
              boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
            }}
          />
        </InputGroup>
        <IconButton
          aria-label="Add custom ingredient"
          icon={<AddIcon />}
          h="40px"
          w="40px"
          bg="purple.600"
          color="white"
          borderRadius="xl"
          _hover={{ bg: 'purple.500' }}
          _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
          isDisabled={!search.trim() || myIngredientsLower.has(search.trim().toLowerCase())}
          onClick={handleOpenAddModal}
        />
      </HStack>

      <Box
        flex={1}
        minH={0}
        overflowY="auto"
        borderRadius="lg"
        pr={2}
        sx={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bg: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bg: 'gray.700',
            borderRadius: 'full',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bg: 'gray.600',
          },
        }}
      >
        {filteredIngredients.length > 0 ? (
          <SimpleGrid columns={{ base: 2, sm: 3, md: 3 }} spacing={3}>
            {filteredIngredients.map((ingredient) => {
              const ingredientLower = ingredient.toLowerCase();
              const isAdded = myIngredientsLower.has(ingredientLower);
              const isInShoppingList = shoppingListLower.has(ingredientLower);
              return (
                <IngredientCard
                  key={ingredient}
                  ingredient={ingredient}
                  isAdded={isAdded}
                  isInShoppingList={isInShoppingList}
                  onClick={() => handleSelect(ingredient)}
                  onAddToShoppingList={() => addToShoppingList(ingredient)}
                />
              );
            })}
          </SimpleGrid>
        ) : !loading ? (
          <Box textAlign="center" py={8}>
            <Text color="gray.500" fontSize="sm">
              {search ? 'No ingredients found' : 'Start typing to search'}
            </Text>
          </Box>
        ) : null}
      </Box>

      <AddIngredientModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        initialName={search.trim()}
      />
    </Box>
  );
}
