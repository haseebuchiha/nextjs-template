"use server";

import { actionClient } from "@/lib/actionClient";
import { prisma } from "@/lib/prisma";
import { registerValidator } from "@/validators/auth/registerValidator";
import { UserAuth } from "@/services/UserAuth";
import { hashPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";

export const register = actionClient
  .inputSchema(registerValidator)
  .action(async ({ parsedInput }) => {
    const existing = await prisma.user.findUnique({
      where: { email: parsedInput.email },
    });

    if (existing) {
      returnValidationErrors(registerValidator, {
        email: { _errors: ["An account with this email already exists"] },
      });
    }

    const hashedPassword = await hashPassword(parsedInput.password);

    const user = await prisma.user.create({
      data: {
        name: parsedInput.name,
        email: parsedInput.email,
        password: hashedPassword,
      },
    });

    await UserAuth.login(user);
    revalidatePath("/");

    return { success: true };
  });
