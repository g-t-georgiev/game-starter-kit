import { IMAGE_ASSETS_DIR } from "@/core/constants";
import playerData from "@/data/playerData";
import enemyData from "@/data/enemyData";
import particleData from "@/data/particleData";

type ImageAssetEntry = { name: string; path: string };

const DEFAULT_IMG_EXT = "png";

/** Normalizes entity config visual assets into a uniform array of { name, path } pairs. */
function extractImageAssets(config?: any): ImageAssetEntry[] {
  if (!config) return [];

  const { animations, imageName, imagePath } = config;
  const rawSheets = animations?.spritesheets;
  const assets: ImageAssetEntry[] = [];

  // if animations.spritesheets is defined, handle all union shapes
  if (rawSheets) {
    const sheetsList = Array.isArray(rawSheets) ? rawSheets : [rawSheets];

    for (const sheet of sheetsList) {
      if (typeof sheet === "string") {
        assets.push({
          name: sheet,
          path: `${IMAGE_ASSETS_DIR}/${sheet}.${DEFAULT_IMG_EXT}`,
        });
      } else if (sheet && typeof sheet === "object") {
        assets.push({
          name: sheet.name,
          path: `${IMAGE_ASSETS_DIR}/${sheet.path}`,
        });
      }
    }
  }

  if (imageName) {
    assets.push({
      name: imageName,
      path: `${IMAGE_ASSETS_DIR}/${imagePath || `${imageName}.${DEFAULT_IMG_EXT}`}`
    });
  }

  return assets;
}

export default class ImageManager {
  private images: Map<string, { img: HTMLImageElement; loaded: boolean }> = new Map();

  constructor() { }

  load(name: string, path: string) {
    return new Promise<void>((resolve) => {
      const img = new Image();
      const asset = { img, loaded: false };

      this.images.set(name, asset);

      img.addEventListener("load", () => {
        asset.loaded = true;
        resolve();
      });

      img.addEventListener("error", () => {
        console.warn(`Image loading failed: ${name} (will use fallback)`);
        resolve();
      });

      img.src = path;
    });
  }

  get(name: string) {
    const imageAsset = this.images.get(name);

    if (!imageAsset) {
      console.warn(`Couldn't find image asset: ${name}.`);
      return null;
    }

    if (imageAsset.loaded) return imageAsset.img;

    return null;
  }

  /** Load all necessary image assets for initial rendering here. */
  loadAll() {
    const imageParticleConfigs = Object.values(particleData).filter((config) => config.shape === "image");
    const configs = [playerData, ...Object.values(enemyData), ...imageParticleConfigs];
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
