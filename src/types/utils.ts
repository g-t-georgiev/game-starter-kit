/** Unpacks arrays into unions, e.g., ["drift", "seek"] becomes "drift" | "seek" */
export type UnpackUnions<T> = T extends readonly (infer U)[] ? U : T;

export interface Position { x: number; y: number; };
export interface Transform extends Position { width: number; height: number; };
export interface Movable extends Transform { speed: number; };

export type DirectionVector = -1 | 0 | 1;
export enum Direction {
  Top,
  Right,
  Bottom,
  Left,
};
