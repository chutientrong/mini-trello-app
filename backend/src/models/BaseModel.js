const { db } = require("../config/firebase");

class BaseModel {
  constructor(data = {}) {
    this.id = data.id;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  // Convert to plain object - filter out undefined values
  toObject() {
    const obj = {};

    // Add all own properties except methods and undefined values
    for (const [key, value] of Object.entries(this)) {
      if (typeof value !== "function" && value !== undefined) {
        obj[key] = value;
      }
    }

    return obj;
  }

  // Convert to plain object for Firestore storage (excludes id)
  toFirestore() {
    const obj = {};

    // Add all own properties except methods, undefined values, and id field
    for (const [key, value] of Object.entries(this)) {
      if (typeof value !== "function" && value !== undefined && key !== "id") {
        obj[key] = value;
      }
    }

    return obj;
  }

  // Base CRUD operations
  static async create(collectionName, data) {
    const model = new this(data);
    model.createdAt = new Date();
    model.updatedAt = new Date();

    const docRef = await db.collection(collectionName).add(model.toFirestore());
    model.id = docRef.id;
    return model;
  }

  static async findById(collectionName, id) {
    const doc = await db.collection(collectionName).doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data();
    return new this({ id: doc.id, ...data });
  }

  static async findByIdAndUpdate(collectionName, id, updateData) {
    const model = await this.findById(collectionName, id);
    if (!model) return null;

    Object.assign(model, updateData);
    model.updatedAt = new Date();

    await db.collection(collectionName).doc(id).update(model.toFirestore());
    return model;
  }

  static async findByIdAndDelete(collectionName, id) {
    await db.collection(collectionName).doc(id).delete();
    return true;
  }

  static async find(collectionName, query = {}) {
    let ref = db.collection(collectionName);

    // Apply where clauses
    for (const [field, condition] of Object.entries(query)) {
      if (
        typeof condition === "object" &&
        condition.operator &&
        condition.value !== undefined
      ) {
        ref = ref.where(field, condition.operator, condition.value);
      } else if (condition !== undefined) {
        ref = ref.where(field, "==", condition);
      }
    }

    const snapshot = await ref.get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return new this({ id: doc.id, ...data });
    });
  }

  static async findOne(collectionName, query = {}) {
    const results = await this.find(collectionName, query);
    return results.length > 0 ? results[0] : null;
  }

  // Instance method to save
  async save(collectionName) {
    this.updatedAt = new Date();

    if (this.id) {
      // Update existing document
      await db
        .collection(collectionName)
        .doc(this.id)
        .update(this.toFirestore());
    } else {
      // Create new document
      this.createdAt = new Date();
      const docRef = await db
        .collection(collectionName)
        .add(this.toFirestore());
      this.id = docRef.id;
    }

    return this;
  }

  // Instance method to delete
  async delete(collectionName) {
    if (this.id) {
      await db.collection(collectionName).doc(this.id).delete();
      return true;
    }
    return false;
  }
}

module.exports = BaseModel;
