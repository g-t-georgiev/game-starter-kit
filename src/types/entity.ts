import type { ParticleConfig, ParticleType } from "@/types/particleBehaviors";

export type EntityMoveDirection = "Down" | "Up" | "Left" | "Right";
export type EntityMoveState = `move${EntityMoveDirection}`;
export type EntityState = "idle" | EntityMoveState | "hit" | "death";

export type EntityParticleConfig = { type: ParticleType } & Partial<ParticleConfig>;
export type EntityParticles<
  States extends string = Partial<EntityState>,
  Config extends EntityParticleConfig = EntityParticleConfig
> = { [K in States]?: Config; }

export interface AnimationConfig<SupportedStates extends string = EntityState> {
  row: number;
  frameCount: number;
  frameInterval: number;
  startFrame: number;
  loop: boolean;
  locked?: boolean;
  next?: SupportedStates;
}

export type AnimationStatesConfig<SupportedStates extends string = EntityState> = {
  [K in SupportedStates]: AnimationConfig<SupportedStates>;
}

export interface AnimationsData<SupportedStates extends string = EntityState> {
  spritesheets: string | string[] | { name: string; path: string; } | { name: string; path: string; }[];
  frameWidth: number;
  frameHeight: number;
  initialState: SupportedStates;
  states: Partial<AnimationStatesConfig<SupportedStates>>;
}

export interface EntityConfig<State extends string = EntityState> {
  width: number;
  height: number;
  speed: number;
  maxHealth: number;
  collisionRadius: number;
  invincibilityDuration: number;
  knockbackPower: number;
  color: string;
  soundEffects?: Partial<Record<State, string>>;
  particleEffects?: Partial<EntityParticles<State>>;
  animations?: AnimationsData<State>;
}

export interface SpritesheetAnimationData {
  spritesheet: string | null,
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export type PlayAnimationOptions = { force?: boolean; };
