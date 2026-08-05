import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Akses ditolak. Hanya Admin yang dapat menetapkan konselor." }, { status: 403 });
    }

    const { userId, counselorId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "userId wajib diisi." }, { status: 400 });
    }

    // If counselorId is provided, verify counselor exists
    if (counselorId) {
      const counselor = await db.query.user.findFirst({
        where: eq(user.id, counselorId)
      });

      if (!counselor || counselor.role !== "Konselor") {
        return NextResponse.json({ error: "Konselor tidak ditemukan atau role tidak sesuai." }, { status: 400 });
      }
    }

    // Update user's assignedCounselorId
    await db
      .update(user)
      .set({
        assignedCounselorId: counselorId || null
      })
      .where(eq(user.id, userId));

    return NextResponse.json({ success: true, userId, assignedCounselorId: counselorId || null });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Terjadi kesalahan server." }, { status: 500 });
  }
}
