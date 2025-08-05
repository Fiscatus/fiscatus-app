import React from "react";
import { 
  Users, 
  Database, 
  FileText, 
  Clock, 
  HardDrive, 
  Activity,
  TrendingUp,
  Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Estatistica {
  titulo: string;
  valor: string | number;
  unidade?: string;
  icone: React.ComponentType<any>;
  cor: string;
  bgColor: string;
  tendencia?: "up" | "down" | "neutral";
  variacao?: number;
}

export default function EstatisticasSistema() {
  const estatisticas: Estatistica[] = [
    {
      titulo: "Usuários Ativos",
      valor: 1.247,
      icone: Users,
      cor: "text-blue-600",
      bgColor: "bg-blue-50",
      tendencia: "up",
      variacao: 12
    },
    {
      titulo: "Processos Ativos",
      valor: 89,
      icone: FileText,
      cor: "text-green-600",
      bgColor: "bg-green-50",
      tendencia: "up",
      variacao: 8
    },
    {
      titulo: "Documentos",
      valor: 15.432,
      unidade: "arquivos",
      icone: Database,
      cor: "text-purple-600",
      bgColor: "bg-purple-50",
      tendencia: "up",
      variacao: 23
    },
    {
      titulo: "Uptime",
      valor: 99.8,
      unidade: "%",
      icone: Activity,
      cor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      tendencia: "neutral"
    },
    {
      titulo: "Armazenamento",
      valor: 2.4,
      unidade: "TB",
      icone: HardDrive,
      cor: "text-orange-600",
      bgColor: "bg-orange-50",
      tendencia: "up",
      variacao: 5
    },
    {
      titulo: "Tempo Médio",
      valor: 2.3,
      unidade: "s",
      icone: Clock,
      cor: "text-indigo-600",
      bgColor: "bg-indigo-50",
      tendencia: "down",
      variacao: 15
    }
  ];

  const getTendenciaIcon = (tendencia: "up" | "down" | "neutral") => {
    switch (tendencia) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTendenciaTexto = (tendencia: "up" | "down" | "neutral", variacao?: number) => {
    if (tendencia === "neutral") return "Estável";
    return `${tendencia === "up" ? "+" : "-"}${variacao}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Estatísticas do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estatisticas.map((estatistica, index) => {
            const Icone = estatistica.icone;
            
            return (
              <Card key={index} className="shadow-sm border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${estatistica.bgColor}`}>
                      <Icone className={`w-5 h-5 ${estatistica.cor}`} />
                    </div>
                    {estatistica.tendencia && (
                      <div className="flex items-center gap-1">
                        {getTendenciaIcon(estatistica.tendencia)}
                        <span className={`text-xs font-medium ${
                          estatistica.tendencia === "up" ? "text-green-600" : 
                          estatistica.tendencia === "down" ? "text-red-600" : 
                          "text-gray-600"
                        }`}>
                          {getTendenciaTexto(estatistica.tendencia, estatistica.variacao)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">{estatistica.titulo}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {typeof estatistica.valor === "number" && estatistica.valor >= 1000 
                          ? estatistica.valor.toLocaleString() 
                          : estatistica.valor
                        }
                      </span>
                      {estatistica.unidade && (
                        <span className="text-sm text-gray-500">{estatistica.unidade}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Informações de Performance */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg text-blue-900">Performance do Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">CPU</span>
                <span className="font-medium text-gray-900">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Memória</span>
                <span className="font-medium text-gray-900">67%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "67%" }}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Disco</span>
                <span className="font-medium text-gray-900">23%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: "23%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 