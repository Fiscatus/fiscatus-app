import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/date';
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Upload,
  Download,
  Trash2,
  Calendar,
  User,
  Clock,
  Globe,
  Newspaper,
  Pin,
  ExternalLink,
  Stamp,
  Lock,
  Eye,
  Settings,
  ClipboardCheck,
  ListChecks,
  Flag,
  Paperclip
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import CommentsSection from './CommentsSection';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';
import { useDFD, type DFDAnnex } from '@/hooks/useDFD';

interface PublicacaoData {
  dataPublicacao: string;
  meioPublicacao: string;
  linkOuNumero: string;
  observacoes: string;
  comprovanteArquivo?: {
    name: string;
    size: string;
    uploadedAt: string;
    uploadedBy: string;
    url: string;
  };
  confirmada: boolean;
  confirmacoesData?: {
    responsavel: string;
    cargo: string;
    dataConfirmacao: string;
  };
}

interface DFDPublicacaoSectionProps {
  processoId: string;
  etapaId: number;
  onComplete: (data: any) => void;
  onSave: (data: any) => void;
  initialData?: any;
  canEdit?: boolean;
}

export default function DFDPublicacaoSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  initialData,
  canEdit = true
}: DFDPublicacaoSectionProps) {
  const { user } = useUser();
  const { toast } = useToast();

  // Estados principais
  const [dataPublicacao, setDataPublicacao] = useState('');
  const [meioPublicacao, setMeioPublicacao] = useState('');
  const [linkOuNumero, setLinkOuNumero] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [comprovanteArquivo, setComprovanteArquivo] = useState<PublicacaoData['comprovanteArquivo']>(null);
  const [confirmada, setConfirmada] = useState(false);
  const [confirmacaoData, setConfirmacaoData] = useState<PublicacaoData['confirmacoesData']>(null);
  // Removido: seleção de Documento Final da Publicação
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [diasNoCard, setDiasNoCard] = useState(0);
  const [responsavelAtual, setResponsavelAtual] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null); // (legacy) não usado mais para comprovante
  const annexInputRef = useRef<HTMLInputElement>(null);

  // Anexos do processo (padrão sistema)
  const { dfdData, addAnnex, removeAnnex } = useDFD(processoId);

  // Ordenação e helpers para Anexos (padrão Assinatura)
  const [attachmentsSort, setAttachmentsSort] = useState<'desc' | 'asc'>('desc');
  const anexosOrdenados = React.useMemo(() => {
    const sorted = [...dfdData.annexes];
    sorted.sort((a, b) => {
      const at = new Date(a.uploadedAt).getTime();
      const bt = new Date(b.uploadedAt).getTime();
      return attachmentsSort === 'desc' ? bt - at : at - bt;
    });
    return sorted;
  }, [dfdData.annexes, attachmentsSort]);

  const openInNewTab = (url?: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener');
  };

  // Verificar se é usuário autorizado para publicação (Secretaria Executiva ou setor designado)
  const canPublish = () => {
    // Para este exemplo, vamos permitir que apenas usuários da GSP possam publicar
    // Na implementação real, seria o setor responsável pela publicação
    return user?.gerencia === 'GSP - Gerência de Soluções e Projetos' || 
           user?.gerencia === 'Secretaria Executiva';
  };

  // Verificar se pode editar os campos
  const canEditFields = () => {
    return canPublish() && !confirmada;
  };

  // Opções de meio de publicação
  const meiosPublicacao = [
    { value: 'diario_oficial', label: 'Diário Oficial', icon: <Newspaper className="w-4 h-4" /> },
    { value: 'site_institucional', label: 'Site Institucional', icon: <Globe className="w-4 h-4" /> },
    { value: 'pncp', label: 'PNCP', icon: <Pin className="w-4 h-4" /> },
    { value: 'outros', label: 'Outros', icon: <FileText className="w-4 h-4" /> }
  ];

  // Validação do formulário
  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!dataPublicacao) {
      errors.push('Data da Publicação é obrigatória');
    }
    
    if (!meioPublicacao) {
      errors.push('Meio de Publicação é obrigatório');
    }
    
    if (!linkOuNumero.trim()) {
      errors.push('Link da publicação ou número da edição é obrigatório');
    }
    
    // Removido: obrigatoriedade de Documento Final

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Upload de anexos (Gerenciamento)
  const handleUploadAnexo = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newAnnex: DFDAnnex = {
        id: `anexo-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.nome || 'Usuário',
        url: `mock-url-${Date.now()}`
      };
      addAnnex(newAnnex);
      toast({ title: 'Anexo adicionado', description: `${file.name} foi anexado com sucesso.` });
    }
    if (event.target) event.target.value = '';
  };

  // Função para baixar comprovante
  const handleDownloadComprovante = () => {
    if (!comprovanteArquivo) return;
    
    toast({
      title: "Download iniciado",
      description: `O arquivo ${comprovanteArquivo.name} está sendo baixado.`
    });
  };

  // Função para excluir comprovante
  const handleRemoveComprovante = () => {
    setComprovanteArquivo(null);
    
    // Atualizar localStorage
    const publicacaoData = {
      dataPublicacao,
      meioPublicacao,
      linkOuNumero,
      observacoes,
      comprovanteArquivo: null,
      confirmada,
      confirmacaoData
    };
    localStorage.setItem(`publicacao-${processoId}`, JSON.stringify(publicacaoData));
    
    toast({
      title: "Comprovante removido",
      description: "O comprovante foi removido com sucesso."
    });
  };

  // Função para confirmar publicação
  const handleConfirmarPublicacao = () => {
    if (!validateForm()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  // Confirmar a publicação definitivamente
  const confirmarPublicacao = () => {
    const dataConfirmacao = new Date().toISOString();
    const dadosConfirmacao = {
      responsavel: user?.nome || 'Usuário',
      cargo: user?.cargo || 'Cargo',
      dataConfirmacao
    };

    setConfirmada(true);
    setConfirmacaoData(dadosConfirmacao);

    // Salvar todos os dados no localStorage
    const publicacaoData: PublicacaoData = {
      dataPublicacao,
      meioPublicacao,
      linkOuNumero,
      observacoes,
      comprovanteArquivo,
      confirmada: true,
      confirmacoesData: dadosConfirmacao
    };
    localStorage.setItem(`publicacao-${processoId}`, JSON.stringify(publicacaoData));

    // Completar a etapa
    onComplete(publicacaoData);

    toast({
      title: "Publicação Confirmada",
      description: "A publicação foi registrada oficialmente e o processo foi concluído.",
      duration: 5000
    });

    setShowConfirmDialog(false);
  };

  // Salvar dados automaticamente
  const salvarDados = () => {
    const publicacaoData = {
      dataPublicacao,
      meioPublicacao,
      linkOuNumero,
      observacoes,
      comprovanteArquivo,
      confirmada,
      confirmacaoData
    };
    localStorage.setItem(`publicacao-${processoId}`, JSON.stringify(publicacaoData));
    onSave(publicacaoData);
  };

  // Carregar dados salvos
  useEffect(() => {
    const publicacaoSalva = localStorage.getItem(`publicacao-${processoId}`);
    if (publicacaoSalva) {
      try {
        const dados: PublicacaoData = JSON.parse(publicacaoSalva);
        setDataPublicacao(dados.dataPublicacao || '');
        setMeioPublicacao(dados.meioPublicacao || '');
        setLinkOuNumero(dados.linkOuNumero || '');
        setObservacoes(dados.observacoes || '');
        setComprovanteArquivo(dados.comprovanteArquivo || null);
        setConfirmada(dados.confirmada || false);
        setConfirmacaoData(dados.confirmacoesData || null);
      } catch (error) {
        console.error('Erro ao carregar dados de publicação:', error);
      }
    }

    // Definir responsável atual e dias no card
    setResponsavelAtual(user?.nome || 'Não definido');
    setDiasNoCard(1); // Mock - na implementação real seria calculado
  }, [processoId, user]);

  // Salvar automaticamente quando dados mudarem
  useEffect(() => {
    if (dataPublicacao || meioPublicacao || linkOuNumero || observacoes) {
      salvarDados();
    }
  }, [dataPublicacao, meioPublicacao, linkOuNumero, observacoes]);

  // Função para obter ícone do meio de publicação
  const getMeioPublicacaoIcon = (meio: string) => {
    const meioObj = meiosPublicacao.find(m => m.value === meio);
    return meioObj?.icon || <FileText className="w-4 h-4" />;
  };

  // Função para obter label do meio de publicação
  const getMeioPublicacaoLabel = (meio: string) => {
    const meioObj = meiosPublicacao.find(m => m.value === meio);
    return meioObj?.label || meio;
  };

  // Mini Timeline (Painel da Etapa)
  type TimelineItem = { id: string; tipo: 'confirmacao' | 'anexo'; titulo: string; dataHora: string };
  const generateTimeline = (): TimelineItem[] => {
    const items: TimelineItem[] = [];
    if (confirmada && confirmacaoData?.dataConfirmacao) {
      items.push({
        id: `conf-${confirmacaoData.dataConfirmacao}`,
        tipo: 'confirmacao',
        titulo: 'Publicação confirmada',
        dataHora: confirmacaoData.dataConfirmacao
      });
    }
    anexosOrdenados.slice(0, 5).forEach(anexo => {
      items.push({
        id: anexo.id,
        tipo: 'anexo',
        titulo: `Anexo adicionado: ${anexo.name}`,
        dataHora: anexo.uploadedAt
      });
    });
    return items.sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()).slice(0, 6);
  };

  const getTimelineIcon = (tipo: TimelineItem['tipo']) => {
    if (tipo === 'confirmacao') return <Stamp className="w-4 h-4 text-green-600" />;
    if (tipo === 'anexo') return <Paperclip className="w-4 h-4 text-gray-600" />;
    return <Clock className="w-4 h-4 text-gray-600" />;
  };

     return (
     <div className="bg-white">
       {/* Container central ocupando toda a área */}
       <div className="w-full px-2">
         
        {/* Grid principal 12 colunas */}
       <div className="space-y-6">
          
                     {/* ESQUERDA: Informações da Publicação (8 colunas) */}
          <section id="publicacao-info" className="col-span-12 w-full relative">
            <div className="card-shell mb-8 overflow-hidden">
              <header className="flex items-center gap-3 mb-4">
                <Newspaper className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-bold text-slate-900">Publicação</h2>
                <div className="ml-auto flex items-center gap-2">
                  {confirmada && (
                    <Badge className="bg-green-100 text-green-800 border-green-300">
                      <Stamp className="w-3 h-3 mr-1" />
                      Confirmada
                    </Badge>
                  )}
                  {comprovanteArquivo && (
                    <>
                      <Button size="sm" variant="outline" onClick={handleDownloadComprovante} className="h-7 px-2 text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        Baixar
                      </Button>
                      {canEditFields() && (
                        <Button size="sm" variant="outline" onClick={handleRemoveComprovante} className="h-7 px-2 text-xs text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remover
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </header>
              <div className="border-b-2 border-green-200 mb-6"></div>
              <div className="p-4 md:p-6">
                <div className="space-y-6">
                  
                  {/* Campos Obrigatórios */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                                         {/* Data da Publicação */}
                     <div>
                       <Label htmlFor="data-publicacao" className="text-sm font-semibold text-gray-700 mb-2 block">
                         Data da Publicação *
                       </Label>
                                               <div className="relative">
                          <DatePicker
                            value={dataPublicacao || null}
                            onChange={(date) => setDataPublicacao(date || '')}
                            placeholder="Selecione a data"
                            showPresets={true}
                            businessDaysOnly={true}
                            minDate={new Date()}
                            className="w-full"
                            inputClassName="h-10 border-2 border-gray-300 focus:border-green-500 focus:ring-green-200"
                            popoverClassName="z-50 max-w-[400px]"
                            disabled={!canEditFields()}
                          />
                        </div>
                       {validationErrors.includes('Data da Publicação é obrigatória') && (
                         <p className="text-red-500 text-sm mt-1">Data da Publicação é obrigatória</p>
                       )}
                     </div>

                    {/* Meio de Publicação */}
                    <div>
                      <Label htmlFor="meio-publicacao" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Meio de Publicação *
                      </Label>
                      <Select
                        value={meioPublicacao}
                        onValueChange={setMeioPublicacao}
                        disabled={!canEditFields()}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-green-300 focus:ring-green-300">
                          <SelectValue placeholder="Selecione o meio de publicação" />
                        </SelectTrigger>
                        <SelectContent>
                          {meiosPublicacao.map((meio) => (
                            <SelectItem key={meio.value} value={meio.value}>
                              <div className="flex items-center gap-2">
                                {meio.icon}
                                {meio.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {validationErrors.includes('Meio de Publicação é obrigatório') && (
                        <p className="text-red-500 text-sm mt-1">Meio de Publicação é obrigatório</p>
                      )}
                    </div>
                  </div>

                  {/* Link ou Número da Edição */}
                  <div>
                    <Label htmlFor="link-numero" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Link da Publicação ou Número da Edição *
                    </Label>
                    <div className="relative">
                      <ExternalLink className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <Input
                        id="link-numero"
                        type="text"
                        value={linkOuNumero}
                        onChange={(e) => setLinkOuNumero(e.target.value)}
                        placeholder="Ex: https://diario.oficial.gov.br/edital/123 ou Edição nº 245"
                        disabled={!canEditFields()}
                        className="pl-10 border-gray-200 focus:border-green-300 focus:ring-green-300"
                      />
                    </div>
                    {validationErrors.includes('Link da publicação ou número da edição é obrigatório') && (
                      <p className="text-red-500 text-sm mt-1">Link da publicação ou número da edição é obrigatório</p>
                    )}
                  </div>

                  {/* Removido: campo de Documento Final da Publicação */}

                  {/* Observações */}
                  <div>
                    <Label htmlFor="observacoes" className="text-sm font-semibold text-gray-700 mb-2 block">
                      Observações
                      <span className="text-xs text-gray-500 font-normal ml-1">(Opcional)</span>
                    </Label>
                    <Textarea
                      id="observacoes"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Informações adicionais sobre a publicação..."
                      disabled={!canEditFields()}
                      className="min-h-[100px] resize-none border-gray-200 focus:border-green-300 focus:ring-green-300"
                    />
                  </div>

                  {/* Selo de Confirmação */}
                  {confirmada && confirmacaoData && (
                    <Alert className="border-green-200 bg-green-50">
                      <Stamp className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <div className="space-y-1">
                          <p className="font-semibold">✅ Publicação Confirmada Oficialmente</p>
                          <p className="text-sm">
                            <strong>Responsável:</strong> {confirmacaoData.responsavel} ({confirmacaoData.cargo})
                          </p>
                          <p className="text-sm">
                            <strong>Data/Hora:</strong> {formatDateTimeBR(confirmacaoData.dataConfirmacao)}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <Lock className="w-3 h-3" />
                            <span className="text-xs">Campos bloqueados para edição</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* GERENCIAMENTO: padrão full-width abaixo */}
          <section id="gerenciamento" className="col-span-12 w-full">
            <div className="card-shell mb-8">
              <header className="card-header-title">
                <Settings className="w-6 h-6 text-slate-600" />
                <h2 className="text-lg font-bold text-slate-900">Gerenciamento</h2>
              </header>
              <div className="border-b-2 border-slate-200 mb-6"></div>
              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  {/* Anexos - padrão da Assinatura */}
                  <div className="space-y-3 w-full">
                    {/* Header + Filtro */}
                    <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-slate-800">Anexos</h3>
                        <span className="text-xs text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md font-medium">{dfdData.annexes.length}</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs text-slate-500 whitespace-nowrap">Ordenar:</span>
                        <div className="relative flex-1 sm:flex-none">
                          <select aria-label="Ordenar anexos" value={attachmentsSort} onChange={(e)=>setAttachmentsSort(e.target.value as 'desc'|'asc')} className="w-full h-7 rounded-md border border-slate-200 bg-white px-2 pr-6 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer hover:border-slate-300">
                            <option value="desc">Mais recente</option>
                            <option value="asc">Menos recente</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-1.5 pointer-events-none">
                            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                          </div>
                    </div>
                      </div>
                    </div>
                    {/* Upload */}
                    {canEditFields() && !confirmada && (
                      <div>
                        <input ref={annexInputRef} type="file" accept=".pdf,.doc,.docx,.odt,.png,.jpg,.jpeg,.gif,.bmp,.tif,.tiff" className="hidden" onChange={handleUploadAnexo} />
                        <Button onClick={()=>annexInputRef.current?.click()} variant="outline" className="w-full h-9 border-dashed border-2 border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors text-sm">
                          <Upload className="w-4 h-4 mr-2"/>Adicionar Anexo
                        </Button>
                      </div>
                    )}
                    {/* Lista */}
                    {dfdData.annexes.length === 0 ? (
                      <div className="pt-4">
                        <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-400" />
                    </div>
                        <p className="text-center text-gray-500 font-medium">Nenhum anexo adicionado</p>
                      </div>
                    ) : (
                      <div className={`${dfdData.annexes.length > 6 ? 'max-h-[280px] overflow-y-auto' : ''} space-y-0 w-full` }>
                        {anexosOrdenados.map((annex, idx)=>(
                          <React.Fragment key={annex.id}>
                            <div className="flex items-center justify-between p-2.5 border border-gray-200 rounded-lg hover:bg-slate-50 transition-colors w-full">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{annex.name}</p>
                                  <p className="text-xs text-gray-500 hidden sm:block">{annex.uploadedBy} • {formatDateBR(annex.uploadedAt)}</p>
                                  <p className="text-xs text-gray-500 sm:hidden">{annex.uploadedBy} • {formatDateBR(annex.uploadedAt)}</p>
                                </div>
                    </div>
                              {/* Ações - desktop */}
                              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                                <Button size="sm" variant="outline" aria-label="Visualizar" className="h-7 w-7 p-0 hover:bg-blue-50" onClick={()=>openInNewTab(annex.url)}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button size="sm" variant="outline" aria-label="Baixar" className="h-7 w-7 p-0 hover:bg-green-50">
                                  <Download className="w-3 h-3" />
                                </Button>
                                {canEditFields() && !confirmada && (
                                  <Button size="sm" variant="outline" aria-label="Remover" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={()=>removeAnnex(annex.id)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                    </div>
                              {/* Ações - mobile */}
                              <div className="sm:hidden flex items-center flex-shrink-0">
                                <Button size="sm" variant="outline" aria-label="Baixar" className="h-7 w-7 p-0 hover:bg-green-50">
                                  <Download className="w-3 h-3" />
                                </Button>
                                {canEditFields() && !confirmada && (
                                  <Button size="sm" variant="outline" aria-label="Remover" className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={()=>removeAnnex(annex.id)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                )}
                          </div>
                            </div>
                            {idx < anexosOrdenados.length-1 && (<div className="border-b border-slate-200" />)}
                          </React.Fragment>
                        ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          

          {/* Painel da Etapa */}
          <section id="painel-etapa" className="col-span-12 w-full">
            <div className="card-shell mb-8">
              <header className="flex items-center gap-3 mb-4">
                <ClipboardCheck className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-bold text-slate-900">Painel da Etapa</h2>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Checklist
                  </span>
                </div>
              </header>
              <div className="border-b-2 border-green-200 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status & Prazo */}
                <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
                  <header className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Flag className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-sm font-semibold text-slate-800">Status & Prazo</h3>
                    </div>
                    <Badge className={confirmada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {confirmada ? 'Concluída' : 'Pendente'}
                    </Badge>
                  </header>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                        <Calendar className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Data de Criação</p>
                        <p className="text-lg font-bold text-slate-900">{formatDateBR(new Date().toISOString())}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                          <Clock className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Tempo no Card</p>
                          <p className="text-lg font-bold text-slate-900">{diasNoCard} dia(s)</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300">
                        <User className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Responsável Atual</p>
                        <p className="text-lg font-bold text-slate-900">{responsavelAtual}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Checklist */}
                <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
                  <header className="flex items-center gap-2 mb-4">
                    <ListChecks className="w-5 h-5 text-green-600" />
                    <h3 className="text-sm font-semibold text-slate-800">Checklist</h3>
                  </header>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>Definir data e meio de publicação</li>
                    <li>Inserir link/número da publicação</li>
                    <li>Adicionar anexos pertinentes</li>
                    <li>Confirmar publicação</li>
                  </ul>
                </div>

                {/* Mini Timeline */}
                <div className="rounded-2xl border shadow-sm bg-white p-4 md:p-6">
                  <header className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-semibold text-slate-800">Mini Timeline</h3>
                  </header>
                  <div className="flex-1 flex flex-col">
                    {generateTimeline().length === 0 ? (
                      <div className="flex-1 flex items-center justify-center"><p className="text-sm text-gray-500 italic text-center">Sem eventos registrados.</p></div>
                    ) : (
                      <>
                        <div className="flex-1 relative pr-2">
                          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                          <div className="max-h-[280px] overflow-y-auto">
                            <div className="flex flex-col gap-4 pl-6">
                              {generateTimeline().map(item => (
                                <div key={item.id} className="relative group">
                                  <div className="absolute -left-6 top-0 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                    {getTimelineIcon(item.tipo)}
                                  </div>
                                  <div className="hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors">
                                    <p className="text-sm font-semibold text-slate-700 mb-1">{item.titulo}</p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                      <span>{formatDateTimeBR(item.dataHora)}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Comentários */}
          <section id="comentarios" className="col-span-12 w-full">
            <div className="card-shell mb-8">
              <CommentsSection
                processoId={processoId}
                etapaId={etapaId.toString()}
                cardId="comentarios-publicacao"
                title="Comentários"
              />
            </div>
          </section>

          {/* Ações da Etapa */}
          <section id="acoes-etapa" className="col-span-12 w-full">
            <div className="card-shell mb-8">
              <header className="flex items-center gap-3 mb-4">
                <Flag className="w-6 h-6 text-orange-600" />
                <h2 className="text-lg font-bold text-slate-900">Ações da Etapa</h2>
                <div className="ml-auto"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Ações</span></div>
              </header>
              <div className="border-b-2 border-orange-200 mb-6"></div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300"><Clock className="w-5 h-5 text-slate-600" /></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Tempo no Card</p>
                      <p className="text-lg font-bold text-slate-900">{diasNoCard} dia(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-300"><User className="w-5 h-5 text-slate-600" /></div>
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Responsável</p>
                      <p className="text-lg font-bold text-slate-900">{responsavelAtual}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  {confirmada ? (
                    <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div className="text-center">
                          <p className="text-sm font-semibold text-green-600">Publicação Concluída</p>
                          {confirmacaoData?.dataConfirmacao && (
                            <p className="text-sm text-green-700">{formatDateBR(confirmacaoData.dataConfirmacao)} por {confirmacaoData?.responsavel}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {canPublish() ? (
                        <Button onClick={handleConfirmarPublicacao} variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50"><Stamp className="w-4 h-4 mr-2" />Confirmar Publicação</Button>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-500"><Info className="w-4 h-4" />Somente visualização</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Dialog de Confirmação */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Stamp className="w-5 h-5 text-green-600" />
              Confirmar Publicação
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja confirmar a publicação? Esta ação irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Registrar oficialmente a publicação do edital</li>
                <li>Gerar carimbo automático com data, hora e responsável</li>
                <li>Bloquear todos os campos para edição</li>
                <li>Concluir o processo de planejamento da contratação</li>
              </ul>
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarPublicacao} className="bg-green-600 hover:bg-green-700">
              <Stamp className="w-4 h-4 mr-2" />
              Confirmar Publicação
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
