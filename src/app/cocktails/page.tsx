'use client';

import {
  Box,
  Container,
  Heading,
  Button,
  Flex,
  Badge,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { CocktailGrid } from '@/components/CocktailGrid';
import { ColorModeToggle } from '@/components/ColorModeToggle';
import { useCocktails } from '@/hooks/useCocktails';

export default function CocktailsPage() {
  const { fullMatches } = useCocktails();

  const bgPage = useColorModeValue('gray.50', 'gray.900');
  const bgSurface = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentTeal = useColorModeValue('teal.600', 'teal.400');

  return (
    <Box minH="100vh" bg={bgPage}>
      {/* Header */}
      <Box bg={bgSurface} borderBottom="1px solid" borderColor={borderColor} py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Heading size="lg" color={accentTeal}>
              Cocktail Showcase
            </Heading>
            <HStack spacing={2}>
              <Link href="/" passHref legacyBehavior>
                <Button as="a" variant="ghost" colorScheme="teal" size="sm">
                  Manage Ingredients
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
        <CocktailGrid />
      </Container>
    </Box>
  );
}
