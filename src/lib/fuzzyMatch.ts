/**
 * Simple fuzzy matching - checks if all characters in the search string
 * appear in order in the target string (case insensitive).
 * e.g., "oj" matches "Orange Juice", "vka" matches "Vodka"
 */
export function fuzzyMatch(target: string, search: string): boolean {
  const targetLower = target.toLowerCase();
  const searchLower = search.toLowerCase().trim();

  if (!searchLower) return true;

  let searchIndex = 0;
  for (let i = 0; i < targetLower.length && searchIndex < searchLower.length; i++) {
    if (targetLower[i] === searchLower[searchIndex]) {
      searchIndex++;
    }
  }

  return searchIndex === searchLower.length;
}
