'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  SimpleGrid,
  Select,
  HStack,
  Flex,
  Text,
  Spinner,
  Center,
  VStack,
  Button,
  ButtonGroup,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
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
import { fuzzyMatch } from '@/lib/fuzzyMatch';

type SortOption = 'match' | 'name' | 'category' | 'glass' | 'ingredients';
type ViewMode = 'ready' | 'matches' | 'all' | 'tried' | 'liked';

export function CocktailGrid() {
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [viewMode, setViewMode] = useState<ViewMode>('ready');
  const [search, setSearch] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<CocktailMatch | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { matches, totalCount, matchedCount, loading, error } = useCocktails(viewMode === 'all' || viewMode === 'tried' || viewMode === 'liked');
  const myIngredients = useStore((state) => state.myIngredients);
  const triedCocktails = useStore((state) => state.triedCocktails);
  const heartedCocktails = useStore((state) => state.heartedCocktails);

  const handleCardClick = (match: CocktailMatch) => {
    setSelectedMatch(match);
    onOpen();
  };

  const textMuted = useColorModeValue('gray.500', 'gray.400');
  const bgSelect = useColorModeValue('white', 'gray.700');

  const filteredAndSorted = useMemo(() => {
    let result = [...matches];

    // Search filter (fuzzy)
    if (search.trim()) {
      result = result.filter((m) =>
        fuzzyMatch(m.cocktail.name, search) ||
        fuzzyMatch(m.cocktail.category, search) ||
        m.cocktail.ingredients.some((ing) => fuzzyMatch(ing.name, search))
      );
    }

    // View mode filters
    if (viewMode === 'ready') {
      result = result.filter((m) => m.isFullMatch);
    } else if (viewMode === 'tried') {
      result = result.filter((m) => triedCocktails.includes(m.cocktail.id));
    } else if (viewMode === 'liked') {
      result = result.filter((m) => heartedCocktails.includes(m.cocktail.id));
    }

    // Sort
    if (sortBy === 'name') {
      result.sort((a, b) => a.cocktail.name.localeCompare(b.cocktail.name));
    } else if (sortBy === 'category') {
      result.sort((a, b) => {
        const catCompare = a.cocktail.category.localeCompare(b.cocktail.category);
        if (catCompare !== 0) return catCompare;
        return a.cocktail.name.localeCompare(b.cocktail.name);
      });
    } else if (sortBy === 'glass') {
      result.sort((a, b) => {
        const glassCompare = a.cocktail.glass.localeCompare(b.cocktail.glass);
        if (glassCompare !== 0) return glassCompare;
        return a.cocktail.name.localeCompare(b.cocktail.name);
      });
    } else if (sortBy === 'ingredients') {
      result.sort((a, b) => {
        const countCompare = a.cocktail.ingredients.length - b.cocktail.ingredients.length;
        if (countCompare !== 0) return countCompare;
        return a.cocktail.name.localeCompare(b.cocktail.name);
      });
    }

    return result;
  }, [matches, sortBy, viewMode, search, triedCocktails, heartedCocktails]);

  // Group by category or glass for section headers
  const groupedResults = useMemo(() => {
    if (sortBy !== 'category' && sortBy !== 'glass') return null;

    const groups: { label: string; items: CocktailMatch[] }[] = [];
    let currentLabel = '';

    for (const match of filteredAndSorted) {
      const label = sortBy === 'category' ? match.cocktail.category : match.cocktail.glass;
      if (label !== currentLabel) {
        currentLabel = label;
        groups.push({ label, items: [] });
      }
      groups[groups.length - 1].items.push(match);
    }

    return groups;
  }, [filteredAndSorted, sortBy]);

  const readyCount = matches.filter((m) => m.isFullMatch).length;

  if (loading) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text color={textMuted}>Loading cocktails...</Text>
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

  if (myIngredients.length === 0 && viewMode !== 'all') {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Text color={textMuted} textAlign="center">
            Add some ingredients to see what cocktails you can make,
            <br />
            or browse all cocktails.
          </Text>
          <HStack spacing={4}>
            <Link href="/bar" passHref legacyBehavior>
              <Button as="a" colorScheme="teal">
                Add Ingredients
              </Button>
            </Link>
            <Button
              variant="outline"
              colorScheme="teal"
              onClick={() => setViewMode('all')}
            >
              Browse All
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
      {/* Controls */}
      <VStack spacing={3} mb={6} align="stretch">
        {/* Row 1: Toggle (mobile: full width, desktop: inline with search/sort) */}
        <Flex align="center" gap={4} direction={{ base: 'column', md: 'row' }}>
          {/* Toggle - Left */}
          <ButtonGroup isAttached variant="outline" size="sm" w={{ base: '100%', md: 'auto' }} flexWrap="wrap">
            <Button
              colorScheme="teal"
              variant={viewMode === 'ready' ? 'solid' : 'outline'}
              onClick={() => setViewMode('ready')}
              flex={{ base: 1, md: 'none' }}
            >
              Ready ({readyCount})
            </Button>
            <Button
              colorScheme="teal"
              variant={viewMode === 'tried' ? 'solid' : 'outline'}
              onClick={() => setViewMode('tried')}
              flex={{ base: 1, md: 'none' }}
            >
              Tried ({triedCocktails.length})
            </Button>
            <Button
              colorScheme="teal"
              variant={viewMode === 'liked' ? 'solid' : 'outline'}
              onClick={() => setViewMode('liked')}
              flex={{ base: 1, md: 'none' }}
            >
              Liked ({heartedCocktails.length})
            </Button>
            <Button
              colorScheme="teal"
              variant={viewMode === 'matches' ? 'solid' : 'outline'}
              onClick={() => setViewMode('matches')}
              flex={{ base: 1, md: 'none' }}
            >
              Matches ({matchedCount})
            </Button>
            <Button
              colorScheme="teal"
              variant={viewMode === 'all' ? 'solid' : 'outline'}
              onClick={() => setViewMode('all')}
              flex={{ base: 1, md: 'none' }}
            >
              All {totalCount > 0 ? `(${totalCount})` : ''}
            </Button>
          </ButtonGroup>

          {/* Search + Sort Row (mobile: own row, desktop: same row) */}
          <Flex align="center" gap={3} flex={1} w={{ base: '100%', md: 'auto' }}>
            {/* Search */}
            <InputGroup size="sm" maxW={{ base: '100%', md: '300px' }} flex={1}>
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

            {/* Results count */}
            {search && (
              <Text fontSize="sm" color={textMuted} whiteSpace="nowrap" display={{ base: 'none', sm: 'block' }}>
                Found {filteredAndSorted.length}
              </Text>
            )}

            {/* Sort - Right */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              w={{ base: '130px', md: '140px' }}
              size="sm"
              bg={bgSelect}
              flexShrink={0}
            >
              <option value="match">Best Match</option>
              <option value="name">Name (A-Z)</option>
              <option value="category">Category</option>
              <option value="glass">Glass Type</option>
              <option value="ingredients">Ingredients</option>
            </Select>
          </Flex>
        </Flex>
      </VStack>

      {groupedResults ? (
        <VStack spacing={6} align="stretch">
          {groupedResults.map((group) => (
            <Box key={group.label}>
              <HStack mb={3}>
                <Text fontSize="sm" fontWeight="semibold" color={textMuted} whiteSpace="nowrap">
                  {group.label}
                </Text>
                <Divider />
                <Text fontSize="xs" color={textMuted} whiteSpace="nowrap">
                  {group.items.length}
                </Text>
              </HStack>
              <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={4}>
                {group.items.map((match) => (
                  <CocktailCard
                    key={match.cocktail.id}
                    match={match}
                    onClick={() => handleCardClick(match)}
                    showReadyHighlight={viewMode !== 'ready'}
                  />
                ))}
              </SimpleGrid>
            </Box>
          ))}
        </VStack>
      ) : (
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }} spacing={4}>
          {filteredAndSorted.map((match) => (
            <CocktailCard
              key={match.cocktail.id}
              match={match}
              onClick={() => handleCardClick(match)}
              showReadyHighlight={viewMode !== 'ready'}
            />
          ))}
        </SimpleGrid>
      )}

      <CocktailModal
        match={selectedMatch}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Box>
  );
}
