import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Save, 
  Send, 
  Clock, 
  User, 
  Calendar,
  DollarSign,
  Shield,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  AtSign,
  File,
  FileSpreadsheet,
  FileImage,
  Archive,
  Eye,
  Edit3,
  Plus,
  X,
  Building2,
  Target,
  TrendingUp,
  AlertCircle,
  Info,
  Settings
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { toast } from "@/components/ui/use-toast";
import CommentsSection from './CommentsSection';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';

// Interfaces
interface ETPElaboracaoSectionProps {
  processoId: string;
  etapaId: string;
  onComplete: (data: ETPData) => void;
  onSave: (data: ETPData) => void;
  initialData?: ETPData;
  canEdit?: boolean;
  gerenciaCriadora?: string;
}

interface ETPData {
  status: 'rascunho' | 'finalizado';
  dadosGerais: {
    objetoEstudo: string;
    justificativaContratacao: string;
    beneficiosEsperados: string;
  };
  requisitosTecnicos: {
    especificacoes: string;
    funcionalidades: string;
    anexosTecnicos: Anexo[];
  };
  estimativasCustos: {
    valorEstimado: string;
    metodologiaEstimativa: string;
    justificativaFontes: string;
  };
  analiseRiscos: {
    riscosIdentificados: string;
    estrategiasMitigacao: string;
  };
  cronograma: {
    prazoDiasUteis: number;
    regime: 'ordinario' | 'urgencia';
    sla: number;
  };
  comentarios: Comentario[];
  dataCriacao: string;
  autor: string;
  tempoPermanencia: number;
}

interface Anexo {
  id: string;
  nome: string;
  tipo: string;
  tamanho: string;
  autor: string;
  dataUpload: string;
  url: string;
}

interface Comentario {
  id: string;
  autor: string;
  avatar: string;
  data: string;
  texto: string;
  marcacoes: string[];
}

// Mock de dados iniciais
const mockETPData: ETPData = {
  status: 'rascunho',
  dadosGerais: {
    objetoEstudo: '',
    justificativaContratacao: '',
    beneficiosEsperados: ''
  },
  requisitosTecnicos: {
    especificacoes: '',
    funcionalidades: '',
    anexosTecnicos: []
  },
  estimativasCustos: {
    valorEstimado: '',
    metodologiaEstimativa: '',
    justificativaFontes: ''
  },
  analiseRiscos: {
    riscosIdentificados: '',
    estrategiasMitigacao: ''
  },
  cronograma: {
    prazoDiasUteis: 5,
    regime: 'ordinario',
    sla: 5
  },
  comentarios: [
    {
      id: '1',
      autor: 'Yasmin Pissolati Mattos Bretz',
      avatar: 'YP',
      data: '16/01/2025 09:30',
      texto: 'Iniciando elaboração do ETP conforme demanda aprovada.',
      marcacoes: []
    }
  ],
  dataCriacao: '16/01/2025',
  autor: 'Yasmin Pissolati Mattos Bretz',
  tempoPermanencia: 1
};

// Mock de anexos
const mockAnexos: Anexo[] = [
  {
    id: '1',
    nome: 'Especificações_Técnicas_v1.pdf',
    tipo: 'PDF',
    tamanho: '2.5 MB',
    autor: 'Yasmin Pissolati Mattos Bretz',
    dataUpload: '16/01/2025',
    url: '/docs/especificacoes.pdf'
  },
  {
    id: '2',
    nome: 'Análise_de_Custos.xlsx',
    tipo: 'Excel',
    tamanho: '1.8 MB',
    autor: 'Yasmin Pissolati Mattos Bretz',
    dataUpload: '16/01/2025',
    url: '/docs/analise_custos.xlsx'
  }
];

// Mock de usuários para marcação
const mockUsuarios = [
  { id: '1', nome: 'Yasmin Pissolati Mattos Bretz', gerencia: 'GSP' },
  { id: '2', nome: 'Guilherme de Carvalho Silva', gerencia: 'GSL' },
  { id: '3', nome: 'Diran Rodrigues de Souza Filho', gerencia: 'SE' },
  { id: '4', nome: 'Leticia Bonfim Guilherme', gerencia: 'GLC' },
  { id: '5', nome: 'Dallas Kelson Francisco de Souza', gerencia: 'GFC' }
];

