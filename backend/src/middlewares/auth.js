const { status: httpStatus } = require("http-status");
const ApiError = require("../utils/ApiError");
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");
const logger = require("../config/logger");

const auth = () => async (req, res, next) => {
  try {
    logger.debug("Auth middleware called");

    // Try to get token from Authorization header first, then from cookies
    let token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      token = req.cookies?.accessToken;
    }

    logger.debug("Token present:", {
      hasToken: !!token,
      source: token
        ? req.header("Authorization")
          ? "header"
          : "cookie"
        : "none",
    });

    if (!token) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
    }

    const payload = verifyToken(token);
    logger.debug("Token payload:", { userId: payload?.sub });
    if (!payload) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
    }

    const user = await User.findById(payload.sub);
    logger.debug("User found:", { found: !!user, userId: payload.sub });
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    }

    req.user = user;
    logger.debug("Auth middleware completed successfully");
    next();
  } catch (error) {
    logger.error("Authentication error:", error);
    next(error);
  }
};

module.exports = auth;
