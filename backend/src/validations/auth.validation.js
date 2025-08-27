const { z } = require("zod");

const sendVerificationCode = {
  body: z.object({
    email: z.email(),
    isSignup: z.boolean().optional(),
  }),
};

const signup = {
  body: z.object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Full name must be less than 100 characters"),
    email: z.email(),
    verificationCode: z.string().length(6),
  }),
};

const signin = {
  body: z.object({
    email: z.email(),
    verificationCode: z.string().length(6),
  }),
};

const refreshToken = {
  body: z.object({}),
};

module.exports = {
  sendVerificationCode,
  signup,
  signin,
  refreshToken,
};
