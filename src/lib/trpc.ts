import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/adapters/trpc/routers/_app';

export const trpc = createTRPCReact<AppRouter>();
