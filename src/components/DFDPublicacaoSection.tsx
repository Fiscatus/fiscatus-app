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
  Settings
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import CommentsSection from './CommentsSection';
import { formatDateBR, formatDateTimeBR } from '@/lib/utils';

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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [diasNoCard, setDiasNoCard] = useState(0);
  const [responsavelAtual, setResponsavelAtual] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    if (!comprovanteArquivo) {
      errors.push('Upload do comprovante é obrigatório');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Função para upload de comprovante
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const arquivoInfo = {
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.nome || 'Usuário',
        url: `mock-url-${Date.now().toString()}`
      };
      
      setComprovanteArquivo(arquivoInfo);
      
      // Salvar no localStorage
      const publicacaoData = {
        dataPublicacao,
        meioPublicacao,
        linkOuNumero,
        observacoes,
        comprovanteArquivo: arquivoInfo,
        confirmada,
        confirmacaoData
      };
      localStorage.setItem(`publicacao-${processoId}`, JSON.stringify(publicacaoData));
      
      toast({
        title: "Comprovante enviado",
        description: `${file.name} foi enviado com sucesso.`
      });
    }
    
    // Limpar o input
    if (event.target) {
      event.target.value = '';
    }
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

     return (
     <div className="bg-white">
       {/* Container central ocupando toda a área */}
       <div className="w-full px-2">
         
         {/* Grid principal 12 colunas */}
         <div className="grid grid-cols-12 gap-4">
          
                     {/* ESQUERDA: Informações da Publicação (8 colunas) */}
           <section id="publicacao-info" className="col-span-12 lg:col-span-8 w-full relative">
             <div className="rounded-2xl border shadow-sm overflow-hidden bg-white">
              <header className="bg-green-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-lg">
                    <Newspaper className="w-5 h-5 text-green-600" />
                    Publicação
                    {confirmada && (
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        <Stamp className="w-3 h-3 mr-1" />
                        Confirmada
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {canEditFields() && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs"
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Enviar Comprovante
                      </Button>
                    )}
                    {comprovanteArquivo && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDownloadComprovante}
                          className="text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Baixar Comprovante
                        </Button>
                        {canEditFields() && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRemoveComprovante}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remover
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </header>
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

                  {/* Upload de Comprovante */}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Comprovante da Publicação *
                    </Label>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                      className="hidden"
                    />

                    {!comprovanteArquivo ? (
                      <div
                        onClick={() => canEditFields() && fileInputRef.current?.click()}
                        className={`
                          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                          ${canEditFields() 
                            ? 'border-green-300 hover:border-green-400 hover:bg-green-50' 
                            : 'border-gray-200 cursor-not-allowed bg-gray-50'
                          }
                        `}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {canEditFields() 
                            ? 'Clique para enviar o comprovante da publicação'
                            : 'Comprovante não enviado'
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, PNG, JPG ou DOC (máx. 10MB)
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <FileText className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-green-900">{comprovanteArquivo.name}</p>
                              <p className="text-xs text-green-600">
                                {comprovanteArquivo.size} • Enviado em {formatDateTimeBR(comprovanteArquivo.uploadedAt)}
                              </p>
                              <p className="text-xs text-green-600">
                                Por: {comprovanteArquivo.uploadedBy}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="outline" onClick={handleDownloadComprovante} className="h-8 px-3">
                              <Download className="w-3 h-3 mr-1" />
                              Baixar
                            </Button>
                            {canEditFields() && (
                              <Button size="sm" variant="outline" onClick={handleRemoveComprovante} className="h-8 px-3 text-red-600 hover:text-red-700">
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remover
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {validationErrors.includes('Upload do comprovante é obrigatório') && (
                      <p className="text-red-500 text-sm mt-2">Upload do comprovante é obrigatório</p>
                    )}
                  </div>

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

          {/* DIREITA: Resumo da Publicação (4 colunas) */}
          <aside id="resumo-publicacao" className="col-span-12 lg:col-span-4 w-full flex flex-col">
            <div className="rounded-2xl border shadow-sm overflow-hidden bg-white flex-1 flex flex-col">
              <header className="bg-purple-50 px-4 py-3 rounded-t-2xl font-semibold text-slate-900">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-purple-600" />
                  Resumo da Publicação
                </div>
              </header>
              <div className="p-4 md:p-6 flex-1 flex flex-col">
                <div className="space-y-4">
                  
                  {/* Status */}
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      <Badge className={confirmada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {confirmada ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Confirmada
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Pendente
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Informações Preenchidas */}
                  {dataPublicacao && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Data da Publicação</span>
                      </div>
                      <p className="text-sm text-blue-700">{formatDateBR(dataPublicacao)}</p>
                    </div>
                  )}

                  {meioPublicacao && (
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                      <div className="flex items-center gap-2 mb-1">
                        {getMeioPublicacaoIcon(meioPublicacao)}
                        <span className="text-sm font-medium text-indigo-900">Meio de Publicação</span>
                      </div>
                      <p className="text-sm text-indigo-700">{getMeioPublicacaoLabel(meioPublicacao)}</p>
                    </div>
                  )}

                  {linkOuNumero && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-1">
                        <ExternalLink className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Link/Número</span>
                      </div>
                      <p className="text-sm text-green-700 break-all">{linkOuNumero}</p>
                    </div>
                  )}

                  {comprovanteArquivo && (
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">Comprovante</span>
                      </div>
                      <p className="text-sm text-orange-700">{comprovanteArquivo.name}</p>
                      <p className="text-xs text-orange-600">{comprovanteArquivo.size}</p>
                    </div>
                  )}

                  {/* Permissões */}
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Permissões</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {canPublish() ? (
                        <>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span>Pode preencher e confirmar</span>
                          </div>
                          {confirmada && (
                            <div className="flex items-center gap-1">
                              <Lock className="w-3 h-3 text-gray-500" />
                              <span>Campos bloqueados (confirmada)</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-gray-500" />
                          <span>Apenas visualização</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </aside>

          {/* FULL: Comentários */}
          <section id="comentarios" className="col-span-12 w-full">
            <CommentsSection
              processoId={processoId}
              etapaId={etapaId.toString()}
              cardId="comentarios-publicacao"
              title="Comentários"
            />
          </section>

          {/* FULL: Ações (rodapé não fixo) */}
          {canPublish() && !confirmada && (
            <section id="acoes" className="col-span-12 w-full mt-6 pb-6">
              <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                    
                    {/* Lado esquerdo - Status e informações */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {diasNoCard} dia no card
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {responsavelAtual}
                        </span>
                      </div>
                    </div>

                    {/* Lado direito - Botões de ação */}
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={handleConfirmarPublicacao}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 shadow-lg"
                      >
                        <Stamp className="w-4 h-4 mr-2" />
                        Confirmar Publicação
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Rodapé para usuários sem permissão */}
          {!canPublish() && (
            <section id="info" className="col-span-12 w-full mt-6 pb-6">
              <Card className="w-full shadow-lg border-0 bg-gray-50/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center w-full">
                    
                    {/* Lado esquerdo - Status e informações */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {diasNoCard} dia no card
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {responsavelAtual}
                        </span>
                      </div>
                    </div>

                    {/* Lado direito - Informação */}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-gray-600">
                        <Eye className="w-3 h-3 mr-1" />
                        Apenas Visualização
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
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
