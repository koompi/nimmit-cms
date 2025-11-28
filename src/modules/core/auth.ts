import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import KoompiProvider, {
  isKoompiOAuthConfigured,
} from "./providers/koompi-provider";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

// Build providers array dynamically based on configuration
const providers: NextAuthOptions["providers"] = [];

// Add Koompi OAuth if configured (primary auth method)
if (isKoompiOAuthConfigured()) {
  providers.push(
    KoompiProvider({
      clientId: process.env.KOOMPI_CLIENT_ID!,
      clientSecret: process.env.KOOMPI_CLIENT_SECRET!,
    })
  );
}

// Add credentials provider as fallback for admin/dev access
providers.push(
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user) {
        return null;
      }

      // Only check password if user has one (OAuth users might not)
      if (user.password) {
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) {
          return null;
        }
      } else {
        // If no password, they must login via OAuth
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        telegramId: user.telegramId,
        walletAddress: user.walletAddress,
      };
    },
  })
);

// Core authentication configuration
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Handle Koompi OAuth sign in
      if (account?.provider === "koompi") {
        try {
          // Check if user exists by email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (existingUser) {
            // Update existing user with Koompi profile data
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name,
                image: user.image,
                username: (user as unknown as { username?: string }).username,
                firstName: (user as unknown as { firstName?: string })
                  .firstName,
                lastName: (user as unknown as { lastName?: string }).lastName,
                telegramId: (user as unknown as { telegramId?: number })
                  .telegramId,
                walletAddress: (user as unknown as { walletAddress?: string })
                  .walletAddress,
              },
            });

            // Check if existing user has a membership for their current org
            if (existingUser.organizationId) {
              const existingMembership =
                await prisma.organizationMembership.findUnique({
                  where: {
                    userId_organizationId: {
                      userId: existingUser.id,
                      organizationId: existingUser.organizationId,
                    },
                  },
                });

              // Create membership if it doesn't exist (for legacy users)
              if (!existingMembership) {
                await prisma.organizationMembership.create({
                  data: {
                    userId: existingUser.id,
                    organizationId: existingUser.organizationId,
                    role: existingUser.role,
                    isDefault: true,
                  },
                });
              }
            }
          } else {
            // Find or create default organization for new users
            let defaultOrg = await prisma.organization.findFirst({
              where: { slug: "grood" },
            });

            if (!defaultOrg) {
              defaultOrg = await prisma.organization.create({
                data: {
                  name: "Grood",
                  slug: "grood",
                },
              });
            }

            // Create new user with organization and membership
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                username: (user as unknown as { username?: string }).username,
                firstName: (user as unknown as { firstName?: string })
                  .firstName,
                lastName: (user as unknown as { lastName?: string }).lastName,
                telegramId: (user as unknown as { telegramId?: number })
                  .telegramId,
                walletAddress: (user as unknown as { walletAddress?: string })
                  .walletAddress,
                role: "USER", // Default role for new OAuth users
                organizationId: defaultOrg.id,
              },
            });

            // Create organization membership for the new user
            await prisma.organizationMembership.create({
              data: {
                userId: newUser.id,
                organizationId: defaultOrg.id,
                role: "USER",
                isDefault: true,
              },
            });
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.username = user.username;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.telegramId = user.telegramId;
        token.walletAddress = user.walletAddress;
      }

      // For OAuth sign-ins, fetch the latest user data from DB
      if (account?.provider === "koompi" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.organizationId = dbUser.organizationId;
          token.username = dbUser.username;
          token.firstName = dbUser.firstName;
          token.lastName = dbUser.lastName;
          token.telegramId = dbUser.telegramId;
          token.walletAddress = dbUser.walletAddress;
        }
      }

      // Handle session update
      if (trigger === "update" && session) {
        token.role = session.user.role;
        token.organizationId = session.user.organizationId;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;
        session.user.username = token.username as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.telegramId = token.telegramId as number;
        session.user.walletAddress = token.walletAddress as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    async signIn({ user, account }) {
      // Log successful sign-ins for audit
      console.log(`User ${user.email} signed in via ${account?.provider}`);
    },
  },
};

// Export helper to check if Koompi OAuth is available
export { isKoompiOAuthConfigured };
