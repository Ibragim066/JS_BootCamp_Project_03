import { Injectable } from '@nestjs/common';
import type { GameBoard } from '../../domain/models/game-board.model';
import type { Game } from '../../domain/models/game.model';
import type { GameService } from '../../domain/services/game.service.interface';
import type { GameRepository } from '../repositories/game.repository.interface';

@Injectable()
export class GameServiceImpl implements GameService {
  static readonly EMPTY_CELL = 0;
  static readonly USER_MARK = 1;
  static readonly COMPUTER_MARK = 2;

  constructor(private readonly repository: GameRepository) {}

  calculateNextMove(game: Game): Game {
    const previousGame = this.repository.findByUuid(game.uuid);
    const previousBoard = previousGame?.board ?? this.createEmptyBoard();

    if (!this.validateGameBoard(previousBoard, game.board)) {
      throw new Error('The submitted game board is invalid');
    }

    const updatedGame: Game = {
      uuid: game.uuid,
      board: this.cloneBoard(game.board),
    };

    if (!this.isGameOver(updatedGame.board)) {
      const move = this.findBestMove(updatedGame.board);

      if (move) {
        updatedGame.board[move.row][move.column] =
          GameServiceImpl.COMPUTER_MARK;
      }
    }

    this.repository.save(updatedGame);
    return updatedGame;
  }

  validateGameBoard(
    previousBoard: GameBoard,
    updatedBoard: GameBoard,
  ): boolean {
    if (
      !this.isValidBoard(previousBoard) ||
      !this.isValidBoard(updatedBoard) ||
      this.isGameOver(previousBoard)
    ) {
      return false;
    }

    let userMoves = 0;

    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        const previousCell = previousBoard[row][column];
        const updatedCell = updatedBoard[row][column];

        if (previousCell === updatedCell) {
          continue;
        }

        if (
          previousCell !== GameServiceImpl.EMPTY_CELL ||
          updatedCell !== GameServiceImpl.USER_MARK
        ) {
          return false;
        }

        userMoves += 1;
      }
    }

    return userMoves === 1;
  }

  isGameOver(board: GameBoard): boolean {
    if (!this.isValidBoard(board)) {
      return false;
    }

    return this.getWinner(board) !== null || board.flat().every(Boolean);
  }

  private findBestMove(
    board: GameBoard,
  ): { row: number; column: number } | null {
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestMove: { row: number; column: number } | null = null;

    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        if (board[row][column] !== GameServiceImpl.EMPTY_CELL) {
          continue;
        }

        board[row][column] = GameServiceImpl.COMPUTER_MARK;
        const score = this.minimax(board, 0, false);
        board[row][column] = GameServiceImpl.EMPTY_CELL;

        if (score > bestScore) {
          bestScore = score;
          bestMove = { row, column };
        }
      }
    }

    return bestMove;
  }

  private minimax(
    board: GameBoard,
    depth: number,
    isMaximizing: boolean,
  ): number {
    const winner = this.getWinner(board);

    if (winner === GameServiceImpl.COMPUTER_MARK) {
      return 10 - depth;
    }

    if (winner === GameServiceImpl.USER_MARK) {
      return depth - 10;
    }

    if (board.flat().every(Boolean)) {
      return 0;
    }

    let bestScore = isMaximizing
      ? Number.NEGATIVE_INFINITY
      : Number.POSITIVE_INFINITY;

    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        if (board[row][column] !== GameServiceImpl.EMPTY_CELL) {
          continue;
        }

        board[row][column] = isMaximizing
          ? GameServiceImpl.COMPUTER_MARK
          : GameServiceImpl.USER_MARK;
        const score = this.minimax(board, depth + 1, !isMaximizing);
        board[row][column] = GameServiceImpl.EMPTY_CELL;
        bestScore = isMaximizing
          ? Math.max(bestScore, score)
          : Math.min(bestScore, score);
      }
    }

    return bestScore;
  }

  private getWinner(board: GameBoard): number | null {
    const lines = [
      ...board,
      [board[0][0], board[1][0], board[2][0]],
      [board[0][1], board[1][1], board[2][1]],
      [board[0][2], board[1][2], board[2][2]],
      [board[0][0], board[1][1], board[2][2]],
      [board[0][2], board[1][1], board[2][0]],
    ];

    for (const [first, second, third] of lines) {
      if (
        first !== GameServiceImpl.EMPTY_CELL &&
        first === second &&
        second === third
      ) {
        return first;
      }
    }

    return null;
  }

  private isValidBoard(board: GameBoard): boolean {
    const allowedValues = [
      GameServiceImpl.EMPTY_CELL,
      GameServiceImpl.USER_MARK,
      GameServiceImpl.COMPUTER_MARK,
    ];

    return (
      board.length === 3 &&
      board.every(
        (row) =>
          row.length === 3 &&
          row.every(
            (cell) => Number.isInteger(cell) && allowedValues.includes(cell),
          ),
      )
    );
  }

  private createEmptyBoard(): GameBoard {
    return Array.from({ length: 3 }, () =>
      Array<number>(3).fill(GameServiceImpl.EMPTY_CELL),
    );
  }

  private cloneBoard(board: GameBoard): GameBoard {
    return board.map((row) => [...row]);
  }
}
