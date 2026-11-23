import type { Game } from '../../domain/models/game.model';

export interface GameRepository {
  save(game: Game): void;
  findByUuid(uuid: string): Game | undefined;
}
