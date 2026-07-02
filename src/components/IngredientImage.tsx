'use client';

import { Box, Image, Text, Skeleton } from '@chakra-ui/react';
import { useIngredientImage } from '@/hooks/useStoredImage';

interface IngredientImageProps {
  ingredientName: string;
  fallbackUrl: string;
  aspectRatio?: string;
  borderRadius?: string;
  objectFit?: 'contain' | 'cover';
}

export function IngredientImage({
  ingredientName,
  fallbackUrl,
  aspectRatio = '1',
  borderRadius = 'lg',
  objectFit = 'contain',
}: IngredientImageProps) {
  const { imageUrl, loading } = useIngredientImage(ingredientName, fallbackUrl);

  // Show loading skeleton while checking IndexedDB
  if (loading) {
    return (
      <Skeleton
        w="100%"
        sx={{ aspectRatio }}
        borderRadius={borderRadius}
        startColor="gray.800"
        endColor="gray.700"
      />
    );
  }

  // Show fallback if no image
  if (!imageUrl) {
    return (
      <Box
        w="100%"
        sx={{ aspectRatio }}
        bg="gray.800"
        borderRadius={borderRadius}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="3xl" color="gray.600">
          🍸
        </Text>
      </Box>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={ingredientName}
      w="100%"
      sx={{ aspectRatio }}
      objectFit={objectFit}
      borderRadius={borderRadius}
      loading="lazy"
      fallback={
        <Box
          w="100%"
          sx={{ aspectRatio }}
          bg="gray.800"
          borderRadius={borderRadius}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="3xl" color="gray.600">
            🍸
          </Text>
        </Box>
      }
    />
  );
}
