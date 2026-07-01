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
        kenBurnsEnabled: true,
        filmGrainEnabled: true,
        retroFilterEnabled: false,
        transitionSpeed: 'normal' as const,
      },
      triedCocktails: [],
      heartedCocktails: [],
      cocktailNotes: {},

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

      setKenBurnsEnabled: (enabled: boolean) =>
        set((state) => ({
          slideShowSettings: {
            ...state.slideShowSettings,
            kenBurnsEnabled: enabled,
          },
        })),

      setFilmGrainEnabled: (enabled: boolean) =>
        set((state) => ({
          slideShowSettings: {
            ...state.slideShowSettings,
            filmGrainEnabled: enabled,
          },
        })),

      setRetroFilterEnabled: (enabled: boolean) =>
        set((state) => ({
          slideShowSettings: {
            ...state.slideShowSettings,
            retroFilterEnabled: enabled,
          },
        })),

      setTransitionSpeed: (speed: 'slow' | 'normal' | 'fast') =>
        set((state) => ({
          slideShowSettings: {
            ...state.slideShowSettings,
            transitionSpeed: speed,
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

      setIngredients: (ingredients: string[]) =>
        set(() => ({
          myIngredients: [...ingredients].sort((a, b) =>
            a.toLowerCase().localeCompare(b.toLowerCase())
          ),
        })),

      toggleTried: (cocktailId: string) =>
        set((state) => ({
          triedCocktails: state.triedCocktails.includes(cocktailId)
            ? state.triedCocktails.filter((id) => id !== cocktailId)
            : [...state.triedCocktails, cocktailId],
        })),

      toggleHearted: (cocktailId: string) =>
        set((state) => ({
          heartedCocktails: state.heartedCocktails.includes(cocktailId)
            ? state.heartedCocktails.filter((id) => id !== cocktailId)
            : [...state.heartedCocktails, cocktailId],
        })),

      setCocktailNote: (cocktailId: string, note: string) =>
        set((state) => ({
          cocktailNotes: {
            ...state.cocktailNotes,
            [cocktailId]: note,
          },
        })),
    }),
    {
      name: 'cocktail-showcase-storage',
    }
  )
);
