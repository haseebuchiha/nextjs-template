# Next.js Template — Agent Development Guide

This template is the starting point for all LaunchBased-generated apps. Everything below is pre-configured and working. Your job is to **extend** it, not rebuild it.

---

## What's Already Set Up

| Layer | What's Included | Status |
|-------|----------------|--------|
| **Framework** | Next.js 16 (App Router, TypeScript, src directory) | Ready |
| **UI** | Tailwind CSS v4 + shadcn/ui (20+ components) + dark mode | Ready |
| **Auth** | Login, register, logout — session-based with Argon2 | Ready |
| **Database** | Prisma with PostgreSQL (User + Session models) | Ready |
| **Server Actions** | next-safe-action + Zod validation | Ready |
| **Forms** | React Hook Form + @hookform/resolvers + Zod | Ready |
| **State** | Zustand (installed, not yet used — use for client state) | Available |
| **Theme** | CSS variables (OKLch), light + dark mode via next-themes | Ready |
| **Toasts** | Sonner (via `toast()` from `sonner`) | Ready |

---

## Locked Stack — Do NOT Replace

| Component | Technology |
|-----------|-----------|
| Framework | Next.js (App Router) + TypeScript |
| Deployment | Vercel |
| Database | Neon (serverless PostgreSQL) |
| ORM | Prisma |
| UI | Tailwind CSS + shadcn/ui |
| Auth | Session-based (Argon2 via @node-rs/argon2) |
| Server Actions | next-safe-action + Zod + React Hook Form |
| State | Zustand |

---

## File Structure

```
src/
  app/
    globals.css              # CSS variables — DO NOT modify
    layout.tsx               # Root layout (ThemeProvider, Toaster, TooltipProvider)
    page.tsx                 # Redirects to /dashboard or /login

    (auth)/                  # Public auth pages
      layout.tsx             # Centered card layout
      login/page.tsx         # Login form (useHookFormAction pattern)
      register/page.tsx      # Register form

    (protected)/             # Auth-guarded pages
      layout.tsx             # Checks auth, redirects to /login
      dashboard/page.tsx     # Example protected page

  components/
    ui/                      # shadcn components — import, don't recreate
      button.tsx, input.tsx, card.tsx, dialog.tsx, form.tsx, ...

  lib/
    utils.ts                 # cn() — DO NOT modify
    prisma.ts                # Prisma singleton — DO NOT modify
    password.ts              # Argon2 hash/verify — DO NOT modify
    actionClient.ts          # actionClient + authActionClient
    routes.ts                # ← ADD your app routes here
    route.ts                 # Type-safe route() helper

  services/
    UserAuth.ts              # Session auth (login, logout, getUser, checkOrRedirect)

  validators/
    auth/
      loginValidator.ts      # Zod login schema
      registerValidator.ts   # Zod register schema

  actions/
    auth/
      login.ts               # Login server action
      register.ts            # Register server action
      logout.ts              # Logout server action

  hooks/                     # ← ADD custom hooks here
  types/index.ts             # Re-exports Prisma types
  middleware.ts              # Route protection

  generated/prisma/          # Auto-generated Prisma client (gitignored)
```

---

## How to Add Features

### 1. Add a New Page

```
src/app/(protected)/todos/page.tsx      ← Server component (data fetching)
src/app/(protected)/todos/todo-list.tsx  ← Client component ("use client")
```

Protected pages go in `(protected)/`. Public pages go at the app root.

### 2. Add a Server Action

```typescript
// src/actions/todo/create.ts
"use server";

import { authActionClient } from "@/lib/actionClient";
import { prisma } from "@/lib/prisma";
import { createTodoValidator } from "@/validators/todo/createTodoValidator";
import { revalidatePath } from "next/cache";

export const createTodo = authActionClient
  .inputSchema(createTodoValidator)
  .action(async ({ parsedInput, ctx }) => {
    const todo = await prisma.todo.create({
      data: {
        title: parsedInput.title,
        userId: ctx.user.id,
      },
    });

    revalidatePath("/todos");
    return todo;
  });
```

- Use `actionClient` for public actions (login, register)
- Use `authActionClient` for authenticated actions — it provides `ctx.user`

### 3. Add a Form (Client Component)

```typescript
"use client";

import { createTodo } from "@/actions/todo/create";
import { createTodoValidator } from "@/validators/todo/createTodoValidator";
import { useHookFormAction } from "@next-safe-action/adapter-react-hook-form/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AddTodoForm() {
  const { form, handleSubmitWithAction, action } = useHookFormAction(
    createTodo,
    zodResolver(createTodoValidator),
    {
      formProps: { defaultValues: { title: "" } },
      actionProps: {
        onSuccess: () => {
          form.reset();
          toast.success("Todo created!");
        },
        onError: () => toast.error("Failed to create todo"),
      },
    }
  );

  return (
    <Form {...form}>
      <form onSubmit={handleSubmitWithAction} className="flex gap-2">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input {...field} placeholder="What needs to be done?" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={action.isPending}>Add</Button>
      </form>
    </Form>
  );
}
```

### 4. Add a Prisma Model

Edit `prisma/schema.prisma`:

```prisma
model Todo {
  id        String   @id @default(cuid(2))
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  title     String
  completed Boolean  @default(false)
  userId    String

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("todos")
}
```

Then add the relation to the User model:
```prisma
model User {
  ...
  todos Todo[]
}
```

### 5. Add a Zod Validator

```typescript
// src/validators/todo/createTodoValidator.ts
import { z } from "zod";

export const createTodoValidator = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
});

export type CreateTodoFormValues = z.infer<typeof createTodoValidator>;
```

### 6. Add a Route

Edit `src/lib/routes.ts`:

```typescript
export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  todos: "/todos",           // ← Add here
  "todos.edit": "/todos/:id/edit",
} as const;
```

Use it: `route("todos")` → `"/todos"`, `route("todos.edit", todoId)` → `"/todos/abc123/edit"`

### 7. Add a shadcn Component

```bash
npx shadcn@latest add <component-name> --yes
```

Then import: `import { ComponentName } from "@/components/ui/component-name"`

### 8. Add an npm Package

```bash
npm install <package-name>
```

---

## Patterns

### Server Component (Data Fetching)
```typescript
// Page-level server component — fetches data, passes to client
import { prisma } from "@/lib/prisma";
import { UserAuth } from "@/services/UserAuth";
import { TodoList } from "./todo-list";

export default async function TodosPage() {
  const user = await UserAuth.checkOrRedirect();
  const todos = await prisma.todo.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return <TodoList todos={todos} />;
}
```

### Client Component (Interactivity)
```typescript
"use client";
// Client components receive data as props and handle user interaction
```

### Zustand Store (Client State)
```typescript
// src/store/useAppStore.ts
import { create } from "zustand";

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

---

## Do NOT

- **Recreate shadcn components** — they're already installed. Import from `@/components/ui/`
- **Modify globals.css** — CSS variables and theme are set up correctly
- **Modify lib/utils.ts** — the `cn()` helper is standard
- **Modify lib/prisma.ts** — the singleton pattern is correct
- **Use JWT for auth** — this template uses session-based auth with cookies
- **Install packages that are already in package.json** — check first
- **Use `--prefix code` or `--cwd code`** with npm/npx commands — the working directory is already correct
