"use client";

import { logout } from "@/actions/auth/logout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { route } from "@/lib/route";
import { useAction } from "next-safe-action/hooks";

export function LogoutButton() {
  const router = useRouter();

  const { execute, isPending } = useAction(logout, {
    onSuccess: () => {
      router.push(route("login"));
    },
  });

  return (
    <Button
      variant="outline"
      onClick={() => execute({})}
      disabled={isPending}
    >
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  );
}
