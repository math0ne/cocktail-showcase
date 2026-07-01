'use client';

import { useState } from 'react';
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
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import Link from 'next/link';
import { CocktailGrid } from '@/components/CocktailGrid';
import { IngredientPicker } from '@/components/IngredientPicker';
import { IngredientList } from '@/components/IngredientList';
import { FreshIngredients } from '@/components/FreshIngredients';
import { ColorModeToggle } from '@/components/ColorModeToggle';
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
  const myIngredients = useStore((state) => state.myIngredients);
  const { fullMatches, matches } = useCocktails();

  // Semantic colors
  const bgPage = useColorModeValue('gray.50', 'gray.900');
  const bgSurface = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textPrimary = useColorModeValue('gray.800', 'gray.100');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const accentTeal = useColorModeValue('teal.600', 'teal.400');
  const accentGreen = useColorModeValue('green.600', 'green.400');
  const accentOrange = useColorModeValue('orange.600', 'orange.400');

  return (
    <Box minH="100vh" bg={bgPage}>
      {/* Header */}
      <Box
        bg={bgSurface}
        borderBottom="1px solid"
        borderColor={borderColor}
        py={3}
        px={{ base: 4, md: 6 }}
      >
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={3}>
          {/* Logo and Stats */}
          <HStack spacing={6}>
            <HStack spacing={2}>
              <CocktailLogo boxSize={7} color={accentTeal} />
              <Heading size="md" color={accentTeal}>
                Cocktails
              </Heading>
            </HStack>

            {/* Stats in header */}
            {myIngredients.length > 0 && (
              <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
                <HStack spacing={1}>
                  <Text fontSize="lg" fontWeight="bold" color={accentTeal}>
                    {myIngredients.length}
                  </Text>
                  <Text color={textSecondary} fontSize="xs">ingredients</Text>
                </HStack>
                <HStack spacing={1}>
                  <Text fontSize="lg" fontWeight="bold" color={accentGreen}>
                    {fullMatches.length}
                  </Text>
                  <Text color={textSecondary} fontSize="xs">ready</Text>
                </HStack>
                <HStack spacing={1}>
                  <Text fontSize="lg" fontWeight="bold" color={accentOrange}>
                    {matches.length - fullMatches.length}
                  </Text>
                  <Text color={textSecondary} fontSize="xs">close</Text>
                </HStack>
              </HStack>
            )}
          </HStack>

          {/* Actions */}
          <HStack spacing={3}>
            {/* Navigation Toggle */}
            <ButtonGroup isAttached size="sm">
              <Button
                colorScheme="teal"
                variant={view === 'bar' ? 'solid' : 'outline'}
                onClick={() => setView('bar')}
              >
                Bar
              </Button>
              <Button
                colorScheme="teal"
                variant={view === 'drinks' ? 'solid' : 'outline'}
                onClick={() => setView('drinks')}
              >
                Drinks
              </Button>
            </ButtonGroup>
            {fullMatches.length > 0 && (
              <Link href="/slideshow" passHref legacyBehavior>
                <Button as="a" colorScheme="teal" size="sm" display={{ base: 'none', md: 'inline-flex' }}>
                  Slideshow
                </Button>
              </Link>
            )}
            <ColorModeToggle />
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      {view === 'drinks' ? (
        <Box px={{ base: 4, md: 6 }} py={6}>
          <CocktailGrid />
        </Box>
      ) : (
        <Container maxW="container.xl" py={6}>
          <VStack spacing={6} align="stretch">
            {/* Quick Toggles */}
            <Box
              bg={bgSurface}
              p={4}
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
              shadow="sm"
            >
              <Heading size="md" mb={4} color={textPrimary}>
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
                bg={bgSurface}
                p={6}
                borderRadius="xl"
                border="1px solid"
                borderColor={borderColor}
                shadow="sm"
              >
                <Heading size="md" mb={4} color={textPrimary}>
                  Your Bar Stock
                </Heading>
                <IngredientList />
              </Box>

              {/* Ingredient Picker */}
              <Box
                bg={bgSurface}
                borderRadius="xl"
                border="1px solid"
                borderColor={borderColor}
                shadow="sm"
                position="relative"
                minH={{ base: '400px', lg: 'auto' }}
              >
                <Box
                  position="absolute"
                  inset={0}
                  p={6}
                  display="flex"
                  flexDirection="column"
                  overflow="hidden"
                >
                  <Heading size="md" mb={4} color={textPrimary} flexShrink={0}>
                    Add Ingredients
                  </Heading>
                  <Box flex={1} minH={0} overflow="hidden">
                    <IngredientPicker />
                  </Box>
                </Box>
              </Box>
            </Box>
          </VStack>
        </Container>
      )}
    </Box>
  );
}
