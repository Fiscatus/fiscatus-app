import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentHeaderProps {
  onClose: () => void;
}

export default function DocumentHeader({ onClose }: DocumentHeaderProps) {
  return (
    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-blue-600 text-lg">📄</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Visualizar Documento
        </h2>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
} 