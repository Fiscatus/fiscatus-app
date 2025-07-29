import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Building2, 
  Users, 
  Calendar,
  Clock,
  Upload,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import Topbar from "@/components/Topbar";
import MultiSelectField from "@/components/MultiSelectField";
import FileUploadField from "@/components/FileUploadField";

// Dados mockados
const gerencias = [
  { value: "GSP", label: "GSP - Gerência de Soluções e Projetos" },
  { value: "GSL", label: "GSL - Gerência de Suprimentos e Logística" },
  { value: "GRH", label: "GRH - Gerência de Recursos Humanos" },
  { value: "GUE", label: "GUE - Gerência de Urgência e Emergência" },
  { value: "GLC", label: "GLC - Gerência de Licitações e Contratos" },
  { value: "GFC", label: "GFC - Gerência Financeira e Contábil" },
  { value: "GTEC", label: "GTEC - Gerência de Tecnologia da Informação" },
  { value: "GAP", label: "GAP - Gerência de Administração e Patrimônio" },
  { value: "GESP", label: "GESP - Gerência de Especialidades" },
];

const tiposTramitacao = [
  { value: "ordinaria", label: "Ordinária" },
  { value: "urgente", label: "Urgente" },
  { value: "prioritaria", label: "Prioritária" },
];

// Função para gerar número do processo
const gerarNumeroProcesso = () => {
  const ano = new Date().getFullYear();
  // Simular último número salvo (em produção viria do backend)
  const ultimoNumero = 77; // Mock
  const novoNumero = ultimoNumero + 1;
  return `${novoNumero.toString().padStart(3, '0')}/${ano}`;
};

interface NovoProcessoForm {
  numeroProcesso: string;
  objetoProcesso: string;
  gerenciaCriadora: string;
  gerenciasEnvolvidas: string[];
  anoProcesso: string;
  tipoTramitacao: string;
  comentariosIniciais: string;
  documentosIniciais: File[];
}

