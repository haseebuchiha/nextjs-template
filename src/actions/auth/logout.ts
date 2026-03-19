"use server";

import { authActionClient } from "@/lib/actionClient";
import { UserAuth } from "@/services/UserAuth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const logout = authActionClient
  .inputSchema(z.object({}))
  .action(async () => {
    await UserAuth.logout();
    revalidatePath("/");
    return { success: true };
  });
