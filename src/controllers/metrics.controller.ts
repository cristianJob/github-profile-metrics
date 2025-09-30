/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Param,
  Inject,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { UsernamePipe } from '../common/pipes/username.pipe';
import { GetMetricsUseCase } from '../usecases/get-metrics.usecase';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly getMetrics: GetMetricsUseCase) {}

  @Get(':username')
  async get(@Param('username', UsernamePipe) username: string) {
    try {
      const result = await this.getMetrics.execute({ username });
      return result;
    } catch (err: any) {
      if (err?.status === 404) throw new NotFoundException(err.message);
      if (err?.status === 429) throw new HttpException('rate limit', 429);
      throw new HttpException('GitHub error', 503);
    }
  }
}
