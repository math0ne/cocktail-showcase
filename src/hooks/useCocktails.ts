'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAllCocktails } from '@/lib/api';
import { matchCocktails, sortByMatch } from '@/lib/matching';
import { useStore } from '@/store/useStore';
import type { Cocktail, CocktailMatch } from '@/types';

// Cache that survives HMR by attaching to window in development
interface CocktailCache {
  cocktails: Cocktail[] | null;
  promise: Promise<Cocktail[]> | null;
}

function getCache(): CocktailCache {
  if (typeof window !== 'undefined') {
    // Use window object to survive HMR in development
    const w = window as Window & { __cocktailCache?: CocktailCache };
    if (!w.__cocktailCache) {
      w.__cocktailCache = { cocktails: null, promise: null };
    }
    return w.__cocktailCache;
  }
  // Server-side fallback
  return { cocktails: null, promise: null };
}

async function getAllCocktails(): Promise<Cocktail[]> {
  const cache = getCache();

  if (cache.cocktails) return cache.cocktails;
  if (cache.promise) return cache.promise;

  cache.promise = fetchAllCocktails().then(cocktails => {
    cache.cocktails = cocktails;
    return cocktails;
  });

  return cache.promise;
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
