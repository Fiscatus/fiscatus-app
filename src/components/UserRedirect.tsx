import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserOrganization } from '@/hooks/useUserOrganization';

interface UserRedirectProps {
  children: React.ReactNode;
}

export default function UserRedirect({ children }: UserRedirectProps) {
  const { loading, shouldRedirect, redirectPath } = useUserOrganization();

  console.log('UserRedirect: Status:', { loading, shouldRedirect, redirectPath });

  if (loading) {
    console.log('UserRedirect: Loading...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    console.log('UserRedirect: Redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log('UserRedirect: Rendering children');
  return <>{children}</>;
}
