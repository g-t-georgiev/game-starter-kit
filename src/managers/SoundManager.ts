import type EventEmitter from "@/core/EventEmitter";
import type Enemy from "@/entities/Enemy";
import { SOUND_ASSETS_DIR, EVENTS } from "@/core/constants";
import audioData from "@/data/audioData";

export default class SoundManager {
  private sounds: Map<string, { sound: HTMLAudioElement; loaded: boolean }> = new Map();
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this._attachEventListeners();
  }

  _attachEventListeners() {
    this.eventEmitter.on(EVENTS.SOUND_PLAY, this._onGenericSoundPlay);
    this.eventEmitter.on(EVENTS.ENEMY_DAMAGED, this._onEnemyDamageSoundPlay);
    this.eventEmitter.on(EVENTS.ENEMY_DIED, this._onEnemyDieSoundPlay);
  }

  load(name: string, path: string) {
    return new Promise<HTMLAudioElement | void>((resolve) => {
      const sound = new Audio(path);
      const asset = { sound, loaded: false };

      this.sounds.set(name, asset);

      sound.addEventListener("loadeddata", () => {
        asset.loaded = true;

        // console.log(`[DEV] Audio loading successful: ${name}`);

        resolve(sound);
      });

      sound.addEventListener("error", () => {
        console.error(`Audio loading failed: ${name} (will skip)`);

        resolve();
      });
    });
  }

  get(name: string) {
    const soundAsset = this.sounds.get(name);

    if (!soundAsset) {
      // console.warn(`[DEV] Couldn't find sound asset ${name}. Try load it first or inspect if there's a problem with loading.`);

      return null;
    }

    if (soundAsset.loaded) return soundAsset.sound;

    // console.warn(`[DEV] Sound asset ${name} is still loading. Will use a fallback for the moment.`);

    return null;
  }

  async play(name: string) {
    try {
      const sound = this.get(name);

      if (!sound) return;

      sound.currentTime = 0;

      await sound.play();
    } catch (err) {
      console.warn(`Couldn't play sound ${name}. Error message:`, err);
    }
  }

  /** Load all necessary sound assets for initial rendering here. */
  loadAll() {
    return Promise.all(audioData.map(({ name, path }) => this.load(name, `${SOUND_ASSETS_DIR}/${path}`)));
  }

  _onGenericSoundPlay = (name: string): void => {
    this.play(name);
  };

  _onEnemyDamageSoundPlay = (enemy: Enemy): void => {
    this.play(enemy.data.sounds?.hit);
  };

  /**
   * @param {import("../entities/Enemy.js").default} enemy
   */
  _onEnemyDieSoundPlay = (enemy: Enemy) => {
    this.play(enemy.data.sounds?.death);
  };
}
