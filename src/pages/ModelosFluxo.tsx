import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GerenciaSelect } from "@/components/GerenciaSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Workflow, 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  Star, 
  StarOff,
  ArrowUp, 
  ArrowDown, 
  Save, 
  Eye,
  X,
  GripVertical,
  Clock,
  User,
  Building2,
  FileText,
  MessageSquare,
  PenTool,
  CheckCircle2,
  RotateCcw,
  Settings,
  Calendar,
  Hash,
  Palette,
  Shield,
  Search,
  Scale,
  DollarSign,
  Upload,
  Users,
  MoreVertical,
  ChevronDown,
  Monitor,
  Square
} from "lucide-react";
import Topbar from "@/components/Topbar";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/components/ui/use-toast";

// Interfaces
interface EtapaModelo {
  id: string;
  numeroEtapa: number;
  nomeEtapa: string;
  descricao: string;
  prazoPadrao: number; // em dias úteis
  gerenciaResponsavel: string;
  uploadObrigatorio: boolean;
  comentarioPermitido: boolean;
  exigeAssinatura: boolean;
  etapaObrigatoria: boolean;
  etapaRepetivel: boolean;
  // Novos campos
  iconeEtapa: string; // Nome do ícone Lucide
  corEtapa: string; // Cor do card
  visivelParaTodos: boolean;
  conclusaoAutomatica: boolean; // Se pode ser concluída automaticamente
  etapaCondicional: boolean; // Se é condicional (não obrigatória)
}

interface ModeloFluxo {
  id: string;
  nome: string;
  descricao: string;
  instituicao: string;
  ehPadrao: boolean;
  ehModeloSistema?: boolean; // Modelos do sistema não podem ser excluídos
  criadoEm: string;
  modificadoEm: string;
  criadoPor: string;
  etapas: EtapaModelo[];
}



// Ícones disponíveis para as etapas
const iconesDisponiveis = [
  { value: "FileText", label: "Documento", icon: FileText },
  { value: "Search", label: "Análise", icon: Search },
  { value: "CheckCircle2", label: "Aprovação", icon: CheckCircle2 },
  { value: "PenTool", label: "Assinatura", icon: PenTool },
  { value: "Shield", label: "Matriz de Risco", icon: Shield },
  { value: "DollarSign", label: "Financeiro", icon: DollarSign },
  { value: "Scale", label: "Jurídico", icon: Scale },
  { value: "Upload", label: "Publicação", icon: Upload },
  { value: "Users", label: "Equipe", icon: Users },
  { value: "Building2", label: "Administrativo", icon: Building2 }
];

// Cores disponíveis para as etapas
const coresDisponiveis = [
  { value: "blue", label: "Azul", color: "bg-blue-500" },
  { value: "green", label: "Verde", color: "bg-green-500" },
  { value: "purple", label: "Roxo", color: "bg-purple-500" },
  { value: "orange", label: "Laranja", color: "bg-orange-500" },
  { value: "red", label: "Vermelho", color: "bg-red-500" },
  { value: "yellow", label: "Amarelo", color: "bg-yellow-500" },
  { value: "indigo", label: "Índigo", color: "bg-indigo-500" },
  { value: "pink", label: "Rosa", color: "bg-pink-500" }
];

