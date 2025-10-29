import { trpc } from '@/lib/trpc';

export const useUsers = () => {
  return trpc.user.list.useQuery();
};
