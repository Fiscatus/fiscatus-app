import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Link, 
  MessageSquare, 
  FileText,
  Send,
  Eye,
  Download,
  Trash2,
  AlertCircle,
  Building2,
  UserCheck,
  UserX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from './ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Alert, AlertDescription } from './ui/alert';
import { useUser } from '@/contexts/UserContext';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';

interface SetorNotificado {
  id: string;
  nome: string;
  gerencia: string;
  status: 'pendente' | 'aceito' | 'recusado';
  dataNotificacao: string;
  dataResposta?: string;
  mensagem?: string;
  dfdVinculado?: {
    id: string;
    numero: string;
    status: string;
    dataCriacao: string;
  };
}

interface DFDCriado {
  id: string;
  numero: string;
  setorCriador: string;
  status: 'em_elaboracao' | 'enviado_analise' | 'aprovado' | 'devolvido';
  dataCriacao: string;
  responsavel: string;
}

interface ConsolidacaoDemandaSectionProps {
  processoId: string;
  etapaId: number;
  onComplete?: () => void;
  onSave?: (data: any) => void;
  canEdit?: boolean;
}

// Setores disponíveis para notificação
const SETORES_DISPONIVEIS = [
  { id: '1', nome: 'CI - Comissão de Implantação', gerencia: 'CI - Comissão de Implantação' },
  { id: '2', nome: 'SE - Secretaria Executiva', gerencia: 'SE - Secretaria Executiva' },
  { id: '3', nome: 'OUV - Ouvidoria', gerencia: 'OUV - Ouvidoria' },
  { id: '4', nome: 'GSP - Gerência de Soluções e Projetos', gerencia: 'GSP - Gerência de Soluções e Projetos' },
  { id: '5', nome: 'GSL - Gerência de Suprimentos e Logística', gerencia: 'GSL - Gerência de Suprimentos e Logística' },
  { id: '6', nome: 'GRH - Gerência de Recursos Humanos', gerencia: 'GRH - Gerência de Recursos Humanos' },
  { id: '7', nome: 'GUE - Gerência de Urgência e Emergência', gerencia: 'GUE - Gerência de Urgência e Emergência' },
  { id: '8', nome: 'GLC - Gerência de Licitações e Contratos', gerencia: 'GLC - Gerência de Licitações e Contratos' },
  { id: '9', nome: 'GFC - Gerência Financeira e Contábil', gerencia: 'GFC - Gerência Financeira e Contábil' },
  { id: '10', nome: 'GTEC - Gerência de Tecnologia da Informação', gerencia: 'GTEC - Gerência de Tecnologia da Informação' },
  { id: '11', nome: 'GAP - Gerência de Administração e Patrimônio', gerencia: 'GAP - Gerência de Administração e Patrimônio' },
  { id: '12', nome: 'GESP - Gerência de Especialidades', gerencia: 'GESP - Gerência de Especialidades' },
  { id: '13', nome: 'NAJ - Assessoria Jurídica', gerencia: 'NAJ - Assessoria Jurídica' }
];

