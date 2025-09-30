export interface GithubProfile {
  username: string;
  name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  public_repos: number;
  followers: number;
  html_url?: string;
}

export interface Repo {
  name: string;
  stargazers_count: number;
  pushed_at?: string | null;
}
