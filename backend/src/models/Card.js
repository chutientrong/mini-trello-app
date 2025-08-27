const BaseModel = require("./BaseModel");
class Card extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.title = data.title;
    this.description = data.description || "";
    this.boardId = data.boardId;
    this.order = data.order || 0;
    this.taskCount = data.taskCount || 0;
    this.createdBy = data.createdBy;

    this.attachments = data.attachments || [];
  }

  // Static methods for database operations
  static async create(cardData) {
    return super.create("cards", cardData);
  }

  static async findById(id) {
    return super.findById("cards", id);
  }

  static async findByBoardId(boardId) {
    return super.find("cards", { boardId });
  }

  static async findByBoardIdAndOrder(boardId, order) {
    return super.find("cards", { boardId, order });
  }

  static async findByIdAndUpdate(id, updateData) {
    return super.findByIdAndUpdate("cards", id, updateData);
  }

  static async findByIdAndDelete(id) {
    return super.findByIdAndDelete("cards", id);
  }

  // Instance method to save
  async save() {
    return super.save("cards");
  }

  async updateTaskCount() {
    try {
      const Task = require("./Task");
      const tasks = await Task.findByCardId(this.id);
      this.taskCount = tasks.length;
      await this.save();
    } catch (error) {
      console.error("Error updating task count:", error);
      throw error;
    }
  }

  async addAttachment(attachment) {
    this.attachments.push(attachment);
    await this.save();
  }

  async removeAttachment(attachmentId) {
    this.attachments = this.attachments.filter((a) => a.id !== attachmentId);
    await this.save();
  }

  toObject() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      boardId: this.boardId,
      order: this.order,
      taskCount: this.taskCount,
      createdBy: this.createdBy,

      attachments: this.attachments,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = Card;
