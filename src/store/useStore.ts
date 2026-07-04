import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppState, Cocktail, DrinkViewMode, DrinkSortOption } from '@/types';

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
      shoppingList: [],
      cachedCocktails: {},
      customCocktails: [],
      slideShowSettings: {
        interval: 8,
        kenBurnsEnabled: true,
        filmGrainEnabled: true,
        retroFilterEnabled: false,
        transitionSpeed: 'normal' as const,
      },
      drinkFilters: {
        viewMode: 'ready' as DrinkViewMode,
        sortBy: 'match' as DrinkSortOption,
        search: '',
      },
      triedCocktails: [],
      heartedCocktails: [],
      cocktailNotes: {},
      cocktailRatings: {},

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

      addToShoppingList: (ingredient: string) =>
        set((state) => {
          const normalized = ingredient.trim();
          // Don't add if already in shopping list or already in bar
          if (
            state.shoppingList
              .map((i) => i.toLowerCase())
              .includes(normalized.toLowerCase()) ||
            state.myIngredients
              .map((i) => i.toLowerCase())
              .includes(normalized.toLowerCase())
          ) {
            return state;
          }
          return {
            shoppingList: [...state.shoppingList, normalized].sort((a, b) =>
              a.toLowerCase().localeCompare(b.toLowerCase())
            ),
          };
        }),

      removeFromShoppingList: (ingredient: string) =>
        set((state) => ({
          shoppingList: state.shoppingList.filter(
            (i) => i.toLowerCase() !== ingredient.toLowerCase()
          ),
        })),

      addMultipleToShoppingList: (ingredients: string[]) =>
        set((state) => {
          const newItems = ingredients.filter((ing) => {
            const normalized = ing.trim().toLowerCase();
            return (
              !state.shoppingList.map((i) => i.toLowerCase()).includes(normalized) &&
              !state.myIngredients.map((i) => i.toLowerCase()).includes(normalized)
            );
          });
          if (newItems.length === 0) return state;
          return {
            shoppingList: [...state.shoppingList, ...newItems].sort((a, b) =>
              a.toLowerCase().localeCompare(b.toLowerCase())
            ),
          };
        }),

      moveFromShoppingListToBar: (ingredient: string) =>
        set((state) => {
          const normalized = ingredient.trim();
          // Remove from shopping list
          const newShoppingList = state.shoppingList.filter(
            (i) => i.toLowerCase() !== normalized.toLowerCase()
          );
          // Add to bar if not already there
          const alreadyInBar = state.myIngredients
            .map((i) => i.toLowerCase())
            .includes(normalized.toLowerCase());
          const newMyIngredients = alreadyInBar
            ? state.myIngredients
            : [...state.myIngredients, normalized].sort((a, b) =>
                a.toLowerCase().localeCompare(b.toLowerCase())
              );
          return {
            shoppingList: newShoppingList,
            myIngredients: newMyIngredients,
          };
        }),

      cacheCocktail: (cocktail: Cocktail) =>
        set((state) => ({
          cachedCocktails: {
            ...state.cachedCocktails,
            [cocktail.id]: cocktail,
          },
        })),

      addCustomCocktail: (cocktail: Cocktail) =>
        set((state) => ({
          customCocktails: [...state.customCocktails, cocktail],
        })),

      updateCustomCocktail: (cocktail: Cocktail) =>
        set((state) => ({
          customCocktails: state.customCocktails.map((c) =>
            c.id === cocktail.id ? cocktail : c
          ),
        })),

      deleteCustomCocktail: (cocktailId: string) =>
        set((state) => ({
          customCocktails: state.customCocktails.filter((c) => c.id !== cocktailId),
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

      setDrinkViewMode: (viewMode: DrinkViewMode) =>
        set((state) => ({
          drinkFilters: {
            ...state.drinkFilters,
            viewMode,
          },
        })),

      setDrinkSortBy: (sortBy: DrinkSortOption) =>
        set((state) => ({
          drinkFilters: {
            ...state.drinkFilters,
            sortBy,
          },
        })),

      setDrinkSearch: (search: string) =>
        set((state) => ({
          drinkFilters: {
            ...state.drinkFilters,
            search,
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

      setCocktailRating: (cocktailId: string, rating: number) =>
        set((state) => {
          const next = { ...state.cocktailRatings };
          // A rating of 0 (or lower) clears it rather than storing a zero.
          if (rating <= 0) {
            delete next[cocktailId];
          } else {
            next[cocktailId] = Math.min(5, Math.round(rating));
          }
          return { cocktailRatings: next };
        }),
    }),
    {
      name: 'cocktail-showcase-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
