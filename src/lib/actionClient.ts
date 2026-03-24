import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { UserAuth } from "@/services/UserAuth";
import { redirect } from "next/navigation";
import { route } from "./route";

export const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    if (error.message === "Unauthenticated") {
      redirect(route("login"));
    }
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authActionClient = actionClient.use(async ({ next }) => {
  const user = await UserAuth.getUser();
  if (!user) {
    throw new Error("Unauthenticated");
  }
  return next({ ctx: { user } });
});
