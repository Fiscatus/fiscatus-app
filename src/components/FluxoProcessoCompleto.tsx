import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  XCircle, 
  ChevronDown,
  FileText,
  PenTool,
  Users,
  Search,
  Shield,
  DollarSign,
  Scale,
  Upload,
  User,
  Calendar,
  Building2,
  Eye,
  Download,
  Edit3,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useUser } from '@/contexts/UserContext';
import EtapaDetalhesModal from './EtapaDetalhesModal';

interface Etapa {
  id: number;
  nome: string;
  nomeCompleto: string;
  status: 'pendente' | 'andamento' | 'concluido' | 'atrasado';
  prazoPrevisao: string;
  dataConclusao?: string;
  documento?: string;
  documentoUrl?: string;
  enviadoPor?: string;
  dataEnvio?: string;
  prazoCumprido?: boolean;
  responsavel: string;
  cargo: string;
  gerencia: string;
  dataInicio?: string;
  observacoes?: string;
  envolvidos?: Array<{
    nome: string;
    cargo: string;
    papel: string;
    gerencia: string;
  }>;
}

interface FluxoProcessoCompletoProps {
  etapas?: Etapa[];
  onEtapaClick?: (etapa: Etapa) => void;
}

// Dados das 17 etapas do processo
const etapasPadrao: Etapa[] = [
  {
    id: 1,
    nome: "Elaboração do DFD",
    nomeCompleto: "Elaboração do Documento de Formalização da Demanda",
    status: "concluido",
    prazoPrevisao: "5 dias úteis",
    dataConclusao: "05/01/2025",
    prazoCumprido: true,
    responsavel: "Dr. João Silva",
    cargo: "Gerente de Planejamento",
    gerencia: "Gerência de Planejamento",
    dataInicio: "01/01/2025",
    documento: "DFD_012_2025.pdf",
    documentoUrl: "/docs/dfd.pdf"
  },
  {
    id: 2,
    nome: "Análise da Demanda",
    nomeCompleto: "Análise Técnica da Demanda Apresentada",
    status: "concluido",
    prazoPrevisao: "3 dias úteis",
    dataConclusao: "08/01/2025",
    prazoCumprido: true,
    responsavel: "Eng. Maria Santos",
    cargo: "Engenheira Chefe",
    gerencia: "Gerência Técnica",
    dataInicio: "06/01/2025"
  },
  {
    id: 3,
    nome: "Validação Técnica",
    nomeCompleto: "Validação Técnica das Especificações",
    status: "concluido",
    prazoPrevisao: "3 dias úteis",
    dataConclusao: "12/01/2025",
    prazoCumprido: true,
    responsavel: "Arq. Carlos Oliveira",
    cargo: "Arquiteto Senior",
    gerencia: "Gerência de Engenharia",
    dataInicio: "09/01/2025"
  },
  {
    id: 4,
    nome: "Assinatura do DFD",
    nomeCompleto: "Assinatura e Aprovação do DFD",
    status: "concluido",
    prazoPrevisao: "2 dias úteis",
    dataConclusao: "15/01/2025",
    prazoCumprido: true,
    responsavel: "Dir. Ana Costa",
    cargo: "Diretora Executiva",
    gerencia: "Diretoria Executiva",
    dataInicio: "13/01/2025"
  },
  {
    id: 5,
    nome: "Elaboração do ETP",
    nomeCompleto: "Elaboração do Estudo Técnico Preliminar",
    status: "andamento",
    prazoPrevisao: "10 dias úteis",
    responsavel: "Eng. Pedro Lima",
    cargo: "Engenheiro de Projetos",
    gerencia: "Gerência de Projetos",
    dataInicio: "16/01/2025",
    documento: "ETP_012_2025_v1.pdf",
    documentoUrl: "/docs/etp.pdf",
    envolvidos: [
      {
        nome: "Téc. Ana Silva",
        cargo: "Técnica de Apoio",
        papel: "Apoio Técnico",
        gerencia: "Gerência de Projetos"
      },
      {
        nome: "Est. Carlos Mendes",
        cargo: "Estagiário",
        papel: "Auxiliar de Campo",
        gerencia: "Gerência de Projetos"
      }
    ]
  },
  {
    id: 6,
    nome: "Assinatura do ETP",
    nomeCompleto: "Assinatura do Estudo Técnico Preliminar",
    status: "pendente",
    prazoPrevisao: "2 dias úteis",
    responsavel: "Dir. Roberto Silva",
    cargo: "Diretor Técnico",
    gerencia: "Diretoria Técnica"
  },
  {
    id: 7,
    nome: "Análise e Aprovação do ETP",
    nomeCompleto: "Análise e Aprovação do Estudo Técnico Preliminar",
    status: "pendente",
    prazoPrevisao: "5 dias úteis",
    responsavel: "Esp. Fernanda Martins",
    cargo: "Especialista em Análise",
    gerencia: "Gerência de Análise"
  },
  {
    id: 8,
    nome: "Elaboração da Matriz de Risco",
    nomeCompleto: "Elaboração da Matriz de Análise de Riscos",
    status: "pendente",
    prazoPrevisao: "7 dias úteis",
    responsavel: "Dr. Luiz Santos",
    cargo: "Gerente de Riscos",
    gerencia: "Gerência de Riscos",
          envolvidos: [
        {
          nome: "Esp. Mariana Costa",
          cargo: "Especialista em Riscos",
          papel: "Analista Senior",
          gerencia: "Gerência de Riscos"
        },
        {
          nome: "Téc. Roberto Alves",
          cargo: "Técnico de Campo",
          papel: "Coleta de Dados",
          gerencia: "Gerência de Riscos"
        },
        {
          nome: "Est. Juliana Pereira",
          cargo: "Estagiária",
          papel: "Apoio Administrativo",
          gerencia: "Gerência de Riscos"
        }
      ]
  },
  {
    id: 9,
    nome: "Assinatura da Matriz de Risco",
    nomeCompleto: "Assinatura da Matriz de Análise de Riscos",
    status: "pendente",
    prazoPrevisao: "2 dias úteis",
    responsavel: "Dir. Patricia Alves",
    cargo: "Diretora de Riscos",
    gerencia: "Diretoria de Riscos"
  },
  {
    id: 10,
    nome: "Elaboração do TR",
    nomeCompleto: "Elaboração do Termo de Referência",
    status: "pendente",
    prazoPrevisao: "15 dias úteis",
    responsavel: "Dr. Rafael Costa",
    cargo: "Gerente de Contratos",
    gerencia: "Gerência de Contratos"
  },
  {
    id: 11,
    nome: "Assinatura do TR",
    nomeCompleto: "Assinatura do Termo de Referência",
    status: "pendente",
    prazoPrevisao: "2 dias úteis",
    responsavel: "Dir. Marcos Pereira",
    cargo: "Diretor de Contratos",
    gerencia: "Diretoria de Contratos"
  },
  {
    id: 12,
    nome: "Cotação/Mapeamento",
    nomeCompleto: "Cotação e Mapeamento de Preços",
    status: "pendente",
    prazoPrevisao: "10 dias úteis",
    responsavel: "Esp. Julia Rodrigues",
    cargo: "Especialista em Compras",
    gerencia: "Gerência de Compras"
  },
  {
    id: 13,
    nome: "Análise da Cotação",
    nomeCompleto: "Análise Técnica da Cotação de Preços",
    status: "pendente",
    prazoPrevisao: "5 dias úteis",
    responsavel: "Cont. Thiago Mendes",
    cargo: "Contador Chefe",
    gerencia: "Gerência Financeira"
  },
  {
    id: 14,
    nome: "Validação Final",
    nomeCompleto: "Validação Final do Processo",
    status: "pendente",
    prazoPrevisao: "3 dias úteis",
    responsavel: "Dir. Geral Eduardo Lima",
    cargo: "Diretor Geral",
    gerencia: "Diretoria Geral"
  },
  {
    id: 15,
    nome: "Elaboração do Edital",
    nomeCompleto: "Elaboração do Edital de Licitação",
    status: "pendente",
    prazoPrevisao: "20 dias úteis",
    responsavel: "Adv. Camila Ferreira",
    cargo: "Advogada Senior",
    gerencia: "Gerência Jurídica"
  },
  {
    id: 16,
    nome: "Aprovação Jurídica",
    nomeCompleto: "Aprovação Jurídica do Edital",
    status: "pendente",
    prazoPrevisao: "10 dias úteis",
    responsavel: "Adv. Ricardo Gomes",
    cargo: "Assessor Jurídico Chefe",
    gerencia: "Assessoria Jurídica"
  },
  {
    id: 17,
    nome: "Publicação",
    nomeCompleto: "Publicação do Edital",
    status: "pendente",
    prazoPrevisao: "1 dia útil",
    responsavel: "Jorn. Sandra Nunes",
    cargo: "Jornalista Responsável",
    gerencia: "Gerência de Comunicação"
  }
];

