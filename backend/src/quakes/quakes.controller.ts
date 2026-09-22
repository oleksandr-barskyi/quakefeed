import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { GetQuakesQueryDto } from './dto/get-quakes-query.dto';
import { QuakesService } from './quakes.service';
import { QuakeRecord } from './types/quake.types';

@Controller('quakes')
export class QuakesController {
  constructor(private readonly quakesService: QuakesService) {}

  @Get()
  async list(@Query() query: GetQuakesQueryDto): Promise<QuakeRecord[]> {
    return this.quakesService.getQuakes(query);
  }

  @Get(':id')
  async detail(@Param('id') id: string): Promise<QuakeRecord> {
    const quake = await this.quakesService.getQuakeById(id);
    if (!quake) {
      throw new NotFoundException(`Quake ${id} not found in the currently cached feed`);
    }
    return quake;
  }
}
