import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { route } from "@/lib/route";
import type { User } from "@/types";

const SESSION_COOKIE = "session_id";
const SESSION_DURATION_DAYS = 30;

export class UserAuth {
  static async login(user: User): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });
  }

  static async logout(): Promise<void> {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (sessionId) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE);
    }
  }

  static async getUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

    if (!sessionId) return null;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      }
      return null;
    }

    return session.user;
  }

  static async checkOrRedirect(): Promise<User> {
    const user = await UserAuth.getUser();
    if (!user) redirect(route("login"));
    return user;
  }
}
