const { status: httpStatus } = require("http-status");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const authService = require("../services/auth.service");
const config = require("../config/config");

const sendVerificationCode = catchAsync(async (req, res) => {
  const { email, isSignup } = req.body;
  const result = await authService.sendVerificationCode(email, isSignup);
  res.status(httpStatus.OK).json(result);
});

const signup = catchAsync(async (req, res) => {
  const { fullName, email, verificationCode } = req.body;
  const result = await authService.signup(fullName, email, verificationCode);

  // Set cookies for signup
  res.cookie("accessToken", result.tokens.accessToken, {
    httpOnly: config.cookies.httpOnly,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    maxAge: config.cookies.maxAge,
  });

  res.cookie("refreshToken", result.tokens.refreshToken, {
    httpOnly: config.cookies.httpOnly,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    maxAge: config.cookies.maxAge,
  });

  res.status(httpStatus.CREATED).json(result);
});

const signin = catchAsync(async (req, res) => {
  const { email, verificationCode } = req.body;
  const result = await authService.signin(email, verificationCode);

  // Set cookies
  res.cookie("accessToken", result.tokens.accessToken, {
    httpOnly: config.cookies.httpOnly,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    maxAge: config.cookies.maxAge,
  });

  res.cookie("refreshToken", result.tokens.refreshToken, {
    httpOnly: config.cookies.httpOnly,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    maxAge: config.cookies.maxAge,
  });

  res.status(httpStatus.OK).json(result);
});

const refreshToken = catchAsync(async (req, res) => {
  // Get refresh token from cookies instead of request body
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, "No refresh token available");
  }

  const result = await authService.refreshToken(refreshToken);

  // Set new cookies
  res.cookie("accessToken", result.tokens.accessToken, {
    httpOnly: config.cookies.httpOnly,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    maxAge: config.cookies.maxAge,
  });

  res.cookie("refreshToken", result.tokens.refreshToken, {
    httpOnly: config.cookies.httpOnly,
    secure: config.cookies.secure,
    sameSite: config.cookies.sameSite,
    maxAge: config.cookies.maxAge,
  });

  res.status(httpStatus.OK).json(result);
});

const validateToken = catchAsync(async (req, res) => {
  // If we reach here, the token is valid (auth middleware passed)
  res.status(httpStatus.OK).json({
    valid: true,
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  });
});

const logout = catchAsync(async (req, res) => {
  // Clear cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(httpStatus.OK).json({ message: "Logged out successfully" });
});

module.exports = {
  sendVerificationCode,
  signup,
  signin,
  refreshToken,
  validateToken,
  logout,
};
