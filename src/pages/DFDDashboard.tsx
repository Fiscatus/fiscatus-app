import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FolderOpen, Users, Files, Bell, PenLine, CalendarX, AlarmClock, Clipboard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logoFiscatus from "@/assets/logo_fiscatus.png";
import Topbar from "@/components/Topbar";

const overviewData = [
  { title: "DFDs da minha gerência", icon: <FolderOpen className="w-7 h-7 text-blue-900" />, value: 7, helper: "processos ativos", border: "border-blue-900/20" },
  { title: "DFDs que estou participando", icon: <Users className="w-7 h-7 text-cyan-700" />, value: 3, helper: "em andamento", border: "border-cyan-700/20" },
  { title: "ETPs pendentes na gestão", icon: <Files className="w-7 h-7 text-blue-400" />, value: 2, helper: "aguardando elaboração", border: "border-blue-400/20" },
  { title: "Minhas pendências", icon: <Bell className="w-7 h-7 text-orange-500" />, value: 1, helper: "DFD aguardando análise", border: "border-orange-500/20" },
  { title: "Assinaturas pendentes", icon: <PenLine className="w-7 h-7 text-purple-400" />, value: 2, helper: "aguardando assinatura", border: "border-purple-400/20" },
  { title: "Processos com prazo vencido", icon: <CalendarX className="w-7 h-7 text-red-500" />, value: 1, helper: "etapa atrasada", border: "border-red-500/20" },
];

const processTableData = [
  { numero: "DFD 010/2025", objeto: "Aquisição de equipamentos de informática", etapa: "Análise de ETP", prazo: "26/07/2025", status: "Em andamento", statusColor: "bg-yellow-100 text-yellow-800", atrasado: false },
  { numero: "DFD 011/2025", objeto: "Contratação de serviços de limpeza", etapa: "Aguardando assinatura", prazo: "24/07/2025", status: "Atrasado", statusColor: "bg-red-100 text-red-700 font-medium", atrasado: true },
];

function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white shadow-sm flex items-center justify-between px-8 z-20" style={{ minHeight: 64 }}>
      <div className="flex items-center gap-3">
        <img src={logoFiscatus} alt="Logo Fiscatus" className="h-10 w-auto" />
      </div>
      <span className="text-lg font-semibold text-gray-700 tracking-wide">Planejamento de Contratação</span>
    </header>
  );
}

function OverviewCard({ title, icon, value, helper, border }: any) {
  return (
    <Card className={`flex flex-col justify-between min-h-[140px] shadow-sm border-2 ${border} bg-white rounded-2xl p-4 items-start transition-all`}> {/* ícone menor, padding menor */}
      <div className="flex items-center gap-3 mb-2"> {/* gap menor */}
        <div className="border-2 rounded-xl p-1 flex items-center justify-center bg-gray-50" style={{ borderColor: 'inherit' }}>{icon}</div>
        <span className="text-sm font-medium text-gray-500">{title}</span>
      </div>
      <span className="text-3xl font-bold text-gray-900 mb-1">{value}</span>
      <span className="text-xs text-gray-400 font-medium mt-auto">{helper}</span>
    </Card>
  );
}

function QuickActionButton({ icon, label, color, onClick }: any) {
  return (
    <Button
      variant="outline"
      className={`flex items-center gap-2 py-3 px-8 rounded-xl shadow-sm border-2 border-gray-200 text-base font-semibold hover:bg-gray-50 transition ${color}`}
      onClick={onClick}
    >
      <span className="text-2xl">{icon}</span>
      {label}
    </Button>
  );
}

function ProcessTable() {
  return (
    <Card className="mt-10 bg-white rounded-2xl shadow-sm border p-0 w-full max-h-[60vh] overflow-y-auto">
      <CardHeader className="flex flex-row items-center gap-2 px-6 pt-6 pb-2">
        <Clipboard className="w-6 h-6 text-blue-900" />
        <CardTitle className="text-lg font-semibold text-gray-900">Meus Processos Ativos</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow>
              <TableHead className="text-black uppercase text-xs py-3 min-w-[120px] align-middle text-left pl-6">Nº do Processo</TableHead>
              <TableHead className="text-black uppercase text-xs py-3 w-[30%] min-w-[280px] align-middle text-left">Objeto do Processo</TableHead>
              <TableHead className="text-black uppercase text-xs py-3 min-w-[160px] align-middle text-center">Etapa Atual</TableHead>
              <TableHead className="text-black uppercase text-xs py-3 min-w-[120px] align-middle text-center">Prazo Final</TableHead>
              <TableHead className="text-black uppercase text-xs py-3 min-w-[120px] align-middle text-center">Status</TableHead>
              <TableHead className="text-black uppercase text-xs py-3 min-w-[100px] align-middle text-center">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processTableData.map((proc, idx) => (
              <TableRow key={idx} className="hover:bg-gray-50 text-sm">
                <TableCell className="py-3 align-middle text-left pl-6">{proc.numero}</TableCell>
                <TableCell className="py-3 align-middle w-[30%] min-w-[280px] text-left">{proc.objeto}</TableCell>
                <TableCell className="py-3 align-middle text-center">{proc.etapa}</TableCell>
                <TableCell className="py-3 align-middle text-center">{proc.prazo}</TableCell>
                <TableCell className="py-3 align-middle text-center">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${proc.statusColor}`}>{proc.status}</span>
                </TableCell>
                <TableCell className="py-3 align-middle text-center">
                  <Button size="sm" variant="outline" className="border border-gray-300">Acessar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function DFDDashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex flex-col max-w-[100vw]">
      <Topbar />
      <main className="flex-1 flex flex-col pt-20 px-2 sm:px-4 md:px-8 w-full max-w-[100vw] mx-auto">
        {/* Grid de cards de visão geral fullscreen e responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 w-full mb-4">
          {overviewData.map((item, idx) => (
            <OverviewCard key={idx} {...item} />
          ))}
        </div>
        {/* Tabela fullwidth, área maior */}
        <div className="w-full flex-1 flex flex-col">
          <ProcessTable />
        </div>
      </main>
    </div>
  );
} 