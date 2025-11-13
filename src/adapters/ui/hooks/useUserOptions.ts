import { useMemo } from 'react';
import { useUsers } from './useUsers';

/**
 * useUserOptions
 *
 * Transforms user data into dropdown-ready format
 *
 * Applies:
 * - Information Expert: knows how to format UserResponseDTO for MultiSelect
 * - Indirection: shields consumers from UserResponseDTO structure changes
 * - Single Responsibility: only concerned with data transformation
 */
export const useUserOptions = () => {
  const { data: users, isLoading, error } = useUsers({});

  const options = useMemo(() => {
    if (!users) return [];

    return users.map((user) => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    }));
  }, [users]);

  return { options, isLoading, error };
};
