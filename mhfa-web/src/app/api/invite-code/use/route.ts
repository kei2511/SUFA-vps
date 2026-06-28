import { db } from "@/db";
import { inviteCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { inviteId, userId } = await request.json();
    if (!inviteId) {
      return NextResponse.json({ error: "inviteId wajib diisi." }, { status: 400 });
    }

    await db
      .update(inviteCodes)
      .set({
        status: "Digunakan",
        usedByUserId: userId || null,
      })
      .where(eq(inviteCodes.id, inviteId));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
