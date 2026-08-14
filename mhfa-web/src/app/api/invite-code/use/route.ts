import { db } from "@/db";
import { inviteCodes, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { inviteId, userId, assignedCounselorId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: "userId wajib diisi." }, { status: 400 });
    }

    // If an assignedCounselorId is passed (e.g. from counselor referral code)
    if (assignedCounselorId) {
      await db
        .update(user)
        .set({ assignedCounselorId: assignedCounselorId })
        .where(eq(user.id, userId));
    }

    if (inviteId) {
      // Get the invite code to read its role
      const invite = await db.query.inviteCodes.findFirst({
        where: eq(inviteCodes.id, inviteId)
      });

      if (invite) {
        // Mark invite code as used
        await db
          .update(inviteCodes)
          .set({
            status: "Digunakan",
            usedByUserId: userId,
          })
          .where(eq(inviteCodes.id, inviteId));

        // Update user role based on the invite code's role
        if (invite.role) {
          await db
            .update(user)
            .set({ role: invite.role })
            .where(eq(user.id, userId));

          if (invite.role === "Konselor") {
            const { ensureCounselorCode } = await import("@/lib/counselor-utils");
            await ensureCounselorCode(userId);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
