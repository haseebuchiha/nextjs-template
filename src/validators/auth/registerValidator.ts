import { z } from "zod";

export const registerValidator = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Please enter a valid email")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterFormValues = z.infer<typeof registerValidator>;
