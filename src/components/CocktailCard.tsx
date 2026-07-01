'use client';

import {
  Box,
  Image,
  Text,
  Badge,
  VStack,
  HStack,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import type { CocktailMatch } from '@/types';
import { GlassIcon } from './GlassIcon';

interface CocktailCardProps {
  match: CocktailMatch;
  onClick?: () => void;
}

export function CocktailCard({ match, onClick }: CocktailCardProps) {
  const { cocktail, isFullMatch, missingIngredients } = match;

  const bgCard = useColorModeValue('white', 'gray.800');
  const borderDefault = useColorModeValue('gray.200', 'gray.700');
  const borderMatch = useColorModeValue('green.400', 'green.500');
  const textMuted = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      bg={bgCard}
      boxShadow="sm"
      border="1px solid"
      borderColor={isFullMatch ? borderMatch : borderDefault}
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
      cursor="pointer"
      onClick={onClick}
    >
      {/* Image container */}
      <Box position="relative" overflow="hidden">
        <Image
          src={cocktail.thumbnail}
          alt={cocktail.name}
          w="100%"
          aspectRatio="1"
          objectFit="cover"
        />
        {/* Status badge */}
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme={isFullMatch ? 'green' : 'orange'}
          fontSize="xs"
          px={2}
          py={1}
          borderRadius="md"
        >
          {isFullMatch
            ? 'Ready'
            : `Missing ${missingIngredients.length}`}
        </Badge>
      </Box>

      <VStack p={4} align="stretch" spacing={2}>
        <Text fontWeight="semibold" fontSize="md" noOfLines={1}>
          {cocktail.name}
        </Text>

        <HStack spacing={2} flexWrap="wrap" align="center">
          <Badge colorScheme="purple" variant="subtle" fontSize="xs">
            {cocktail.category}
          </Badge>
          <HStack spacing={1}>
            <GlassIcon glass={cocktail.glass} size="sm" />
            <Text fontSize="xs" color={textMuted}>{cocktail.glass}</Text>
          </HStack>
        </HStack>

        <Box>
          <Text fontSize="xs" fontWeight="medium" mb={1} color={textMuted}>
            Ingredients:
          </Text>
          <Wrap spacing={1}>
            {cocktail.ingredients.map((ing, index) => {
              const isMissing = missingIngredients
                .map((m) => m.toLowerCase())
                .includes(ing.name.toLowerCase());
              return (
                <WrapItem key={`${ing.name}-${index}`}>
                  <Badge
                    variant="subtle"
                    colorScheme={isMissing ? 'red' : 'green'}
                    fontSize="2xs"
                  >
                    {ing.name}
                  </Badge>
                </WrapItem>
              );
            })}
          </Wrap>
        </Box>
      </VStack>
    </Box>
  );
}
