import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

interface Cocktail {
  id: string;
  name: string;
  thumbnail: string;
}

interface CocktailData {
  fetchedAt: string;
  count: number;
  cocktails: Cocktail[];
}

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'cocktails');
const COCKTAILS_FILE = path.join(process.cwd(), 'public', 'data', 'cocktails.json');

// Download a single image
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(filepath);
          downloadImage(redirectUrl, filepath).then(resolve).catch(reject);
          return;
        }
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        fs.unlinkSync(filepath);
        reject(err);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

// Add delay between downloads to be respectful
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Create images directory
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`Created directory: ${IMAGES_DIR}`);
  }

  // Read cocktails data
  const data: CocktailData = JSON.parse(fs.readFileSync(COCKTAILS_FILE, 'utf-8'));
  console.log(`Found ${data.cocktails.length} cocktails to process`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const errors: { id: string; name: string; error: string }[] = [];

  for (let i = 0; i < data.cocktails.length; i++) {
    const cocktail = data.cocktails[i];
    const imageUrl = cocktail.thumbnail;

    if (!imageUrl) {
      console.log(`[${i + 1}/${data.cocktails.length}] Skipping ${cocktail.name} - no thumbnail`);
      skipped++;
      continue;
    }

    // Extract filename from URL or use ID
    const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const filename = `${cocktail.id}${ext}`;
    const filepath = path.join(IMAGES_DIR, filename);

    // Skip if already downloaded
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      if (stats.size > 1000) { // Check file has reasonable size
        console.log(`[${i + 1}/${data.cocktails.length}] Skipping ${cocktail.name} - already exists`);
        skipped++;
        continue;
      }
    }

    try {
      console.log(`[${i + 1}/${data.cocktails.length}] Downloading ${cocktail.name}...`);
      await downloadImage(imageUrl, filepath);
      downloaded++;

      // Small delay to be respectful to the server
      await delay(100);
    } catch (err) {
      console.error(`[${i + 1}/${data.cocktails.length}] Failed to download ${cocktail.name}: ${err}`);
      errors.push({ id: cocktail.id, name: cocktail.name, error: String(err) });
      failed++;
    }
  }

  console.log('\n--- Download Complete ---');
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Skipped (already exists): ${skipped}`);
  console.log(`Failed: ${failed}`);

  if (errors.length > 0) {
    console.log('\nFailed downloads:');
    errors.forEach(e => console.log(`  - ${e.name} (${e.id}): ${e.error}`));
  }

  // Now update the cocktails.json with local paths
  console.log('\nUpdating cocktails.json with local paths...');

  for (const cocktail of data.cocktails) {
    if (cocktail.thumbnail) {
      const ext = path.extname(new URL(cocktail.thumbnail).pathname) || '.jpg';
      const filename = `${cocktail.id}${ext}`;
      const localPath = `/images/cocktails/${filename}`;

      // Only update if file exists
      const filepath = path.join(IMAGES_DIR, filename);
      if (fs.existsSync(filepath)) {
        cocktail.thumbnail = localPath;
      }
    }
  }

  // Write updated data
  fs.writeFileSync(COCKTAILS_FILE, JSON.stringify(data, null, 2));
  console.log('Updated cocktails.json with local image paths');
}

main().catch(console.error);
