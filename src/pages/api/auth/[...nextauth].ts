import NextAuth from 'next-auth';
import Providerds from 'next-auth/providers';

export default NextAuth({
  providers: [
    Providerds.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: 'read:user'
    }),
  ],
});