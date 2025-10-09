/**
 * Image caching utility to preload and cache images in the browser
 * This helps reduce load times on subsequent visits
 */

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Preload an image and cache it in memory
 * @param src - Image source URL
 * @returns Promise that resolves when image is loaded
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  // Check if image is already cached
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    
    img.onerror = (error) => {
      console.warn(`Failed to preload image: ${src}`, error);
      reject(error);
    };
    
    // Set crossorigin if needed for CORS
    if (src.startsWith('http') && !src.includes(window.location.hostname)) {
      img.crossOrigin = 'anonymous';
    }
    
    img.src = src;
  });
}

/**
 * Preload multiple images
 * @param sources - Array of image source URLs
 * @returns Promise that resolves when all images are loaded
 */
export function preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(sources.map(src => preloadImage(src)));
}

/**
 * Clear the image cache
 */
export function clearImageCache() {
  imageCache.clear();
}

/**
 * Remove a specific image from cache
 * @param src - Image source URL to remove
 */
export function removeFromCache(src: string) {
  imageCache.delete(src);
}

/**
 * Check if an image is cached
 * @param src - Image source URL
 */
export function isImageCached(src: string): boolean {
  return imageCache.has(src);
}

/**
 * Get cache size (number of cached images)
 */
export function getCacheSize(): number {
  return imageCache.size;
}

