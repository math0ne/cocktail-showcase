# Cocktail Showcase

A Next.js web app that helps you discover cocktails you can make from ingredients you have. Features a full-screen slideshow mode designed for iPad display at a bar.

## Features

- **Ingredient Management** - Search and add ingredients from a master list of 600+ ingredients
- **Quick Toggles** - Rapidly add/remove common fresh ingredients
- **Cocktail Discovery** - View cocktails you can make with your ingredients
- **Smart Matching** - Shows "Ready to make" vs "Missing X ingredients" for each cocktail
- **Fuzzy Search** - Search cocktails by name, category, or ingredient
- **Filtering** - Filter by Ready, Tried, Liked, Matches, or browse All cocktails
- **Personal Tracking** - Mark cocktails as Tried or Liked, add personal notes
- **Slideshow Mode** - Full-screen carousel with Ken Burns effect, film grain, and retro filters
- **PWA Support** - Install to home screen for a native app experience without browser UI
- **Dark Mode** - Full dark mode support
- **Persistent Storage** - Your ingredients and preferences are saved to localStorage

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Chakra UI v2
- **State**: Zustand with localStorage persistence
- **Animations**: Framer Motion
- **Data**: TheCocktailDB API

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm start
```

## Usage

### Single Page Design

The app uses a Bar/Drinks toggle to switch between views:
- **Bar** - Manage your ingredients (quick toggles, bar stock, add ingredients)
- **Drinks** - Browse and filter cocktails

### Adding Ingredients

1. Switch to the Bar view
2. Use Quick Toggles for common fresh ingredients
3. Search and add ingredients from the full list
4. Your ingredients are automatically saved

### Viewing Cocktails

1. Switch to the Drinks view
2. Use filter toggles: Ready, Tried, Liked, Matches, All
3. Search by cocktail name, category, or ingredient
4. Sort by best match, name, category, glass type, or ingredient count
5. Click a cocktail to view details, mark as tried/liked, and add notes

### Slideshow Mode

1. Add ingredients that allow you to make at least one cocktail
2. Click "Slideshow" button in the header
3. Controls:
   - **Swipe/Arrow keys**: Navigate between cocktails
   - **Settings icon**: Adjust duration, Ken Burns, film grain, retro filter
   - **Info icon**: View cocktail details
   - **X icon**: Exit slideshow

## PWA Installation

For the best experience on iPad/mobile (fullscreen without browser UI):

1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Launch from the home screen icon

### PWA Icons

Add icons to `/public/` for home screen:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)

## Update Cocktail Data

Cocktail data is cached locally. To fetch the latest from TheCocktailDB:

```bash
npm run update-cocktails
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout with Chakra provider
│   ├── page.tsx              # Single page app (Bar/Drinks views)
│   ├── providers.tsx         # Chakra UI provider
│   └── slideshow/page.tsx    # Full-screen slideshow
├── components/
│   ├── CocktailCard.tsx      # Individual cocktail card
│   ├── CocktailGrid.tsx      # Sortable/filterable grid with toggles
│   ├── CocktailModal.tsx     # Cocktail details modal
│   ├── FreshIngredients.tsx  # Quick toggle buttons
│   ├── IngredientPicker.tsx  # Searchable ingredient selector
│   ├── IngredientList.tsx    # User's bar stock display
│   ├── ShoppingList.tsx      # What to buy next suggestions
│   ├── Slideshow.tsx         # Full-screen carousel
│   └── ColorModeToggle.tsx   # Dark mode toggle
├── hooks/
│   └── useCocktails.ts       # Fetch & match cocktails
├── lib/
│   └── fuzzyMatch.ts         # Fuzzy search utility
├── store/
│   └── useStore.ts           # Zustand store with persistence
└── types/
    └── index.ts              # TypeScript interfaces
```

## License

MIT
