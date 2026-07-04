'use client';

const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
const DATA_FILENAME = 'cocktail-data.json';
const IMAGES_FOLDER = 'cocktail-images';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

interface TokenInfo {
  accessToken: string;
  expiresAt: number;
}

// Get stored token
export function getStoredToken(): TokenInfo | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('google_token');
  if (!stored) return null;

  try {
    const token = JSON.parse(stored) as TokenInfo;
    // Check if expired (with 5 min buffer)
    if (Date.now() > token.expiresAt - 300000) {
      localStorage.removeItem('google_token');
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

// Store token
export function storeToken(accessToken: string, expiresIn: number): void {
  const tokenInfo: TokenInfo = {
    accessToken,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  localStorage.setItem('google_token', JSON.stringify(tokenInfo));
}

// Clear token
export function clearToken(): void {
  localStorage.removeItem('google_token');
}

// List files in appDataFolder
async function listFiles(accessToken: string): Promise<DriveFile[]> {
  const response = await fetch(
    'https://www.googleapis.com/drive/v3/files?' +
      new URLSearchParams({
        spaces: 'appDataFolder',
        fields: 'files(id, name, mimeType)',
        pageSize: '100',
      }),
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to list files: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
}

// Find file by name
async function findFile(accessToken: string, filename: string): Promise<DriveFile | null> {
  const files = await listFiles(accessToken);
  return files.find((f) => f.name === filename) || null;
}

// Download file content
async function downloadFile(accessToken: string, fileId: string): Promise<string> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  return response.text();
}

// Download file as blob (for images)
async function downloadFileAsBlob(accessToken: string, fileId: string): Promise<Blob> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  return response.blob();
}

// Create or update file
async function uploadFile(
  accessToken: string,
  filename: string,
  content: string | Blob,
  mimeType: string,
  existingFileId?: string
): Promise<string> {
  const metadata = {
    name: filename,
    ...(existingFileId ? {} : { parents: ['appDataFolder'] }),
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', content instanceof Blob ? content : new Blob([content], { type: mimeType }));

  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

  const response = await fetch(url, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file: ${response.statusText}`);
  }

  const data = await response.json();
  return data.id;
}

// Delete file
async function deleteFile(accessToken: string, fileId: string): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }
}

// ============ Public API ============

export interface SyncData {
  version: number;
  lastSyncedAt: string;
  myIngredients: string[];
  shoppingList: string[];
  customCocktails: any[];
  triedCocktails: string[];
  heartedCocktails: string[];
  cocktailNotes: Record<string, string>;
  cocktailRatings: Record<string, number>;
  slideShowSettings: any;
  imageRefs: Record<string, string>; // cocktailId -> driveFileId
}

// Load data from Google Drive
export async function loadFromDrive(accessToken: string): Promise<SyncData | null> {
  try {
    const file = await findFile(accessToken, DATA_FILENAME);
    if (!file) return null;

    const content = await downloadFile(accessToken, file.id);
    return JSON.parse(content) as SyncData;
  } catch (error) {
    console.error('Failed to load from Drive:', error);
    throw error;
  }
}

// Save data to Google Drive
export async function saveToDrive(accessToken: string, data: SyncData): Promise<void> {
  try {
    const file = await findFile(accessToken, DATA_FILENAME);
    const content = JSON.stringify(data, null, 2);

    await uploadFile(
      accessToken,
      DATA_FILENAME,
      content,
      'application/json',
      file?.id
    );
  } catch (error) {
    console.error('Failed to save to Drive:', error);
    throw error;
  }
}

// Upload image to Drive, returns file ID
export async function uploadImageToDrive(
  accessToken: string,
  cocktailId: string,
  imageBlob: Blob
): Promise<string> {
  const filename = `${cocktailId}.jpg`;
  const existingFile = await findFile(accessToken, filename);

  return uploadFile(
    accessToken,
    filename,
    imageBlob,
    'image/jpeg',
    existingFile?.id
  );
}

// Download image from Drive
export async function downloadImageFromDrive(
  accessToken: string,
  fileId: string
): Promise<Blob> {
  return downloadFileAsBlob(accessToken, fileId);
}

// Delete image from Drive
export async function deleteImageFromDrive(
  accessToken: string,
  fileId: string
): Promise<void> {
  await deleteFile(accessToken, fileId);
}

// Check if we have a valid connection
export async function testConnection(accessToken: string): Promise<boolean> {
  try {
    await listFiles(accessToken);
    return true;
  } catch {
    return false;
  }
}
