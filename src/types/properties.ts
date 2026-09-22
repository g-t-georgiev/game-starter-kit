export interface Position {
  x: number;
  y: number;
};

export interface Transform extends Position {
  width: number;
  height: number;
};

export interface Movable extends Transform {
  speed: number;
};

export interface CircularCollider extends Transform {
  collisionRadius: number;
};

export interface EntityConfig {
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
