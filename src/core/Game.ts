import type Enemy from "@/entities/Enemy";

import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GAME_VIEWPORT_MARGIN,
  GAME_ASPECT_RATIO,
  EVENTS,
  GAME_STATES,
  GAME_SOUNDS,
  PLAYER_SOUNDS,
  type GameState,
} from "./constants";

import { GlobalEventEmitter } from "@/core/EventEmitter";

import RenderSystem from "@/systems/RenderSystem";
import CollisionSystem from "@/systems/CollisionSystem";

import UIManager from "@/managers/UIManager";
import ImageManager from "@/managers/ImageManager";
import SoundManager from "@/managers/SoundManager";
import EnemyManager from "@/managers/EnemyManager";
import EnemySpawner from "@/managers/EnemySpawner";
import CollisionManager from "@/managers/CollisionManager";

import Player from "@/entities/Player";

import missionsData from "@/data/missionData";

export default class Game {
  canvas: HTMLCanvasElement;
  imageManager: ImageManager;
  soundManager: SoundManager;
  uiManager: UIManager;
  enemyManager: EnemyManager;
  enemySpawner: EnemySpawner;
  renderSystem: RenderSystem;
  collisionSystem: CollisionSystem;
  collisionManager: CollisionManager;
  player: Player;
  lastTime = 0;
  accumulatedTime = 0;
  state: GameState = GAME_STATES.MENU;
  debug = false;
  keys: Record<string, boolean> = {};
  enemiesKilled: number = 0;

  constructor() {
    this.canvas = document.querySelector<HTMLCanvasElement>("#gameCanvas")!;

    this.imageManager = new ImageManager();
    this.soundManager = new SoundManager(GlobalEventEmitter);
    this.uiManager = new UIManager(GlobalEventEmitter);
    this.enemyManager = new EnemyManager();
    this.enemySpawner = new EnemySpawner(this.enemyManager);

    this.renderSystem = new RenderSystem(this.canvas, this.imageManager);

    this.collisionSystem = new CollisionSystem();
    this.collisionManager = new CollisionManager(this.collisionSystem, GlobalEventEmitter);

    this.player = new Player();

    this.init();
  }
  async init() {
    const DEBUG_LOADING_DEFER = 2000;
    await Promise.all([
      // Handle assets loading here
      this.imageManager.loadAll(),
      this.soundManager.loadAll(),
      // Test loading screen
      // TODO: Remove later
      new Promise((r) => setTimeout(r, DEBUG_LOADING_DEFER)),
    ]);

    // Event listeners
    GlobalEventEmitter.on(EVENTS.GAME_START, () => this.startGame());
    GlobalEventEmitter.on(EVENTS.GAME_MENU, () => this.returnToMenu());
    GlobalEventEmitter.on(EVENTS.GAME_PAUSE, () => this.pause());
    GlobalEventEmitter.on(EVENTS.GAME_RESUME, () => this.resume());
    GlobalEventEmitter.on(EVENTS.MISSION_COMPLETED, () => this.missionCompleted());

    GlobalEventEmitter.on(EVENTS.PLAYER_DAMAGED, (health, maxHealth) => {
      GlobalEventEmitter.emit(EVENTS.SOUND_PLAY, PLAYER_SOUNDS.Damaged);
      this.uiManager.updateHealthBar(health, maxHealth);
    });

    GlobalEventEmitter.on(EVENTS.PLAYER_DIED, () => {
      GlobalEventEmitter.emit(EVENTS.SOUND_PLAY, PLAYER_SOUNDS.Died);
      GlobalEventEmitter.emit(EVENTS.SOUND_PLAY, GAME_SOUNDS.GameOver);
      this.gameOver();
    });

    GlobalEventEmitter.on(EVENTS.ENEMY_DIED, () => {
      this.enemiesKilled++;
      GlobalEventEmitter.emit(EVENTS.ENEMY_KILLED_COUNT, this.enemiesKilled);
    });

    this.uiManager.showPanel("mainMenu");

    this.setupResize();
    this.setupInput();
    this.setupGameLoop();
  }

