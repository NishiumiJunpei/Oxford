// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"; 
import {findUserByEmail} from '../../../utils/prisma-utils'
import bcrypt from 'bcrypt';
import { createSignUpToken } from "@/utils/user-utils";



export const authOptions = {
  // Configure one or more authentication providers
  session: {
    strategy: "jwt"
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    encryption: true,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        const user = await findUserByEmail(credentials.email);
        
        // ユーザーが存在し、パスワードが一致する場合
        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          // 認証成功：ユーザーオブジェクトを返す
          console.log('^^ authorization is done successfully')
          return { id: user.id, name: user.name, email: user.email, currentChallengeThemeId: user.currentChallengeThemeId };
        } else {
          // 認証失敗：nullを返す
          console.log('>< authorization error')
          return null;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),

  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {

      if (account.provider === 'google') {
        const userEmail = user.email;
        const existingUser = await findUserByEmail(userEmail);

        if (!existingUser) {
          const token = await createSignUpToken(userEmail); // この関数は独自に実装する必要があります

          const domainUrl = process.env.DOMAIN_URL;
          return `/auth/signup/inputUserInfo?token=${token}`;
        } else {
          user.id = existingUser.id; 
          return true;
        }
      }
      return true;

    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.userId) {
        session.userId = token.userId;
      }
      return session;
    },    
    async redirect({ url, baseUrl }) {
      // ユーザーがサインインした後のリダイレクト先
      return baseUrl;
    }    
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    verifyRequest: '/auth/verify-request', // (used for check email message)
    newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  }
}

export default NextAuth(authOptions)
