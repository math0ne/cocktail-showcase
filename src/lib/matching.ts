import type { Cocktail, CocktailMatch } from '@/types';

function normalizeIngredient(ingredient: string): string {
  return ingredient.toLowerCase().trim();
}

export function matchCocktails(
  cocktails: Cocktail[],
  userIngredients: string[]
): CocktailMatch[] {
  const normalizedUserIngredients = new Set(
    userIngredients.map(normalizeIngredient)
  );

  return cocktails.map((cocktail) => {
    const matchedIngredients: string[] = [];
    const missingIngredients: string[] = [];

    for (const ingredient of cocktail.ingredients) {
      const normalizedName = normalizeIngredient(ingredient.name);
      if (normalizedUserIngredients.has(normalizedName)) {
        matchedIngredients.push(ingredient.name); // Keep original casing
      } else {
        missingIngredients.push(ingredient.name); // Keep original casing
      }
    }

    return {
      cocktail,
      matchedIngredients,
      missingIngredients,
      isFullMatch: missingIngredients.length === 0,
    };
  });
}

export function sortByMatch(matches: CocktailMatch[]): CocktailMatch[] {
  return [...matches].sort((a, b) => {
    // Full matches first
    if (a.isFullMatch && !b.isFullMatch) return -1;
    if (!a.isFullMatch && b.isFullMatch) return 1;

    // Then by fewer missing ingredients
    if (a.missingIngredients.length !== b.missingIngredients.length) {
      return a.missingIngredients.length - b.missingIngredients.length;
    }

    // Then by more matched ingredients
    if (a.matchedIngredients.length !== b.matchedIngredients.length) {
      return b.matchedIngredients.length - a.matchedIngredients.length;
    }

    // Finally alphabetically
    return a.cocktail.name.localeCompare(b.cocktail.name);
  });
}
