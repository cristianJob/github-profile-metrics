import { GithubProfile, Repo } from '../domain/entities/github-profile';

export interface GithubPort {
  getProfile(username: string, signal?: AbortSignal): Promise<GithubProfile>;
  listRepos(username: string, signal?: AbortSignal): Promise<Repo[]>;
}
