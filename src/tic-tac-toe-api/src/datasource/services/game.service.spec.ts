import type { Game } from '../../domain/models/game.model';
import { InMemoryGameRepository } from '../repositories/in-memory-game.repository';
import { GameStorage } from '../storage/game.storage';
import { GameServiceImpl } from './game.service';

describe('GameServiceImpl', () => {
  let repository: InMemoryGameRepository;
  let service: GameServiceImpl;

  beforeEach(() => {
    repository = new InMemoryGameRepository(new GameStorage());
    service = new GameServiceImpl(repository);
  });

  it('calculates and saves the computer move', () => {
    const game: Game = {
      uuid: 'first-game',
      board: [
        [1, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
    };

    const result = service.calculateNextMove(game);

    expect(result.board.flat().filter((cell) => cell === 2)).toHaveLength(1);
    expect(repository.findByUuid(game.uuid)).toEqual(result);
    expect(game.board.flat().filter((cell) => cell === 2)).toHaveLength(0);
  });

  it('blocks the user winning move', () => {
    repository.save({
      uuid: 'blocking-game',
      board: [
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 0],
      ],
    });

    const result = service.calculateNextMove({
      uuid: 'blocking-game',
      board: [
        [1, 1, 0],
        [0, 2, 0],
        [0, 0, 0],
      ],
    });

    expect(result.board[0][2]).toBe(2);
  });

  it('rejects a board with an altered previous move', () => {
    repository.save({
      uuid: 'invalid-game',
      board: [
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 0],
      ],
    });

    expect(() =>
      service.calculateNextMove({
        uuid: 'invalid-game',
        board: [
          [0, 1, 0],
          [0, 2, 0],
          [0, 0, 0],
        ],
      }),
    ).toThrow('The submitted game board is invalid');
  });

  it('recognizes a completed game', () => {
    expect(
      service.isGameOver([
        [1, 1, 1],
        [0, 2, 0],
        [2, 0, 0],
      ]),
    ).toBe(true);
  });

  it('stores games with different UUIDs independently', () => {
    const first = service.calculateNextMove({
      uuid: 'game-a',
      board: [
        [1, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ],
    });
    const second = service.calculateNextMove({
      uuid: 'game-b',
      board: [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ],
    });

    expect(repository.findByUuid('game-a')).toEqual(first);
    expect(repository.findByUuid('game-b')).toEqual(second);
  });
});
