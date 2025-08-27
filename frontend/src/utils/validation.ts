import { z } from "zod";

export const emailSchema = z
  .email("Please enter a valid email address")
  .min(1, "Email is required");

export const verificationCodeSchema = z
  .string()
  .min(1, "Verification code is required")
  .regex(/^\d{6}$/, "Verification code must be 6 digits");

export const fullNameSchema = z
  .string()
  .min(1, "Full name is required")
  .min(2, "Full name must be at least 2 characters")
  .max(100, "Full name must be less than 100 characters");

export const signInFormSchema = z.object({
  email: emailSchema,
  verificationCode: verificationCodeSchema,
});

export const signUpFormSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  verificationCode: verificationCodeSchema,
});

export const emailStepSchema = z.object({
  email: emailSchema,
});

export const signUpEmailStepSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
});

export const codeStepSchema = z.object({
  verificationCode: verificationCodeSchema,
});

export type SignInFormData = z.infer<typeof signInFormSchema>;
export type SignUpFormData = z.infer<typeof signUpFormSchema>;
export type EmailStepData = z.infer<typeof emailStepSchema>;
export type SignUpEmailStepData = z.infer<typeof signUpEmailStepSchema>;
export type CodeStepData = z.infer<typeof codeStepSchema>;
