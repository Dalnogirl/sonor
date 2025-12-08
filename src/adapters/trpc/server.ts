import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from './routers/_app';
import { createTRPCContext } from './context';

export const createSSRHelpers = async () => {
  const context = await createTRPCContext();

  return createServerSideHelpers({
    router: appRouter,
    ctx: context,
  });
};
