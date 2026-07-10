import { db } from "@/db";
import { professionalContactLogs } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { contactId, name, type } = body;

    if (!name || !type) {
      return NextResponse.json({ error: "Missing required fields: name, type" }, { status: 400 });
    }

    const logId = `pcl-${Math.random().toString(36).substring(2, 11)}`;

    await db.insert(professionalContactLogs).values({
      id: logId,
      userId: session.user.id,
      contactId: contactId || null,
      contactName: name,
      contactType: type,
      contactedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