// Mock de modelos iniciais
const modelosIniciais: ModeloFluxo[] = [
  {
    id: "modelo-sistema-fiscatus",
            nome: "Modelo Fiscatus",
    descricao: "Modelo padrão utilizado para planejamento e tramitação completa de processos de contratação pública, com base na estrutura original do sistema Fiscatus.",
    instituicao: "Sistema",
    ehPadrao: true,
    ehModeloSistema: true,
    criadoEm: "2024-01-01",
    modificadoEm: "2024-01-01",
    criadoPor: "Sistema Fiscatus",
    etapas: [
      {
        id: "sist-e1",
        numeroEtapa: 1,
        nomeEtapa: "Elaboração do DFD",
        descricao: "Elaboração e análise do Documento de Formalização da Demanda",
        prazoPadrao: 5,
        gerenciaResponsavel: "GSP - Gerência de Soluções e Projetos",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "FileText",
        corEtapa: "green",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "sist-e2",
        numeroEtapa: 2,
        nomeEtapa: "Aprovação do DFD",
        descricao: "Aprovação do Documento de Formalização da Demanda",
        prazoPadrao: 3,
        gerenciaResponsavel: "GSL - Gerência de Suprimentos e Logística",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: true,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "CheckCircle2",
        corEtapa: "blue",
        visivelParaTodos: true,
        conclusaoAutomatica: true,
        etapaCondicional: false
      },
      {
        id: "sist-e3",
        numeroEtapa: 3,
        nomeEtapa: "Assinatura do DFD",
        descricao: "Assinatura do Documento de Formalização da Demanda",
        prazoPadrao: 3,
        gerenciaResponsavel: "GRH - Gerência de Recursos Humanos",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: true,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "PenTool",
        corEtapa: "purple",
        visivelParaTodos: true,
        conclusaoAutomatica: true,
        etapaCondicional: false
      },
      {
        id: "sist-e4",
        numeroEtapa: 4,
        nomeEtapa: "Despacho do DFD",
        descricao: "Despacho do Documento de Formalização da Demanda",
        prazoPadrao: 2,
        gerenciaResponsavel: "GUE - Gerência de Urgência e Emergência",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "FileText",
        corEtapa: "blue",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "sist-e5",
        numeroEtapa: 5,
        nomeEtapa: "Elaboração do ETP",
        descricao: "Elaboração do Estudo Técnico Preliminar",
        prazoPadrao: 10,
        gerenciaResponsavel: "GLC - Gerência de Licitações e Contratos",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "FileText",
        corEtapa: "orange",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "sist-e6",
        numeroEtapa: 6,
        nomeEtapa: "Assinatura do ETP",
        descricao: "Assinatura do Estudo Técnico Preliminar",
        prazoPadrao: 2,
        gerenciaResponsavel: "GFC - Gerência Financeira e Contábil",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: true,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "PenTool",
        corEtapa: "purple",
        visivelParaTodos: true,
        conclusaoAutomatica: true,
        etapaCondicional: false
      },
      {
        id: "sist-e7",
        numeroEtapa: 7,
        nomeEtapa: "Despacho do ETP",
        descricao: "Despacho do Estudo Técnico Preliminar",
        prazoPadrao: 5,
        gerenciaResponsavel: "GSP - Gerência de Soluções e Projetos",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "FileText",
        corEtapa: "blue",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "sist-e8",
        numeroEtapa: 8,
        nomeEtapa: "Elaboração/Análise da Matriz de Risco",
        descricao: "Elaboração e análise da Matriz de Gerenciamento de Riscos",
        prazoPadrao: 7,
        gerenciaResponsavel: "GSL - Gerência de Suprimentos e Logística",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "Shield",
        corEtapa: "red",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "sist-e9",
        numeroEtapa: 9,
        nomeEtapa: "Aprovação da Matriz de Risco",
        descricao: "Aprovação da Matriz de Gerenciamento de Riscos",
        prazoPadrao: 2,
        gerenciaResponsavel: "GRH - Gerência de Recursos Humanos",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: true,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "CheckCircle2",
        corEtapa: "green",
        visivelParaTodos: true,
        conclusaoAutomatica: true,
        etapaCondicional: false
      },
      {
        id: "sist-e10",
        numeroEtapa: 10,
        nomeEtapa: "Assinatura da Matriz de Risco",
        descricao: "Assinatura da Matriz de Gerenciamento de Riscos",
        prazoPadrao: 15,
        gerenciaResponsavel: "GUE - Gerência de Urgência e Emergência",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: true,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "PenTool",
        corEtapa: "purple",
        visivelParaTodos: true,
        conclusaoAutomatica: true,
        etapaCondicional: false
      },
      {
        id: "sist-e11",
        numeroEtapa: 11,
        nomeEtapa: "Cotação",
        descricao: "Processo de cotação de preços no mercado",
        prazoPadrao: 2,
        gerenciaResponsavel: "GLC - Gerência de Licitações e Contratos",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "DollarSign",
        corEtapa: "yellow",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "sist-e12",
        numeroEtapa: 12,
        nomeEtapa: "Elaboração do Termo de Referência (TR)",
        descricao: "Elaboração do Termo de Referência detalhado",
        prazoPadrao: 10,
        gerenciaResponsavel: "GFC - Gerência Financeira e Contábil",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "FileText",
        corEtapa: "indigo",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "sist-e13",
        numeroEtapa: 13,
        nomeEtapa: "Assinatura do TR",
        descricao: "Assinatura do Termo de Referência",
        prazoPadrao: 5,
        gerenciaResponsavel: "GTEC - Gerência de Tecnologia da Informação",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: true,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "PenTool",
        corEtapa: "purple",
        visivelParaTodos: true,
        conclusaoAutomatica: true,
        etapaCondicional: false
      },
      {
        id: "sist-e14",
        numeroEtapa: 14,
        nomeEtapa: "Elaboração do Edital",
        descricao: "Elaboração do Edital de Licitação",
        prazoPadrao: 3,
        gerenciaResponsavel: "GAP - Gerência de Administração e Patrimônio",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "FileText",
        corEtapa: "blue",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "sist-e15",
        numeroEtapa: 15,
        nomeEtapa: "Análise Jurídica Prévia",
        descricao: "Análise jurídica prévia do processo licitatório",
        prazoPadrao: 20,
        gerenciaResponsavel: "NAJ - Assessoria Jurídica",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "Scale",
        corEtapa: "red",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "sist-e16",
        numeroEtapa: 16,
        nomeEtapa: "Cumprimento de Ressalvas pós Análise Jurídica Prévia",
        descricao: "Cumprimento das ressalvas apontadas na análise jurídica prévia",
        prazoPadrao: 10,
        gerenciaResponsavel: "GESP - Gerência de Especialidades",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "CheckCircle2",
        corEtapa: "orange",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "sist-e17",
        numeroEtapa: 17,
        nomeEtapa: "Elaboração do Parecer Jurídico",
        descricao: "Elaboração do Parecer Jurídico final",
        prazoPadrao: 1,
        gerenciaResponsavel: "NAJ - Assessoria Jurídica",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "Scale",
        corEtapa: "pink",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "sist-e18",
        numeroEtapa: 18,
        nomeEtapa: "Cumprimento de Ressalvas pós Parecer Jurídico",
        descricao: "Cumprimento das ressalvas apontadas no parecer jurídico",
        prazoPadrao: 1,
        gerenciaResponsavel: "GSP - Gerência de Soluções e Projetos",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "CheckCircle2",
        corEtapa: "green",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "sist-e19",
        numeroEtapa: 19,
        nomeEtapa: "Aprovação Jurídica",
        descricao: "Aprovação jurídica final do processo",
        prazoPadrao: 1,
        gerenciaResponsavel: "NAJ - Assessoria Jurídica",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: true,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "Scale",
        corEtapa: "green",
        visivelParaTodos: true,
        conclusaoAutomatica: true,
        etapaCondicional: false
      },
      {
        id: "sist-e20",
        numeroEtapa: 20,
        nomeEtapa: "Assinatura do Edital",
        descricao: "Assinatura final do Edital de Licitação",
        prazoPadrao: 1,
        gerenciaResponsavel: "GSL - Gerência de Suprimentos e Logística",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: true,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "PenTool",
        corEtapa: "purple",
        visivelParaTodos: true,
        conclusaoAutomatica: true,
        etapaCondicional: false
      },
      {
        id: "sist-e21",
        numeroEtapa: 21,
        nomeEtapa: "Publicação",
        descricao: "Publicação do Edital nos meios oficiais",
        prazoPadrao: 1,
        gerenciaResponsavel: "GRH - Gerência de Recursos Humanos",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "Upload",
        corEtapa: "blue",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      }
    ]
  },
  {
    id: "modelo-1",
    nome: "Modelo Padrão de Contratação",
    descricao: "Modelo padrão para processos de contratação de serviços e produtos",
    instituicao: "Comissão de Implantação",
    ehPadrao: false,
    criadoEm: "2024-01-15",
    modificadoEm: "2024-12-20",
    criadoPor: "Lara Rubia Vaz Diniz Fraguas",
    etapas: [
      {
        id: "e1",
        numeroEtapa: 1,
        nomeEtapa: "Elaboração do DFD",
        descricao: "Elaboração e análise do Documento de Formalização da Demanda",
        prazoPadrao: 5,
        gerenciaResponsavel: "GSP - Gerência de Soluções e Projetos",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "FileText",
        corEtapa: "green",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "e2",
        numeroEtapa: 2,
        nomeEtapa: "Aprovação do DFD",
        descricao: "Aprovação do Documento de Formalização da Demanda",
        prazoPadrao: 3,
        gerenciaResponsavel: "GSL - Gerência de Suprimentos e Logística",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: true,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "CheckCircle2",
        corEtapa: "blue",
        visivelParaTodos: true,
        conclusaoAutomatica: true,
        etapaCondicional: false
      },
      {
        id: "e3",
        numeroEtapa: 3,
        nomeEtapa: "Assinatura do DFD",
        descricao: "Assinatura do Documento de Formalização da Demanda",
        prazoPadrao: 3,
        gerenciaResponsavel: "GRH - Gerência de Recursos Humanos",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: true,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "PenTool",
        corEtapa: "purple",
        visivelParaTodos: true,
        conclusaoAutomatica: true,
        etapaCondicional: false
      }
    ]
  },
  {
    id: "modelo-2",
    nome: "Modelo Simplificado",
    descricao: "Modelo com menos etapas para contratações simples",
    instituicao: "Comissão de Implantação",
    ehPadrao: false,
    criadoEm: "2024-02-10",
    modificadoEm: "2024-12-18",
    criadoPor: "Lara Rubia Vaz Diniz Fraguas",
    etapas: [
      {
        id: "e1s",
        numeroEtapa: 1,
        nomeEtapa: "Elaboração do DFD",
        descricao: "Elaboração simplificada do DFD",
        prazoPadrao: 3,
        gerenciaResponsavel: "GSP - Gerência de Soluções e Projetos",
        uploadObrigatorio: true,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "FileText",
        corEtapa: "blue",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      },
      {
        id: "e2s",
        numeroEtapa: 2,
        nomeEtapa: "Aprovação Final",
        descricao: "Aprovação final do processo simplificado",
        prazoPadrao: 2,
        gerenciaResponsavel: "GSL - Gerência de Suprimentos e Logística",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: true,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "CheckCircle2",
        corEtapa: "green",
        visivelParaTodos: true,
        conclusaoAutomatica: true,
        etapaCondicional: false
      }
    ]
  }
];

