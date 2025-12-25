import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { localDb, DB_MODE } from './db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: '이메일', type: 'email' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const email = credentials.email as string;
          const password = credentials.password as string;

          // 로컬 모드: JSON 파일에서 인증
          if (DB_MODE === 'local') {
            const admin = localDb.admins.findUnique({ where: { email } });
            if (admin) {
              const isPasswordValid = await bcrypt.compare(password, admin.password);
              if (isPasswordValid) {
                return {
                  id: admin.id,
                  email: admin.email,
                  name: admin.name,
                };
              }
            }
            return null;
          }

          // DB 모드: PostgreSQL에서 인증
          try {
            const admin = await prisma.admin.findUnique({
              where: { email },
            });

            if (admin) {
              const isPasswordValid = await bcrypt.compare(password, admin.password);
              if (isPasswordValid) {
                return {
                  id: admin.id,
                  email: admin.email,
                  name: admin.name,
                };
              }
              return null;
            }
          } catch (dbError) {
            console.error('DB not available, trying local auth:', dbError);
            // DB 실패 시 로컬 인증 시도
            const admin = localDb.admins.findUnique({ where: { email } });
            if (admin) {
              const isPasswordValid = await bcrypt.compare(password, admin.password);
              if (isPasswordValid) {
                return {
                  id: admin.id,
                  email: admin.email,
                  name: admin.name,
                };
              }
            }
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
});
