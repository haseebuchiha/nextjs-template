import { UserAuth } from "@/services/UserAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "./logout-button";

export default async function DashboardPage() {
  const user = await UserAuth.checkOrRedirect();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Welcome, <span className="font-medium text-foreground">{user.name}</span>!
          </p>
          <p className="text-sm text-muted-foreground">
            This is a protected page. Only authenticated users can see this.
          </p>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
