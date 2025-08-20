import React, { useState } from "react";
import { 
  Settings, 
  Building2,
  Clock,
  Shield,
  FileText,
  Bell,
  Link,
  Lock,
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
  Smartphone,
  Monitor,
  Sun,
  Moon,
  Palette,
  Accessibility,
  Key,
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
    nomeCompleto: "João Silva Santos",
    cargo: "Fiscal de Contratos",
    email: "joao.silva@prefeitura.sp.gov.br",
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
    logotipo: null as File | null,
    representanteLegal: "Maria Oliveira",
    contatoRepresentante: "maria.oliveira@prefeitura.sp.gov.br"
  });

  // Estados para Notificações
  const [notificacoes, setNotificacoes] = useState({
    emailAtivo: true,
    sistemaAtivo: true,
    pushAtivo: false,
    emailAlternativo: "",
    frequenciaAlertas: "diario",
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
    modoExibicao: "claro", // claro, escuro, automatico
    fontePreferida: "Inter",
    tamanhoFonte: "medio", // pequeno, medio, grande
    mostrarIcones: true,
    moduloInicial: "dashboard"
  });

  // Estados para Acessibilidade
  const [acessibilidade, setAcessibilidade] = useState({
    altoContraste: false,
    leituraSimplificada: false,
    teclasAtalho: true,
    zoomInterface: 100,
    navegacaoTeclado: true
  });

  // Estados para Segurança
  const [seguranca, setSeguranca] = useState({
    autenticacao2FA: false,
    numeroCelular: "",
    tempoExpiracaoSessao: "480", // 30min
    dispositivosConectados: [
      { id: "1", nome: "Chrome - Windows", ip: "192.168.1.100", ultimoAcesso: "2024-01-15 14:30" },
      { id: "2", nome: "Safari - iPhone", ip: "192.168.1.101", ultimoAcesso: "2024-01-15 12:15" }
    ],
    historicoLogin: [
      { ip: "192.168.1.100", horario: "2024-01-15 14:30", navegador: "Chrome - Windows" },
      { ip: "192.168.1.101", horario: "2024-01-15 12:15", navegador: "Safari - iPhone" },
      { ip: "192.168.1.100", horario: "2024-01-14 09:45", navegador: "Chrome - Windows" }
    ]
  });

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

  const handleRevogarDispositivo = async (dispositivoId: string) => {
    setSalvando(prev => ({ ...prev, revogarDispositivo: true }));
    
    // Simular revogação
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSalvando(prev => ({ ...prev, revogarDispositivo: false }));
    
    setSeguranca(prev => ({
      ...prev,
      dispositivosConectados: prev.dispositivosConectados.filter(d => d.id !== dispositivoId)
    }));
    
    toast({
      title: "Dispositivo revogado!",
      description: "O acesso do dispositivo foi revogado com sucesso.",
      variant: "default",
    });
  };

  const handleRedefinirSenha = async () => {
    setSalvando(prev => ({ ...prev, redefinirSenha: true }));
    
    // Simular redefinição
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSalvando(prev => ({ ...prev, redefinirSenha: false }));
    
    toast({
      title: "Senha redefinida!",
      description: "Uma nova senha foi enviada para seu e-mail.",
      variant: "default",
    });
  };

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
                    onChange={(e) => setPerfilUsuario(prev => ({ ...prev, nomeCompleto: e.target.value }))}
                    placeholder="Digite seu nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo / Função</Label>
                  <Input
                    id="cargo"
                    value={perfilUsuario.cargo}
                    onChange={(e) => setPerfilUsuario(prev => ({ ...prev, cargo: e.target.value }))}
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
                    onChange={(e) => setPerfilAdministracao(prev => ({ ...prev, cnpj: e.target.value }))}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="representanteLegal">Nome do representante legal</Label>
                  <Input
                    id="representanteLegal"
                    value={perfilAdministracao.representanteLegal}
                    onChange={(e) => setPerfilAdministracao(prev => ({ ...prev, representanteLegal: e.target.value }))}
                    placeholder="Nome completo do representante"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contatoRepresentante">Contato do representante</Label>
                  <Input
                    id="contatoRepresentante"
                    type="email"
                    value={perfilAdministracao.contatoRepresentante}
                    onChange={(e) => setPerfilAdministracao(prev => ({ ...prev, contatoRepresentante: e.target.value }))}
                    placeholder="email@entidade.gov.br"
                  />
                </div>
              </div>
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
              {/* Ativar notificações por */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Ativar notificações por:</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="emailAtivo"
                      checked={notificacoes.emailAtivo}
                      onCheckedChange={(checked) => setNotificacoes(prev => ({ ...prev, emailAtivo: checked }))}
                    />
                    <Label htmlFor="emailAtivo" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      E-mail
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="sistemaAtivo"
                      checked={notificacoes.sistemaAtivo}
                      onCheckedChange={(checked) => setNotificacoes(prev => ({ ...prev, sistemaAtivo: checked }))}
                    />
                    <Label htmlFor="sistemaAtivo" className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Sistema (notificação interna)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="pushAtivo"
                      checked={notificacoes.pushAtivo}
                      onCheckedChange={(checked) => setNotificacoes(prev => ({ ...prev, pushAtivo: checked }))}
                    />
                    <Label htmlFor="pushAtivo" className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Push (se aplicável)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailAlternativo">Endereço de e-mail alternativo para cópia de notificações</Label>
                <Input
                  id="emailAlternativo"
                  type="email"
                  value={notificacoes.emailAlternativo}
                  onChange={(e) => setNotificacoes(prev => ({ ...prev, emailAlternativo: e.target.value }))}
                  placeholder="email.alternativo@exemplo.com"
                />
                <p className="text-sm text-gray-500">Opcional. Receberá cópia de todas as notificações.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequenciaAlertas">Frequência dos alertas automáticos</Label>
                <Select 
                  value={notificacoes.frequenciaAlertas} 
                  onValueChange={(value) => setNotificacoes(prev => ({ ...prev, frequenciaAlertas: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imediato">Imediato</SelectItem>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="modoAutomatico"
                      name="modoExibicao"
                      value="automatico"
                      checked={aparencia.modoExibicao === "automatico"}
                      onChange={(e) => setAparencia(prev => ({ ...prev, modoExibicao: e.target.value }))}
                      className="w-4 h-4 text-blue-600"
                    />
                    <Label htmlFor="modoAutomatico" className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Automático (com base no sistema operacional)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fontePreferida">Fonte preferida</Label>
                  <Select 
                    value={aparencia.fontePreferida} 
                    onValueChange={(value) => setAparencia(prev => ({ ...prev, fontePreferida: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tamanhoFonte">Tamanho da fonte</Label>
                  <Select 
                    value={aparencia.tamanhoFonte} 
                    onValueChange={(value) => setAparencia(prev => ({ ...prev, tamanhoFonte: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pequeno">Pequeno</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="grande">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="mostrarIcones"
                    checked={aparencia.mostrarIcones}
                    onCheckedChange={(checked) => setAparencia(prev => ({ ...prev, mostrarIcones: checked }))}
                  />
                  <Label htmlFor="mostrarIcones">Mostrar ícones ao lado dos textos</Label>
                </div>
                <p className="text-sm text-gray-500">Exibe ícones visuais junto com os textos da interface.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="moduloInicial">Exibir módulo inicial padrão ao logar</Label>
                <Select 
                  value={aparencia.moduloInicial} 
                  onValueChange={(value) => setAparencia(prev => ({ ...prev, moduloInicial: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="processos">Meus Processos</SelectItem>
                    <SelectItem value="assinaturas">Minhas Assinaturas</SelectItem>
                    <SelectItem value="dfd">DFD</SelectItem>
                    <SelectItem value="planejamento">Planejamento de Contratação</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">Módulo que será exibido automaticamente após o login.</p>
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

      case "seguranca":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Segurança</h2>
              <p className="text-gray-600">Configure suas configurações pessoais de segurança e acesso</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="autenticacao2FA"
                    checked={seguranca.autenticacao2FA}
                    onCheckedChange={(checked) => setSeguranca(prev => ({ ...prev, autenticacao2FA: checked }))}
                  />
                  <Label htmlFor="autenticacao2FA" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Autenticação em dois fatores (2FA)
                  </Label>
                </div>
                <p className="text-sm text-gray-500">Adiciona uma camada extra de segurança à sua conta.</p>
              </div>

              {seguranca.autenticacao2FA && (
                <div className="space-y-2">
                  <Label htmlFor="numeroCelular">Número de celular ou aplicativo autenticador</Label>
                  <Input
                    id="numeroCelular"
                    value={seguranca.numeroCelular}
                    onChange={(e) => setSeguranca(prev => ({ ...prev, numeroCelular: e.target.value }))}
                    placeholder="(11) 99999-9999 ou Google Authenticator / Authy"
                  />
                  <p className="text-sm text-gray-500">Para receber códigos SMS ou configurar aplicativo autenticador.</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tempoExpiracaoSessao">Tempo de expiração da sessão</Label>
                <Select 
                  value={seguranca.tempoExpiracaoSessao} 
                  onValueChange={(value) => setSeguranca(prev => ({ ...prev, tempoExpiracaoSessao: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="900">15 minutos</SelectItem>
                    <SelectItem value="1800">30 minutos</SelectItem>
                    <SelectItem value="3600">1 hora</SelectItem>
                    <SelectItem value="7200">2 horas</SelectItem>
                    <SelectItem value="0">Nunca</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dispositivos conectados */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Dispositivos conectados</h3>
                <div className="space-y-3">
                  {seguranca.dispositivosConectados.map((dispositivo) => (
                    <div key={dispositivo.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{dispositivo.nome}</p>
                          <p className="text-sm text-gray-500">IP: {dispositivo.ip} • Último acesso: {dispositivo.ultimoAcesso}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevogarDispositivo(dispositivo.id)}
                        disabled={salvando["revogarDispositivo"]}
                        className="text-red-600 hover:text-red-700"
                      >
                        {salvando["revogarDispositivo"] ? (
                          <>
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            Revogando...
                          </>
                        ) : (
                          "Revogar acesso"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Histórico de login */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Histórico de login (últimos 5 acessos)</h3>
                <div className="space-y-2">
                  {seguranca.historicoLogin.map((login, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <UserCheck className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{login.navegador}</p>
                          <p className="text-xs text-gray-500">IP: {login.ip} • {login.horario}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Button
                  onClick={() => handleSalvar("Segurança", seguranca)}
                  disabled={salvando["seguranca"]}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {salvando["seguranca"] ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Aplicar Segurança"
                  )}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={salvando["redefinirSenha"]}>
                      {salvando["redefinirSenha"] ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Redefinindo...
                        </>
                      ) : (
                        "Redefinir minha senha agora"
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar redefinição de senha</AlertDialogTitle>
                      <AlertDialogDescription>
                        Uma nova senha será enviada para seu e-mail institucional. 
                        Você será desconectado do sistema após a redefinição.
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRedefinirSenha}>
                        Confirmar Redefinição
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        );

      case "acessibilidade":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Acessibilidade</h2>
              <p className="text-gray-600">Configure opções para melhorar a acessibilidade do sistema</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="altoContraste"
                    checked={acessibilidade.altoContraste}
                    onCheckedChange={(checked) => setAcessibilidade(prev => ({ ...prev, altoContraste: checked }))}
                  />
                  <Label htmlFor="altoContraste" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Modo alto contraste
                  </Label>
                </div>
                <p className="text-sm text-gray-500">Aumenta o contraste entre cores para melhor visibilidade.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="leituraSimplificada"
                    checked={acessibilidade.leituraSimplificada}
                    onCheckedChange={(checked) => setAcessibilidade(prev => ({ ...prev, leituraSimplificada: checked }))}
                  />
                  <Label htmlFor="leituraSimplificada" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Modo leitura simplificada
                  </Label>
                </div>
                <p className="text-sm text-gray-500">Remove cores e elementos decorativos para focar no conteúdo.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="teclasAtalho"
                    checked={acessibilidade.teclasAtalho}
                    onCheckedChange={(checked) => setAcessibilidade(prev => ({ ...prev, teclasAtalho: checked }))}
                  />
                  <Label htmlFor="teclasAtalho" className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Teclas de atalho ativadas
                  </Label>
                </div>
                <p className="text-sm text-gray-500">Atalhos disponíveis: Ctrl+N (novo processo), Ctrl+S (salvar), Ctrl+F (buscar).</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zoomInterface">Zoom de interface padrão</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    id="zoomInterface"
                    min="90"
                    max="150"
                    step="10"
                    value={acessibilidade.zoomInterface}
                    onChange={(e) => setAcessibilidade(prev => ({ ...prev, zoomInterface: parseInt(e.target.value) }))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-gray-700 w-12">{acessibilidade.zoomInterface}%</span>
                </div>
                <p className="text-sm text-gray-500">Ajuste o tamanho da interface (90% a 150%).</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="navegacaoTeclado"
                    checked={acessibilidade.navegacaoTeclado}
                    onCheckedChange={(checked) => setAcessibilidade(prev => ({ ...prev, navegacaoTeclado: checked }))}
                  />
                  <Label htmlFor="navegacaoTeclado" className="flex items-center gap-2">
                    <Accessibility className="w-4 h-4" />
                    Navegação por teclado
                  </Label>
                </div>
                <p className="text-sm text-gray-500">Permite navegar por toda a interface usando apenas o teclado.</p>
              </div>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => handleSalvar("Acessibilidade", acessibilidade)}
                disabled={salvando["acessibilidade"]}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {salvando["acessibilidade"] ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Acessibilidade"
                )}
              </Button>
            </div>
          </div>
        );

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

              <button
                onClick={() => setSecaoAtiva("acessibilidade")}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  secaoAtiva === "acessibilidade"
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Accessibility className="w-4 h-4" />
                  <span>Acessibilidade</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="border-t border-gray-200 my-4"></div>

              <button
                onClick={() => setSecaoAtiva("seguranca")}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  secaoAtiva === "seguranca"
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4" />
                  <span>Segurança</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
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