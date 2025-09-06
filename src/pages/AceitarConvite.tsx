import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, UserPlus, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { mockRoles, type Role, type Invite, useUser } from '@/contexts/UserContext';
import GlobalLoading from '@/components/GlobalLoading';

// Mock de convites (em produção viria da API)
const mockInvites: Invite[] = [
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
  },
  {
    _id: '2',
    token: 'inv_xyz789uvw012',
    role: '4',
    email: undefined,
    used: true,
    createdBy: '1',
    acceptedBy: '5',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function AceitarConvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { acceptInvite } = useUser();
  const [invite, setInvite] = useState<Invite | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cargo: '',
    gerencia: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (token) {
      // Simular busca do convite na API
      const timer = setTimeout(() => {
        const foundInvite = mockInvites.find(inv => inv.token === token);
        if (foundInvite) {
          setInvite(foundInvite);
          const foundRole = mockRoles.find(r => r._id === foundInvite.role);
          setRole(foundRole || null);
        }
        setLoading(false);
      }, 1200); // 1.2 segundos de loading

      return () => clearTimeout(timer);
    }
  }, [token]);

  const handleAcceptInvite = async () => {
    if (!invite || !role) return;

    // Validações
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Erro",
        description: "Email é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (invite.email && formData.email !== invite.email) {
      toast({
        title: "Erro",
        description: "Email deve corresponder ao convite",
        variant: "destructive"
      });
      return;
    }

    if (!formData.password.trim()) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "Senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "Senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setAccepting(true);

    try {
      if (!token) {
        throw new Error('Token não encontrado');
      }

      // Usar a função do contexto para aceitar o convite
      const success = await acceptInvite(token, {
        nome: formData.nome,
        email: formData.email,
        cargo: formData.cargo,
        gerencia: formData.gerencia,
        password: formData.password
      });

      if (success) {
        toast({
          title: "Sucesso",
          description: "Convite aceito com sucesso! Redirecionando para o sistema..."
        });

        // Redirecionar para o dashboard
        navigate('/');
      } else {
        throw new Error('Falha ao aceitar convite');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao aceitar convite. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return <GlobalLoading message="Carregando convite..." />;
  }

  if (!invite) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Convite não encontrado ou inválido.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (invite.used) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Este convite já foi utilizado.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isExpired = new Date(invite.expiresAt) < new Date();
  if (isExpired) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Este convite expirou em {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Aceitar Convite</CardTitle>
          <CardDescription>
            Complete seu cadastro para acessar a plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do Convite */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Role: </span>
              <Badge variant="outline">{role?.name}</Badge>
            </div>
            {invite.email && (
              <div>
                <span className="font-medium">Email: </span>
                <span className="text-muted-foreground">{invite.email}</span>
              </div>
            )}
            <div>
              <span className="font-medium">Expira em: </span>
              <span className="text-muted-foreground">
                {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  disabled={!!invite.email}
                />
                {invite.email && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Email pré-definido no convite
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Seu cargo"
                />
              </div>
              <div>
                <Label htmlFor="gerencia">Gerência</Label>
                <Input
                  id="gerencia"
                  value={formData.gerencia}
                  onChange={(e) => setFormData({ ...formData, gerencia: e.target.value })}
                  placeholder="Sua gerência"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Digite a senha novamente"
                />
              </div>
            </div>
          </div>

          {/* Permissões da Role */}
          {role && (
            <div className="space-y-2">
              <Label>Permissões que você terá:</Label>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <Badge key={permission} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAcceptInvite}
              disabled={accepting}
              className="flex-1"
            >
              {accepting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Aceitando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aceitar Convite
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
