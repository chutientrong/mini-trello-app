import {
  Button,
  Checkbox,
  ConfirmModal,
  DatePicker,
  Dropdown,
  Input,
  Modal,
  Textarea,
} from "@/components";

import { useBoardMembers } from "@/features/boards/hooks/useBoardMembers";
import { GitHubPowerUp } from "@/features/github/components/GitHubPowerUp";
import {
  useBoardGitHubRepository,
  useRepositoryBranches,
  useRepositoryCommits,
  useRepositoryIssues,
  useRepositoryPullRequests,
} from "@/features/github/hooks/useGitHub";
import type {
  GitHubBranch,
  GitHubCommit,
  GitHubIssue,
  GitHubPullRequest,
} from "@/features/github/types";
import {
  AlignLeft,
  Archive,
  Github,
  List,
  X
} from "lucide-react";
import React, { memo, useCallback, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  useAssignMember,
  useRemoveMemberAssignment,
  useTask,
} from "../hooks/useTasks";
import type { Task } from "../types";
import { MemberDropdown } from "./MemberDropdown";
import { PriorityBadge } from "./PriorityBadge";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  isLoading?: boolean;
  cardTitle: string;
}

const TaskDetailModalComponent: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onUpdateTask,
  onDeleteTask,
  isLoading = false,
  cardTitle,
}) => {
  const { boardId } = useParams<{ boardId: string }>();
  const [title, setTitle] = useState(task?.title || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [description, setDescription] = useState(task?.description || "");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [comment, setComment] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [dueComplete, setDueComplete] = useState(task?.dueComplete || false);
  const [showGitHubPowerUp, setShowGitHubPowerUp] = useState(false);

  // Refs for click-outside detection
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Get board members data
  const { data: boardMembersData } = useBoardMembers(boardId!);
  const assignMemberMutation = useAssignMember();
  const removeMemberMutation = useRemoveMemberAssignment();

  // Get the latest task data from the server
  const { data: taskData } = useTask(
    boardId!,
    task?.cardId || "",
    task?.id || ""
  );

  // GitHub data
  const { data: boardRepoData } = useBoardGitHubRepository(boardId!);
  const linkedRepository = boardRepoData?.repository;

  const { data: branches = [] } = useRepositoryBranches(
    linkedRepository?.full_name || ""
  );
  const { data: commits = [] } = useRepositoryCommits(
    linkedRepository?.full_name || "",
    "main"
  );
  const { data: issues = [] } = useRepositoryIssues(
    linkedRepository?.full_name || "",
    "open"
  );
  const { data: pullRequests = [] } = useRepositoryPullRequests(
    linkedRepository?.full_name || "",
    "open"
  );

  // Use the fetched task data if available, otherwise fall back to the prop
  const currentTask = taskData?.task || task;

  // Update title and description when task changes
  React.useEffect(() => {
    setTitle(currentTask?.title || "");
    setDescription(currentTask?.description || "");
    setPriority(currentTask?.priority || "medium");
    setDueDate(currentTask?.dueDate || "");
    setDueComplete(currentTask?.dueComplete || false);
  }, [
    currentTask?.title,
    currentTask?.description,
    currentTask?.priority,
    currentTask?.dueDate,
    currentTask?.dueComplete,
  ]);

  const handleSaveTitle = useCallback(async () => {
    if (!currentTask) return;
    if (title.trim() === currentTask.title) {
      setIsEditingTitle(false);
      return;
    }
    try {
      await onUpdateTask(currentTask.id, { title: title.trim() });
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Failed to update task title:", error);
      setTitle(currentTask.title || "");
    }
  }, [currentTask, title, onUpdateTask]);

  const handleCancelTitle = useCallback(() => {
    setTitle(currentTask?.title || "");
    setIsEditingTitle(false);
  }, [currentTask?.title]);

  const handleSaveDescription = useCallback(async () => {
    if (!currentTask) return;
    if (description === currentTask.description) {
      setIsEditingDescription(false);
      return;
    }

    try {
      await onUpdateTask(currentTask.id, { description });
      setIsEditingDescription(false);
    } catch (error) {
      console.error("Failed to update task description:", error);
      setDescription(currentTask.description || "");
    }
  }, [currentTask, description, onUpdateTask]);

  const handleCancelDescription = useCallback(() => {
    setDescription(currentTask?.description || "");
    setIsEditingDescription(false);
  }, [currentTask?.description]);

  const handleAddComment = useCallback(async () => {
    if (!currentTask || !comment.trim()) return;

    console.log("Adding comment:", comment);
    setComment("");
  }, [currentTask, comment]);

  const handleArchiveTask = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  // GitHub attachment handlers
  const handleAttachBranch = useCallback((branch: GitHubBranch) => {
    console.log("Attaching branch:", branch);
  }, []);

  const handleAttachCommit = useCallback((commit: GitHubCommit) => {
    console.log("Attaching commit:", commit);
  }, []);

  const handleAttachIssue = useCallback((issue: GitHubIssue) => {
    console.log("Attaching issue:", issue);
  }, []);

  const handleAttachPullRequest = useCallback((pr: GitHubPullRequest) => {
    console.log("Attaching pull request:", pr);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!currentTask) return;

    try {
      await onDeleteTask(currentTask.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }, [currentTask, onDeleteTask, onClose]);

  const handleUpdatePriority = useCallback(
    async (newPriority: "low" | "medium" | "high") => {
      if (!currentTask) return;

      try {
        await onUpdateTask(currentTask.id, { priority: newPriority });
        setPriority(newPriority);
      } catch (error) {
        console.error("Failed to update priority:", error);
      }
    },
    [currentTask, onUpdateTask]
  );

  const handleUpdateDueDate = useCallback(
    async (newDueDate: string) => {
      if (!currentTask) return;

      try {
        const dueDateValue = newDueDate.trim() === "" ? undefined : newDueDate;

        let finalDueDate = dueDateValue;
        if (dueDateValue && dueDateValue.includes("T")) {
          if (!dueDateValue.includes("Z") && !dueDateValue.includes("+")) {
            finalDueDate = dueDateValue + "Z";
          }
        }

        await onUpdateTask(currentTask.id, { dueDate: finalDueDate });
        setDueDate(newDueDate);
      } catch (error) {
        console.error("Failed to update due date:", error);
      }
    },
    [currentTask, onUpdateTask]
  );

  const handleAssignMember = useCallback(
    async (memberId: string) => {
      if (!currentTask || !boardId) return;

      try {
        await assignMemberMutation.mutateAsync({
          boardId,
          cardId: currentTask.cardId,
          taskId: currentTask.id,
          memberId,
        });
      } catch (error) {
        console.error("Failed to assign member:", error);
      }
    },
    [currentTask, boardId, assignMemberMutation]
  );

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      if (!currentTask || !boardId) return;

      try {
        await removeMemberMutation.mutateAsync({
          boardId,
          cardId: currentTask.cardId,
          taskId: currentTask.id,
          memberId,
        });
      } catch (error) {
        console.error("Failed to remove member:", error);
      }
    },
    [currentTask, boardId, removeMemberMutation]
  );

  const handleDueCompleteChange = useCallback(
    async (checked: boolean) => {
      if (!currentTask) return;
      try {
        setDueComplete(checked);
        await onUpdateTask(currentTask.id, { dueComplete: checked });
      } catch (error) {
        console.error("Failed to update task completion:", error);
        // Revert the state if the update failed
        setDueComplete(!checked);
      }
    },
    [currentTask, onUpdateTask]
  );

  if (!currentTask) {
    return null;
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={currentTask.title || ""}
        size="xl"
        hideHeader={true}
      >
        <div
          className="flex flex-col h-[80vh]"
          onClick={(e) => {
            if (
              isEditingTitle &&
              titleInputRef.current &&
              !titleInputRef.current.contains(e.target as Node)
            ) {
              handleSaveTitle();
            }
            if (
              isEditingDescription &&
              descriptionTextareaRef.current &&
              !descriptionTextareaRef.current.contains(e.target as Node)
            ) {
              handleSaveDescription();
            }
          }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  checked={dueComplete}
                  onChange={handleDueCompleteChange}
                  className="mt-1"
                />
                {isEditingTitle ? (
                  <div className="flex-1">
                    <Input
                      ref={titleInputRef}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-3xl font-semibold text-gray-900 border-none p-0 focus:ring-0 focus:border-none"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveTitle();
                        } else if (e.key === "Escape") {
                          handleCancelTitle();
                        }
                      }}
                    />
                  </div>
                ) : (
                  <h2
                    className="text-3xl font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {currentTask.title}
                  </h2>
                )}
              </div>
              <p className="text-sm text-gray-600">in list {cardTitle}</p>
            </div>
            <Button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* Main Content Area */}
          <div className="flex h-full overflow-y-auto">
            <div className="flex flex-col flex-1 pr-6 overflow-y-auto">
              <div className="flex ">
                <div className="mb-6">
                  <div className="space-x-6 flex flex-wrap">
                    {/* Assigned Members */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-2">
                        Assigned Members
                      </h4>
                      <div className="flex items-center space-x-2">
                        {currentTask.assignedMembers &&
                        currentTask.assignedMembers.length > 0 ? (
                          currentTask.assignedMembers.map((memberId) => {
                            const member = boardMembersData?.members?.find(
                              (m) => m.userId === memberId
                            );
                            return (
                              <div
                                key={memberId}
                                className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:bg-orange-600 transition-colors"
                                title={`Click to remove ${member?.fullName || memberId}`}
                                onClick={() => handleRemoveMember(memberId)}
                              >
                                {(member?.fullName || memberId)
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-sm text-gray-500">
                            No members assigned
                          </span>
                        )}
                        <MemberDropdown
                          members={boardMembersData?.members || []}
                          assignedMembers={currentTask.assignedMembers || []}
                          onAssignMember={handleAssignMember}
                          isLoading={assignMemberMutation.isPending}
                        />
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-2">
                        Priority
                      </h4>
                      <Dropdown
                        trigger={
                          <PriorityBadge
                            priority={priority}
                            className="w-full h-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                          />
                        }
                        items={[
                          {
                            id: "low",
                            label: "Low",
                            onClick: () => handleUpdatePriority("low"),
                          },
                          {
                            id: "medium",
                            label: "Medium",
                            onClick: () => handleUpdatePriority("medium"),
                          },
                          {
                            id: "high",
                            label: "High",
                            onClick: () => handleUpdatePriority("high"),
                          },
                        ]}
                        align="left"
                      />
                    </div>

                    {/* Due Date */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-600 mb-2">
                        Due Date & Time
                      </h4>
                      <div className="space-y-2">
                        <DatePicker
                          value={dueDate}
                          onChange={handleUpdateDueDate}
                          placeholder="Set due date and time"
                          showTime={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <AlignLeft className="h-4 w-4 mr-2" />
                  Description
                </h3>
                {isEditingDescription ? (
                  <div>
                    <Textarea
                      ref={descriptionTextareaRef}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add a more detailed description..."
                      className="min-h-24"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          handleCancelDescription();
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="min-h-24 p-3 bg-gray-50 rounded border cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => setIsEditingDescription(true)}
                  >
                    {description ? (
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Add a more detailed description...
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Comment Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <List className="h-4 w-4 mr-2" />
                    Comment
                  </h3>
                </div>

                {/* Add Comment */}
                <div className="mt-4 flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {boardMembersData &&
                      boardMembersData.members
                        .find((m) => m.userId === currentTask.ownerId)
                        ?.fullName.charAt(0)
                        .toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="min-h-16"
                    />
                    <div className="mt-2">
                      <Button
                        size="sm"
                        onClick={handleAddComment}
                        disabled={!comment.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="flex flex-col w-64 pl-6">
              {/* Power-Ups */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-600 mb-2">
                  Power-Ups
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowGitHubPowerUp(true)}
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub
                </Button>
              </div>

              {/* GitHub Actions */}
              {linkedRepository && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-600 mb-2">
                    GitHub Actions
                  </h4>

                  {/* Attach Branch */}
                  <Dropdown
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs"
                        disabled={branches.length === 0}
                      >
                        Attach Branch{" "}
                        {branches.length > 0 && `(${branches.length})`}
                      </Button>
                    }
                    items={branches.map((branch) => ({
                      id: branch.name,
                      label: branch.name,
                      onClick: () => handleAttachBranch(branch),
                    }))}
                    className="w-fit"
                  />

                  {/* Attach Commit */}
                  <Dropdown
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs mt-1"
                        disabled={commits.length === 0}
                      >
                        Attach Commit{" "}
                        {commits.length > 0 && `(${commits.length})`}
                      </Button>
                    }
                    items={commits.map((commit) => ({
                      id: commit.sha,
                      label: `${commit.message.substring(0, 20)}${commit.message.length > 20 ? "..." : ""}`,
                      onClick: () => handleAttachCommit(commit),
                    }))}
                    className="w-full"
                  />

                  {/* Attach Issue */}
                  <Dropdown
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs mt-1"
                        disabled={issues.length === 0}
                      >
                        Attach Issue {issues.length > 0 && `(${issues.length})`}
                      </Button>
                    }
                    items={issues.map((issue) => ({
                      id: issue.id.toString(),
                      label: `#${issue.number} ${issue.title.substring(0, 40)}${issue.title.length > 40 ? "..." : ""}`,
                      icon: "🐛",
                      onClick: () => handleAttachIssue(issue),
                    }))}
                    className="w-full"
                  />

                  {/* Attach Pull Request */}
                  <Dropdown
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-xs mt-1"
                        disabled={pullRequests.length === 0}
                      >
                        Attach Pull Request{" "}
                        {pullRequests.length > 0 && `(${pullRequests.length})`}
                      </Button>
                    }
                    items={pullRequests.map((pr) => ({
                      id: pr.id.toString(),
                      label: `#${pr.number} ${pr.title.substring(0, 40)}${pr.title.length > 40 ? "..." : ""}`,
                      icon: "🔀",
                      onClick: () => handleAttachPullRequest(pr),
                    }))}
                    className="w-full"
                  />
                </div>
              )}

              {/* Archive */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-red-600 hover:text-red-700"
                  onClick={handleArchiveTask}
                  disabled={isLoading}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${currentTask?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* GitHub Power-Up Modal */}
      <GitHubPowerUp
        isOpen={showGitHubPowerUp}
        onClose={() => setShowGitHubPowerUp(false)}
        boardId={boardId}
      />
    </>
  );
};

export const TaskDetailModal = memo(TaskDetailModalComponent);
