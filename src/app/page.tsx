'use client';

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { IngredientPicker } from '@/components/IngredientPicker';
import { IngredientList } from '@/components/IngredientList';
import { ColorModeToggle } from '@/components/ColorModeToggle';
import { useStore } from '@/store/useStore';
import { useCocktails } from '@/hooks/useCocktails';

export default function HomePage() {
  const myIngredients = useStore((state) => state.myIngredients);
  const { fullMatches, matches } = useCocktails();

  // Semantic colors
  const bgPage = useColorModeValue('gray.50', 'gray.900');
  const bgSurface = useColorModeValue('white', 'gray.800');
  const bgHeader = useColorModeValue('white', 'gray.850');
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
        py={4}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Heading size="lg" color={accentTeal}>
              Cocktail Showcase
            </Heading>
            <HStack spacing={2}>
              <Link href="/cocktails" passHref legacyBehavior>
                <Button as="a" variant="ghost" colorScheme="teal" size="sm">
                  View Cocktails
                  {matches.length > 0 && (
                    <Badge ml={2} colorScheme="teal" variant="subtle">
                      {matches.length}
                    </Badge>
                  )}
                </Button>
              </Link>
              {fullMatches.length > 0 && (
                <Link href="/slideshow" passHref legacyBehavior>
                  <Button as="a" colorScheme="teal" size="sm">
                    Slideshow
                    <Badge ml={2} colorScheme="green" variant="solid">
                      {fullMatches.length}
                    </Badge>
                  </Button>
                </Link>
              )}
              <ColorModeToggle />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="xl" mb={2} color={textPrimary}>
              What&apos;s in Your Bar?
            </Heading>
            <Text color={textSecondary} fontSize="lg">
              Add the ingredients you have and discover cocktails you can make
            </Text>
          </Box>

          {/* Stats */}
          {myIngredients.length > 0 && (
            <HStack justify="center" spacing={8}>
              <VStack spacing={0}>
                <Text fontSize="3xl" fontWeight="bold" color={accentTeal}>
                  {myIngredients.length}
                </Text>
                <Text color={textSecondary} fontSize="sm">Ingredients</Text>
              </VStack>
              <VStack spacing={0}>
                <Text fontSize="3xl" fontWeight="bold" color={accentGreen}>
                  {fullMatches.length}
                </Text>
                <Text color={textSecondary} fontSize="sm">Ready to Make</Text>
              </VStack>
              <VStack spacing={0}>
                <Text fontSize="3xl" fontWeight="bold" color={accentOrange}>
                  {matches.length - fullMatches.length}
                </Text>
                <Text color={textSecondary} fontSize="sm">Almost Ready</Text>
              </VStack>
            </HStack>
          )}

          <Box
            display="grid"
            gridTemplateColumns={{ base: '1fr', lg: '1fr 1fr' }}
            gap={6}
          >
            {/* Ingredient Picker */}
            <Box
              bg={bgSurface}
              borderRadius="xl"
              border="1px solid"
              borderColor={borderColor}
              shadow="sm"
              position="relative"
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
          </Box>

          {/* Call to Action */}
          {fullMatches.length > 0 && (
            <Box textAlign="center" py={6}>
              <Text color={textSecondary} mb={4}>
                You can make {fullMatches.length} cocktails right now!
              </Text>
              <HStack justify="center" spacing={4}>
                <Link href="/cocktails" passHref legacyBehavior>
                  <Button as="a" size="lg" colorScheme="teal" variant="outline">
                    Browse All
                  </Button>
                </Link>
                <Link href="/slideshow" passHref legacyBehavior>
                  <Button as="a" size="lg" colorScheme="teal">
                    Start Slideshow
                  </Button>
                </Link>
              </HStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
