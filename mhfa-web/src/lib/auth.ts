import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  baseURL: (() => {
    let url = process.env.BETTER_AUTH_URL;
    if (!url && process.env.VERCEL_URL) {
      url = `https://${process.env.VERCEL_URL}`;
    }
    return (url || "http://43.173.9.179:3000").replace(/\/$/, "");
  })(),
  trustedOrigins: async (request: Request) => {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    const origins = [
      origin,
      host ? `http://${host}` : undefined,
      host ? `https://${host}` : undefined,
      process.env.BETTER_AUTH_URL,
      process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
      "http://43.173.9.179:3000",
      "http://localhost:3000",
    ].filter(Boolean) as string[];
    return Array.from(new Set(origins));
  },
  advanced: {
    useSecureCookies: process.env.USE_SECURE_COOKIES === "true"
      ? true
      : process.env.USE_SECURE_COOKIES === "false"
        ? false
        : Boolean(process.env.BETTER_AUTH_URL?.startsWith("https://")),
    cookiePrefix: "sufa",
    trustedProxyHeaders: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "compact",
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ url }) => {
      console.log(`[RESET PASSWORD] URL: ${url}`);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "Konseli",
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "Aktif",
      },
      phone: {
        type: "string",
        required: false,
      },
      dob: {
        type: "string",
        required: false,
      },
      gender: {
        type: "string",
        required: false,
      },
      nik: {
        type: "string",
        required: false,
      },
    },
  },
});
export type Auth = typeof auth;
