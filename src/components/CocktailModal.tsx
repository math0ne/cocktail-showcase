'use client';

import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
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
  IconButton,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, EditIcon } from '@chakra-ui/icons';
import { useStore } from '@/store/useStore';
import { CocktailImage } from './CocktailImage';
import { CreateDrinkModal } from './CreateDrinkModal';
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
  portalContainerRef?: React.RefObject<HTMLDivElement>;
}

export function CocktailModal({ match, isOpen, onClose, portalContainerRef }: CocktailModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const triedCocktails = useStore((state) => state.triedCocktails);
  const heartedCocktails = useStore((state) => state.heartedCocktails);
  const cocktailNotes = useStore((state) => state.cocktailNotes);
  const customCocktails = useStore((state) => state.customCocktails);
  const toggleTried = useStore((state) => state.toggleTried);
  const toggleHearted = useStore((state) => state.toggleHearted);
  const setCocktailNote = useStore((state) => state.setCocktailNote);

  if (!match) return null;

  const { cocktail, isFullMatch, missingIngredients } = match;
  const isTried = triedCocktails.includes(cocktail.id);
  const isHearted = heartedCocktails.includes(cocktail.id);
  const note = cocktailNotes[cocktail.id] || '';
  const missingLower = missingIngredients.map((m) => m.toLowerCase());

  // Get the latest version of the cocktail from the store if it's custom
  const currentCocktail = cocktail.id.startsWith('custom-')
    ? customCocktails.find((c) => c.id === cocktail.id) || cocktail
    : cocktail;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      portalProps={portalContainerRef ? { containerRef: portalContainerRef } : undefined}
    >
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(8px)" />
      <ModalContent bg="#0d0d0d" mx={4} borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
        <ModalHeader pr={20} color="gray.100">
          {currentCocktail.name}
        </ModalHeader>
        <IconButton
          aria-label="Edit drink"
          icon={<EditIcon />}
          position="absolute"
          top={2}
          right={10}
          size="sm"
          variant="ghost"
          color="gray.400"
          _hover={{ color: 'purple.400', bg: 'whiteAlpha.100' }}
          onClick={() => setIsEditModalOpen(true)}
        />
        <ModalCloseButton color="gray.400" top={2} />
        <ModalBody pb={6}>
          <Flex gap={6} direction={{ base: 'column', md: 'row' }}>
            {/* Left Column - Image & Ingredients */}
            <VStack spacing={4} flex="0 0 auto" w={{ base: '100%', md: '240px' }} align="stretch">
              <CocktailImage
                cocktailId={currentCocktail.id}
                thumbnailUrl={currentCocktail.thumbnail}
                name={currentCocktail.name}
                aspectRatio="1"
                borderRadius="xl"
                fallbackSize="6xl"
              />

              {/* Ingredients */}
              <Box w="100%">
                <Text fontWeight="semibold" mb={2} color="gray.100" fontSize="sm">
                  Ingredients
                </Text>
                <List spacing={1}>
                  {currentCocktail.ingredients.map((ing, index) => {
                    const isMissing = missingLower.includes(ing.name.toLowerCase());
                    return (
                      <ListItem
                        key={`${ing.name}-${index}`}
                        display="flex"
                        alignItems="center"
                        color={isMissing ? '#ef4444' : 'gray.100'}
                        fontSize="sm"
                      >
                        <ListIcon
                          as={isMissing ? WarningIcon : CheckCircleIcon}
                          color={isMissing ? '#ef4444' : '#10b981'}
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
              {/* Action buttons */}
              <HStack spacing={2} w="100%">
                <Button
                  size="sm"
                  flex={1}
                  leftIcon={<Box as="span"><CheckIcon /></Box>}
                  bg={isTried ? '#3b82f6' : 'transparent'}
                  color={isTried ? 'white' : 'gray.400'}
                  border="1px solid"
                  borderColor={isTried ? '#3b82f6' : 'whiteAlpha.200'}
                  _hover={{ bg: isTried ? '#2563eb' : 'whiteAlpha.100' }}
                  onClick={() => toggleTried(cocktail.id)}
                  borderRadius="xl"
                >
                  Tried
                </Button>
                <Button
                  size="sm"
                  flex={1}
                  leftIcon={<Box as="span"><HeartIcon /></Box>}
                  bg={isHearted ? '#ef4444' : 'transparent'}
                  color={isHearted ? 'white' : 'gray.400'}
                  border="1px solid"
                  borderColor={isHearted ? '#ef4444' : 'whiteAlpha.200'}
                  _hover={{ bg: isHearted ? '#dc2626' : 'whiteAlpha.100' }}
                  onClick={() => toggleHearted(cocktail.id)}
                  borderRadius="xl"
                >
                  Favorite
                </Button>
                <Button
                  size="sm"
                  flex={1}
                  leftIcon={<EditIcon />}
                  bg="transparent"
                  color="gray.400"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  _hover={{ bg: 'purple.600', color: 'white', borderColor: 'purple.600' }}
                  onClick={() => setIsEditModalOpen(true)}
                  borderRadius="xl"
                >
                  Edit
                </Button>
              </HStack>

              {/* Badges */}
              <Wrap spacing={2} w="100%">
                <WrapItem>
                  <Badge
                    bg={isFullMatch ? '#10b981' : '#f59e0b'}
                    color="white"
                    fontSize="sm"
                    borderRadius="md"
                    px={3}
                    py={1}
                    fontWeight="semibold"
                  >
                    {isFullMatch ? 'Ready' : `Missing ${missingIngredients.length}`}
                  </Badge>
                </WrapItem>
                <WrapItem>
                  <Badge bg="#8b5cf6" color="white" fontSize="sm" borderRadius="md" px={3} py={1} fontWeight="semibold">
                    {currentCocktail.category}
                  </Badge>
                </WrapItem>
                <WrapItem>
                  <Badge bg="#6366f1" color="white" fontSize="sm" borderRadius="md" px={3} py={1} fontWeight="semibold">
                    {currentCocktail.glass}
                  </Badge>
                </WrapItem>
                {currentCocktail.tags.map((tag) => (
                  <WrapItem key={tag}>
                    <Badge bg="#0ea5e9" color="white" fontSize="sm" borderRadius="md" px={3} py={1} fontWeight="semibold">
                      {tag}
                    </Badge>
                  </WrapItem>
                ))}
              </Wrap>

              <Divider borderColor="whiteAlpha.100" />

              {/* Instructions */}
              <Box>
                <Text fontWeight="semibold" mb={2} color="gray.100">
                  Instructions
                </Text>
                <Box
                  bg="whiteAlpha.50"
                  p={4}
                  borderRadius="xl"
                >
                  <Text color="gray.300" whiteSpace="pre-wrap" fontSize="sm">
                    {currentCocktail.instructions}
                  </Text>
                </Box>
              </Box>

              <Divider borderColor="whiteAlpha.100" />

              {/* Notes */}
              <Box>
                <Text fontWeight="semibold" mb={2} color="gray.100">
                  My Notes
                </Text>
                <Textarea
                  value={note}
                  onChange={(e) => setCocktailNote(cocktail.id, e.target.value)}
                  placeholder="Add your personal notes about this cocktail..."
                  size="sm"
                  resize="vertical"
                  minH="120px"
                  bg="gray.800"
                  border="none"
                  borderRadius="xl"
                  color="gray.100"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{
                    bg: 'gray.800',
                    boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                  }}
                />
              </Box>
            </VStack>
          </Flex>
        </ModalBody>
      </ModalContent>

      {/* Edit Modal */}
      <CreateDrinkModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editCocktail={currentCocktail}
      />
    </Modal>
  );
}
