import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Cocktail } from '@/types';

// Typical home bar ingredients for testing
const DEFAULT_INGREDIENTS = [
  // Spirits
  'Vodka',
  'Gin',
  'Light Rum',
  'Tequila',
  'Bourbon',
  'Triple Sec',
  // Mixers
  'Orange Juice',
  'Cranberry Juice',
  'Lime Juice',
  'Lemon Juice',
  'Tonic Water',
  'Soda Water',
  'Cola',
  'Ginger Ale',
  // Sweeteners & Syrups
  'Sugar',
  'Simple Syrup',
  'Grenadine',
  // Bitters & Vermouth
  'Angostura Bitters',
  'Sweet Vermouth',
  'Dry Vermouth',
  // Fresh ingredients
  'Lime',
  'Lemon',
  'Orange',
  'Mint',
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      myIngredients: DEFAULT_INGREDIENTS,
      cachedCocktails: {},
      slideShowSettings: {
        interval: 8,
      },

      addIngredient: (ingredient: string) =>
        set((state) => {
          const normalized = ingredient.trim();
          if (
            state.myIngredients
              .map((i) => i.toLowerCase())
              .includes(normalized.toLowerCase())
          ) {
            return state;
          }
          return {
            myIngredients: [...state.myIngredients, normalized].sort((a, b) =>
              a.toLowerCase().localeCompare(b.toLowerCase())
            ),
          };
        }),

      removeIngredient: (ingredient: string) =>
        set((state) => ({
          myIngredients: state.myIngredients.filter(
            (i) => i.toLowerCase() !== ingredient.toLowerCase()
          ),
        })),

      cacheCocktail: (cocktail: Cocktail) =>
        set((state) => ({
          cachedCocktails: {
            ...state.cachedCocktails,
            [cocktail.id]: cocktail,
          },
        })),

      setSlideShowInterval: (interval: number) =>
        set((state) => ({
          slideShowSettings: {
            ...state.slideShowSettings,
            interval,
          },
        })),

      clearIngredients: () =>
        set(() => ({
          myIngredients: [],
        })),

      loadDefaultIngredients: () =>
        set(() => ({
          myIngredients: [...DEFAULT_INGREDIENTS].sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
          ),
        })),
    }),
    {
      name: 'cocktail-showcase-storage',
    }
  )
);
