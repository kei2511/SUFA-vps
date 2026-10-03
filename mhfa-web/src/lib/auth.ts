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
  trustedOrigins: [
    "http://43.173.9.179:3000",
    "http://43.173.9.179",
    "http://localhost:3000",
    "*.sslip.io",
    "*.duckdns.org",
    "http://*.sslip.io",
    "https://*.sslip.io",
    "http://*.duckdns.org",
    "https://*.duckdns.org",
    "*",
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ].filter(Boolean) as string[],
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
