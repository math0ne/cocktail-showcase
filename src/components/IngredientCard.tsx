'use client';

import {
  Box,
  Text,
  Badge,
} from '@chakra-ui/react';
import { CheckIcon, AddIcon } from '@chakra-ui/icons';
import { getIngredientImageUrl } from '@/lib/images';
import { IngredientImage } from './IngredientImage';

interface IngredientCardProps {
  ingredient: string;
  isAdded: boolean;
  onClick: () => void;
}

export function IngredientCard({ ingredient, isAdded, onClick }: IngredientCardProps) {
  const imageUrl = getIngredientImageUrl(ingredient, 'Small');

  return (
    <Box
      borderRadius="2xl"
      overflow="hidden"
      bg="#121214"
      border="1px solid"
      borderColor={isAdded ? 'green.500' : 'whiteAlpha.100'}
      transition="all 0.2s ease"
      _hover={isAdded ? {} : {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(124,58,237,0.15)',
      }}
      cursor={isAdded ? 'default' : 'pointer'}
      opacity={isAdded ? 0.7 : 1}
      onClick={isAdded ? undefined : onClick}
    >
      {/* Image container */}
      <Box position="relative" overflow="hidden" p={3} pb={0}>
        <IngredientImage
          ingredientName={ingredient}
          fallbackUrl={imageUrl}
          aspectRatio="1"
          objectFit="contain"
        />
        {/* Status badge */}
        {isAdded ? (
          <Badge
            position="absolute"
            top={4}
            right={4}
            colorScheme="green"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <CheckIcon boxSize={2} /> Added
          </Badge>
        ) : (
          <Box
            position="absolute"
            top={4}
            right={4}
            bg="purple.600"
            borderRadius="full"
            w={6}
            h={6}
            display="flex"
            alignItems="center"
            justifyContent="center"
            transition="all 0.2s"
            _groupHover={{ bg: 'purple.500' }}
          >
            <AddIcon boxSize={3} color="white" />
          </Box>
        )}
      </Box>

      <Box p={3} textAlign="center">
        <Text
          fontWeight="medium"
          fontSize="sm"
          noOfLines={1}
          color="gray.100"
        >
          {ingredient}
        </Text>
      </Box>
    </Box>
  );
}
