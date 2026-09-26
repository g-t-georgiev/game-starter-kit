import type { Position } from "@/types/utils";
import type ObjectPooler from "@/utils/ObjectPooler";
import type Particle from "@/entities/Particle";
import type { RadialBehavior, ImplosionBehavior } from "@/entities/behaviors/particles";

export type ParticleType = "sparks" | "smoke" | "implosion";
export type ParticlePools = Record<ParticleType, ObjectPooler<Particle>>;

export type ParticleBehaviorType = "radial" | "implosion";

export interface ParticleConfig {
  count: number;
  color: string;
  speed: number;
  lifetime: number;
  size: number;
  opacity: number;
  fade: boolean;
  shrink: boolean;
  gravity: Position;
  behaviorType: ParticleBehaviorType;
};

export type ParticlesConfig = {
  [Type in ParticleType]: ParticleConfig;
}

/** Particle behavior "type" to class constructor map. */
export interface ParticleBehaviorMap {
  radial: RadialBehavior;
  implosion: ImplosionBehavior;
};

/** Particle behavior "type" to `init` method arguments map. */
export interface ParticleBehaviorInitMap {
  radial: [];
  implosion: [originX: number, originY: number];
};

export type ParticleBehaviorRegistry = {
  [K in ParticleBehaviorType]: () => ParticleBehaviorMap[K];
};

/** Particle behavior type constraint for the `Particle` class' `behavior` field. */
export type ParticleBehavior = ParticleBehaviorMap[keyof ParticleBehaviorMap];
/**
 * Particle behavior interface for the behavior classes.
 * Declares optional and mandatory class fiedls and methods, as well as
 * their specific parameters if they differ, as is the case with the `init` method,
 * which is optional but parameter types can differ per behavior type.
 */
export interface IParticleBehavior<T extends ParticleBehaviorType> {
  readonly type: T;
  init?(...args: ParticleBehaviorInitMap[T]): void;
  update(particle: Particle, deltaTime: number): void;
};
