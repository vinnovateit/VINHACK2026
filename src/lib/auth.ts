import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // Check payment / registration in database BEFORE allowing the user to sign in
    async signIn({ user }) {
      if (!user?.email) return false;

      const email = user.email.toLowerCase().trim();

      try {
        // Query User, VITStudent, and ExternalStudent records
        const [dbUser, vitStudent, externalStudent] = await Promise.all([
          prisma.user.findUnique({ where: { email } }),
          prisma.vITStudent.findUnique({ where: { email } }),
          prisma.externalStudent.findFirst({ where: { email } }),
        ]);

        const isRegistered = Boolean(
          dbUser?.isRegistered || vitStudent || externalStudent
        );

        if (!isRegistered) {
          console.warn(
            `[AUTH_REJECTED] Access denied for ${email}: No paid or registered participant record found in database.`
          );
          // Returning false blocks the sign-in completely and redirects to AccessDenied
          return false;
        }

        console.log(`[AUTH_APPROVED] Sign-in permitted for ${email}`);
        return true;
      } catch (err) {
        console.error(
          "[AUTH_ERROR] Database connection failed during sign-in verification:",
          err
        );
        // Fail closed for security if database is unreachable
        return false;
      }
    },
    async jwt({ token, profile }) {
      if (profile?.email) {
        token.email = profile.email;
        token.name = profile.name;
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.email) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
});
