import { Loader } from '@mantine/core';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

interface PrivatePageProps {
  children: ReactNode;
}

const PrivatePage = ({ children }: PrivatePageProps) => {
  const { data: session, status } = useSession();

  if (status === 'loading') return <Loader />;
  if (!session?.user) return redirect('/login');

  return <>{children}</>;
};

export const withPrivatePage = <T extends object>(
  Component: React.ComponentType<T>
) => {
  return function ProtectedComponent(props: T) {
    return (
      <PrivatePage>
        <Component {...props} />
      </PrivatePage>
    );
  };
};
