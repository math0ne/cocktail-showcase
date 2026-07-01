/**
 * Script to fetch all cocktails from TheCocktailDB and cache locally.
 * Run with: npx tsx scripts/fetch-cocktails.ts
 */

const BASE_URL = 'https://www.thecocktaildb.com/api/json/v2/961249867';

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
  tags: string[];
  iba: string | null;
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

  // Parse tags from comma-separated string
  const tags: string[] = raw.strTags
    ? raw.strTags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : [];

  return {
    id: raw.idDrink,
    name: raw.strDrink,
    category: raw.strCategory,
    alcoholic: raw.strAlcoholic,
    glass: raw.strGlass,
    instructions: raw.strInstructions,
    thumbnail: raw.strDrinkThumb,
    ingredients,
    tags,
    iba: raw.strIBA || null,
  };
}

async function fetchCocktailsByLetter(letter: string, retries = 3): Promise<Cocktail[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}/search.php?f=${letter}`);
      const text = await response.text();
      if (!text || text.trim() === '') {
        return [];
      }
      const data = JSON.parse(text);
      if (!data.drinks) return [];
      return data.drinks.map(parseCocktail);
    } catch (err) {
      if (attempt === retries) {
        console.error(`\n  Failed to fetch letter ${letter} after ${retries} attempts`);
        return [];
      }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  return [];
}

async function fetchAllCocktails(): Promise<Cocktail[]> {
  const letters = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
  const results: Cocktail[] = [];

  console.log('Fetching cocktails...');

  for (const letter of letters) {
    process.stdout.write(`  Fetching letter ${letter}...`);
    const cocktails = await fetchCocktailsByLetter(letter);
    results.push(...cocktails);
    console.log(` ${cocktails.length} cocktails`);
    // Small delay to be nice to the API
    await new Promise((r) => setTimeout(r, 100));
  }

  return results;
}

async function fetchAllIngredients(retries = 3): Promise<string[]> {
  console.log('Fetching ingredients...');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}/list.php?i=list`);
      const text = await response.text();
      if (!text || text.trim() === '') {
        return [];
      }
      const data = JSON.parse(text);
      if (!data.drinks) return [];

      const ingredients = data.drinks
        .map((d: { strIngredient1: string }) => d.strIngredient1)
        .filter(Boolean)
        .sort((a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase()));

      console.log(`  Found ${ingredients.length} ingredients`);
      return ingredients;
    } catch (err) {
      if (attempt === retries) {
        console.error(`  Failed to fetch ingredients after ${retries} attempts`);
        return [];
      }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  return [];
}

async function main() {
  const fs = await import('fs');
  const path = await import('path');

  // Fetch cocktails
  const cocktails = await fetchAllCocktails();
  cocktails.sort((a, b) => a.name.localeCompare(b.name));

  // Fetch ingredients
  const ingredients = await fetchAllIngredients();

  const outputDir = path.join(process.cwd(), 'public', 'data');
  fs.mkdirSync(outputDir, { recursive: true });

  // Save cocktails
  const cocktailsData = {
    fetchedAt: new Date().toISOString(),
    count: cocktails.length,
    cocktails,
  };
  const cocktailsPath = path.join(outputDir, 'cocktails.json');
  fs.writeFileSync(cocktailsPath, JSON.stringify(cocktailsData, null, 2));
  console.log(`\nSaved ${cocktails.length} cocktails to ${cocktailsPath}`);

  // Save ingredients
  const ingredientsData = {
    fetchedAt: new Date().toISOString(),
    count: ingredients.length,
    ingredients,
  };
  const ingredientsPath = path.join(outputDir, 'ingredients.json');
  fs.writeFileSync(ingredientsPath, JSON.stringify(ingredientsData, null, 2));
  console.log(`Saved ${ingredients.length} ingredients to ${ingredientsPath}`);

  console.log(`\nTotal Drinks: ${cocktails.length}`);
  console.log(`Total Ingredients: ${ingredients.length}`);
}

main().catch(console.error);
