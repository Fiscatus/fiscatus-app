import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  X, 
  FileText, 
  Paperclip,
  Calendar,
  User
} from 'lucide-react';
import { ModelStage, VersionItem, AttachmentItem } from '@/types/flow';
import { useFlowStore } from '@/stores/flowStore';
import { cn } from '@/lib/utils';

interface ManagementBlockProps {
  stage: ModelStage;
  density: 'cozy' | 'compact';
}

export default function ManagementBlock({ stage, density }: ManagementBlockProps) {
  const { 
    addVersion, 
    removeVersion, 
    addAttachment, 
    removeAttachment,
    updateToolConfig 
  } = useFlowStore();
  
  const management = stage.toolConfig.management;
  const versions = management?.versions || [];
  const attachments = management?.attachments || [];
  
  const handleAddVersion = () => {
    const versionNumber = versions.length + 1;
    const newVersion: VersionItem = {
      id: `v${Date.now()}`,
      label: `v${versionNumber}.0`,
      createdAt: Date.now(),
      author: 'Usuário Atual' // Mock
    };
    addVersion(stage.id, newVersion);
  };
  
  const handleAddAttachment = () => {
    // Mock file picker
    const newAttachment: AttachmentItem = {
      id: `att${Date.now()}`,
      name: `documento-${attachments.length + 1}.pdf`,
      sizeKB: Math.floor(Math.random() * 5000) + 100,
      updatedAt: Date.now()
    };
    addAttachment(stage.id, newAttachment);
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const formatFileSize = (sizeKB: number) => {
    if (sizeKB < 1024) return `${sizeKB} KB`;
    return `${(sizeKB / 1024).toFixed(1)} MB`;
  };
  
  return (
    <div className="space-y-4">
      {/* Versões */}
      {management?.allowVersions && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-medium text-slate-700">Versões</h5>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddVersion}
              className="h-7 px-2 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Nova versão
            </Button>
          </div>
          
          {versions.length > 0 ? (
            <div className="space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded border"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-sm font-medium">{version.label}</span>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User className="w-3 h-3" />
                        <span>{version.author}</span>
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(version.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVersion(stage.id, version.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-slate-500">
              Nenhuma versão criada
            </div>
          )}
        </div>
      )}
      
      {/* Anexos */}
      {management?.allowAttachments && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-medium text-slate-700">Anexos</h5>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddAttachment}
              className="h-7 px-2 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Adicionar anexo
            </Button>
          </div>
          
          {attachments.length > 0 ? (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded border"
                >
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-sm font-medium">{attachment.name}</span>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{formatFileSize(attachment.sizeKB)}</span>
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(attachment.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(stage.id, attachment.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-slate-500">
              Nenhum anexo adicionado
            </div>
          )}
        </div>
      )}
      
      {/* Configurações rápidas */}
      <div className="pt-3 border-t border-slate-200">
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={management?.allowVersions || false}
              onChange={(e) => updateToolConfig(stage.id, {
                management: {
                  ...management,
                  allowVersions: e.target.checked
                }
              })}
              className="rounded"
            />
            <span>Permitir versões</span>
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={management?.allowAttachments || false}
              onChange={(e) => updateToolConfig(stage.id, {
                management: {
                  ...management,
                  allowAttachments: e.target.checked
                }
              })}
              className="rounded"
            />
            <span>Permitir anexos</span>
          </label>
        </div>
      </div>
    </div>
  );
}
