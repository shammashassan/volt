import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import clientPromise from "./mongodb";

const client = await clientPromise;
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: client
  }),
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/get-session": false,
    },
  },
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: { enabled: true },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    }
  },
  experimental: {
    joins: true
  },
  user: {
    deleteUser: {
      enabled: true,
    },
    changeEmail: {
      enabled: true,
    },
    additionalFields: {
      isApproved: {
        type: "boolean",
        defaultValue: false,
        required: false,
        input: false,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminUserIds: ["admin@gmail.com"],
    }),
    nextCookies()
  ],
});
