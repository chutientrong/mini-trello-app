import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { GitHubRepository } from "../types";
import { GitHubAPI } from "../services";

// Query keys
export const githubKeys = {
  all: ["github"] as const,
  connection: () => [...githubKeys.all, "connection"] as const,
  repositories: () => [...githubKeys.all, "repositories"] as const,
  boardRepository: (boardId: string) =>
    [...githubKeys.all, "board-repository", boardId] as const,
  branches: (repository: string) =>
    [...githubKeys.all, "branches", repository] as const,
  commits: (repository: string, branch: string) =>
    [...githubKeys.all, "commits", repository, branch] as const,
  issues: (repository: string, state: string) =>
    [...githubKeys.all, "issues", repository, state] as const,
  pullRequests: (repository: string, state: string) =>
    [...githubKeys.all, "pull-requests", repository, state] as const,
};

// Hook to check GitHub connection
export const useGitHubConnection = () => {
  return useQuery({
    queryKey: githubKeys.connection(),
    queryFn: GitHubAPI.checkConnection,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

// Hook to get repositories
export const useGitHubRepositories = () => {
  return useQuery({
    queryKey: githubKeys.repositories(),
    queryFn: GitHubAPI.getRepositories,
    enabled: false, // Only fetch when explicitly called
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// Hook to get board's linked repository
export const useBoardGitHubRepository = (boardId: string) => {
  return useQuery({
    queryKey: githubKeys.boardRepository(boardId),
    queryFn: () => GitHubAPI.getBoardGitHubRepository(boardId),
    enabled: !!boardId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 0,
  });
};

// Hook to link repository to board
export const useLinkRepositoryToBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      repository,
    }: {
      boardId: string;
      repository: GitHubRepository;
    }) => GitHubAPI.setBoardGitHubRepository(boardId, repository),
    onSuccess: (_, { boardId }) => {
      // Invalidate and refetch board repository
      queryClient.invalidateQueries({
        queryKey: githubKeys.boardRepository(boardId),
      });
    },
  });
};

// Hook to unlink repository from board
export const useUnlinkRepositoryFromBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardId: string) =>
      GitHubAPI.removeBoardGitHubRepository(boardId),
    onSuccess: (_, boardId) => {
      // Invalidate and refetch board repository
      queryClient.invalidateQueries({
        queryKey: githubKeys.boardRepository(boardId),
      });
    },
  });
};

// Hook to disconnect GitHub
export const useDisconnectGitHub = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: GitHubAPI.disconnect,
    onSuccess: () => {
      // Invalidate all GitHub queries
      queryClient.invalidateQueries({ queryKey: githubKeys.all });
      // Remove repositories from cache
      queryClient.removeQueries({ queryKey: githubKeys.repositories() });
    },
  });
};

// Hook to get repository branches
export const useRepositoryBranches = (repository: string) => {
  return useQuery({
    queryKey: githubKeys.branches(repository),
    queryFn: () => GitHubAPI.getRepositoryBranches(repository),
    enabled: !!repository,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get repository commits
export const useRepositoryCommits = (
  repository: string,
  branch: string = "main"
) => {
  return useQuery({
    queryKey: githubKeys.commits(repository, branch),
    queryFn: () => GitHubAPI.getRepositoryCommits(repository, branch),
    enabled: !!repository,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get repository issues
export const useRepositoryIssues = (
  repository: string,
  state: string = "open"
) => {
  return useQuery({
    queryKey: githubKeys.issues(repository, state),
    queryFn: () => GitHubAPI.getRepositoryIssues(repository, state),
    enabled: !!repository,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get repository pull requests
export const useRepositoryPullRequests = (
  repository: string,
  state: string = "open"
) => {
  return useQuery({
    queryKey: githubKeys.pullRequests(repository, state),
    queryFn: () => GitHubAPI.getRepositoryPullRequests(repository, state),
    enabled: !!repository,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
