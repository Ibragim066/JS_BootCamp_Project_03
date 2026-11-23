import type { GameBoard } from './game-board.model';

export interface Game {
  uuid: string;
  board: GameBoard;
}
