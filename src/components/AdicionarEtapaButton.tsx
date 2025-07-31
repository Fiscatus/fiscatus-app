import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, FileText, Shield, DollarSign, Scale, Upload, User, Calendar, Building2, CheckCircle, Clock, Settings } from 'lucide-react';

interface Etapa {
  id: number;
  nome: string;
  nomeCompleto: string;
  status: 'pendente' | 'andamento' | 'concluido' | 'atrasado';
  prazoPrevisao: string;
  gerencia: string;
  responsavel: string;
  cargo: string;
}

interface CardOpcional {
  id: string;
  nome: string;
  descricao: string;
  icone: React.ReactNode;
  template: any;
  categoria: 'opcional' | 'especial';
}

interface AdicionarEtapaButtonProps {
  etapas: Etapa[];
  onAdicionar: (posicao: number, cardOpcional?: CardOpcional) => void;
  className?: string;
}

// Cards opcionais disponíveis
const cardsOpcionais: CardOpcional[] = [
  {
    id: 'consolidacao-demanda',
    nome: 'Consolidação da Demanda',
    descricao: 'Notificar setores com possível interesse em participar da demanda',
    icone: <Users className="w-4 h-4" />,
    template: {
      nome: 'Consolidação da Demanda',
      nomeCompleto: 'Consolidação da Demanda - Notificação e consolidação de setores interessados',
      status: 'pendente',
      prazoPrevisao: '10 dias úteis',
      gerencia: 'Gerência de Soluções e Projetos',
      responsavel: 'Yasmin Pissolati Mattos Bretz',
      cargo: 'Gerente de Soluções e Projetos',
      observacoes: 'Card opcional para notificar setores com possível interesse em participar da demanda',
      bloqueiaProximas: false,
      obrigatoria: false,
      exigeAssinatura: false,
      tipoIcone: 'Users'
    },
    categoria: 'opcional'
  }
];

export default function AdicionarEtapaButton({
  etapas,
  onAdicionar,
  className = ""
}: AdicionarEtapaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [posicaoSelecionada, setPosicaoSelecionada] = useState<number>(etapas.length + 1);
  const [cardSelecionado, setCardSelecionado] = useState<CardOpcional | null>(null);
  const [modoSelecao, setModoSelecao] = useState<'posicao' | 'card'>('card');

  const handleAdicionar = () => {
    if (cardSelecionado) {
      onAdicionar(posicaoSelecionada, cardSelecionado);
    } else {
      onAdicionar(posicaoSelecionada);
    }
    setIsOpen(false);
    setPosicaoSelecionada(etapas.length + 1);
    setCardSelecionado(null);
    setModoSelecao('posicao');
  };

  const handleSelecionarCard = (card: CardOpcional) => {
    setCardSelecionado(card);
    setModoSelecao('posicao');
  };

  const handleVoltarParaCards = () => {
    setModoSelecao('card');
    setCardSelecionado(null);
  };

  const getOpcoesPositions = () => {
    const opcoes = [];
    
    // Opção para adicionar no início
    opcoes.push({
      value: 1,
      label: 'No início do fluxo',
      description: 'Antes de todas as etapas'
    });

    // Opções para adicionar depois de cada etapa existente
    etapas.forEach((etapa, index) => {
      opcoes.push({
        value: index + 2,
        label: `Após "${etapa.nome}"`,
        description: `Posição ${index + 2}`
      });
    });

    return opcoes;
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
        size="lg"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nova Etapa
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Adicionar Nova Etapa
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {modoSelecao === 'card' ? (
              <>
                <p className="text-sm text-gray-600">
                  Escolha o tipo de etapa que deseja adicionar:
                </p>

                {/* Etapa padrão */}
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                       onClick={() => setModoSelecao('posicao')}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">Etapa Padrão</h4>
                        <p className="text-sm text-gray-600">Criar uma nova etapa personalizada</p>
                      </div>
                    </div>
                  </div>

                  {/* Cards opcionais */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Cards Opcionais</h4>
                    {cardsOpcionais.map((card) => (
                      <div 
                        key={card.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleSelecionarCard(card)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            {card.icone}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">{card.nome}</h4>
                              <Badge variant="outline" className="text-xs">
                                {card.categoria === 'opcional' ? 'Opcional' : 'Especial'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{card.descricao}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {cardSelecionado && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                        {cardSelecionado.icone}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">{cardSelecionado.nome}</p>
                        <p className="text-xs text-purple-600">{cardSelecionado.descricao}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleVoltarParaCards}
                        className="ml-auto text-purple-600 hover:text-purple-800"
                      >
                        Trocar
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-sm text-gray-600">
                  Escolha onde inserir a {cardSelecionado ? 'etapa' : 'nova etapa'} no fluxo do processo:
                </p>

                <div>
                  <Label htmlFor="posicao">Posição no Fluxo</Label>
                  <Select 
                    value={posicaoSelecionada.toString()} 
                    onValueChange={(value) => setPosicaoSelecionada(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a posição" />
                    </SelectTrigger>
                    <SelectContent>
                      {getOpcoesPositions().map((opcao) => (
                        <SelectItem key={opcao.value} value={opcao.value.toString()}>
                          <div>
                            <div className="font-medium">{opcao.label}</div>
                            <div className="text-xs text-gray-500">{opcao.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Próximo passo:</strong> Após confirmar a posição, você poderá configurar 
                    todos os detalhes da {cardSelecionado ? 'etapa' : 'nova etapa'} (nome, gerência responsável, prazo, etc.).
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdicionar}>
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 