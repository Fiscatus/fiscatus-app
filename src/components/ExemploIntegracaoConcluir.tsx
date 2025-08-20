import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConcluirEtapaButton } from "./ConcluirEtapaButton";
import { usePreCondicoesEtapa } from "@/hooks/usePreCondicoesEtapa";
import { EtapaService } from "@/services/etapaService";
import { useUser } from "@/contexts/UserContext";
import { Clock, Eye, FileText, CheckCircle2, Upload } from "lucide-react";

// Exemplo de integração em uma página de DFD
export function ExemploIntegracaoConcluir() {
  const { user } = useUser();
  const [etapas, setEtapas] = useState([
    {
      id: "etapa-1",
      numeroEtapa: 1,
      nomeEtapa: "Elaboração do DFD",
      descricao: "Elaboração e análise do Documento de Formalização da Demanda",
      gerenciaResponsavel: "GSP - Gerência de Soluções e Projetos",
      prazoPadrao: 5,
      status: "em_andamento",
      slug: "elaboracao-dfd",
      versaoEnviada: false, // Pré-condição não atendida
      concluida: false
    },
    {
      id: "etapa-2",
      numeroEtapa: 2,
      nomeEtapa: "Aprovação do DFD",
      descricao: "Aprovação do Documento de Formalização da Demanda",
      gerenciaResponsavel: "GSL - Gerência de Suprimentos e Logística",
      prazoPadrao: 3,
      status: "pendente", // Não está em andamento
      slug: "aprovacao-dfd",
      decisaoRegistrada: false,
      concluida: false
    },
    {
      id: "etapa-3",
      numeroEtapa: 3,
      nomeEtapa: "Assinatura do DFD",
      descricao: "Assinatura do Documento de Formalização da Demanda",
      gerenciaResponsavel: "GRH - Gerência de Recursos Humanos",
      prazoPadrao: 3,
      status: "pendente", // Não está em andamento
      slug: "assinatura-dfd",
      assinaturasConcluidas: 2,
      totalAssinaturas: 5,
      concluida: false
    },
    {
      id: "etapa-4",
      numeroEtapa: 4,
      nomeEtapa: "Despacho do DFD",
      descricao: "Despacho do Documento de Formalização da Demanda",
      gerenciaResponsavel: "SE - Secretaria Executiva",
      prazoPadrao: 2,
      status: "em_andamento", // Em andamento mas sem despacho
      slug: "despacho-dfd",
      despachoGerado: false,
      despachoAssinado: false,
      concluida: false
    }
  ]);

  const processoId = "processo-exemplo-123";

  const handleStatusChange = (etapaId: string, novoStatus: string) => {
    setEtapas(prev => prev.map(etapa => 
      etapa.id === etapaId 
        ? { ...etapa, status: novoStatus, concluida: novoStatus === "concluida" }
        : etapa
    ));
  };

  const handleConcluir = async (etapaId: string, dados: { observacao?: string; notificar: boolean }) => {
    if (!user) throw new Error("Usuário não autenticado");

    const etapa = etapas.find(e => e.id === etapaId);
    if (!etapa) throw new Error("Etapa não encontrada");

    try {
      const resultado = await EtapaService.mockConcluirEtapa(
        processoId,
        etapa.slug,
        {
          usuarioId: user.id,
          observacao: dados.observacao,
          dataConclusao: new Date().toISOString(),
          notificar: dados.notificar
        }
      );

      // Atualizar status da etapa
      handleStatusChange(etapaId, "concluida");

      return resultado;
    } catch (error) {
      console.error("Erro ao concluir etapa:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Exemplo de Integração - Botão "Concluir"
        </h1>
        <p className="text-gray-600">
          Demonstração do padrão global implementado nos Cards 1-5
        </p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {etapas.map((etapa) => {
          // Verificar pré-condições para esta etapa
          const preCondicao = usePreCondicoesEtapa({
            numeroEtapa: etapa.numeroEtapa,
            nomeEtapa: etapa.nomeEtapa,
            status: etapa.status,
            versaoEnviada: etapa.versaoEnviada,
            decisaoRegistrada: etapa.decisaoRegistrada,
            assinaturasConcluidas: etapa.assinaturasConcluidas,
            totalAssinaturas: etapa.totalAssinaturas,
            despachoGerado: etapa.despachoGerado,
            despachoAssinado: etapa.despachoAssinado,
            documentoAnexado: etapa.documentoAnexado,
            statusDocumento: etapa.statusDocumento
          });

          return (
            <Card 
              key={etapa.id} 
              className={`transition-all duration-200 hover:shadow-lg ${
                etapa.concluida 
                  ? "border-green-200 bg-green-50" 
                  : etapa.status === "em_andamento" 
                    ? "border-blue-200 bg-blue-50" 
                    : "border-gray-200 bg-white"
              }`}
            >
              {/* Header do Card */}
              <CardHeader className="bg-indigo-50 px-4 py-3 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      etapa.concluida ? 'bg-green-500' : 
                      etapa.status === "em_andamento" ? 'bg-blue-500' : 
                      'bg-gray-500'
                    }`}>
                      {etapa.numeroEtapa}
                    </div>
                    <div>
                      <CardTitle className="text-slate-900 font-semibold text-base">
                        {etapa.nomeEtapa}
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        {etapa.gerenciaResponsavel}
                      </p>
                    </div>
                  </div>
                  
                  <Badge variant="outline" className={`text-xs ${
                    etapa.concluida ? 'bg-green-100 text-green-800 border-green-300' :
                    etapa.status === "em_andamento" ? 'bg-blue-100 text-blue-800 border-blue-300' :
                    'bg-gray-100 text-gray-600 border-gray-300'
                  }`}>
                    {etapa.concluida ? 'Concluído ✓' : 
                     etapa.status === "em_andamento" ? 'Em Andamento' : 
                     'Pendente'}
                  </Badge>
                </div>
              </CardHeader>

              {/* Conteúdo do Card */}
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Descrição */}
                  <p className="text-sm text-gray-600">
                    {etapa.descricao}
                  </p>

                  {/* Informações da etapa */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{etapa.prazoPadrao} dias úteis</span>
                    </div>
                    
                    {/* Mostrar progresso de assinaturas se aplicável */}
                    {etapa.totalAssinaturas && etapa.totalAssinaturas > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{etapa.assinaturasConcluidas || 0}/{etapa.totalAssinaturas}</span>
                      </div>
                    )}
                  </div>

                  {/* Status das pré-condições */}
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        preCondicao.atendida ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <span className={preCondicao.atendida ? 'text-green-700' : 'text-red-700'}>
                        {preCondicao.atendida ? 'Pré-condições atendidas' : 'Pré-condições pendentes'}
                      </span>
                    </div>
                    {!preCondicao.atendida && (
                      <p className="text-red-600 mt-1">{preCondicao.tooltip}</p>
                    )}
                  </div>

                  {/* Seção de Ações - Rodapé não fixo */}
                  <section id="acoes" className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-xs">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver Detalhes
                      </Button>
                      
                      {etapa.numeroEtapa === 1 && (
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Upload className="w-4 h-4 mr-1" />
                          Enviar Versão
                        </Button>
                      )}
                      
                      {etapa.numeroEtapa === 2 && (
                        <Button variant="ghost" size="sm" className="text-xs">
                          <FileText className="w-4 h-4 mr-1" />
                          Registrar Decisão
                        </Button>
                      )}
                    </div>

                    {/* Botão Concluir - lado a lado com outros botões */}
                    <div className="flex items-center gap-2">
                      <ConcluirEtapaButton
                        etapa={{
                          id: etapa.id,
                          numeroEtapa: etapa.numeroEtapa,
                          nomeEtapa: etapa.nomeEtapa,
                          gerenciaResponsavel: etapa.gerenciaResponsavel,
                          slug: etapa.slug
                        }}
                        processoId={processoId}
                        preCondicaoAtendida={preCondicao.atendida}
                        tooltipPreCondicao={preCondicao.tooltip}
                        onConcluir={(dados) => handleConcluir(etapa.id, dados)}
                        concluida={etapa.concluida}
                      />
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informações do usuário atual */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Informações do Usuário</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Nome:</strong> {user?.nome || 'Não autenticado'}</p>
          <p><strong>Gerência:</strong> {user?.gerencia || 'Não definida'}</p>
          <p><strong>Permissões:</strong> {user?.gerencia?.includes('GSP') ? 'GSP + Gerência Responsável' : 'Apenas Gerência Responsável'}</p>
        </div>
      </div>

             {/* Instruções */}
       <div className="mt-8 p-4 bg-blue-50 rounded-lg">
         <h3 className="font-semibold text-blue-900 mb-2">Como Testar</h3>
         <div className="text-sm text-blue-800 space-y-1">
           <p>• <strong>Card 1:</strong> Em andamento - botão visível mas bloqueado (versão não enviada)</p>
           <p>• <strong>Card 2:</strong> Pendente - botão visível mas bloqueado (não está em andamento)</p>
           <p>• <strong>Card 3:</strong> Pendente - botão visível mas bloqueado (não está em andamento)</p>
           <p>• <strong>Card 4:</strong> Em andamento - botão visível mas bloqueado (despacho não gerado)</p>
           <p>• <strong>Permissões:</strong> Apenas GSP e gerências responsáveis veem o botão</p>
           <p>• <strong>Comportamento:</strong> Botão sempre visível, mas bloqueado quando não pode concluir</p>
         </div>
       </div>
    </div>
  );
}
