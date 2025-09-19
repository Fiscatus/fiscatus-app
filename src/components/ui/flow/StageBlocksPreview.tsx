import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Settings2, 
  SquarePen, 
  LayoutPanelTop, 
  Rocket, 
  MessageSquareText, 
  FileSignature, 
  Eye,
  CheckCircle,
  Clock,
  User,
  FileText,
  Calendar
} from 'lucide-react';
import { ModelStage, StageTool } from '@/types/flow';
import { getToolMeta } from '@/lib/stageTools';

interface StageBlocksPreviewProps {
  stage: ModelStage;
}

const BlockPreview: React.FC<{ 
  tool: StageTool; 
  stage: ModelStage; 
  children: React.ReactNode 
}> = ({ tool, stage, children }) => {
  const meta = getToolMeta(tool);
  
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className={`p-1.5 rounded-md ${meta.color}`}>
            <meta.Icon className="w-4 h-4" />
          </div>
          {meta.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};

const ManagementPreview: React.FC<{ stage: ModelStage }> = ({ stage }) => {
  const config = stage.toolConfig?.management;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">Versões</span>
        <Badge variant={config?.allowVersions ? "default" : "secondary"}>
          {config?.allowVersions ? "Ativo" : "Inativo"}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">Anexos</span>
        <Badge variant={config?.allowAttachments ? "default" : "secondary"}>
          {config?.allowAttachments ? "Ativo" : "Inativo"}
        </Badge>
      </div>
      <div className="text-xs text-slate-500 italic">
        v1.2 • 3 anexos • Última atualização: 2 dias atrás
      </div>
    </div>
  );
};

const MainFormPreview: React.FC<{ stage: ModelStage }> = ({ stage }) => {
  const config = stage.toolConfig?.main_form;
  const requiredFields = config?.requiredFields || [];
  
  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-600">
        Modelo: <span className="font-medium">{config?.schemaId || 'Padrão'}</span>
      </div>
      {requiredFields.length > 0 && (
        <div>
          <div className="text-xs text-slate-600 mb-2">Campos obrigatórios:</div>
          <div className="flex flex-wrap gap-1">
            {requiredFields.map((field, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {field}
              </Badge>
            ))}
          </div>
        </div>
      )}
      <div className="text-xs text-slate-500 italic">
        5 campos preenchidos • 2 pendentes
      </div>
    </div>
  );
};

