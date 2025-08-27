const ApiError = require("../utils/ApiError");

class BaseService {
  constructor(Model, collectionName) {
    this.Model = Model;
    this.collectionName = collectionName;
  }

  // Create a new record
  async create(data) {
    const model = await this.Model.create(this.collectionName, data);
    return {
      [this.getResourceName()]: model.toObject(),
    };
  }

  // Get a single record by ID
  async getById(id) {
    const model = await this.Model.findById(this.collectionName, id);

    if (!model) {
      throw new ApiError(404, `${this.getResourceName()} not found`);
    }

    return {
      [this.getResourceName()]: model.toObject(),
    };
  }

  // Get multiple records with optional query
  async find(query = {}) {
    const models = await this.Model.find(this.collectionName, query);

    return {
      [`${this.getResourceName()}s`]: models.map((model) => model.toObject()),
    };
  }

  // Get a single record with query
  async findOne(query = {}) {
    const model = await this.Model.findOne(this.collectionName, query);

    if (!model) {
      throw new ApiError(404, `${this.getResourceName()} not found`);
    }

    return {
      [this.getResourceName()]: model.toObject(),
    };
  }

  // Update a record by ID
  async updateById(id, updateData) {
    const model = await this.Model.findByIdAndUpdate(
      this.collectionName,
      id,
      updateData
    );

    if (!model) {
      throw new ApiError(404, `${this.getResourceName()} not found`);
    }

    return {
      [this.getResourceName()]: model.toObject(),
    };
  }

  // Delete a record by ID
  async deleteById(id) {
    const deleted = await this.Model.findByIdAndDelete(this.collectionName, id);

    if (!deleted) {
      throw new ApiError(404, `${this.getResourceName()} not found`);
    }

    return { message: `${this.getResourceName()} deleted successfully` };
  }

  // Check if record exists
  async exists(id) {
    const model = await this.Model.findById(this.collectionName, id);
    return !!model;
  }

  // Get resource name for response formatting
  getResourceName() {
    // Convert class name to lowercase (e.g., "User" -> "user")
    return this.Model.name.toLowerCase();
  }

  // Validate ownership (to be overridden by specific services)
  async validateOwnership(id, userId) {
    const model = await this.Model.findById(this.collectionName, id);

    if (!model) {
      throw new ApiError(404, `${this.getResourceName()} not found`);
    }

    if (model.ownerId !== userId) {
      throw new ApiError(403, `Access denied`);
    }

    return model;
  }

  // Validate access (to be overridden by specific services)
  async validateAccess(id, userId) {
    const model = await this.Model.findById(this.collectionName, id);

    if (!model) {
      throw new ApiError(404, `${this.getResourceName()} not found`);
    }

    // Default implementation - check if user is owner
    if (model.ownerId !== userId) {
      throw new ApiError(403, `Access denied`);
    }

    return model;
  }
}

module.exports = BaseService;
