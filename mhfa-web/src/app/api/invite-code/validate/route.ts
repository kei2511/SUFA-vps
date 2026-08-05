import { db } from "@/db";
import { inviteCodes, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ valid: false, error: "Kode undangan wajib diisi." }, { status: 400 });
    }

    const cleanCode = code.toUpperCase().trim();

    // 1. Check inviteCodes table first
    const [invite] = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.code, cleanCode))
      .limit(1);

    if (invite) {
      if (invite.status === "Digunakan") {
        return NextResponse.json({ valid: false, error: "Kode undangan sudah digunakan." }, { status: 400 });
      }

      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        return NextResponse.json({ valid: false, error: "Kode undangan sudah kedaluwarsa." }, { status: 400 });
      }

      return NextResponse.json({ valid: true, inviteId: invite.id, role: invite.role });
    }

    // 2. Check user table for counselorCode
    const counselor = await db.query.user.findFirst({
      where: eq(user.counselorCode, cleanCode)
    });

    if (counselor && counselor.role === "Konselor") {
      return NextResponse.json({
        valid: true,
        inviteId: null,
        isCounselorCode: true,
        counselorId: counselor.id,
        counselorName: counselor.name,
        role: "Konseli",
        message: `Kode rujukan Konselor ${counselor.name}`
      });
    }

    return NextResponse.json({ valid: false, error: "Kode undangan tidak ditemukan." }, { status: 404 });
  } catch {
    return NextResponse.json({ valid: false, error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
