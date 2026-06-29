import { db } from "@/db";
import { guides } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Get all guides
export async function GET() {
  try {
    const allGuides = await db.query.guides.findMany();
    return NextResponse.json({ guides: allGuides });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new guide
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, youtubeUrl, instructions, conditionTags, status } = body;

    if (!title || !youtubeUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newId = `guide-${Math.random().toString(36).substring(2, 11)}`;

    const inserted = await db.insert(guides)
      .values({
        id: newId,
        title,
        description: description || "",
        youtubeUrl,
        instructions: instructions || "[]",
        conditionTags: conditionTags || [],
        status: status || "Aktif"
      })
      .returning();

    return NextResponse.json({ success: true, guide: inserted[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
