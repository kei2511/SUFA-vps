import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export function generateCounselorCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KSL-${suffix}`;
}

export async function ensureCounselorCode(userId: string, currentCode?: string | null): Promise<string> {
  if (currentCode && currentCode.trim()) {
    return currentCode;
  }

  let code = generateCounselorCode();
  let existing = await db.query.user.findFirst({
    where: eq(user.counselorCode, code),
  });

  while (existing) {
    code = generateCounselorCode();
    existing = await db.query.user.findFirst({
      where: eq(user.counselorCode, code),
    });
  }

  await db.update(user).set({ counselorCode: code }).where(eq(user.id, userId));
  return code;
}
