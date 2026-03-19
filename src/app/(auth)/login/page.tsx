"use client";

import { login } from "@/actions/auth/login";
import { loginValidator } from "@/validators/auth/loginValidator";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { route } from "@/lib/route";
import { useRouter } from "next/navigation";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const { form, handleSubmitWithAction, action } = useHookFormAction(
    login,
    zodResolver(loginValidator),
    {
      formProps: {
        defaultValues: {
          email: "",
          password: "",
        },
      },
      actionProps: {
        onSuccess: () => {
          router.push(route("dashboard"));
        },
        onError: ({ error }) => {
          if (error.serverError) {
            toast.error("An error occurred. Please try again.");
          }
        },
      },
    }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={handleSubmitWithAction}
            className="space-y-4"
            method="post"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="you@example.com" type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Password" type="password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={action.isPending}>
              {action.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href={route("register")} className="text-primary underline">
            Register
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
