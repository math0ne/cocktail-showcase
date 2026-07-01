'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAllCocktails } from '@/lib/api';
import { matchCocktails, sortByMatch } from '@/lib/matching';
import { useStore } from '@/store/useStore';
import type { Cocktail, CocktailMatch } from '@/types';

// Cache all cocktails in memory to avoid repeated fetches
let cocktailsCache: Cocktail[] | null = null;
let cachePromise: Promise<Cocktail[]> | null = null;

async function getAllCocktails(): Promise<Cocktail[]> {
  if (cocktailsCache) return cocktailsCache;
  if (cachePromise) return cachePromise;

  cachePromise = fetchAllCocktails().then(cocktails => {
    cocktailsCache = cocktails;
    return cocktails;
  });

  return cachePromise;
}

export function useCocktails(browseAll: boolean = false) {
  const myIngredients = useStore((state) => state.myIngredients);

  const [matches, setMatches] = useState<CocktailMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadCocktails = useCallback(async () => {
    // In "My Matches" mode with no ingredients, show nothing
    if (!browseAll && myIngredients.length === 0) {
      setMatches([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Always fetch all cocktails and filter locally
      // The filter.php API is limited on the free tier
      const allCocktails = await getAllCocktails();

      // Match and sort cocktails
      const matched = matchCocktails(allCocktails, myIngredients);

      let filtered: CocktailMatch[];
      if (browseAll) {
        // Show all cocktails
        filtered = matched;
      } else {
        // Only show cocktails with at least one matching ingredient
        filtered = matched.filter(m => m.matchedIngredients.length > 0);
      }

      const sorted = sortByMatch(filtered);
      setMatches(sorted);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load cocktails'));
    } finally {
      setLoading(false);
    }
  }, [myIngredients, browseAll]);

  useEffect(() => {
    loadCocktails();
  }, [loadCocktails]);

  const fullMatches = useMemo(
    () => matches.filter((m) => m.isFullMatch),
    [matches]
  );
  const partialMatches = useMemo(
    () => matches.filter((m) => !m.isFullMatch),
    [matches]
  );

  return {
    matches,
    fullMatches,
    partialMatches,
    loading,
    error,
    refresh: loadCocktails,
  };
}
