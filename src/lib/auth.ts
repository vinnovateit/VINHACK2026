import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { verifyParticipantRegistered } from "@/lib/check-registration";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
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
      if (!user?.email) {
        console.warn("[AUTH] Rejected sign-in: No email provided by OAuth provider.");
        return false;
      }

      const email = user.email.toLowerCase().trim();
      console.log(`[AUTH] Verifying registration for incoming OAuth sign-in: ${email}`);

      try {
        const check = await verifyParticipantRegistered(email);

        if (!check.isRegistered) {
          console.warn(
            `[AUTH_REJECTED] Access denied for ${email}: No participant record found in vit_students, external_students, or users collections.`
          );
          return false;
        }

        console.log(`[AUTH_APPROVED] Sign-in permitted for ${email} (${check.participantType} via ${check.method})`);
        return true;
      } catch (err) {
        console.error(
          `[AUTH_ERROR] Unexpected error verifying sign-in for ${email}:`,
          err
        );
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
