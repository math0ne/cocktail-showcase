'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { keyframes } from '@emotion/react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  ButtonGroup,
  Flex,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { CocktailGrid } from '@/components/CocktailGrid';
import { IngredientPicker } from '@/components/IngredientPicker';
import { IngredientList } from '@/components/IngredientList';
import { FreshIngredients } from '@/components/FreshIngredients';
import { MyShoppingList } from '@/components/MyShoppingList';
import { DataExport } from '@/components/DataExport';
import { GoogleSyncStatus } from '@/components/GoogleSyncStatus';
import { Slideshow } from '@/components/Slideshow';
import { useStore } from '@/store/useStore';
import { useCocktails } from '@/hooks/useCocktails';

// Simple cocktail glass SVG logo
const CocktailLogo = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M7.5 7l-2-2h13l-2 2h-9zm0 0l4.5 6v6H9v2h6v-2h-3v-6l4.5-6H7.5zM5 3h14l-3 4h-8L5 3z"
    />
  </Icon>
);

type ViewMode = 'bar' | 'drinks';

// Purple glow pulse used to point out the bar stock section after
// navigating there from the header ingredients stat.
const barStockFlash = keyframes`
  0%, 100% {
    border-color: rgba(255, 255, 255, 0.06);
    box-shadow: none;
  }
  20%, 70% {
    border-color: var(--chakra-colors-purple-400);
    box-shadow: 0 0 0 1px var(--chakra-colors-purple-400), 0 0 28px rgba(167, 139, 250, 0.35);
  }
`;

