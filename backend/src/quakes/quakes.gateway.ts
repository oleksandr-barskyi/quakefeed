import { Logger } from '@nestjs/common';
import {
  OnGatewayInit,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { diffQuakes } from './lib/diff-quakes';
import { QuakesService } from './quakes.service';
import { QuakeRange, QuakeRecord } from './types/quake.types';

export const POLL_INTERVAL_MS = 30_000;

@WebSocketGateway({ cors: { origin: '*' } })
export class QuakesGateway implements OnGatewayInit, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(QuakesGateway.name);
  private readonly lastKnown = new Map<string, QuakeRecord>();
  private timer?: ReturnType<typeof setInterval>;

  constructor(private readonly quakesService: QuakesService) {}

  afterInit(): void {
    if (process.env.NODE_ENV === 'test') return;
    this.timer = setInterval(() => {
      this.poll().catch((error: unknown) => {
        this.logger.warn(`USGS poll failed: ${String(error)}`);
      });
    }, POLL_INTERVAL_MS);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`client disconnected: ${client.id}`);
  }

  stopPolling(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async poll(): Promise<void> {
    const feed = await this.quakesService.getFeed(QuakeRange.Day);
    const changes = diffQuakes(this.lastKnown, feed.quakes);
    if (changes.length === 0) return;

    for (const change of changes) {
      this.lastKnown.set(change.quake.id, change.quake);
    }

    this.server.emit('quakes:update', { changes, checkedAt: Date.now() });
  }
}
