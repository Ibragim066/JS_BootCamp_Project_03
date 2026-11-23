import type { GameBoard } from '../models/game-board.model';
import type { Game } from '../models/game.model';

export const GAME_SERVICE = Symbol('GAME_SERVICE');

export interface GameService {
  calculateNextMove(game: Game): Game;
  validateGameBoard(previousBoard: GameBoard, updatedBoard: GameBoard): boolean;
  isGameOver(board: GameBoard): boolean;
}
