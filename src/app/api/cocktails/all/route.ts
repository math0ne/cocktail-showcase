import { NextResponse } from 'next/server';

const BASE_URL = 'https://www.thecocktaildb.com/api/json/v1/1';

interface RawCocktail {
  idDrink: string;
  strDrink: string;
  strCategory: string;
  strAlcoholic: string;
  strGlass: string;
  strInstructions: string;
  strDrinkThumb: string;
  [key: string]: string | null;
}

interface Ingredient {
  name: string;
  measure: string;
}

interface Cocktail {
  id: string;
  name: string;
  category: string;
  alcoholic: string;
  glass: string;
  instructions: string;
  thumbnail: string;
  ingredients: Ingredient[];
}

function parseCocktail(raw: RawCocktail): Cocktail {
  const ingredients: Ingredient[] = [];

  for (let i = 1; i <= 15; i++) {
    const ingredient = raw[`strIngredient${i}`];
    const measure = raw[`strMeasure${i}`];

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

async function fetchCocktailsByLetter(letter: string): Promise<Cocktail[]> {
  const response = await fetch(`${BASE_URL}/search.php?f=${letter}`);
  const data = await response.json();
  if (!data.drinks) return [];
  return data.drinks.map(parseCocktail);
}

export async function GET() {
  try {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const results = await Promise.all(
      letters.map((letter) => fetchCocktailsByLetter(letter))
    );
    const cocktails = results.flat();

    return NextResponse.json({ cocktails });
  } catch (error) {
    console.error('Failed to fetch all cocktails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cocktails' },
      { status: 500 }
    );
  }
}
