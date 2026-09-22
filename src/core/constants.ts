// General
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const GRID_SIZE = 40;
export const GAME_ASPECT_RATIO = GAME_WIDTH / GAME_HEIGHT;
export const GAME_VIEWPORT_MARGIN = 15;

export const SRC_DIR = "src";
export const ASSETS_DIR = "assets";
export const IMAGE_ASSETS_DIR = `${ASSETS_DIR}/images`;
export const SOUND_ASSETS_DIR = `${ASSETS_DIR}/audio`;

// States
export const GAME_STATES = Object.freeze({
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  GAME_OVER: "gameOver",
  MISSION_COMPLETED: "missionCompleted",
});

export type GameStates = typeof GAME_STATES;
export type GameState = GameStates[keyof GameStates];

// Events
export const EVENTS = Object.freeze({
  // Sound
  SOUND_PLAY: "sound:play",
  SOUND_STOP: "sound:stop",
  // States
  GAME_START: "game:start",
  GAME_PAUSE: "game:pause",
  GAME_RESUME: "game:resume",
  GAME_MENU: "game:menu",
  // Player
  PLAYER_DAMAGED: "player:damaged",
  PLAYER_DIED: "player:died",
  // Enemy
  ENEMY_DAMAGED: "enemy:damaged",
  ENEMY_DIED: "enemy:died",
  ENEMY_KILLED_COUNT: "enemy:killedCount",
  MISSION_COMPLETED: "mission:completed",
});

// Sounds
export const GAME_SOUNDS = Object.freeze({
  ButtonHover: "button_hover",
  ButtonClick: "button_click",
  GameStart: "button_click", // Use fallback
  GamePause: "pause",
  GameResume: "unpause",
  GameQuit: "button_click", // Use fallback
  GameOver: "game_over",
  MissionCompleted: "mission_complete",
});

export const PLAYER_SOUNDS = Object.freeze({
  Damaged: "player_hurt",
  Died: "player_hurt", // Use fallback
});

// Enemies
export const ENEMY_SPAWN_COUNT = 10;
export const ENEMY_DESPAWN_MARGIN = 200;
export const ENEMY_SPAWN_MARGIN = 100;
export const ENEMY_SPAWN_INTERVAL = 2;

// Collisions
export const FLASH_MIN_ALPHA = 0.1;
export const FLASH_ALPHA_RANGE = 0.8;
export const FLASH_SPEED = 10;

export const HEALTHBAR_HEIGHT = 4;
export const HEALTHBAR_OFFSET = 6;
export const HEALTHBAR_BACKGROUND = "rgb(0, 0, 0, 0.6)";
export const HEALTHBAR_FILL = "#ff5f6d";

export const PUSHBACK_DECAY = 800;

// Particles
export const PARTICLE_SPAWN_COUNT = 200;
export const PARTICLE_SPEED_SCALE = 0.5;
