'use client';

import { useState, useEffect } from 'react';
import { getImageUrl, getCocktailImageKey, getIngredientImageKey } from '@/lib/imageStore';

// Hook to load an image from IndexedDB
export function useStoredImage(imageKey: string | null) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!imageKey) {
      setImageUrl(null);
      return;
    }

    // Capture the non-null value for the async function
    const key = imageKey;
    let cancelled = false;

    async function loadImage() {
      setLoading(true);
      setError(null);

      try {
        const url = await getImageUrl(key);
        if (!cancelled) {
          setImageUrl(url);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load image'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [imageKey]);

  return { imageUrl, loading, error };
}

// Hook specifically for cocktail images
export function useCocktailImage(cocktailId: string, fallbackUrl?: string) {
  const isCustom = cocktailId.startsWith('custom-');
  const imageKey = isCustom ? getCocktailImageKey(cocktailId) : null;
  const { imageUrl: storedUrl, loading } = useStoredImage(imageKey);

  // For custom cocktails, use stored image or null
  // For regular cocktails, use the fallback URL
  const finalUrl = isCustom ? storedUrl : fallbackUrl;

  return { imageUrl: finalUrl, loading, isCustom };
}

// Hook for ingredient images - checks IndexedDB first, falls back to external URL
export function useIngredientImage(ingredientName: string, fallbackUrl?: string) {
  const imageKey = getIngredientImageKey(ingredientName);
  const { imageUrl: storedUrl, loading } = useStoredImage(imageKey);

  // Use stored image if available, otherwise use fallback URL
  const finalUrl = storedUrl || fallbackUrl;

  return { imageUrl: finalUrl, loading, hasCustomImage: !!storedUrl };
}
