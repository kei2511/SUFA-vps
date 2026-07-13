import { db } from "@/db";
import { inviteCodes, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// Get all invite codes
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const codesList = await db.query.inviteCodes.findMany({
      orderBy: [desc(inviteCodes.createdAt)]
    });

    // Resolve name of user who used the code
    const resolved = await Promise.all(
      codesList.map(async (c) => {
        let usedBy = null;
        if (c.usedByUserId) {
          const u = await db.query.user.findFirst({
            where: eq(user.id, c.usedByUserId)
          });
          usedBy = u?.name || null;
        }

        // Check if expired and update status locally if needed
        let status = c.status;
        if (status === "Belum Digunakan" && new Date() > new Date(c.expiresAt)) {
          status = "Kedaluwarsa";
        }

        return {
          id: c.id,
          code: c.code,
          role: c.role,
          createdAt: c.createdAt,
          expiresAt: c.expiresAt,
          status,
          usedBy
        };
      })
    );

    return NextResponse.json({ inviteCodes: resolved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Generate new invite codes
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { codeCount, expiryDays, role } = await request.json();
    const codeRole = role === "Admin" ? "Admin" : "Konselor";

    if (!codeCount || !expiryDays) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const insertedCodes = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + parseInt(expiryDays));

    for (let i = 0; i < codeCount; i++) {
      // Generate randomized 8-char uppercase code, e.g. SUFA-ABCD
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `SUFA-${rand}`;
      const id = `inv-${Math.random().toString(36).substring(2, 11)}`;

      const inserted = await db.insert(inviteCodes)
        .values({
          id,
          code,
          role: codeRole,
          status: "Belum Digunakan",
          expiresAt,
          createdAt: new Date()
        })
        .returning();

      insertedCodes.push(inserted[0]);
    }

    return NextResponse.json({ success: true, count: insertedCodes.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
