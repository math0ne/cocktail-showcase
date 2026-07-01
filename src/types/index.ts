// API Response Types
export interface IngredientListResponse {
  drinks: { strIngredient1: string }[];
}

export interface CocktailFilterResponse {
  drinks: { strDrink: string; strDrinkThumb: string; idDrink: string }[] | null;
}

export interface CocktailLookupResponse {
  drinks: RawCocktail[] | null;
}

export interface RawCocktail {
  idDrink: string;
  strDrink: string;
  strDrinkAlternate: string | null;
  strTags: string | null;
  strVideo: string | null;
  strCategory: string;
  strIBA: string | null;
  strAlcoholic: string;
  strGlass: string;
  strInstructions: string;
  strDrinkThumb: string;
  strIngredient1: string | null;
  strIngredient2: string | null;
  strIngredient3: string | null;
  strIngredient4: string | null;
  strIngredient5: string | null;
  strIngredient6: string | null;
  strIngredient7: string | null;
  strIngredient8: string | null;
  strIngredient9: string | null;
  strIngredient10: string | null;
  strIngredient11: string | null;
  strIngredient12: string | null;
  strIngredient13: string | null;
  strIngredient14: string | null;
  strIngredient15: string | null;
  strMeasure1: string | null;
  strMeasure2: string | null;
  strMeasure3: string | null;
  strMeasure4: string | null;
  strMeasure5: string | null;
  strMeasure6: string | null;
  strMeasure7: string | null;
  strMeasure8: string | null;
  strMeasure9: string | null;
  strMeasure10: string | null;
  strMeasure11: string | null;
  strMeasure12: string | null;
  strMeasure13: string | null;
  strMeasure14: string | null;
  strMeasure15: string | null;
}

// App Types
export interface Ingredient {
  name: string;
  measure: string;
}

export interface Cocktail {
  id: string;
  name: string;
  category: string;
  alcoholic: string;
  glass: string;
  instructions: string;
  thumbnail: string;
  ingredients: Ingredient[];
}

export interface CocktailMatch {
  cocktail: Cocktail;
  matchedIngredients: string[];
  missingIngredients: string[];
  isFullMatch: boolean;
}

export interface SlideShowSettings {
  interval: number; // seconds between slides
}

export interface AppState {
  myIngredients: string[];
  cachedCocktails: Record<string, Cocktail>;
  slideShowSettings: SlideShowSettings;
  addIngredient: (ingredient: string) => void;
  removeIngredient: (ingredient: string) => void;
  cacheCocktail: (cocktail: Cocktail) => void;
  setSlideShowInterval: (interval: number) => void;
  clearIngredients: () => void;
  loadDefaultIngredients: () => void;
}
