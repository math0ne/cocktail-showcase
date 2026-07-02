# Cocktail Data License

## Data Source
The cocktail and ingredient data in this directory is sourced from **TheCocktailDB**.

- Website: https://www.thecocktaildb.com
- API Documentation: https://www.thecocktaildb.com/api.php

## License Terms
This data is used under TheCocktailDB's licensing terms. Please refer to their website for the most up-to-date licensing information.

## Data Files
- `cocktails.json` - Complete cocktail database
- `ingredients.json` - List of all ingredients

## Last Updated
See the `fetchedAt` field in each JSON file for the last update timestamp.

## Updating Data
To refresh the cocktail data, run:
```bash
npm run fetch-cocktails
```

This will fetch the latest data from TheCocktailDB API and update the local JSON files.
