import { Inject, Injectable } from '@nestjs/common';
import type { GithubPort } from '../ports/github.port';
import type { CachePort } from '../ports/cache.port';

@Injectable()
export class GetProfileUseCase {
  constructor(
    @Inject('GithubPort') private readonly github: GithubPort,
    @Inject('CachePort') private readonly cache: CachePort,
  ) {}

  async execute({ username }: { username: string }) {
    const cacheKey = `profile:${username}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    const profile = await this.github.getProfile(username);
    const out = {
      username: profile.username,
      name: profile.name,
      avatar: profile.avatar_url,
      bio: profile.bio,
      public_repos: profile.public_repos,
      followers: profile.followers,
      html_url: profile.html_url,
    };
    this.cache.set(cacheKey, out);
    return out;
  }
}
