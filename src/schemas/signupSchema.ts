import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "Username must have 2 characters")
  .max(20, "Username must have less than 20 characters")
  
export const signupSchema = z.object({
  username: usernameValidation,
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Email should must be valid")
    .email({ message: "Username should must be valid" }),
  password: z.string().min(6),
});
