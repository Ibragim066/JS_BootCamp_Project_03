import { Injectable } from '@nestjs/common';
import type { DatasourceGame } from '../models/game.model';

@Injectable()
export class GameStorage {
  private readonly games = new Map<string, DatasourceGame>();

  save(game: DatasourceGame): void {
    this.games.set(game.uuid, this.clone(game));
  }

  findByUuid(uuid: string): DatasourceGame | undefined {
    const game = this.games.get(uuid);

    return game ? this.clone(game) : undefined;
  }

  private clone(game: DatasourceGame): DatasourceGame {
    return {
      uuid: game.uuid,
      board: game.board.map((row) => [...row]),
    };
  }
}
