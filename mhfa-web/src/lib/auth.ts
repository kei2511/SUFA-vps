import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
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
