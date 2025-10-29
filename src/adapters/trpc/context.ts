import { createRepositories } from '@/infrastructure/factories/create-repositories';
import { createUseCases } from '@/infrastructure/factories/create-use-cases';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  const repositories = createRepositories();
  const useCases = createUseCases(repositories);
  return {
    useCases,
    repositories,
  };
};
export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
