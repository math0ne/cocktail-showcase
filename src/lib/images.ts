// Ingredient image URLs from TheCocktailDB
const INGREDIENT_IMAGE_BASE = 'https://www.thecocktaildb.com/images/ingredients';

export type IngredientImageSize = 'Small' | 'Medium' | 'Large';

export function getIngredientImageUrl(
  ingredientName: string,
  size: IngredientImageSize = 'Medium'
): string {
  const encodedName = encodeURIComponent(ingredientName);
  if (size === 'Large') {
    return `${INGREDIENT_IMAGE_BASE}/${encodedName}.png`;
  }
  return `${INGREDIENT_IMAGE_BASE}/${encodedName}-${size}.png`;
}
