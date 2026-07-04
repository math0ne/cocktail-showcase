'use client';

import React, { useState, useRef } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Box,
  Text,
  IconButton,
  FormControl,
  FormLabel,
  Image,
  Center,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, SmallAddIcon } from '@chakra-ui/icons';
import { useStore } from '@/store/useStore';
import { saveImage, processImageFile, getCocktailImageKey } from '@/lib/imageStore';
import type { Ingredient, Cocktail } from '@/types';

const CATEGORIES = [
  'Cocktail',
  'Ordinary Drink',
  'Shot',
  'Shake',
  'Beer',
  'Coffee / Tea',
  'Homemade Liqueur',
  'Punch / Party Drink',
  'Soft Drink',
  'Other / Unknown',
];

const GLASS_TYPES = [
  'Cocktail glass',
  'Highball glass',
  'Old-fashioned glass',
  'Collins glass',
  'Martini glass',
  'Margarita glass',
  'Shot glass',
  'Wine glass',
  'Beer mug',
  'Champagne flute',
  'Hurricane glass',
  'Copper Mug',
  'Mason jar',
  'Pint glass',
  'Coffee mug',
  'Other',
];

interface CreateDrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  editCocktail?: Cocktail | null;
}

export function CreateDrinkModal({ isOpen, onClose, editCocktail }: CreateDrinkModalProps) {
  const addCustomCocktail = useStore((state) => state.addCustomCocktail);
  const updateCustomCocktail = useStore((state) => state.updateCustomCocktail);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!editCocktail;
  const isCustomDrink = editCocktail?.id.startsWith('custom-') ?? false;
  // When editing a built-in drink, we create a custom copy
  const isCloneMode = isEditMode && !isCustomDrink;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cocktail');
  const [glass, setGlass] = useState('Cocktail glass');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', measure: '' },
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  React.useEffect(() => {
    if (editCocktail && isOpen) {
      setName(editCocktail.name);
      setCategory(editCocktail.category);
      setGlass(editCocktail.glass);
      setInstructions(editCocktail.instructions);
      setIngredients(editCocktail.ingredients.length > 0 ? editCocktail.ingredients : [{ name: '', measure: '' }]);
      // Filter out 'Custom' tag as it's auto-added
      setTags(editCocktail.tags.filter(t => t !== 'Custom'));
    }
  }, [editCocktail, isOpen]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', measure: '' }]);
  };

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleIngredientChange = (
    index: number,
    field: 'name' | 'measure',
    value: string
  ) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    const validIngredients = ingredients.filter((ing) => ing.name.trim());

    if (!name.trim() || validIngredients.length === 0) {
      return;
    }

    setSaving(true);

    try {
      // For clone mode (editing built-in drinks), always create a new custom drink
      const cocktailId = (isEditMode && isCustomDrink) ? editCocktail!.id : `custom-${Date.now()}`;

      // Save image to IndexedDB if provided
      if (imageFile) {
        try {
          const processedBlob = await processImageFile(imageFile);
          await saveImage(getCocktailImageKey(cocktailId), processedBlob);
        } catch (err) {
          console.error('Failed to save image:', err);
          // Continue adding cocktail even if image fails
        }
      }

      const cocktail: Cocktail = {
        id: cocktailId,
        name: name.trim(),
        category,
        alcoholic: 'Alcoholic',
        glass,
        instructions: instructions.trim(),
        thumbnail: '', // Custom cocktails use IndexedDB images
        ingredients: validIngredients.map((ing) => ({
          name: ing.name.trim(),
          measure: ing.measure.trim(),
        })),
        tags: ['Custom', ...tags],
        iba: null,
      };

      if (isEditMode && isCustomDrink) {
        // Update existing custom drink
        updateCustomCocktail(cocktail);
      } else {
        // Create new custom drink (either new or cloned from built-in)
        addCustomCocktail(cocktail);
      }
      handleClose();
    } catch (err) {
      console.error('Failed to save cocktail:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    setCategory('Cocktail');
    setGlass('Cocktail glass');
    setInstructions('');
    setIngredients([{ name: '', measure: '' }]);
    setTags([]);
    setTagInput('');
    handleRemoveImage();
    onClose();
  };

  const isValid =
    name.trim() && ingredients.some((ing) => ing.name.trim());

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" scrollBehavior="inside" autoFocus={false}>
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(8px)" />
      <ModalContent
        bg="#18181b"
        mx={4}
        borderRadius="2xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        <ModalHeader color="gray.100">
          {isCloneMode ? 'Create Custom Version' : isEditMode ? 'Edit Drink' : 'Create Custom Drink'}
        </ModalHeader>
        <ModalCloseButton color="gray.400" />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Image Upload */}
            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">
                Photo
              </FormLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              {imagePreview ? (
                <Box position="relative" w="100%" maxW="200px">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    w="100%"
                    aspectRatio="1"
                    objectFit="cover"
                    borderRadius="xl"
                  />
                  <IconButton
                    aria-label="Remove image"
                    icon={<DeleteIcon />}
                    size="sm"
                    position="absolute"
                    top={2}
                    right={2}
                    bg="blackAlpha.700"
                    color="white"
                    _hover={{ bg: 'red.600' }}
                    borderRadius="full"
                    onClick={handleRemoveImage}
                  />
                </Box>
              ) : (
                <Center
                  w="100%"
                  maxW="200px"
                  aspectRatio="1"
                  bg="gray.800"
                  borderRadius="xl"
                  border="2px dashed"
                  borderColor="gray.600"
                  cursor="pointer"
                  _hover={{ borderColor: 'purple.500', bg: 'gray.750' }}
                  onClick={() => fileInputRef.current?.click()}
                  transition="all 0.2s"
                >
                  <VStack spacing={2}>
                    <Text fontSize="3xl">📷</Text>
                    <Text color="gray.500" fontSize="sm">
                      Add photo
                    </Text>
                  </VStack>
                </Center>
              )}
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">
                Name
              </FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter drink name"
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
            </FormControl>

            <HStack spacing={4}>
              <FormControl flex={1}>
                <FormLabel color="gray.300" fontSize="sm">
                  Category
                </FormLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  bg="gray.800"
                  border="none"
                  borderRadius="xl"
                  color="gray.100"
                  _focus={{
                    boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                  }}
                  sx={{
                    '& option': {
                      bg: '#1a1a1a',
                      color: 'white',
                    },
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl flex={1}>
                <FormLabel color="gray.300" fontSize="sm">
                  Glass
                </FormLabel>
                <Select
                  value={glass}
                  onChange={(e) => setGlass(e.target.value)}
                  bg="gray.800"
                  border="none"
                  borderRadius="xl"
                  color="gray.100"
                  _focus={{
                    boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                  }}
                  sx={{
                    '& option': {
                      bg: '#1a1a1a',
                      color: 'white',
                    },
                  }}
                >
                  {GLASS_TYPES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">
                Instructions
              </FormLabel>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="How to make this drink..."
                bg="gray.800"
                border="none"
                borderRadius="xl"
                color="gray.100"
                minH="100px"
                _placeholder={{ color: 'gray.500' }}
                _focus={{
                  bg: 'gray.800',
                  boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                }}
              />
            </FormControl>

            <Box>
              <HStack justify="space-between" mb={2}>
                <Text color="gray.300" fontSize="sm" fontWeight="medium">
                  Ingredients
                </Text>
                <Button
                  size="xs"
                  leftIcon={<AddIcon boxSize={2} />}
                  bg="purple.600"
                  color="white"
                  _hover={{ bg: 'purple.500' }}
                  borderRadius="lg"
                  onClick={handleAddIngredient}
                >
                  Add
                </Button>
              </HStack>

              <VStack spacing={2} align="stretch">
                {ingredients.map((ing, index) => (
                  <HStack key={index} spacing={2}>
                    <Input
                      flex={2}
                      value={ing.name}
                      onChange={(e) =>
                        handleIngredientChange(index, 'name', e.target.value)
                      }
                      placeholder="Ingredient"
                      bg="gray.800"
                      border="none"
                      borderRadius="xl"
                      color="gray.100"
                      size="sm"
                      _placeholder={{ color: 'gray.500' }}
                      _focus={{
                        bg: 'gray.800',
                        boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                      }}
                    />
                    <Input
                      flex={1}
                      value={ing.measure}
                      onChange={(e) =>
                        handleIngredientChange(index, 'measure', e.target.value)
                      }
                      placeholder="Amount"
                      bg="gray.800"
                      border="none"
                      borderRadius="xl"
                      color="gray.100"
                      size="sm"
                      _placeholder={{ color: 'gray.500' }}
                      _focus={{
                        bg: 'gray.800',
                        boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                      }}
                    />
                    <IconButton
                      aria-label="Remove ingredient"
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      color="gray.500"
                      _hover={{ color: 'red.400', bg: 'whiteAlpha.100' }}
                      onClick={() => handleRemoveIngredient(index)}
                      isDisabled={ingredients.length === 1}
                    />
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Tags */}
            <Box>
              <Text color="gray.300" fontSize="sm" fontWeight="medium" mb={2}>
                Tags
              </Text>
              <HStack spacing={2} mb={2}>
                <Input
                  flex={1}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Add a tag..."
                  bg="gray.800"
                  border="none"
                  borderRadius="xl"
                  color="gray.100"
                  size="sm"
                  _placeholder={{ color: 'gray.500' }}
                  _focus={{
                    bg: 'gray.800',
                    boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                  }}
                />
                <IconButton
                  aria-label="Add tag"
                  icon={<SmallAddIcon />}
                  size="sm"
                  bg="purple.600"
                  color="white"
                  _hover={{ bg: 'purple.500' }}
                  borderRadius="lg"
                  onClick={handleAddTag}
                  isDisabled={!tagInput.trim()}
                />
              </HStack>
              {tags.length > 0 && (
                <Wrap spacing={2}>
                  {tags.map((tag) => (
                    <WrapItem key={tag}>
                      <Tag
                        size="md"
                        bg="purple.500"
                        color="white"
                        borderRadius="full"
                      >
                        <TagLabel>{tag}</TagLabel>
                        <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter gap={2}>
          <Button
            variant="ghost"
            color="gray.400"
            _hover={{ bg: 'whiteAlpha.100' }}
            onClick={handleClose}
            borderRadius="xl"
          >
            Cancel
          </Button>
          <Button
            bg="purple.600"
            color="white"
            _hover={{ bg: 'purple.500' }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
            onClick={handleSubmit}
            isDisabled={!isValid || saving}
            isLoading={saving}
            borderRadius="xl"
          >
            {isCloneMode ? 'Create Custom Version' : isEditMode ? 'Save Changes' : 'Create Drink'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
