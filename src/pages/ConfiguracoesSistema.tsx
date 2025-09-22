import React, { useState } from "react";
import { 
  Settings, 
  Building2,
  Clock,
  FileText,
  Bell,
  Link,
  Upload,
  Download,
  Trash2,
  Copy,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Save,
  Search,
  Menu,
  User,
  ChevronRight,
  ChevronDown,
  Camera,
  Edit,
  Image,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Palette,
  Smartphone as Phone,
  Mail,
  MapPin,
  UserCheck,
  AlertTriangle,
  LogOut
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import NotificationDropdown, { NotificationBell } from "@/components/NotificationDropdown";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ConfiguracoesSistema() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setUser } = useUser();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Função para obter as iniciais do usuário
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função de logout
  const handleLogout = () => {
    // Limpar token JWT (simulado)
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    // Limpar dados do usuário
    setUser(null);
    
    // Mostrar toast de sucesso
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema com sucesso.",
      variant: "default"
    });
    
    // Redirecionar para login
    navigate("/login");
  };

  // Estados para Perfil do Usuário
  const [perfilUsuario, setPerfilUsuario] = useState({
    nomeCompleto: "Lucas Moreira Brito",
    cargo: "Gerente de Recursos Humanos",
    email: "lucas.brito@hospital.gov.br",
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
    idioma: "pt-BR"
  });

  // Estados para Perfil da Administração Pública
  const [perfilAdministracao, setPerfilAdministracao] = useState({
    nomeEntidade: "Prefeitura Municipal de São Paulo",
    sigla: "PMSP",
    cnpj: "12.345.678/0001-90",
    esferaAdministrativa: "municipal",
    emailContato: "fiscatus@prefeitura.sp.gov.br",
    telefone: "(11) 1234-5678",
    endereco: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100",
    logotipo: null as File | null
  });

  // Estados para Notificações
  const [notificacoes, setNotificacoes] = useState({
    tiposNotificacao: {
      novosProcessos: true,
      pendenciasAssinatura: true,
      mudancasStatus: true,
      prazosVencendo: true,
      novosDocumentos: true
    }
  });

  // Estados para Aparência
  const [aparencia, setAparencia] = useState({
    modoExibicao: "claro" // claro, escuro, automatico
  });

  // (Seções Acessibilidade e Segurança removidas)

  // Estados para foto de perfil
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [fotoPerfilUrl, setFotoPerfilUrl] = useState<string | null>(null);

  // Estados de loading e seção ativa
  const [salvando, setSalvando] = useState<{[key: string]: boolean}>({});
  const [secaoAtiva, setSecaoAtiva] = useState("perfilUsuario");
  const [mostrarSenha, setMostrarSenha] = useState({
    atual: false,
    nova: false,
    confirmar: false
  });

  const permissoes: Permissao[] = [
    { id: "criarProcesso", nome: "Criar processo", descricao: "Permite criar novos processos de fiscalização" },
    { id: "editarContratos", nome: "Editar contratos", descricao: "Permite editar informações de contratos" },
    { id: "visualizarDocumentos", nome: "Visualizar documentos", descricao: "Permite visualizar documentos do sistema" },
    { id: "enviarNotificacoes", nome: "Enviar notificações", descricao: "Permite enviar notificações para fornecedores" },
    { id: "gerarRelatorios", nome: "Gerar relatórios", descricao: "Permite gerar relatórios do sistema" },
    { id: "assinarDigitalmente", nome: "Assinar digitalmente", descricao: "Permite assinar documentos digitalmente" }
  ];

  const handleSalvar = async (secao: string, dados: any) => {
    setSalvando(prev => ({ ...prev, [secao]: true }));
    
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSalvando(prev => ({ ...prev, [secao]: false }));
    
    toast({
      title: "Sucesso!",
      description: `Configurações de ${secao} salvas com sucesso.`,
      variant: "default",
    });
  };

  const handleUploadLogotipo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPerfilAdministracao(prev => ({ ...prev, logotipo: file }));
    }
  };

  const handleUploadFotoPerfil = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFotoPerfil(file);
      const url = URL.createObjectURL(file);
      setFotoPerfilUrl(url);
      
      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi alterada com sucesso.",
        variant: "default",
      });
    }
  };

  const handleRemoverFotoPerfil = () => {
    setFotoPerfil(null);
    setFotoPerfilUrl(null);
    
    toast({
      title: "Foto removida!",
      description: "Sua foto de perfil foi removida.",
      variant: "default",
    });
  };

  const handleAlterarSenha = async () => {
    if (perfilUsuario.novaSenha !== perfilUsuario.confirmarSenha) {
      toast({
        title: "Erro!",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setSalvando(prev => ({ ...prev, alterarSenha: true }));
    
    // Simular alteração de senha
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSalvando(prev => ({ ...prev, alterarSenha: false }));
    
    // Limpar campos de senha
    setPerfilUsuario(prev => ({
      ...prev,
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: ""
    }));
    
    toast({
      title: "Senha alterada!",
      description: "Sua senha foi alterada com sucesso.",
      variant: "default",
    });
  };

  // (Handlers de Segurança removidos)

  const renderizarConteudo = () => {
    switch (secaoAtiva) {
      case "perfilUsuario":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Perfil do Usuário</h2>
              <p className="text-gray-600">Edite suas informações pessoais e preferências individuais</p>
            </div>

            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto">Nome completo</Label>
                  <Input
                    id="nomeCompleto"
                    value={perfilUsuario.nomeCompleto}
                    onChange={() => {}}
                    readOnly
                    disabled
                    placeholder="Digite seu nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo / Função</Label>
                  <Input
                    id="cargo"
                    value={perfilUsuario.cargo}
                    onChange={() => {}}
                    readOnly
                    disabled
                    placeholder="Ex: Fiscal de Contratos"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail institucional</Label>
                <Input
                  id="email"
                  type="email"
                  value={perfilUsuario.email}
                  onChange={(e) => setPerfilUsuario(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="seu.email@prefeitura.gov.br"
                  disabled
                />
                <p className="text-sm text-gray-500">E-mail não editável pois é usado para login</p>
              </div>

              {/* Foto de Perfil */}
              <div className="space-y-4">
                <Label>Foto de perfil</Label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                      {fotoPerfilUrl ? (
                        <img 
                          src={fotoPerfilUrl} 
                          alt="Foto de perfil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <User className="w-10 h-10 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <label htmlFor="foto-perfil" className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                      <Camera className="w-4 h-4 text-white" />
                    </label>
                    <input
                      id="foto-perfil"
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFotoPerfil}
                      className="hidden"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('foto-perfil')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Alterar foto
                    </Button>
                    {fotoPerfilUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRemoverFotoPerfil}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover foto
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Idioma */}
              <div className="space-y-2">
                <Label htmlFor="idioma">Idioma preferido</Label>
                <Select 
                  value={perfilUsuario.idioma} 
                  onValueChange={(value) => setPerfilUsuario(prev => ({ ...prev, idioma: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português</SelectItem>
                    <SelectItem value="en-US">Inglês</SelectItem>
                    <SelectItem value="es-ES">Espanhol</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Alteração de Senha */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Alterar Senha</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="senhaAtual">Senha atual</Label>
                    <div className="relative">
                      <Input
                        id="senhaAtual"
                        type={mostrarSenha.atual ? "text" : "password"}
                        value={perfilUsuario.senhaAtual}
                        onChange={(e) => setPerfilUsuario(prev => ({ ...prev, senhaAtual: e.target.value }))}
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha(prev => ({ ...prev, atual: !prev.atual }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {mostrarSenha.atual ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="novaSenha">Nova senha</Label>
                      <div className="relative">
                        <Input
                          id="novaSenha"
                          type={mostrarSenha.nova ? "text" : "password"}
                          value={perfilUsuario.novaSenha}
                          onChange={(e) => setPerfilUsuario(prev => ({ ...prev, novaSenha: e.target.value }))}
                          placeholder="Digite a nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(prev => ({ ...prev, nova: !prev.nova }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {mostrarSenha.nova ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha">Confirmar nova senha</Label>
                      <div className="relative">
                        <Input
                          id="confirmarSenha"
                          type={mostrarSenha.confirmar ? "text" : "password"}
                          value={perfilUsuario.confirmarSenha}
                          onChange={(e) => setPerfilUsuario(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                          placeholder="Confirme a nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(prev => ({ ...prev, confirmar: !prev.confirmar }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {mostrarSenha.confirmar ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button
                onClick={() => handleSalvar("Perfil do Usuário", perfilUsuario)}
                disabled={salvando["perfilUsuario"]}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {salvando["perfilUsuario"] ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Atualizar Perfil"
                )}
              </Button>

              <Button
                onClick={handleAlterarSenha}
                disabled={salvando["alterarSenha"] || !perfilUsuario.senhaAtual || !perfilUsuario.novaSenha || !perfilUsuario.confirmarSenha}
                variant="outline"
              >
                {salvando["alterarSenha"] ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                    Alterando...
                  </>
                ) : (
                  "Alterar Senha"
                )}
              </Button>
            </div>
          </div>
        );

      case "perfilAdministracao":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Perfil da Administração Pública</h2>
              <p className="text-gray-600">Define dados institucionais da entidade que utiliza o sistema</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nomeEntidade">Nome da entidade pública</Label>
                  <Input
                    id="nomeEntidade"
                    value={perfilAdministracao.nomeEntidade}
                    onChange={(e) => setPerfilAdministracao(prev => ({ ...prev, nomeEntidade: e.target.value }))}
                    placeholder="Digite o nome da entidade"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sigla">Sigla</Label>
                  <Input
                    id="sigla"
                    value={perfilAdministracao.sigla}
                    onChange={(e) => setPerfilAdministracao(prev => ({ ...prev, sigla: e.target.value }))}
                    placeholder="Ex: PMSP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={perfilAdministracao.cnpj}
                    onChange={() => {}}
                    readOnly
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="esferaAdministrativa">Esfera administrativa</Label>
                  <Select 
                    value={perfilAdministracao.esferaAdministrativa} 
                    onValueChange={(value) => setPerfilAdministracao(prev => ({ ...prev, esferaAdministrativa: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="municipal">Municipal</SelectItem>
                      <SelectItem value="estadual">Estadual</SelectItem>
                      <SelectItem value="federal">Federal</SelectItem>
                      <SelectItem value="consorcio">Consórcio Público</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emailContato">E-mail de contato oficial</Label>
                  <Input
                    id="emailContato"
                    type="email"
                    value={perfilAdministracao.emailContato}
                    onChange={(e) => setPerfilAdministracao(prev => ({ ...prev, emailContato: e.target.value }))}
                    placeholder="contato@entidade.gov.br"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone institucional</Label>
                  <Input
                    id="telefone"
                    value={perfilAdministracao.telefone}
                    onChange={(e) => setPerfilAdministracao(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(00) 0000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço completo</Label>
                <Input
                  id="endereco"
                  value={perfilAdministracao.endereco}
                  onChange={(e) => setPerfilAdministracao(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Rua, número, bairro, cidade - UF, CEP"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logotipo">Logotipo da administração</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="logotipo"
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogotipo}
                    className="max-w-xs"
                  />
                  {perfilAdministracao.logotipo && (
                    <div className="flex items-center gap-2">
                      <img 
                        src={URL.createObjectURL(perfilAdministracao.logotipo)} 
                        alt="Preview" 
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span className="text-sm text-gray-600">{perfilAdministracao.logotipo.name}</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">Formatos aceitos: PNG, JPG, SVG. Tamanho máximo: 2MB.</p>
              </div>

              {/* Campos de representante removidos */}
            </div>

            <div className="pt-4">
              <Button
                onClick={() => handleSalvar("Perfil da Administração", perfilAdministracao)}
                disabled={salvando["perfilAdministracao"]}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {salvando["perfilAdministracao"] ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Informações da Administração"
                )}
              </Button>
            </div>
          </div>
        );

      case "notificacoes":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Notificações</h2>
              <p className="text-gray-600">Configure como deseja receber comunicações do sistema</p>
            </div>

            <div className="space-y-6">
              {/* Tipos de notificação */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Tipos de notificação a receber:</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="novosProcessos"
                      checked={notificacoes.tiposNotificacao.novosProcessos}
                      onCheckedChange={(checked) => 
                        setNotificacoes(prev => ({
                          ...prev,
                          tiposNotificacao: { ...prev.tiposNotificacao, novosProcessos: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="novosProcessos">Novos processos atribuídos</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pendenciasAssinatura"
                      checked={notificacoes.tiposNotificacao.pendenciasAssinatura}
                      onCheckedChange={(checked) => 
                        setNotificacoes(prev => ({
                          ...prev,
                          tiposNotificacao: { ...prev.tiposNotificacao, pendenciasAssinatura: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="pendenciasAssinatura">Pendências de assinatura</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="mudancasStatus"
                      checked={notificacoes.tiposNotificacao.mudancasStatus}
                      onCheckedChange={(checked) => 
                        setNotificacoes(prev => ({
                          ...prev,
                          tiposNotificacao: { ...prev.tiposNotificacao, mudancasStatus: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="mudancasStatus">Mudanças no status do processo</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="prazosVencendo"
                      checked={notificacoes.tiposNotificacao.prazosVencendo}
                      onCheckedChange={(checked) => 
                        setNotificacoes(prev => ({
                          ...prev,
                          tiposNotificacao: { ...prev.tiposNotificacao, prazosVencendo: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="prazosVencendo">Prazos vencendo ou vencidos</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="novosDocumentos"
                      checked={notificacoes.tiposNotificacao.novosDocumentos}
                      onCheckedChange={(checked) => 
                        setNotificacoes(prev => ({
                          ...prev,
                          tiposNotificacao: { ...prev.tiposNotificacao, novosDocumentos: checked as boolean }
                        }))
                      }
                    />
                    <Label htmlFor="novosDocumentos">Novos documentos anexados</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => handleSalvar("Notificações", notificacoes)}
                disabled={salvando["notificacoes"]}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {salvando["notificacoes"] ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Preferências de Notificação"
                )}
              </Button>
            </div>
          </div>
        );

      case "aparencia":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Aparência</h2>
              <p className="text-gray-600">Customize a interface de acordo com sua preferência visual</p>
            </div>

            <div className="space-y-6">
              {/* Modo de exibição */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Modo de exibição:</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="modoClaro"
                      name="modoExibicao"
                      value="claro"
                      checked={aparencia.modoExibicao === "claro"}
                      onChange={(e) => setAparencia(prev => ({ ...prev, modoExibicao: e.target.value }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="modoClaro" className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Claro
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="modoEscuro"
                      name="modoExibicao"
                      value="escuro"
                      checked={aparencia.modoExibicao === "escuro"}
                      onChange={(e) => setAparencia(prev => ({ ...prev, modoExibicao: e.target.value }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="modoEscuro" className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Escuro
                    </Label>
                  </div>
                  
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => handleSalvar("Aparência", aparencia)}
                disabled={salvando["aparencia"]}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {salvando["aparencia"] ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Aplicar Aparência"
                )}
              </Button>
            </div>
          </div>
        );

      case "templates":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Templates e Documentos</h2>
              <p className="text-gray-600">Gerencie os modelos de documentos do sistema</p>
            </div>

            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">{template.nome}</h4>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleUploadTemplate(template.id, e)}
                        className="max-w-xs"
                      />
                      {template.nomeArquivo && (
                        <>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoverTemplate(template.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {template.nomeArquivo && (
                    <div className="text-sm text-gray-600">
                      Arquivo: {template.nomeArquivo}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Este template será usado como base para novos documentos do tipo {template.nome.toLowerCase()}.
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button
                onClick={() => handleSalvar("Templates", templates)}
                disabled={salvando["templates"]}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {salvando["templates"] ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Templates"
                )}
              </Button>
            </div>
          </div>
        );

      // Seções "seguranca" e "acessibilidade" removidas

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <h1 className="text-xl font-semibold text-gray-900">Configurações</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <Input type="text" placeholder="Buscar processo..." className="w-32 md:w-40 lg:w-64 border-gray-200 focus:border-blue-300 focus:ring-blue-200" />
            <div className="relative">
              <NotificationBell onClick={() => setNotificationsOpen(!notificationsOpen)} />
              <NotificationDropdown 
                isOpen={notificationsOpen} 
                onClose={() => setNotificationsOpen(false)} 
              />
            </div>
            <button 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors" 
              aria-label="Configurações"
              onClick={() => navigate("/configuracoes")}
            >
              <Settings className="w-4 h-4 text-gray-600" />
            </button>
            
            {/* Menu do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Avatar className="w-8 h-8 border-0">
                    <AvatarImage src="/usuario.png" />
                    <AvatarFallback className="bg-gray-100 text-gray-700 font-medium text-sm">
                      {user ? getUserInitials(user.nome) : "GM"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                {/* Informações do usuário */}
                <div className="px-3 py-2">
                  <div className="font-semibold text-gray-900 text-sm">
                    {user?.nome || "Usuário"}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {user?.email || "usuario@exemplo.com"}
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Opção de logout */}
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 focus:text-red-700 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair do sistema</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>



      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-1">
            <div className="space-y-1">
              <button
                onClick={() => setSecaoAtiva("perfilUsuario")}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  secaoAtiva === "perfilUsuario"
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4" />
                  <span>Perfil do Usuário</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSecaoAtiva("perfilAdministracao")}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  secaoAtiva === "perfilAdministracao"
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4" />
                  <span>Perfil da Administração</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSecaoAtiva("notificacoes")}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  secaoAtiva === "notificacoes"
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4" />
                  <span>Notificações</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setSecaoAtiva("aparencia")}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  secaoAtiva === "aparencia"
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Palette className="w-4 h-4" />
                  <span>Aparência</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Seções Acessibilidade e Segurança removidas do menu */}
            </div>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl">
            {renderizarConteudo()}
          </div>
        </div>
      </div>
    </div>
  );
} 