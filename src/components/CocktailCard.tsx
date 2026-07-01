'use client';

import {
  Box,
  Image,
  Text,
  Badge,
  VStack,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { useStore } from '@/store/useStore';
import type { CocktailMatch } from '@/types';

interface CocktailCardProps {
  match: CocktailMatch;
  onClick?: () => void;
  showReadyHighlight?: boolean;
}

export function CocktailCard({ match, onClick, showReadyHighlight = true }: CocktailCardProps) {
  const { cocktail, isFullMatch, missingIngredients } = match;

  const triedCocktails = useStore((state) => state.triedCocktails);
  const heartedCocktails = useStore((state) => state.heartedCocktails);

  const isTried = triedCocktails.includes(cocktail.id);
  const isHearted = heartedCocktails.includes(cocktail.id);

  const bgCard = useColorModeValue('white', 'gray.800');
  const borderDefault = useColorModeValue('gray.200', 'gray.700');
  const borderMatch = useColorModeValue('green.200', 'green.700');
  const textMuted = useColorModeValue('gray.600', 'gray.400');

  // Only show green border if highlight is enabled and it's a full match
  const showHighlight = showReadyHighlight && isFullMatch;

  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      bg={bgCard}
      boxShadow="sm"
      border="1px solid"
      borderColor={showHighlight ? borderMatch : borderDefault}
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
        {/* Status badge - top right */}
        <Badge
          position="absolute"
          top={2}
          right={2}
          bg="rgba(0,0,0,0.6)"
          color="white"
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

        <Wrap spacing={1} align="center">
          {isTried && (
            <WrapItem>
              <Badge colorScheme="green" variant="subtle" fontSize="xs">
                Tried
              </Badge>
            </WrapItem>
          )}
          {isHearted && (
            <WrapItem>
              <Badge colorScheme="red" variant="subtle" fontSize="xs">
                Liked
              </Badge>
            </WrapItem>
          )}
          <WrapItem>
            <Badge colorScheme="purple" variant="subtle" fontSize="xs">
              {cocktail.category}
            </Badge>
          </WrapItem>
          {cocktail.tags.map((tag) => (
            <WrapItem key={tag}>
              <Badge colorScheme="teal" variant="subtle" fontSize="xs">
                {tag}
              </Badge>
            </WrapItem>
          ))}
          <WrapItem>
            <Text fontSize="xs" color={textMuted}>{cocktail.glass}</Text>
          </WrapItem>
        </Wrap>

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
                    fontSize="xs"
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
