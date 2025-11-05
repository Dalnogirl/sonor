import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { InvalidCredentialsError } from '@/domain/errors';
import { prisma } from '@/infrastructure/database/prisma/client';
import { PrismaUserRepository } from '@/infrastructure/database/repositories/PrismaUserRepository';
import { UserMapper } from '@/infrastructure/mappers/UserMapper';
import { BcryptPasswordHasher } from '@/infrastructure/services/BcryptPasswordHasher';
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Create dependencies (singleton pattern)
const userRepository = new PrismaUserRepository(prisma);
const bcrypt = new BcryptPasswordHasher();
const userMapper = new UserMapper();
const loginUseCase = new LoginUseCase(userRepository, bcrypt, userMapper);

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // LoginUseCase now returns UserResponseDTO (safe, no password)
          const userDTO = await loginUseCase.execute({
            email: credentials.email,
            password: credentials.password,
          });

          // Return user data for JWT token
          return {
            id: userDTO.id,
            email: userDTO.email,
            name: userDTO.name,
          };
        } catch (error: unknown) {
          if (error instanceof InvalidCredentialsError) {
            return null; // Invalid login
          }

          console.error('Unexpected auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Custom login page
  },
};

export default NextAuth(authOptions);
