'use client';

import {
  Box,
  Image,
  Text,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon, AddIcon } from '@chakra-ui/icons';
import { getIngredientImageUrl } from '@/lib/images';

interface IngredientCardProps {
  ingredient: string;
  isAdded: boolean;
  onClick: () => void;
}

export function IngredientCard({ ingredient, isAdded, onClick }: IngredientCardProps) {
  const bgCard = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const borderAdded = useColorModeValue('green.400', 'green.500');
  const textPrimary = useColorModeValue('gray.700', 'gray.100');

  const imageUrl = getIngredientImageUrl(ingredient, 'Medium');

  return (
    <Box
      borderRadius="xl"
      overflow="hidden"
      bg={bgCard}
      boxShadow="sm"
      border="1px solid"
      borderColor={isAdded ? borderAdded : borderColor}
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={isAdded ? {} : { transform: 'translateY(-2px)', boxShadow: 'md' }}
      cursor={isAdded ? 'default' : 'pointer'}
      opacity={isAdded ? 0.7 : 1}
      onClick={isAdded ? undefined : onClick}
    >
      {/* Image container */}
      <Box position="relative" overflow="hidden">
        <Image
          src={imageUrl}
          alt={ingredient}
          w="100%"
          aspectRatio="1"
          objectFit="cover"
          fallback={
            <Box
              w="100%"
              aspectRatio="1"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg="gray.100"
              fontSize="3xl"
            >
              🍸
            </Box>
          }
        />
        {/* Status badge */}
        {isAdded ? (
          <Badge
            position="absolute"
            top={2}
            right={2}
            colorScheme="green"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="md"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <CheckIcon boxSize={2} /> Added
          </Badge>
        ) : (
          <Box
            position="absolute"
            top={2}
            right={2}
            bg="blackAlpha.600"
            borderRadius="full"
            w={6}
            h={6}
            display="flex"
            alignItems="center"
            justifyContent="center"
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
          color={textPrimary}
        >
          {ingredient}
        </Text>
      </Box>
    </Box>
  );
}