export default function FluxoProcessoCompleto({ etapas = etapasPadrao, onEtapaClick }: FluxoProcessoCompletoProps) {
  const [modalEtapa, setModalEtapa] = useState<Etapa | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useUser();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'concluido':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          label: 'Concluído',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'andamento':
        return {
          icon: <PlayCircle className="w-4 h-4 text-blue-600" />,
          label: 'Em Andamento',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'pendente':
        return {
          icon: (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
              <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: 'Pendente',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
      case 'atrasado':
        return {
          icon: <XCircle className="w-4 h-4 text-red-600" />,
          label: 'Atrasado',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: (
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
              <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
          label: 'Pendente',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200'
        };
    }
  };

  const getEtapaIcon = (etapaId: number) => {
    // Ícones temáticos para cada tipo de etapa
    const iconMap: { [key: number]: React.ReactNode } = {
      1: <FileText className="w-5 h-5" />, // DFD
      2: <Search className="w-5 h-5" />, // Análise
      3: <CheckCircle className="w-5 h-5" />, // Validação
      4: <PenTool className="w-5 h-5" />, // Assinatura
      5: <FileText className="w-5 h-5" />, // ETP
      6: <PenTool className="w-5 h-5" />, // Assinatura
      7: <Search className="w-5 h-5" />, // Análise
      8: <Shield className="w-5 h-5" />, // Matriz de Risco
      9: <PenTool className="w-5 h-5" />, // Assinatura
      10: <FileText className="w-5 h-5" />, // TR
      11: <PenTool className="w-5 h-5" />, // Assinatura
      12: <DollarSign className="w-5 h-5" />, // Cotação
      13: <Search className="w-5 h-5" />, // Análise
      14: <CheckCircle className="w-5 h-5" />, // Validação
      15: <FileText className="w-5 h-5" />, // Edital
      16: <Scale className="w-5 h-5" />, // Aprovação Jurídica
      17: <Upload className="w-5 h-5" /> // Publicação
    };
    return iconMap[etapaId] || <FileText className="w-5 h-5" />;
  };

  const handleEtapaClick = (etapa: Etapa) => {
    setModalEtapa(etapa);
    setIsModalOpen(true);
    onEtapaClick?.(etapa);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalEtapa(null);
  };

  const canManageEtapa = (etapa: Etapa) => {
    // Qualquer pessoa da gerência responsável pode gerenciar a etapa
    return etapa.status === 'andamento' && user?.gerencia === etapa.gerencia;
  };

  const handleVisualizarDocumento = (etapa: Etapa) => {
    if (etapa.documentoUrl) {
      window.open(etapa.documentoUrl, '_blank');
    }
  };

  const handleBaixarDocumento = (etapa: Etapa) => {
    if (etapa.documentoUrl) {
      const link = document.createElement('a');
      link.href = etapa.documentoUrl;
      link.download = etapa.documento || 'documento';
      link.click();
    }
  };

  return (
    <div className="w-full">
      {/* Container do Fluxo Horizontal */}
      <div className="overflow-x-auto scroll-smooth">
        <div className="flex gap-4 p-4 min-w-max md:grid md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] md:min-w-0 w-full">
          {/* Título integrado */}
          <div className="flex-shrink-0 md:col-span-full md:mb-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Fluxo Completo do Processo</h2>
              <p className="text-gray-600">Acompanhe todas as etapas do planejamento de contratação</p>
            </div>
          </div>
          
          {/* Linha de progresso visual */}
          <div className="flex-shrink-0 md:col-span-full mb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(etapas.filter(e => e.status === 'concluido').length / etapas.length) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {etapas.filter(e => e.status === 'concluido').length} de {etapas.length} etapas concluídas
              </span>
            </div>
          </div>
          {etapas.map((etapa, index) => {
            const statusConfig = getStatusConfig(etapa.status);
            const isExpanded = false; // Modal substitui a expansão inline
            const canManage = canManageEtapa(etapa);
            
            return (
              <div key={etapa.id} className={`flex-shrink-0 md:flex-shrink ${isExpanded ? 'md:col-span-full' : ''}`}>
                {/* Card da Etapa */}
                <motion.div
                  className={`border-2 rounded-xl transition-all duration-300 ${statusConfig.bgColor} ${statusConfig.borderColor} hover:shadow-md bg-white relative w-full ${
                    etapa.status === 'concluido' ? 'ring-2 ring-green-200 shadow-lg' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Indicador de etapa concluída */}
                  {etapa.status === 'concluido' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  {/* Indicador de etapa pendente */}
                  {etapa.status === 'pendente' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                      </svg>
                    </div>
                  )}
                  
                  {/* Indicador de etapa em andamento */}
                  {etapa.status === 'andamento' && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <PlayCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  {/* Header do Card */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                                          {/* Número da Etapa */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      etapa.status === 'concluido' 
                        ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    }`}>
                      {etapa.id}
                    </div>
                      
                      {/* Status Icon */}
                                              <div className="flex items-center gap-1">
                          {statusConfig.icon}
                        </div>
                    </div>

                    {/* Ícone Temático */}
                    <div className="flex justify-center mb-3 text-gray-600">
                      {getEtapaIcon(etapa.id)}
                    </div>

                                         {/* Nome da Etapa */}
                     <h3 className={`font-semibold text-center text-sm mb-2 leading-tight ${
                       etapa.status === 'concluido' ? 'text-green-800 font-bold' : 'text-gray-900'
                     }`}>
                       {etapa.nome}
                     </h3>

                                         {/* Gerência Responsável */}
                     <p className="text-xs text-gray-600 text-center mb-2">
                       {etapa.gerencia}
                     </p>
                     
                     {/* Prazo */}
                     <div className="flex items-center justify-center gap-1 mb-3">
                       <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <circle cx="12" cy="12" r="10" strokeWidth="1.5"/>
                         <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                       </svg>
                       <span className="text-xs text-gray-700 font-medium">
                         {etapa.prazoPrevisao}
                       </span>
                     </div>

                    {/* Status Badge */}
                    <div className="flex justify-center mb-3">
                      <Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} border text-xs px-2 py-1 ${
                        etapa.status === 'concluido' ? 'ring-1 ring-green-300 font-semibold' : ''
                      }`}>
                        {statusConfig.label}
                        {etapa.status === 'concluido' && (
                          <span className="ml-1">✅</span>
                        )}
                      </Badge>
                    </div>

                    {/* Botão de Ação */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEtapaClick(etapa)}
                      className="w-full text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Detalhes da Etapa */}
      <EtapaDetalhesModal
        etapa={modalEtapa}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConcluirEtapa={(etapa) => {
          console.log('Concluir etapa:', etapa.id);
          // Implementar lógica de conclusão
        }}
        onEditarEtapa={(etapa) => {
          console.log('Editar etapa:', etapa.id);
          // Implementar lógica de edição
        }}
        onExcluirEtapa={(etapa) => {
          console.log('Excluir etapa:', etapa.id);
          // Implementar lógica de exclusão
        }}
        onSubstituirDocumento={(etapa) => {
          console.log('Substituir documento da etapa:', etapa.id);
          // Implementar lógica de substituição
        }}
        onVisualizarDocumento={handleVisualizarDocumento}
        onBaixarDocumento={handleBaixarDocumento}
        onAdicionarMembro={(etapa, membro) => {
          console.log('Adicionar membro à etapa:', etapa.id, membro);
          // Implementar lógica de adicionar membro
        }}
        onRemoverMembro={(etapa, membroId) => {
          console.log('Remover membro da etapa:', etapa.id, membroId);
          // Implementar lógica de remover membro
        }}
        onSalvarObservacao={(etapa, observacao) => {
          console.log('Salvar observação na etapa:', etapa.id, observacao);
          // Implementar lógica de salvar observação
        }}
      />
    </div>
  );
} 