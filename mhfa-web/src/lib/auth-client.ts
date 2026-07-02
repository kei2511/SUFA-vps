import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  let url = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
  if (!url && process.env.VERCEL_URL) {
    url = `https://${process.env.VERCEL_URL}`;
  }
  return (url || "").replace(/\/$/, "");
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  cookiePrefix: "mhfa",
});

