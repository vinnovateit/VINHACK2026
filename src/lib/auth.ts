import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  // JWT strategy — no database adapter needed for sessions.
  // We only need the user's email to verify payment status.
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, profile }) {
      // On first sign-in, persist Google profile info into the JWT
      if (profile?.email) {
        token.email = profile.email;
        token.name = profile.name;
        token.picture = profile.picture;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose email/name/image in the client-side session object
      if (token.email) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
});
