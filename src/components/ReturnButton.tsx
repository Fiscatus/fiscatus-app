import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ReturnButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function ReturnButton({ 
  className = '', 
  variant = 'ghost',
  size = 'default'
}: ReturnButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Função para determinar o destino e texto do botão baseado na rota atual
  const getReturnConfig = () => {
    const path = location.pathname;
    
    // Página: Visualização de um processo específico em "Meus Processos"
    if (path.match(/^\/processos\/[^\/]+$/)) {
      return {
        destination: '/processos',
        text: 'Voltar para Meus Processos'
      };
    }
    
    // Página: Visualização de um processo específico em "Processos da Minha Gerência"
    if (path.match(/^\/processos-gerencia\/[^\/]+$/)) {
      return {
        destination: '/processos-gerencia',
        text: 'Voltar para Processos da Gerência'
      };
    }
    
    // Página: Visualização de documento ou card específico dentro de um processo
    if (path.match(/^\/processos\/[^\/]+\/documento\/[^\/]+$/)) {
      // Extrair o ID do processo da URL
      const processId = path.split('/')[2];
      return {
        destination: `/processos/${processId}`,
        text: 'Voltar para o Processo'
      };
    }
    
    // Página: Página Principal de "Meus Processos"
    if (path === '/processos') {
      return {
        destination: '/dfd',
        text: 'Voltar para o Dashboard'
      };
    }
    
    // Página: Página Principal de "Minhas Assinaturas"
    if (path === '/assinaturas') {
      return {
        destination: '/dfd',
        text: 'Voltar para o Dashboard'
      };
    }
    
    // Página: Assinatura de Documentos (modal ou página específica)
    if (path.match(/^\/assinaturas\/[^\/]+$/)) {
      return {
        destination: '/assinaturas',
        text: 'Voltar para Minhas Assinaturas'
      };
    }
    
    // Página: Novo Processo
    if (path === '/novo-processo') {
      return {
        destination: '/processos',
        text: 'Voltar para Meus Processos'
      };
    }
    
    // Página: Novo DFD
    if (path === '/dfd/novo') {
      return {
        destination: '/dfd',
        text: 'Voltar para o Dashboard'
      };
    }
    
    // Página: Pasta Organizacional
    if (path.match(/^\/processos-gerencia\/pasta\/[^\/]+$/)) {
      return {
        destination: '/processos-gerencia',
        text: 'Voltar para Processos da Gerência'
      };
    }
    
    // Página: Processos da Gerência
    if (path === '/processos-gerencia') {
      return {
        destination: '/dfd',
        text: 'Voltar para o Dashboard'
      };
    }
    
    // Fallback: usar router.back() para páginas não mapeadas
    return {
      destination: null,
      text: 'Voltar'
    };
  };

  const handleReturn = () => {
    const config = getReturnConfig();
    
    if (config.destination) {
      navigate(config.destination);
    } else {
      // Fallback para router.back()
      navigate(-1);
    }
  };

  const config = getReturnConfig();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleReturn}
      className={`flex items-center gap-2 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {config.text}
    </Button>
  );
} 