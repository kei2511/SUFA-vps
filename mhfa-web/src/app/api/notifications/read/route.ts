import { db } from "@/db";
import { notifications } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { notificationId } = await request.json();
    if (!notificationId) {
      return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
    }

    await db.update(notifications)
      .set({ isUnread: false })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, session.user.id)
      ));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
