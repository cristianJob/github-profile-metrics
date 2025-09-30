/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './controllers/health.controller';
import { ProfilesController } from './controllers/profiles.controller';
import { MetricsController } from './controllers/metrics.controller';
import { GithubHttpAdapter } from './adapters/github-http.adapter';
import { MemoryCacheAdapter } from './adapters/memory-cache.adapter';
import { GetProfileUseCase } from './usecases/get-profile.usecase';
import { GetMetricsUseCase } from './usecases/get-metrics.usecase';

@Module({
  imports: [],
  controllers: [
    AppController,
    HealthController,
    ProfilesController,
    MetricsController,
  ],
  providers: [
    AppService,
    { provide: 'GithubPort', useClass: GithubHttpAdapter },
    { provide: 'CachePort', useClass: MemoryCacheAdapter },
    GetProfileUseCase,
    GetMetricsUseCase,
  ],
})
export class AppModule {}
