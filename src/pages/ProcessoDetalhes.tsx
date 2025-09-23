import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/date";
import { 
  Calendar, 
  User, 
  Building2, 
  Clock,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  FileText,
  Settings,
  Save,
  XCircle
} from "lucide-react";
import Topbar from "@/components/Topbar";
import ReturnButton from "@/components/ReturnButton";
import FluxoProcessoCompleto from "@/components/FluxoProcessoCompleto";
import CardInfoProcesso from "@/components/CardInfoProcesso";
import UserSelector from "@/components/UserSelector";
import HistoricoProcesso from "@/components/HistoricoProcesso";
import DocumentosRelacionados from "@/components/DocumentosRelacionados";
import TruncatedCard from "@/components/TruncatedCard";
import { formatarNumeroProcesso } from "@/lib/processoUtils";
import { useUser } from "@/contexts/UserContext";
import { usePermissoes } from "@/hooks/usePermissoes";
import { GerenciaMultiSelect } from "@/components/GerenciaMultiSelect";
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';

// Dados mockados do processo
const processoMock = {
  id: "1",
  numeroProcesso: "Processo administrativo 012/2025",
  objeto: "Aquisição de Equipamentos Médicos para UTI",
  status: "em_andamento" as const,
  prazoFinal: "30/01/2025",
  gerenciaResponsavel: "GSL - Gerência de Suprimentos e Logística",
  dataCriacao: "05/01/2025",
  criador: "Dr. Maria Silva",
  situacaoAtual: "Aguardando elaboração do ETP",
  etapaAtual: "Elaboração do ETP",
  diasUteisConsumidos: 15,
  gerenciasEnvolvidas: [
    "GUE - Gerência de Urgência e Emergência",
    "GFC - Gerência Financeira e Contábil"
  ],
  regimeTramitacao: "Ordinário"
};

// Pendências do usuário atual
const pendenciasUsuario = [
  {
    id: "1",
    tipo: "analisar" as const,
    descricao: "Analisar ETP enviado para aprovação",
    prazo: "28/01/2025",
    prioridade: "alta" as const
  },
  {
    id: "2",
    tipo: "assinar" as const,
    descricao: "Assinar documento de consolidação da demanda",
    prazo: "30/01/2025",
    prioridade: "media" as const
  }
];

// Próximas etapas
const proximasEtapas = [
  {
    id: "1",
    nome: "Análise do ETP",
    responsavel: "Lucas Moreira Brito",
    previsao: "29/01/2025"
  },
  {
    id: "2",
    nome: "Aprovação do ETP",
    responsavel: "Dir. Roberto Alves",
    previsao: "02/02/2025"
  },
  {
    id: "3",
    nome: "Elaboração da Matriz de Risco",
    responsavel: "Dr. Luiza Santos",
    previsao: "05/02/2025"
  }
];

