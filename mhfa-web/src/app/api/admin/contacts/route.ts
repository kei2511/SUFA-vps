import { db } from "@/db";
import { contacts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Get all contacts
export async function GET() {
  try {
    const list = await db.query.contacts.findMany();
    return NextResponse.json({ contacts: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a contact
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, institution, specialization, phone, schedule, scheduleDays, status, type } = body;

    if (!name || !institution || !specialization || !phone || !schedule || !scheduleDays || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newId = `c-${Math.random().toString(36).substring(2, 11)}`;

    const inserted = await db.insert(contacts)
      .values({
        id: newId,
        name,
        institution,
        specialization,
        phone,
        schedule,
        scheduleDays,
        status: status || "Tersedia",
        type
      })
      .returning();

    return NextResponse.json({ success: true, contact: inserted[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
