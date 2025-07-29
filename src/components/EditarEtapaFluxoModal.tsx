import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
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
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';

interface Etapa {
  id: number;
  nome: string;
  nomeCompleto: string;
  status: 'pendente' | 'andamento' | 'concluido' | 'atrasado';
  prazoPrevisao: string;
  gerencia: string;
  responsavel: string;
  cargo: string;
  observacoes?: string;
  bloqueiaProximas?: boolean;
  obrigatoria?: boolean;
  exigeAssinatura?: boolean;
  tipoIcone?: string;
}

interface EditarEtapaFluxoModalProps {
  etapa: Etapa | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (etapa: Etapa) => void;
  isNovaEtapa?: boolean;
}

const iconesDisponiveis = [
  { value: 'FileText', label: 'Documento', icon: <FileText className="w-4 h-4" /> },
  { value: 'PenTool', label: 'Assinatura', icon: <PenTool className="w-4 h-4" /> },
  { value: 'Users', label: 'Equipe', icon: <Users className="w-4 h-4" /> },
  { value: 'Search', label: 'Análise', icon: <Search className="w-4 h-4" /> },
  { value: 'Shield', label: 'Validação', icon: <Shield className="w-4 h-4" /> },
  { value: 'DollarSign', label: 'Financeiro', icon: <DollarSign className="w-4 h-4" /> },
  { value: 'Scale', label: 'Jurídico', icon: <Scale className="w-4 h-4" /> },
  { value: 'Upload', label: 'Envio', icon: <Upload className="w-4 h-4" /> },
  { value: 'User', label: 'Responsável', icon: <User className="w-4 h-4" /> },
  { value: 'Calendar', label: 'Prazo', icon: <Calendar className="w-4 h-4" /> },
  { value: 'Building2', label: 'Gerência', icon: <Building2 className="w-4 h-4" /> },
  { value: 'CheckCircle', label: 'Aprovação', icon: <CheckCircle className="w-4 h-4" /> },
  { value: 'Clock', label: 'Aguardando', icon: <Clock className="w-4 h-4" /> },
  { value: 'Settings', label: 'Configuração', icon: <Settings className="w-4 h-4" /> }
];

const gerenciasDisponiveis = [
  'Gerência de Planejamento',
  'Gerência Técnica',
  'Gerência de Engenharia',
  'Diretoria Executiva',
  'Gerência de Projetos',
  'Diretoria Técnica',
  'Gerência de Análise',
  'Gerência de Riscos',
  'Diretoria de Riscos',
  'Gerência de Contratos',
  'Diretoria de Contratos',
  'Gerência de Compras',
  'Gerência Financeira',
  'Diretoria Geral',
  'Gerência Jurídica',
  'Assessoria Jurídica',
  'Gerência de Comunicação',
  'Comissão de Implantação',
  'Secretaria Executiva',
  'Ouvidoria'
];

export default function EditarEtapaFluxoModal({
  etapa,
  isOpen,
  onClose,
  onSave,
  isNovaEtapa = false
}: EditarEtapaFluxoModalProps) {
  const [formData, setFormData] = useState<Etapa>({
    id: 0,
    nome: '',
    nomeCompleto: '',
    status: 'pendente',
    prazoPrevisao: '',
    gerencia: '',
    responsavel: '',
    cargo: '',
    observacoes: '',
    bloqueiaProximas: false,
    obrigatoria: true,
    exigeAssinatura: false,
    tipoIcone: 'FileText'
  });

  useEffect(() => {
    if (etapa) {
      setFormData({
        ...etapa,
        bloqueiaProximas: etapa.bloqueiaProximas || false,
        obrigatoria: etapa.obrigatoria !== false,
        exigeAssinatura: etapa.exigeAssinatura || false,
        tipoIcone: etapa.tipoIcone || 'FileText'
      });
    } else if (isNovaEtapa) {
      setFormData({
        id: Date.now(),
        nome: '',
        nomeCompleto: '',
        status: 'pendente',
        prazoPrevisao: '',
        gerencia: '',
        responsavel: '',
        cargo: '',
        observacoes: '',
        bloqueiaProximas: false,
        obrigatoria: true,
        exigeAssinatura: false,
        tipoIcone: 'FileText'
      });
    }
  }, [etapa, isNovaEtapa]);

  const handleSave = () => {
    if (!formData.nome || !formData.gerencia || !formData.prazoPrevisao) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleInputChange = (field: keyof Etapa, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getIconeAtual = () => {
    const icone = iconesDisponiveis.find(i => i.value === formData.tipoIcone);
    return icone ? icone.icon : <FileText className="w-4 h-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIconeAtual()}
            {isNovaEtapa ? 'Adicionar Nova Etapa' : 'Editar Etapa do Fluxo'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Título da Etapa *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  placeholder="Ex: Análise da Demanda"
                />
              </div>

              <div>
                <Label htmlFor="prazoPrevisao">Prazo Previsto (dias úteis) *</Label>
                <Input
                  id="prazoPrevisao"
                  value={formData.prazoPrevisao}
                  onChange={(e) => handleInputChange('prazoPrevisao', e.target.value)}
                  placeholder="Ex: 5 dias úteis"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="nomeCompleto">Descrição Completa</Label>
              <Textarea
                id="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                placeholder="Descrição detalhada da etapa..."
                rows={3}
              />
            </div>
          </div>

          {/* Responsabilidade */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Responsabilidade</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gerencia">Gerência Responsável *</Label>
                <Select value={formData.gerencia} onValueChange={(value) => handleInputChange('gerencia', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a gerência" />
                  </SelectTrigger>
                  <SelectContent>
                    {gerenciasDisponiveis.map((gerencia) => (
                      <SelectItem key={gerencia} value={gerencia}>
                        {gerencia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => handleInputChange('responsavel', e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cargo">Cargo do Responsável</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => handleInputChange('cargo', e.target.value)}
                placeholder="Ex: Gerente de Projetos"
              />
            </div>
          </div>

          {/* Configurações Visuais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Configurações Visuais</h3>
            
            <div>
              <Label htmlFor="tipoIcone">Ícone da Etapa</Label>
              <Select value={formData.tipoIcone} onValueChange={(value) => handleInputChange('tipoIcone', value)}>
                <SelectTrigger>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      {getIconeAtual()}
                      <span>{iconesDisponiveis.find(i => i.value === formData.tipoIcone)?.label}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {iconesDisponiveis.map((icone) => (
                    <SelectItem key={icone.value} value={icone.value}>
                      <div className="flex items-center gap-2">
                        {icone.icon}
                        <span>{icone.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Regras da Etapa */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Regras da Etapa</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="obrigatoria"
                  checked={formData.obrigatoria}
                  onCheckedChange={(checked) => handleInputChange('obrigatoria', checked)}
                />
                <Label htmlFor="obrigatoria" className="text-sm">
                  Etapa obrigatória
                </Label>
                <Badge variant="outline" className="text-xs">
                  Recomendado
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bloqueiaProximas"
                  checked={formData.bloqueiaProximas}
                  onCheckedChange={(checked) => handleInputChange('bloqueiaProximas', checked)}
                />
                <Label htmlFor="bloqueiaProximas" className="text-sm">
                  Bloqueia as próximas etapas até ser concluída
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="exigeAssinatura"
                  checked={formData.exigeAssinatura}
                  onCheckedChange={(checked) => handleInputChange('exigeAssinatura', checked)}
                />
                <Label htmlFor="exigeAssinatura" className="text-sm">
                  Exige assinatura digital
                </Label>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações Internas</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações sobre regras específicas, dependências, etc..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {isNovaEtapa ? 'Adicionar Etapa' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 