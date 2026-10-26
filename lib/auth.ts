import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { nextCookies } from "better-auth/next-js"
import { username } from "better-auth/plugins/username"
import { magicLink } from "better-auth/plugins/magic-link"
import { twoFactor } from "better-auth/plugins/two-factor"
import { admin } from "better-auth/plugins/admin"
import { passkey } from "@better-auth/passkey"
import { organization } from "better-auth/plugins"
import { ac, roles } from "@/lib/access"
import { db } from "@/lib/db/client"
import { sendEmail } from "@/lib/email"
import { getPasswordResetEmailHtml } from "@/lib/email-templates"

export const auth = betterAuth({
  appName: "Volt",
  database: mongodbAdapter(db),
  baseURL: process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 256,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 30,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your Volt password",
        html: getPasswordResetEmailHtml(url, user.name || undefined),
      })
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your Volt email",
        html: `<p>Please click the link below to verify your email address:</p><p><a href="${url}">Verify Email</a></p>`,
      })
    },
    sendOnSignUp: false,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder-google-client-secret",
    },
  },

  user: {
    additionalFields: {
      isApproved: { type: "boolean", defaultValue: false, required: false },
      approved: { type: "boolean", defaultValue: false, required: false },
    },
    deleteUser: { enabled: true },
    changeEmail: { enabled: true },
  },

  plugins: [
    username(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmail({
          to: email,
          subject: "Your Volt sign-in link",
          html: `<p>Click below to sign in to your Volt account:</p><p><a href="${url}">Sign in to Volt</a></p>`,
        })
      },
    }),
    twoFactor({
      issuer: "Volt",
      allowPasswordless: true,
      totpOptions: { digits: 6, period: 30 },
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendEmail({
            to: user.email,
            subject: "Your Volt verification code",
            html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
          })
        },
        period: 5,
        allowedAttempts: 5,
        storeOTP: "encrypted",
      },
      backupCodeOptions: { amount: 10, length: 10, storeBackupCodes: "encrypted" },
      twoFactorCookieMaxAge: 600,
      trustDeviceMaxAge: 30 * 24 * 60 * 60,
    }),
    passkey({
      rpID: process.env.NEXT_PUBLIC_APP_DOMAIN ?? "localhost",
      rpName: "Volt",
      origin: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    }),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      impersonationSessionDuration: 60 * 60,
      ac,
      roles,
    }),
    organization({
      creatorRole: "owner",
      invitationExpiresIn: 60 * 60 * 24 * 7,
      requireEmailVerificationOnInvitation: false,
      organizationHooks: {
        beforeCreateOrganization: async ({ organization }) => {
          let baseSlug = (organization.name || "organization")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^[-]+|[-]+$/g, "")

          if (!baseSlug) {
            baseSlug = "organization"
          }

          let slug = baseSlug
          let counter = 1

          while (true) {
            const existing = await db.collection("organization").findOne({ slug })
            if (!existing) break
            slug = `${baseSlug}-${counter++}`
          }

          return {
            data: {
              ...organization,
              slug,
            },
          }
        },
      },
    }),
    nextCookies(),
  ],

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              isApproved: false,
              approved: false,
            },
          }
        },
        after: async (user) => {
          try {
            const admins = await db.collection("user").find({
              $or: [{ role: "admin" }, { roles: "admin" }],
            }).toArray()
            if (admins.length > 0) {
              const notifications = admins.map((admin) => ({
                userId: (admin._id ? admin._id.toString() : admin.id) as string,
                title: "New User Registration",
                message: `${user.name || user.email || "A new user"} has registered and is pending approval.`,
                type: "system",
                link: "/users?tab=pending",
                createdAt: new Date(),
                updatedAt: new Date(),
              }))
              await db.collection("notifications").insertMany(notifications)
            }
          } catch (err) {
            console.error("Failed to notify admins on user registration:", err)
          }
        },
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      requireLocalEmailVerified: false,
    },
    encryptOAuthTokens: true,
  },

  rateLimit: {
    enabled: true,
    storage: "memory",
    customRules: {
      "/get-session": false,
      "/api/auth/get-session": false,
      "/api/auth/sign-in/email": { window: 60, max: 5 },
      "/api/auth/sign-up/email": { window: 60, max: 3 },
      "/api/auth/magic-link/send": { window: 60, max: 3 },
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    ipAddress: { ipAddressHeaders: ["x-forwarded-for", "x-real-ip"], disableIpTracking: false },
  },

  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ].filter(Boolean) as string[],
})

export type Session = typeof auth.$Infer.Session
