import { UserAuth } from "@/services/UserAuth";
import { redirect } from "next/navigation";
import { route } from "@/lib/route";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await UserAuth.getUser();

  if (!user) {
    redirect(route("login"));
  }

  return <>{children}</>;
}
