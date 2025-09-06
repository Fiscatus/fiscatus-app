import React, { useState, useEffect } from 'react';
import { useUser, mockUsers, type User, type Invite } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, UserPlus, Shield, Mail, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import GlobalLoading from '@/components/GlobalLoading';

// Mock de convites pendentes para o usuário atual
const mockPendingInvites: Invite[] = [
  {
    _id: '1',
    token: 'inv_abc123def456',
    role: '3',
    email: 'novo.usuario@hospital.gov.br',
    used: false,
    createdBy: '4',
    acceptedBy: undefined,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function VerificarConvite() {
  const { user, setUser } = useUser();
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular busca de convites pendentes para o usuário
    const timer = setTimeout(() => {
      const userInvites = mockPendingInvites.filter(invite => 
        invite.email === user?.email && !invite.used
      );
      
      setPendingInvites(userInvites);
      setLoading(false);
    }, 1000); // 1 segundo de loading

    return () => clearTimeout(timer);
  }, [user]);

  if (loading) {
    return <GlobalLoading message="Verificando convites pendentes..." />;
  }

  const handleAcceptInvite = (inviteId: string) => {
    // Simular aceitação do convite
    setPendingInvites(prev => prev.filter(inv => inv._id !== inviteId));
    toast({
      title: "Sucesso",
      description: "Convite aceito com sucesso! Redirecionando..."
    });
    
    // Em produção, aqui seria feita a chamada para a API
    // POST /invites/{token}/accept
    // Depois redirecionar para o dashboard
    
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando convites...</p>
        </div>
      </div>
    );
  }

  // Seletor de usuário para testes - sempre visível
  const userSelector = (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white border rounded-lg shadow-lg p-4 z-50">
      <h4 className="font-semibold mb-2 text-sm">🔧 TESTE - Trocar Usuário:</h4>
      <select 
        value={user?._id || ''} 
        onChange={(e) => {
          const selectedUser = mockUsers.find(u => u._id === e.target.value);
          setUser(selectedUser || null);
        }}
        className="text-xs border rounded px-2 py-1 bg-white text-black"
      >
        {mockUsers.map((u) => (
          <option key={u._id} value={u._id}>
            {u.nome} ({u.email}) - {u.orgs.length > 0 ? 'Com Org' : 'Sem Org'}
          </option>
        ))}
      </select>
    </div>
  );

  // Se não tem convites pendentes
  if (pendingInvites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Nenhum Convite Encontrado</CardTitle>
            <CardDescription className="text-lg">
              Você não possui convites pendentes para nenhuma organização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Para acessar o sistema, você precisa ser convidado por um administrador de uma organização.
              </AlertDescription>
            </Alert>

            <div className="bg-muted/50 p-6 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg">Como obter acesso:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Entre em contato com um administrador</p>
                    <p className="text-sm text-muted-foreground">
                      Procure um gerente ou administrador da organização onde você deseja trabalhar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Solicite um convite</p>
                    <p className="text-sm text-muted-foreground">
                      Peça para que seja criado um convite com seu email
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Aguarde o convite</p>
                    <p className="text-sm text-muted-foreground">
                      Você receberá um link por email para aceitar o convite
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto"
              >
                Verificar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
        {userSelector}
      </div>
    );
  }

  // Se tem convites pendentes
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <UserPlus className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Convites Pendentes</CardTitle>
          <CardDescription className="text-lg">
            Você possui convites para organizações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {pendingInvites.map((invite) => (
            <div key={invite._id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium">Convite para Organização</span>
                </div>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  Expira em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Token do Convite</p>
                  <p className="font-mono text-sm bg-muted p-2 rounded">
                    {invite.token}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{invite.email}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={() => handleAcceptInvite(invite._id)}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aceitar Convite
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Recusar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      {userSelector}
    </div>
  );
}
