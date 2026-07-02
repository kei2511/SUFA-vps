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
    if (!url) {
      url = "http://localhost:3000";
    }
    return url.replace(/\/$/, "");
  })(),
  trustedOrigins: (() => {
    const origins = [
      "https://mhfa-web.vercel.app",
      "https://mhfa-six.vercel.app",
      "https://mhfa-beta.vercel.app",
      "https://*.vercel.app",
      "http://localhost:3000"
    ];
    if (process.env.VERCEL_URL) {
      origins.push(`https://${process.env.VERCEL_URL}`);
    }
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
    }
    return origins;
  })(),
  advanced: {
    useSecureCookies: true,
    cookiePrefix: "mhfa",
    trustedProxyHeaders: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      console.log(`[RESET PASSWORD] URL: ${url}`);
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "Pasien",
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
      nik: {
        type: "string",
        required: false,
      },
    },
  },
});
export type Auth = typeof auth;
