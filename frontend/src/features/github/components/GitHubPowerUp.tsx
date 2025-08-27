import { Calendar, Check, ExternalLink, Github, Unlink, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Button, LoadingSpinner, Input, Modal } from "@/components";

import {
  useBoardGitHubRepository,
  useDisconnectGitHub,
  useGitHubConnection,
  useGitHubRepositories,
  useLinkRepositoryToBoard,
  useUnlinkRepositoryFromBoard,
} from "../hooks/useGitHub";
import type { GitHubRepository } from "../types";
import { GitHubAPI } from "../services";

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

interface GitHubPowerUpProps {
  isOpen: boolean;
  onClose: () => void;
  boardId?: string;
}

export const GitHubPowerUp: React.FC<GitHubPowerUpProps> = ({
  isOpen,
  onClose,
  boardId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // TanStack Query hooks
  const { data: isConnected = false } = useGitHubConnection();
  const {
    data: repositories = [],
    isLoading: isLoadingRepositories,
    refetch: refetchRepositories,
  } = useGitHubRepositories();
  const { data: boardRepoData } = useBoardGitHubRepository(boardId || "");
  const linkRepositoryMutation = useLinkRepositoryToBoard();
  const unlinkRepositoryMutation = useUnlinkRepositoryFromBoard();
  const disconnectMutation = useDisconnectGitHub();

  // Extract linked repository from board data
  const linkedRepository = boardRepoData?.repository || null;

  // Load repositories when connected
  React.useEffect(() => {
    if (isOpen && isConnected && repositories.length === 0) {
      refetchRepositories();
    }
  }, [isOpen, isConnected, repositories.length, refetchRepositories]);

  // Debounced search using useMemo
  const filteredRepositories = useMemo(() => {
    if (!searchQuery.trim()) {
      return repositories;
    }

    const query = searchQuery.toLowerCase().trim();
    return repositories.filter(
      (repo) =>
        repo.name.toLowerCase().includes(query) ||
        repo.full_name.toLowerCase().includes(query) ||
        (repo.description && repo.description.toLowerCase().includes(query))
    );
  }, [searchQuery, repositories]);

  const handleLinkRepository = async (repository: GitHubRepository) => {
    if (!boardId) return;

    linkRepositoryMutation.mutate(
      { boardId, repository },
      {
        onSuccess: () => {
          setSearchQuery("");
        },
      }
    );
  };

  const handleUnlinkRepository = async () => {
    if (!boardId) return;
    unlinkRepositoryMutation.mutate(boardId);
  };

  const handleConnectGitHub = () => {
    const authUrl = GitHubAPI.getAuthURL();
    window.location.href = authUrl;
  };

  const handleDisconnect = async () => {
    disconnectMutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="GitHub Power-Up">
      <div className="space-y-4">
        {!isConnected ? (
          <div className="text-center py-8">
            <Github className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Connect to GitHub
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect your GitHub account to view your repositories and attach
              them to tasks.
            </p>
            <Button onClick={handleConnectGitHub} className="w-full">
              <Github className="h-4 w-4 mr-2" />
              Connect GitHub Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Check className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Connected to GitHub
                  </p>
                  <p className="text-xs text-green-700">
                    Your repositories are available
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnectMutation.isPending}
              >
                {disconnectMutation.isPending ? (
                  <LoadingSpinner />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Linked Repository Section */}
            {boardId && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">
                    Linked Repository
                  </h4>
                </div>

                {linkedRepository ? (
                  <>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-blue-900">
                            {linkedRepository.full_name}
                          </div>
                          <div className="text-xs text-blue-700">
                            {linkedRepository.description || "No description"}
                          </div>
                          <div className="flex items-center text-xs text-blue-600 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Created {formatDate(linkedRepository.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={linkedRepository.html_url}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUnlinkRepository}
                            disabled={unlinkRepositoryMutation.isPending}
                            className="h-4 w-4 m-0 p-0"
                          >
                            {unlinkRepositoryMutation.isPending ? (
                              <LoadingSpinner />
                            ) : (
                              <Unlink className="h-4 w-4 " />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No repository linked to this board
                  </p>
                )}
              </div>
            )}

            {/* Your Repositories Section - Only show if no boardId or when explicitly requested */}
            {(!boardId || !linkedRepository) && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Your Repositories
                  </h4>
                </div>
                <div className="mb-3">
                  <Input
                    placeholder="Search your repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {isLoadingRepositories ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                      <span className="ml-2 text-sm text-gray-600">
                        Loading repositories...
                      </span>
                    </div>
                  ) : (
                    <>
                      {filteredRepositories.map((repo) => (
                        <div
                          key={repo.id}
                          className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
                          onClick={() =>
                            boardId ? handleLinkRepository(repo) : undefined
                          }
                        >
                          <div className="font-medium text-sm">
                            {repo.full_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {repo.description || "No description"}
                          </div>
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Created {formatDate(repo.created_at)}
                          </div>
                          {boardId && (
                            <div className="text-xs text-blue-600 mt-1">
                              Click to link to this board
                            </div>
                          )}
                        </div>
                      ))}
                      {repositories.length === 0 && !isLoadingRepositories && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No repositories found
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
