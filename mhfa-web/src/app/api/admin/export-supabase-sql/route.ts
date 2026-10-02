import { NextResponse } from "next/server";
import postgres from "postgres";

export async function GET() {
  const supabaseUrl =
    process.env.SUPABASE_DATABASE_URL ||
    "postgresql://postgres.mqjgejhhtrrcykgeqzho:keisyariq25@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres";

  const src = postgres(supabaseUrl, {
    ssl: "require",
    prepare: false,
    connect_timeout: 15,
  });

  const tables = [
    "user",
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

  try {
    let sqlDump = `-- ========================================================\n`;
    sqlDump += `-- SUFA Database Dump from Supabase\n`;
    sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
    sqlDump += `-- ========================================================\n\n`;
    sqlDump += `SET session_replication_role = 'replica';\n\n`;

    for (const table of tables) {
      const rows = await src`SELECT * FROM ${src(table)}`;
      if (!rows || rows.length === 0) continue;

      sqlDump += `-- Table: ${table} (${rows.length} rows)\n`;

      for (const row of rows) {
        const columns = Object.keys(row);
        const colNames = columns.map((c) => `"${c}"`).join(", ");
        const values = columns
          .map((c) => {
            const val = row[c];
            if (val === null || val === undefined) return "NULL";
            if (typeof val === "boolean") return val ? "true" : "false";
            if (typeof val === "number") return val;
            if (val instanceof Date) return `'${val.toISOString()}'`;
            if (typeof val === "object") {
              return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
            }
            return `'${String(val).replace(/'/g, "''")}'`;
          })
          .join(", ");

        sqlDump += `INSERT INTO "${table}" (${colNames}) VALUES (${values}) ON CONFLICT ("id") DO NOTHING;\n`;
      }
      sqlDump += `\n`;
    }

    sqlDump += `SET session_replication_role = 'origin';\n`;
    sqlDump += `-- End of Dump\n`;

    return new Response(sqlDump, {
      status: 200,
      headers: {
        "Content-Type": "application/sql; charset=utf-8",
        "Content-Disposition": 'attachment; filename="supabase_backup.sql"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    await src.end({ timeout: 5 });
  }
}
