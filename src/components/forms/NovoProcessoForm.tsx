import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { getTodayISO } from '@/lib/dates/today';
import { ORG_TZ } from '@/config/timezone';
import { DatePicker } from '@/components/date/DatePicker';
import { CurrentDateField, useCurrentDateDefaults } from '@/components/date/CurrentDateField';

// Schema de validação com Zod
const novoProcessoSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  tipoProcesso: z.string().min(1, "Tipo de processo é obrigatório"),
  dataCriacao: z.string().refine(
    (v) => v === getTodayISO(ORG_TZ), 
    "Data de Criação deve ser a data de hoje"
  ),
  dataDocumento: z.string().min(1, "Data do documento é obrigatória"),
  dataRegistro: z.string().min(1, "Data de registro é obrigatória"),
  gerenciaResponsavel: z.string().min(1, "Gerência responsável é obrigatória"),
  valorEstimado: z.string().optional(),
  observacoes: z.string().optional(),
});

type NovoProcessoFormData = z.infer<typeof novoProcessoSchema>;

// Dados mock para demonstração
const tiposProcesso = [
  { value: "contratacao", label: "Contratação de Serviços" },
  { value: "compra", label: "Compra de Materiais" },
  { value: "licitacao", label: "Licitação" },
  { value: "dispensa", label: "Dispensa de Licitação" },
];

const gerencias = [
  "GSP - Gerência de Soluções e Projetos",
  "GSL - Gerência de Suprimentos e Logística", 
  "GRH - Gerência de Recursos Humanos",
  "GUE - Gerência de Urgência e Emergência",
  "GLC - Gerência de Licitações e Contratos",
  "GFC - Gerência Financeira e Contábil",
];

export function NovoProcessoForm() {
  const todayISO = getTodayISO(ORG_TZ);
  
  const form = useForm<NovoProcessoFormData>({
    resolver: zodResolver(novoProcessoSchema),
    defaultValues: {
      titulo: "",
      descricao: "",
      tipoProcesso: "",
      dataCriacao: todayISO, // Sempre hoje
      dataDocumento: todayISO, // Hoje por padrão
      dataRegistro: todayISO, // Hoje por padrão
      gerenciaResponsavel: "",
      valorEstimado: "",
      observacoes: "",
    },
  });

  const onSubmit = (data: NovoProcessoFormData) => {
    console.log('Dados do formulário:', data);
    toast({
      title: "Processo Criado",
      description: "O novo processo foi criado com sucesso!",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Novo Processo</h1>
        <p className="text-gray-600 mt-2">
          Preencha as informações para criar um novo processo de contratação
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Título do Processo *</label>
                <Input
                  {...form.register("titulo")}
                  placeholder="Ex: Contratação de serviços de TI"
                />
                {form.formState.errors.titulo && (
                  <p className="text-sm text-red-600">{form.formState.errors.titulo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Processo *</label>
                <Select onValueChange={(value) => form.setValue("tipoProcesso", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposProcesso.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.tipoProcesso && (
                  <p className="text-sm text-red-600">{form.formState.errors.tipoProcesso.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição *</label>
              <Textarea
                {...form.register("descricao")}
                placeholder="Descreva detalhadamente o objeto do processo..."
                rows={4}
              />
              {form.formState.errors.descricao && (
                <p className="text-sm text-red-600">{form.formState.errors.descricao.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gerência Responsável *</label>
              <Select onValueChange={(value) => form.setValue("gerenciaResponsavel", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a gerência" />
                </SelectTrigger>
                <SelectContent>
                  {gerencias.map((gerencia) => (
                    <SelectItem key={gerencia} value={gerencia}>
                      {gerencia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.gerenciaResponsavel && (
                <p className="text-sm text-red-600">{form.formState.errors.gerenciaResponsavel.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Datas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📅 Datas do Processo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Data de Criação - Somente leitura */}
              <CurrentDateField
                name="dataCriacao"
                control={form.control}
                label="Data de Criação *"
                description="Data automática de criação do processo"
                required
                readOnly
                error={!!form.formState.errors.dataCriacao}
                errorMessage={form.formState.errors.dataCriacao?.message}
              />

              {/* Data do Documento - Editável mas default hoje */}
              <CurrentDateField
                name="dataDocumento"
                control={form.control}
                label="Data do Documento *"
                description="Data do documento principal"
                required
                error={!!form.formState.errors.dataDocumento}
                errorMessage={form.formState.errors.dataDocumento?.message}
              />

              {/* Data de Registro - Editável mas default hoje */}
              <CurrentDateField
                name="dataRegistro"
                control={form.control}
                label="Data de Registro *"
                description="Data de registro no sistema"
                required
                error={!!form.formState.errors.dataRegistro}
                errorMessage={form.formState.errors.dataRegistro?.message}
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Informações Adicionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor Estimado</label>
                <Input
                  {...form.register("valorEstimado")}
                  placeholder="R$ 0,00"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  {...form.register("observacoes")}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancelar
          </Button>
          <Button type="submit">
            Criar Processo
          </Button>
        </div>
      </form>
    </div>
  );
}
