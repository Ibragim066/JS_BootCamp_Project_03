import { Module } from '@nestjs/common';
import { DatasourceModule } from '../datasource/datasource.module';
import { GameController } from './controllers/game.controller';

@Module({
  imports: [DatasourceModule],
  controllers: [GameController],
})
export class WebModule {}
