import React, { useState } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Folder, 
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Input 
} from "@/components/ui/input";
import { 
  Label 
} from "@/components/ui/label";
import { 
  Textarea 
} from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PastaOrganizacional {
  id: string;
  nome: string;
  descricao: string;
  icone: JSX.Element;
  cor: string;
  quantidadeProcessos: number;
  ultimaModificacao: string;
  filtro: (processo: any) => boolean;
}

interface GerenciarPastasModalProps {
  pastas: PastaOrganizacional[];
  onAdicionarPasta: (pasta: Omit<PastaOrganizacional, 'id' | 'quantidadeProcessos' | 'ultimaModificacao'>) => void;
  onEditarPasta: (id: string, pasta: Partial<PastaOrganizacional>) => void;
  onExcluirPasta: (id: string) => void;
}

export default function GerenciarPastasModal({ 
  pastas, 
  onAdicionarPasta, 
  onEditarPasta, 
  onExcluirPasta 
}: GerenciarPastasModalProps) {
  const [open, setOpen] = useState(false);
  const [modo, setModo] = useState<'lista' | 'adicionar' | 'editar'>('lista');
  const [pastaEditando, setPastaEditando] = useState<PastaOrganizacional | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'ano',
    anoReferencia: ''
  });

  const handleAdicionar = () => {
    const novaPasta = {
      nome: formData.nome,
      descricao: formData.descricao,
      icone: <Folder className="w-6 h-6" />,
      cor: "bg-blue-50 border-blue-200 text-blue-700",
      filtro: (processo: any) => {
        if (formData.tipo === 'ano') {
          return processo.ano === formData.anoReferencia;
        }
        return true;
      }
    };

    onAdicionarPasta(novaPasta);
    setModo('lista');
    setFormData({ nome: '', descricao: '', tipo: 'ano', anoReferencia: '' });
  };

  const handleEditar = () => {
    if (pastaEditando) {
      onEditarPasta(pastaEditando.id, {
        nome: formData.nome,
        descricao: formData.descricao
      });
      setModo('lista');
      setPastaEditando(null);
      setFormData({ nome: '', descricao: '', tipo: 'ano', anoReferencia: '' });
    }
  };

  const handleIniciarEdicao = (pasta: PastaOrganizacional) => {
    setPastaEditando(pasta);
    setFormData({
      nome: pasta.nome,
      descricao: pasta.descricao,
      tipo: 'ano',
      anoReferencia: ''
    });
    setModo('editar');
  };

  const handleExcluir = (id: string) => {
    onExcluirPasta(id);
  };

  const resetForm = () => {
    setFormData({ nome: '', descricao: '', tipo: 'ano', anoReferencia: '' });
    setPastaEditando(null);
    setModo('lista');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Folder className="w-4 h-4" />
          Gerenciar Pastas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Gerenciar Pastas Organizacionais
          </DialogTitle>
          <DialogDescription>
            Adicione, edite ou remova pastas para organizar seus processos
          </DialogDescription>
        </DialogHeader>

        {modo === 'lista' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pastas Existentes</h3>
              <Button onClick={() => setModo('adicionar')} className="gap-2">
                <Plus className="w-4 h-4" />
                Nova Pasta
              </Button>
            </div>

            <div className="grid gap-4">
              {pastas.map((pasta) => (
                <Card key={pasta.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {pasta.icone}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{pasta.nome}</h4>
                          <p className="text-sm text-gray-600">{pasta.descricao}</p>
                          <p className="text-xs text-gray-500">
                            {pasta.quantidadeProcessos} processos • Atualizado em {pasta.ultimaModificacao}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleIniciarEdicao(pasta)}
                          className="gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Pasta</AlertDialogTitle>
                              <AlertDialogDescription>
                                {pasta.quantidadeProcessos > 0 ? (
                                  <div className="flex items-center gap-2 mt-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                                    <span className="text-orange-700">
                                      Esta pasta possui {pasta.quantidadeProcessos} processo(s) vinculado(s). 
                                      Tem certeza que deseja excluir?
                                    </span>
                                  </div>
                                ) : (
                                  "Tem certeza que deseja excluir esta pasta?"
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleExcluir(pasta.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {(modo === 'adicionar' || modo === 'editar') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {modo === 'adicionar' ? 'Nova Pasta' : 'Editar Pasta'}
              </h3>
              <Button variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Pasta</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Processos de 2024"
                />
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Processos iniciados no ano de 2024"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo de Filtro</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ano">Por Ano</SelectItem>
                    <SelectItem value="status">Por Status</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.tipo === 'ano' && (
                <div>
                  <Label htmlFor="anoReferencia">Ano de Referência</Label>
                  <Select value={formData.anoReferencia} onValueChange={(value) => setFormData({ ...formData, anoReferencia: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button 
                  onClick={modo === 'adicionar' ? handleAdicionar : handleEditar}
                  disabled={!formData.nome || !formData.descricao}
                >
                  {modo === 'adicionar' ? (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Pasta
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 