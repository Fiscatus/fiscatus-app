import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, Send, FileText } from "lucide-react";
import Topbar from "@/components/Topbar";
import DFDFormSection from "@/components/DFDFormSection";
import InputField from "@/components/InputField";
import SelectField from "@/components/SelectField";
import TextareaField from "@/components/TextareaField";
import MultiSelectField from "@/components/MultiSelectField";
import RadioGroupField from "@/components/RadioGroupField";
import FileUploadField from "@/components/FileUploadField";
import EquipeMemberField from "@/components/EquipeMemberField";

// Dados mockados
const gerencias = [
  { value: "GSP", label: "GSP - Gerência de Soluções e Projetos" },
  { value: "GSL", label: "GSL - Gerência de Suprimentos e Logística" },
  { value: "GRH", label: "GRH - Gerência de Recursos Humanos" },
  { value: "GUE", label: "GUE - Gerência de Urgência e Emergência" },
  { value: "GLC", label: "GLC - Gerência de Licitações e Contratos" },
  { value: "GFC", label: "GFC - Gerência Financeira e Contábil" },
];

const gerenciasParticipantes = [
  { value: "GSP", label: "GSP" },
  { value: "GSL", label: "GSL" },
  { value: "GRH", label: "GRH" },
  { value: "GUE", label: "GUE" },
  { value: "GLC", label: "GLC" },
  { value: "GFC", label: "GFC" },
];

const prioridades = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Média" },
  { value: "baixa", label: "Baixa" },
];

const vinculacaoOptions = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

interface EquipeMember {
  id: string;
  nome: string;
  setor: string;
  funcao: string;
}

