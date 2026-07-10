import { db } from "@/db";
import { inviteCodes, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { inviteId, userId } = await request.json();
    if (!inviteId) {
      return NextResponse.json({ error: "inviteId wajib diisi." }, { status: 400 });
    }

    // Get the invite code to read its role
    const invite = await db.query.inviteCodes.findFirst({
      where: eq(inviteCodes.id, inviteId)
    });

    if (!invite) {
      return NextResponse.json({ error: "Kode undangan tidak ditemukan." }, { status: 404 });
    }

    // Mark invite code as used
    await db
      .update(inviteCodes)
      .set({
        status: "Digunakan",
        usedByUserId: userId || null,
      })
      .where(eq(inviteCodes.id, inviteId));

    // Update user role based on the invite code's role
    if (userId && invite.role) {
      await db
        .update(user)
        .set({ role: invite.role })
        .where(eq(user.id, userId));
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
