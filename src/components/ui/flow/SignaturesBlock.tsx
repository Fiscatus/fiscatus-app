import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  X, 
  Edit2,
  Check,
  XCircle
} from 'lucide-react';
import { ModelStage, Signer } from '@/types/flow';
import { useFlowStore } from '@/stores/flowStore';
import { cn } from '@/lib/utils';

interface SignaturesBlockProps {
  stage: ModelStage;
  density: 'cozy' | 'compact';
}

export default function SignaturesBlock({ stage, density }: SignaturesBlockProps) {
  const { addSigner, updateSigner, removeSigner } = useFlowStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSigner, setNewSigner] = useState({ name: '', role: '', status: 'pending' as const });
  
  const signatures = stage.toolConfig.signatures;
  const signers = signatures?.signers || [];
  
  const handleAddSigner = () => {
    if (!newSigner.name.trim()) return;
    
    const signer: Signer = {
      id: `s${Date.now()}`,
      name: newSigner.name,
      role: newSigner.role || undefined,
      status: newSigner.status
    };
    
    addSigner(stage.id, signer);
    setNewSigner({ name: '', role: '', status: 'pending' });
    setIsAdding(false);
  };
  
  const handleUpdateSigner = (signerId: string, field: keyof Signer, value: any) => {
    updateSigner(stage.id, signerId, { [field]: value });
    setEditingId(null);
  };
  
  const getStatusIcon = (status: Signer['status']) => {
    switch (status) {
      case 'signed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-slate-300" />;
    }
  };
  
  const getStatusColor = (status: Signer['status']) => {
    switch (status) {
      case 'signed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };
  
  const isCompact = density === 'compact';
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium">Signatários</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="h-7 px-2 text-xs"
        >
          <Plus className="w-3 h-3 mr-1" />
          Adicionar
        </Button>
      </div>
      
      {/* Formulário de adição */}
      {isAdding && (
        <div className="p-3 bg-slate-50 rounded border">
          <div className="space-y-3">
            <div>
              <Label htmlFor="signer-name" className="text-xs">Nome</Label>
              <Input
                id="signer-name"
                value={newSigner.name}
                onChange={(e) => setNewSigner(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do signatário"
                className={isCompact ? "h-8" : "h-9"}
              />
            </div>
            <div>
              <Label htmlFor="signer-role" className="text-xs">Papel (opcional)</Label>
              <Input
                id="signer-role"
                value={newSigner.role}
                onChange={(e) => setNewSigner(prev => ({ ...prev, role: e.target.value }))}
                placeholder="Ex: Gerente, Diretor"
                className={isCompact ? "h-8" : "h-9"}
              />
            </div>
            <div>
              <Label htmlFor="signer-status" className="text-xs">Status</Label>
              <Select
                value={newSigner.status}
                onValueChange={(value: Signer['status']) => setNewSigner(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className={isCompact ? "h-8" : "h-9"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="signed">Assinado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddSigner}
                disabled={!newSigner.name.trim()}
                className="h-7 px-3 text-xs"
              >
                Adicionar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewSigner({ name: '', role: '', status: 'pending' });
                }}
                className="h-7 px-3 text-xs"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Lista de signatários */}
      {signers.length > 0 ? (
        <div className="space-y-2">
          {signers.map((signer) => (
            <div
              key={signer.id}
              className={cn(
                "p-3 rounded border flex items-center justify-between",
                getStatusColor(signer.status)
              )}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(signer.status)}
                <div>
                  <div className="text-sm font-medium">{signer.name}</div>
                  {signer.role && (
                    <div className="text-xs opacity-75">{signer.role}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {editingId === signer.id ? (
                  <Select
                    value={signer.status}
                    onValueChange={(value: Signer['status']) => handleUpdateSigner(signer.id, 'status', value)}
                  >
                    <SelectTrigger className="h-7 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="signed">Assinado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-xs font-medium capitalize">
                    {signer.status === 'pending' ? 'Pendente' : 
                     signer.status === 'signed' ? 'Assinado' : 'Rejeitado'}
                  </span>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(editingId === signer.id ? null : signer.id)}
                  className="h-6 w-6 p-0"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSigner(stage.id, signer.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-sm text-slate-500">
          Nenhum signatário adicionado
        </div>
      )}
      
      {/* Resumo */}
      <div className="pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Total de signatários:</span>
          <span>{signers.length}</span>
        </div>
        {signers.length > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
            <span>Assinados:</span>
            <span>{signers.filter(s => s.status === 'signed').length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
