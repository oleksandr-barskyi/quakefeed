import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { UsgsClientService } from '../src/quakes/usgs-client.service';
import { sampleFeedPayload } from './fixtures/sample-feed';

describe('Quakes (e2e)', () => {
  let app: INestApplication;
  const fetchRange = jest.fn().mockResolvedValue(sampleFeedPayload);

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsgsClientService)
      .useValue({ fetchRange })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health reports ok', async () => {
    await request(app.getHttpServer()).get('/health').expect(200, { status: 'ok' });
  });

  it('GET /quakes returns the full parsed feed sorted by time by default', async () => {
    const response = await request(app.getHttpServer()).get('/quakes').expect(200);
    expect(response.body).toHaveLength(4);
    expect(response.body.map((q: { id: string }) => q.id)).toEqual([
      'us1000aaaa',
      'us1000bbbb',
      'us1000cccc',
      'us1000dddd',
    ]);
  });

  it('GET /quakes filters by minMagnitude and drops the null-magnitude event', async () => {
    const response = await request(app.getHttpServer())
      .get('/quakes')
      .query({ minMagnitude: 5 })
      .expect(200);
    expect(response.body.map((q: { id: string }) => q.id)).toEqual(['us1000aaaa', 'us1000dddd']);
  });

  it('GET /quakes sorts by magnitude', async () => {
    const response = await request(app.getHttpServer())
      .get('/quakes')
      .query({ sort: 'magnitude' })
      .expect(200);
    expect(response.body[0].id).toBe('us1000dddd');
    expect(response.body[response.body.length - 1].id).toBe('us1000cccc');
  });

  it('GET /quakes rejects an unknown query param', async () => {
    await request(app.getHttpServer()).get('/quakes').query({ bogus: '1' }).expect(400);
  });

  it('GET /quakes rejects an invalid range value', async () => {
    await request(app.getHttpServer()).get('/quakes').query({ range: 'year' }).expect(400);
  });

  it('GET /quakes/:id returns a single event once it has been cached', async () => {
    await request(app.getHttpServer()).get('/quakes').expect(200);
    const response = await request(app.getHttpServer()).get('/quakes/us1000bbbb').expect(200);
    expect(response.body.place).toBe('5km N of Test Town');
  });

  it('GET /quakes/:id returns 404 for an id that is not in the cached feed', async () => {
    await request(app.getHttpServer()).get('/quakes/does-not-exist').expect(404);
  });
});
