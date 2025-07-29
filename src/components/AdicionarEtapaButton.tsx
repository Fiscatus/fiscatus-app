import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

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

interface AdicionarEtapaButtonProps {
  etapas: Etapa[];
  onAdicionar: (posicao: number) => void;
  className?: string;
}

export default function AdicionarEtapaButton({
  etapas,
  onAdicionar,
  className = ""
}: AdicionarEtapaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [posicaoSelecionada, setPosicaoSelecionada] = useState<number>(etapas.length + 1);

  const handleAdicionar = () => {
    onAdicionar(posicaoSelecionada);
    setIsOpen(false);
    setPosicaoSelecionada(etapas.length + 1);
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
            <p className="text-sm text-gray-600">
              Escolha onde inserir a nova etapa no fluxo do processo:
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
                todos os detalhes da nova etapa (nome, gerência responsável, prazo, etc.).
              </p>
            </div>
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