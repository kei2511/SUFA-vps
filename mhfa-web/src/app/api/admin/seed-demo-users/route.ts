import { NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");

  // Optional protection: allow if secret matches or if no admin exists yet
  const existingAdmin = await db.query.user.findFirst({
    where: eq(user.role, "Admin"),
  });

  const validSecret = process.env.BETTER_AUTH_SECRET;
  if (existingAdmin && secretParam !== validSecret) {
    return NextResponse.json(
      { error: "Admin already exists. Pass ?secret=BETTER_AUTH_SECRET to re-run seed." },
      { status: 403 }
    );
  }

  const results: Record<string, string> = {};

  const demoAccounts = [
    {
      email: "admin@sufa.id",
      password: "password123",
      name: "Admin SUFA",
      role: "Admin",
      status: "Aktif",
      phone: "+6281200000001",
      dob: "1990-01-01",
    },
    {
      email: "konselor@sufa.id",
      password: "password123",
      name: "Konselor SUFA",
      role: "Konselor",
      status: "Aktif",
      phone: "+6281200000002",
      dob: "1992-05-15",
    },
    {
      email: "pasien@sufa.id",
      password: "password123",
      name: "Konseli Test",
      role: "Konseli",
      status: "Aktif",
      phone: "+6281200000003",
      dob: "2000-10-10",
    },
  ];

  for (const acc of demoAccounts) {
    try {
      const existing = await db.query.user.findFirst({
        where: eq(user.email, acc.email),
      });

      if (!existing) {
        await auth.api.signUpEmail({
          body: acc,
        } as any);
        results[acc.email] = "Created successfully";
      } else {
        results[acc.email] = "Already exists";
      }
    } catch (err: any) {
      results[acc.email] = `Error: ${err.message}`;
    }
  }

  return NextResponse.json({
    message: "Seed demo users completed",
    results,
    loginCredentials: {
      password: "password123",
      users: [
        { role: "Admin", email: "admin@sufa.id" },
        { role: "Konselor", email: "konselor@sufa.id" },
        { role: "Konseli", email: "pasien@sufa.id" },
      ],
    },
  });
}
