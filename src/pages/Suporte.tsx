import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, Mail, Phone, Clock, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Topbar from "@/components/Topbar";

export default function Suporte() {
  const navigate = useNavigate();

  const canaisSuporte = [
    {
      titulo: "Chat em Tempo Real",
      descricao: "Atendimento instantâneo via chat",
      icon: Headphones,
      status: "Online",
      cor: "text-green-600",
      bg: "bg-green-50",
      acao: () => navigate("/chat")
    },
    {
      titulo: "E-mail de Suporte",
      descricao: "suporte@fiscatus.gov.br",
      icon: Mail,
      status: "Resposta em até 2h",
      cor: "text-blue-600",
      bg: "bg-blue-50",
      acao: () => window.open("mailto:suporte@fiscatus.gov.br")
    },
    {
      titulo: "Central de Ajuda",
      descricao: "Documentação e tutoriais",
      icon: HelpCircle,
      status: "Disponível 24/7",
      cor: "text-purple-600",
      bg: "bg-purple-50",
      acao: () => navigate("/ajuda")
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      
      <main className="pt-16 md:pt-20 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mb-4 p-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Central de Suporte
              </h1>
              <p className="text-gray-600">
                Estamos aqui para ajudar você com qualquer dúvida ou problema
              </p>
            </div>
          </div>

          {/* Canais de Suporte */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {canaisSuporte.map((canal, index) => {
              const Icon = canal.icon;
              return (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={canal.acao}
                >
                  <CardHeader className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-full ${canal.bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-6 h-6 ${canal.cor}`} />
                    </div>
                    <CardTitle className="text-lg">{canal.titulo}</CardTitle>
                    <CardDescription>{canal.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <span className={`text-sm font-medium ${canal.cor}`}>
                      {canal.status}
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Informações de SLA */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horários de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Chat e E-mail</h4>
                  <p className="text-sm text-gray-600">
                    Segunda a Sexta: 8h às 18h<br />
                    Primeira resposta: até 5 minutos
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Central de Ajuda</h4>
                  <p className="text-sm text-gray-600">
                    Disponível 24 horas por dia<br />
                    Documentação sempre atualizada
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Rápido */}
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
              <CardDescription>
                Respostas rápidas para as dúvidas mais comuns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Como criar um novo processo?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Acesse "Meus Processos" e clique em "Novo Processo". Preencha os dados solicitados e siga o fluxo de aprovação.
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Como assinar um documento?</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Vá para "Minhas Assinaturas" e selecione o documento pendente. Use sua assinatura digital para finalizar.
                  </p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Esqueci minha senha</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Clique em "Esqueci minha senha" na tela de login ou entre em contato com o administrador do sistema.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
