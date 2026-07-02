'use client';

import {
  Box,
  Text,
  Badge,
  VStack,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useStore } from '@/store/useStore';
import { CocktailImage } from './CocktailImage';
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

  // Only show green border if highlight is enabled and it's a full match
  const showHighlight = showReadyHighlight && isFullMatch;

  return (
    <Box
      borderRadius="2xl"
      overflow="hidden"
      bg="#121214"
      border="1px solid"
      borderColor={showHighlight ? 'green.600' : 'whiteAlpha.100'}
      transition="all 0.2s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}
      cursor="pointer"
      onClick={onClick}
    >
      {/* Image container with gradient overlay */}
      <Box position="relative" overflow="hidden">
        <CocktailImage
          cocktailId={cocktail.id}
          thumbnailUrl={cocktail.thumbnail}
          name={cocktail.name}
          aspectRatio="1"
          borderRadius="0"
        />
        {/* Gradient overlay at bottom */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          h="50%"
          bgGradient="linear(to-t, #121214, transparent)"
          pointerEvents="none"
        />
        {/* Status badge - top right */}
        <Badge
          position="absolute"
          top={2}
          right={2}
          bg={isFullMatch ? '#10b981' : '#f59e0b'}
          color="white"
          fontSize="xs"
          px={2.5}
          py={1}
          borderRadius="md"
          fontWeight="semibold"
        >
          {isFullMatch
            ? 'Ready'
            : `Missing ${missingIngredients.length}`}
        </Badge>
      </Box>

      <VStack p={4} align="stretch" spacing={2}>
        <Text fontWeight="semibold" fontSize="md" noOfLines={1} color="gray.100">
          {cocktail.name}
        </Text>

        <Wrap spacing={1.5} align="center">
          {isTried && (
            <WrapItem>
              <Badge bg="#10b981" color="white" fontSize="xs" borderRadius="md" fontWeight="semibold" px={2} py={0.5}>
                Tried
              </Badge>
            </WrapItem>
          )}
          {isHearted && (
            <WrapItem>
              <Badge bg="#ef4444" color="white" fontSize="xs" borderRadius="md" fontWeight="semibold" px={2} py={0.5}>
                Liked
              </Badge>
            </WrapItem>
          )}
          <WrapItem>
            <Badge bg="#8b5cf6" color="white" fontSize="xs" borderRadius="md" fontWeight="semibold" px={2} py={0.5}>
              {cocktail.category}
            </Badge>
          </WrapItem>
          {cocktail.tags.map((tag) => (
            <WrapItem key={tag}>
              <Badge bg="#0ea5e9" color="white" fontSize="xs" borderRadius="md" fontWeight="semibold" px={2} py={0.5}>
                {tag}
              </Badge>
            </WrapItem>
          ))}
          <WrapItem>
            <Badge bg="#6366f1" color="white" fontSize="xs" borderRadius="md" fontWeight="semibold" px={2} py={0.5}>
              {cocktail.glass}
            </Badge>
          </WrapItem>
        </Wrap>

        <Text fontSize="xs" color="gray.400" noOfLines={2}>
          {cocktail.ingredients.map((ing, index) => {
            const isMissing = missingIngredients
              .map((m) => m.toLowerCase())
              .includes(ing.name.toLowerCase());
            return (
              <Text
                key={`${ing.name}-${index}`}
                as="span"
                color={isMissing ? '#ef4444' : 'gray.400'}
              >
                {ing.name}{index < cocktail.ingredients.length - 1 ? ', ' : ''}
              </Text>
            );
          })}
        </Text>
      </VStack>
    </Box>
  );
}
