import { db } from "@/db";
import { screeningSessions, resultMappings, guides, contacts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, lte, gte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await auth.api.getSession({
      headers: await headers()
    });

    if (!sessionUser || !sessionUser.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: sessionId } = await params;

    // 1. Fetch Session
    const sess = await db.query.screeningSessions.findFirst({
      where: and(
        eq(screeningSessions.id, sessionId),
        eq(screeningSessions.userId, sessionUser.user.id)
      )
    });

    if (!sess) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 2. Fetch Result Description matching score range
    const mapping = await db.query.resultMappings.findFirst({
      where: and(
        eq(resultMappings.questionnaireId, sess.questionnaireId),
        lte(resultMappings.minScore, sess.score),
        gte(resultMappings.maxScore, sess.score)
      )
    });

    // 3. Fetch Guides matching condition label
    const allGuides = await db.query.guides.findMany();
    const matchingGuides = allGuides.filter(g => 
      Array.isArray(g.conditionTags) && g.conditionTags.includes(sess.conditionLabel)
    );

    // 4. Fetch Contacts
    const allContacts = await db.query.contacts.findMany();

    return NextResponse.json({
      session: sess,
      description: mapping?.description || "Kondisi emosional Anda relatif stabil.",
      guides: matchingGuides,
      contacts: allContacts
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
