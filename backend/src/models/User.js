const { generateAuthTokens } = require("../utils/jwt");
const { sendVerificationEmail } = require("../utils/email");
const logger = require("../config/logger");
const BaseModel = require("./BaseModel");

class User extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.fullName = data.fullName;
    this.email = data.email;
    this.verificationCode = data.verificationCode;
    this.verificationCodeExpires = data.verificationCodeExpires;
    this.isVerified = data.isVerified || false;
    this.githubId = data.githubId;
    this.githubUsername = data.githubUsername;
    this.githubAccessToken = data.githubAccessToken;
  }

  // Generate verification code
  generateVerificationCode() {
    // Check if there's already a valid verification code
    if (this.verificationCode && this.verificationCodeExpires) {
      const expiresAt = this.verificationCodeExpires?.toDate
        ? this.verificationCodeExpires.toDate()
        : new Date(this.verificationCodeExpires);

      // If the code is still valid (more than 1 minute left), don't generate a new one
      if (expiresAt.getTime() - Date.now() > 60 * 1000) {
        console.log("Using existing verification code:", this.verificationCode);
        return this.verificationCode;
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationCode = code;
    this.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    console.log("Generated new verification code:", code);
    return code;
  }

  // Verify code
  verifyCode(code) {
    // Convert Firestore timestamp to Date if needed
    const expiresAt = this.verificationCodeExpires?.toDate
      ? this.verificationCodeExpires.toDate()
      : new Date(this.verificationCodeExpires);

    return this.verificationCode === code && expiresAt > new Date();
  }

  // Clear verification code
  clearVerificationCode() {
    this.verificationCode = undefined;
    this.verificationCodeExpires = undefined;
  }

  // Convert to plain object
  toObject() {
    const obj = {
      fullName: this.fullName,
      email: this.email,
      verificationCode: this.verificationCode,
      verificationCodeExpires: this.verificationCodeExpires,
      isVerified: this.isVerified,
      githubId: this.githubId,
      githubUsername: this.githubUsername,
      githubAccessToken: this.githubAccessToken,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    // Only include id if it exists
    if (this.id) {
      obj.id = this.id;
    }

    // Filter out undefined values
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value !== undefined)
    );
  }

  // Static methods for database operations
  static async create(userData) {
    return super.create("users", userData);
  }

  static async findById(id) {
    return super.findById("users", id);
  }

  static async findOneByEmail(email) {
    return super.findOne("users", {
      email: { operator: "==", value: email.toLowerCase() },
    });
  }

  static async isEmailUnique(email) {
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await this.findOneByEmail(normalizedEmail);
    return !existingUser;
  }

  static async findByGitHubId(githubId) {
    return super.findOne("users", {
      githubId: { operator: "==", value: githubId },
    });
  }

  static async findByIdAndUpdate(id, updateData) {
    return super.findByIdAndUpdate("users", id, updateData);
  }

  static async findByIdAndDelete(id) {
    return super.findByIdAndDelete("users", id);
  }

  // Instance method to save
  async save() {
    return super.save("users");
  }

  // Send verification email
  async sendVerificationEmail() {
    const code = this.generateVerificationCode();
    const emailSent = await sendVerificationEmail(this.email, code);

    if (emailSent) {
      await this.save();
      logger.info(`Verification code sent to ${this.email}`);
    }

    return emailSent;
  }

  // Generate auth tokens
  async generateAuthTokens() {
    return generateAuthTokens(this);
  }
}

module.exports = User;
