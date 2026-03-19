"use client";

import { register } from "@/actions/auth/register";
import { registerValidator } from "@/validators/auth/registerValidator";
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

export default function RegisterPage() {
  const router = useRouter();

  const { form, handleSubmitWithAction, action } = useHookFormAction(
    register,
    zodResolver(registerValidator),
    {
      formProps: {
        defaultValues: {
          name: "",
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
        <CardTitle>Register</CardTitle>
        <CardDescription>Create a new account to get started</CardDescription>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Your name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              {action.isPending ? "Creating account..." : "Register"}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={route("login")} className="text-primary underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
