import Game from "./core/Game";

export default function GameAPI() {
  const game = new Game();
  // @ts-ignore
  window.__game__ = game;
}
