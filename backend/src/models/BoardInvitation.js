const BaseModel = require('./BaseModel');

class BoardInvitation extends BaseModel {
  constructor(data = {}) {
    super(data);
    this.boardId = data.boardId;
    this.inviterId = data.inviterId;
    this.inviteeEmail = data.inviteeEmail;
    this.role = data.role || 'member';
    this.status = data.status || 'pending'; // pending, accepted, declined, expired
    this.expiresAt = data.expiresAt;
    this.token = data.token; // Unique token for invitation link
  }

  // Generate invitation token
  generateToken() {
    const crypto = require('crypto');
    this.token = crypto.randomBytes(32).toString('hex');
    return this.token;
  }

  // Set expiration (7 days from now)
  setExpiration() {
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    return this.expiresAt;
  }

  // Check if invitation is expired
  isExpired() {
    if (!this.expiresAt) return false;
    const expiresAt = this.expiresAt?.toDate ? 
      this.expiresAt.toDate() : 
      new Date(this.expiresAt);
    return expiresAt < new Date();
  }

  // Accept invitation
  accept() {
    this.status = 'accepted';
    return this;
  }

  // Decline invitation
  decline() {
    this.status = 'declined';
    return this;
  }

  // Convert to plain object
  toObject() {
    const obj = {
      boardId: this.boardId,
      inviterId: this.inviterId,
      inviteeEmail: this.inviteeEmail,
      role: this.role,
      status: this.status,
      expiresAt: this.expiresAt,
      token: this.token,
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
  static async create(invitationData) {
    return super.create('board_invitations', invitationData);
  }

  static async findById(id) {
    return super.findById('board_invitations', id);
  }

  static async findByToken(token) {
    return super.findOne('board_invitations', { token: { operator: '==', value: token } });
  }

  static async findByEmail(email) {
    return super.find('board_invitations', { inviteeEmail: { operator: '==', value: email.toLowerCase() } });
  }

  static async findByBoardId(boardId) {
    return super.find('board_invitations', { boardId: { operator: '==', value: boardId } });
  }

  static async findPendingByEmail(email) {
    const invitations = await this.findByEmail(email);
    return invitations.filter(inv => inv.status === 'pending' && !inv.isExpired());
  }

  static async findByIdAndUpdate(id, updateData) {
    return super.findByIdAndUpdate('board_invitations', id, updateData);
  }

  static async findByIdAndDelete(id) {
    return super.findByIdAndDelete('board_invitations', id);
  }

  // Instance method to save
  async save() {
    return super.save('board_invitations');
  }
}

module.exports = BoardInvitation;
