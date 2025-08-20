import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DatePicker, DateRangePicker, YearCalendar } from "@/components/date";
import Topbar from "@/components/Topbar";
import { Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function CalendarioDemo() {
  const [singleDate, setSingleDate] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);
  const [selectedYearDate, setSelectedYearDate] = useState<string | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      
      <main className="pt-16 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-4 bg-blue-100 rounded-full">
                <Calendar className="w-10 h-10 text-blue-600" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Sistema de Calendário</h1>
            </div>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto">
              Demonstração do novo sistema de seletores de data com localização pt-BR, 
              feriados brasileiros e funcionalidades avançadas
            </p>
          </div>

          {/* Cards de funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <Calendar className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-blue-900 text-lg">Localização pt-BR</h3>
                <p className="text-sm text-blue-700">Meses e dias em português</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-green-900 text-lg">Feriados Brasileiros</h3>
                <p className="text-sm text-green-700">Cálculo automático</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <Clock className="w-10 h-10 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-purple-900 text-lg">Dias Úteis</h3>
                <p className="text-sm text-purple-700">Suporte completo</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-10 h-10 text-orange-600 mx-auto mb-3" />
                <h3 className="font-semibold text-orange-900 text-lg">Presets Rápidos</h3>
                <p className="text-sm text-orange-700">Seleções comuns</p>
              </CardContent>
            </Card>
          </div>

          {/* Componentes */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* DatePicker */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-blue-900">
                  <Calendar className="w-7 h-7" />
                  DatePicker - Data Única
                </CardTitle>
                <p className="text-blue-700 text-lg">Seletor de data única com presets e feriados</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  <DatePicker
                    value={singleDate}
                    onChange={setSingleDate}
                    label="Data de início"
                    placeholder="Selecione uma data"
                    showPresets={true}
                    withTime={false}
                    businessDaysOnly={true}
                    showHolidays={true}
                    className="w-full"
                    inputClassName="h-12 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  />
                  
                  <Separator className="my-6" />
                  
                  <div className="text-base p-4 bg-gray-50 rounded-lg">
                    <strong className="text-gray-900">Data selecionada:</strong> 
                    <span className="ml-2 text-blue-600 font-medium">
                      {singleDate || 'Nenhuma'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DateRangePicker */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-green-900">
                  <Calendar className="w-7 h-7" />
                  DateRangePicker - Intervalo
                </CardTitle>
                <p className="text-green-700 text-lg">Seletor de intervalo com estatísticas</p>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-6">
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    label="Período de execução"
                    placeholder="Selecione um período"
                    showPresets={true}
                    showRangeStats={true}
                    businessDaysOnly={true}
                    className="w-full"
                    inputClassName="h-12 text-lg border-2 border-gray-300 focus:border-green-500 focus:ring-green-200"
                  />
                  
                  <Separator className="my-6" />
                  
                  <div className="text-base p-4 bg-gray-50 rounded-lg">
                    <strong className="text-gray-900">Intervalo selecionado:</strong>
                    {dateRange ? (
                      <div className="mt-3 space-y-2">
                        <div className="text-green-600 font-medium">Início: {dateRange.start}</div>
                        <div className="text-green-600 font-medium">Fim: {dateRange.end}</div>
                      </div>
                    ) : (
                      <span className="ml-2 text-gray-500">Nenhum</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* YearCalendar */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-purple-900">
                <Calendar className="w-7 h-7" />
                YearCalendar - Visualização Anual
              </CardTitle>
              <p className="text-purple-700 text-lg">Visualização anual com grade 3x4 de meses</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="w-full">
                <YearCalendar
                  year={currentYear}
                  selectedDate={selectedYearDate}
                  onDateSelect={setSelectedYearDate}
                  onYearChange={setCurrentYear}
                  showHolidays={true}
                  showWeekends={true}
                />
              </div>
              
              <Separator className="my-8" />
              
              <div className="text-base p-4 bg-gray-50 rounded-lg">
                <strong className="text-gray-900">Data selecionada:</strong> 
                <span className="ml-2 text-purple-600 font-medium">
                  {selectedYearDate || 'Nenhuma'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Exemplos de uso no sistema */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-orange-900">
                <CheckCircle className="w-7 h-7" />
                Exemplos de Uso no Sistema
              </CardTitle>
              <p className="text-orange-700 text-lg">Como o novo calendário está sendo usado nos processos</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="font-semibold text-gray-900 text-xl">ProcessoDetalhes.tsx</h4>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-base text-gray-700 mb-4 font-medium">Prazo Final do Processo:</p>
                    <DatePicker
                      value={singleDate}
                      onChange={setSingleDate}
                      placeholder="Selecione a data"
                      showPresets={true}
                      businessDaysOnly={true}
                      minDate={new Date()}
                      className="w-full"
                      inputClassName="h-12 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h4 className="font-semibold text-gray-900 text-xl">DFDFormSection.tsx</h4>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-base text-gray-700 mb-4 font-medium">Data de Elaboração:</p>
                    <DatePicker
                      value={singleDate}
                      onChange={setSingleDate}
                      placeholder="Selecione a data"
                      showPresets={true}
                      businessDaysOnly={true}
                      className="w-full"
                      inputClassName="h-12 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h4 className="font-semibold text-gray-900 text-xl">EditarEtapaModal.tsx</h4>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-base text-gray-700 mb-4 font-medium">Prazo Previsto:</p>
                    <DatePicker
                      value={singleDate}
                      onChange={setSingleDate}
                      placeholder="Selecione a data"
                      showPresets={true}
                      businessDaysOnly={true}
                      minDate={new Date()}
                      className="w-full"
                      inputClassName="h-12 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h4 className="font-semibold text-gray-900 text-xl">NovoDFD.tsx</h4>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-base text-gray-700 mb-4 font-medium">Data de Conclusão:</p>
                    <DatePicker
                      value={singleDate}
                      onChange={setSingleDate}
                      placeholder="Selecione a data"
                      showPresets={true}
                      businessDaysOnly={true}
                      minDate={new Date()}
                      className="w-full"
                      inputClassName="h-12 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações técnicas */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                <CheckCircle className="w-7 h-7" />
                Informações Técnicas
              </CardTitle>
              <p className="text-gray-700 text-lg">Características e funcionalidades implementadas</p>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-xl">Funcionalidades</h4>
                  <ul className="text-base text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">✅ Localização pt-BR completa</li>
                    <li className="flex items-center gap-2">✅ Feriados brasileiros automáticos</li>
                    <li className="flex items-center gap-2">✅ Presets rápidos</li>
                    <li className="flex items-center gap-2">✅ Suporte a dias úteis</li>
                    <li className="flex items-center gap-2">✅ Design responsivo</li>
                    <li className="flex items-center gap-2">✅ Integração com react-hook-form</li>
                    <li className="flex items-center gap-2">✅ Tipagem TypeScript completa</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-xl">Componentes</h4>
                  <ul className="text-base text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">📅 DatePicker - Data única</li>
                    <li className="flex items-center gap-2">📅 DateRangePicker - Intervalo</li>
                    <li className="flex items-center gap-2">📅 YearCalendar - Visualização anual</li>
                    <li className="flex items-center gap-2">📅 DateField - Wrapper para formulários</li>
                    <li className="flex items-center gap-2">📅 InputField - Atualizado para datas</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 text-xl">Páginas Atualizadas</h4>
                  <ul className="text-base text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">✅ ProcessoDetalhes.tsx</li>
                    <li className="flex items-center gap-2">✅ DFDFormSection.tsx</li>
                    <li className="flex items-center gap-2">✅ EditarEtapaModal.tsx</li>
                    <li className="flex items-center gap-2">✅ NovoDFD.tsx</li>
                    <li className="flex items-center gap-2">✅ InputField.tsx</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
