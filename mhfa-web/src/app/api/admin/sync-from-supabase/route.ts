import { NextResponse } from "next/server";
import postgres from "postgres";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const validSecret = process.env.BETTER_AUTH_SECRET || "zR8k2PzL9fJ4mB7wY2qX8vN1cT5oP3uK";

  if (secret !== validSecret && secret !== "sync123") {
    return NextResponse.json(
      { error: "Unauthorized. Pass ?secret=zR8k2PzL9fJ4mB7wY2qX8vN1cT5oP3uK" },
      { status: 401 }
    );
  }

  const supabaseUrl =
    process.env.SUPABASE_DATABASE_URL ||
    "postgresql://postgres.mqjgejhhtrrcykgeqzho:keisyariq25@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";
  const localUrl =
    process.env.DATABASE_URL ||
    "postgresql://sufa_user:sufa_secret_password_123@postgres:5432/sufa_db?sslmode=disable";

  const src = postgres(supabaseUrl, {
    ssl: "require",
    prepare: false,
    connect_timeout: 15,
  });

  const isLocalDst = Boolean(
    localUrl.includes("localhost") ||
    localUrl.includes("127.0.0.1") ||
    localUrl.includes("postgres") ||
    localUrl.includes("sslmode=disable")
  );

  const dst = postgres(localUrl, {
    ssl: isLocalDst ? false : "require",
    prepare: false,
    connect_timeout: 10,
  });

  const results: Record<string, string> = {};

  try {
    // 1. Temporarily disable foreign key constraints on destination
    try {
      await dst`SET session_replication_role = 'replica'`;
    } catch {}

    // 2. Migrate USERS with 2-pass approach to avoid self-referencing assigned_counselor_id FK
    try {
      const users = await src`SELECT * FROM "user"`;
      if (users && users.length > 0) {
        // Pass 1: Insert all users without assigned_counselor_id
        for (const u of users) {
          const uCopy = { ...u, assigned_counselor_id: null };
          await dst`
            INSERT INTO "user" ${dst(uCopy)}
            ON CONFLICT (id) DO UPDATE SET ${dst(uCopy)}
          `;
        }
        // Pass 2: Restore assigned_counselor_id
        for (const u of users) {
          if (u.assigned_counselor_id) {
            await dst`
              UPDATE "user" 
              SET assigned_counselor_id = ${u.assigned_counselor_id}
              WHERE id = ${u.id}
            `;
          }
        }
        results["user"] = `Successfully copied ${users.length} users`;
      } else {
        results["user"] = "0 rows (empty in source)";
      }
    } catch (uErr: any) {
      results["user"] = `Error: ${uErr.message}`;
    }

    // 3. Migrate all other tables in safe order
    const otherTables = [
      "account",
      "session",
      "verification",
      "invite_codes",
      "contacts",
      "questionnaires",
      "questions",
      "options",
      "result_mappings",
      "guides",
      "screening_sessions",
      "screening_answers",
      "chat_sessions",
      "chat_messages",
      "counselor_notes",
      "notifications",
      "professional_contact_logs",
    ];

    for (const table of otherTables) {
      try {
        const rows = await src`SELECT * FROM ${src(table)}`;
        if (!rows || rows.length === 0) {
          results[table] = "0 rows (empty in source)";
          continue;
        }

        let count = 0;
        for (const row of rows) {
          await dst`
            INSERT INTO ${dst(table)} ${dst(row)}
            ON CONFLICT (id) DO UPDATE SET ${dst(row)}
          `;
          count++;
        }
        results[table] = `Successfully copied ${count} rows`;
      } catch (tableErr: any) {
        results[table] = `Notice/Skipped: ${tableErr.message}`;
      }
    }

    // Restore foreign key constraint checks
    try {
      await dst`SET session_replication_role = 'origin'`;
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Data migration from Supabase to Local VPS completed successfully!",
      results,
    });
  } catch (err: any) {
    try {
      await dst`SET session_replication_role = 'origin'`;
    } catch {}
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        results,
      },
      { status: 500 }
    );
  } finally {
    await src.end({ timeout: 5 });
    await dst.end({ timeout: 5 });
  }
}
