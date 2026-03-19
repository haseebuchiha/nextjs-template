"use server";

import { actionClient } from "@/lib/actionClient";
import { prisma } from "@/lib/prisma";
import { loginValidator } from "@/validators/auth/loginValidator";
import { UserAuth } from "@/services/UserAuth";
import { verifyPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";

export const login = actionClient
  .inputSchema(loginValidator)
  .action(async ({ parsedInput }) => {
    const user = await prisma.user.findUnique({
      where: { email: parsedInput.email },
    });

    if (!user) {
      returnValidationErrors(loginValidator, {
        email: { _errors: ["Invalid email or password"] },
      });
    }

    const validPassword = await verifyPassword(
      user!.password,
      parsedInput.password
    );

    if (!validPassword) {
      returnValidationErrors(loginValidator, {
        password: { _errors: ["Invalid email or password"] },
      });
    }

    await UserAuth.login(user!);
    revalidatePath("/");

    return { success: true };
  });
