import { IMAGE_ASSETS_DIR } from "@/core/constants";
import playerData from "@/data/playerData";
import enemyData from "@/data/enemyData";

type ImageAssetEntry = { name: string; path: string };

const defaultImgExt = "png";
const imageExtMatcher = /(?<=\.)(png|jpe?g|gif|webp|avif|bmp|tiff?|svg|ico)$/;

/** Normalizes entity config visual assets into a uniform array of { name, path } pairs. */
function extractImageAssets(config?: any): ImageAssetEntry[] {
  if (!config) return [];

  const { animations } = config;
  const rawSheets = animations?.spritesheets;

  // if animations.spritesheets is defined, handle all union shapes
  if (rawSheets) {
    const sheetsList = Array.isArray(rawSheets) ? rawSheets : [rawSheets];
    const assets: ImageAssetEntry[] = [];

    for (const sheet of sheetsList) {
      if (typeof sheet === "string") {
        assets.push({
          name: sheet,
          path: `${IMAGE_ASSETS_DIR}/${imageExtMatcher.test(sheet) ? sheet : `${sheet}.${defaultImgExt}`}`,
        });
      } else if (sheet && typeof sheet === "object") {
        assets.push({
          name: sheet.name,
          path: `${IMAGE_ASSETS_DIR}/${sheet.path}`,
        });
      }
    }

    if (assets.length > 0) return assets;
  }

  // No valid image metadata found
  return [];
}

export default class ImageManager {
  private images: Map<string, { img: HTMLImageElement; loaded: boolean }> = new Map();

  constructor() { }

  load(name: string, path: string) {
    return new Promise<void>((resolve) => {
      const img = new Image();

      img.src = path;

      const asset = { img, loaded: false };

      this.images.set(name, asset);

      img.addEventListener("load", () => {
        asset.loaded = true;

        // console.log(`[DEV] Image loading successful: ${name}`);

        resolve();
      });

      img.addEventListener("error", () => {
        console.error(`Image loading failed: ${name} (will use fallback)`);

        resolve();
      });

    });
  }

  get(name: string) {
    const imageAsset = this.images.get(name);

    if (!imageAsset) {
      // console.warn(`[DEV] Couldn't find image asset: ${name}. Try load it first or inspect if there's a problem with loading.`);

      return null;
    }

    if (imageAsset.loaded) return imageAsset.img;

    // console.warn(`[DEV] Image asset ${name} is still loading. Will use a fallback for the moment.`);

    return null;
  }

  /** Load all necessary image assets for initial rendering here. */
  loadAll() {
    const configs = [playerData, ...Object.values(enemyData)];
    const assetsMap = new Map<string, string>();

    for (const config of configs) {
      const assets = extractImageAssets(config);

      for (const { name, path } of assets) {
        if (!name || !path || assetsMap.has(name)) continue;

        assetsMap.set(name, path);
      }
    }

    return Promise.all(Array.from(assetsMap.entries()).map(([name, path]) => this.load(name, path)));
  }
}