  resizeCanvas(): void {
    let w: number, h: number;

    const availableWidth = window.innerWidth - GAME_VIEWPORT_MARGIN * 2;
    const availableHeight = window.innerHeight - GAME_VIEWPORT_MARGIN * 2;

    if (availableWidth / availableHeight > GAME_ASPECT_RATIO) {
      h = availableHeight;
      w = h * GAME_ASPECT_RATIO;
    } else {
      w = availableWidth;
      h = w / GAME_ASPECT_RATIO;
    }

    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;

    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";
    this.canvas.style.margin = `${GAME_VIEWPORT_MARGIN}px`;
  }

  setupInput(): void {
    window.addEventListener("keydown", (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = true;

      // "Esc" toggles pause
      if (e.key === "Escape") {
        if (this.state === GAME_STATES.PLAYING) {
          this.pause();
        } else if (this.state === GAME_STATES.PAUSED) {
          this.resume();
        }
      }

      // ` toggles debug mode
      if (e.key === "`") {
        this.debug = !this.debug;
      }
    });

    window.addEventListener("keyup", (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Clear all keys when context menu opens
    window.addEventListener("contextmenu", () => {
      this.keys = {};
    });

    // Clear all keys when window loses focus
    window.addEventListener("blur", () => {
      this.keys = {};
    });
  }

  setupGameLoop(): void {
    requestAnimationFrame((t) => {
      this.lastTime = t;

      this.gameLoop(t);
    });
  }

  private gameLoop: FrameRequestCallback = (timestamp: number) => {
    requestAnimationFrame(this.gameLoop);

    const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 0.1);

    this.lastTime = timestamp;

    this.checkMissionConditions();

    const activeEnemies = [...this.enemyManager.getActive()];

    this.update(deltaTime, activeEnemies);

    this.renderSystem.render(
      this.state,
      this.player,
      activeEnemies,
      this.debug
    );
  };

  startGame(): void {
    this.state = GAME_STATES.PLAYING;

    GlobalEventEmitter.emit(EVENTS.SOUND_PLAY, GAME_SOUNDS.GameStart);

    this.uiManager.hideAllPanels();
    this.uiManager.toggleHud(true);

    this.player.reset();
    this.uiManager.updateHealthBar(this.player.health, this.player.maxHealth);

    this.enemyManager.reset();
    this.enemySpawner.reset();

    this.enemiesKilled = 0;

    this.accumulatedTime = 0;
    this.lastTime = performance.now();
  }

  update(deltaTime: number, activeEnemies: Iterable<Enemy>): void {
    if (this.state !== GAME_STATES.PLAYING) return;

    this.accumulatedTime += deltaTime;
    this.uiManager.updateTimer(this.accumulatedTime);

    this.player.update(deltaTime, this.keys);

    this.collisionManager.update(this.player, activeEnemies);

    this.enemyManager.update(deltaTime, this.player);
    this.enemySpawner.update(deltaTime);
  }

  pause(): void {
    this.state = GAME_STATES.PAUSED;

    GlobalEventEmitter.emit(EVENTS.SOUND_PLAY, GAME_SOUNDS.GamePause);

    this.uiManager.showPanel("pauseMenu");
  }

  resume(): void {
    this.state = GAME_STATES.PLAYING;

    GlobalEventEmitter.emit(EVENTS.SOUND_PLAY, GAME_SOUNDS.GameResume);

    this.uiManager.hideAllPanels();
  }

  returnToMenu(): void {
    this.state = GAME_STATES.MENU;

    GlobalEventEmitter.emit(EVENTS.SOUND_PLAY, GAME_SOUNDS.GameQuit);

    this.uiManager.toggleHud(false);
    this.uiManager.showPanel("mainMenu");
  }

  setupResize(): void {
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  gameOver(): void {
    this.state = GAME_STATES.GAME_OVER;
    this.uiManager.toggleHud(false);
    this.uiManager.showGameOverMenu();
  }

  missionCompleted(): void {
    this.state = GAME_STATES.MISSION_COMPLETED;
    GlobalEventEmitter.emit(EVENTS.SOUND_PLAY, GAME_SOUNDS.MissionCompleted);

    this.uiManager.toggleHud(false);
    this.uiManager.showMissionCompletedMenu();
  }

  checkMissionConditions(): void {
    if (this.state !== GAME_STATES.PLAYING) return;

    if (
      this.enemiesKilled >= missionsData.killCount ||
      this.accumulatedTime >= missionsData.surviveTime
    ) {
      GlobalEventEmitter.emit(EVENTS.MISSION_COMPLETED);
    }
  }
}
