'use client';

import {
  Box,
  Text,
  Badge,
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { CheckIcon, AddIcon } from '@chakra-ui/icons';
import { getIngredientImageUrl } from '@/lib/images';
import { IngredientImage } from './IngredientImage';

// Shopping cart icon
const ShoppingCartIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

interface IngredientCardProps {
  ingredient: string;
  isAdded: boolean;
  isInShoppingList?: boolean;
  onClick: () => void;
  onAddToShoppingList?: () => void;
}

export function IngredientCard({ ingredient, isAdded, isInShoppingList, onClick, onAddToShoppingList }: IngredientCardProps) {
  const imageUrl = getIngredientImageUrl(ingredient, 'Small');

  const handleShoppingListClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToShoppingList?.();
  };

  return (
    <Box
      borderRadius="2xl"
      overflow="hidden"
      bg="#18181b"
      border="1px solid"
      borderColor={isAdded ? 'green.500' : isInShoppingList ? 'orange.500' : 'whiteAlpha.100'}
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
        {/* Status badges */}
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
        ) : isInShoppingList ? (
          <Badge
            position="absolute"
            top={4}
            right={4}
            bg="orange.500"
            color="white"
            fontSize="xs"
            px={2}
            py={1}
            borderRadius="full"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <Box as="span" mr={0.5}><ShoppingCartIcon /></Box> In List
          </Badge>
        ) : (
          <HStack position="absolute" top={4} right={4} spacing={1}>
            {onAddToShoppingList && (
              <Tooltip label="Add to shopping list" placement="top" hasArrow>
                <IconButton
                  aria-label="Add to shopping list"
                  icon={<ShoppingCartIcon />}
                  size="xs"
                  bg="orange.500"
                  color="white"
                  borderRadius="full"
                  w={6}
                  h={6}
                  minW={6}
                  _hover={{ bg: 'orange.400' }}
                  onClick={handleShoppingListClick}
                />
              </Tooltip>
            )}
            <Box
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
          </HStack>
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
