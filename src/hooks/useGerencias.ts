import { useState, useEffect, useCallback } from 'react';
import { fetchGerencias, fetchGerenciasByTipo, fetchGerenciaById, gerenciasToOptions, gerenciasToSimpleOptions, type Gerencia } from '@/services/gerenciasService';

interface UseGerenciasReturn {
  gerencias: Gerencia[];
  gerenciasOptions: Array<{ value: string; label: string; codigo: string; responsavel?: any }>;
  gerenciasSimpleOptions: Array<{ value: string; label: string; nomeCompleto: string }>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getGerenciaById: (id: string) => Gerencia | undefined;
  getGerenciaByCodigo: (codigo: string) => Gerencia | undefined;
  getGerenciaByNome: (nome: string) => Gerencia | undefined;
  getGerenciasByTipo: (tipo: Gerencia['tipo']) => Gerencia[];
}

/**
 * Hook para gerenciar gerências do sistema
 */
export function useGerencias(): UseGerenciasReturn {
  const [gerencias, setGerencias] = useState<Gerencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchGerencias();
      setGerencias(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar gerências');
      console.error('Erro no hook useGerencias:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const gerenciasOptions = gerenciasToOptions(gerencias);
  const gerenciasSimpleOptions = gerenciasToSimpleOptions(gerencias);

  const getGerenciaById = useCallback((id: string): Gerencia | undefined => {
    return gerencias.find(g => g.id === id);
  }, [gerencias]);

  const getGerenciaByCodigo = useCallback((codigo: string): Gerencia | undefined => {
    return gerencias.find(g => g.codigo === codigo);
  }, [gerencias]);

  const getGerenciaByNome = useCallback((nome: string): Gerencia | undefined => {
    return gerencias.find(g => 
      g.nome === nome || 
      g.nomeCompleto === nome ||
      g.nome.toLowerCase().includes(nome.toLowerCase()) ||
      g.nomeCompleto.toLowerCase().includes(nome.toLowerCase())
    );
  }, [gerencias]);

  const getGerenciasByTipo = useCallback((tipo: Gerencia['tipo']): Gerencia[] => {
    return gerencias.filter(g => g.tipo === tipo);
  }, [gerencias]);

  return {
    gerencias,
    gerenciasOptions,
    gerenciasSimpleOptions,
    loading,
    error,
    refetch: fetchData,
    getGerenciaById,
    getGerenciaByCodigo,
    getGerenciaByNome,
    getGerenciasByTipo
  };
}

/**
 * Hook para buscar gerências por tipo específico
 */
export function useGerenciasByTipo(tipo: Gerencia['tipo']) {
  const [gerencias, setGerencias] = useState<Gerencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchGerenciasByTipo(tipo);
        setGerencias(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar gerências');
        console.error('Erro no hook useGerenciasByTipo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tipo]);

  return {
    gerencias,
    gerenciasOptions: gerenciasToOptions(gerencias),
    loading,
    error
  };
}

/**
 * Hook para buscar uma gerência específica por ID
 */
export function useGerenciaById(id: string) {
  const [gerencia, setGerencia] = useState<Gerencia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setGerencia(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchGerenciaById(id);
        setGerencia(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar gerência');
        console.error('Erro no hook useGerenciaById:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return {
    gerencia,
    loading,
    error
  };
}
