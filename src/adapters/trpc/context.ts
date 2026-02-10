import { createRepositories } from '@/infrastructure/factories/create-repositories';
import { createUseCases } from '@/infrastructure/factories/create-use-cases';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const createTRPCContext = async (
  _opts?: FetchCreateContextFnOptions
) => {
  const repositories = createRepositories();
  const useCases = createUseCases(repositories);
  const session = await getServerSession(authOptions);
  return {
    session,
    useCases,
  };
};
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
