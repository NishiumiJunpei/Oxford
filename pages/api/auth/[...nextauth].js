// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import {findUserByEmail} from '../../../utils/prisma-utils'
import bcrypt from 'bcrypt';



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
          return { id: user.id, name: user.name, email: user.email };
        } else {
          // 認証失敗：nullを返す
          console.log('>< authorization error')
          return null;
        }
      }
    })

  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      const isAllowedToSignIn = true
      if (isAllowedToSignIn) {
        return true
      } else {
        // Return false to display a default error message
        return false
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
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
