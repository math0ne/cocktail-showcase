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
  HStack,
  Flex,
  Box,
  Divider,
  List,
  ListItem,
  ListIcon,
  Wrap,
  WrapItem,
  Button,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { useStore } from '@/store/useStore';
import type { CocktailMatch } from '@/types';

// Checkmark icon component (outline only)
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20 6L9 17l-5-5"
    />
  </svg>
);

// Heart icon component (outline only)
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
    />
  </svg>
);

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
  const bgInput = useColorModeValue('gray.50', 'gray.700');

  const triedCocktails = useStore((state) => state.triedCocktails);
  const heartedCocktails = useStore((state) => state.heartedCocktails);
  const cocktailNotes = useStore((state) => state.cocktailNotes);
  const toggleTried = useStore((state) => state.toggleTried);
  const toggleHearted = useStore((state) => state.toggleHearted);
  const setCocktailNote = useStore((state) => state.setCocktailNote);

  if (!match) return null;

  const { cocktail, isFullMatch, missingIngredients } = match;
  const isTried = triedCocktails.includes(cocktail.id);
  const isHearted = heartedCocktails.includes(cocktail.id);
  const note = cocktailNotes[cocktail.id] || '';
  const missingLower = missingIngredients.map((m) => m.toLowerCase());

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(4px)" />
      <ModalContent bg={bgModal} mx={4}>
        <ModalHeader pr={12} color={textPrimary}>
          {cocktail.name}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Flex gap={6} direction={{ base: 'column', md: 'row' }}>
            {/* Left Column - Image & Ingredients */}
            <VStack spacing={4} flex="0 0 auto" w={{ base: '100%', md: '240px' }} align="stretch">
              <Image
                src={cocktail.thumbnail}
                alt={cocktail.name}
                w="100%"
                aspectRatio="1"
                objectFit="cover"
                borderRadius="lg"
              />

              {/* Ingredients */}
              <Box w="100%">
                <Text fontWeight="semibold" mb={2} color={textPrimary} fontSize="sm">
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
                        fontSize="sm"
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
            </VStack>

            {/* Right Column - Actions, Tags, Instructions & Notes */}
            <VStack spacing={4} flex={1} align="stretch">
              {/* Tried / Hearted buttons */}
              <HStack spacing={2} w="100%">
                <Button
                  size="sm"
                  flex={1}
                  leftIcon={<Box as="span"><CheckIcon /></Box>}
                  colorScheme={isTried ? 'green' : 'gray'}
                  variant={isTried ? 'solid' : 'outline'}
                  onClick={() => toggleTried(cocktail.id)}
                >
                  {isTried ? 'Tried' : 'Tried'}
                </Button>
                <Button
                  size="sm"
                  flex={1}
                  leftIcon={<Box as="span"><HeartIcon /></Box>}
                  colorScheme={isHearted ? 'red' : 'gray'}
                  variant={isHearted ? 'solid' : 'outline'}
                  onClick={() => toggleHearted(cocktail.id)}
                >
                  {isHearted ? 'Favorite' : 'Favorite'}
                </Button>
              </HStack>

              {/* Badges */}
              <Wrap spacing={2} w="100%">
                <WrapItem>
                  <Badge colorScheme={isFullMatch ? 'green' : 'orange'} fontSize="sm">
                    {isFullMatch ? 'Ready' : `Missing ${missingIngredients.length}`}
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

              {/* Instructions */}
              <Box>
                <Text fontWeight="semibold" mb={2} color={textPrimary}>
                  Instructions
                </Text>
                <Text color={textSecondary} whiteSpace="pre-wrap" fontSize="sm">
                  {cocktail.instructions}
                </Text>
              </Box>

              <Divider borderColor={borderColor} />

              {/* Notes */}
              <Box>
                <Text fontWeight="semibold" mb={2} color={textPrimary}>
                  My Notes
                </Text>
                <Textarea
                  value={note}
                  onChange={(e) => setCocktailNote(cocktail.id, e.target.value)}
                  placeholder="Add your personal notes about this cocktail..."
                  size="sm"
                  resize="vertical"
                  minH="120px"
                  bg={bgInput}
                  borderColor={borderColor}
                  _placeholder={{ color: textSecondary }}
                />
              </Box>
            </VStack>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
