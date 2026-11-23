import type { DatasourceGameBoard } from './game-board.model';

export interface DatasourceGame {
  uuid: string;
  board: DatasourceGameBoard;
}
