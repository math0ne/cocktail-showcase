import axios from 'axios';
import type {
  IngredientListResponse,
  CocktailFilterResponse,
  CocktailLookupResponse,
  Cocktail,
  Ingredient,
  RawCocktail,
} from '@/types';

const BASE_URL = 'https://www.thecocktaildb.com/api/json/v1/1';

const api = axios.create({
  baseURL: BASE_URL,
});

function parseCocktail(raw: RawCocktail): Cocktail {
  const ingredients: Ingredient[] = [];

  for (let i = 1; i <= 15; i++) {
    const ingredientKey = `strIngredient${i}` as keyof RawCocktail;
    const measureKey = `strMeasure${i}` as keyof RawCocktail;
    const ingredient = raw[ingredientKey] as string | null;
    const measure = raw[measureKey] as string | null;

    if (ingredient && ingredient.trim()) {
      ingredients.push({
        name: ingredient.trim(),
        measure: measure?.trim() || '',
      });
    }
  }

  return {
    id: raw.idDrink,
    name: raw.strDrink,
    category: raw.strCategory,
    alcoholic: raw.strAlcoholic,
    glass: raw.strGlass,
    instructions: raw.strInstructions,
    thumbnail: raw.strDrinkThumb,
    ingredients,
  };
}

export async function fetchAllCocktails(): Promise<Cocktail[]> {
  // Use locally cached cocktails data
  const response = await fetch('/data/cocktails.json');
  if (!response.ok) {
    throw new Error('Failed to fetch cocktails data');
  }
  const data = await response.json();
  return data.cocktails;
}

export async function fetchAllIngredients(): Promise<string[]> {
  // Use locally cached ingredients data
  const response = await fetch('/data/ingredients.json');
  if (!response.ok) {
    throw new Error('Failed to fetch ingredients data');
  }
  const data = await response.json();
  return data.ingredients;
}

export async function fetchCocktailsByIngredient(
  ingredient: string
): Promise<{ id: string; name: string; thumbnail: string }[]> {
  const response = await api.get<CocktailFilterResponse>(
    `/filter.php?i=${encodeURIComponent(ingredient)}`
  );
  if (!response.data.drinks) return [];
  return response.data.drinks.map((d) => ({
    id: d.idDrink,
    name: d.strDrink,
    thumbnail: d.strDrinkThumb,
  }));
}

export async function fetchCocktailById(id: string): Promise<Cocktail | null> {
  const response = await api.get<CocktailLookupResponse>(`/lookup.php?i=${id}`);
  if (!response.data.drinks || response.data.drinks.length === 0) return null;
  return parseCocktail(response.data.drinks[0]);
}
