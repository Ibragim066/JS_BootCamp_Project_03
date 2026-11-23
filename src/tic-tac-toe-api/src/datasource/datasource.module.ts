import { Module } from '@nestjs/common';
import { DomainModule } from '../domain/domain.module';
import { GAME_SERVICE } from '../domain/services/game.service.interface';
import { InMemoryGameRepository } from './repositories/in-memory-game.repository';
import { GameServiceImpl } from './services/game.service';
import { GameStorage } from './storage/game.storage';

@Module({
  imports: [DomainModule],
  providers: [
    GameStorage,
    InMemoryGameRepository,
    {
      provide: GAME_SERVICE,
      useFactory: (repository: InMemoryGameRepository) =>
        new GameServiceImpl(repository),
      inject: [InMemoryGameRepository],
    },
  ],
  exports: [GAME_SERVICE],
})
export class DatasourceModule {}
