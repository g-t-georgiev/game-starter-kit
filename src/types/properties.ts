export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface Movable extends Transform {
  speed: number;
};

export interface CircularCollider extends Transform {
  collisionRadius: number;
};

export interface EntityData {
  width: number;
  height: number;
  speed: number;
  maxHealth: number;
  collisionRadius: number;
  invincibilityDuration: number;
  pushbackForce: number;
  color: string;
  imageName: string;
  imagePath: string;
};

export enum Direction {
  Top,
  Right,
  Bottom,
  Left,
};

export type DirectionVector = -1 | 0 | 1;
