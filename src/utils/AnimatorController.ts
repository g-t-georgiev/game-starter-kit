import type { AnimationsData, AnimationConfig, SpritesheetAnimationData, PlayAnimationOptions, EntityState } from "@/types/entity";

export default class AnimatorController<SupportedStates extends string = EntityState> {
  readonly spritesheets: AnimationsData["spritesheets"];
  readonly frameWidth: AnimationsData["frameWidth"];
  readonly frameHeight: AnimationsData["frameHeight"];
  readonly states: AnimationsData["states"];

  /** Current spritesheet name */
  public spritesheet: string | null = null;
  /** Current animation name */
  public currentLabel: string | null = null;
  /** Current animation state */
  public currentState: AnimationConfig | null = null;
  /** Current animation frame */
  public currentFrame: number = 0;
  /** Tracks elapsed time since current animation frame start */
  public frameTimer: number = 0;
  /** Tracks whether currently playing non-looping animation has completed. */
  public finished: boolean = false;
  /** Tracks current spritesheet animation data. Used for rendering the animation. */
  public _frame: SpritesheetAnimationData = { spritesheet: null, sx: 0, sy: 0, sw: 0, sh: 0 };

  constructor(data: AnimationsData<SupportedStates>, playDefaultImmediately?: boolean) {
    this.spritesheets = data?.spritesheets;
    this.frameWidth = data?.frameWidth;
    this.frameHeight = data?.frameHeight;
    this.states = data?.states;

    this.chooseSpritesheet();
    if (playDefaultImmediately) this.play(data.initialState, { force: true });
  }

  /** Randomly choose between multiple spritesheet names. */
  chooseSpritesheet() {
    const isArrayOfSpritesheets = Array.isArray(this.spritesheets);
    if (!this.spritesheets || (isArrayOfSpritesheets && !this.spritesheets.length)) return;

    if (isArrayOfSpritesheets) {
      const index = Math.floor(Math.random() * this.spritesheets.length);
      const spritesheet = this.spritesheets[index];
      this.spritesheet = typeof spritesheet === "string" ? spritesheet : spritesheet.name;
    } else if (typeof this.spritesheets === "string") {
      this.spritesheet = this.spritesheets;
    } else {
      this.spritesheet = this.spritesheets.name;
    }
  }

  isCurrentLabel(label: string) {
    return this.currentLabel === label;
  }

  play(label: string, { force = false, }: PlayAnimationOptions = {}): boolean {
    const key = label as keyof AnimationsData["states"];
    const state = this.states[key];

    if (!state) {
      console.warn(`[Animator] Unknown state "${label}". Valid: ${Object.keys(this.states).join(", ")}`);
      return false;
    }

    if (!force && this.isCurrentLabel(label) && !this.finished) return false;
    if (!force && this.currentState?.locked) return false;

    this.currentLabel = label;
    this.currentState = state;
    this.currentFrame = state.startFrame;
    this.frameTimer = 0;
    this.finished = false;
    return true;
  }

  update(deltaTime: number): void {
    if (!this.currentState || this.finished) return;

    this.frameTimer += deltaTime;
    if (this.frameTimer >= this.currentState.frameInterval) {
      // Advances keyframes by 1 when the time interval for the current frame has passed
      this.frameTimer -= this.currentState.frameInterval;
      this.currentFrame++;

      const lastFrame = this.currentState.startFrame + this.currentState.frameCount - 1;
      // Either loop or mark animation as finished when last frame index is reached
      if (this.currentFrame > lastFrame) {
        if (this.currentState.loop) {
          this.currentFrame = this.currentState.startFrame;
        } else {
          this.currentFrame = lastFrame;
          this.finished = true;

          // Check whether next animation to transition to is supplied
          if (this.currentState.next)
            // Play next animation with "force" flag set to "true",
            // to bypass any restrictions such as "locked" flag or even,
            // if the next animation is the same as the currently finished one
            this.play(this.currentState.next, { force: true });
        }
      }
    }
  }

  getCurrentFrame() {
    if (!this.currentState) return null;

    const f = this._frame;
    f.spritesheet = this.spritesheet;
    f.sx = this.currentFrame * this.frameWidth;
    f.sy = this.currentState.row * this.frameHeight;
    f.sw = this.frameWidth;
    f.sh = this.frameHeight;
    return f;
  }

  reset(label?: string) {
    this.chooseSpritesheet();
    this.currentLabel = null;
    this.currentState = null;
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.finished = false;
    if (label) this.play(label, { force: true });
  }
}