export default function NovoDFD() {
  const navigate = useNavigate();
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    numeroDFD: "DFD 023/2025",
    orgaoRequisitante: "Consórcio Intermunicipal Aliança para a Saúde - CIAS",
    gerenciaRequisitante: "",
    responsavelNome: "",
    responsavelCargo: "",
    responsavelMatricula: "",
    gerenciasParticipantes: [] as string[],
    objetoContratacao: "",
    grauPrioridade: "",
    vinculacao: "",
    processoVinculado: "",
    justificativa: "",
    descricaoSucinta: "",
    dataConclusao: "",
    estimativaValor: "",
    arquivos: [] as File[],
    equipe: [] as EquipeMember[],
  });

  const handleInputChange = (field: string, value: string | string[] | File[] | EquipeMember[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSalvarRascunho = () => {
    console.log("Salvando rascunho:", formData);
    // Aqui seria feita a chamada para salvar no backend
  };

  const handleEnviarAssinatura = () => {
    console.log("Enviando para assinatura:", formData);
    // Aqui seria feita a chamada para enviar para assinatura
    navigate("/dfd");
  };

  const formatCurrency = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");
    // Converte para número e formata
    const number = parseInt(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(number);
  };

  const handleCurrencyChange = (value: string) => {
    const formatted = formatCurrency(value);
    handleInputChange("estimativaValor", formatted);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      
      <main className="pt-20 px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
        {/* Header da página */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dfd")}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
          
          {/* Título principal */}
          <div className="text-center mt-4">
            <h1 className="text-3xl font-bold text-center text-primary flex items-center justify-center">
              <FileText className="w-8 h-8 mr-3 text-blue-500 align-middle" />
              Documento de Formalização da Demanda
            </h1>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Criação de novo DFD
            </p>
          </div>
        </div>

        <div className="w-full space-y-8">
          {/* Seção 1: Informações Básicas */}
          <DFDFormSection title="Informações Básicas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <InputField
                label="Número do DFD"
                name="numeroDFD"
                value={formData.numeroDFD}
                onChange={(value) => handleInputChange("numeroDFD", value)}
                disabled={true}
              />
              <InputField
                label="Órgão Requisitante"
                name="orgaoRequisitante"
                value={formData.orgaoRequisitante}
                onChange={(value) => handleInputChange("orgaoRequisitante", value)}
                disabled={true}
              />
              <SelectField
                label="Gerência Requisitante"
                name="gerenciaRequisitante"
                value={formData.gerenciaRequisitante}
                onChange={(value) => handleInputChange("gerenciaRequisitante", value)}
                options={gerencias}
                required={true}
              />
            </div>
          </DFDFormSection>

          {/* Seção 2: Responsável pela Demanda */}
          <DFDFormSection title="Responsável pela Demanda">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <InputField
                label="Nome Completo"
                name="responsavelNome"
                value={formData.responsavelNome}
                onChange={(value) => handleInputChange("responsavelNome", value)}
                placeholder="Nome completo do responsável"
                required={true}
              />
              <InputField
                label="Cargo"
                name="responsavelCargo"
                value={formData.responsavelCargo}
                onChange={(value) => handleInputChange("responsavelCargo", value)}
                placeholder="Cargo do responsável"
                required={true}
              />
              <InputField
                label="Matrícula"
                name="responsavelMatricula"
                value={formData.responsavelMatricula}
                onChange={(value) => handleInputChange("responsavelMatricula", value)}
                placeholder="Número da matrícula"
                required={true}
              />
            </div>
          </DFDFormSection>

          {/* Seção 3: Gerências Participantes */}
          <DFDFormSection title="Gerências Participantes">
            <MultiSelectField
              label="Selecione as gerências participantes"
              name="gerenciasParticipantes"
              value={formData.gerenciasParticipantes}
              onChange={(value) => handleInputChange("gerenciasParticipantes", value)}
              options={gerenciasParticipantes}
              required={true}
            />
          </DFDFormSection>

          {/* Seção 4: Objeto e Justificativa */}
          <DFDFormSection title="Objeto e Justificativa">
            <div className="space-y-6">
              <TextareaField
                label="Objeto da Contratação"
                name="objetoContratacao"
                value={formData.objetoContratacao}
                onChange={(value) => handleInputChange("objetoContratacao", value)}
                placeholder="Descreva detalhadamente o objeto da contratação..."
                required={true}
                rows={4}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <SelectField
                  label="Grau de Prioridade"
                  name="grauPrioridade"
                  value={formData.grauPrioridade}
                  onChange={(value) => handleInputChange("grauPrioridade", value)}
                  options={prioridades}
                  required={true}
                />
                <div className="space-y-4">
                  <RadioGroupField
                    label="Vinculação com outra contratação?"
                    name="vinculacao"
                    value={formData.vinculacao}
                    onChange={(value) => handleInputChange("vinculacao", value)}
                    options={vinculacaoOptions}
                    required={true}
                  />
                  {formData.vinculacao === "sim" && (
                    <InputField
                      label="Número do Processo Vinculado"
                      name="processoVinculado"
                      value={formData.processoVinculado || ""}
                      onChange={(value) => handleInputChange("processoVinculado", value)}
                      placeholder="Ex: DFD 022/2025"
                      required={true}
                    />
                  )}
                </div>
              </div>
              <TextareaField
                label="Justificativa da Necessidade da Contratação"
                name="justificativa"
                value={formData.justificativa}
                onChange={(value) => handleInputChange("justificativa", value)}
                placeholder="Justifique detalhadamente a necessidade da contratação..."
                required={true}
                rows={6}
              />
              <InputField
                label="Descrição Sucinta do Objeto"
                name="descricaoSucinta"
                value={formData.descricaoSucinta}
                onChange={(value) => handleInputChange("descricaoSucinta", value)}
                placeholder="Ex: Smartphones, etiquetas e carregadores"
              />
            </div>
          </DFDFormSection>

          {/* Seção 5: Prazo e Valor */}
          <DFDFormSection title="Prazo e Valor">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <InputField
                label="Data Pretendida para Conclusão"
                name="dataConclusao"
                value={formData.dataConclusao}
                onChange={(value) => handleInputChange("dataConclusao", value)}
                type="date"
                required={true}
              />
              <InputField
                label="Estimativa Preliminar do Valor"
                name="estimativaValor"
                value={formData.estimativaValor}
                onChange={handleCurrencyChange}
                placeholder="R$ 0,00"
                required={true}
              />
            </div>
          </DFDFormSection>

          {/* Seção 6: Anexos */}
          <DFDFormSection title="Anexos">
            <FileUploadField
              label="Anexar Orçamentos (PDF)"
              name="arquivos"
              files={formData.arquivos}
              onChange={(files) => handleInputChange("arquivos", files)}
              accept=".pdf"
              multiple={true}
            />
          </DFDFormSection>

          {/* Seção 7: Equipe de Planejamento */}
          <DFDFormSection title="Equipe de Planejamento">
            <EquipeMemberField
              label="Membros da Equipe"
              members={formData.equipe}
              onChange={(members) => handleInputChange("equipe", members)}
            />
          </DFDFormSection>

          {/* Botões de Ação */}
          <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  variant="outline"
                  onClick={handleSalvarRascunho}
                  className="flex items-center gap-2 px-6 py-3 text-base"
                  size="lg"
                >
                  <Save className="w-5 h-5" />
                  Salvar Rascunho
                </Button>
                <Button
                  onClick={handleEnviarAssinatura}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 text-base"
                  size="lg"
                >
                  <Send className="w-5 h-5" />
                  Enviar para Assinatura
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 