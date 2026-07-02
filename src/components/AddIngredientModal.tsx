'use client';

import { useState, useRef, useEffect } from 'react';
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
  VStack,
  Box,
  Text,
  IconButton,
  FormControl,
  FormLabel,
  Image,
  Center,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useStore } from '@/store/useStore';
import { saveImage, processImageFile, getIngredientImageKey } from '@/lib/imageStore';

interface AddIngredientModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
}

export function AddIngredientModal({ isOpen, onClose, initialName = '' }: AddIngredientModalProps) {
  const addIngredient = useStore((state) => state.addIngredient);
  const myIngredients = useStore((state) => state.myIngredients);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const [name, setName] = useState(initialName);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Update name when initialName changes
  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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
    const trimmedName = name.trim();
    if (!trimmedName) return;

    // Check if already exists
    const exists = myIngredients.some(
      (i) => i.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      handleClose();
      return;
    }

    setSaving(true);

    try {
      // Save image to IndexedDB if provided
      if (imageFile) {
        try {
          const processedBlob = await processImageFile(imageFile);
          await saveImage(getIngredientImageKey(trimmedName), processedBlob);
        } catch (err) {
          console.error('Failed to save image:', err);
          // Continue adding ingredient even if image fails
        }
      }

      addIngredient(trimmedName);
      toast({
        title: 'Ingredient added',
        description: `"${trimmedName}" added to your bar`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      handleClose();
    } catch (err) {
      console.error('Failed to save ingredient:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setName('');
    handleRemoveImage();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSubmit();
    }
  };

  const isValid = name.trim().length > 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" isCentered>
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(8px)" />
      <ModalContent
        bg="#0d0d0d"
        mx={4}
        borderRadius="2xl"
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        <ModalHeader color="gray.100">Add Ingredient</ModalHeader>
        <ModalCloseButton color="gray.400" />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* Image Upload */}
            <FormControl>
              <FormLabel color="gray.300" fontSize="sm">
                Photo (optional)
              </FormLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
              {imagePreview ? (
                <Box position="relative" w="100%" maxW="150px">
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
                    size="xs"
                    position="absolute"
                    top={1}
                    right={1}
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
                  maxW="150px"
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
                  <VStack spacing={1}>
                    <Text fontSize="2xl">📷</Text>
                    <Text color="gray.500" fontSize="xs">
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
                onKeyDown={handleKeyDown}
                placeholder="Ingredient name"
                bg="gray.800"
                border="none"
                borderRadius="xl"
                color="gray.100"
                _placeholder={{ color: 'gray.500' }}
                _focus={{
                  bg: 'gray.800',
                  boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)',
                }}
                autoFocus
              />
            </FormControl>
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
            Add Ingredient
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
