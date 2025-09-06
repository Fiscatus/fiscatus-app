import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, mockUsers, mockRoles, type User, type Role, type Invite } from '@/contexts/UserContext';
import { useGerencias } from '@/hooks/useGerencias';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Shield, UserPlus, Settings, Eye, EyeOff, Edit, Trash2, Copy, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import GlobalLoading from '@/components/GlobalLoading';

// Mock de convites
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

export default function Administracao() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { gerencias } = useGerencias();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [invites, setInvites] = useState<Invite[]>(mockInvites);
  const [activeTab, setActiveTab] = useState('users');
  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento inicial
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <GlobalLoading message="Carregando painel de administração..." />;
  }

  // Estados para modais
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isCreateInviteOpen, setIsCreateInviteOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Estados para formulários
  const [newRole, setNewRole] = useState({ name: '', permissions: [] as string[] });
  const [editRoleData, setEditRoleData] = useState({ name: '', permissions: [] as string[] });
  const [newInvite, setNewInvite] = useState({ role: '', email: '' });
  const [editUserData, setEditUserData] = useState({
    nome: '',
    email: '',
    cargo: '',
    gerencia: '',
    role: '',
    isActive: true
  });

  // Verificar permissões
  const canManageUsers = user?.isPlatformAdmin || user?.orgs.some(org => org.isOrgAdmin);
  const canManageRoles = user?.isPlatformAdmin || user?.orgs.some(org => org.isOrgAdmin);
  const canCreateInvites = user?.isPlatformAdmin || user?.orgs.some(org => org.isOrgAdmin);

  if (!canManageUsers && !canManageRoles && !canCreateInvites) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar a página de administração.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Funções para gerenciar roles
  const handleCreateRole = () => {
    if (!newRole.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da role é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const role: Role = {
      _id: Date.now().toString(),
      name: newRole.name,
      permissions: newRole.permissions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRoles([...roles, role]);
    setNewRole({ name: '', permissions: [] });
    setIsCreateRoleOpen(false);
    toast({
      title: "Sucesso",
      description: "Role criada com sucesso"
    });
  };

  const handleDeleteRole = (roleId: string) => {
    if (roles.length <= 1) {
      toast({
        title: "Erro",
        description: "Não é possível excluir a última role",
        variant: "destructive"
      });
      return;
    }

    setRoles(roles.filter(role => role._id !== roleId));
    toast({
      title: "Sucesso",
      description: "Role excluída com sucesso"
    });
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setEditRoleData({
      name: role.name,
      permissions: [...role.permissions]
    });
    setIsEditRoleOpen(true);
  };

  const handleSaveRole = () => {
    if (!selectedRole) return;

    // Validações
    if (!editRoleData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da role é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (editRoleData.permissions.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos uma permissão",
        variant: "destructive"
      });
      return;
    }

    // Atualizar role
    setRoles(roles.map(role => 
      role._id === selectedRole._id 
        ? {
            ...role,
            name: editRoleData.name,
            permissions: editRoleData.permissions,
            updatedAt: new Date().toISOString()
          }
        : role
    ));

    setIsEditRoleOpen(false);
    setSelectedRole(null);
    toast({
      title: "Sucesso",
      description: "Role atualizada com sucesso"
    });
  };

  // Funções para gerenciar convites
  const handleCreateInvite = () => {
    if (!newInvite.role) {
      toast({
        title: "Erro",
        description: "Selecione uma role para o convite",
        variant: "destructive"
      });
      return;
    }

    const invite: Invite = {
      _id: Date.now().toString(),
      token: `inv_${Math.random().toString(36).substr(2, 12)}`,
      role: newInvite.role,
      email: newInvite.email || undefined,
      used: false,
      createdBy: user?._id || '',
      acceptedBy: undefined,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    setInvites([...invites, invite]);
    setNewInvite({ role: '', email: '' });
    setIsCreateInviteOpen(false);
    toast({
      title: "Sucesso",
      description: "Convite criado com sucesso"
    });
  };

  const handleCopyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Sucesso",
      description: "Link do convite copiado para a área de transferência"
    });
  };

  const handleDeleteInvite = (inviteId: string) => {
    const invite = invites.find(inv => inv._id === inviteId);
    if (!invite) return;

    // Verificar se o convite já foi usado/aceito
    if (invite.used) {
      toast({
        title: "Erro",
        description: "Não é possível excluir um convite que já foi aceito",
        variant: "destructive"
      });
      return;
    }

    // Confirmar exclusão
    if (window.confirm(`Tem certeza que deseja excluir o convite ${invite.token}?`)) {
      setInvites(invites.filter(inv => inv._id !== inviteId));
      toast({
        title: "Sucesso",
        description: "Convite excluído com sucesso"
      });
    }
  };

  // Funções para gerenciar usuários
  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u._id === userId ? { ...u, isActive: !u.isActive } : u
    ));
    toast({
      title: "Sucesso",
      description: "Status do usuário atualizado"
    });
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUserData({
      nome: user.nome || '',
      email: user.email,
      cargo: user.cargo || '',
      gerencia: user.gerencia || '',
      role: user.orgs[0]?.role || '',
      isActive: user.isActive
    });
    setIsEditUserOpen(true);
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;

    // Validações
    if (!editUserData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!editUserData.email.trim()) {
      toast({
        title: "Erro",
        description: "Email é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!editUserData.gerencia) {
      toast({
        title: "Erro",
        description: "Gerência é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (!editUserData.role) {
      toast({
        title: "Erro",
        description: "Role é obrigatória",
        variant: "destructive"
      });
      return;
    }

    // Atualizar usuário
    setUsers(users.map(u => 
      u._id === selectedUser._id 
        ? {
            ...u,
            nome: editUserData.nome,
            email: editUserData.email,
            cargo: editUserData.cargo,
            gerencia: editUserData.gerencia,
            isActive: editUserData.isActive,
            orgs: [{
              ...u.orgs[0],
              role: editUserData.role
            }]
          }
        : u
    ));

    setIsEditUserOpen(false);
    setSelectedUser(null);
    toast({
      title: "Sucesso",
      description: "Usuário atualizado com sucesso"
    });
  };

  // Lista de permissões disponíveis
  const availablePermissions = [
    'platform.admin',
    'org.admin',
    'users.manage',
    'roles.manage',
    'invites.manage',
    'invites.create',
    'organizations.manage',
    'processes.manage',
    'processes.create',
    'processes.edit',
    'processes.view',
    'reports.view'
  ];

  const getRoleName = (roleId: string) => {
    return roles.find(role => role._id === roleId)?.name || 'Role não encontrada';
  };

  const getUserName = (userId: string) => {
    return users.find(user => user._id === userId)?.nome || 'Usuário não encontrado';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Administração</h1>
              <p className="text-muted-foreground">
                Gerencie usuários, roles e convites da organização
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user?.isPlatformAdmin ? "default" : "secondary"}>
              {user?.isPlatformAdmin ? "Admin da Plataforma" : "Admin da Organização"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="invites" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Convites
          </TabsTrigger>
        </TabsList>

        {/* Aba de Usuários */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários da Organização</CardTitle>
              <CardDescription>
                Gerencie os usuários e suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Gerência</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">
                        {user.nome || 'Nome não informado'}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.gerencia || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getRoleName(user.orgs[0]?.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user._id)}
                          >
                            {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Roles */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Roles e Permissões</CardTitle>
                <CardDescription>
                  Gerencie as roles e suas permissões
                </CardDescription>
              </div>
              <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Settings className="h-4 w-4 mr-2" />
                    Nova Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Role</DialogTitle>
                    <DialogDescription>
                      Crie uma nova role com permissões específicas
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="roleName">Nome da Role</Label>
                      <Input
                        id="roleName"
                        value={newRole.name}
                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                        placeholder="Ex: Gerente de Projetos"
                      />
                    </div>
                    <div>
                      <Label>Permissões</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {availablePermissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={permission}
                              checked={newRole.permissions.includes(permission)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewRole({
                                    ...newRole,
                                    permissions: [...newRole.permissions, permission]
                                  });
                                } else {
                                  setNewRole({
                                    ...newRole,
                                    permissions: newRole.permissions.filter(p => p !== permission)
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={permission} className="text-sm">
                              {permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateRole}>
                      Criar Role
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <Card key={role._id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <CardDescription>
                          {role.permissions.length} permissões
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                          title="Editar role"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRole(role._id)}
                          disabled={roles.length <= 1}
                          title={roles.length <= 1 ? "Não é possível excluir a última role" : "Excluir role"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map((permission) => (
                          <Badge key={permission} variant="secondary">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Convites */}
        <TabsContent value="invites" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Convites</CardTitle>
                <CardDescription>
                  Gerencie os convites para novos usuários
                </CardDescription>
              </div>
              <Dialog open={isCreateInviteOpen} onOpenChange={setIsCreateInviteOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Convite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Convite</DialogTitle>
                    <DialogDescription>
                      Crie um convite por link para um novo usuário
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="inviteRole">Role</Label>
                      <Select value={newInvite.role} onValueChange={(value) => setNewInvite({ ...newInvite, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role._id} value={role._id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="inviteEmail">Email (Opcional)</Label>
                      <Input
                        id="inviteEmail"
                        type="email"
                        value={newInvite.email}
                        onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                        placeholder="usuario@exemplo.com"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Se não informado, o convite será público
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateInviteOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateInvite}>
                      Criar Convite
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Criado por</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite._id}>
                      <TableCell className="font-mono text-sm">
                        {invite.token}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getRoleName(invite.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invite.email || (
                          <Badge variant="secondary">Público</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invite.used ? "default" : "secondary"}>
                          {invite.used ? (
                            <><CheckCircle className="h-3 w-3 mr-1" />Aceito</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" />Pendente</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {getUserName(invite.createdBy)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {users.find(u => u._id === invite.createdBy)?.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {users.find(u => u._id === invite.createdBy)?.gerencia}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(invite.createdAt).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(invite.expiresAt).toLocaleTimeString('pt-BR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!invite.used && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyInviteLink(invite.token)}
                              title="Copiar link do convite"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInvite(invite._id)}
                            disabled={invite.used}
                            title={invite.used ? "Não é possível excluir convite aceito" : "Excluir convite"}
                            className={invite.used ? "opacity-50" : "hover:bg-red-50 hover:border-red-200 hover:text-red-600"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição de Role */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Role</DialogTitle>
            <DialogDescription>
              Edite as informações e permissões da role
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editRoleName">Nome da Role</Label>
                <Input
                  id="editRoleName"
                  value={editRoleData.name}
                  onChange={(e) => setEditRoleData({ ...editRoleData, name: e.target.value })}
                  placeholder="Ex: Gerente de Projetos"
                />
              </div>
              <div>
                <Label>Permissões</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${permission}`}
                        checked={editRoleData.permissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditRoleData({
                              ...editRoleData,
                              permissions: [...editRoleData.permissions, permission]
                            });
                          } else {
                            setEditRoleData({
                              ...editRoleData,
                              permissions: editRoleData.permissions.filter(p => p !== permission)
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`edit-${permission}`} className="text-sm">
                        {permission}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveRole}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Usuário */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Edite as informações do usuário
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editNome">Nome Completo *</Label>
                  <Input
                    id="editNome"
                    value={editUserData.nome}
                    onChange={(e) => setEditUserData({ ...editUserData, nome: e.target.value })}
                    placeholder="Nome completo do usuário"
                  />
                </div>
                <div>
                  <Label htmlFor="editEmail">Email *</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editCargo">Cargo</Label>
                  <Input
                    id="editCargo"
                    value={editUserData.cargo}
                    onChange={(e) => setEditUserData({ ...editUserData, cargo: e.target.value })}
                    placeholder="Cargo do usuário"
                  />
                </div>
                <div>
                  <Label htmlFor="editGerencia">Gerência *</Label>
                  <Select value={editUserData.gerencia} onValueChange={(value) => setEditUserData({ ...editUserData, gerencia: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma gerência" />
                    </SelectTrigger>
                    <SelectContent>
                      {gerencias.map((gerencia) => (
                        <SelectItem key={gerencia.id} value={gerencia.nomeCompleto}>
                          {gerencia.nomeCompleto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editRole">Role *</Label>
                  <Select value={editUserData.role} onValueChange={(value) => setEditUserData({ ...editUserData, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role._id} value={role._id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      id="editIsActive"
                      checked={editUserData.isActive}
                      onCheckedChange={(checked) => setEditUserData({ ...editUserData, isActive: !!checked })}
                    />
                    <Label htmlFor="editIsActive" className="text-sm">
                      Usuário ativo
                    </Label>
                  </div>
                </div>
              </div>

              {/* Informações da Role Selecionada */}
              {editUserData.role && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <Label className="text-sm font-medium">Permissões da Role:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {roles.find(r => r._id === editUserData.role)?.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveUser}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
