import type { WebGameBoard } from './game-board.model';

export interface WebGame {
  uuid: string;
  board: WebGameBoard;
}