export default function HomePage() {
  const [view, setView] = useState<ViewMode>('drinks');
  const [showSlideshow, setShowSlideshow] = useState(false);
  const myIngredients = useStore((state) => state.myIngredients);
  const setDrinkViewMode = useStore((state) => state.setDrinkViewMode);
  const { fullMatches, matches } = useCocktails();

  // Read hash from URL and set view
  const getViewFromHash = useCallback((): ViewMode => {
    if (typeof window !== 'undefined') {
      return window.location.hash === '#bar' ? 'bar' : 'drinks';
    }
    return 'drinks';
  }, []);

  // Initialize view from URL hash on mount
  useEffect(() => {
    setView(getViewFromHash());

    // Listen for back/forward navigation
    const handleHashChange = () => {
      setView(getViewFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [getViewFromHash]);

  // Update URL hash when view changes
  const handleViewChange = (newView: ViewMode) => {
    const newHash = newView === 'bar' ? '#bar' : '';
    const newUrl = window.location.pathname + newHash;
    window.history.pushState(null, '', newUrl);
    setView(newView);
  };

  // Header stat shortcuts: ingredients jumps to the bar stock section
  // (with a flash), ready/close jump to the drinks view pre-filtered.
  const barStockRef = useRef<HTMLDivElement>(null);
  const [flashBarStock, setFlashBarStock] = useState(false);
  const [flashFilter, setFlashFilter] = useState(false);

  const goToBarStock = () => {
    handleViewChange('bar');
    setFlashBarStock(true);
  };

  const goToDrinksFiltered = (mode: 'ready' | 'matches') => {
    setDrinkViewMode(mode);
    handleViewChange('drinks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFlashFilter(true);
  };

  useEffect(() => {
    if (flashFilter) {
      const timer = setTimeout(() => setFlashFilter(false), 1800);
      return () => clearTimeout(timer);
    }
  }, [flashFilter]);

  useEffect(() => {
    if (view === 'bar' && flashBarStock) {
      const raf = requestAnimationFrame(() => {
        barStockRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      const timer = setTimeout(() => setFlashBarStock(false), 1800);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [view, flashBarStock]);

  // While the slideshow is open the main page is display:none so the
  // (potentially huge) cocktail grid costs nothing to render. Remember the
  // scroll position, since collapsing the page resets it.
  const scrollPosRef = useRef(0);
  const openSlideshow = () => {
    scrollPosRef.current = window.scrollY;
    setShowSlideshow(true);
  };
  const closeSlideshow = useCallback(() => setShowSlideshow(false), []);

  useEffect(() => {
    if (!showSlideshow && scrollPosRef.current > 0) {
      // Wait a frame so the restored grid has its full height back before
      // scrolling, otherwise the browser clamps the position.
      const raf = requestAnimationFrame(() => {
        window.scrollTo(0, scrollPosRef.current);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [showSlideshow]);

  return (
    <Box minH="100vh" bg="#0d0d0d">
      {/* Hidden while the slideshow overlay is open so the grid doesn't
          compete with the slideshow for rendering work (slow on iPads) */}
      <Box display={showSlideshow ? 'none' : 'block'}>
      {/* Header */}
      <Box
        bg="#0d0d0d"
        borderBottom={{ base: 'none', md: '1px solid' }}
        borderColor="whiteAlpha.100"
        py={3}
        px={{ base: 4, md: 6 }}
        sx={{
          paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
        }}
      >
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
          {/* Logo and Stats */}
          <HStack spacing={6}>
            <HStack spacing={2}>
              <CocktailLogo boxSize={7} color="purple.400" />
              <Heading
                size="md"
                bgGradient="linear(to-r, purple.400, purple.200)"
                bgClip="text"
                fontWeight="bold"
              >
                Cocktails
              </Heading>
            </HStack>

            {/* Stats in header - pill container */}
            {myIngredients.length > 0 && (
              <HStack
                spacing={1}
                display={{ base: 'none', md: 'flex' }}
                bg="whiteAlpha.50"
                px={2}
                py={1}
                borderRadius="xl"
              >
                <HStack
                  as="button"
                  spacing={1}
                  px={2}
                  py={0.5}
                  borderRadius="lg"
                  cursor="pointer"
                  transition="background 0.15s ease"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  onClick={goToBarStock}
                  title="View your bar stock"
                >
                  <Text fontSize="lg" fontWeight="bold" color="purple.400">
                    {myIngredients.length}
                  </Text>
                  <Text color="gray.400" fontSize="xs">ingredients</Text>
                </HStack>
                <HStack
                  as="button"
                  spacing={1}
                  px={2}
                  py={0.5}
                  borderRadius="lg"
                  cursor="pointer"
                  transition="background 0.15s ease"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  onClick={() => goToDrinksFiltered('ready')}
                  title="View drinks you can make"
                >
                  <Text fontSize="lg" fontWeight="bold" color="green.400">
                    {fullMatches.length}
                  </Text>
                  <Text color="gray.400" fontSize="xs">ready</Text>
                </HStack>
                <HStack
                  as="button"
                  spacing={1}
                  px={2}
                  py={0.5}
                  borderRadius="lg"
                  cursor="pointer"
                  transition="background 0.15s ease"
                  _hover={{ bg: 'whiteAlpha.100' }}
                  onClick={() => goToDrinksFiltered('matches')}
                  title="View drinks you're close to making"
                >
                  <Text fontSize="lg" fontWeight="bold" color="orange.400">
                    {matches.length - fullMatches.length}
                  </Text>
                  <Text color="gray.400" fontSize="xs">close</Text>
                </HStack>
              </HStack>
            )}
          </HStack>

          {/* Actions */}
          <HStack spacing={3}>
            {/* Navigation Toggle */}
            <Box
              bg="gray.800"
              p={1}
              borderRadius="xl"
              display="flex"
              alignItems="center"
            >
              <ButtonGroup isAttached variant="ghost" size="sm">
                <Button
                  bg={view === 'bar' ? 'purple.600' : 'transparent'}
                  color={view === 'bar' ? 'white' : 'gray.400'}
                  _hover={{ bg: view === 'bar' ? 'purple.500' : 'whiteAlpha.100' }}
                  onClick={() => handleViewChange('bar')}
                  borderRadius="lg"
                >
                  Bar
                </Button>
                <Button
                  bg={view === 'drinks' ? 'purple.600' : 'transparent'}
                  color={view === 'drinks' ? 'white' : 'gray.400'}
                  _hover={{ bg: view === 'drinks' ? 'purple.500' : 'whiteAlpha.100' }}
                  onClick={() => handleViewChange('drinks')}
                  borderRadius="lg"
                >
                  Drinks
                </Button>
              </ButtonGroup>
            </Box>
            {fullMatches.length > 0 && (
              <Button
                size="sm"
                h="32px"
                px={3}
                display={{ base: 'none', md: 'inline-flex' }}
                bgGradient="linear(to-r, purple.600, purple.500)"
                color="white"
                _hover={{ bgGradient: 'linear(to-r, purple.500, purple.400)' }}
                borderRadius="lg"
                fontWeight="medium"
                onClick={openSlideshow}
              >
                Slideshow
              </Button>
            )}
            <GoogleSyncStatus />
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      {view === 'drinks' ? (
        <Box position="relative">
          <Box px={{ base: 4, md: 6 }} pt={{ base: 1, md: 6 }} pb={24}>
            <CocktailGrid flashFilter={flashFilter} />
          </Box>
          {/* Bottom fade overlay */}
          <Box
            position="fixed"
            bottom={0}
            left={0}
            right={0}
            h="120px"
            bgGradient="linear(to-t, #0d0d0d 0%, transparent 100%)"
            pointerEvents="none"
            zIndex={10}
          />
        </Box>
      ) : (
        <Container maxW="container.xl" py={6}>
          <VStack spacing={6} align="stretch">
            {/* Quick Toggles */}
            <Box
              bg="#18181b"
              p={4}
              borderRadius="2xl"
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <Heading size="md" mb={4} color="gray.100">
                Quick Toggles
              </Heading>
              <FreshIngredients />
            </Box>

            <Box
              display="grid"
              gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }}
              gap={6}
            >
              {/* Ingredient List */}
              <Box
                ref={barStockRef}
                bg="#18181b"
                p={6}
                borderRadius="2xl"
                border="1px solid"
                borderColor="whiteAlpha.100"
                animation={flashBarStock ? `${barStockFlash} 1.6s ease-in-out` : undefined}
                scrollMarginTop="16px"
              >
                <HStack mb={4}>
                  <Heading size="md" color="gray.100">
                    Your Bar Stock
                  </Heading>
                  {myIngredients.length > 0 && (
                    <Badge bg="purple.500" color="white" borderRadius="full" px={3} py={1}>
                      {myIngredients.length}
                    </Badge>
                  )}
                </HStack>
                <IngredientList />
              </Box>

              {/* Ingredient Picker */}
              <Box
                bg="#18181b"
                borderRadius="2xl"
                border="1px solid"
                borderColor="whiteAlpha.100"
                position="relative"
                minH={{ base: '400px', lg: 'auto' }}
              >
                <Box
                  position="absolute"
                  inset={0}
                  p={6}
                  pt={5}
                  display="flex"
                  flexDirection="column"
                >
                  <Heading size="md" mb={3} color="gray.100" flexShrink={0}>
                    Add Ingredients
                  </Heading>
                  <Box flex={1} minH={0}>
                    <IngredientPicker />
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Shopping List */}
            <Box
              bg="#18181b"
              p={6}
              borderRadius="2xl"
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <MyShoppingList />
            </Box>

            {/* Data Export/Import */}
            <Box
              bg="#18181b"
              p={6}
              borderRadius="2xl"
              border="1px solid"
              borderColor="whiteAlpha.100"
            >
              <DataExport />
            </Box>
          </VStack>
        </Container>
      )}
      </Box>

      {/* Slideshow Overlay */}
      {showSlideshow && (
        <Box
          position="fixed"
          inset={0}
          zIndex={9999}
          bg="black"
        >
          <Slideshow onClose={closeSlideshow} />
        </Box>
      )}
    </Box>
  );
}
