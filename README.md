# Cocktail Showcase

A Next.js web app that helps you discover cocktails you can make from ingredients you have. Features a full-screen slideshow mode designed for iPad display at a bar.

## Features

- **Ingredient Management** - Search and add ingredients from a master list of 600+ ingredients
- **Cocktail Discovery** - View cocktails you can make with your ingredients
- **Smart Matching** - Shows "Ready to make" vs "Missing X ingredients" for each cocktail
- **Slideshow Mode** - Full-screen carousel for iPad/TV display with auto-advance
- **Persistent Storage** - Your ingredients are saved to localStorage

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Chakra UI v2
- **State**: Zustand with localStorage persistence
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

### Adding Ingredients

1. Go to the home page
2. Search for ingredients in the search box
3. Click an ingredient to add it to your bar stock
4. Your ingredients are automatically saved

### Viewing Cocktails

1. Click "View Cocktails" in the header
2. Use filters to show all, ready-to-make, or partial matches
3. Sort by best match, name, or category
4. Green badges indicate cocktails you can make now

### Slideshow Mode

1. Add ingredients that allow you to make at least one cocktail
2. Click "Start Slideshow" or navigate to `/slideshow`
3. Controls:
   - **Click/Tap**: Pause/resume auto-advance
   - **Arrow keys**: Navigate between cocktails
   - **Space**: Pause/resume
   - **Settings icon**: Adjust slide duration (5-30 seconds)

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout with Chakra provider
│   ├── page.tsx              # Home - ingredient management
│   ├── cocktails/page.tsx    # Cocktail grid view
│   └── slideshow/page.tsx    # Full-screen slideshow
├── components/
│   ├── IngredientPicker.tsx  # Searchable ingredient selector
│   ├── IngredientList.tsx    # User's ingredients display
│   ├── CocktailCard.tsx      # Individual cocktail card
│   ├── CocktailGrid.tsx      # Sortable/filterable grid
│   └── Slideshow.tsx         # Full-screen carousel
├── hooks/
│   ├── useIngredients.ts     # Fetch all ingredients
│   └── useCocktails.ts       # Fetch & match cocktails
├── lib/
│   ├── api.ts                # TheCocktailDB API client
│   └── matching.ts           # Cocktail matching logic
├── store/
│   └── useStore.ts           # Zustand store
└── types/
    └── index.ts              # TypeScript interfaces
```

## API

This app uses [TheCocktailDB](https://www.thecocktaildb.com/) free API:

- `GET /list.php?i=list` - Fetch all ingredients
- `GET /filter.php?i={ingredient}` - Get cocktails containing an ingredient
- `GET /lookup.php?i={id}` - Get full cocktail details

## License

MIT
