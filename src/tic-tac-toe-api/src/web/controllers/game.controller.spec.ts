import { BadRequestException } from '@nestjs/common';
import type { GameService } from '../../domain/services/game.service.interface';
import { GameController } from './game.controller';

describe('GameController', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000';
  let gameService: jest.Mocked<GameService>;
  let controller: GameController;

  beforeEach(() => {
    gameService = {
      calculateNextMove: jest.fn(),
      validateGameBoard: jest.fn(),
      isGameOver: jest.fn(),
    };
    controller = new GameController(gameService);
  });

  it('returns the game with the computer move', () => {
    gameService.calculateNextMove.mockReturnValue({
      uuid,
      board: [
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 0],
      ],
    });

    const result = controller.makeMove(uuid, {
      uuid,
      board: [
        [1, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
    });

    expect(result.board[1][1]).toBe(2);
    expect(gameService.calculateNextMove.mock.calls).toHaveLength(1);
  });

  it('rejects different UUIDs in the URL and request body', () => {
    expect(() =>
      controller.makeMove(uuid, {
        uuid: '550e8400-e29b-41d4-a716-446655440001',
        board: [
          [1, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      }),
    ).toThrow(BadRequestException);
  });

  it('returns a bad request with the service error description', () => {
    gameService.calculateNextMove.mockImplementation(() => {
      throw new Error('The submitted game board is invalid');
    });

    expect(() =>
      controller.makeMove(uuid, {
        uuid,
        board: [
          [2, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      }),
    ).toThrow('The submitted game board is invalid');
  });
});
