const { status: httpStatus } = require("http-status");
const BaseService = require("./BaseService");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

// In-memory rate limiting for verification codes
const pendingRequests = new Set();

class AuthService extends BaseService {
  constructor() {
    super(User, "users");
  }

  async sendVerificationCode(email, isSignup) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if there's already a pending request for this email
    if (pendingRequests.has(normalizedEmail)) {
      console.log(
        "Rate limiting: Request already in progress for:",
        normalizedEmail
      );
      throw new ApiError(
        httpStatus.TOO_MANY_REQUESTS,
        "Request already in progress. Please wait."
      );
    }

    // Add to pending requests
    pendingRequests.add(normalizedEmail);

    try {
      // Check if user already exists
      const existingUser = await User.findOneByEmail(normalizedEmail);
      console.log("existingUser", existingUser);
      console.log("isSignup", isSignup);

      //  signup: check if user exists and is verified
      if (existingUser && isSignup) {
        if (existingUser.isVerified) {
          throw new ApiError(
            httpStatus.CONFLICT,
            "User already exists with this email"
          );
        } else {
          // User exists but not verified, allow them to continue signup process
          console.log(
            "User exists but not verified, allowing signup continuation"
          );
        }
      }

      // signin: check if user doesn't exist
      if (!existingUser && !isSignup) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "User not found. Please sign up first."
        );
      }

      // signup: check if email is unique - new users
      if (!existingUser && isSignup) {
        const isEmailUnique = await User.isEmailUnique(normalizedEmail);
        if (!isEmailUnique) {
          throw new ApiError(httpStatus.CONFLICT, "Email already exists");
        }
      }

      // signup: use existing user or create new user
      const user = existingUser || new User({ email: normalizedEmail });

      // signup: check if a verification code was recently sent (within 30 seconds)
      if (user.verificationCodeExpires) {
        const expiresAt = user.verificationCodeExpires?.toDate
          ? user.verificationCodeExpires.toDate()
          : new Date(user.verificationCodeExpires);

        const timeUntilExpiry = expiresAt.getTime() - Date.now();
        if (timeUntilExpiry > 9.5 * 60 * 1000) {
          // More than 9.5 minutes left (code sent within last 30 seconds)
          console.log(
            "Rate limiting: Code sent too recently, time until expiry:",
            timeUntilExpiry / 1000,
            "seconds"
          );
          throw new ApiError(
            httpStatus.TOO_MANY_REQUESTS,
            "Verification code already sent. Please wait 30 seconds before requesting another."
          );
        }
      }

      console.log("Generating new verification code for:", normalizedEmail);

      // Send verification email
      const emailSent = await user.sendVerificationEmail();
      console.log("emailSent", emailSent);
      if (!emailSent) {
        throw new ApiError(
          httpStatus.INTERNAL_SERVER_ERROR,
          "Failed to send verification email"
        );
      }

      // Save user with verification code
      await user.save();

      return { message: "Verification code sent to your email" };
    } finally {
      // Always remove from pending requests
      pendingRequests.delete(normalizedEmail);
    }
  }

  async signup(fullName, email, verificationCode) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOneByEmail(normalizedEmail);

    if (!user) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "User not found. Please send verification code first."
      );
    }

    // Check if user is already verified
    if (user.isVerified) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "User already exists with this email"
      );
    }

    if (!user.verifyCode(verificationCode)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid or expired verification code"
      );
    }

    // Mark user as verified and clear verification code
    user.isVerified = true;
    user.fullName = fullName;
    user.clearVerificationCode();
    await user.save();

    // Generate auth tokens for signup
    const tokens = await user.generateAuthTokens();

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: true,
      },
      tokens: {
        accessToken: tokens.access.token,
        refreshToken: tokens.refresh.token,
      },
    };
  }

  async signin(email, verificationCode) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOneByEmail(normalizedEmail);
    console.log("user", user, verificationCode);
    if (!user) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Invalid email or verification code"
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Please complete signup first");
    }

    // Add debugging for verification code
    console.log("Signin attempt:", {
      email: normalizedEmail,
      verificationCode,
      userVerificationCode: user.verificationCode,
      userVerificationCodeExpires: user.verificationCodeExpires,
      isVerified: user.verifyCode(verificationCode),
    });

    if (!user.verifyCode(verificationCode)) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Invalid email or verification code"
      );
    }

    // Clear verification code and save
    user.clearVerificationCode();
    await user.save();

    // Generate auth tokens
    const tokens = await user.generateAuthTokens();

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: true,
      },
      tokens: {
        accessToken: tokens.access.token,
        refreshToken: tokens.refresh.token,
      },
    };
  }

  async refreshToken(refreshToken) {
    const { verifyToken } = require("../utils/jwt");

    // Verify the refresh token
    const payload = verifyToken(refreshToken);
    if (!payload || payload.type !== "refresh") {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
    }

    // Find the user
    const user = await User.findById(payload.sub);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Generate new tokens
    const tokens = await user.generateAuthTokens();

    return {
      tokens: {
        accessToken: tokens.access.token,
        refreshToken: tokens.refresh.token,
      },
    };
  }

  async refreshTokenFromCookie(req) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "No refresh token available");
    }

    return await this.refreshToken(refreshToken);
  }
}

// Create singleton instance
const authService = new AuthService();

module.exports = authService;
