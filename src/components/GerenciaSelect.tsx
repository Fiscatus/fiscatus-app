import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGerencias } from '@/hooks/useGerencias';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface GerenciaSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  showResponsavel?: boolean;
  filterByTipo?: 'gerencia' | 'diretoria' | 'assessoria' | 'comissao' | 'secretaria';
  className?: string;
}

export function GerenciaSelect({
  value,
  onValueChange,
  placeholder = "Selecione a gerência",
  disabled = false,
  required = false,
  showResponsavel = false,
  filterByTipo,
  className
}: GerenciaSelectProps) {
  const { gerencias, gerenciasOptions, loading, error } = useGerencias();

  // Filtrar gerências por tipo se especificado
  const filteredOptions = filterByTipo 
    ? gerenciasOptions.filter(option => {
        const gerencia = gerencias.find(g => g.nomeCompleto === option.value);
        return gerencia?.tipo === filterByTipo;
      })
    : gerenciasOptions;

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Erro ao carregar gerências: {error}</span>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {filteredOptions.map((gerencia) => (
            <SelectItem key={gerencia.value} value={gerencia.value}>
              <div className="flex flex-col">
                <span className="font-medium">{gerencia.label}</span>
                {showResponsavel && gerencia.responsavel && (
                  <span className="text-xs text-gray-500">
                    {gerencia.responsavel.nome} - {gerencia.responsavel.cargo}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {required && !value && (
        <p className="text-sm text-red-600">Gerência responsável é obrigatória</p>
      )}
    </div>
  );
}

/**
 * Componente para seleção de gerências com código
 */
export function GerenciaCodigoSelect({
  value,
  onValueChange,
  placeholder = "Selecione a gerência",
  disabled = false,
  required = false,
  className
}: Omit<GerenciaSelectProps, 'showResponsavel' | 'filterByTipo'>) {
  const { gerenciasSimpleOptions, loading, error } = useGerencias();

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Erro ao carregar gerências: {error}</span>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select 
        value={value} 
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {gerenciasSimpleOptions.map((gerencia) => (
            <SelectItem key={gerencia.value} value={gerencia.value}>
              <div className="flex flex-col">
                <span className="font-medium">{gerencia.label}</span>
                <span className="text-xs text-gray-500">{gerencia.nomeCompleto}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {required && !value && (
        <p className="text-sm text-red-600">Gerência responsável é obrigatória</p>
      )}
    </div>
  );
}
