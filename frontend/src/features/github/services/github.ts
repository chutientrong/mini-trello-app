import { apiClient } from "@/services/apiClient";
import type {
  GitHubBranch,
  GitHubCommit,
  GitHubIssue,
  GitHubPullRequest,
  GitHubRepository,
  GitHubUser,
} from "../types";

export class GitHubAPI {
  private static clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  private static redirectUri = `${window.location.origin}/auth/github/callback`;

  static getAuthURL(): string {
    const state = Math.random().toString(36).substring(7);

    // Test localStorage first
    try {
      localStorage.setItem("test_state", "test_value");
      const testValue = localStorage.getItem("test_state");
      console.log("localStorage test:", {
        testValue,
        working: testValue === "test_value",
      });
      localStorage.removeItem("test_state");

      // Only proceed if localStorage is working
      if (testValue === "test_value") {
        localStorage.setItem("github_oauth_state", state);
        const savedState = localStorage.getItem("github_oauth_state"); // Verify immediately

        console.log("GitHub OAuth URL generated:", {
          state,
          savedState,
          stateSaved: state === savedState,
          clientId: this.clientId ? "present" : "missing",
          redirectUri: this.redirectUri,
        });

        return `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=user:email,repo&state=${state}`;
      } else {
        throw new Error("localStorage test failed");
      }
    } catch (error) {
      console.error("localStorage error:", error);
      // Fallback: use sessionStorage or just proceed without state
      try {
        sessionStorage.setItem("github_oauth_state", state);
        console.log("Using sessionStorage as fallback");
      } catch (sessionError) {
        console.error("sessionStorage also failed:", sessionError);
      }

      return `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=user:email,repo&state=${state}`;
    }
  }

  static async linkGitHubAccount(
    code: string
  ): Promise<{ message: string; githubUser: GitHubUser }> {
    try {
      console.log(
        "Linking GitHub account with code:",
        code ? "present" : "missing"
      );

      const response = await apiClient.post<{
        message: string;
        githubUser: GitHubUser;
      }>("/github/auth/link", {
        code,
      });

      console.log("GitHub link response:", response);

      return response;
    } catch (error) {
      console.error("GitHub OAuth error:", error);
      throw new Error("Failed to link GitHub account");
    }
  }

  static async checkConnection(): Promise<boolean> {
    try {
      const response = await apiClient.get<{ connected: boolean }>(
        "/github/connection"
      );
      return response.connected;
    } catch {
      return false;
    }
  }

  static async getRepositories(): Promise<GitHubRepository[]> {
    const response = await apiClient.get<GitHubRepository[]>(
      "/github/repositories"
    );
    return response;
  }

  static async disconnect(): Promise<void> {
    await apiClient.delete("/github/disconnect");
  }

  static async setBoardGitHubRepository(
    boardId: string,
    repository: GitHubRepository
  ): Promise<void> {
    await apiClient.post(`/boards/${boardId}/github-repository`, {
      repository,
    });
  }

  static async getBoardGitHubRepository(
    boardId: string
  ): Promise<{ repository: GitHubRepository | null }> {
    const response = await apiClient.get<{
      repository: GitHubRepository | null;
    }>(`/boards/${boardId}/github-repository`);
    return response;
  }

  static async removeBoardGitHubRepository(boardId: string): Promise<void> {
    await apiClient.delete(`/boards/${boardId}/github-repository`);
  }

  // Repository-specific methods
  static async getRepositoryBranches(
    repository: string
  ): Promise<GitHubBranch[]> {
    const response = await apiClient.get<GitHubBranch[]>(
      `/github/repos/${repository}/branches`
    );
    return response;
  }

  static async getRepositoryCommits(
    repository: string,
    branch: string = "main"
  ): Promise<GitHubCommit[]> {
    const response = await apiClient.get<GitHubCommit[]>(
      `/github/repos/${repository}/commits?branch=${branch}`
    );
    return response;
  }

  static async getRepositoryIssues(
    repository: string,
    state: string = "open"
  ): Promise<GitHubIssue[]> {
    const response = await apiClient.get<GitHubIssue[]>(
      `/github/repos/${repository}/issues?state=${state}`
    );
    return response;
  }

  static async getRepositoryPullRequests(
    repository: string,
    state: string = "open"
  ): Promise<GitHubPullRequest[]> {
    const response = await apiClient.get<GitHubPullRequest[]>(
      `/github/repos/${repository}/pulls?state=${state}`
    );
    return response;
  }
}

export default GitHubAPI;
