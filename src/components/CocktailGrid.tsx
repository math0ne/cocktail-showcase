'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  SimpleGrid,
  Select,
  HStack,
  Text,
  Spinner,
  Center,
  VStack,
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { CocktailCard } from './CocktailCard';
import { CocktailModal } from './CocktailModal';
import { useCocktails } from '@/hooks/useCocktails';
import { useStore } from '@/store/useStore';
import type { CocktailMatch } from '@/types';
import Link from 'next/link';

type SortOption = 'match' | 'name' | 'category';
type FilterOption = 'all' | 'ready' | 'partial';

export function CocktailGrid() {
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [search, setSearch] = useState('');
  const [browseAll, setBrowseAll] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<CocktailMatch | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { matches, loading, error } = useCocktails(browseAll);
  const myIngredients = useStore((state) => state.myIngredients);

  const handleCardClick = (match: CocktailMatch) => {
    setSelectedMatch(match);
    onOpen();
  };

  const textMuted = useColorModeValue('gray.500', 'gray.400');
  const textPrimary = useColorModeValue('gray.700', 'gray.200');
  const bgSelect = useColorModeValue('white', 'gray.700');
  const bgBanner = useColorModeValue('teal.50', 'teal.900');
  const bannerText = useColorModeValue('teal.700', 'teal.100');

  const filteredAndSorted = useMemo(() => {
    let result = [...matches];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter((m) =>
        m.cocktail.name.toLowerCase().includes(searchLower) ||
        m.cocktail.category.toLowerCase().includes(searchLower) ||
        m.cocktail.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(searchLower)
        )
      );
    }

    // Ready/partial filter
    if (filterBy === 'ready') {
      result = result.filter((m) => m.isFullMatch);
    } else if (filterBy === 'partial') {
      result = result.filter((m) => !m.isFullMatch);
    }

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => a.cocktail.name.localeCompare(b.cocktail.name));
    } else if (sortBy === 'category') {
      result.sort((a, b) =>
        a.cocktail.category.localeCompare(b.cocktail.category)
      );
    }

    return result;
  }, [matches, sortBy, filterBy, search]);

  const readyCount = matches.filter((m) => m.isFullMatch).length;

  if (loading) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text color={textMuted}>
            {browseAll ? 'Loading all cocktails...' : 'Loading cocktails...'}
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center py={12}>
        <Text color="red.500">Error: {error.message}</Text>
      </Center>
    );
  }

  if (!browseAll && myIngredients.length === 0) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Text color={textMuted} textAlign="center">
            Add some ingredients to see what cocktails you can make,
            <br />
            or browse all cocktails to discover new ones.
          </Text>
          <HStack spacing={4}>
            <Link href="/" passHref legacyBehavior>
              <Button as="a" colorScheme="teal">
                Add Ingredients
              </Button>
            </Link>
            <Button
              variant="outline"
              colorScheme="teal"
              onClick={() => setBrowseAll(true)}
            >
              Browse All Cocktails
            </Button>
          </HStack>
        </VStack>
      </Center>
    );
  }

  if (matches.length === 0) {
    return (
      <Center py={12}>
        <Text color={textMuted}>
          No cocktails found. Try adding more ingredients.
        </Text>
      </Center>
    );
  }

  return (
    <Box>
      {/* Mode Toggle */}
      <HStack mb={6} justify="center">
        <ButtonGroup isAttached variant="outline" size="sm">
          <Button
            colorScheme="teal"
            variant={!browseAll ? 'solid' : 'outline'}
            onClick={() => setBrowseAll(false)}
          >
            My Matches
          </Button>
          <Button
            colorScheme="teal"
            variant={browseAll ? 'solid' : 'outline'}
            onClick={() => setBrowseAll(true)}
          >
            Browse All ({browseAll ? matches.length : '...'})
          </Button>
        </ButtonGroup>
      </HStack>

      {/* Search */}
      <Box maxW="400px" mx="auto" mb={4}>
        <InputGroup size="md">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search cocktails, ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            bg={bgSelect}
          />
        </InputGroup>
      </Box>

      <HStack spacing={4} mb={6} flexWrap="wrap" justify="center">
        <HStack>
          <Text fontWeight="medium" whiteSpace="nowrap" fontSize="sm" color={textPrimary}>
            Sort:
          </Text>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            w="140px"
            size="sm"
            bg={bgSelect}
          >
            <option value="match">Best Match</option>
            <option value="name">Name (A-Z)</option>
            <option value="category">Category</option>
          </Select>
        </HStack>

        <HStack>
          <Text fontWeight="medium" whiteSpace="nowrap" fontSize="sm" color={textPrimary}>
            Show:
          </Text>
          <Select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as FilterOption)}
            w="170px"
            size="sm"
            bg={bgSelect}
          >
            <option value="all">All ({matches.length})</option>
            <option value="ready">Ready ({readyCount})</option>
            <option value="partial">
              Need More ({matches.length - readyCount})
            </option>
          </Select>
        </HStack>

        {readyCount > 0 && (
          <Link href="/slideshow" passHref legacyBehavior>
            <Button as="a" colorScheme="teal" variant="solid" size="sm">
              Slideshow ({readyCount})
            </Button>
          </Link>
        )}
      </HStack>

      {/* Results count */}
      {search && (
        <Text fontSize="sm" color={textMuted} textAlign="center" mb={4}>
          Found {filteredAndSorted.length} cocktails
        </Text>
      )}

      {myIngredients.length === 0 && browseAll && (
        <Box
          mb={6}
          p={4}
          bg={bgBanner}
          borderRadius="lg"
          textAlign="center"
        >
          <Text color={bannerText} fontSize="sm">
            Add ingredients to see which cocktails you can make!
          </Text>
          <Link href="/" passHref legacyBehavior>
            <Button as="a" size="sm" colorScheme="teal" mt={2}>
              Add Ingredients
            </Button>
          </Link>
        </Box>
      )}

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
        {filteredAndSorted.map((match) => (
          <CocktailCard
            key={match.cocktail.id}
            match={match}
            onClick={() => handleCardClick(match)}
          />
        ))}
      </SimpleGrid>

      <CocktailModal
        match={selectedMatch}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Box>
  );
}
