import { IMAGE_ASSETS_DIR } from "@/core/constants";
import playerData from "@/data/playerData";
import enemyData from "@/data/enemyData";

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
    const assetEntries = [
      {
        name: playerData.imageName,
        path: `${IMAGE_ASSETS_DIR}/${playerData.imagePath}`
      },
      ...Object.values(enemyData).map(
        ({ imageName, imagePath }) => (
          { name: imageName, path: `${IMAGE_ASSETS_DIR}/${imagePath}` }
        )
      ),
    ];

    return Promise.all(assetEntries.map(({ name, path }) => this.load(name, path)));
  }
}
