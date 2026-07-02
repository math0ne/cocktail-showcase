// IndexedDB-based image storage for custom cocktails and ingredients

const DB_NAME = 'cocktail-images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof indexedDB !== 'undefined';

interface StoredImage {
  id: string; // e.g., "cocktail-{id}" or "ingredient-{name}"
  blob: Blob;
  mimeType: string;
  createdAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!isBrowser) {
    return Promise.reject(new Error('IndexedDB not available'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });

  return dbPromise;
}

// Save an image to IndexedDB
export async function saveImage(id: string, blob: Blob): Promise<void> {
  if (!isBrowser) return;

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record: StoredImage = {
      id,
      blob,
      mimeType: blob.type,
      createdAt: Date.now(),
    };

    const request = store.put(record);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to save image'));
  });
}

// Get an image from IndexedDB
export async function getImage(id: string): Promise<Blob | null> {
  if (!isBrowser) return null;

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      const result = request.result as StoredImage | undefined;
      resolve(result?.blob || null);
    };

    request.onerror = () => reject(new Error('Failed to get image'));
  });
}

// Delete an image from IndexedDB
export async function deleteImage(id: string): Promise<void> {
  if (!isBrowser) return;

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to delete image'));
  });
}

// Get image as data URL for display
export async function getImageUrl(id: string): Promise<string | null> {
  if (!isBrowser) return null;

  const blob = await getImage(id);
  if (!blob) return null;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

// Convert File to compressed Blob (resize if too large)
export async function processImageFile(
  file: File,
  maxSize: number = 800
): Promise<Blob> {
  if (!isBrowser) {
    throw new Error('processImageFile requires browser environment');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Resize if larger than maxSize
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.85
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));

    // Create object URL from file
    img.src = URL.createObjectURL(file);
  });
}

// Helper to generate storage keys
export function getCocktailImageKey(cocktailId: string): string {
  return `cocktail-${cocktailId}`;
}

export function getIngredientImageKey(ingredientName: string): string {
  return `ingredient-${ingredientName.toLowerCase().replace(/\s+/g, '-')}`;
}

// Check if an image exists
export async function hasImage(id: string): Promise<boolean> {
  if (!isBrowser) return false;

  const blob = await getImage(id);
  return blob !== null;
}

// Get all stored image IDs
export async function getAllImageIds(): Promise<string[]> {
  if (!isBrowser) return [];

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();

    request.onsuccess = () => {
      resolve(request.result as string[]);
    };

    request.onerror = () => reject(new Error('Failed to get image IDs'));
  });
}

// Clear all images (for debugging/reset)
export async function clearAllImages(): Promise<void> {
  if (!isBrowser) return;

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error('Failed to clear images'));
  });
}
