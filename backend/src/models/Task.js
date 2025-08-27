const BaseModel = require("./BaseModel");

class Task extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.title = data.title;
    this.description = data.description;
    this.cardId = data.cardId;
    this.boardId = data.boardId;
    this.ownerId = data.ownerId;
    this.order = data.order || 0;
    this.assignedMembers = data.assignedMembers || [];
    this.priority = data.priority || "medium"; // low, medium, high
    this.dueDate = data.dueDate;
    this.dueComplete = data.dueComplete || false;
    this.githubAttachments = data.githubAttachments || [];
  }

  // Convert to plain object
  toObject() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      cardId: this.cardId,
      boardId: this.boardId,
      ownerId: this.ownerId,
      order: this.order,
      assignedMembers: this.assignedMembers,
      priority: this.priority,
      dueDate: this.dueDate,
      dueComplete: this.dueComplete,
      githubAttachments: this.githubAttachments,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Static methods for database operations
  static async create(taskData) {
    return super.create("tasks", taskData);
  }

  static async findById(id) {
    return super.findById("tasks", id);
  }

  static async findByCardId(cardId) {
    return super.find("tasks", { cardId });
  }

  static async findByOwnerId(ownerId) {
    return super.find("tasks", { ownerId });
  }

  static async findByAssignedMember(memberId) {
    return super.find("tasks", {
      assignedMembers: { operator: "array-contains", value: memberId },
    });
  }

  static async findByIdAndUpdate(id, updateData) {
    return super.findByIdAndUpdate("tasks", id, updateData);
  }

  static async findByIdAndDelete(id) {
    return super.findByIdAndDelete("tasks", id);
  }

  // Instance method to save
  async save() {
    return super.save("tasks");
  }

  // Assign member to task
  async assignMember(memberId) {
    if (!this.assignedMembers.includes(memberId)) {
      this.assignedMembers.push(memberId);
      await this.save();
    }
    return this;
  }

  // Remove member assignment from task
  async removeMemberAssignment(memberId) {
    this.assignedMembers = this.assignedMembers.filter((id) => id !== memberId);
    await this.save();
    return this;
  }

  // Add GitHub attachment
  async addGitHubAttachment(attachment) {
    this.githubAttachments.push(attachment);
    await this.save();
    return this;
  }

  // Remove GitHub attachment
  async removeGitHubAttachment(attachmentId) {
    this.githubAttachments = this.githubAttachments.filter(
      (attachment) => attachment.attachmentId !== attachmentId
    );
    await this.save();
    return this;
  }
}

module.exports = Task;