// Etapas do fluxo completo do processo - sempre 17 etapas
const gerarEtapasCompletas = (isNovoProcesso: boolean) => {
  // Substituir o array etapasTemplate dentro da função gerarEtapasCompletas para conter os 22 nomes fornecidos, mantendo a estrutura dos objetos e preenchendo os campos nome/nomeCompleto conforme a lista do usuário.
  const etapasTemplate = [
            { id: 1, nome: "Elaboração do DFD", nomeCompleto: "Elaboração do DFD", status: "pendente" as const, prazoPrevisao: "5 dias úteis", responsavel: "", cargo: "", gerencia: "GSP - Gerência de Soluções e Projetos" },
    { id: 2, nome: "Aprovação do DFD", nomeCompleto: "Aprovação do DFD", status: "pendente" as const, prazoPrevisao: "3 dias úteis", responsavel: "", cargo: "", gerencia: "GSL - Gerência de Suprimentos e Logística" },
    { id: 3, nome: "Assinatura do DFD", nomeCompleto: "Assinatura do DFD", status: "pendente" as const, prazoPrevisao: "3 dias úteis", responsavel: "", cargo: "", gerencia: "SE - Secretaria Executiva" },
    { id: 4, nome: "Despacho do DFD", nomeCompleto: "Despacho do DFD", status: "pendente" as const, prazoPrevisao: "2 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 5, nome: "Elaboração do ETP", nomeCompleto: "Elaboração do ETP", status: "pendente" as const, prazoPrevisao: "10 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 6, nome: "Assinatura do ETP", nomeCompleto: "Assinatura do ETP", status: "pendente" as const, prazoPrevisao: "2 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 7, nome: "Despacho do ETP", nomeCompleto: "Despacho do ETP", status: "pendente" as const, prazoPrevisao: "5 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 8, nome: "Elaboração da Matriz de Risco", nomeCompleto: "Elaboração da Matriz de Risco", status: "pendente" as const, prazoPrevisao: "7 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 9, nome: "Aprovação da Matriz de Risco", nomeCompleto: "Aprovação da Matriz de Risco", status: "pendente" as const, prazoPrevisao: "2 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 10, nome: "Assinatura da Matriz de Risco", nomeCompleto: "Assinatura da Matriz de Risco", status: "pendente" as const, prazoPrevisao: "15 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 11, nome: "Cotação", nomeCompleto: "Cotação", status: "pendente" as const, prazoPrevisao: "2 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 12, nome: "Elaboração do Termo de Referência (TR)", nomeCompleto: "Elaboração do Termo de Referência (TR)", status: "pendente" as const, prazoPrevisao: "10 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 13, nome: "Assinatura do TR", nomeCompleto: "Assinatura do TR", status: "pendente" as const, prazoPrevisao: "5 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 14, nome: "Elaboração do Edital", nomeCompleto: "Elaboração do Edital", status: "pendente" as const, prazoPrevisao: "3 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 15, nome: "Análise Jurídica Prévia", nomeCompleto: "Análise Jurídica Prévia", status: "pendente" as const, prazoPrevisao: "20 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 16, nome: "Cumprimento de Ressalvas", nomeCompleto: "Cumprimento de Ressalvas", status: "pendente" as const, prazoPrevisao: "10 dias úteis", responsavel: "", cargo: "", gerencia: "" },
    { id: 17, nome: "Elaboração do Parecer Jurídico", nomeCompleto: "Elaboração do Parecer Jurídico", status: "pendente" as const, prazoPrevisao: "1 dia útil", responsavel: "", cargo: "", gerencia: "" },
    { id: 18, nome: "Cumprimento de Ressalvas pós Parecer Jurídico", nomeCompleto: "Cumprimento de Ressalvas pós Parecer Jurídico", status: "pendente" as const, prazoPrevisao: "1 dia útil", responsavel: "", cargo: "", gerencia: "" },
    { id: 19, nome: "Aprovação Jurídica", nomeCompleto: "Aprovação Jurídica", status: "pendente" as const, prazoPrevisao: "1 dia útil", responsavel: "", cargo: "", gerencia: "" },
    { id: 20, nome: "Assinatura do Edital", nomeCompleto: "Assinatura do Edital", status: "pendente" as const, prazoPrevisao: "1 dia útil", responsavel: "", cargo: "", gerencia: "" },
    { id: 21, nome: "Publicação", nomeCompleto: "Publicação", status: "pendente" as const, prazoPrevisao: "1 dia útil", responsavel: "", cargo: "", gerencia: "" }
  ];

  if (isNovoProcesso) {
    // Para processos novos, todas as etapas começam como pendentes
    return etapasTemplate;
  } else {
    // Para processos existentes, simular progresso baseado no status
    // Aqui você pode integrar com dados reais do backend
    return etapasTemplate.map((etapa, index) => {
      if (index < 1) {
        // Primeira etapa concluída
        return {
          ...etapa,
          status: "concluido" as const,
          responsavel: "Dr. Maria Silva",
          cargo: "Gerente de Recursos Humanos",
          gerencia: "Gerência de Recursos Humanos"
        };
      } else if (index === 1) {
        // Segunda etapa em andamento
        return {
          ...etapa,
          status: "andamento" as const,
          responsavel: "Yasmin Pissolati Mattos Bretz",
          cargo: "Gerente de Soluções e Projetos",
          gerencia: "Gerência de Soluções e Projetos"
        };
      } else {
        // Demais etapas pendentes
        return etapa;
      }
    });
  }
};

