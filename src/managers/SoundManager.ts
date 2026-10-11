import type EventEmitter from "@/core/EventEmitter";
import type Enemy from "@/entities/Enemy";
import { SOUND_ASSETS_DIR, EVENTS } from "@/core/constants";
import audioData from "@/data/audioData";

interface SoundEntryData {
  sound: HTMLAudioElement;
  loaded: boolean;
  channels: HTMLAudioElement[];
}

const MAX_CHANNELS_PER_SOUND = 4;

export default class SoundManager {
  private sounds: Map<string, SoundEntryData> = new Map();
  private eventEmitter: EventEmitter;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
    this._attachEventListeners(this.eventEmitter);
  }

  private _attachEventListeners(eventEmitter: EventEmitter) {
    if (!eventEmitter) return;

    eventEmitter.on(EVENTS.SOUND_PLAY, this._onGenericSoundPlay);
    eventEmitter.on(EVENTS.ENEMY_DAMAGED, this._onEnemyDamageSoundPlay);
    eventEmitter.on(EVENTS.ENEMY_DIED, this._onEnemyDieSoundPlay);
  }

  load(name: string, path: string) {
    return new Promise<HTMLAudioElement | void>((resolve) => {
      const sound = new Audio();
      const asset: SoundEntryData = { sound, loaded: false, channels: [] };

      this.sounds.set(name, asset);

      sound.addEventListener("loadeddata", () => {
        asset.loaded = true;
        asset.channels.push(sound);
        resolve(sound);
      });

      sound.addEventListener("error", () => {
        console.warn(`Audio loading failed: ${name} (will skip)`);
        resolve();
      });

      sound.src = path;
    });
  }

  get(name: string): SoundEntryData | null {
    const entry = this.sounds.get(name);

    if (!entry?.loaded) {
      console.warn(`Couldn't find sound asset ${name}.`);
      return null;
    }

    return entry;
  }

  async play(name: string) {
    try {
      const entry = this.get(name);

      if (!entry) return;

      const { sound: s, channels } = entry;
      let sound = channels.find((s) => s.paused);
      if (!sound) {
        if (channels.length < MAX_CHANNELS_PER_SOUND) {
          sound = s.cloneNode() as HTMLAudioElement;
          channels.push(sound);
        } else {
          sound = channels.shift()!;
          channels.push(sound);
        }
      }

      sound.currentTime = 0;
      await sound.play();
    } catch (err) {
      console.warn(`Couldn't play sound ${name}. Error message:\n`, err);
    }
  }

  /** Load all necessary sound assets for initial rendering here. */
  loadAll() {
    return Promise.all(audioData.map(({ name, path }) => this.load(name, `${SOUND_ASSETS_DIR}/${path}`)));
  }

  private _onGenericSoundPlay = (name: string): void => {
    this.play(name);
  };

  private _onEnemyDamageSoundPlay = (enemy: Enemy): void => {
    const { soundEffects } = enemy.data;
    const sound = soundEffects?.hit;

    if (!sound) return;

    this.play(sound);
  };

  private _onEnemyDieSoundPlay = (enemy: Enemy) => {
    const { soundEffects } = enemy.data;
    const sound = soundEffects?.death;

    if (!sound) return;

    this.play(sound);
  };
}
