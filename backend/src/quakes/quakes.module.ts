import { Module } from '@nestjs/common';
import { QuakesCacheService } from './quakes-cache.service';
import { QuakesController } from './quakes.controller';
import { QuakesGateway } from './quakes.gateway';
import { QuakesService } from './quakes.service';
import { UsgsClientService } from './usgs-client.service';

@Module({
  controllers: [QuakesController],
  providers: [QuakesService, QuakesCacheService, UsgsClientService, QuakesGateway],
})
export class QuakesModule {}
