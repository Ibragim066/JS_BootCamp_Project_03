import { Injectable } from '@nestjs/common';
import type { Game } from '../../domain/models/game.model';
import { DatasourceGameMapper } from '../mappers/game.mapper';
import { GameStorage } from '../storage/game.storage';
import type { GameRepository } from './game.repository.interface';

@Injectable()
export class InMemoryGameRepository implements GameRepository {
  constructor(private readonly storage: GameStorage) {}

  save(game: Game): void {
    this.storage.save(DatasourceGameMapper.toDatasource(game));
  }

  findByUuid(uuid: string): Game | undefined {
    const game = this.storage.findByUuid(uuid);

    return game ? DatasourceGameMapper.toDomain(game) : undefined;
  }
}