export default function ModelosFluxo() {
  const navigate = useNavigate();
  const { user } = useUser();
  
  // Estados principais
  const [modelos, setModelos] = useState<ModeloFluxo[]>([]);
  const [modeloSelecionado, setModeloSelecionado] = useState<ModeloFluxo | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState(false);
  
  // Estados do formulário de modelo
  const [nomeModelo, setNomeModelo] = useState("");
  const [descricaoModelo, setDescricaoModelo] = useState("");
  
  // Estados para modal de nova etapa
  const [showNovaEtapaModal, setShowNovaEtapaModal] = useState(false);
  const [etapaEditando, setEtapaEditando] = useState<EtapaModelo | null>(null);
  
  // Estados para drag and drop
  const [draggedEtapa, setDraggedEtapa] = useState<string | null>(null);
  
  // Estados para busca e filtros
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "sistema" | "pessoais">("todos");
  const [ordenacao, setOrdenacao] = useState<"nome" | "data" | "etapas">("nome");
  
  // Verificar permissões
  const temPermissao = () => {
    if (!user) return false;
    const gerenciasAutorizadas = [
      'Comissão de Implantação',
      'CI',
      'SE - Secretaria Executiva', 
      'Secretaria Executiva',
      'OUV - Ouvidoria',
      'Ouvidoria'
    ];
    return gerenciasAutorizadas.some(g => user.gerencia.includes(g));
  };

  // Carregar modelos do localStorage ou usar modelos iniciais
  useEffect(() => {
    const modelosSalvos = localStorage.getItem('modelosFluxo');
    if (modelosSalvos) {
      const modelosCarregados = JSON.parse(modelosSalvos);
      setModelos(modelosCarregados);
      setModeloSelecionado(modelosCarregados[0] || null);
    } else {
      setModelos(modelosIniciais);
      setModeloSelecionado(modelosIniciais[0] || null);
    }
  }, []);

  // Salvar modelos no localStorage quando houver mudanças
  useEffect(() => {
    if (modelos.length > 0) {
      localStorage.setItem('modelosFluxo', JSON.stringify(modelos));
    }
  }, [modelos]);

  // Redirecionar se não tiver permissão
  useEffect(() => {
    if (!temPermissao()) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta funcionalidade.",
        variant: "destructive"
      });
      navigate("/planejamento-da-contratacao");
    }
  }, [user, navigate]);

  // Sincronizar nome e descrição quando modelo é selecionado
  useEffect(() => {
    if (modeloSelecionado && !modoEdicao) {
      setNomeModelo(modeloSelecionado.nome);
      setDescricaoModelo(modeloSelecionado.descricao);
    }
  }, [modeloSelecionado, modoEdicao]);

  // Funções de CRUD dos modelos
  const criarNovoModelo = () => {
    const novoModelo: ModeloFluxo = {
      id: `modelo-${Date.now()}`,
      nome: "Novo Modelo",
      descricao: "Descrição do novo modelo",
      instituicao: user?.gerencia || "Comissão de Implantação",
      ehPadrao: false,
      criadoEm: new Date().toISOString().split('T')[0],
      modificadoEm: new Date().toISOString().split('T')[0],
      criadoPor: user?.nome || "",
      etapas: []
    };
    
    setModelos([...modelos, novoModelo]);
    setModeloSelecionado(novoModelo);
    setModoEdicao(true);
    setNomeModelo(novoModelo.nome);
    setDescricaoModelo(novoModelo.descricao);
    
    toast({
      title: "Novo Modelo Criado",
      description: "Você pode começar a editar o modelo agora."
    });
  };

  const duplicarModelo = (modelo: ModeloFluxo) => {
    // Gerar ID único usando timestamp + random
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const novoId = `modelo-${timestamp}-${random}`;
    
    const modeloDuplicado: ModeloFluxo = {
      ...modelo,
      id: novoId,
      nome: `${modelo.nome} (Cópia)`,
      descricao: `${modelo.descricao} - Cópia personalizável do modelo original`,
      ehPadrao: false,
      ehModeloSistema: false, // Garantir que a cópia não seja do sistema
      criadoEm: new Date().toISOString().split('T')[0],
      modificadoEm: new Date().toISOString().split('T')[0],
      criadoPor: user?.nome || "Usuário",
      etapas: modelo.etapas.map(etapa => {
        const etapaTimestamp = Date.now() + Math.random();
        return {
          ...etapa,
          id: `e${etapaTimestamp}-${etapa.numeroEtapa}`
        };
      })
    };
    
    // Verificar se já existe um modelo com o mesmo nome
    const nomeBase = modeloDuplicado.nome;
    let contador = 1;
    let nomeFinal = nomeBase;
    
    while (modelos.some(m => m.nome === nomeFinal)) {
      nomeFinal = `${nomeBase} (${contador})`;
      contador++;
    }
    
    modeloDuplicado.nome = nomeFinal;
    
    // Atualizar o estado de forma mais robusta
    setModelos(prevModelos => {
      const novosModelos = [...prevModelos, modeloDuplicado];
      // Forçar re-render garantindo que o array é novo
      return [...novosModelos];
    });
    
    // Verificar se é o modelo Fiscatus para determinar o comportamento pós-duplicação
    const ehModeloFiscatus = modelo.id === "modelo-sistema-fiscatus";
    
    if (!ehModeloFiscatus) {
      // Para outros modelos, selecionar o modelo duplicado imediatamente
      setModeloSelecionado(modeloDuplicado);
      setModoEdicao(false);
      setModoVisualizacao(false);
      setNomeModelo(modeloDuplicado.nome);
      setDescricaoModelo(modeloDuplicado.descricao);
      
      toast({
        title: "Modelo Duplicado",
        description: `Modelo "${modeloDuplicado.nome}" foi criado com sucesso e está pronto para edição.`
      });
    } else {
      // Para o modelo Fiscatus, apenas adicionar à lista sem selecionar
      toast({
        title: "Modelo Fiscatus Duplicado",
        description: `Modelo "${modeloDuplicado.nome}" foi criado com sucesso. Você pode encontrá-lo na lista de modelos.`
      });
    }
  };

  const duplicarFiscatus = () => {
    const modeloFiscatus = modelos.find(m => m.id === "modelo-sistema-fiscatus");
    if (modeloFiscatus) {
      duplicarModelo(modeloFiscatus);
    } else {
      toast({
        title: "Erro",
        description: "Modelo Fiscatus não encontrado.",
        variant: "destructive"
      });
    }
  };

  const excluirModelo = (modeloId: string) => {
    const modelo = modelos.find(m => m.id === modeloId);
    
    // Impedir exclusão de modelos do sistema ou do modelo padrão fiscatus
    if (modelo?.ehModeloSistema || modelo?.id === "modelo-sistema-fiscatus") {
      toast({
        title: "Não é possível excluir",
        description: "Modelos do sistema não podem ser excluídos, apenas duplicados.",
        variant: "destructive"
      });
      return;
    }
    
    const modelosAtualizados = modelos.filter(m => m.id !== modeloId);
    setModelos(modelosAtualizados);
    
    if (modeloSelecionado?.id === modeloId) {
      setModeloSelecionado(modelosAtualizados[0] || null);
    }
    
    toast({
      title: "Modelo Excluído",
      description: "O modelo foi removido com sucesso."
    });
  };

  const definirComoPadrao = (modeloId: string) => {
    const modelo = modelos.find(m => m.id === modeloId);
    
    if (!modelo) {
      toast({
        title: "Erro",
        description: "Modelo não encontrado.",
        variant: "destructive"
      });
      return;
    }
    
    const modelosAtualizados = modelos.map(modelo => ({
      ...modelo,
      ehPadrao: modelo.id === modeloId
    }));
    
    setModelos(modelosAtualizados);
    
    if (modeloSelecionado) {
      setModeloSelecionado({
        ...modeloSelecionado,
        ehPadrao: modeloSelecionado.id === modeloId
      });
    }
    
    toast({
      title: "Modelo Padrão Definido",
      description: `O modelo "${modelo.nome}" será usado por padrão na criação de novos processos.`
    });
  };

  const salvarModelo = () => {
    if (!modeloSelecionado) return;
    
    const modeloAtualizado = {
      ...modeloSelecionado,
      nome: nomeModelo,
      descricao: descricaoModelo,
      modificadoEm: new Date().toISOString().split('T')[0]
    };
    
    const modelosAtualizados = modelos.map(m => 
      m.id === modeloSelecionado.id ? modeloAtualizado : m
    );
    
    setModelos(modelosAtualizados);
    setModeloSelecionado(modeloAtualizado);
    setModoEdicao(false);
    
    toast({
      title: "Modelo Salvo",
      description: "As alterações foram salvas com sucesso."
    });
  };

  // Funções para gerenciar etapas
  const adicionarEtapa = (novaEtapa: Omit<EtapaModelo, 'id' | 'numeroEtapa'>) => {
    if (!modeloSelecionado) return;
    
    const proximoNumero = Math.max(...modeloSelecionado.etapas.map(e => e.numeroEtapa), 0) + 1;
    
    const etapaCompleta: EtapaModelo = {
      ...novaEtapa,
      id: `e${Date.now()}`,
      numeroEtapa: proximoNumero,
      // Garantir que todos os campos novos estejam presentes
      iconeEtapa: novaEtapa.iconeEtapa || 'FileText',
      corEtapa: novaEtapa.corEtapa || 'blue',
      visivelParaTodos: novaEtapa.visivelParaTodos ?? true,
      conclusaoAutomatica: novaEtapa.conclusaoAutomatica ?? false,
      etapaCondicional: novaEtapa.etapaCondicional ?? false
    };
    
    const modeloAtualizado = {
      ...modeloSelecionado,
      etapas: [...modeloSelecionado.etapas, etapaCompleta]
    };
    
    setModeloSelecionado(modeloAtualizado);
    setShowNovaEtapaModal(false);
    
    toast({
      title: "Etapa Adicionada",
      description: "Nova etapa foi adicionada ao modelo."
    });
  };

  const editarEtapa = (etapaId: string, etapaAtualizada: EtapaModelo) => {
    if (!modeloSelecionado) return;
    
    const etapasAtualizadas = modeloSelecionado.etapas.map(e => 
      e.id === etapaId ? etapaAtualizada : e
    );
    
    const modeloAtualizado = {
      ...modeloSelecionado,
      etapas: etapasAtualizadas
    };
    
    setModeloSelecionado(modeloAtualizado);
    setEtapaEditando(null);
    
    toast({
      title: "Etapa Atualizada",
      description: "As alterações na etapa foram salvas."
    });
  };

  const excluirEtapa = (etapaId: string) => {
    if (!modeloSelecionado) return;
    
    const etapasAtualizadas = modeloSelecionado.etapas.filter(e => e.id !== etapaId);
    
    // Reordenar números das etapas
    const etapasReordenadas = etapasAtualizadas.map((etapa, index) => ({
      ...etapa,
      numeroEtapa: index + 1
    }));
    
    const modeloAtualizado = {
      ...modeloSelecionado,
      etapas: etapasReordenadas
    };
    
    setModeloSelecionado(modeloAtualizado);
    
    toast({
      title: "Etapa Removida",
      description: "A etapa foi removida do modelo."
    });
  };

  const moverEtapa = (etapaId: string, direcao: 'up' | 'down') => {
    if (!modeloSelecionado) return;
    
    const etapas = [...modeloSelecionado.etapas];
    const index = etapas.findIndex(e => e.id === etapaId);
    
    if (direcao === 'up' && index > 0) {
      [etapas[index], etapas[index - 1]] = [etapas[index - 1], etapas[index]];
    } else if (direcao === 'down' && index < etapas.length - 1) {
      [etapas[index], etapas[index + 1]] = [etapas[index + 1], etapas[index]];
    }
    
    // Atualizar números das etapas
    const etapasReordenadas = etapas.map((etapa, idx) => ({
      ...etapa,
      numeroEtapa: idx + 1
    }));
    
    const modeloAtualizado = {
      ...modeloSelecionado,
      etapas: etapasReordenadas
    };
    
    setModeloSelecionado(modeloAtualizado);
  };

  // Funções para drag and drop
  const handleDragStart = (e: React.DragEvent, etapaId: string) => {
    setDraggedEtapa(etapaId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetEtapaId: string) => {
    e.preventDefault();
    
    if (!draggedEtapa || !modeloSelecionado || draggedEtapa === targetEtapaId) {
      setDraggedEtapa(null);
      return;
    }

    const etapas = [...modeloSelecionado.etapas];
    const draggedIndex = etapas.findIndex(e => e.id === draggedEtapa);
    const targetIndex = etapas.findIndex(e => e.id === targetEtapaId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove etapa arrastada e insere na nova posição
      const [draggedItem] = etapas.splice(draggedIndex, 1);
      etapas.splice(targetIndex, 0, draggedItem);

      // Reordenar números das etapas
      const etapasReordenadas = etapas.map((etapa, idx) => ({
        ...etapa,
        numeroEtapa: idx + 1
      }));

      const modeloAtualizado = {
        ...modeloSelecionado,
        etapas: etapasReordenadas
      };

      setModeloSelecionado(modeloAtualizado);
    }

    setDraggedEtapa(null);
  };

  // Função para obter o ícone da etapa
  const getIconeEtapa = (iconeNome: string) => {
    const iconObj = iconesDisponiveis.find(i => i.value === iconeNome);
    if (iconObj) {
      const IconComponent = iconObj.icon;
      return <IconComponent className="w-5 h-5" />;
    }
    return <FileText className="w-5 h-5" />;
  };

  // Função para obter cor da etapa
  const getCorEtapa = (corNome: string) => {
    switch (corNome) {
      case 'blue': return 'bg-blue-100 border-blue-200 text-blue-800';
      case 'green': return 'bg-green-100 border-green-200 text-green-800';
      case 'purple': return 'bg-purple-100 border-purple-200 text-purple-800';
      case 'orange': return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'red': return 'bg-red-100 border-red-200 text-red-800';
      case 'yellow': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'indigo': return 'bg-indigo-100 border-indigo-200 text-indigo-800';
      case 'pink': return 'bg-pink-100 border-pink-200 text-pink-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  // Funções de filtro e busca
  const modelosFiltrados = useMemo(() => {
    let filtrados = modelos;

    // Aplicar filtro por tipo
    if (filtroTipo === "sistema") {
      filtrados = filtrados.filter(m => m.ehModeloSistema);
    } else if (filtroTipo === "pessoais") {
      filtrados = filtrados.filter(m => !m.ehModeloSistema);
    }

    // Aplicar busca
    if (busca.trim()) {
      const termoBusca = busca.toLowerCase();
      filtrados = filtrados.filter(m => 
        m.nome.toLowerCase().includes(termoBusca) ||
        m.descricao.toLowerCase().includes(termoBusca) ||
        m.criadoPor.toLowerCase().includes(termoBusca)
      );
    }

    // Aplicar ordenação
    filtrados.sort((a, b) => {
      switch (ordenacao) {
        case "nome":
          return a.nome.localeCompare(b.nome);
        case "data":
          return new Date(b.modificadoEm).getTime() - new Date(a.modificadoEm).getTime();
        case "etapas":
          return b.etapas.length - a.etapas.length;
        default:
          return 0;
      }
    });

    return filtrados;
  }, [modelos, busca, filtroTipo, ordenacao]);

  if (!temPermissao()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      
      <main className="pt-16 flex h-screen">
        {/* Sidebar - Lista de Modelos */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Header do sidebar */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Workflow className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Modelos de Fluxo</h1>
                <p className="text-sm text-gray-500">{user?.gerencia}</p>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="space-y-2">
              <Button onClick={criarNovoModelo} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Novo Modelo
              </Button>
              <Button 
                onClick={duplicarFiscatus} 
                variant="outline" 
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Duplicar Fiscatus
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Busca e filtros */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar modelos..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="sistema">Sistema</SelectItem>
                      <SelectItem value="pessoais">Pessoais</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={ordenacao} onValueChange={(value: any) => setOrdenacao(value)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nome">Nome</SelectItem>
                      <SelectItem value="data">Data</SelectItem>
                      <SelectItem value="etapas">Etapas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Lista de modelos */}
              <div className="space-y-3">
                {/* Modelos do Sistema */}
                {modelosFiltrados.some(m => m.ehModeloSistema) && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-medium text-gray-700">Modelos do Sistema</h3>
                      <Badge variant="secondary" className="text-xs">
                        {modelosFiltrados.filter(m => m.ehModeloSistema).length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {modelosFiltrados
                        .filter(modelo => modelo.ehModeloSistema)
                        .map((modelo) => (
                          <ModeloCard 
                            key={modelo.id}
                            modelo={modelo}
                            isSelected={modeloSelecionado?.id === modelo.id}
                            onSelect={() => setModeloSelecionado(modelo)}
                            onDuplicate={() => duplicarModelo(modelo)}
                            onSetDefault={() => definirComoPadrao(modelo.id)}
                            isSystem={true}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Modelos Pessoais */}
                {modelosFiltrados.some(m => !m.ehModeloSistema) && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-sm font-medium text-gray-700">Seus Modelos</h3>
                      <Badge variant="secondary" className="text-xs">
                        {modelosFiltrados.filter(m => !m.ehModeloSistema).length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {modelosFiltrados
                        .filter(modelo => !modelo.ehModeloSistema)
                        .map((modelo) => (
                          <ModeloCard 
                            key={modelo.id}
                            modelo={modelo}
                            isSelected={modeloSelecionado?.id === modelo.id}
                            onSelect={() => setModeloSelecionado(modelo)}
                            onEdit={() => {
                              setModeloSelecionado(modelo);
                              setModoEdicao(true);
                              setNomeModelo(modelo.nome);
                              setDescricaoModelo(modelo.descricao);
                            }}
                            onDuplicate={() => duplicarModelo(modelo)}
                            onSetDefault={() => definirComoPadrao(modelo.id)}
                            onDelete={() => excluirModelo(modelo.id)}
                            isSystem={false}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Estado vazio */}
                {modelosFiltrados.length === 0 && (
                  <div className="text-center py-8">
                    <Workflow className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      {busca.trim() ? 'Nenhum modelo encontrado' : 'Nenhum modelo disponível'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Área Principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {modeloSelecionado ? (
            <>
              {/* Header do Editor */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {modoEdicao ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="nomeModelo" className="text-sm font-medium text-gray-700">
                            Nome do Modelo
                          </Label>
                          <Input
                            id="nomeModelo"
                            value={nomeModelo}
                            onChange={(e) => setNomeModelo(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="descricaoModelo" className="text-sm font-medium text-gray-700">
                            Descrição
                          </Label>
                          <Textarea
                            id="descricaoModelo"
                            value={descricaoModelo}
                            onChange={(e) => setDescricaoModelo(e.target.value)}
                            rows={2}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-xl font-semibold text-gray-900">
                            {modeloSelecionado.nome}
                          </h2>
                          {modeloSelecionado.ehPadrao && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1 fill-current" />
                              Padrão
                            </Badge>
                          )}
                          {modeloSelecionado.ehModeloSistema && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Sistema
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">
                          {modeloSelecionado.descricao}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Hash className="w-4 h-4" />
                            {modeloSelecionado.etapas.length} etapas
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {modeloSelecionado.modificadoEm}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {modeloSelecionado.criadoPor}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {modoEdicao ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setModoEdicao(false);
                            setNomeModelo(modeloSelecionado.nome);
                            setDescricaoModelo(modeloSelecionado.descricao);
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                        <Button onClick={salvarModelo}>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </Button>
                      </>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <Settings className="w-4 h-4 mr-2" />
                            Ações
                            <ChevronDown className="w-3 h-3 ml-2" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => {
                              if (modeloSelecionado.ehModeloSistema) {
                                toast({
                                  title: "Modelo do Sistema",
                                  description: "Modelos do sistema não podem ser editados diretamente. Duplique-o para criar uma versão editável.",
                                  variant: "destructive"
                                });
                                return;
                              }
                              setModoEdicao(true);
                              setNomeModelo(modeloSelecionado.nome);
                              setDescricaoModelo(modeloSelecionado.descricao);
                            }}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            {modeloSelecionado.ehModeloSistema ? "Duplicar Modelo" : "Editar Modelo"}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => setModoVisualizacao(true)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Visualizar Fluxo
                          </DropdownMenuItem>
                          
                          {!modeloSelecionado.ehModeloSistema && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => duplicarModelo(modeloSelecionado)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicar Modelo
                              </DropdownMenuItem>
                              
                              <DropdownMenuItem onClick={() => definirComoPadrao(modeloSelecionado.id)}>
                                {modeloSelecionado.ehPadrao ? (
                                  <>
                                    <StarOff className="w-4 h-4 mr-2" />
                                    Remover como Padrão
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-4 h-4 mr-2" />
                                    Definir como Padrão
                                  </>
                                )}
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => excluirModelo(modeloSelecionado.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir Modelo
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>

              {/* Editor de Etapas */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {modoEdicao && !modeloSelecionado?.ehModeloSistema ? (
                  <div className="space-y-4">
                    {/* Botão Adicionar Etapa */}
                    <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors">
                      <CardContent className="p-3">
                        <Button
                          variant="ghost"
                          className="w-full h-10 text-gray-600 hover:text-purple-600"
                          onClick={() => setShowNovaEtapaModal(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Nova Etapa
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Cards de Etapas - Layout Compacto */}
                    <div className="space-y-3">
                      {Array.from({ length: Math.ceil(modeloSelecionado.etapas.length / 8) }, (_, rowIndex) => (
                        <div key={rowIndex} className="relative flex gap-2 justify-start">
                          {/* Linha de conectores */}
                          <div className="absolute top-[70px] left-0 right-0 h-0.5 bg-gray-200 z-0" />
                          
                          {modeloSelecionado.etapas
                            .slice(rowIndex * 8, (rowIndex + 1) * 8)
                            .map((etapa, indexInRow) => {
                              const globalIndex = rowIndex * 8 + indexInRow;
                              const isLastInRow = indexInRow === 7 || globalIndex === modeloSelecionado.etapas.length - 1;
                              
                              return (
                                <div key={etapa.id} className="relative flex-shrink-0 z-20">
                                  {/* Conectores */}
                                  {!isLastInRow && (
                                    <>
                                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center z-10">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                      </div>
                                      <div className="absolute top-[68px] -right-4 w-8 h-0.5 bg-gray-200 z-0" />
                                    </>
                                  )}
                                  
                                  <Card 
                                    className={`relative w-[160px] transition-all duration-200 hover:shadow-lg border-2 border-gray-200 bg-white ${draggedEtapa === etapa.id ? 'opacity-50 scale-95' : ''}`}
                                    draggable={modoEdicao}
                                    onDragStart={(e) => handleDragStart(e, etapa.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, etapa.id)}
                                  >
                                    {/* Número da etapa */}
                                    <div className={`absolute -top-2 -left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-xs text-white z-30 ${
                                      globalIndex < 1 ? 'bg-green-500 border-green-600' : 
                                      globalIndex < 2 ? 'bg-blue-500 border-blue-600' : 
                                      'bg-purple-500 border-purple-600'
                                    }`}>
                                      {etapa.numeroEtapa}
                                    </div>

                                    {/* Ícone de relógio no canto superior direito */}
                                    <div className="absolute top-1 right-1">
                                      <Clock className="w-3 h-3 text-gray-400" />
                                    </div>

                                    {/* Drag handle para modo edição */}
                                    {modoEdicao && (
                                      <div className="absolute top-1 left-1 cursor-move">
                                        <GripVertical className="w-3 h-3 text-gray-400" />
                                      </div>
                                    )}

                                    <CardContent className="p-3 pt-5">
                                      {/* Título da etapa */}
                                      <h3 className="font-semibold text-center text-sm mb-3 min-h-[2.5rem] flex items-center justify-center leading-tight">
                                        {etapa.nomeEtapa}
                                      </h3>

                                      {/* Gerência responsável */}
                                      <p className="text-xs text-center text-gray-600 mb-3 min-h-[2rem] flex items-center justify-center leading-tight">
                                        {etapa.gerenciaResponsavel}
                                      </p>

                                      {/* Prazo */}
                                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-3">
                                        <Clock className="w-3 h-3" />
                                        <span>{etapa.prazoPadrao} dias</span>
                                      </div>

                                      {/* Botão Ver Detalhes */}
                                      <div className="text-center">
                                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                                          <Eye className="w-3 h-3 mr-1" />
                                          Detalhes
                                        </Button>
                                      </div>

                                      {/* Ações de edição */}
                                      {modoEdicao && (
                                        <div className="flex items-center justify-center gap-1 mt-2">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-5 w-5 p-0"
                                            onClick={() => moverEtapa(etapa.id, 'up')}
                                            disabled={globalIndex === 0}
                                          >
                                            <ArrowUp className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-5 w-5 p-0"
                                            onClick={() => moverEtapa(etapa.id, 'down')}
                                            disabled={globalIndex === modeloSelecionado.etapas.length - 1}
                                          >
                                            <ArrowDown className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-5 w-5 p-0"
                                            onClick={() => setEtapaEditando(etapa)}
                                          >
                                            <Edit3 className="w-3 h-3" />
                                          </Button>
                                          <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-5 w-5 p-0 text-red-600 hover:bg-red-50"
                                              >
                                                <Trash2 className="w-3 h-3" />
                                              </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                              <AlertDialogHeader>
                                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                  Tem certeza de que deseja excluir a etapa "{etapa.nomeEtapa}"?
                                                </AlertDialogDescription>
                                              </AlertDialogHeader>
                                              <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                  onClick={() => excluirEtapa(etapa.id)}
                                                  className="bg-red-600 hover:bg-red-700"
                                                >
                                                  Excluir
                                                </AlertDialogAction>
                                              </AlertDialogFooter>
                                            </AlertDialogContent>
                                          </AlertDialog>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                              );
                            })}
                        </div>
                      ))} 
                    </div>
                  </div>
                                  ) : (
                    <div className="space-y-6">
                      {/* Cards de Etapas - Layout Compacto */}
                      <div className="space-y-6">
                        {Array.from({ length: Math.ceil(modeloSelecionado.etapas.length / 8) }, (_, rowIndex) => (
                          <div key={rowIndex} className="relative flex gap-4 justify-start">
                          {/* Linha de conectores */}
                          <div className="absolute top-[80px] left-0 right-0 h-0.5 bg-gray-200 z-0" />
                          
                          {modeloSelecionado.etapas
                            .slice(rowIndex * 8, (rowIndex + 1) * 8)
                            .map((etapa, indexInRow) => {
                              const globalIndex = rowIndex * 8 + indexInRow;
                              const isLastInRow = indexInRow === 7 || globalIndex === modeloSelecionado.etapas.length - 1;
                              
                              return (
                                <div key={etapa.id} className="relative flex-shrink-0 z-20">
                                  {/* Conectores */}
                                  {!isLastInRow && (
                                    <>
                                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center z-10">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                      </div>
                                      <div className="absolute top-[78px] -right-4 w-8 h-0.5 bg-gray-200 z-0" />
                                    </>
                                  )}
                                  
                                  <Card 
                                    className={`relative w-[180px] transition-all duration-200 hover:shadow-lg border-2 border-gray-200 bg-white`}
                                  >
                                    {/* Número da etapa */}
                                    <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs text-white z-30 ${
                                      globalIndex < 1 ? 'bg-green-500 border-green-600' : 
                                      globalIndex < 2 ? 'bg-blue-500 border-blue-600' : 
                                      'bg-purple-500 border-purple-600'
                                    }`}>
                                      {etapa.numeroEtapa}
                                    </div>

                                    {/* Ícone de relógio no canto superior direito */}
                                    <div className="absolute top-1 right-1">
                                      <Clock className="w-3 h-3 text-gray-400" />
                                    </div>

                                    <CardContent className="p-3 pt-5">
                                      {/* Título da etapa */}
                                      <h3 className="font-semibold text-center text-sm mb-3 min-h-[2.5rem] flex items-center justify-center leading-tight">
                                        {etapa.nomeEtapa}
                                      </h3>

                                      {/* Gerência responsável */}
                                      <p className="text-xs text-center text-gray-600 mb-3 min-h-[2rem] flex items-center justify-center leading-tight">
                                        {etapa.gerenciaResponsavel}
                                      </p>

                                      {/* Prazo */}
                                      <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-3">
                                        <Clock className="w-3 h-3" />
                                        <span>{etapa.prazoPadrao} dias</span>
                                      </div>

                                      {/* Botão Ver Detalhes */}
                                      <div className="text-center">
                                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                                          <Eye className="w-3 h-3 mr-1" />
                                          Detalhes
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              );
                            })}
                        </div>
                      ))} 
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Workflow className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum modelo selecionado
                </h3>
                <p className="text-gray-600">
                  Selecione um modelo na sidebar para começar a editar
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal Nova Etapa / Editar Etapa */}
      <EtapaModal
        etapa={etapaEditando}
        isOpen={showNovaEtapaModal || !!etapaEditando}
        onClose={() => {
          setShowNovaEtapaModal(false);
          setEtapaEditando(null);
        }}
        onSave={(etapa) => {
          if (etapaEditando) {
            editarEtapa(etapaEditando.id, etapa);
          } else {
            adicionarEtapa(etapa);
          }
        }}

        iconesDisponiveis={iconesDisponiveis}
        coresDisponiveis={coresDisponiveis}
      />

      {/* Modal Visualização do Fluxo */}
      <Dialog open={modoVisualizacao} onOpenChange={setModoVisualizacao}>
        <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Visualização do Fluxo: {modeloSelecionado?.nome}
            </DialogTitle>
          </DialogHeader>
          
                            <div className="py-3">
                    <div className="text-center mb-4">
                      <h2 className="text-lg font-bold text-gray-900 mb-1.5">
                        Fluxo Completo do Processo
                      </h2>
                      <p className="text-gray-600">
                        Acompanhe todas as etapas do planejamento de contratação
                      </p>
                      <div className="mt-2 text-sm text-gray-500">
                        {modeloSelecionado?.etapas.length} etapas configuradas
                      </div>
                    </div>

            {/* Cards em layout horizontal como no sistema original */}
            <div className="space-y-6">
              {Array.from({ length: Math.ceil((modeloSelecionado?.etapas.length || 0) / 6) }, (_, rowIndex) => (
                <div key={rowIndex} className="relative flex flex-wrap gap-4 justify-start">
                  {/* Linha de conectores */}
                  <div className="absolute top-[90px] left-0 right-0 h-0.5 bg-gray-200 z-0" />
                  
                  {modeloSelecionado?.etapas
                    .slice(rowIndex * 6, (rowIndex + 1) * 6)
                    .map((etapa, indexInRow) => {
                      const globalIndex = rowIndex * 6 + indexInRow;
                      const isLastInRow = indexInRow === 5 || globalIndex === (modeloSelecionado?.etapas.length || 0) - 1;
                      
                      return (
                        <div key={etapa.id} className="relative flex-shrink-0 z-20">
                          {/* Conectores */}
                          {!isLastInRow && (
                            <>
                              <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center z-10">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                              <div className="absolute top-[97px] -right-6 w-12 h-0.5 bg-gray-200 z-0" />
                            </>
                          )}
                          
                          <Card 
                            className={`relative w-[180px] transition-all duration-200 hover:shadow-lg border-2 ${
                              etapa.etapaObrigatoria 
                                ? globalIndex < 1 ? 'border-green-400 bg-green-50' : globalIndex < 2 ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            {/* Número da etapa */}
                            <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs text-white z-30 ${
                              globalIndex < 1 ? 'bg-green-500 border-green-600' : 
                              globalIndex < 2 ? 'bg-blue-500 border-blue-600' : 
                              'bg-purple-500 border-purple-600'
                            }`}>
                              {etapa.numeroEtapa}
                            </div>

                            {/* Ícone de relógio no canto superior direito */}
                            <div className="absolute top-1 right-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                            </div>

                            <CardContent className="p-3 pt-5">
                              {/* Título da etapa */}
                              <h3 className="font-semibold text-center text-sm mb-2 min-h-[2rem] flex items-center justify-center">
                                {etapa.nomeEtapa}
                              </h3>

                              {/* Gerência responsável */}
                              <p className="text-xs text-center text-gray-600 mb-2 min-h-[1.5rem] flex items-center justify-center">
                                {etapa.gerenciaResponsavel}
                              </p>

                              {/* Prazo */}
                              <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-2">
                                <Clock className="w-3 h-3" />
                                <span>{etapa.prazoPadrao} dias úteis</span>
                              </div>

                              {/* Status */}
                              <div className="text-center mb-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    globalIndex < 1 ? 'bg-green-100 text-green-800 border-green-300' :
                                    globalIndex < 2 ? 'bg-blue-100 text-blue-800 border-blue-300' :
                                    'bg-gray-100 text-gray-600 border-gray-300'
                                  }`}
                                >
                                  {globalIndex < 1 ? 'Concluído ✓' : globalIndex < 2 ? 'Em Andamento' : 'Pendente'}
                                </Badge>
                              </div>

                              {/* Botão Ver Detalhes */}
                              <div className="text-center">
                                <Button variant="ghost" size="sm" className="text-xs h-5 px-2">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Ver Detalhes
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      );
                    })}
                </div>
              ))} 
            </div>
          </div>
          
          <div className="flex justify-end pt-3 border-t">
            <Button onClick={() => setModoVisualizacao(false)}>
              Fechar Visualização
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente Modal para Etapa
interface EtapaModalProps {
  etapa?: EtapaModelo | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (etapa: EtapaModelo) => void;
  iconesDisponiveis: Array<{value: string, label: string, icon: any}>;
  coresDisponiveis: Array<{value: string, label: string, color: string}>;
}

function EtapaModal({ etapa, isOpen, onClose, onSave, iconesDisponiveis, coresDisponiveis }: EtapaModalProps) {
  const [formData, setFormData] = useState<Partial<EtapaModelo>>({
    nomeEtapa: "",
    descricao: "",
    prazoPadrao: 5,
    gerenciaResponsavel: "",
    uploadObrigatorio: false,
    comentarioPermitido: true,
    exigeAssinatura: false,
    etapaObrigatoria: true,
    etapaRepetivel: false,
    iconeEtapa: "FileText",
    corEtapa: "blue",
    visivelParaTodos: true,
    conclusaoAutomatica: false,
    etapaCondicional: false
  });

  useEffect(() => {
    if (etapa) {
      setFormData(etapa);
    } else {
      setFormData({
        nomeEtapa: "",
        descricao: "",
        prazoPadrao: 5,
        gerenciaResponsavel: "",
        uploadObrigatorio: false,
        comentarioPermitido: true,
        exigeAssinatura: false,
        etapaObrigatoria: true,
        etapaRepetivel: false,
        iconeEtapa: "FileText",
        corEtapa: "blue",
        visivelParaTodos: true,
        conclusaoAutomatica: false,
        etapaCondicional: false
      });
    }
  }, [etapa]);

  const handleSave = () => {
    if (!formData.nomeEtapa || !formData.gerenciaResponsavel) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome da etapa e selecione uma gerência responsável.",
        variant: "destructive"
      });
      return;
    }

    onSave(formData as EtapaModelo);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {etapa ? "Editar Etapa" : "Nova Etapa"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Linha 1: Nome e Prazo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeEtapa">Nome da Etapa *</Label>
              <Input
                id="nomeEtapa"
                value={formData.nomeEtapa}
                onChange={(e) => setFormData({...formData, nomeEtapa: e.target.value})}
                placeholder="Ex: Elaboração do DFD"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="prazoPadrao">Prazo Padrão (dias úteis) *</Label>
              <Input
                id="prazoPadrao"
                type="number"
                min="1"
                value={formData.prazoPadrao}
                onChange={(e) => setFormData({...formData, prazoPadrao: parseInt(e.target.value)})}
              />
            </div>
          </div>

          {/* Linha 2: Ícone e Cor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ícone da Etapa *</Label>
              <Select
                value={formData.iconeEtapa}
                onValueChange={(value) => setFormData({...formData, iconeEtapa: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o ícone" />
                </SelectTrigger>
                <SelectContent>
                  {iconesDisponiveis.map((icone) => {
                    const IconComponent = icone.icon;
                    return (
                      <SelectItem key={icone.value} value={icone.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {icone.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Cor da Etapa *</Label>
              <Select
                value={formData.corEtapa}
                onValueChange={(value) => setFormData({...formData, corEtapa: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cor" />
                </SelectTrigger>
                <SelectContent>
                  {coresDisponiveis.map((cor) => (
                    <SelectItem key={cor.value} value={cor.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${cor.color}`}></div>
                        {cor.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição da Etapa</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descreva o que deve ser feito nesta etapa..."
              rows={3}
            />
          </div>
          
          {/* Gerência Responsável */}
          <div className="space-y-2">
            <Label>Gerência Responsável *</Label>
            <GerenciaSelect
              value={formData.gerenciaResponsavel}
              onValueChange={(value) => setFormData({...formData, gerenciaResponsavel: value})}
              placeholder="Selecione a gerência responsável"
              required={true}
              showResponsavel={true}
            />
          </div>
          
          <Separator />
          
          {/* Opções da Etapa */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Opções da Etapa</Label>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Coluna 1 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uploadObrigatorio"
                    checked={formData.uploadObrigatorio}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, uploadObrigatorio: !!checked})
                    }
                  />
                  <Label htmlFor="uploadObrigatorio" className="text-sm">
                    Upload de documento obrigatório
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="comentarioPermitido"
                    checked={formData.comentarioPermitido}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, comentarioPermitido: !!checked})
                    }
                  />
                  <Label htmlFor="comentarioPermitido" className="text-sm">
                    Comentário permitido
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exigeAssinatura"
                    checked={formData.exigeAssinatura}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, exigeAssinatura: !!checked})
                    }
                  />
                  <Label htmlFor="exigeAssinatura" className="text-sm">
                    Etapa exige assinatura
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visivelParaTodos"
                    checked={formData.visivelParaTodos}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, visivelParaTodos: !!checked})
                    }
                  />
                  <Label htmlFor="visivelParaTodos" className="text-sm">
                    Visível para todos
                  </Label>
                </div>
              </div>

              {/* Coluna 2 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="etapaObrigatoria"
                    checked={formData.etapaObrigatoria}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, etapaObrigatoria: !!checked, etapaCondicional: !checked})
                    }
                  />
                  <Label htmlFor="etapaObrigatoria" className="text-sm">
                    Etapa é obrigatória
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="etapaCondicional"
                    checked={formData.etapaCondicional}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, etapaCondicional: !!checked, etapaObrigatoria: !checked})
                    }
                  />
                  <Label htmlFor="etapaCondicional" className="text-sm">
                    Etapa é condicional
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="etapaRepetivel"
                    checked={formData.etapaRepetivel}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, etapaRepetivel: !!checked})
                    }
                  />
                  <Label htmlFor="etapaRepetivel" className="text-sm">
                    Etapa é repetível
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="conclusaoAutomatica"
                    checked={formData.conclusaoAutomatica}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, conclusaoAutomatica: !!checked})
                    }
                  />
                  <Label htmlFor="conclusaoAutomatica" className="text-sm">
                    Conclusão automática após ações
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {etapa ? "Salvar Alterações" : "Adicionar Etapa"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente ModeloCard
interface ModeloCardProps {
  modelo: ModeloFluxo;
  isSelected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDuplicate: () => void;
  onSetDefault: () => void;
  onDelete?: () => void;
  isSystem: boolean;
}

function ModeloCard({ 
  modelo, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDuplicate, 
  onSetDefault, 
  onDelete, 
  isSystem 
}: ModeloCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all border-l-4 ${
        isSelected 
          ? 'ring-2 ring-purple-500 bg-purple-50 border-l-purple-500' 
          : 'hover:bg-gray-50 border-l-gray-200 hover:border-l-purple-300'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {modelo.nome}
                </h3>
                {modelo.ehPadrao && (
                  <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                )}
                {isSystem && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 flex-shrink-0">
                    Sistema
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">
                {modelo.descricao}
              </p>
            </div>
          </div>
          
          {/* Informações */}
          <div className="flex items-center text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {modelo.etapas.length} etapas
            </span>
          </div>
          
          {/* Botões de ação */}
          <div className="flex items-center gap-1 pt-1">
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit3 className="w-3 h-3" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault();
              }}
            >
              {modelo.ehPadrao ? (
                <StarOff className="w-3 h-3" />
              ) : (
                <Star className="w-3 h-3" />
              )}
            </Button>
            
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza de que deseja excluir o modelo "{modelo.nome}"? 
                      Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}