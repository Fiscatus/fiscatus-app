import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuHamburgerProps {
  items: NavItem[];
  className?: string;
}

export function MenuHamburger({ items, className }: MenuHamburgerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Verifica se um item está ativo
  const isItemActive = (url: string) => {
    if (url === '/planejamento-da-contratacao') {
      return location.pathname === '/planejamento-da-contratacao' || location.pathname === '/';
    } else if (url === '/processos') {
      return location.pathname === '/processos' || location.pathname.startsWith('/processos/');
    } else if (url === '/processos-gerencia') {
      return location.pathname === '/processos-gerencia' || location.pathname.startsWith('/processos-gerencia/');
    } else if (url === '/assinaturas') {
      return location.pathname === '/assinaturas' || location.pathname.startsWith('/assinaturas/');
    } else if (url === '/modelos-de-fluxo') {
      return location.pathname === '/modelos-de-fluxo';
    }
    return location.pathname === url;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Botão do menu hambúrguer */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Abrir menu de navegação"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-600" />
        ) : (
          <Menu className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Menu dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay para fechar o menu */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={closeMenu}
            />
            
            {/* Menu dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
            >
              <div className="py-2">
                {items.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item.url);

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.url}
                        onClick={closeMenu}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-50",
                          isActive 
                            ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600" 
                            : "text-gray-700"
                        )}
                      >
                        <Icon className={cn(
                          "w-4 h-4",
                          isActive ? "text-blue-600" : "text-gray-500"
                        )} />
                        <span>{item.name}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
