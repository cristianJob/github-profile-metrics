/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable, Inject } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { GithubPort } from '../ports/github.port';
import { GithubProfile, Repo } from '../domain/entities/github-profile';

@Injectable()
export class GithubHttpAdapter implements GithubPort {
  private client: AxiosInstance;
  private token?: string;

  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        'User-Agent':
          process.env.USER_AGENT || 'nestjs-hexagonal-github-metrics',
        Authorization: this.token ? `token ${this.token}` : undefined,
      },
      timeout: 10_000,
    });
  }

  private async handleRateLimitError(e: any) {
    if (e?.response?.status === 403) {
      const msg = e?.response?.data?.message || 'rate limit';
      const isRate = /rate limit/i.test(msg);
      if (isRate) {
        const err: any = new Error('rate limit');
        err.status = 429;
        throw err;
      }
    }
    throw e;
  }

  async getProfile(
    username: string,
    signal?: AbortSignal,
  ): Promise<GithubProfile> {
    try {
      const res = await this.client.get(`/users/${username}`, { signal });
      const d = res.data;
      return {
        username: d.login,
        name: d.name,
        avatar_url: d.avatar_url,
        bio: d.bio,
        public_repos: d.public_repos,
        followers: d.followers,
        html_url: d.html_url,
      };
    } catch (e) {
      await this.handleRateLimitError(e);
      if (e?.response?.status === 404) {
        const err: any = new Error('not found');
        err.status = 404;
        throw err;
      }
      throw e;
    }
  }

  async listRepos(username: string, signal?: AbortSignal): Promise<Repo[]> {
    try {
      const perPage = 100;
      let page = 1;
      const out: Repo[] = [];
      while (true) {
        const res = await this.client.get(`/users/${username}/repos`, {
          params: { per_page: perPage, page, type: 'public', sort: 'pushed' },
          signal,
        });
        const items = res.data as any[];
        out.push(
          ...items.map((i) => ({
            name: i.name,
            stargazers_count: i.stargazers_count,
            pushed_at: i.pushed_at,
          })),
        );
        if (items.length < perPage) break;
        page++;
      }
      return out;
    } catch (e) {
      await this.handleRateLimitError(e);
      if (e?.response?.status === 404) {
        const err: any = new Error('not found');
        err.status = 404;
        throw err;
      }
      throw e;
    }
  }
}
