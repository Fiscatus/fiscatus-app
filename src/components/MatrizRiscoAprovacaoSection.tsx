import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  History,
  Upload,
  Download,
  Trash2,
  Clock,
  Search,
  Settings,
  User
} from 'lucide-react';
import CommentsSection from './CommentsSection';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { formatDateBR } from '@/lib/utils';

type MatrizVersionStatus = 'rascunho' | 'enviada' | 'aprovada' | 'reprovada';

interface MatrizVersion {
  id: string;
  version: number;
  isFinal: boolean;
  status: MatrizVersionStatus;
  createdAt: string;
  createdBy: string;
  createdByCargo?: string;
  createdByGerencia?: string;
  createdByEmail?: string;
  prazoInicialDiasUteis?: number;
  prazoCumpridoDiasUteis?: number;
  aprovadoData?: string;
}

interface MatrizDocumentoInfo {
  name: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface MatrizRiscoAprovacaoSectionProps {
  processoId: string;
  etapaId: number;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
  initialData?: any;
  canEdit?: boolean;
}

export default function MatrizRiscoAprovacaoSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true
}: MatrizRiscoAprovacaoSectionProps) {
  const { user } = useUser();
  const { toast } = useToast();

  const [justificativa, setJustificativa] = useState('');
  const [dataAnalise, setDataAnalise] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showAprovarDialog, setShowAprovarDialog] = useState(false);
  const [showReprovarDialog, setShowReprovarDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('versoes');
  const [attachmentsSort, setAttachmentsSort] = useState<'desc' | 'asc'>('desc');
  const anexosOrdenados = useMemo(() => {
    const arr = [...annexes];
    arr.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    if (attachmentsSort === 'asc') arr.reverse();
    return arr;
  }, [annexes, attachmentsSort]);
  const [matrizArquivo, setMatrizArquivo] = useState<MatrizDocumentoInfo | null>(null);
  const [matrizExiste, setMatrizExiste] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [annexes, setAnnexes] = useState<{ id: string; name: string; size: string; uploadedAt: string }[]>([]);

  // Mock de versões (somente leitura)
  const [versions, setVersions] = useState<MatrizVersion[]>([
    {
      id: 'v1',
      version: 1,
      isFinal: false,
      status: 'aprovada',
      createdAt: '2025-01-10T09:00:00Z',
      createdBy: 'Ana Carolina Silva',
      createdByCargo: 'Analista de Riscos',
      createdByGerencia: 'GSP - Gerência de Soluções e Projetos',
      createdByEmail: 'ana.silva@hospital.gov.br',
      prazoInicialDiasUteis: 7,
      prazoCumpridoDiasUteis: 2,
      aprovadoData: '2025-01-12T15:00:00Z'
    },
    {
      id: 'v2',
      version: 2,
      isFinal: true,
      status: 'enviada',
      createdAt: '2025-01-15T14:30:00Z',
      createdBy: 'Ana Carolina Silva',
      createdByCargo: 'Analista de Riscos',
      createdByGerencia: 'GSP - Gerência de Soluções e Projetos',
      createdByEmail: 'ana.silva@hospital.gov.br',
      prazoInicialDiasUteis: 7,
      prazoCumpridoDiasUteis: 3
    }
  ]);

  // Carregar documento mock
  useEffect(() => {
    const doc = {
      name: 'Matriz_Risco_V2_AnaCarolinaSilva.pdf',
      size: '1.4 MB',
      uploadedAt: '2025-01-15T14:30:00Z',
      uploadedBy: 'Ana Carolina Silva'
    } as MatrizDocumentoInfo;
    setMatrizArquivo(doc);
    setMatrizExiste(true);
  }, []);

  const validar = () => {
    const errs: string[] = [];
    if (!justificativa.trim()) errs.push('Justificativa é obrigatória');
    setValidationErrors(errs);
    return errs.length === 0;
  };

  const canTakeAction = canEdit; // controle de permissão externo
  const isGSPUser = () => user?.gerencia === 'GSP - Gerência de Soluções e Projetos';

  const handleAprovar = () => {
    if (!validar()) {
      toast({ title: 'Erro de Validação', description: 'Por favor, preencha a Justificativa.', variant: 'destructive' });
      return;
    }
    setShowAprovarDialog(true);
  };

  const confirmarAprovar = () => {
    const agora = new Date().toISOString();
    setDataAnalise(agora);

    // Atualizar status mock da última versão enviada
    setVersions(prev => prev.map(v => v.isFinal ? { ...v, status: 'aprovada', aprovadoData: agora } : v));

    toast({ title: 'Matriz Aprovada', description: 'A Matriz de Risco foi aprovada com sucesso.' });
    setShowAprovarDialog(false);
    onComplete(initialData || {});
  };

  const handleReprovar = () => {
    if (!validar()) {
      toast({ title: 'Erro de Validação', description: 'Por favor, preencha a Justificativa.', variant: 'destructive' });
      return;
    }
    setShowReprovarDialog(true);
  };

  const confirmarReprovar = () => {
    const agora = new Date().toISOString();
    setDataAnalise(agora);

    // Marcar última versão como reprovada
    setVersions(prev => prev.map(v => v.isFinal ? { ...v, status: 'reprovada' } : v));

    toast({ title: 'Solicitada Nova Versão', description: 'Fluxo retornado para elaboração da Matriz (Card 8).' });
    setShowReprovarDialog(false);
    onSave(initialData || {});
  };

  const handleVisualizarMatriz = () => {
    if (!matrizArquivo) {
      toast({ title: 'Nenhum documento', description: 'Nenhuma Matriz enviada.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Visualizar', description: `Abrindo ${matrizArquivo.name}...` });
  };

  const handleBaixarMatriz = () => {
    if (!matrizArquivo) {
      toast({ title: 'Nenhum documento', description: 'Nenhuma Matriz enviada.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Download Iniciado', description: `Baixando ${matrizArquivo.name}...` });
  };

  // Calcular SLA baseado em prazo inicial vs prazo cumprido
  const calcularSLA = (prazoInicial: number, prazoCumprido: number | undefined) => {
    // Se não foi enviado ainda, não há como avaliar
    if (prazoCumprido === undefined) {
      return { status: 'nao_enviado' as const, dias: 0 };
    }
    
    // Comparar prazo cumprido com prazo inicial
    if (prazoCumprido <= prazoInicial) {
      return { status: 'ok' as const, dias: prazoCumprido };
    } else if (prazoCumprido <= prazoInicial + 1) {
      return { status: 'risco' as const, dias: prazoCumprido };
    } else {
      return { status: 'nao_cumprido' as const, dias: prazoCumprido };
    }
  };

  const versaoAtual = versions.find(v => v.isFinal) || versions[versions.length - 1];
  const sla = calcularSLA(versaoAtual?.prazoInicialDiasUteis || 0, versaoAtual?.prazoCumpridoDiasUteis);

  // Status badge removido no header para ficar idêntico ao Card 2

  return (
    <div className="bg-white">
      <div className="w-full px-2">
        <div className="grid grid-cols-12 gap-4">
          {/* ESQUERDA: Visualização + Análise (8 colunas) */}
          <section id="aprovacao-matriz" className="col-span-12 lg:col-span-8 w-full">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-indigo-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-lg">
                    <Search className="w-5 h-5 text-indigo-600" />
                    Matriz de Risco
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={handleVisualizarMatriz} disabled={!matrizExiste} className="text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizar
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleBaixarMatriz} disabled={!matrizExiste} className="text-xs">
                      <Download className="w-3 h-3 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </header>
              <div className="p-4 md:p-6 space-y-4">
                {/* Documento */}
                {matrizArquivo && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">{matrizArquivo.name}</p>
                          <p className="text-xs text-blue-600">{matrizArquivo.size} • {formatDateBR(matrizArquivo.uploadedAt)} • Enviado por: {matrizArquivo.uploadedBy}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Área de visualização */}
                <div className="w-full min-h-[320px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Visualização da Matriz de Risco</p>
                    <p className="text-sm text-gray-400 mt-1">Use os botões acima para visualizar/baixar</p>
                  </div>
                </div>

                {/* Seção de Análise */}
                <div className="space-y-2">
                  <Textarea
                    id="justificativa"
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    placeholder="Descreva a justificativa da decisão sobre a Matriz de Risco..."
                    disabled={!canTakeAction}
                    className="min-h-[160px] mt-2 resize-none border-gray-200 focus:border-indigo-300 focus:ring-indigo-300"
                  />
                  {validationErrors.includes('Justificativa é obrigatória') && (
                    <p className="text-red-500 text-sm mt-1">Justificativa é obrigatória</p>
                  )}

                  {dataAnalise && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-700">Data da Análise</Label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-800">{formatDateBR(dataAnalise)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* DIREITA: Gerenciamento (4 colunas) */}
          <aside id="gerenciamento" className="col-span-12 lg:col-span-4 w-full flex flex-col">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white flex-1 flex flex-col">
              <header className="bg-purple-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Gerenciamento
                </div>
              </header>
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="versoes">Versões</TabsTrigger>
                    <TabsTrigger value="anexos">Anexos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="versoes" className="mt-0 p-4">
                    {versions.length === 0 ? (
                      <div className="text-center py-8 w-full">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <History className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Nenhuma versão disponível</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-full overflow-y-auto">
                        {versions.map((version) => {
                          const statusConfig = ((): { label: string; color: string; icon: React.ReactNode } => {
                            switch (version.status) {
                              case 'rascunho':
                                return { label: 'Em Elaboração', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: <Upload className="w-3 h-3" /> };
                              case 'enviada':
                                return { label: 'Enviada para Análise', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <Upload className="w-3 h-3" /> };
                              case 'aprovada':
                                return { label: 'Aprovada', color: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle className="w-3 h-3" /> };
                              case 'reprovada':
                                return { label: 'Não Aprovada', color: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="w-3 h-3" /> };
                              default:
                                return { label: 'Pendente', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: <Clock className="w-3 h-3" /> };
                            }
                          })();
                          return (
                            <div key={version.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={version.isFinal ? 'default' : 'outline'} className="text-xs">
                                    V{version.version}
                                    {version.isFinal && <CheckCircle className="w-3 h-3 ml-1" />}
                                  </Badge>
                                  <Badge className={`text-xs ${statusConfig.color}`}>
                                    {statusConfig.icon}
                                    <span className="ml-1">{statusConfig.label}</span>
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <p><strong>Autor:</strong> {version.createdBy}</p>
                                <p><strong>Cargo:</strong> {version.createdByCargo || 'Não informado'}</p>
                                <p><strong>Gerência:</strong> {version.createdByGerencia || 'Não informado'}</p>
                                <p><strong>Criado:</strong> {formatDateBR(new Date(version.createdAt))} às {new Date(version.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                                <p><strong>Prazo inicial:</strong> {version.prazoInicialDiasUteis || 0} dias úteis</p>
                                <p><strong>Prazo cumprido:</strong> {version.prazoCumpridoDiasUteis !== undefined ? `${version.prazoCumpridoDiasUteis} dias úteis` : 'Não enviado'}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="anexos" className="mt-0 p-4">
                    {/* Header compacto + Filtro ordenação */}
                    <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">Anexos</h3>
                        <span className="text-xs text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md font-medium">{anexosOrdenados.length}</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs text-slate-500 whitespace-nowrap">Ordenar:</span>
                        <div className="relative flex-1 sm:flex-none">
                          <select
                            aria-label="Ordenar anexos"
                            value={attachmentsSort}
                            onChange={(e) => setAttachmentsSort(e.target.value as 'desc' | 'asc')}
                            className="w-full h-7 rounded-md border border-slate-200 bg-white px-2 pr-6 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer hover:border-slate-300"
                          >
                            <option value="desc">Mais recente</option>
                            <option value="asc">Menos recente</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 pointer-events-none">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    {canTakeAction && (
                      <div className="mb-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const item = {
                                id: `annex-${Date.now().toString()}`,
                                name: file.name,
                                size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                                uploadedAt: new Date().toISOString()
                              };
                              setAnnexes(prev => [item, ...prev]);
                              toast({ title: 'Anexo adicionado', description: `${file.name} foi anexado com sucesso.` });
                            }
                            if (e.target) e.target.value = '';
                          }}
                          accept=".docx,.xlsx,.pdf,.odt,.csv,.png,.jpg,.txt"
                          className="hidden"
                        />
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="w-full border-dashed border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Adicionar Anexo
                        </Button>
                      </div>
                    )}

                    {anexosOrdenados.length === 0 ? (
                      <div className="text-center py-8 w-full">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">Nenhum anexo adicionado</p>
                        {!canTakeAction && (
                          <p className="text-sm text-gray-400 mt-1">Apenas usuários autorizados podem adicionar anexos</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-0 max-h-60 overflow-y-auto">
                        {anexosOrdenados.map((annex, idx) => (
                          <React.Fragment key={annex.id}>
                          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{annex.name}</p>
                                <p className="text-xs text-gray-500">{formatDateBR(annex.uploadedAt)} • {annex.uploadedBy}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                                <Download className="w-3 h-3" />
                              </Button>
                              {canTakeAction && (
                                <Button size="sm" variant="outline" className="h-6 w-6 p-0 text-red-600 hover:text-red-700" onClick={() => setAnnexes(prev => prev.filter(a => a.id !== annex.id))}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          {idx < anexosOrdenados.length - 1 && (<div className="border-b border-slate-200" />)}
                          </React.Fragment>
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
            <CommentsSection
              processoId={processoId}
              etapaId={etapaId.toString()}
              cardId="comentarios-aprovacao-matriz"
              title="Comentários"
            />
          </section>

          {/* FULL: Ações (rodapé) */}
          {isGSPUser() && (
            <section id="acoes" className="col-span-12 w-full mt-6 pb-6">
              <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                    {/* Lado esquerdo - Status e informações */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">1 dia no card</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{user?.nome || 'Sem responsável definido'}</span>
                      </div>
                    </div>

                    {/* Lado direito - Botões de ação */}
                    <div className="flex items-center gap-2">
                      <Button onClick={handleReprovar} disabled={!canTakeAction} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reprovar e Solicitar Nova Versão
                      </Button>
                      <Button onClick={handleAprovar} disabled={!canTakeAction} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 shadow-lg">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprovar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={showAprovarDialog} onOpenChange={setShowAprovarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Confirmar Aprovação
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja aprovar a Matriz de Risco? Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Marcar a versão como Aprovada e Final</li>
                <li>Liberar a próxima etapa (Assinatura da Matriz)</li>
                <li>Salvar a justificativa e Data da Análise</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAprovarDialog(false)}>Cancelar</Button>
            <Button onClick={confirmarAprovar} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Aprovação
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReprovarDialog} onOpenChange={setShowReprovarDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Confirmar Reprovação
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja reprovar e solicitar nova versão? Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Marcar a versão como Não Aprovada</li>
                <li>Retornar o fluxo para Elaboração da Matriz (Card 8)</li>
                <li>Salvar a justificativa e Data da Análise</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowReprovarDialog(false)}>Cancelar</Button>
            <Button onClick={confirmarReprovar} className="bg-red-600 hover:bg-red-700">
              <XCircle className="w-4 h-4 mr-2" />
              Confirmar Reprovação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


