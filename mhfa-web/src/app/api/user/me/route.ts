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

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as Record<string, unknown>).role || "Pasien",
        image: session.user.image,
        phone: (session.user as Record<string, unknown>).phone || "",
        dob: (session.user as Record<string, unknown>).dob || "",
        nik: (session.user as Record<string, unknown>).nik || "",
        createdAt: session.user.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
