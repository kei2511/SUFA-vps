import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  baseURL: {
    allowedHosts: [
      "mhfa-web.vercel.app",
      "mhfa-six.vercel.app",
      "mhfa-beta.vercel.app",
      "*.vercel.app",
      "localhost:3000",
    ],
    fallback: (() => {
      let url = process.env.BETTER_AUTH_URL || "http://localhost:3000";
      return url.replace(/\/$/, "");
    })(),
  },
  trustedOrigins: [
    "https://mhfa-web.vercel.app",
    "https://mhfa-six.vercel.app",
    "https://mhfa-beta.vercel.app",
    "https://*.vercel.app",
    "http://localhost:3000",
  ],
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "mhfa",
    trustedProxyHeaders: true,
  },
  session: {
    cookieCache: {
      enabled: false,
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
