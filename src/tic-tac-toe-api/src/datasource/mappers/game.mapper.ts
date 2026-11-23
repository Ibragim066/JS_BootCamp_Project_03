import type { Game } from '../../domain/models/game.model';
import type { DatasourceGame } from '../models/game.model';

export class DatasourceGameMapper {
  static toDatasource(game: Game): DatasourceGame {
    return {
      uuid: game.uuid,
      board: game.board.map((row) => [...row]),
    };
  }

  static toDomain(game: DatasourceGame): Game {
    return {
      uuid: game.uuid,
      board: game.board.map((row) => [...row]),
    };
  }
}
