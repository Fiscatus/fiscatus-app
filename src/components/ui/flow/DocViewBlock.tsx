import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Eye, 
  FileText, 
  ExternalLink,
  Maximize2
} from 'lucide-react';
import { ModelStage } from '@/types/flow';
import { useFlowStore } from '@/stores/flowStore';

interface DocViewBlockProps {
  stage: ModelStage;
  density: 'cozy' | 'compact';
}

export default function DocViewBlock({ stage, density }: DocViewBlockProps) {
  const { updateToolConfig } = useFlowStore();
  
  const docView = stage.toolConfig.doc_view;
  const previewMode = docView?.previewMode || 'modal';
  const fileName = docView?.fileName || '';
  const sizeMB = docView?.sizeMB || 0;
  
  const handlePreviewModeChange = (mode: 'modal' | 'new_tab') => {
    updateToolConfig(stage.id, {
      doc_view: {
        ...docView,
        previewMode: mode
      }
    });
  };
  
  const handleFileNameChange = (name: string) => {
    updateToolConfig(stage.id, {
      doc_view: {
        ...docView,
        fileName: name
      }
    });
  };
  
  const handleSizeChange = (size: number) => {
    updateToolConfig(stage.id, {
      doc_view: {
        ...docView,
        sizeMB: size
      }
    });
  };
  
  const isCompact = density === 'compact';
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-slate-500" />
        <span className="text-sm font-medium">Visualização de Documento</span>
      </div>
      
      {/* Preview do documento */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <div className="text-sm text-slate-600 mb-2">
          {fileName || 'documento.pdf'}
        </div>
        <div className="text-xs text-slate-500 mb-4">
          {sizeMB > 0 ? `${sizeMB} MB` : 'Tamanho não especificado'}
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs"
            disabled
          >
            {previewMode === 'modal' ? (
              <>
                <Maximize2 className="w-3 h-3 mr-1" />
                Abrir Modal
              </>
            ) : (
              <>
                <ExternalLink className="w-3 h-3 mr-1" />
                Nova Aba
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Configurações */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="preview-mode" className="text-sm font-medium">
            Modo de Visualização
          </Label>
          <Select
            value={previewMode}
            onValueChange={handlePreviewModeChange}
          >
            <SelectTrigger className={isCompact ? "h-8" : "h-9"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modal">Modal</SelectItem>
              <SelectItem value="new_tab">Nova Aba</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="file-name" className="text-sm font-medium">
            Nome do Arquivo
          </Label>
          <Input
            id="file-name"
            value={fileName}
            onChange={(e) => handleFileNameChange(e.target.value)}
            placeholder="documento.pdf"
            className={isCompact ? "h-8" : "h-9"}
          />
        </div>
        
        <div>
          <Label htmlFor="file-size" className="text-sm font-medium">
            Tamanho (MB)
          </Label>
          <Input
            id="file-size"
            type="number"
            value={sizeMB}
            onChange={(e) => handleSizeChange(parseFloat(e.target.value) || 0)}
            placeholder="2.5"
            step="0.1"
            min="0"
            className={isCompact ? "h-8" : "h-9"}
          />
        </div>
      </div>
      
      {/* Informações */}
      <div className="pt-3 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          <p className="mb-1">
            <strong>Modal:</strong> Abre o documento em uma janela sobreposta
          </p>
          <p>
            <strong>Nova Aba:</strong> Abre o documento em uma nova aba do navegador
          </p>
        </div>
      </div>
    </div>
  );
}
