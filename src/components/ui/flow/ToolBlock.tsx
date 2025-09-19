import React from 'react';
import { 
  GripVertical, 
  X, 
  Settings, 
  CheckCircle, 
  Clock, 
  User, 
  FileText, 
  Calendar,
  Progress,
  Rocket,
  MessageSquareText,
  FileSignature,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress as ProgressBar } from '@/components/ui/progress';
import { StageTool, DensityMode } from '@/types/flow';
import { getToolMeta } from '@/lib/stageTools';

interface ToolBlockProps {
  tool: StageTool;
  density?: DensityMode;
  onRemove?: () => void;
  onConfigure?: () => void;
  isDragging?: boolean;
}

const ManagementPreview: React.FC<{ density: DensityMode }> = ({ density }) => {
  const isCompact = density === 'compact';
  
  return (
    <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
      <div className={`flex items-center justify-between ${isCompact ? 'text-xs' : 'text-sm'}`}>
        <span className="text-slate-600">Versões</span>
        <Badge variant="default" className="text-xs">v1.2</Badge>
      </div>
      <div className={`flex items-center justify-between ${isCompact ? 'text-xs' : 'text-sm'}`}>
        <span className="text-slate-600">Anexos</span>
        <Badge variant="default" className="text-xs">3</Badge>
      </div>
      <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-500 italic`}>
        Última atualização: 2 dias atrás
      </div>
    </div>
  );
};

const MainFormPreview: React.FC<{ density: DensityMode }> = ({ density }) => {
  const isCompact = density === 'compact';
  
  return (
    <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
      <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-600`}>
        Modelo: <span className="font-medium">DFD</span>
      </div>
      <div>
        <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-600 mb-1`}>Campos obrigatórios:</div>
        <div className="flex flex-wrap gap-1">
          {['Objeto', 'Justificativa'].map((field, index) => (
            <Badge key={index} variant="outline" className={isCompact ? 'text-xs' : 'text-sm'}>
              {field}
            </Badge>
          ))}
        </div>
      </div>
      <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-500 italic`}>
        5 campos preenchidos • 2 pendentes
      </div>
    </div>
  );
};

