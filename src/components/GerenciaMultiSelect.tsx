import React from 'react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, ChevronDown } from 'lucide-react';
import { useGerencias } from '@/hooks/useGerencias';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';

interface GerenciaMultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  filterByTipo?: 'gerencia' | 'diretoria' | 'assessoria' | 'comissao' | 'secretaria';
  className?: string;
  // Lista de nomes completos (nomeCompleto) de gerências a serem ocultadas das opções
  excludeValues?: string[];
}

export function GerenciaMultiSelect({
  value,
  onValueChange,
  placeholder = "Selecione as gerências",
  disabled = false,
  required = false,
  filterByTipo,
  className,
  excludeValues = []
}: GerenciaMultiSelectProps) {
  const { gerencias, loading, error } = useGerencias();

  // Filtrar gerências por tipo se especificado
  const filteredGerencias = (filterByTipo 
    ? gerencias.filter(gerencia => gerencia.tipo === filterByTipo)
    : gerencias)
    // Remover gerências explicitamente excluídas
    .filter(gerencia => !excludeValues.includes(gerencia.nomeCompleto));

  const handleToggleGerencia = (gerenciaNomeCompleto: string) => {
    if (value.includes(gerenciaNomeCompleto)) {
      onValueChange(value.filter(v => v !== gerenciaNomeCompleto));
    } else {
      onValueChange([...value, gerenciaNomeCompleto]);
    }
  };

  const handleRemoveGerencia = (gerenciaNomeCompleto: string) => {
    onValueChange(value.filter(v => v !== gerenciaNomeCompleto));
  };

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

  // Obter apenas o nome da gerência (sem o responsável) para exibição
  const getGerenciaDisplayName = (nomeCompleto: string) => {
    const gerencia = gerencias.find(g => g.nomeCompleto === nomeCompleto);
    return gerencia ? gerencia.nomeCompleto : nomeCompleto;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className="w-full justify-between h-12 border-gray-300 focus:border-green-500 focus:ring-green-200"
          >
            <span className="truncate">
              {value.length === 0 
                ? placeholder 
                : value.length === 1 
                  ? getGerenciaDisplayName(value[0])
                  : `${value.length} gerência${value.length > 1 ? 's' : ''} selecionada${value.length > 1 ? 's' : ''}`
              }
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-2 max-h-60 overflow-y-auto">
            {filteredGerencias.length === 0 ? (
              <div className="text-sm text-gray-500 p-2">
                Nenhuma gerência disponível
              </div>
            ) : (
              <div className="space-y-1">
                {filteredGerencias.map((gerencia) => (
                  <div
                    key={gerencia.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => handleToggleGerencia(gerencia.nomeCompleto)}
                  >
                    <Checkbox
                      checked={value.includes(gerencia.nomeCompleto)}
                      onChange={() => handleToggleGerencia(gerencia.nomeCompleto)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {gerencia.nomeCompleto}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Chips das gerências selecionadas */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((gerenciaNomeCompleto) => (
            <Badge 
              key={gerenciaNomeCompleto} 
              variant="secondary" 
              className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              {getGerenciaDisplayName(gerenciaNomeCompleto)}
              <button
                type="button"
                onClick={() => handleRemoveGerencia(gerenciaNomeCompleto)}
                className="ml-1 hover:bg-blue-300 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {required && value.length === 0 && (
        <p className="text-sm text-red-600">Seleção de gerências é obrigatória</p>
      )}
    </div>
  );
}