// Dados para o modal de edição - usando apenas gerências reais cadastradas
const gerencias = [
  "CI - Comissão de Implantação",
  "SE - Secretaria Executiva",
  "OUV - Ouvidoria",
  "GSP - Gerência de Soluções e Projetos",
  "GSL - Gerência de Suprimentos e Logística",
  "GRH - Gerência de Recursos Humanos",
  "GUE - Gerência de Urgência e Emergência",
  "GLC - Gerência de Licitações e Contratos",
  "GFC - Gerência Financeira e Contábil",
      "GRH - Gerência de Recursos Humanos",
  "GAP - Gerência de Administração e Patrimônio",
  "GESP - Gerência de Especialidades",
  "NAJ - Assessoria Jurídica"
];

const etapasPossiveis = [
  "Aguardando Elaboração do DFD",
  "Elaboração do DFD",
  "Análise do DFD",
  "Aprovação do DFD",
  "Elaboração do ETP",
  "Análise do ETP",
  "Aprovação do ETP",
  "Elaboração da Matriz de Risco",
  "Análise da Matriz de Risco",
  "Aprovação da Matriz de Risco",
  "Elaboração do TR",
  "Análise do TR",
  "Aprovação do TR",
  "Elaboração do Edital",
  "Análise do Edital",
  "Aprovação do Edital",
  "Publicação",
  "Análise de Propostas",
  "Aprovação Final",
  "Concluído"
];

const statusProcesso = [
  "Em Construção",
  "Em Andamento", 
  "Finalizado",
  "Cancelado"
];

const tiposTramitacao = [
  { value: "ordinario", label: "Ordinário" },
  { value: "urgente", label: "Urgente" },
];



interface Etapa {
  id: number;
  titulo: string;
  icone: React.ReactNode;
  status: "concluido" | "em_andamento" | "pendente" | "atrasado";
  dataInicio?: string;
  dataConclusao?: string;
  responsavel?: string;
  gerencia?: string;
  prazo?: string;
  documento?: string;
  observacoes?: string;
}

