/**
 * AssetLoader — Preloads images and caches them for instant access.
 */
export class AssetLoader {
  constructor() {
    this.cache = new Map();
    this.totalAssets = 0;
    this.loadedAssets = 0;
    this.onProgress = null;
  }

  /**
   * Load a manifest of assets.
   * @param {Object} manifest - { key: url } pairs
   * @returns {Promise<void>}
   */
  async loadManifest(manifest) {
    const entries = Object.entries(manifest);
    this.totalAssets = entries.length;
    this.loadedAssets = 0;

    const promises = entries.map(([key, url]) => this.loadImage(key, url));
    await Promise.all(promises);
  }

  /**
   * Load a single image.
   */
  loadImage(key, url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(key, img);
        this.loadedAssets++;
        if (this.onProgress) {
          this.onProgress(this.loadedAssets / this.totalAssets);
        }
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load asset: ${key} (${url})`);
        this.loadedAssets++;
        if (this.onProgress) {
          this.onProgress(this.loadedAssets / this.totalAssets);
        }
        resolve(null); // Don't break on missing assets
      };
      img.src = url;
    });
  }

  /**
   * Get a cached asset by key.
   */
  get(key) {
    return this.cache.get(key) || null;
  }

  /**
   * Check if an asset exists.
   */
  has(key) {
    return this.cache.has(key);
  }
}
