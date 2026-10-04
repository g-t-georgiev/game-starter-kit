import type EventEmitter from "@/core/EventEmitter";
import { EVENTS, GAME_SOUNDS } from "@/core/constants";
import missionData from "@/data/missionData";

const UI_ELEMS = Object.freeze({
  HUD: "hud",
  TIMER: "timer",
  HEALTHBAR: "healthBarFill",
  MISSIONBRIEFING: "missionBriefing",
  KILLCOUNTER: "killCounter",
  MAIN_MENU: "mainMenu",
  PAUSE_MENU: "pauseMenu",
  GAME_OVER_MENU: "gameOverMenu",
  MISSION_COMPLETED_MENU: "missionCompleteMenu",
  LOADING_SCREEN: "loadingScreen",
});

type HudTypes = Pick<
  typeof UI_ELEMS,
  | "HUD"
  | "HEALTHBAR"
  | "TIMER"
  | "MISSIONBRIEFING"
  | "KILLCOUNTER"
>;
type PanelTypes = Omit<typeof UI_ELEMS, keyof HudTypes>;

export type UIElementId = (typeof UI_ELEMS)[keyof typeof UI_ELEMS];
export type UIPanelId = PanelTypes[keyof PanelTypes];

const {
  HUD,
  TIMER,
  HEALTHBAR,
  KILLCOUNTER,
  MISSIONBRIEFING,
  ...panels
} = UI_ELEMS;

const PANELS_ID_MAP = new Map(Object.entries(panels)) as Map<keyof PanelTypes, UIPanelId>;

const BUTTON_ACTIONS = Object.freeze({
  START: "start",
  RESUME: "resume",
  QUIT: "quit",
});

type ButtonActions = typeof BUTTON_ACTIONS;
type ButtonActionId = ButtonActions[keyof ButtonActions];

export default class UIManager {
  private eventEmitter: EventEmitter;
  private uiElementsMap: Map<string, HTMLElement> = new Map();
  private buttonActionsMap: Map<ButtonActionId, () => unknown> = new Map();
  private missionBriefingDisplayTimeout: number | null = null;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;

    this.buttonActionsMap.set(BUTTON_ACTIONS.START, () => this.eventEmitter.emit(EVENTS.GAME_START));
    this.buttonActionsMap.set(BUTTON_ACTIONS.RESUME, () => this.eventEmitter.emit(EVENTS.GAME_RESUME));
    this.buttonActionsMap.set(BUTTON_ACTIONS.QUIT, () => this.eventEmitter.emit(EVENTS.GAME_MENU));

    this.addElementToCache(TIMER);
    this.addElementToCache(HEALTHBAR);
    this.addElementToCache(KILLCOUNTER);
    this.addElementToCache(MISSIONBRIEFING);

    this.attachEventListeners();
  }

  private onButtonHover(): void {
    this.eventEmitter.emit(EVENTS.SOUND_PLAY, GAME_SOUNDS.ButtonHover);
  }

  private onButtonClick(button: HTMLElement): void {
    this.eventEmitter.emit(EVENTS.SOUND_PLAY, GAME_SOUNDS.ButtonClick);
    const action = button.dataset.action as ButtonActionId;
    this.buttonActionsMap.get(action)?.();
  }

  /**
   * Returns an already cached element reference if it exists,
   * or tries to query the DOM for that reference, caches it and returns if found.
   *
   * Otherwise throws a warning in the dev console, saying the element wasn't found.
   */
  private addElementToCache(name: string, ref?: HTMLElement): HTMLElement | undefined {
    const key = `#${name}`;
    const toCache = ref?.isConnected ? ref : document.querySelector<HTMLElement>(key);

    if (!toCache) {
      console.warn(`Couldn't find element with ID selector "${name}".`);
      return;
    }

    this.uiElementsMap.set(name, toCache);
    return toCache;
  }

  private attachEventListeners(): void {
    const container = document.getElementById("gameContainer") ?? document.body;

    container.addEventListener("click", (e) => {
      const button = (e.target as HTMLElement).closest<HTMLElement>("button");
      if (button) this.onButtonClick(button);
    });

    container.addEventListener("mouseover", (e) => {
      const button = (e.target as HTMLElement).closest<HTMLElement>("button");
      if (button && e.relatedTarget && !button.contains(e.relatedTarget as Node)) {
        this.onButtonHover();
      }
    });

    this.eventEmitter.on(EVENTS.ENEMY_KILLED_COUNT, (count) => this.updateKillCounter(count));
  }

  getElement(name: UIElementId | string): HTMLElement | undefined {
    const element = this.uiElementsMap.get(name);

    if (!element?.isConnected) {
      return this.addElementToCache(name);
    }

    return element;
  }

  hideAllPanels(): void {
    PANELS_ID_MAP.forEach((name) => {
      const panel = this.getElement(name);
      panel?.classList.remove("active");
    });
  }

  showPanel(name: UIPanelId): void {
    this.hideAllPanels();
    const toShow = this.getElement(name);
    toShow?.classList.add("active");
  }

  toggleHud(force?: boolean): void {
    const hud = this.getElement(HUD);
    if (!hud) return;

    const willForceToggle = force ?? !hud.classList.contains("active");
    hud.classList.toggle("active", willForceToggle);

    if (!willForceToggle) {
      this.hideMissionBriefing();
    }
  }

  updateTimer(time: number): void {
    const timerElement = this.getElement(TIMER);
    if (!timerElement) return;

    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    const hoursText = `${hours}`.padStart(2, "0");
    const minutesText = `${minutes}`.padStart(2, "0");
    const secondsText = `${seconds}`.padStart(2, "0");

    timerElement.textContent =
      hours > 0
        ? `${hoursText}:${minutesText}:${secondsText}`
        : `${minutesText}:${secondsText}`;
  }

  updateHealthBar(health: number, maxHealth: number): void {
    const healthBar = this.getElement(HEALTHBAR);
    if (!healthBar) return;

    const ratio = Math.max(0, health / maxHealth);
    healthBar.style.setProperty("--health-pct", String(ratio));
  }

  showGameOverMenu(): void {
    this.showPanel(UI_ELEMS.GAME_OVER_MENU);
  }

  showMissionCompletedMenu(): void {
    this.showPanel(UI_ELEMS.MISSION_COMPLETED_MENU);
  }

  showMissionBriefing(): void {
    const missionBriefing = this.getElement(MISSIONBRIEFING);
    if (!missionBriefing) return;

    if (this.missionBriefingDisplayTimeout) {
      clearTimeout(this.missionBriefingDisplayTimeout);
    }

    missionBriefing.textContent = this.buildMissionBriefingText();
    missionBriefing.classList.add("visible");

    this.missionBriefingDisplayTimeout = window.setTimeout(() => {
      missionBriefing.classList.remove("visible");
      this.missionBriefingDisplayTimeout = null;
    }, missionData.displayDuration);
  }

  hideMissionBriefing(): void {
    if (this.missionBriefingDisplayTimeout) {
      clearTimeout(this.missionBriefingDisplayTimeout);
      this.missionBriefingDisplayTimeout = null;
    }

    const missionBriefing = this.getElement(MISSIONBRIEFING);
    missionBriefing?.classList.remove("visible");
  }

  buildMissionBriefingText(): string {
    return `Destroy ${missionData.killCount} enemies or survive ${missionData.surviveTime} seconds.`;
  }

  updateKillCounter(count: number): void {
    const killCounter = this.getElement(KILLCOUNTER);
    if (!killCounter) return;

    killCounter.textContent = `${count} / ${missionData.killCount}`;
  }
}
