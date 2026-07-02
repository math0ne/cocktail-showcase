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

type SortOption = 'match' | 'name' | 'category' | 'glass' | 'ingredients' | 'liked' | 'tried';
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
    } else if (sortBy === 'liked') {
      result.sort((a, b) => {
        const aLiked = heartedCocktails.includes(a.cocktail.id) ? 0 : 1;
        const bLiked = heartedCocktails.includes(b.cocktail.id) ? 0 : 1;
        if (aLiked !== bLiked) return aLiked - bLiked;
        return a.cocktail.name.localeCompare(b.cocktail.name);
      });
    } else if (sortBy === 'tried') {
      result.sort((a, b) => {
        const aTried = triedCocktails.includes(a.cocktail.id) ? 0 : 1;
        const bTried = triedCocktails.includes(b.cocktail.id) ? 0 : 1;
        if (aTried !== bTried) return aTried - bTried;
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
          <Spinner size="xl" color="purple.500" thickness="3px" />
          <Text color="gray.400">Loading cocktails...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center py={12}>
        <Text color="red.400">Error: {error.message}</Text>
      </Center>
    );
  }

  if (myIngredients.length === 0 && viewMode !== 'all') {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Text color="gray.400" textAlign="center">
            Add some ingredients to see what cocktails you can make,
            <br />
            or browse all cocktails.
          </Text>
          <HStack spacing={4}>
            <Link href="/bar" passHref legacyBehavior>
              <Button
                as="a"
                bgGradient="linear(to-r, purple.600, purple.500)"
                color="white"
                _hover={{ bgGradient: 'linear(to-r, purple.500, purple.400)' }}
                borderRadius="xl"
              >
                Add Ingredients
              </Button>
            </Link>
            <Button
              variant="outline"
              borderColor="whiteAlpha.200"
              color="gray.100"
              _hover={{ bg: 'whiteAlpha.100' }}
              onClick={() => setViewMode('all')}
              borderRadius="xl"
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
        <Text color="gray.400">
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
          {/* Toggle - Left - Pill-shaped in gray container */}
          <Box
            bg="gray.800"
            p={1}
            borderRadius="xl"
            w={{ base: '100%', md: 'auto' }}
            h={{ base: 'auto', md: '40px' }}
            display="flex"
            alignItems="center"
          >
            <ButtonGroup isAttached variant="ghost" size="sm" w="100%" flexWrap="wrap">
              <Button
                bg={viewMode === 'ready' ? 'purple.600' : 'transparent'}
                color={viewMode === 'ready' ? 'white' : 'gray.400'}
                _hover={{ bg: viewMode === 'ready' ? 'purple.500' : 'whiteAlpha.100' }}
                onClick={() => setViewMode('ready')}
                flex={{ base: 1, md: 'none' }}
                borderRadius="lg"
              >
                Ready ({readyCount})
              </Button>
              <Button
                bg={viewMode === 'tried' ? 'purple.600' : 'transparent'}
                color={viewMode === 'tried' ? 'white' : 'gray.400'}
                _hover={{ bg: viewMode === 'tried' ? 'purple.500' : 'whiteAlpha.100' }}
                onClick={() => setViewMode('tried')}
                flex={{ base: 1, md: 'none' }}
                borderRadius="lg"
              >
                Tried ({triedCocktails.length})
              </Button>
              <Button
                bg={viewMode === 'liked' ? 'purple.600' : 'transparent'}
                color={viewMode === 'liked' ? 'white' : 'gray.400'}
                _hover={{ bg: viewMode === 'liked' ? 'purple.500' : 'whiteAlpha.100' }}
                onClick={() => setViewMode('liked')}
                flex={{ base: 1, md: 'none' }}
                borderRadius="lg"
              >
                Liked ({heartedCocktails.length})
              </Button>
              <Button
                bg={viewMode === 'matches' ? 'purple.600' : 'transparent'}
                color={viewMode === 'matches' ? 'white' : 'gray.400'}
                _hover={{ bg: viewMode === 'matches' ? 'purple.500' : 'whiteAlpha.100' }}
                onClick={() => setViewMode('matches')}
                flex={{ base: 1, md: 'none' }}
                borderRadius="lg"
              >
                Matches ({matchedCount})
              </Button>
              <Button
                bg={viewMode === 'all' ? 'purple.600' : 'transparent'}
                color={viewMode === 'all' ? 'white' : 'gray.400'}
                _hover={{ bg: viewMode === 'all' ? 'purple.500' : 'whiteAlpha.100' }}
                onClick={() => setViewMode('all')}
                flex={{ base: 1, md: 'none' }}
                borderRadius="lg"
              >
                All {totalCount > 0 ? `(${totalCount})` : ''}
              </Button>
            </ButtonGroup>
          </Box>

          {/* Search + Sort Row (mobile: own row, desktop: same row) */}
          <Flex align="center" gap={3} flex={1} w={{ base: '100%', md: 'auto' }}>
            {/* Search */}
            <InputGroup maxW={{ base: '100%', md: '300px' }} flex={1} h="40px">
              <InputLeftElement pointerEvents="none" h="40px">
                <SearchIcon color="gray.500" />
              </InputLeftElement>
              <Input
                placeholder="Search cocktails, ingredients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

            {/* Results count */}
            {search && (
              <Text fontSize="sm" fontWeight="medium" color="gray.400" whiteSpace="nowrap" display={{ base: 'none', sm: 'block' }}>
                Found {filteredAndSorted.length}
              </Text>
            )}

            {/* Sort - Right */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              w={{ base: '130px', md: '150px' }}
              h="40px"
              bg="gray.800"
              border="none"
              borderRadius="xl"
              color="gray.400"
              fontSize="sm"
              fontWeight="semibold"
              flexShrink={0}
              _focus={{
                boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
              }}
            >
              <option value="match">Best Match</option>
              <option value="name">Name (A-Z)</option>
              <option value="liked">Liked First</option>
              <option value="tried">Tried First</option>
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
                <Text fontSize="sm" fontWeight="semibold" color="gray.400" whiteSpace="nowrap">
                  {group.label}
                </Text>
                <Divider borderColor="whiteAlpha.100" />
                <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
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
