'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function HomePage() {
  const [view, setView] = useState<ViewMode>('drinks');
  const [showSlideshow, setShowSlideshow] = useState(false);
  const myIngredients = useStore((state) => state.myIngredients);
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

  return (
    <Box minH="100vh" bg="#0d0d0d">
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
                spacing={4}
                display={{ base: 'none', md: 'flex' }}
                bg="whiteAlpha.50"
                px={4}
                py={1.5}
                borderRadius="xl"
              >
                <HStack spacing={1}>
                  <Text fontSize="lg" fontWeight="bold" color="purple.400">
                    {myIngredients.length}
                  </Text>
                  <Text color="gray.400" fontSize="xs">ingredients</Text>
                </HStack>
                <HStack spacing={1}>
                  <Text fontSize="lg" fontWeight="bold" color="green.400">
                    {fullMatches.length}
                  </Text>
                  <Text color="gray.400" fontSize="xs">ready</Text>
                </HStack>
                <HStack spacing={1}>
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
                onClick={() => setShowSlideshow(true)}
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
            <CocktailGrid />
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
                bg="#18181b"
                p={6}
                borderRadius="2xl"
                border="1px solid"
                borderColor="whiteAlpha.100"
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

      {/* Slideshow Overlay */}
      {showSlideshow && (
        <Box
          position="fixed"
          inset={0}
          zIndex={9999}
          bg="black"
        >
          <Slideshow onClose={() => setShowSlideshow(false)} />
        </Box>
      )}
    </Box>
  );
}
