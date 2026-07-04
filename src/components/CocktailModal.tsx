'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { keyframes } from '@emotion/react';
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
import { CheckCircleIcon, WarningIcon, EditIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useStore } from '@/store/useStore';
import { CocktailImage } from './CocktailImage';
import { CreateDrinkModal } from './CreateDrinkModal';
import { StarRating } from './StarRating';
import type { CocktailMatch } from '@/types';

// Subtle bounce for the "more content below" scroll hint.
const scrollHintBounce = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.65; }
  50% { transform: translateY(4px); opacity: 1; }
`;

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

// Shopping cart icon
const ShoppingCartIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

export function CocktailModal({ match, isOpen, onClose, portalContainerRef }: CocktailModalProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addedToList, setAddedToList] = useState(false);

  // Scroll hint: show a fade + chevron while the modal body has more below.
  const bodyRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const updateScrollHint = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return;
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollHint(remaining > 12);
  }, []);

  // Reset addedToList when modal opens with a different cocktail
  useEffect(() => {
    if (isOpen) {
      setAddedToList(false);
    }
  }, [isOpen, match?.cocktail.id]);

  // Recompute the scroll hint on open / content change (images can shift height).
  useEffect(() => {
    if (!isOpen) {
      setShowScrollHint(false);
      return;
    }
    const timers = [0, 150, 400, 800].map((t) => setTimeout(updateScrollHint, t));
    window.addEventListener('resize', updateScrollHint);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('resize', updateScrollHint);
    };
  }, [isOpen, match?.cocktail.id, updateScrollHint]);

  const triedCocktails = useStore((state) => state.triedCocktails);
  const heartedCocktails = useStore((state) => state.heartedCocktails);
  const cocktailNotes = useStore((state) => state.cocktailNotes);
  const cocktailRatings = useStore((state) => state.cocktailRatings);
  const customCocktails = useStore((state) => state.customCocktails);
  const shoppingList = useStore((state) => state.shoppingList);
  const toggleTried = useStore((state) => state.toggleTried);
  const toggleHearted = useStore((state) => state.toggleHearted);
  const setCocktailNote = useStore((state) => state.setCocktailNote);
  const setCocktailRating = useStore((state) => state.setCocktailRating);
  const addMultipleToShoppingList = useStore((state) => state.addMultipleToShoppingList);

  if (!match) return null;

  const { cocktail, isFullMatch, missingIngredients } = match;
  const isTried = triedCocktails.includes(cocktail.id);
  const isHearted = heartedCocktails.includes(cocktail.id);
  const note = cocktailNotes[cocktail.id] || '';
  const rating = cocktailRatings[cocktail.id] || 0;
  const missingLower = missingIngredients.map((m) => m.toLowerCase());

  // Check how many missing ingredients are not yet in shopping list
  const shoppingListLower = shoppingList.map((s) => s.toLowerCase());
  const missingNotInList = missingIngredients.filter(
    (ing) => !shoppingListLower.includes(ing.toLowerCase())
  );
  const allMissingInList = missingNotInList.length === 0 && missingIngredients.length > 0;

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
      autoFocus={false}
      portalProps={portalContainerRef ? { containerRef: portalContainerRef } : undefined}
    >
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(8px)" />
      <ModalContent bg="#18181b" mx={4} borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
        <ModalHeader pr={26} color="gray.100">
          {currentCocktail.name}
        </ModalHeader>
        <IconButton
          aria-label="Edit drink"
          icon={<EditIcon boxSize={4} />}
          position="absolute"
          top={2}
          right={14}
          size="lg"
          variant="ghost"
          color="gray.400"
          _hover={{ color: 'purple.400', bg: 'whiteAlpha.100' }}
          onClick={() => setIsEditModalOpen(true)}
        />
        <ModalCloseButton color="gray.400" top={2} />
        <ModalBody pb={6} ref={bodyRef} onScroll={updateScrollHint}>
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
                    const isInShoppingList = shoppingListLower.includes(ing.name.toLowerCase());
                    return (
                      <ListItem
                        key={`${ing.name}-${index}`}
                        display="flex"
                        alignItems="center"
                        color={isMissing ? (isInShoppingList ? '#f59e0b' : '#ef4444') : 'gray.100'}
                        fontSize="sm"
                      >
                        <ListIcon
                          as={isMissing ? WarningIcon : CheckCircleIcon}
                          color={isMissing ? (isInShoppingList ? '#f59e0b' : '#ef4444') : '#10b981'}
                        />
                        <Text flex={1}>
                          {ing.measure && <Text as="span" fontWeight="medium">{ing.measure} </Text>}
                          {ing.name}
                        </Text>
                        {isMissing && isInShoppingList && (
                          <Badge bg="#f59e0b" color="white" fontSize="2xs" borderRadius="md" ml={1}>
                            In List
                          </Badge>
                        )}
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            </VStack>

            {/* Right Column - Actions, Tags, Instructions & Notes */}
            <VStack spacing={4} flex={1} align="stretch">
              {/* Action buttons */}
              <HStack spacing={2} w="100%" flexWrap="wrap">
                <Button
                  size="sm"
                  flex={1}
                  minW="80px"
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
                  minW="80px"
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
                {missingIngredients.length > 0 && (
                  <Button
                    size="sm"
                    flex={1}
                    minW="120px"
                    leftIcon={<Box as="span"><ShoppingCartIcon /></Box>}
                    bg={allMissingInList || addedToList ? '#10b981' : '#f59e0b'}
                    color="white"
                    border="1px solid"
                    borderColor={allMissingInList || addedToList ? '#10b981' : '#f59e0b'}
                    _hover={{ bg: allMissingInList || addedToList ? '#059669' : '#d97706' }}
                    onClick={() => {
                      addMultipleToShoppingList(missingIngredients);
                      setAddedToList(true);
                    }}
                    borderRadius="xl"
                    isDisabled={allMissingInList || addedToList}
                  >
                    {allMissingInList || addedToList ? (
                      'In List'
                    ) : (
                      <>
                        Add {missingNotInList.length}
                        <Box as="span" display={{ base: 'none', md: 'inline' }}>&nbsp;Missing</Box>
                      </>
                    )}
                  </Button>
                )}
              </HStack>

              {/* Rating */}
              <HStack spacing={3} align="center">
                <Text fontSize="sm" color="gray.400" fontWeight="medium">
                  Your rating
                </Text>
                <StarRating
                  value={rating}
                  onChange={(r) => setCocktailRating(cocktail.id, r)}
                  size={6}
                  spacing={1}
                />
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

        {/* Scroll hint (mobile) — fades in while there's more content below */}
        <Box
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          h="60px"
          borderBottomRadius="2xl"
          pointerEvents="none"
          display={{ base: 'flex', md: 'none' }}
          alignItems="flex-end"
          justifyContent="center"
          pb={2}
          bgGradient="linear(to-t, #18181b 35%, transparent)"
          opacity={showScrollHint ? 1 : 0}
          transition="opacity 0.2s ease"
          zIndex={2}
        >
          <ChevronDownIcon
            boxSize={6}
            color="whiteAlpha.800"
            animation={`${scrollHintBounce} 1.4s ease-in-out infinite`}
          />
        </Box>
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
