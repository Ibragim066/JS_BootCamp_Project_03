import { randomUUID } from 'node:crypto';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

type Board = number[][];

interface GameResponse {
  uuid: string;
  board: Board;
}

const EMPTY = 0;
const USER = 1;
const COMPUTER = 2;

function printBoard(board: Board): void {
  const symbols = [' ', 'X', 'O'];

  console.log('\n    1   2   3');
  board.forEach((row, index) => {
    console.log(
      `${index + 1}   ${row.map((cell) => symbols[cell]).join(' | ')}`,
    );
    if (index < 2) console.log('   ---+---+---');
  });
  console.log('');
}

function getWinner(board: Board): number | null {
  const lines = [
    ...board,
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
    [board[0][0], board[1][1], board[2][2]],
    [board[0][2], board[1][1], board[2][0]],
  ];

  for (const [first, second, third] of lines) {
    if (first !== EMPTY && first === second && second === third) return first;
  }

  return null;
}

function findComputerMove(before: Board, after: Board): string | null {
  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      if (before[row][column] === EMPTY && after[row][column] === COMPUTER) {
        return `Компьютер: (${row + 1}, ${column + 1})`;
      }
    }
  }

  return null;
}

async function play(): Promise<void> {
  const terminal = createInterface({ input, output });
  const uuid = randomUUID();
  let board: Board = Array.from({ length: 3 }, () =>
    Array<number>(3).fill(EMPTY),
  );
  const moves: string[] = [];

  console.log('Крестики-нолики');
  console.log('Вы играете X, компьютер играет O.');
  console.log('Введите строку и столбец от 1 до 3, например: 1 2');
  printBoard(board);

  try {
    while (true) {
      const answer = await terminal.question('Ваш ход: ');
      const [rowValue, columnValue] = answer.trim().split(/\s+/).map(Number);
      const row = rowValue - 1;
      const column = columnValue - 1;

      if (
        !Number.isInteger(row) ||
        !Number.isInteger(column) ||
        row < 0 ||
        row > 2 ||
        column < 0 ||
        column > 2
      ) {
        console.log('Введите два числа от 1 до 3, например: 2 3.');
        continue;
      }

      if (board[row][column] !== EMPTY) {
        console.log('Эта клетка уже занята. Выберите другую.');
        continue;
      }

      board[row][column] = USER;
      moves.push(`Вы: (${row + 1}, ${column + 1})`);
      const boardBeforeComputerMove = board.map((boardRow) => [...boardRow]);
      const response = await fetch(`http://localhost:3000/game/${uuid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid, board }),
      });

      if (!response.ok) {
        const errorBody = (await response.json()) as { message?: string };
        throw new Error(
          errorBody.message ?? `Ошибка сервера: ${response.status}`,
        );
      }

      const game = (await response.json()) as GameResponse;
      const computerMove = findComputerMove(
        boardBeforeComputerMove,
        game.board,
      );
      if (computerMove) moves.push(computerMove);
      board = game.board;

      printBoard(board);
      console.log(`Ходы: ${moves.join(' → ')}\n`);

      const winner = getWinner(board);
      if (winner === USER) {
        console.log('🎉 Вы победили!');
        break;
      }
      if (winner === COMPUTER) {
        console.log('Компьютер победил. Попробуйте ещё раз!');
        break;
      }
      if (board.flat().every((cell) => cell !== EMPTY)) {
        console.log('Ничья!');
        break;
      }
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error(`Не удалось продолжить игру: ${message}`);
    console.error('Проверьте, что сервер запущен командой npm run start:dev.');
    process.exitCode = 1;
  } finally {
    terminal.close();
  }
}

void play();