export default function ProcessoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados para o modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    prazoFinal: "",
    gerenciaResponsavel: "",
    etapaAtual: "",
    diasUteisConsumidos: 0,
    status: "",
    gerenciasEnvolvidas: [] as string[],
    regimeTramitacao: "",
    prioridade: ""
  });
  const [originalFormData, setOriginalFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Verificar se é um processo novo (começa com "processo_")
  const isNovoProcesso = id?.startsWith('processo_');
  
  // Função para gerar número do processo subsequente
  const gerarNumeroProcesso = () => {
    const anoAtual = new Date().getFullYear();
    
    // Filtrar processos do ano atual (usando processoMock como exemplo)
    const processosAnoAtual = [
      { numeroProcesso: "001/2024", ano: "2024" },
      { numeroProcesso: "045/2024", ano: "2024" },
      { numeroProcesso: "001/2024", ano: "2024" },
      { numeroProcesso: "002/2024", ano: "2024" },
      { numeroProcesso: "002/2023", ano: "2023" }
    ].filter(p => p.ano === anoAtual.toString());
    
    if (processosAnoAtual.length === 0) {
      // Se não há processos no ano atual, começar com 001
      return `001/${anoAtual}`;
    }
    
    // Extrair números dos processos existentes e encontrar o maior
    const numeros = processosAnoAtual.map(p => {
      const match = p.numeroProcesso.match(/^(\d+)\/\d+$/);
      return match ? parseInt(match[1]) : 0;
    });
    
    const maiorNumero = Math.max(...numeros);
    const proximoNumero = maiorNumero + 1;
    
    return `${String(proximoNumero).padStart(3, '0')}/${anoAtual}`;
  };

  // Dados do processo - se for novo, usar dados vazios
  const processoAtual = isNovoProcesso ? {
    id: id || "novo",
    numeroProcesso: `Processo administrativo ${gerarNumeroProcesso()}`,
    objeto: "Processo em construção",
    status: "em_andamento" as const,
    prazoFinal: "",
    gerenciaResponsavel: "GRH - Gerência de Recursos Humanos",
    dataCriacao: formatDateBR(new Date()),
    criador: "Usuário Atual",
    situacaoAtual: "Em construção",
    etapaAtual: "Aguardando Elaboração do DFD",
    diasUteisConsumidos: 0,
    gerenciasEnvolvidas: [],
    regimeTramitacao: "Ordinário"
  } : {
    ...processoMock,
    numeroProcesso: formatarNumeroProcesso(processoMock.numeroProcesso)
  };

  // Usar etapas completas para todos os processos
  const etapasAtuais = gerarEtapasCompletas(isNovoProcesso);
  


  // Funções para o modal de edição
  const handleOpenEditModal = () => {
    const initialData = {
      prazoFinal: processoAtual.prazoFinal || "",
      gerenciaResponsavel: processoAtual.gerenciaResponsavel,
      etapaAtual: processoAtual.etapaAtual,
      diasUteisConsumidos: processoAtual.diasUteisConsumidos,
      status: processoAtual.status || "em_andamento",
      gerenciasEnvolvidas: processoAtual.gerenciasEnvolvidas || [],
      regimeTramitacao: processoAtual.regimeTramitacao || "",
      prioridade: (processoAtual as any).prioridade || ""
    };
    setEditFormData(initialData);
    setOriginalFormData(initialData);
    setIsEditModalOpen(true);
  };

  // Função para calcular dias úteis automaticamente
  const calcularDiasUteis = (dataCriacao: string, prazoFinal: string) => {
    if (!prazoFinal) return 0;
    
    const dataInicio = new Date(dataCriacao.split('/').reverse().join('-'));
    const dataFim = new Date(prazoFinal);
    const diasUteis = Math.ceil((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diasUteis);
  };

  const handleEditFormChange = (field: string, value: string | number | string[]) => {
    setEditFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Calcular dias úteis automaticamente se prazo final for alterado
      if (field === 'prazoFinal') {
        const diasUteis = calcularDiasUteis(processoAtual.dataCriacao, value as string);
        newData.diasUteisConsumidos = diasUteis;
      }
      
      return newData;
    });
  };

  // Verificar se houve modificações
  const hasChanges = () => {
    // Comparar arrays de gerências envolvidas corretamente
    const currentGerencias = editFormData.gerenciasEnvolvidas || [];
    const originalGerencias = originalFormData.gerenciasEnvolvidas || [];
    
    const gerenciasChanged = JSON.stringify(currentGerencias.sort()) !== JSON.stringify(originalGerencias.sort());
    
    // Comparar outros campos (excluindo dias úteis que são calculados automaticamente)
    const otherFieldsChanged = 
      editFormData.prazoFinal !== originalFormData.prazoFinal ||
      editFormData.gerenciaResponsavel !== originalFormData.gerenciaResponsavel ||
      editFormData.etapaAtual !== originalFormData.etapaAtual ||
      editFormData.status !== originalFormData.status ||
      editFormData.regimeTramitacao !== originalFormData.regimeTramitacao;
    
    return gerenciasChanged || otherFieldsChanged;
  };

  // Validar campos obrigatórios
  const isFormValid = () => {
    return editFormData.gerenciaResponsavel.trim() !== "" && editFormData.regimeTramitacao.trim() !== "";
  };

  const handleSaveChanges = async () => {
    if (!hasChanges() || !isFormValid()) {
      return;
    }

    setIsSaving(true);

    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
             // Identificar campos alterados
       const camposAlterados = [];
       Object.keys(editFormData).forEach(key => {
         // Pular dias úteis que são calculados automaticamente
         if (key === 'diasUteisConsumidos') return;
         
         if (key === 'gerenciasEnvolvidas') {
           // Comparar arrays de gerências envolvidas
           const currentGerencias = editFormData[key] || [];
           const originalGerencias = originalFormData[key] || [];
           if (JSON.stringify(currentGerencias.sort()) !== JSON.stringify(originalGerencias.sort())) {
             camposAlterados.push({
               campo: key,
               valorAnterior: originalFormData[key],
               valorNovo: editFormData[key]
             });
           }
         } else if (editFormData[key] !== originalFormData[key]) {
           camposAlterados.push({
             campo: key,
             valorAnterior: originalFormData[key],
             valorNovo: editFormData[key]
           });
         }
       });

      // Atualizar o processo atual com os novos dados
      Object.assign(processoAtual, editFormData);
      
      // Registrar no histórico
      const historicoEntry = {
        id: Date.now().toString(),
        tipo: "edicao",
        descricao: "Informações do processo editadas",
        usuario: "Usuário Atual",
        data: formatDateTimeBR(new Date()),
        detalhes: {
          camposAlterados,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('Alterações salvas:', editFormData);
      console.log('Entrada no histórico:', historicoEntry);
      
      // Mostrar mensagem de sucesso
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setIsEditModalOpen(false);
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      // Em um sistema real, mostrar toast de erro
    } finally {
      setIsSaving(false);
    }
  };

  // Verificar se o usuário tem permissão para editar
  const { podeEditarProcesso } = usePermissoes();
  const canEdit = podeEditarProcesso();

  const getStatusConfig = (status: string) => {
    const configs = {
      "em_andamento": {
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <PlayCircle className="w-4 h-4" />,
        label: "Em Andamento"
      },
      "concluido": {
        className: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Concluído"
      },
      "atrasado": {
        className: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertTriangle className="w-4 h-4" />,
        label: "Atrasado"
      },
      "pendente": {
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Clock className="w-4 h-4" />,
        label: "Pendente"
      }
    };
    return configs[status as keyof typeof configs] || configs.pendente;
  };

  const statusConfig = getStatusConfig(processoAtual.status);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "anticipate" as const,
    duration: 0.5
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <Topbar />
      
      <div className="pt-16 md:pt-20">
        {/* Cabeçalho Moderno */}
        <motion.div 
          className="bg-white shadow-sm border-b border-gray-200"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-full px-8 py-6">
            {/* Botão Voltar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ReturnButton className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors" />
            </motion.div>

            {/* Título Principal */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {processoAtual.numeroProcesso}
                  </h1>
                  <p className="text-xl text-gray-700 mb-4">
                    {processoAtual.objeto}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {canEdit && (
                    <Button
                      onClick={handleOpenEditModal}
                      variant="outline"
                      className="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 border-gray-300"
                    >
                      <Settings className="w-4 h-4" />
                      Editar Processo
                    </Button>
                  )}
                  <Badge className={`${statusConfig.className} border text-sm font-medium px-4 py-2`}>
                    {statusConfig.icon}
                    <span className="ml-2">{statusConfig.label}</span>
                  </Badge>
                </div>

                
              </div>

                             {/* Informações Principais */}
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
                 <motion.div 
                  className="rounded-2xl p-4 md:p-5 bg-white/80 backdrop-blur-sm ring-1 ring-gray-200 hover:ring-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
                   whileHover={{ scale: 1.02, y: -2 }}
                   transition={{ type: "spring", stiffness: 300 }}
                 >
                   <div className="flex items-center gap-3 justify-center text-center">
                    <div className="p-1.5 bg-blue-100 rounded-xl ring-1 ring-black/5">
                       <Calendar className="w-5 h-5 text-blue-600" />
                     </div>
                     <div className="flex-1 min-w-0">
                      <p className="text-[11px] md:text-xs font-medium text-gray-500 uppercase tracking-wide">Prazo Final</p>
                      <p className="text-base md:text-lg font-semibold text-gray-900 truncate">{processoAtual.prazoFinal || "Não definido"}</p>
                     </div>
                   </div>
                 </motion.div>
 
                 <TruncatedCard
                   icon={<Building2 />}
                   label="Gerência"
                   value={processoAtual.gerenciaResponsavel}
                   iconBgColor="bg-green-100"
                   iconColor="text-green-600"
                 />
 
                 <motion.div 
                  className="rounded-2xl p-4 md:p-5 bg-white/80 backdrop-blur-sm ring-1 ring-gray-200 hover:ring-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
                   whileHover={{ scale: 1.02, y: -2 }}
                   transition={{ type: "spring", stiffness: 300 }}
                 >
                   <div className="flex items-center gap-3 justify-center text-center">
                    <div className="p-1.5 bg-purple-100 rounded-xl ring-1 ring-black/5">
                       <User className="w-5 h-5 text-purple-600" />
                     </div>
                     <div className="flex-1 min-w-0">
                      <p className="text-[11px] md:text-xs font-medium text-gray-500 uppercase tracking-wide">Criador</p>
                      <p className="text-base md:text-lg font-semibold text-gray-900 truncate">{processoAtual.criador}</p>
                     </div>
                   </div>
                 </motion.div>
 
                 <TruncatedCard
                   icon={<FileText />}
                   label="Etapa Atual"
                   value={processoAtual.etapaAtual}
                   iconBgColor="bg-orange-100"
                   iconColor="text-orange-600"
                 />
 
                 <motion.div 
                  className="rounded-2xl p-4 md:p-5 bg-white/80 backdrop-blur-sm ring-1 ring-gray-200 hover:ring-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
                   whileHover={{ scale: 1.02, y: -2 }}
                   transition={{ type: "spring", stiffness: 300 }}
                 >
                   <div className="flex items-center gap-3 justify-center text-center">
                    <div className="p-1.5 bg-red-100 rounded-xl ring-1 ring-black/5">
                       <Clock className="w-5 h-5 text-red-600" />
                     </div>
                     <div className="flex-1 min-w-0">
                      <p className="text-[11px] md:text-xs font-medium text-gray-500 uppercase tracking-wide">Dias Úteis</p>
                      <p className="text-base md:text-lg font-semibold text-gray-900 truncate">{processoAtual.diasUteisConsumidos} dias</p>
                     </div>
                   </div>
                 </motion.div>
 
                 <motion.div 
                  className="rounded-2xl p-4 md:p-5 bg-white/80 backdrop-blur-sm ring-1 ring-gray-200 hover:ring-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
                   whileHover={{ scale: 1.02, y: -2 }}
                   transition={{ type: "spring", stiffness: 300 }}
                 >
                   <div className="flex items-center gap-3 justify-center text-center">
                    <div className="p-1.5 bg-indigo-100 rounded-xl ring-1 ring-black/5">
                       <AlertTriangle className="w-5 h-5 text-indigo-600" />
                     </div>
                     <div className="flex-1 min-w-0">
                      <p className="text-[11px] md:text-xs font-medium text-gray-500 uppercase tracking-wide">Regime</p>
                      <p className="text-base md:text-lg font-semibold text-gray-900 truncate">{processoAtual.regimeTramitacao}</p>
                     </div>
                   </div>
                 </motion.div>
 
                 <motion.div 
                  className="rounded-2xl p-4 md:p-5 bg-white/80 backdrop-blur-sm ring-1 ring-gray-200 hover:ring-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
                   whileHover={{ scale: 1.02, y: -2 }}
                   transition={{ type: "spring", stiffness: 300 }}
                 >
                   <div className="flex items-center gap-3 justify-center text-center">
                    <div className="p-1.5 bg-gray-100 rounded-xl ring-1 ring-black/5">
                       <Calendar className="w-5 h-5 text-gray-600" />
                     </div>
                     <div className="flex-1 min-w-0">
                      <p className="text-[11px] md:text-xs font-medium text-gray-500 uppercase tracking-wide">Data Criação</p>
                      <p className="text-base md:text-lg font-semibold text-gray-900 truncate">{processoAtual.dataCriacao}</p>
                     </div>
                   </div>
                 </motion.div>
                 {/** Prioridade **/}
                 <motion.div 
                  className="rounded-2xl p-4 md:p-5 bg-white/80 backdrop-blur-sm ring-1 ring-gray-200 hover:ring-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
                   whileHover={{ scale: 1.02, y: -2 }}
                   transition={{ type: "spring", stiffness: 300 }}
                 >
                   <div className="flex items-center gap-3 justify-center text-center">
                    <div className="p-1.5 bg-yellow-100 rounded-xl ring-1 ring-black/5">
                       <AlertTriangle className="w-5 h-5 text-yellow-600" />
                     </div>
                     <div className="flex-1 min-w-0">
                      <p className="text-[11px] md:text-xs font-medium text-gray-500 uppercase tracking-wide">Prioridade</p>
                      <p className="text-base md:text-lg font-semibold text-gray-900 truncate">{(processoAtual as any).prioridade || "Não definido"}</p>
                     </div>
                   </div>
                 </motion.div>
               </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Conteúdo Principal */}
        <div className="w-full px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Coluna Principal */}
            <motion.div 
              className="xl:col-span-4 space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              {/* Seletor de Usuário para Teste */}
              <UserSelector />

              {/* Fluxo Completo do Processo */}
              <FluxoProcessoCompleto 
                etapas={etapasAtuais} 
                gerenciaCriadora="GRH - Gerência de Recursos Humanos" // Mock da gerência criadora
              />

              {/* Histórico de Ações */}
              <HistoricoProcesso historico={[]} />

              {/* Documentos Relacionados */}
              <DocumentosRelacionados documentos={[]} />
            </motion.div>

            {/* Sidebar */}
            <motion.div 
              className="xl:col-span-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="sticky top-24">
                <CardInfoProcesso 
                  processo={processoAtual}
                  pendenciasUsuario={pendenciasUsuario}
                  proximasEtapas={proximasEtapas}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

             {/* Modal de Edição */}
       <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
         <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
          <DialogTitle className="sr-only">Editar Informações do Processo</DialogTitle>
          <DialogDescription className="sr-only">
            Edite as informações principais do processo administrativo
          </DialogDescription>
          
          {/* Header do Modal */}
          <div className="flex items-center px-8 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Editar Processo</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Modifique as informações principais do processo
                </p>
              </div>
            </div>
          </div>

                     {/* Conteúdo do Formulário */}
           <div className="px-8 py-6 overflow-y-auto max-h-[70vh]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna Esquerda */}
              <div className="space-y-4">
                {/* Prazo Final */}
                <div className="space-y-2">
                  <Label htmlFor="prazoFinal" className="text-base font-semibold text-gray-900">
                    Prazo Final
                  </Label>
                  <DatePicker
                    value={editFormData.prazoFinal || null}
                    onChange={(date) => handleEditFormChange('prazoFinal', date || '')}
                    placeholder="Selecione a data"
                    showPresets={true}
                    businessDaysOnly={true}
                    minDate={new Date()}
                    className="w-full"
                    inputClassName="h-10 border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  />
                  <p className="text-xs text-gray-500">
                    Obrigatório apenas se for definido manualmente
                  </p>
                </div>

                                 {/* Gerência */}
                 <div className="space-y-2">
                   <Label htmlFor="gerencia" className="text-base font-semibold text-gray-900">
                     Gerência Responsável *
                   </Label>
                   <Select
                     value={editFormData.gerenciaResponsavel}
                     onValueChange={(value) => handleEditFormChange('gerenciaResponsavel', value)}
                   >
                     <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200">
                       <SelectValue placeholder="Selecione a gerência" />
                     </SelectTrigger>
                     <SelectContent>
                       {gerencias.map((gerencia) => (
                         <SelectItem key={gerencia} value={gerencia}>
                           {gerencia}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>

                 {/* Regime de Tramitação */}
                 <div className="space-y-2">
                   <Label htmlFor="regimeTramitacao" className="text-base font-semibold text-gray-900">
                     Regime de Tramitação *
                   </Label>
                   <Select
                     value={editFormData.regimeTramitacao}
                     onValueChange={(value) => handleEditFormChange('regimeTramitacao', value)}
                   >
                     <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200">
                       <SelectValue placeholder="Selecione o regime de tramitação" />
                     </SelectTrigger>
                     <SelectContent>
                       {tiposTramitacao.map((tipo) => (
                         <SelectItem key={tipo.value} value={tipo.label}>
                           {tipo.label}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <p className="text-xs text-gray-500">
                     Define a prioridade e velocidade de tramitação do processo
                   </p>
                 </div>

                {/* Gerências Envolvidas */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold text-gray-900">
                    Outras Gerências que podem participar
                  </Label>
                  <GerenciaMultiSelect
                    value={editFormData.gerenciasEnvolvidas}
                    onValueChange={(value) => handleEditFormChange("gerenciasEnvolvidas", value)}
                    placeholder="Selecione as gerências participantes"
                    required={false}
                    excludeValues={[editFormData.gerenciaResponsavel]}
                  />
                  <p className="text-xs text-gray-500">
                    Gerências que podem participar do processo além da responsável
                  </p>
                </div>

                {/* Criador (Readonly) */}
                <div className="space-y-2">
                  <Label htmlFor="criador" className="text-base font-semibold text-gray-900">
                    Criador
                  </Label>
                  <Input
                    id="criador"
                    value={processoAtual.criador}
                    disabled
                    className="h-10 bg-gray-50 text-gray-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">
                    Nome do usuário atual (não editável)
                  </p>
                </div>
              </div>

              {/* Coluna Direita */}
              <div className="space-y-4">
                {/* Etapa Atual */}
                <div className="space-y-2">
                  <Label htmlFor="etapaAtual" className="text-base font-semibold text-gray-900">
                    Etapa Atual
                  </Label>
                  <Select
                    value={editFormData.etapaAtual}
                    onValueChange={(value) => handleEditFormChange('etapaAtual', value)}
                  >
                    <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200">
                      <SelectValue placeholder="Selecione a etapa atual" />
                    </SelectTrigger>
                    <SelectContent>
                      {etapasPossiveis.map((etapa) => (
                        <SelectItem key={etapa} value={etapa}>
                          {etapa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Útil para processos que pulam etapas
                  </p>
                </div>

                                 {/* Dias Úteis */}
                 <div className="space-y-2">
                   <Label htmlFor="diasUteis" className="text-base font-semibold text-gray-900">
                     Dias Úteis Consumidos
                   </Label>
                   <Input
                     id="diasUteis"
                     type="number"
                     value={editFormData.diasUteisConsumidos}
                     disabled
                     className="h-10 bg-gray-50 text-gray-700 cursor-not-allowed border-2 border-gray-300"
                     placeholder="0"
                   />
                   <p className="text-xs text-gray-500">
                     Calculado automaticamente pelo sistema baseado na data de criação e prazo final
                   </p>
                 </div>

                {/* Data de Criação (Readonly) */}
                <div className="space-y-2">
                  <Label htmlFor="dataCriacao" className="text-base font-semibold text-gray-900">
                    Data de Criação
                  </Label>
                  <Input
                    id="dataCriacao"
                    value={processoAtual.dataCriacao}
                    disabled
                    className="h-10 bg-gray-50 text-gray-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">
                    Apenas visualização
                  </p>
                </div>

                {/* Status do Processo */}
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-base font-semibold text-gray-900">
                    Status do Processo
                  </Label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) => handleEditFormChange('status', value)}
                  >
                    <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusProcesso.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Define o status atual do processo
                  </p>
                </div>

                {/* Grau de Prioridade (dentro do modal) */}
                <div className="space-y-2">
                  <Label htmlFor="prioridade" className="text-base font-semibold text-gray-900">
                    Grau de Prioridade
                  </Label>
                  <Select
                    value={editFormData.prioridade}
                    onValueChange={(value) => handleEditFormChange('prioridade', value)}
                  >
                    <SelectTrigger className="h-10 border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALTO">Alto</SelectItem>
                      <SelectItem value="MEDIO">Médio</SelectItem>
                      <SelectItem value="BAIXO">Baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-4 px-8 py-4 border-t border-gray-200">
            {showSuccessMessage && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                Alterações salvas com sucesso!
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges() || !isFormValid() || isSaving}
              className={`px-4 py-2 flex items-center gap-2 ${
                !hasChanges() || !isFormValid() || isSaving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 