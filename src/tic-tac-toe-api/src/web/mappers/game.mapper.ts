import type { Game } from '../../domain/models/game.model';
import type { WebGame } from '../models/game.model';

export class WebGameMapper {
  static toDomain(game: WebGame): Game {
    return {
      uuid: game.uuid,
      board: game.board.map((row) => [...row]),
    };
  }

  static toWeb(game: Game): WebGame {
    return {
      uuid: game.uuid,
      board: game.board.map((row) => [...row]),
    };
  }
}
