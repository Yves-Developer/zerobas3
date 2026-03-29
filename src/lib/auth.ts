import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

// Fetch config from DB at startup if available
let googleClientId = process.env.GOOGLE_CLIENT_ID;
let googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

try {
    const configs = await db.authConfig.findMany({
        where: { key: { in: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] } }
    });
    const configMap = configs.reduce((acc: Record<string, string>, curr: { key: string, value: string }) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);

    if (configMap.GOOGLE_CLIENT_ID) googleClientId = configMap.GOOGLE_CLIENT_ID;
    if (configMap.GOOGLE_CLIENT_SECRET) googleClientSecret = configMap.GOOGLE_CLIENT_SECRET;
} catch (e) {
    console.error("Failed to fetch auth config from DB:", e);
}

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql",
    }),
    user: {
        modelName: "user",
    },
    account: {
        fields: {
            providerId: "provider",
            accountId: "providerAccountId",
            accessToken: "access_token",
            refreshToken: "refresh_token",
            accessTokenExpiresAt: "expires_at",
            tokenType: "token_type",
            scope: "scope",
            idToken: "id_token",
            sessionState: "session_state",
        }
    },
    session: {
        modelName: "session",
    },
    cookie: {
        sameSite: "none",
        secure: true
    },
    verification: {
        modelName: "verification",
    },
    socialProviders: {
        google: {
            clientId: googleClientId!,
            clientSecret: googleClientSecret!,
        },
    },
    trustedOrigins: ["http://localhost:3001"],
    advanced: {
        useSecureCookies: true,
    }
});



