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
type PanelType = keyof PanelTypes;

const {
  HUD,
  TIMER,
  HEALTHBAR,
  KILLCOUNTER,
  MISSIONBRIEFING,
  ...panels
} = UI_ELEMS;

const PANELS_ID_MAP = new Map(Object.entries(panels)) as Map<PanelType, PanelTypes[PanelType]>;

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
  private buttonActionsMap: Map<ButtonActionId, (() => unknown)> = new Map();

  private missionBriefingDisplayTimeout: number | null = null;

  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;

    this.buttonActionsMap.set(BUTTON_ACTIONS.START, () => this.eventEmitter.emit(EVENTS.GAME_START));
    this.buttonActionsMap.set(BUTTON_ACTIONS.RESUME, () => this.eventEmitter.emit(EVENTS.GAME_RESUME));
    this.buttonActionsMap.set(BUTTON_ACTIONS.QUIT, () => this.eventEmitter.emit(EVENTS.GAME_MENU));

    this._addElementToCache(TIMER);
    this._addElementToCache(HEALTHBAR);
    this._addElementToCache(KILLCOUNTER);
    this._addElementToCache(MISSIONBRIEFING);

    this._attachEventListeners();
  }

  protected _onButtonHover(_e: PointerEvent | MouseEvent | TouchEvent, _button: HTMLElement): void {
    this.eventEmitter.emit(EVENTS.SOUND_PLAY, GAME_SOUNDS.ButtonHover);
  }

  protected _onButtonClick(_e: PointerEvent | MouseEvent | TouchEvent, button: HTMLElement): void {
    this.eventEmitter.emit(EVENTS.SOUND_PLAY, GAME_SOUNDS.ButtonClick);
    const action = button.dataset.action as ButtonActionId;
    this.buttonActionsMap.get(action)?.();
  }

  /**
   * Protected method that returns an already cached element reference if it exists,
   * or tries to query the DOM for that reference, caches it and returns if found.
   *
   * Otherwise throws a warning in the dev console, saying the element wasn't found.
   */
  protected _addElementToCache(name: string, ref?: HTMLElement): HTMLElement | void {
    const key = `#${name}`;
    const toCache = ref?.isConnected ? ref : document.querySelector<HTMLElement>(key);

    if (!toCache) {
      console.warn(`Couldn't find element with ID selector "${name}".`);

      return;
    }

    this.uiElementsMap.set(name, toCache);

    return toCache;
  }

  _attachEventListeners() {
    document.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", (e) => this._onButtonClick(e, button));
      button.addEventListener("mouseenter", (e) => this._onButtonHover(e, button));
    });

    this.eventEmitter.on(EVENTS.ENEMY_KILLED_COUNT, (count) => this.updateKillCounter(count));
  }

  getElement(name: string) {
    const element = this.uiElementsMap.get(name);

    if (!element?.isConnected) {
      return this._addElementToCache(name);
    }

    return element;
  }

  hideAllPanels(): void {
    PANELS_ID_MAP.forEach((name) => {
      const panel = this.getElement(name);

      panel?.classList.remove("active");
    });
  }

  showPanel(name: string): void {
    this.hideAllPanels();

    const toShow = this.getElement(name);

    toShow?.classList.add("active");
  }

  /**
   * Show or hide timer.
   *
   * Can be forcefully shown/hidden or depending on the state of
   * the existence/absence of "active" CSS class parameter, by default.
   */
  toggleHud(force?: boolean): void {
    const hud = this.getElement(HUD);

    if (!hud) return;

    const willForceToggle = force ?? !hud.classList.contains("active");

    hud.classList.toggle("active", willForceToggle);

    if (willForceToggle) return;

    this.hideMissionBriefing();
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

    const displayTime = hours > 0
      ? `${hoursText}:${minutesText}:${secondsText}`
      : `${minutesText}:${secondsText}`;

    timerElement.textContent = displayTime;
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

  showMissionBriefing() {
    const missionBriefing = this.getElement(MISSIONBRIEFING);

    if (!missionBriefing) return;

    if (this.missionBriefingDisplayTimeout) {
      clearTimeout(this.missionBriefingDisplayTimeout);
    }

    missionBriefing.textContent = this.buildMissionBriefingText();
    missionBriefing.classList.add("visible");
    this.missionBriefingDisplayTimeout = setTimeout(() => {
      missionBriefing.classList.remove("visible");
      this.missionBriefingDisplayTimeout = null;
    }, missionData.displayDuration);
  }

  hideMissionBriefing() {
    if (this.missionBriefingDisplayTimeout) {
      clearTimeout(this.missionBriefingDisplayTimeout);
    }

    const missionBriefing = this.getElement(MISSIONBRIEFING);

    if (!missionBriefing) return;

    missionBriefing.classList.remove("visible");
    this.missionBriefingDisplayTimeout = null;
  }

  buildMissionBriefingText() {
    return `Destroy ${missionData.killCount} enemies or survive ${missionData.surviveTime} seconds.`;
  }

  updateKillCounter(count: number) {
    const killCounter = this.getElement(KILLCOUNTER);

    if (!killCounter) return;

    killCounter.textContent = `${count} / ${missionData.killCount}`;
  }
}
