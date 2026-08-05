import { db } from "@/db";
import { guides } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Get single guide
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const guide = await db.query.guides.findFirst({
      where: eq(guides.id, id)
    });

    if (!guide) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    return NextResponse.json({ guide });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update single guide (full update)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, youtubeUrl, instructions, conditionTags, status } = body;

    const updated = await db.update(guides)
      .set({
        title,
        description: description || "",
        youtubeUrl,
        instructions: typeof instructions === "string" ? instructions : JSON.stringify(instructions || []),
        conditionTags: conditionTags || [],
        status: status || "Aktif"
      })
      .where(eq(guides.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, guide: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Partial guide update (e.g. status toggle)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const updatePayload: any = {};

    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.youtubeUrl !== undefined) updatePayload.youtubeUrl = body.youtubeUrl;
    if (body.conditionTags !== undefined) updatePayload.conditionTags = body.conditionTags;
    if (body.instructions !== undefined) {
      updatePayload.instructions = typeof body.instructions === "string" ? body.instructions : JSON.stringify(body.instructions);
    }

    if (Object.keys(updatePayload).length > 0) {
      await db.update(guides)
        .set(updatePayload)
        .where(eq(guides.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete single guide
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session || !session.user || session.user.role !== "Admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const deleted = await db.delete(guides)
      .where(eq(guides.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Guide not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
