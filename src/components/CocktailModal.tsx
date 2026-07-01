'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  Text,
  Badge,
  VStack,
  Box,
  Divider,
  List,
  ListItem,
  ListIcon,
  Wrap,
  WrapItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import type { CocktailMatch } from '@/types';

interface CocktailModalProps {
  match: CocktailMatch | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CocktailModal({ match, isOpen, onClose }: CocktailModalProps) {
  const bgModal = useColorModeValue('white', 'gray.800');
  const textPrimary = useColorModeValue('gray.800', 'gray.100');
  const textSecondary = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!match) return null;

  const { cocktail, isFullMatch, missingIngredients } = match;
  const missingLower = missingIngredients.map((m) => m.toLowerCase());

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={bgModal} mx={4}>
        <ModalHeader pr={12} color={textPrimary}>
          {cocktail.name}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Image */}
            <Image
              src={cocktail.thumbnail}
              alt={cocktail.name}
              w="100%"
              aspectRatio="1"
              objectFit="cover"
              borderRadius="lg"
            />

            {/* Badges */}
            <Wrap spacing={2}>
              <WrapItem>
                <Badge colorScheme={isFullMatch ? 'green' : 'orange'} fontSize="sm">
                  {isFullMatch ? 'Ready to Make' : `Missing ${missingIngredients.length}`}
                </Badge>
              </WrapItem>
              <WrapItem>
                <Badge colorScheme="purple" fontSize="sm">
                  {cocktail.category}
                </Badge>
              </WrapItem>
              <WrapItem>
                <Badge colorScheme="blue" fontSize="sm">
                  {cocktail.glass}
                </Badge>
              </WrapItem>
              {cocktail.tags.map((tag) => (
                <WrapItem key={tag}>
                  <Badge colorScheme="teal" fontSize="sm">
                    {tag}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>

            <Divider borderColor={borderColor} />

            {/* Ingredients */}
            <Box>
              <Text fontWeight="semibold" mb={2} color={textPrimary}>
                Ingredients
              </Text>
              <List spacing={1}>
                {cocktail.ingredients.map((ing, index) => {
                  const isMissing = missingLower.includes(ing.name.toLowerCase());
                  return (
                    <ListItem
                      key={`${ing.name}-${index}`}
                      display="flex"
                      alignItems="center"
                      color={isMissing ? 'red.500' : textPrimary}
                    >
                      <ListIcon
                        as={isMissing ? WarningIcon : CheckCircleIcon}
                        color={isMissing ? 'red.500' : 'green.500'}
                      />
                      <Text>
                        {ing.measure && <Text as="span" fontWeight="medium">{ing.measure} </Text>}
                        {ing.name}
                      </Text>
                    </ListItem>
                  );
                })}
              </List>
            </Box>

            <Divider borderColor={borderColor} />

            {/* Instructions */}
            <Box>
              <Text fontWeight="semibold" mb={2} color={textPrimary}>
                Instructions
              </Text>
              <Text color={textSecondary} whiteSpace="pre-wrap">
                {cocktail.instructions}
              </Text>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
