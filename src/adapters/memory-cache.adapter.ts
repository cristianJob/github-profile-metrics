import { Injectable } from '@nestjs/common';
import { CachePort } from '../ports/cache.port';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@Injectable()
export class MemoryCacheAdapter implements CachePort {
  private store = new Map<string, CacheEntry<any>>();
  private defaultTtl = parseInt(process.env.CACHE_TTL_SECONDS || '300', 10);

  get<T>(key: string): T | undefined {
    const e = this.store.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return e.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds?: number) {
    const ttl = (ttlSeconds ?? this.defaultTtl) * 1000;
    this.store.set(key, { value, expiresAt: Date.now() + ttl });
  }
}
