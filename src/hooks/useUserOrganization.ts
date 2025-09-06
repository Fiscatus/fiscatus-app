import { useState, useEffect } from 'react';
import { useUser, type User } from '@/contexts/UserContext';

export interface UserOrganizationStatus {
  hasOrganization: boolean;
  hasPendingInvites: boolean;
  shouldRedirect: boolean;
  redirectPath: string;
  loading: boolean;
}

export function useUserOrganization(): UserOrganizationStatus {
  const { user } = useUser();
  const [status, setStatus] = useState<UserOrganizationStatus>({
    hasOrganization: false,
    hasPendingInvites: false,
    shouldRedirect: false,
    redirectPath: '/',
    loading: true
  });

  useEffect(() => {
    if (!user) {
      console.log('useUserOrganization: No user found, redirecting to login');
      setStatus({
        hasOrganization: false,
        hasPendingInvites: false,
        shouldRedirect: true,
        redirectPath: '/login',
        loading: false
      });
      return;
    }

    // Verificar se o usuário tem organização
    const hasOrganization = user.orgs && user.orgs.length > 0;

    // Simular verificação de convites pendentes
    // Em produção, isso viria de uma API
    const hasPendingInvites = checkPendingInvites(user);

    // Verificar se estamos na página de verificar convite
    const currentPath = window.location.pathname;
    const isOnVerifyPage = currentPath === '/fiscatus-app/verificar-convite' || currentPath === '/verificar-convite';

    let redirectPath = '/';
    let shouldRedirect = true;

    console.log('useUserOrganization Debug:', {
      user: user.email,
      hasOrganization,
      hasPendingInvites,
      currentPath,
      isOnVerifyPage
    });

    // Se estiver na página de verificar convite, não redirecionar
    if (isOnVerifyPage) {
      shouldRedirect = false;
      console.log('useUserOrganization: On verify page, not redirecting');
    } else if (hasOrganization) {
      // Usuário tem organização - vai para o dashboard
      redirectPath = '/';
      shouldRedirect = false; // Não redirecionar se já está no dashboard
      console.log('useUserOrganization: User has organization, staying on dashboard');
    } else if (hasPendingInvites) {
      // Usuário tem convites pendentes - vai para verificar convites
      redirectPath = '/verificar-convite';
      console.log('useUserOrganization: User has pending invites, redirecting to verify');
    } else {
      // Usuário não tem organização nem convites - vai para página de sem acesso
      redirectPath = '/verificar-convite';
      console.log('useUserOrganization: User has no org or invites, redirecting to verify');
    }

    console.log('useUserOrganization: Final decision:', {
      shouldRedirect,
      redirectPath
    });

    setStatus({
      hasOrganization,
      hasPendingInvites,
      shouldRedirect,
      redirectPath,
      loading: false
    });
  }, [user]);

  return status;
}

// Função para verificar convites pendentes
function checkPendingInvites(user: User): boolean {
  // Mock de verificação de convites
  // Em produção, isso seria uma chamada para a API
  
  // Simular alguns usuários com convites pendentes
  const usersWithPendingInvites = [
    'usuario.sem.org@hospital.gov.br',
    'novo.usuario@hospital.gov.br'
  ];

  return usersWithPendingInvites.includes(user.email);
}
