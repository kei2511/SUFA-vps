import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const { db } = await import("@/db");
    const { user } = await import("@/db/schema");
    const { eq } = await import("drizzle-orm");

    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: dbUser?.role || (session.user as Record<string, unknown>).role || "Konseli",
        image: session.user.image,
        phone: dbUser?.phone || (session.user as Record<string, unknown>).phone || "",
        dob: dbUser?.dob || (session.user as Record<string, unknown>).dob || "",
        nik: dbUser?.nik || (session.user as Record<string, unknown>).nik || "",
        counselorCode: dbUser?.counselorCode || null,
        assignedCounselorId: dbUser?.assignedCounselorId || null,
        createdAt: session.user.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
