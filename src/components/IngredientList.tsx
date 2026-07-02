'use client';

import { useRef } from 'react';
import {
  Box,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
  Button,
  Wrap,
  WrapItem,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { useStore } from '@/store/useStore';
import { ShoppingList } from './ShoppingList';

export function IngredientList() {
  const myIngredients = useStore((state) => state.myIngredients);
  const removeIngredient = useStore((state) => state.removeIngredient);
  const loadDefaultIngredients = useStore((state) => state.loadDefaultIngredients);
  const setIngredients = useStore((state) => state.setIngredients);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleExport = () => {
    const data = JSON.stringify(myIngredients, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-bar-ingredients.json';
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Exported',
      description: `${myIngredients.length} ingredients exported`,
      status: 'success',
      duration: 2000,
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported) && imported.every(i => typeof i === 'string')) {
          setIngredients(imported);
          toast({
            title: 'Imported',
            description: `${imported.length} ingredients imported`,
            status: 'success',
            duration: 2000,
          });
        } else {
          throw new Error('Invalid format');
        }
      } catch {
        toast({
          title: 'Import failed',
          description: 'Invalid file format',
          status: 'error',
          duration: 3000,
        });
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be imported again
    e.target.value = '';
  };

  if (myIngredients.length === 0) {
    return (
      <Box
        p={6}
        textAlign="center"
        border="2px dashed"
        borderColor="whiteAlpha.200"
        borderRadius="xl"
      >
        <Text color="gray.400" mb={4}>
          No ingredients added yet. Search and add ingredients above.
        </Text>
        <Button
          size="sm"
          bgGradient="linear(to-r, purple.600, purple.500)"
          color="white"
          _hover={{ bgGradient: 'linear(to-r, purple.500, purple.400)' }}
          onClick={loadDefaultIngredients}
          borderRadius="xl"
        >
          Load Default Bar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Wrap spacing={2} overflow="visible">
        {myIngredients.map((ingredient) => (
          <WrapItem key={ingredient}>
            <Tag
              size="md"
              bg="purple.500"
              color="white"
              borderRadius="full"
              fontWeight="medium"
              px={3}
              py={1}
            >
              <TagLabel>{ingredient}</TagLabel>
              <TagCloseButton onClick={() => removeIngredient(ingredient)} />
            </Tag>
          </WrapItem>
        ))}
      </Wrap>

      <HStack mt={4} spacing={2}>
        <Button
          size="sm"
          variant="outline"
          borderColor="whiteAlpha.200"
          color="gray.100"
          _hover={{ bg: 'whiteAlpha.100' }}
          leftIcon={<DownloadIcon />}
          onClick={handleExport}
          borderRadius="xl"
        >
          Export
        </Button>
        <Button
          size="sm"
          variant="outline"
          borderColor="whiteAlpha.200"
          color="gray.100"
          _hover={{ bg: 'whiteAlpha.100' }}
          onClick={() => fileInputRef.current?.click()}
          borderRadius="xl"
        >
          Import
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </HStack>

      <ShoppingList />
    </Box>
  );
}
