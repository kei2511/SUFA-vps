import { db } from "@/db";
import { screeningSessions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const list = await db.query.screeningSessions.findMany({
      where: eq(screeningSessions.userId, session.user.id),
      orderBy: [desc(screeningSessions.completedAt)]
    });

    return NextResponse.json({ history: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
