const BaseModel = require("./BaseModel");

class Board extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.name = data.name;
    this.description = data.description || "";
    this.isPublic = data.isPublic || false;
    this.ownerId = data.ownerId;
    this.members = data.members || [];
    this.cardCount = data.cardCount || 0;
    this.memberCount = data.memberCount || 1; // Owner is counted as first member
    this.githubRepository = data.githubRepository || null; // Store GitHub repo info
  }

  // Static methods for database operations
  static async create(boardData) {
    return super.create("boards", boardData);
  }

  static async findById(id) {
    return super.findById("boards", id);
  }

  static async findByOwnerId(ownerId) {
    return super.find("boards", { ownerId });
  }

  static async findByMemberId(memberId) {
    return super.find("boards", {
      members: { operator: "array-contains", value: memberId },
    });
  }

  static async findByIdAndUpdate(id, updateData) {
    return super.findByIdAndUpdate("boards", id, updateData);
  }

  static async findByIdAndDelete(id) {
    return super.findByIdAndDelete("boards", id);
  }

  // Instance method to save
  async save() {
    return super.save("boards");
  }

  async updateCardCount(cardCount) {
    this.cardCount = cardCount;
    await this.save();
  }

  // Add member to board
  async addMember(memberId) {
    if (!this.members.includes(memberId)) {
      this.members.push(memberId);
      this.memberCount = this.members.length + 1; // +1 for owner
      await this.save();
    }
    return this;
  }

  // Remove member from board
  async removeMember(memberId) {
    this.members = this.members.filter((id) => id !== memberId);
    this.memberCount = this.members.length + 1; // +1 for owner
    await this.save();
    return this;
  }

  // Check if user has access to this board
  hasAccess(userId) {
    return this.ownerId === userId || this.members.includes(userId);
  }

  // Set GitHub repository for this board
  async setGitHubRepository(repositoryData) {
    this.githubRepository = repositoryData;
    await this.save();
    return this;
  }

  // Get GitHub repository info
  getGitHubRepository() {
    return this.githubRepository;
  }
}

module.exports = Board;