export default function NovoProcesso() {
  const navigate = useNavigate();
  
  // Estado do formulário
  const [formData, setFormData] = useState<NovoProcessoForm>({
    numeroProcesso: "",
    objetoProcesso: "",
    gerenciaCriadora: "GTEC - Gerência de Tecnologia da Informação", // Mock baseado no perfil
    gerenciasEnvolvidas: [],
    anoProcesso: new Date().getFullYear().toString(),
    tipoTramitacao: "",
    comentariosIniciais: "",
    documentosIniciais: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Gerar número do processo ao montar o componente
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      numeroProcesso: gerarNumeroProcesso()
    }));
  }, []);

  const handleInputChange = (field: keyof NovoProcessoForm, value: string | string[] | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCriarProcesso = async () => {
    setIsSubmitting(true);
    
    try {
      // Simular chamada para API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular criação do processo
      const numeroProcesso = formData.numeroProcesso;
      
      // Mostrar sucesso
      setShowSuccess(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate(`/processos/${numeroProcesso}`);
      }, 2000);
      
    } catch (error) {
      console.error("Erro ao criar processo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelar = () => {
    navigate("/processos-gerencia");
  };

  const isFormValid = () => {
    return formData.objetoProcesso.trim() !== "" && 
           formData.tipoTramitacao !== "" &&
           formData.gerenciasEnvolvidas.length > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8 py-6 min-h-screen max-w-full">
        {/* Header da página */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleCancelar}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar aos Processos
          </Button>
          
          {/* Título principal */}
          <div className="text-center mt-4">
            <h1 className="text-3xl font-bold text-center text-primary flex items-center justify-center">
              <Plus className="w-8 h-8 mr-3 text-blue-500" />
              Novo Processo
            </h1>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Criação de novo processo administrativo
            </p>
          </div>
        </div>

        {/* Mensagem de sucesso */}
        {showSuccess && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    Processo criado com sucesso!
                  </p>
                  <p className="text-sm text-green-700">
                    Número do processo: {formData.numeroProcesso}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="w-full space-y-6">
          {/* Seção 1: Informações Básicas */}
          <Card className="bg-white rounded-xl shadow-md border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Informações Básicas</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Número do Processo */}
                <div className="space-y-2">
                  <Label htmlFor="numeroProcesso" className="text-sm font-medium text-gray-700">
                    Número do Processo
                  </Label>
                  <div className="relative">
                    <Input
                      id="numeroProcesso"
                      value={formData.numeroProcesso}
                      disabled
                      className="bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-xs text-gray-500">Gerado automaticamente</span>
                    </div>
                  </div>
                </div>

                {/* Ano do Processo */}
                <div className="space-y-2">
                  <Label htmlFor="anoProcesso" className="text-sm font-medium text-gray-700">
                    Ano do Processo
                  </Label>
                  <div className="relative">
                    <Input
                      id="anoProcesso"
                      value={`Ano: ${formData.anoProcesso}`}
                      disabled
                      className="bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Tipo de Tramitação */}
                <div className="space-y-2">
                  <Label htmlFor="tipoTramitacao" className="text-sm font-medium text-gray-700">
                    Tipo de Tramitação *
                  </Label>
                  <Select 
                    value={formData.tipoTramitacao} 
                    onValueChange={(value) => handleInputChange("tipoTramitacao", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposTramitacao.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 2: Objeto e Gerências */}
          <Card className="bg-white rounded-xl shadow-md border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Objeto e Participação</h2>
              </div>
              
              <div className="space-y-6">
                {/* Objeto do Processo */}
                <div className="space-y-2">
                  <Label htmlFor="objetoProcesso" className="text-sm font-medium text-gray-700">
                    Objeto do Processo *
                  </Label>
                  <Textarea
                    id="objetoProcesso"
                    value={formData.objetoProcesso}
                    onChange={(e) => handleInputChange("objetoProcesso", e.target.value)}
                    placeholder="Descreva o objeto da contratação"
                    className="min-h-[100px] resize-none"
                  />
                </div>

                {/* Gerência Criadora */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Gerência Criadora
                  </Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        Gerência: {formData.gerenciaCriadora}
                      </span>
                    </div>
                  </div>
                </div>

                                 {/* Gerências Envolvidas */}
                 <div className="space-y-2">
                   <Label className="text-sm font-medium text-gray-700">
                     Outras gerências que podem participar do processo *
                   </Label>
                   <MultiSelectField
                     label="Outras gerências que podem participar do processo"
                     name="gerenciasEnvolvidas"
                     value={formData.gerenciasEnvolvidas}
                     onChange={(value) => handleInputChange("gerenciasEnvolvidas", value)}
                     options={gerencias.filter(g => g.value !== "GTEC")} // Excluir gerência criadora
                     placeholder="Selecione as gerências participantes"
                   />
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção 3: Comentários e Anexos */}
          <Card className="bg-white rounded-xl shadow-md border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Upload className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Comentários e Anexos</h2>
              </div>
              
              <div className="space-y-6">
                {/* Comentários Iniciais */}
                <div className="space-y-2">
                  <Label htmlFor="comentariosIniciais" className="text-sm font-medium text-gray-700">
                    Observações iniciais (opcional)
                  </Label>
                  <Textarea
                    id="comentariosIniciais"
                    value={formData.comentariosIniciais}
                    onChange={(e) => handleInputChange("comentariosIniciais", e.target.value)}
                    placeholder="Digite comentários ou justificativas relevantes para a abertura do processo..."
                    className="min-h-[100px] resize-none"
                  />
                </div>

                                 {/* Anexar documentos iniciais */}
                 <div className="space-y-2">
                   <Label className="text-sm font-medium text-gray-700">
                     Anexar documentos iniciais (opcional)
                   </Label>
                   <FileUploadField
                     label="Anexar documentos iniciais"
                     name="documentosIniciais"
                     files={formData.documentosIniciais}
                     onChange={(files) => handleInputChange("documentosIniciais", files)}
                     accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                     multiple={true}
                   />
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <Card className="bg-white rounded-xl shadow-md border border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={handleCancelar}
                  className="flex items-center gap-2 px-6 py-3 text-base"
                  size="lg"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCriarProcesso}
                  disabled={!isFormValid() || isSubmitting}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 px-6 py-3 text-base"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Criando Processo...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Criar Processo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 