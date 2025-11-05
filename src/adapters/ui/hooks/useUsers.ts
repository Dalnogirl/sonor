import { trpc } from '@/lib/trpc';

export const useUsers = ({
  page,
  pageSize,
}: {
  page?: number;
  pageSize?: number;
}) => {
  return trpc.user.list.useQuery({ page, pageSize });
};
