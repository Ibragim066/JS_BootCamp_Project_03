import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  GAME_SERVICE,
  type GameService,
} from '../../domain/services/game.service.interface';
import { WebGameMapper } from '../mappers/game.mapper';
import type { WebGame } from '../models/game.model';

@Controller('game')
export class GameController {
  constructor(
    @Inject(GAME_SERVICE) private readonly gameService: GameService,
  ) {}

  @Post(':uuid')
  @HttpCode(HttpStatus.OK)
  makeMove(
    @Param('uuid', new ParseUUIDPipe()) uuid: string,
    @Body() game: WebGame,
  ): WebGame {
    if (!game || game.uuid !== uuid) {
      throw new BadRequestException(
        'The UUID in the request body must match the UUID in the URL',
      );
    }

    try {
      const updatedGame = this.gameService.calculateNextMove(
        WebGameMapper.toDomain(game),
      );

      return WebGameMapper.toWeb(updatedGame);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'The submitted game is invalid';

      throw new BadRequestException(message);
    }
  }
}