const StagePanelPreview: React.FC<{ stage: ModelStage }> = ({ stage }) => {
  const config = stage.toolConfig?.stage_panel;
  
  return (
    <div className="space-y-3">
      {config?.showSLA && (
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Progresso</span>
            <span className="text-sm font-medium">75%</span>
          </div>
          <Progress value={75} className="h-2" />
          <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
            <span>Iniciado: 15/01</span>
            <span>Prazo: 18/01</span>
          </div>
        </div>
      )}
      
      {config?.showChecklist && (
        <div className="space-y-2">
          <div className="text-xs text-slate-600">Checklist:</div>
          <div className="space-y-1">
            {[
              { label: "Documentos anexados", done: true },
              { label: "Formulário preenchido", done: true },
              { label: "Revisão técnica", done: false }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                {item.done ? (
                  <CheckCircle className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Clock className="w-3 h-3 text-slate-400" />
                )}
                <span className={item.done ? "text-slate-600" : "text-slate-500"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StageActionsPreview: React.FC<{ stage: ModelStage }> = ({ stage }) => {
  const config = stage.toolConfig?.stage_actions;
  const actions = config?.actions || [];
  
  const actionLabels = {
    send: "Enviar para análise",
    finish: "Concluir etapa",
    generate_doc: "Gerar documento"
  };
  
  return (
    <div className="space-y-2">
      {actions.map((action, index) => (
        <Button 
          key={index} 
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-xs"
          disabled
        >
          <Rocket className="w-3 h-3 mr-2" />
          {actionLabels[action]}
        </Button>
      ))}
      {actions.length === 0 && (
        <div className="text-xs text-slate-500 italic text-center py-2">
          Nenhuma ação configurada
        </div>
      )}
    </div>
  );
};

const CommentsPreview: React.FC<{ stage: ModelStage }> = ({ stage }) => {
  const config = stage.toolConfig?.comments;
  
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {[
          { author: "João Silva", message: "Documentos anexados conforme solicitado", time: "2h" },
          { author: "Maria Santos", message: "Aguardando parecer técnico", time: "1d" }
        ].map((comment, index) => (
          <div key={index} className="bg-slate-50 rounded-lg p-2">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3 h-3 text-slate-500" />
              <span className="text-xs font-medium">{comment.author}</span>
              <span className="text-xs text-slate-500">{comment.time}</span>
            </div>
            <p className="text-xs text-slate-600">{comment.message}</p>
          </div>
        ))}
      </div>
      {config?.allowMentions && (
        <div className="text-xs text-slate-500 italic">
          @menções habilitadas
        </div>
      )}
    </div>
  );
};

const SignaturesPreview: React.FC<{ stage: ModelStage }> = ({ stage }) => {
  const config = stage.toolConfig?.signatures;
  const signers = config?.signers || [];
  
  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-600 mb-2">Signatários:</div>
      <div className="space-y-2">
        {signers.map((signer, index) => (
          <div key={signer.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
            <div>
              <div className="text-xs font-medium">{signer.name}</div>
              {signer.role && (
                <div className="text-xs text-slate-500">{signer.role}</div>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              Pendente
            </Badge>
          </div>
        ))}
      </div>
      {signers.length === 0 && (
        <div className="text-xs text-slate-500 italic text-center py-2">
          Nenhum signatário configurado
        </div>
      )}
    </div>
  );
};

const DocViewPreview: React.FC<{ stage: ModelStage }> = ({ stage }) => {
  const config = stage.toolConfig?.doc_view;
  
  return (
    <div className="space-y-3">
      <div className="text-sm text-slate-600">
        Modo: <span className="font-medium">{config?.previewMode || 'Modal'}</span>
      </div>
      <div className="bg-slate-100 rounded-lg p-4 text-center">
        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <div className="text-xs text-slate-500">
          Preview do documento
        </div>
        <div className="text-xs text-slate-400 mt-1">
          DFD_v1.2.pdf • 2.3 MB
        </div>
      </div>
    </div>
  );
};

export default function StageBlocksPreview({ stage }: StageBlocksPreviewProps) {
  const renderBlockPreview = (tool: StageTool) => {
    switch (tool) {
      case 'management':
        return <ManagementPreview stage={stage} />;
      case 'main_form':
        return <MainFormPreview stage={stage} />;
      case 'stage_panel':
        return <StagePanelPreview stage={stage} />;
      case 'stage_actions':
        return <StageActionsPreview stage={stage} />;
      case 'comments':
        return <CommentsPreview stage={stage} />;
      case 'signatures':
        return <SignaturesPreview stage={stage} />;
      case 'doc_view':
        return <DocViewPreview stage={stage} />;
      default:
        return (
          <div className="text-xs text-slate-500 italic text-center py-2">
            Preview não disponível
          </div>
        );
    }
  };

  if (stage.tools.length === 0) {
    return (
      <Card className="rounded-2xl border shadow-sm">
        <CardContent className="p-6 text-center">
          <div className="text-slate-500">
            <Settings2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Nenhuma ferramenta ativa</p>
            <p className="text-xs mt-1">Configure ferramentas no painel direito</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-700">Pré-visualização dos Blocos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stage.toolsOrder.map((tool) => (
          <BlockPreview key={tool} tool={tool} stage={stage}>
            {renderBlockPreview(tool)}
          </BlockPreview>
        ))}
      </div>
    </div>
  );
}