const StagePanelPreview: React.FC<{ density: DensityMode }> = ({ density }) => {
  const isCompact = density === 'compact';
  
  return (
    <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
      <div>
        <div className={`flex items-center justify-between ${isCompact ? 'text-xs' : 'text-sm'} mb-2`}>
          <span className="text-slate-600">Progresso</span>
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium`}>75%</span>
        </div>
        <ProgressBar value={75} className="h-2" />
        <div className={`flex items-center justify-between ${isCompact ? 'text-xs' : 'text-sm'} text-slate-500 mt-1`}>
          <span>Iniciado: 15/01</span>
          <span>Prazo: 18/01</span>
        </div>
      </div>
      
      <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
        <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-600`}>Checklist:</div>
        <div className="space-y-1">
          {[
            { label: "Documentos anexados", done: true },
            { label: "Formulário preenchido", done: true },
            { label: "Revisão técnica", done: false }
          ].map((item, index) => (
            <div key={index} className={`flex items-center gap-2 ${isCompact ? 'text-xs' : 'text-sm'}`}>
              {item.done ? (
                <CheckCircle className={isCompact ? 'w-3 h-3 text-emerald-500' : 'w-4 h-4 text-emerald-500'} />
              ) : (
                <Clock className={isCompact ? 'w-3 h-3 text-slate-400' : 'w-4 h-4 text-slate-400'} />
              )}
              <span className={item.done ? "text-slate-600" : "text-slate-500"}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StageActionsPreview: React.FC<{ density: DensityMode }> = ({ density }) => {
  const isCompact = density === 'compact';
  
  return (
    <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
      {[
        { label: "Enviar para análise", icon: Rocket },
        { label: "Concluir etapa", icon: CheckCircle },
        { label: "Gerar documento", icon: FileText }
      ].map((action, index) => (
        <Button 
          key={index} 
          variant="outline" 
          size={isCompact ? "sm" : "default"}
          className={`w-full justify-start ${isCompact ? 'text-xs' : 'text-sm'}`}
          disabled
        >
          <action.icon className={isCompact ? 'w-3 h-3 mr-2' : 'w-4 h-4 mr-2'} />
          {action.label}
        </Button>
      ))}
    </div>
  );
};

const CommentsPreview: React.FC<{ density: DensityMode }> = ({ density }) => {
  const isCompact = density === 'compact';
  
  return (
    <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
      <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
        {[
          { author: "João Silva", message: "Documentos anexados conforme solicitado", time: "2h" },
          { author: "Maria Santos", message: "Aguardando parecer técnico", time: "1d" }
        ].map((comment, index) => (
          <div key={index} className={`bg-slate-50 rounded-lg ${isCompact ? 'p-2' : 'p-3'}`}>
            <div className="flex items-center gap-2 mb-1">
              <User className={isCompact ? 'w-3 h-3 text-slate-500' : 'w-4 h-4 text-slate-500'} />
              <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium`}>{comment.author}</span>
              <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-500`}>{comment.time}</span>
            </div>
            <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-600`}>{comment.message}</p>
          </div>
        ))}
      </div>
      <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-500 italic`}>
        @menções habilitadas
      </div>
    </div>
  );
};

const SignaturesPreview: React.FC<{ density: DensityMode }> = ({ density }) => {
  const isCompact = density === 'compact';
  
  return (
    <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
      <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-600 mb-2`}>Signatários:</div>
      <div className={isCompact ? 'space-y-1' : 'space-y-2'}>
        {[
          { name: "João Silva", role: "Gerente", status: "Pendente" },
          { name: "Maria Santos", role: "Coordenador", status: "Pendente" }
        ].map((signer, index) => (
          <div key={index} className={`flex items-center justify-between ${isCompact ? 'p-2' : 'p-3'} bg-slate-50 rounded-lg`}>
            <div>
              <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium`}>{signer.name}</div>
              <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-500`}>{signer.role}</div>
            </div>
            <Badge variant="secondary" className={isCompact ? 'text-xs' : 'text-sm'}>
              {signer.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

const DocViewPreview: React.FC<{ density: DensityMode }> = ({ density }) => {
  const isCompact = density === 'compact';
  
  return (
    <div className={isCompact ? 'space-y-2' : 'space-y-3'}>
      <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-600`}>
        Modo: <span className="font-medium">Modal</span>
      </div>
      <div className={`bg-slate-100 rounded-lg ${isCompact ? 'p-3' : 'p-4'} text-center`}>
        <FileText className={isCompact ? 'w-6 h-6 text-slate-400 mx-auto mb-2' : 'w-8 h-8 text-slate-400 mx-auto mb-2'} />
        <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-500`}>
          Preview do documento
        </div>
        <div className={`${isCompact ? 'text-xs' : 'text-sm'} text-slate-400 mt-1`}>
          DFD_v1.2.pdf • 2.3 MB
        </div>
      </div>
    </div>
  );
};

export default function ToolBlock({ 
  tool, 
  density = 'cozy', 
  onRemove, 
  onConfigure, 
  isDragging = false 
}: ToolBlockProps) {
  const meta = getToolMeta(tool);
  
  const renderPreview = () => {
    switch (tool) {
      case 'management':
        return <ManagementPreview density={density} />;
      case 'main_form':
        return <MainFormPreview density={density} />;
      case 'stage_panel':
        return <StagePanelPreview density={density} />;
      case 'stage_actions':
        return <StageActionsPreview density={density} />;
      case 'comments':
        return <CommentsPreview density={density} />;
      case 'signatures':
        return <SignaturesPreview density={density} />;
      case 'doc_view':
        return <DocViewPreview density={density} />;
      default:
        return (
          <div className={`${density === 'compact' ? 'text-xs' : 'text-sm'} text-slate-500 italic text-center py-2`}>
            Preview não disponível
          </div>
        );
    }
  };

  return (
    <div
      className={`
        rounded-xl border bg-white shadow-sm transition-all
        ${isDragging ? 'opacity-50 shadow-lg' : 'hover:shadow-md'}
        ${density === 'compact' ? 'p-2 md:p-3' : 'p-3 md:p-4'}
      `}
    >
      {/* Cabeçalho do bloco */}
      <div className={`flex items-center justify-between ${density === 'compact' ? 'mb-2' : 'mb-3'}`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${meta.color}`}>
            <meta.Icon className={density === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} />
          </div>
          <h4 className={`font-medium ${density === 'compact' ? 'text-sm' : 'text-base'}`}>
            {meta.label}
          </h4>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            className="p-1 rounded-full hover:bg-slate-200 transition-colors opacity-60 hover:opacity-100"
            aria-label="Arrastar"
          >
            <GripVertical className={density === 'compact' ? 'w-3 h-3 text-slate-500' : 'w-4 h-4 text-slate-500'} />
          </button>
          {onConfigure && (
            <button
              onClick={onConfigure}
              className="p-1 rounded-full hover:bg-slate-200 transition-colors opacity-60 hover:opacity-100"
              aria-label="Configurar"
            >
              <Settings className={density === 'compact' ? 'w-3 h-3 text-slate-500' : 'w-4 h-4 text-slate-500'} />
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="p-1 rounded-full hover:bg-slate-200 transition-colors opacity-60 hover:opacity-100"
              aria-label="Remover"
            >
              <X className={density === 'compact' ? 'w-3 h-3 text-slate-500' : 'w-4 h-4 text-slate-500'} />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo de preview */}
      {renderPreview()}
    </div>
  );
}