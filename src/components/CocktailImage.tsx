'use client';

import { Box, Image, Text, Skeleton } from '@chakra-ui/react';
import { useCocktailImage } from '@/hooks/useStoredImage';

interface CocktailImageProps {
  cocktailId: string;
  thumbnailUrl: string;
  name: string;
  aspectRatio?: string;
  borderRadius?: string;
  fallbackSize?: string;
}

export function CocktailImage({
  cocktailId,
  thumbnailUrl,
  name,
  aspectRatio = '1',
  borderRadius = 'xl',
  fallbackSize = '4xl',
}: CocktailImageProps) {
  const { imageUrl, loading, isCustom } = useCocktailImage(cocktailId, thumbnailUrl);

  // Show loading skeleton for custom cocktails while loading from IndexedDB
  if (isCustom && loading) {
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
        <Text fontSize={fallbackSize} color="gray.600">
          🍸
        </Text>
      </Box>
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={name}
      w="100%"
      sx={{ aspectRatio }}
      objectFit="cover"
      borderRadius={borderRadius}
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
          <Text fontSize={fallbackSize} color="gray.600">
            🍸
          </Text>
        </Box>
      }
    />
  );
}
