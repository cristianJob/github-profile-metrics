import { Inject, Injectable, Logger } from '@nestjs/common';
import type { GithubPort } from '../ports/github.port';
import type { CachePort } from '../ports/cache.port';

@Injectable()
export class GetMetricsUseCase {
  private readonly logger = new Logger(GetMetricsUseCase.name);
  constructor(
    @Inject('GithubPort') private readonly github: GithubPort,
    @Inject('CachePort') private readonly cache: CachePort,
  ) {}

  async execute({ username }: { username: string }) {
    const start = Date.now();
    this.logger.log(`Start metrics for ${username}`);
    const cacheKey = `metrics:${username}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit for ${username}`);
      this.logger.log(`Duration ${Date.now() - start}ms`);
      return cached;
    }

    // Use AbortController so request may be cancelled in future
    const controller = new AbortController();
    const signal = controller.signal;

    const profile = await this.github.getProfile(username, signal);
    const repos = await this.github.listRepos(username, signal);

    const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    const followersToReposRatio =
      profile.public_repos === 0
        ? null
        : Number((profile.followers / profile.public_repos).toFixed(2));

    const lastPushed = repos
      .map((r) => r.pushed_at)
      .filter(Boolean)
      .map((s) => new Date(s as string).getTime())
      .sort((a, b) => b - a)[0];

    const lastPushDaysAgo = lastPushed
      ? Math.floor((Date.now() - lastPushed) / (1000 * 60 * 60 * 24))
      : null;

    const out = {
      username,
      metrics: {
        totalStars,
        followersToReposRatio,
        lastPushDaysAgo,
      },
    };

    this.cache.set(cacheKey, out);
    this.logger.log(
      `End metrics for ${username} duration=${Date.now() - start}ms`,
    );
    return out;
  }
}
