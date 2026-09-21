import { EVENTS } from "@/core/constants";
import type Enemy from "@/entities/Enemy";

export type EventsMap = {
  [EVENTS.GAME_START]: (() => void);
  [EVENTS.GAME_MENU]: (() => void);
  [EVENTS.GAME_PAUSE]: (() => void);
  [EVENTS.GAME_RESUME]: (() => void);
  [EVENTS.SOUND_PLAY]: ((name: string) => void);
  [EVENTS.ENEMY_DAMAGED]: ((enemy: Enemy) => void);
  [EVENTS.ENEMY_DIED]: ((enemy: Enemy) => void);
  [EVENTS.PLAYER_DAMAGED]: ((health: number, maxHealth: number) => void);
  [EVENTS.PLAYER_DIED]: (() => void);
  [EVENTS.MISSION_COMPLETED]: (() => void);
  [EVENTS.ENEMY_KILLED_COUNT]: ((count: number) => void);
};