export default function ConsolidacaoDemandaSection({
  processoId,
  etapaId,
  onComplete,
  onSave,
  canEdit = false
}: ConsolidacaoDemandaSectionProps) {
  const { user } = useUser();
  const { podeEditarFluxo } = usePermissoes();
  const { toast } = useToast();

  // Estados locais
  const [setoresNotificados, setSetoresNotificados] = useState<SetorNotificado[]>([]);
  const [dfdsVinculados, setDfdsVinculados] = useState<DFDCriado[]>([]);
  const [showNotificarModal, setShowNotificarModal] = useState(false);
  const [showResponderModal, setShowResponderModal] = useState(false);
  const [setorParaResponder, setSetorParaResponder] = useState<SetorNotificado | null>(null);
  const [setoresSelecionados, setSetoresSelecionados] = useState<string[]>([]);
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');

  // Verificar se pode gerenciar a consolidação
  const podeGerenciarConsolidacao = () => {
    if (!user) return false;
    return podeEditarFluxo() || user.gerencia === 'GSP - Gerência de Soluções e Projetos';
  };

  // Verificar se é setor notificado
  const isSetorNotificado = () => {
    if (!user) return false;
    return setoresNotificados.some(setor => setor.gerencia === user.gerencia);
  };

  // Verificar se pode responder à notificação
  const podeResponderNotificacao = () => {
    if (!user) return false;
    const setorNotificado = setoresNotificados.find(setor => setor.gerencia === user.gerencia);
    return setorNotificado && setorNotificado.status === 'pendente';
  };

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const dadosSalvos = localStorage.getItem(`consolidacao_${processoId}_${etapaId}`);
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      setSetoresNotificados(dados.setoresNotificados || []);
      setDfdsVinculados(dados.dfdsVinculados || []);
    }
  }, [processoId, etapaId]);

  // Salvar dados no localStorage
  const salvarDados = (dados: any) => {
    const dadosCompletos = {
      setoresNotificados,
      dfdsVinculados,
      ...dados
    };
    localStorage.setItem(`consolidacao_${processoId}_${etapaId}`, JSON.stringify(dadosCompletos));
    onSave?.(dadosCompletos);
  };

  // Notificar novos setores
  const handleNotificarSetores = () => {
    if (setoresSelecionados.length === 0) {
      toast({
        title: "Seleção obrigatória",
        description: "Selecione pelo menos um setor para notificar.",
        variant: "destructive"
      });
      return;
    }

    const novosSetores: SetorNotificado[] = setoresSelecionados.map(setorId => {
      const setor = SETORES_DISPONIVEIS.find(s => s.id === setorId);
      return {
        id: `notif_${Date.now()}_${setorId}`,
        nome: setor?.nome || '',
        gerencia: setor?.gerencia || '',
        status: 'pendente',
        dataNotificacao: new Date().toLocaleDateString('pt-BR'),
        mensagem: mensagemPersonalizada || 'Gostaríamos de verificar se sua gerência tem interesse em participar desta demanda.'
      };
    });

    setSetoresNotificados(prev => [...prev, ...novosSetores]);
    setSetoresSelecionados([]);
    setMensagemPersonalizada('');
    setShowNotificarModal(false);

    salvarDados({ setoresNotificados: [...setoresNotificados, ...novosSetores] });

    toast({
      title: "Setores notificados",
      description: `${novosSetores.length} setor(es) foram notificados com sucesso.`,
    });
  };

  // Responder à notificação
  const handleResponderNotificacao = (aceitar: boolean) => {
    if (!setorParaResponder || !user) return;

    const setoresAtualizados = setoresNotificados.map(setor => {
      if (setor.id === setorParaResponder.id) {
        return {
          ...setor,
          status: aceitar ? 'aceito' : 'recusado',
          dataResposta: new Date().toLocaleDateString('pt-BR')
        };
      }
      return setor;
    });

    setSetoresNotificados(setoresAtualizados);

    if (aceitar) {
      // Criar novo DFD vinculado
      const novoDFD: DFDCriado = {
        id: `dfd_${Date.now()}`,
        numero: `DFD-${String(dfdsVinculados.length + 1).padStart(3, '0')}-${new Date().getFullYear()}`,
        setorCriador: user.gerencia,
        status: 'em_elaboracao',
        dataCriacao: new Date().toLocaleDateString('pt-BR'),
        responsavel: user.nome
      };

      setDfdsVinculados(prev => [...prev, novoDFD]);

      // Atualizar setor notificado com o DFD vinculado
      const setoresComDFD = setoresAtualizados.map(setor => {
        if (setor.id === setorParaResponder.id) {
          return {
            ...setor,
            dfdVinculado: novoDFD
          };
        }
        return setor;
      });

      setSetoresNotificados(setoresComDFD);
      salvarDados({ setoresNotificados: setoresComDFD, dfdsVinculados: [...dfdsVinculados, novoDFD] });
    } else {
      salvarDados({ setoresNotificados: setoresAtualizados });
    }

    setShowResponderModal(false);
    setSetorParaResponder(null);

    toast({
      title: "Resposta registrada",
      description: aceitar 
        ? "Você aceitou participar da demanda. Um novo DFD foi criado."
        : "Você recusou participar da demanda.",
    });
  };

  // Abrir modal de resposta
  const abrirModalResposta = (setor: SetorNotificado) => {
    setSetorParaResponder(setor);
    setShowResponderModal(true);
  };

  // Obter status config
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pendente':
        return { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <AlertCircle className="w-3 h-3" /> };
      case 'aceito':
        return { label: 'Aceito', color: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle className="w-3 h-3" /> };
      case 'recusado':
        return { label: 'Recusado', color: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="w-3 h-3" /> };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: <AlertCircle className="w-3 h-3" /> };
    }
  };

  // Obter status do DFD
  const getDFDStatusConfig = (status: string) => {
    switch (status) {
      case 'em_elaboracao':
        return { label: 'Em Elaboração', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'enviado_analise':
        return { label: 'Enviado para Análise', color: 'bg-orange-100 text-orange-800 border-orange-300' };
      case 'aprovado':
        return { label: 'Aprovado', color: 'bg-green-100 text-green-800 border-green-300' };
      case 'devolvido':
        return { label: 'Devolvido', color: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Consolidação da Demanda</h2>
            <p className="text-sm text-gray-600">Notificação e consolidação de setores interessados</p>
          </div>
        </div>

        {/* Badge de acesso restrito */}
        {!podeGerenciarConsolidacao() && !isSetorNotificado() && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
            <AlertCircle className="w-3 h-3 mr-1" />
            Etapa Restrita
          </Badge>
        )}

        {/* Botão notificar - apenas para gerências pai e GSP */}
        {podeGerenciarConsolidacao() && (
          <Button onClick={() => setShowNotificarModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Notificar Novo Setor
          </Button>
        )}
      </div>

      {/* Alert para setores notificados */}
      {isSetorNotificado() && podeResponderNotificacao() && (
        <Alert className="border-blue-200 bg-blue-50">
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            <strong>Sua gerência foi notificada sobre esta demanda.</strong> 
            Clique em "Responder à Provocação" para aceitar ou recusar participar.
          </AlertDescription>
        </Alert>
      )}

      {/* Seção: Setores Notificados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-gray-600" />
            Setores Notificados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {setoresNotificados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum setor foi notificado ainda.</p>
              {podeGerenciarConsolidacao() && (
                <p className="text-sm mt-1">Use o botão "Notificar Novo Setor" para começar.</p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Setor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Notificação</TableHead>
                  <TableHead>Data Resposta</TableHead>
                  <TableHead>DFD Vinculado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {setoresNotificados.map((setor) => {
                  const statusConfig = getStatusConfig(setor.status);
                  return (
                    <TableRow key={setor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{setor.nome}</div>
                          <div className="text-sm text-gray-500">{setor.gerencia}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{setor.dataNotificacao}</TableCell>
                      <TableCell>{setor.dataResposta || '-'}</TableCell>
                      <TableCell>
                        {setor.dfdVinculado ? (
                          <div className="flex items-center gap-2">
                            <Link className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium">{setor.dfdVinculado.numero}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {setor.gerencia === user?.gerencia && setor.status === 'pendente' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => abrirModalResposta(setor)}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Responder
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Seção: DFDs Vinculados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            DFDs Vinculados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dfdsVinculados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Nenhum DFD vinculado foi criado ainda.</p>
              <p className="text-sm mt-1">DFDs serão criados automaticamente quando setores aceitarem participar.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {dfdsVinculados.map((dfd) => {
                const statusConfig = getDFDStatusConfig(dfd.status);
                return (
                  <div key={dfd.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{dfd.numero}</h4>
                          <p className="text-sm text-gray-600">Criado por {dfd.setorCriador}</p>
                        </div>
                      </div>
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Responsável:</span>
                        <span className="ml-2 font-medium">{dfd.responsavel}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Data Criação:</span>
                        <span className="ml-2 font-medium">{dfd.dataCriacao}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal: Notificar Setores */}
      <Dialog open={showNotificarModal} onOpenChange={setShowNotificarModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Notificar Novos Setores
            </DialogTitle>
            <DialogDescription>
              Selecione os setores que deseja notificar sobre esta demanda.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="setores">Setores *</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (value && !setoresSelecionados.includes(value)) {
                    setSetoresSelecionados(prev => [...prev, value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent>
                  {SETORES_DISPONIVEIS
                    .filter(setor => !setoresNotificados.some(notif => notif.gerencia === setor.gerencia))
                    .map(setor => (
                      <SelectItem key={setor.id} value={setor.id}>
                        {setor.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {setoresSelecionados.length > 0 && (
              <div>
                <Label>Setores Selecionados:</Label>
                <div className="mt-2 space-y-2">
                  {setoresSelecionados.map(setorId => {
                    const setor = SETORES_DISPONIVEIS.find(s => s.id === setorId);
                    return (
                      <div key={setorId} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm">{setor?.nome}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSetoresSelecionados(prev => prev.filter(id => id !== setorId))}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="mensagem">Mensagem Personalizada (Opcional)</Label>
              <Textarea
                id="mensagem"
                value={mensagemPersonalizada}
                onChange={(e) => setMensagemPersonalizada(e.target.value)}
                placeholder="Digite uma mensagem personalizada para os setores..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificarModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNotificarSetores}>
              <Send className="w-4 h-4 mr-2" />
              Notificar Setores
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Responder Notificação */}
      <Dialog open={showResponderModal} onOpenChange={setShowResponderModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Responder à Provocação
            </DialogTitle>
            <DialogDescription>
              Sua gerência foi notificada sobre esta demanda. Deseja participar?
            </DialogDescription>
          </DialogHeader>

          {setorParaResponder && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Mensagem Recebida:</h4>
                <p className="text-sm text-gray-700">{setorParaResponder.mensagem}</p>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleResponderNotificacao(true)}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Sim, desejo incluir minha demanda
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => handleResponderNotificacao(false)}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Não desejo participar deste processo
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 