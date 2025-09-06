import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserOrganization } from '@/hooks/useUserOrganization';
import GlobalLoading from './GlobalLoading';

interface UserRedirectProps {
  children: React.ReactNode;
}

export default function UserRedirect({ children }: UserRedirectProps) {
  const { loading, shouldRedirect, redirectPath } = useUserOrganization();

  console.log('UserRedirect: Status:', { loading, shouldRedirect, redirectPath });

  if (loading) {
    console.log('UserRedirect: Loading...');
    return <GlobalLoading message="Verificando acesso ao sistema..." />;
  }

  if (shouldRedirect) {
    console.log('UserRedirect: Redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('UserRedirect: Rendering children');
  return <>{children}</>;
}
