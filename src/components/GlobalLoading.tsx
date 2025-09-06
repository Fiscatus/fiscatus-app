import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import logo from '@/assets/logo_fiscatus.png';

interface GlobalLoadingProps {
  message?: string;
  showLogo?: boolean;
}

export default function GlobalLoading({ 
  message = "Carregando...", 
  showLogo = true 
}: GlobalLoadingProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {showLogo && (
            <div className="flex justify-center">
              <img src={logo} alt="Logo Fiscatus" className="w-16 h-16" />
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Fiscatus
              </h2>
              <p className="text-gray-600">
                {message}
              </p>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Sistema de Gestão Pública
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
