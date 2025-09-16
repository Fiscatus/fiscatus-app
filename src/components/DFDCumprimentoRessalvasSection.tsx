import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  History,
  Upload,
  Plus,
  Download,
  Trash2,
  Save,
  MessageCircle,
  User,
  Calendar,
  Building2,
  Edit3,
  Lock,
  Unlock,
  XCircle as XCircleIcon,
  Clock,
  Search,
  Info,
  Send,
  File,
  CalendarDays,
  Users,
  CheckSquare,
  Square,
  Settings,
  Scale,
  Gavel,
  Shield,
  FileEdit,
  FileCheck,
  RotateCcw
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import TextareaWithMentions from './TextareaWithMentions';
import CommentsSection from './CommentsSection';
import { useDFD, DFDData, DFDVersion, DFDVersionStatus, DFDAnnex } from '@/hooks/useDFD';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';

// Tipos para o sistema de cumprimento de ressalvas
type StatusRessalva = 'PENDENTE' | 'EM_CORRECAO' | 'CORRIGIDA' | 'FINALIZADA';

interface Ressalva {
  id: string;
  descricao: string;
  emitidaPor: string;
  emitidaEm: string;
  status: StatusRessalva;
  resposta?: string;
  respondidaEm?: string;
  respondidaPor?: string;
}

interface VersaoDocumento {
  id: string;
  numeroVersao: number;
  tipo: 'editavel' | 'final';
  status: 'rascunho' | 'enviada' | 'aprovada' | 'reprovada';
  autorId: string;
  criadoEm: string;
  enviadoEm?: string;
  aprovadoEm?: string;
  documento?: { nome: string; url: string; mimeType: string };
  justificativa?: string;
}

interface InteracaoCorrecao {
  id: string;
  setor: string;
  responsavel: string;
  dataHora: string;
  acao: 'salvou' | 'enviou_versao' | 'finalizou';
  versao?: number;
  justificativa?: string;
}

interface GerenciaParticipante {
  id: string;
  nome: string;
  gerencia: string;
  concluiu: boolean;
  dataConclusao?: string;
  observacoes?: string;
}

interface DFDCumprimentoRessalvasSectionProps {
  processoId: string;
  etapaId: number;
  onComplete: (data: DFDData) => void;
  onSave: (data: DFDData) => void;
  initialData?: DFDData;
  canEdit?: boolean;
}

export default function DFDCumprimentoRessalvasSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true
}: DFDCumprimentoRessalvasSectionProps) {
  const { user } = useUser();
  const { podeEditarCard, isNAJ } = usePermissoes();
  const { toast } = useToast();
  const { 
    dfdData, 
    addAnnex, 
    removeAnnex, 
    updateObservations
  } = useDFD(processoId);
  
  // Estados principais
  const [respostasRessalvas, setRespostasRessalvas] = useState<{ [key: string]: string }>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showEnviarFinalDialog, setShowEnviarFinalDialog] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [activeTab, setActiveTab] = useState('gerencias');
  const [diasNoCard, setDiasNoCard] = useState(0);
  const [responsavelAtual, setResponsavelAtual] = useState('');
  const [versaoFinalEnviada, setVersaoFinalEnviada] = useState(false);
  
  // Estados para documentos
  const [documentoEditavel, setDocumentoEditavel] = useState<{ name: string; size: string; uploadedAt: string; uploadedBy: string } | null>(null);
  const [versaoFinal, setVersaoFinal] = useState<{ name: string; size: string; uploadedAt: string; uploadedBy: string } | null>(null);
  const [interacoes, setInteracoes] = useState<InteracaoCorrecao[]>([]);
  
  // Estados para controle de gerências participantes
  const [gerenciasParticipantes, setGerenciasParticipantes] = useState<GerenciaParticipante[]>([
    {
      id: '1',
      nome: 'Yasmin Pissolati Mattos Bretz',
      gerencia: 'GSP - Gerência de Soluções e Projetos',
      concluiu: false
    },
    {
      id: '2',
      nome: 'Leticia Bonfim Guilherme',
      gerencia: 'GLC - Gerência de Licitações e Contratos',
      concluiu: false
    },
    {
      id: '3',
      nome: 'Guilherme de Carvalho Silva',
      gerencia: 'GSL - Gerência de Suprimentos e Logística',
      concluiu: false
    }
  ]);
  
  // Estado para responsável pelas correções
  const [responsavelCorrecoes, setResponsavelCorrecoes] = useState<string>('');
  
  // Mock das ressalvas emitidas pela NAJ
  const [ressalvas] = useState<Ressalva[]>([
    {
      id: '1',
      descricao: 'Incluir especificação técnica detalhada do item 3.2 do edital',
      emitidaPor: 'Gabriel Radamesis Gomes Nascimento',
      emitidaEm: '2025-01-15T10:30:00Z',
      status: 'PENDENTE'
    },
    {
      id: '2',
      descricao: 'Corrigir valor estimado do item 5.1 conforme tabela de preços vigente',
      emitidaPor: 'Gabriel Radamesis Gomes Nascimento',
      emitidaEm: '2025-01-15T10:30:00Z',
      status: 'PENDENTE'
    },
    {
      id: '3',
      descricao: 'Adicionar cláusula de garantia conforme art. 76 da Lei 14.133/2021',
      emitidaPor: 'Gabriel Radamesis Gomes Nascimento',
      emitidaEm: '2025-01-15T10:30:00Z',
      status: 'PENDENTE'
    }
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editavelFileInputRef = useRef<HTMLInputElement>(null);
  const finalFileInputRef = useRef<HTMLInputElement>(null);

  // Verificar se pode editar - setores Demandante, GSP e GLC
  const canEditCorrecoes = () => {
    if (!user) return false;
    
    const gerenciasEditaveis = [
      'GSP - Gerência de Soluções e Projetos',
      'GLC - Gerência de Licitações e Contratos',
      'GSL - Gerência de Suprimentos e Logística',
      'GRH - Gerência de Recursos Humanos',
      'GUE - Gerência de Urgência e Emergência',
      'GFC - Gerência Financeira e Contábil'
    ];
    
    return gerenciasEditaveis.includes(user.gerencia);
  };

  // Verificar se é NAJ (apenas visualização)
  const isNAJUser = () => {
    return user?.gerencia === 'NAJ - Assessoria Jurídica';
  };

  // Calcular SLA da correção
  const calcularSLA = () => {
    // Mock: usar 3 dias úteis como padrão
    const prazoMaximo = 3;
    const diasUteis = diasNoCard;
    
    if (diasUteis <= prazoMaximo) return { status: 'ok' as const, dias: diasUteis };
    if (diasUteis <= prazoMaximo + 1) return { status: 'risco' as const, dias: diasUteis };
    return { status: 'estourado' as const, dias: diasUteis };
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    // Verificar se todas as ressalvas têm resposta
    const ressalvasSemResposta = ressalvas.filter(ressalva => 
      !respostasRessalvas[ressalva.id] || !respostasRessalvas[ressalva.id].trim()
    );
    
    if (ressalvasSemResposta.length > 0) {
      errors.push('Todas as ressalvas devem ter uma resposta');
    }

    // Verificar se há versão final enviada
    if (!versaoFinal) {
      errors.push('É obrigatório enviar uma versão final em PDF');
    }

    // Verificar se foi definido responsável pelas correções
    if (!responsavelCorrecoes.trim()) {
      errors.push('É obrigatório definir quem irá cumprir as ressalvas');
    }

    // Verificar se todas as gerências participantes concluíram
    const gerenciasNaoConcluidas = gerenciasParticipantes.filter(g => !g.concluiu);
    if (gerenciasNaoConcluidas.length > 0) {
      errors.push('Todas as gerências participantes devem marcar como concluído');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSalvarAlteracoes = () => {
    // Salvar progresso sem finalizar
    const dataAtual = new Date().toISOString();
    
    // Adicionar interação
    const novaInteracao: InteracaoCorrecao = {
      id: `interacao-${Date.now()}`,
      setor: user?.gerencia || 'Setor',
      responsavel: user?.nome || 'Usuário',
      dataHora: dataAtual,
      acao: 'salvou',
      justificativa: justificativa
    };
    
    setInteracoes(prev => [...prev, novaInteracao]);
    localStorage.setItem(`interacoes-correcao-${processoId}`, JSON.stringify([...interacoes, novaInteracao]));
    
    // Salvar respostas das ressalvas
    localStorage.setItem(`respostas-ressalvas-${processoId}`, JSON.stringify(respostasRessalvas));
    
    // Salvar responsável pelas correções
    localStorage.setItem(`responsavel-correcoes-${processoId}`, responsavelCorrecoes);
    
    // Salvar status das gerências participantes
    localStorage.setItem(`gerencias-participantes-${processoId}`, JSON.stringify(gerenciasParticipantes));
    
    onSave(dfdData);
    
    toast({
      title: "Alterações Salvas",
      description: "O progresso foi salvo com sucesso. Você pode continuar editando."
    });
    
    setJustificativa('');
  };

  const handleEnviarVersaoFinal = () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todas as respostas às ressalvas e envie a versão final.",
        variant: "destructive"
      });
      return;
    }

    setShowEnviarFinalDialog(true);
  };

  const confirmarEnviarVersaoFinal = () => {
    const dataAtual = new Date().toISOString();
    
    // Marcar versão final como enviada
    setVersaoFinalEnviada(true);
    
    // Atualizar status das ressalvas
    const ressalvasAtualizadas = ressalvas.map(ressalva => ({
      ...ressalva,
      status: 'CORRIGIDA' as StatusRessalva,
      resposta: respostasRessalvas[ressalva.id],
      respondidaEm: dataAtual,
      respondidaPor: user?.nome || 'Usuário'
    }));
    
    // Adicionar interação
    const novaInteracao: InteracaoCorrecao = {
      id: `interacao-${Date.now()}`,
      setor: user?.gerencia || 'Setor',
      responsavel: user?.nome || 'Usuário',
      dataHora: dataAtual,
      acao: 'finalizou',
      versao: versaoFinal ? 1 : undefined,
      justificativa: justificativa
    };
    
    setInteracoes(prev => [...prev, novaInteracao]);
    localStorage.setItem(`interacoes-correcao-${processoId}`, JSON.stringify([...interacoes, novaInteracao]));
    
    // Salvar dados finais
    localStorage.setItem(`versao-final-enviada-${processoId}`, 'true');
    localStorage.setItem(`respostas-ressalvas-${processoId}`, JSON.stringify(respostasRessalvas));
    localStorage.setItem(`responsavel-correcoes-${processoId}`, responsavelCorrecoes);
    localStorage.setItem(`gerencias-participantes-${processoId}`, JSON.stringify(gerenciasParticipantes));
    
    onComplete(dfdData);
    
    toast({
      title: "Versão Final Enviada",
      description: "O cumprimento das ressalvas foi finalizado e enviado para nova análise."
    });
    
    setShowEnviarFinalDialog(false);
    setJustificativa('');
  };

  // Funções para upload de documentos
  const handleUploadEditavel = () => {
    editavelFileInputRef.current?.click();
  };

  const handleEditavelFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const arquivoInfo = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.nome || 'Usuário'
      };
      
      setDocumentoEditavel(arquivoInfo);
      
      // Mock: salvar no localStorage
      localStorage.setItem(`documento-editavel-${processoId}`, JSON.stringify(arquivoInfo));
      
      // Adicionar interação
      const novaInteracao: InteracaoCorrecao = {
        id: `interacao-${Date.now()}`,
        setor: user?.gerencia || 'Setor',
        responsavel: user?.nome || 'Usuário',
        dataHora: new Date().toISOString(),
        acao: 'enviou_versao',
        versao: 1
      };
      
      setInteracoes(prev => [...prev, novaInteracao]);
      
      toast({
        title: "Documento Editável enviado",
        description: `${file.name} foi enviado com sucesso.`
      });
    }
    
    // Limpar o input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleUploadVersaoFinal = () => {
    finalFileInputRef.current?.click();
  };

  const handleVersaoFinalUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const arquivoInfo = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.nome || 'Usuário'
      };
      
      setVersaoFinal(arquivoInfo);
      
      // Mock: salvar no localStorage
      localStorage.setItem(`versao-final-${processoId}`, JSON.stringify(arquivoInfo));
      
      toast({
        title: "Versão Final enviada",
        description: `${file.name} foi enviado com sucesso.`
      });
    }
    
    // Limpar o input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleBaixarDocumento = (tipo: 'editavel' | 'final') => {
    const arquivo = tipo === 'editavel' ? documentoEditavel : versaoFinal;
    
    if (!arquivo) {
      toast({
        title: "Nenhum arquivo",
        description: `Nenhum arquivo ${tipo === 'editavel' ? 'editável' : 'final'} foi enviado ainda.`,
        variant: "destructive"
      });
      return;
    }

    // Mock: simular download
    toast({
      title: "Download Iniciado",
      description: `O arquivo ${arquivo.name} está sendo baixado.`
    });
  };

  const handleExcluirDocumento = (tipo: 'editavel' | 'final') => {
    if (tipo === 'editavel') {
      setDocumentoEditavel(null);
      localStorage.removeItem(`documento-editavel-${processoId}`);
    } else {
      setVersaoFinal(null);
      localStorage.removeItem(`versao-final-${processoId}`);
    }
    
    toast({
      title: "Arquivo removido",
      description: `O arquivo ${tipo === 'editavel' ? 'editável' : 'final'} foi removido com sucesso.`
    });
  };

  // Função para marcar gerência como concluída
  const handleMarcarConcluido = (gerenciaId: string) => {
    setGerenciasParticipantes(prev => prev.map(g => 
      g.id === gerenciaId 
        ? { ...g, concluiu: true, dataConclusao: new Date().toISOString() }
        : g
    ));
    
    toast({
      title: "Gerência marcada como concluída",
      description: "Esta gerência foi marcada como concluída no cumprimento das ressalvas."
    });
  };

  // Função para desmarcar gerência como concluída
  const handleDesmarcarConcluido = (gerenciaId: string) => {
    setGerenciasParticipantes(prev => prev.map(g => 
      g.id === gerenciaId 
        ? { ...g, concluiu: false, dataConclusao: undefined }
        : g
    ));
    
    toast({
      title: "Gerência desmarcada",
      description: "Esta gerência foi desmarcada como concluída."
    });
  };

  // Função para upload de anexos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Mock: simular upload
      const newAnnex: DFDAnnex = {
        id: `anexo-${Date.now().toString()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.nome || 'Usuário',
        url: `mock-url-${Date.now().toString()}`
      };
      
      addAnnex(newAnnex);
      
      toast({
        title: "Anexo adicionado",
        description: `${file.name} foi anexado com sucesso.`,
      });
    }
    
    // Limpar o input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Carregar dados salvos
  useEffect(() => {
    // Carregar documento editável
    const editavelSalvo = localStorage.getItem(`documento-editavel-${processoId}`);
    if (editavelSalvo) {
      try {
        const arquivoData = JSON.parse(editavelSalvo);
        setDocumentoEditavel(arquivoData);
      } catch (error) {
        console.error('Erro ao carregar documento editável salvo:', error);
      }
    }

    // Carregar versão final
    const versaoFinalSalva = localStorage.getItem(`versao-final-${processoId}`);
    if (versaoFinalSalva) {
      try {
        const arquivoData = JSON.parse(versaoFinalSalva);
        setVersaoFinal(arquivoData);
      } catch (error) {
        console.error('Erro ao carregar versão final salva:', error);
      }
    }

    // Carregar respostas das ressalvas
    const respostasSalvas = localStorage.getItem(`respostas-ressalvas-${processoId}`);
    if (respostasSalvas) {
      try {
        const respostasData = JSON.parse(respostasSalvas);
        setRespostasRessalvas(respostasData);
      } catch (error) {
        console.error('Erro ao carregar respostas salvas:', error);
      }
    }

    // Carregar interações
    const interacoesSalvas = localStorage.getItem(`interacoes-correcao-${processoId}`);
    if (interacoesSalvas) {
      try {
        const interacoesData = JSON.parse(interacoesSalvas);
        setInteracoes(interacoesData);
      } catch (error) {
        console.error('Erro ao carregar interações salvas:', error);
      }
    }

    // Verificar se versão final foi enviada
    const versaoFinalEnviada = localStorage.getItem(`versao-final-enviada-${processoId}`);
    if (versaoFinalEnviada === 'true') {
      setVersaoFinalEnviada(true);
    }

    // Carregar responsável pelas correções
    const responsavelSalvo = localStorage.getItem(`responsavel-correcoes-${processoId}`);
    if (responsavelSalvo) {
      setResponsavelCorrecoes(responsavelSalvo);
    }

    // Carregar status das gerências participantes
    const gerenciasSalvas = localStorage.getItem(`gerencias-participantes-${processoId}`);
    if (gerenciasSalvas) {
      try {
        const gerenciasData = JSON.parse(gerenciasSalvas);
        setGerenciasParticipantes(gerenciasData);
      } catch (error) {
        console.error('Erro ao carregar gerências participantes salvas:', error);
      }
    }

    // Calcular dias no card (mock)
    setDiasNoCard(1);
    setResponsavelAtual(user?.nome || 'Sem responsável definido');
  }, [processoId, user?.nome]);

  // Usar as funções padronizadas do utils
  const formatDate = formatDateBR;
  const formatDateTime = formatDateTimeBR;

  const getStatusConfig = (status: StatusRessalva) => {
    switch (status) {
      case 'PENDENTE':
        return {
          label: 'Pendente',
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: <Clock className="w-3 h-3" />
        };
      case 'EM_CORRECAO':
        return {
          label: 'Em Correção',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: <Edit3 className="w-3 h-3" />
        };
      case 'CORRIGIDA':
        return {
          label: 'Corrigida',
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <CheckCircle className="w-3 h-3" />
        };
      case 'FINALIZADA':
        return {
          label: 'Finalizada',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <FileCheck className="w-3 h-3" />
        };
      default:
        return {
          label: 'Pendente',
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: <Clock className="w-3 h-3" />
        };
    }
  };

  const sla = calcularSLA();

  // Calcular progresso das gerências participantes
  const gerenciasConcluidas = gerenciasParticipantes.filter(g => g.concluiu).length;
  const totalGerencias = gerenciasParticipantes.length;
  const progressoGerencias = totalGerencias > 0 ? (gerenciasConcluidas / totalGerencias) * 100 : 0;

  return (
    <div className="bg-white">
      {/* Container central ocupando toda a área */}
      <div className="w-full px-2">
        
        {/* Grid principal 12 colunas */}
        <div className="grid grid-cols-12 gap-4">
          
          {/* ESQUERDA: Cumprimento de Ressalvas (7 colunas) */}
          <section id="cumprimento-ressalvas" className="col-span-12 lg:col-span-7 w-full">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-orange-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-lg">
                    <RotateCcw className="w-5 h-5 text-orange-600" />
                    Cumprimento de Ressalvas pós Análise Jurídica Prévia
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUploadEditavel}
                      disabled={!canEditCorrecoes() || versaoFinalEnviada}
                      className="text-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Enviar Editável
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleUploadVersaoFinal}
                      disabled={!canEditCorrecoes() || versaoFinalEnviada}
                      className="text-xs"
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Enviar Final
                    </Button>
                  </div>
                </div>
              </header>
              <div className="p-4 md:p-6">
                <div className="space-y-6">
                  
                  {/* Documento Editável */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Documento Editável (Word)
                    </Label>
                    {documentoEditavel ? (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileEdit className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">{documentoEditavel.name}</p>
                              <p className="text-xs text-blue-600">{documentoEditavel.size} • {formatDate(documentoEditavel.uploadedAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleBaixarDocumento('editavel')} className="h-6 w-6 p-0">
                              <Download className="w-3 h-3" />
                            </Button>
                            {canEditCorrecoes() && !versaoFinalEnviada && (
                              <Button size="sm" variant="outline" onClick={() => handleExcluirDocumento('editavel')} className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <FileEdit className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Nenhum documento editável enviado</p>
                        {canEditCorrecoes() && !versaoFinalEnviada && (
                          <p className="text-xs text-gray-400 mt-1">Clique em "Enviar Editável" para adicionar</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Versão Final */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Versão Final (PDF) *
                    </Label>
                    {versaoFinal ? (
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileCheck className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-sm font-medium text-green-900">{versaoFinal.name}</p>
                              <p className="text-xs text-green-600">{versaoFinal.size} • {formatDate(versaoFinal.uploadedAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleBaixarDocumento('final')} className="h-6 w-6 p-0">
                              <Download className="w-3 h-3" />
                            </Button>
                            {canEditCorrecoes() && !versaoFinalEnviada && (
                              <Button size="sm" variant="outline" onClick={() => handleExcluirDocumento('final')} className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                        <FileCheck className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Nenhuma versão final enviada</p>
                        {canEditCorrecoes() && !versaoFinalEnviada && (
                          <p className="text-xs text-gray-400 mt-1">Clique em "Enviar Final" para adicionar</p>
                        )}
                      </div>
                    )}
                  </div>



                   {/* Respostas às Ressalvas */}
                   <div>
                     <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                       Respostas às Ressalvas *
                     </Label>
                    <div className="space-y-4">
                      {ressalvas.map((ressalva) => (
                        <div key={ressalva.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                Ressalva #{ressalva.id}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {ressalva.descricao}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>Emitida por: {ressalva.emitidaPor}</span>
                                <span>•</span>
                                <span>{formatDateTime(ressalva.emitidaEm)}</span>
                              </div>
                            </div>
                            <Badge className={`text-xs ${getStatusConfig(ressalva.status).color}`}>
                              {getStatusConfig(ressalva.status).icon}
                              <span className="ml-1">{getStatusConfig(ressalva.status).label}</span>
                            </Badge>
                          </div>
                          
                          <div>
                            <Label className="text-xs font-medium text-gray-700 mb-2 block">
                              Como esta ressalva foi atendida:
                            </Label>
                            <Textarea
                              value={respostasRessalvas[ressalva.id] || ''}
                              onChange={(e) => setRespostasRessalvas(prev => ({
                                ...prev,
                                [ressalva.id]: e.target.value
                              }))}
                              placeholder="Descreva como esta ressalva foi corrigida..."
                              disabled={!canEditCorrecoes() || versaoFinalEnviada}
                              className="min-h-[80px] resize-none border-gray-200 focus:border-orange-300 focus:ring-orange-300"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {validationErrors.includes('Todas as ressalvas devem ter uma resposta') && (
                      <p className="text-red-500 text-sm mt-2">Todas as ressalvas devem ter uma resposta</p>
                    )}
                  </div>

                  {/* Responsável pelas Correções */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Responsável pelas Correções *
                    </Label>
                    <Input
                      value={responsavelCorrecoes}
                      onChange={(e) => setResponsavelCorrecoes(e.target.value)}
                      placeholder="Digite quem irá cumprir as ressalvas..."
                      disabled={!canEditCorrecoes() || versaoFinalEnviada}
                      className="border-gray-200 focus:border-orange-300 focus:ring-orange-300"
                    />
                    {validationErrors.includes('É obrigatório definir quem irá cumprir as ressalvas') && (
                      <p className="text-red-500 text-sm mt-1">É obrigatório definir quem irá cumprir as ressalvas</p>
                    )}
                  </div>

                  {/* Inputs ocultos para upload de arquivos */}
                  <input
                    ref={editavelFileInputRef}
                    type="file"
                    onChange={handleEditavelFileUpload}
                    accept=".doc,.docx"
                    className="hidden"
                  />
                  <input
                    ref={finalFileInputRef}
                    type="file"
                    onChange={handleVersaoFinalUpload}
                    accept=".pdf"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* DIREITA: Gerenciamento (5 colunas) */}
          <aside id="gerenciamento" className="col-span-12 lg:col-span-5 w-full flex flex-col">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white flex-1 flex flex-col">
              <header className="bg-purple-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Gerenciamento
                </div>
              </header>
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                                 <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                   <TabsList className="grid w-full grid-cols-3">
                     <TabsTrigger value="gerencias">Gerências</TabsTrigger>
                     <TabsTrigger value="ressalvas">Ressalvas</TabsTrigger>
                     <TabsTrigger value="interacoes">Interações</TabsTrigger>
                   </TabsList>
                  
                  <TabsContent value="gerencias" className="mt-0 p-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900">Controle de Conclusão por Gerências Participantes *</span>
                        </div>
                        <p className="text-xs text-blue-700">
                          {gerenciasConcluidas} de {totalGerencias} gerências concluíram
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        {gerenciasParticipantes.map((gerencia) => (
                          <div key={gerencia.id} className="border border-gray-200 rounded-lg p-4">
                            {/* Header com status e ações */}
                            <div className="flex items-center justify-between mb-3">
                              <Badge className={`text-xs ${
                                gerencia.concluiu 
                                  ? 'bg-green-100 text-green-800 border-green-300' 
                                  : 'bg-gray-100 text-gray-800 border-gray-300'
                              }`}>
                                {gerencia.concluiu ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Concluído
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pendente
                                  </>
                                )}
                              </Badge>
                              {canEditCorrecoes() && !versaoFinalEnviada && (
                                gerencia.concluiu ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDesmarcarConcluido(gerencia.id)}
                                    className="text-red-600 hover:text-red-700 h-6 px-2"
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleMarcarConcluido(gerencia.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white h-6 px-2"
                                  >
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Concluir
                                  </Button>
                                )
                              )}
                            </div>
                            
                            {/* Informações da gerência com mais espaço */}
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                                {gerencia.gerencia}
                              </h4>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                {gerencia.nome}
                              </p>
                              {gerencia.concluiu && gerencia.dataConclusao && (
                                <p className="text-xs text-green-600 mt-2">
                                  Concluído em: {formatDateTime(gerencia.dataConclusao)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Barra de Progresso Compacta */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Progresso</span>
                          <span className="text-xs text-gray-500">{Math.round(progressoGerencias)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progressoGerencias}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {validationErrors.includes('Todas as gerências participantes devem marcar como concluído') && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-600">Todas as gerências participantes devem marcar como concluído</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="ressalvas" className="mt-0 p-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-900">Resumo das Ressalvas</span>
                        </div>
                        <p className="text-xs text-orange-700">
                          {ressalvas.length} ressalvas emitidas pela NAJ em {formatDate(ressalvas[0]?.emitidaEm || '')}
                        </p>
                      </div>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {ressalvas.map((ressalva) => (
                          <div key={ressalva.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge className={`text-xs ${getStatusConfig(ressalva.status).color}`}>
                                {getStatusConfig(ressalva.status).icon}
                                <span className="ml-1">{getStatusConfig(ressalva.status).label}</span>
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {ressalva.descricao}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="interacoes" className="mt-0 p-4">
                    {interacoes.length === 0 ? (
                      <div className="text-center py-8 w-full">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <History className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Nenhuma interação registrada</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {interacoes.map((interacao) => (
                          <div key={interacao.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {interacao.acao === 'salvou' && <Save className="w-3 h-3 text-blue-600" />}
                                {interacao.acao === 'enviou_versao' && <Upload className="w-3 h-3 text-green-600" />}
                                {interacao.acao === 'finalizou' && <CheckCircle className="w-3 h-3 text-green-600" />}
                                <span className="text-xs font-medium text-gray-700">
                                  {interacao.acao === 'salvou' && 'Salvou alterações'}
                                  {interacao.acao === 'enviou_versao' && 'Enviou versão'}
                                  {interacao.acao === 'finalizou' && 'Finalizou correções'}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p><strong>Setor:</strong> {interacao.setor}</p>
                              <p><strong>Responsável:</strong> {interacao.responsavel}</p>
                              <p><strong>Data:</strong> {formatDateTime(interacao.dataHora)}</p>
                              {interacao.versao && (
                                <p><strong>Versão:</strong> {interacao.versao}</p>
                              )}
                              {interacao.justificativa && (
                                <p><strong>Justificativa:</strong> {interacao.justificativa}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </aside>

          {/* FULL: Comentários */}
          <section id="comentarios" className="col-span-12 w-full">
            <div className="rounded-2xl border border-slate-300 shadow-md bg-white p-6">
              <CommentsSection
                processoId={processoId}
                etapaId={etapaId.toString()}
                cardId="comentarios-cumprimento-ressalvas"
                title="Comentários"
              />
            </div>
          </section>

          {/* FULL: Ações (rodapé não fixo) */}
          {canEditCorrecoes() && !versaoFinalEnviada && (
            <section id="acoes" className="col-span-12 w-full mt-6 pb-6">
              {/* Rodapé com Botões de Ação */}
              <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                    
                    {/* Lado esquerdo - Status e informações */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {diasNoCard} dias no card
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {responsavelAtual}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${
                          sla.status === 'ok' ? 'bg-green-100 text-green-800' :
                          sla.status === 'risco' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {sla.status === 'ok' ? 'Dentro do Prazo' :
                           sla.status === 'risco' ? 'Em Risco' :
                           'Prazo Estourado'}
                        </Badge>
                      </div>
                    </div>

                    {/* Lado direito - Botões de ação */}
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={handleSalvarAlteracoes}
                        variant="outline" 
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </Button>
                      <Button 
                        onClick={handleEnviarVersaoFinal}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 shadow-lg"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Versão Final Corrigida
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Status Finalizado */}
          {versaoFinalEnviada && (
            <section id="status-finalizado" className="col-span-12 w-full mt-6 pb-6">
              <Card className="w-full shadow-lg border-0 bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div className="text-center">
                      <h3 className="font-semibold text-green-900">Correções Finalizadas</h3>
                      <p className="text-sm text-green-700">
                        O cumprimento das ressalvas foi concluído e enviado para nova análise da NAJ.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>

      {/* Dialog de Confirmação - Enviar Versão Final */}
      <Dialog open={showEnviarFinalDialog} onOpenChange={setShowEnviarFinalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-green-600" />
              Confirmar Envio da Versão Final
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja enviar a versão final corrigida? Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Finalizar o cumprimento das ressalvas</li>
                <li>Bloquear edições futuras</li>
                <li>Encaminhar para nova análise da NAJ</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="justificativa-final" className="text-sm font-medium">
                Justificativa (opcional)
              </Label>
              <Textarea
                id="justificativa-final"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Adicione uma justificativa para o envio..."
                className="min-h-[100px] mt-2 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowEnviarFinalDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarEnviarVersaoFinal} className="bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4 mr-2" />
              Confirmar Envio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