export default function ETPElaboracaoSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true,
  gerenciaCriadora
}: ETPElaboracaoSectionProps) {
  const { user } = useUser();
  const [etpData, setEtpData] = useState<ETPData>(initialData || mockETPData);
  const [anexos, setAnexos] = useState<Anexo[]>(mockAnexos);
  const [novoComentario, setNovoComentario] = useState('');
  const [marcacoes, setMarcacoes] = useState<string[]>([]);

  // Verificar permissões
  const isGSP = user?.gerencia?.includes('GSP') || user?.gerencia?.includes('Gerência de Soluções e Projetos');
  const podeEditar = canEdit && isGSP && etpData.status === 'rascunho';
  const podeExcluir = isGSP && etpData.status === 'rascunho';

  // Função para formatar moeda
  const formatarMoeda = (valor: string) => {
    if (!valor) return '';
    const numero = valor.replace(/\D/g, '');
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(numero) / 100);
  };

  // Função para obter ícone do tipo de arquivo
  const getFileIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'excel': return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'word': return <File className="w-4 h-4 text-blue-500" />;
      case 'image': return <FileImage className="w-4 h-4 text-purple-500" />;
      default: return <Archive className="w-4 h-4 text-gray-500" />;
    }
  };

  // Função para obter badge de SLA
  const getSLABadge = (sla: number, prazo: number) => {
    const diasRestantes = sla - prazo;
    if (diasRestantes > 2) {
      return <Badge className="bg-green-100 text-green-800">Dentro do Prazo</Badge>;
    } else if (diasRestantes > 0) {
      return <Badge className="bg-yellow-100 text-yellow-800">Próximo do Vencimento</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Prazo Estourado</Badge>;
    }
  };

  // Função para obter cor do SLA
  const getSLAColor = (sla: number, prazo: number) => {
    const diasRestantes = sla - prazo;
    if (diasRestantes > 2) {
      return '#10b981'; // verde
    } else if (diasRestantes > 0) {
      return '#f59e0b'; // amarelo
    } else {
      return '#ef4444'; // vermelho
    }
  };

  // Função para obter texto do SLA
  const getSLAText = (sla: number, prazo: number) => {
    const diasRestantes = sla - prazo;
    if (diasRestantes > 2) {
      return 'Dentro do Prazo';
    } else if (diasRestantes > 0) {
      return 'Próximo do Vencimento';
    } else {
      return 'Prazo Estourado';
    }
  };

  // Função para salvar rascunho
  const salvarRascunho = () => {
    const dadosAtualizados: ETPData = {
      ...etpData,
      status: 'rascunho' as const,
      tempoPermanencia: etpData.tempoPermanencia + 1
    };
    setEtpData(dadosAtualizados);
    onSave(dadosAtualizados);
    
    toast({
      title: "Rascunho Salvo",
      description: "O ETP foi salvo como rascunho com sucesso."
    });
  };

  // Função para enviar para assinatura
  const enviarParaAssinatura = () => {
    // Validação de documentos obrigatórios
    if (anexos.length === 0) {
      toast({
        title: "Documento Obrigatório",
        description: "Faça upload do documento ETP antes de enviar para assinatura.",
        variant: "destructive"
      });
      return;
    }

    const dadosFinalizados: ETPData = {
      ...etpData,
      status: 'finalizado' as const,
      tempoPermanencia: etpData.tempoPermanencia + 1
    };
    setEtpData(dadosFinalizados);
    onComplete(dadosFinalizados);
    
    toast({
      title: "ETP Enviado para Assinatura",
      description: "O ETP foi finalizado e enviado para o próximo card."
    });
  };

  // Função para excluir rascunho
  const excluirRascunho = () => {
    setEtpData(mockETPData);
    setAnexos([]);
    
    toast({
      title: "Rascunho Excluído",
      description: "O rascunho do ETP foi excluído com sucesso."
    });
  };

  // Função para adicionar comentário
  const adicionarComentario = () => {
    if (!novoComentario.trim()) return;

    const comentario: Comentario = {
      id: Date.now().toString(),
      autor: user?.nome || 'Usuário',
      avatar: user?.nome?.substring(0, 2).toUpperCase() || 'US',
      data: formatDateTimeBR(new Date()),
      texto: novoComentario,
      marcacoes
    };

    setEtpData({
      ...etpData,
      comentarios: [...etpData.comentarios, comentario]
    });
    setNovoComentario('');
    setMarcacoes([]);
  };

  // Função para upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const novoAnexo: Anexo = {
      id: Date.now().toString(),
      nome: file.name,
      tipo: file.name.split('.').pop()?.toUpperCase() || 'PDF',
      tamanho: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      autor: user?.nome || 'Usuário',
      dataUpload: formatDateBR(new Date()),
      url: URL.createObjectURL(file)
    };

    setAnexos([...anexos, novoAnexo]);
    setEtpData({
      ...etpData,
      requisitosTecnicos: {
        ...etpData.requisitosTecnicos,
        anexosTecnicos: [...anexos, novoAnexo]
      }
    });
  };

  // Função para remover anexo
  const removerAnexo = (anexoId: string) => {
    const anexosAtualizados = anexos.filter(a => a.id !== anexoId);
    setAnexos(anexosAtualizados);
    setEtpData({
      ...etpData,
      requisitosTecnicos: {
        ...etpData.requisitosTecnicos,
        anexosTecnicos: anexosAtualizados
      }
    });
  };

  // Função para visualizar documento
  const visualizarDocumento = (anexo: Anexo) => {
    // Em um ambiente real, isso abriria o documento em uma nova aba ou modal
    window.open(anexo.url, '_blank');
    
    toast({
      title: "Visualizando Documento",
      description: `Abrindo ${anexo.nome} em nova aba.`
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Container central ocupando toda a área */}
      <div className="w-full px-2">
        {/* Grid principal 12 colunas */}
        <div className="grid grid-cols-12 gap-4">
          
                     {/* ESQUERDA: Upload e Visualização do ETP */}
           <section className="col-span-12 lg:col-span-8 w-full">
             <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
               <header className="bg-indigo-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                 <div className="flex items-center gap-3">
                   <FileText className="w-5 h-5 text-indigo-600" />
                   Documento do ETP
                 </div>
               </header>
               <div className="p-4 md:p-6 space-y-0">
                 
                 {/* Área de Upload */}
                 <div className="w-full p-4 border-b border-gray-100">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                     <Upload className="w-5 h-5 text-indigo-600" />
                     Upload do Documento ETP
                   </h3>
                   
                   {podeEditar && (
                     <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                       <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                       <Label htmlFor="etp-upload" className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                         Clique para fazer upload do documento ETP
                       </Label>
                       <Input
                         id="etp-upload"
                         type="file"
                         className="hidden"
                         onChange={handleFileUpload}
                         accept=".pdf,.doc,.docx,.xls,.xlsx"
                       />
                     </div>
                   )}
                 </div>

                                   {/* Documento Atual */}
                  <div className="w-full p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Documento ETP
                    </h3>
                    
                    {anexos.length > 0 ? (
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getFileIcon(anexos[0].tipo)}
                          <div>
                            <p className="font-medium text-sm">{anexos[0].nome}</p>
                            <p className="text-xs text-gray-500">
                              {anexos[0].tamanho} • {anexos[0].autor} • {anexos[0].dataUpload}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" onClick={() => visualizarDocumento(anexos[0])}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                          </Button>
                          {podeEditar && (
                            <>
                              <Button size="sm" variant="ghost">
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => removerAnexo(anexos[0].id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Nenhum documento enviado</p>
                        <p className="text-sm">Faça upload do documento ETP para começar</p>
                      </div>
                    )}
                  </div>

                 {/* Visualização do Documento */}
                 {anexos.length > 0 && (
                   <div className="w-full p-4">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                       <Eye className="w-5 h-5 text-indigo-600" />
                       Visualização do Documento
                     </h3>
                     
                     <div className="border border-gray-200 rounded-lg overflow-hidden">
                       <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                         <div className="flex items-center justify-between">
                           <span className="text-sm font-medium text-gray-700">
                             {anexos[0]?.nome}
                           </span>
                           <div className="flex items-center gap-2">
                             <Badge variant="outline" className="text-xs">
                               {anexos[0]?.tipo}
                             </Badge>
                             <span className="text-xs text-gray-500">
                               {anexos[0]?.tamanho}
                             </span>
                           </div>
                         </div>
                       </div>
                       <div className="h-96 bg-white flex items-center justify-center">
                         <div className="text-center">
                           <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                           <p className="text-gray-500">Preview do documento</p>
                           <p className="text-sm text-gray-400">Clique em "Visualizar" para abrir o documento</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           </section>

                                           {/* DIREITA: Gerenciamento */}
            <aside className="col-span-12 lg:col-span-4 w-full flex flex-col">
             <div className="rounded-2xl border shadow-sm overflow-hidden bg-white flex-1 flex flex-col">
               <header className="bg-purple-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                 <div className="flex items-center gap-3">
                   <Settings className="w-5 h-5 text-purple-600" />
                   Gerenciamento
                 </div>
               </header>
               <div className="p-4 md:p-6 space-y-0 flex-1 flex flex-col">
                  
                  {/* Resumo do ETP */}
                  <div className="w-full p-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">Resumo do ETP</h4>
                    
                    <div className="space-y-3">
                      {/* Autor */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Autor</p>
                          <p className="text-sm font-medium">{etpData.autor}</p>
                        </div>
                      </div>

                      {/* Data de Criação */}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Data de Criação</p>
                          <p className="text-sm font-medium">{formatDateBR(etpData.dataCriacao)}</p>
                        </div>
                      </div>

                      {/* Prazo */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Prazo</p>
                          <p className="text-sm font-medium">
                            {etpData.cronograma.regime === 'urgencia' ? '3 dias úteis' : '5 dias úteis'}
                          </p>
                        </div>
                      </div>

                      {/* Regime de Tramitação */}
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Regime de Tramitação</p>
                          <Badge className={`text-xs mt-1 ${
                            etpData.cronograma.regime === 'urgencia' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {etpData.cronograma.regime === 'urgencia' ? 'Urgência' : 'Ordinário'}
                          </Badge>
                        </div>
                      </div>

                      {/* Indicador Visual de Prazo */}
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{
                          backgroundColor: getSLAColor(etpData.cronograma.sla, etpData.tempoPermanencia)
                        }}></div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">Status do Prazo</p>
                          <p className="text-sm font-medium">
                            {getSLAText(etpData.cronograma.sla, etpData.tempoPermanencia)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  
               </div>
             </div>
           </aside>
        </div>

                 {/* Comentários (full-width) */}
         <section className="mt-4">
          <CommentsSection
            processoId={processoId}
            etapaId={etapaId}
            cardId="comentarios-etp"
            title="Comentários"
          />
        </section>

                 {/* Rodapé com Botões de Ação */}
         <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
              
              {/* Lado esquerdo - Status e informações */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    1 dia no card
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {etpData.autor}
                  </span>
                </div>
              </div>

              {/* Lado direito - Botões de ação */}
              <div className="flex items-center gap-2">
                {podeExcluir && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Rascunho
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza de que deseja excluir o rascunho do ETP? 
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={excluirRascunho}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {podeEditar && (
                  <>
                    <Button
                      variant="outline"
                      onClick={salvarRascunho}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Salvar Rascunho
                    </Button>
                    
                    <Button
                      onClick={enviarParaAssinatura}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4" />
                      Enviar para Assinatura
                    </Button>
                  </>
                )}

                {!podeEditar && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Info className="w-4 h-4" />
                    Somente visualização
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
