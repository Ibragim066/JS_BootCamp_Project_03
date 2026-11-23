import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import type { WebGame } from './../src/web/models/game.model';

interface ErrorResponse {
  message: string;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  const firstUuid = '550e8400-e29b-41d4-a716-446655440000';
  const secondUuid = '550e8400-e29b-41d4-a716-446655440001';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/game/:uuid (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post(`/game/${firstUuid}`)
      .send({
        uuid: firstUuid,
        board: [
          [1, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      })
      .expect(200);
    const responseBody = response.body as WebGame;

    expect(responseBody.uuid).toBe(firstUuid);
    expect(responseBody.board.flat().filter((cell) => cell === 2)).toHaveLength(
      1,
    );
  });

  it('returns an error description for an invalid move', async () => {
    const response = await request(app.getHttpServer())
      .post(`/game/${firstUuid}`)
      .send({
        uuid: firstUuid,
        board: [
          [2, 0, 0],
          [0, 0, 0],
          [0, 0, 0],
        ],
      })
      .expect(400);
    const responseBody = response.body as ErrorResponse;

    expect(responseBody.message).toBe('The submitted game board is invalid');
  });

  it('supports games with different UUIDs', async () => {
    const [firstResponse, secondResponse] = await Promise.all([
      request(app.getHttpServer())
        .post(`/game/${firstUuid}`)
        .send({
          uuid: firstUuid,
          board: [
            [1, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
          ],
        }),
      request(app.getHttpServer())
        .post(`/game/${secondUuid}`)
        .send({
          uuid: secondUuid,
          board: [
            [0, 0, 0],
            [0, 1, 0],
            [0, 0, 0],
          ],
        }),
    ]);

    expect(firstResponse.status).toBe(200);
    expect(secondResponse.status).toBe(200);
    expect((firstResponse.body as WebGame).uuid).toBe(firstUuid);
    expect((secondResponse.body as WebGame).uuid).toBe(secondUuid);
  });

  afterEach(async () => {
    await app.close();
  });
});
