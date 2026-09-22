import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { QuakesModule } from './quakes/quakes.module';

@Module({
  imports: [QuakesModule],
  controllers: [AppController],
})
export class AppModule {}
