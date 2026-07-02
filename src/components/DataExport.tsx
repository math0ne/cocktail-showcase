'use client';

import { useRef } from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  useToast,
  Heading,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import { useStore } from '@/store/useStore';

interface ExportData {
  version: number;
  exportedAt: string;
  myIngredients: string[];
  shoppingList: string[];
  customCocktails: any[];
  triedCocktails: string[];
  heartedCocktails: string[];
  cocktailNotes: Record<string, string>;
  slideShowSettings: any;
}

export function DataExport() {
  const myIngredients = useStore((state) => state.myIngredients);
  const shoppingList = useStore((state) => state.shoppingList);
  const customCocktails = useStore((state) => state.customCocktails);
  const triedCocktails = useStore((state) => state.triedCocktails);
  const heartedCocktails = useStore((state) => state.heartedCocktails);
  const cocktailNotes = useStore((state) => state.cocktailNotes);
  const slideShowSettings = useStore((state) => state.slideShowSettings);

  const setIngredients = useStore((state) => state.setIngredients);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Get setters from store - we need to access the store directly for bulk import
  const store = useStore;

  const handleExport = () => {
    const exportData: ExportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      myIngredients,
      shoppingList,
      customCocktails,
      triedCocktails,
      heartedCocktails,
      cocktailNotes,
      slideShowSettings,
    };

    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cocktail-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'Data Exported',
      description: `Exported ${myIngredients.length} ingredients, ${customCocktails.length} custom drinks, and more`,
      status: 'success',
      duration: 3000,
    });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as ExportData;

        // Validate structure
        if (!imported.version || !imported.myIngredients) {
          // Try legacy format (just ingredients array)
          if (Array.isArray(imported) && imported.every(i => typeof i === 'string')) {
            setIngredients(imported);
            toast({
              title: 'Imported',
              description: `${imported.length} ingredients imported (legacy format)`,
              status: 'success',
              duration: 2000,
            });
            return;
          }
          throw new Error('Invalid format');
        }

        // Import all data using store.setState
        store.setState({
          myIngredients: imported.myIngredients || [],
          shoppingList: imported.shoppingList || [],
          customCocktails: imported.customCocktails || [],
          triedCocktails: imported.triedCocktails || [],
          heartedCocktails: imported.heartedCocktails || [],
          cocktailNotes: imported.cocktailNotes || {},
          ...(imported.slideShowSettings && { slideShowSettings: imported.slideShowSettings }),
        });

        toast({
          title: 'Data Imported',
          description: `Imported ${imported.myIngredients?.length || 0} ingredients, ${imported.customCocktails?.length || 0} custom drinks`,
          status: 'success',
          duration: 3000,
        });
      } catch (err) {
        toast({
          title: 'Import failed',
          description: 'Invalid file format',
          status: 'error',
          duration: 3000,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const stats = [
    { label: 'Ingredients', count: myIngredients.length },
    { label: 'Shopping List', count: shoppingList.length },
    { label: 'Custom Drinks', count: customCocktails.length },
    { label: 'Tried', count: triedCocktails.length },
    { label: 'Favorites', count: heartedCocktails.length },
  ].filter(s => s.count > 0);

  return (
    <Box>
      <Heading size="md" mb={4} color="gray.100">
        Data Backup
      </Heading>

      {stats.length > 0 && (
        <Text color="gray.400" fontSize="sm" mb={4}>
          {stats.map(s => `${s.count} ${s.label.toLowerCase()}`).join(', ')}
        </Text>
      )}

      <HStack spacing={2}>
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
          Export All Data
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
          Import Data
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleImport}
        />
      </HStack>
    </Box>
  );
}
