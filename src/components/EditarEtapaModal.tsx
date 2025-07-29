import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Edit3, 
  X,
  Save,
  Calendar,
  User,
  Building,
  FileText,
  AlertCircle
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const editarEtapaSchema = z.object({
  responsavel: z.string().min(2, "Nome do responsável é obrigatório"),
  cargo: z.string().min(2, "Cargo é obrigatório"),
  gerencia: z.string().min(2, "Gerência é obrigatória"),
  prazoPrevisao: z.string().min(1, "Prazo é obrigatório"),
  observacoes: z.string().optional()
});

type EditarEtapaFormData = z.infer<typeof editarEtapaSchema>;

interface EditarEtapaModalProps {
  etapa: {
    id: number;
    nome: string;
    nomeCompleto: string;
    responsavel: string;
    cargo: string;
    gerencia: string;
    prazoPrevisao: string;
    observacoes?: string;
  } | null;
  isVisible: boolean;
  onSave: (data: EditarEtapaFormData) => void;
  onCancel: () => void;
}

export default function EditarEtapaModal({
  etapa,
  isVisible,
  onSave,
  onCancel
}: EditarEtapaModalProps) {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue
  } = useForm<EditarEtapaFormData>({
    resolver: zodResolver(editarEtapaSchema)
  });

  // Preencher formulário quando etapa mudar
  useEffect(() => {
    if (etapa && isVisible) {
      setValue("responsavel", etapa.responsavel);
      setValue("cargo", etapa.cargo);
      setValue("gerencia", etapa.gerencia);
      setValue("prazoPrevisao", etapa.prazoPrevisao);
      setValue("observacoes", etapa.observacoes || "");
    }
  }, [etapa, isVisible, setValue]);

  const onFormSubmit = async (data: EditarEtapaFormData) => {
    setIsSubmitting(true);
    
    // Simular delay de salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave(data);
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  if (!isVisible || !etapa) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-white shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <Edit3 className="w-6 h-6 text-yellow-600" />
                    Editar Dados da Etapa {etapa.id}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{etapa.nomeCompleto}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                {/* Informações do Editor */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm font-medium text-yellow-800">Editor Atual</p>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>{user?.nome}</strong> - {user?.cargo}
                  </p>
                  <p className="text-xs text-gray-600">{user?.gerencia}</p>
                </div>

                {/* Responsável */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsavel" className="text-sm font-medium text-gray-700">
                      Responsável *
                    </Label>
                    <Input
                      {...register("responsavel")}
                      placeholder="Nome do responsável"
                      className={errors.responsavel ? "border-red-300" : ""}
                    />
                    {errors.responsavel && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors.responsavel.message}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargo" className="text-sm font-medium text-gray-700">
                      Cargo *
                    </Label>
                    <Input
                      {...register("cargo")}
                      placeholder="Cargo do responsável"
                      className={errors.cargo ? "border-red-300" : ""}
                    />
                    {errors.cargo && (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{errors.cargo.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gerência */}
                <div className="space-y-2">
                  <Label htmlFor="gerencia" className="text-sm font-medium text-gray-700">
                    Gerência Responsável *
                  </Label>
                  <Input
                    {...register("gerencia")}
                    placeholder="Nome da gerência"
                    className={errors.gerencia ? "border-red-300" : ""}
                  />
                  {errors.gerencia && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.gerencia.message}</span>
                    </div>
                  )}
                </div>

                {/* Prazo */}
                <div className="space-y-2">
                  <Label htmlFor="prazoPrevisao" className="text-sm font-medium text-gray-700">
                    Prazo Previsto *
                  </Label>
                  <Input
                    {...register("prazoPrevisao")}
                    type="date"
                    className={errors.prazoPrevisao ? "border-red-300" : ""}
                  />
                  {errors.prazoPrevisao && (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">{errors.prazoPrevisao.message}</span>
                    </div>
                  )}
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700">
                    Observações
                  </Label>
                  <Textarea
                    {...register("observacoes")}
                    placeholder="Adicione observações sobre a etapa..."
                    className="min-h-[100px] resize-none"
                  />
                </div>

                {/* Aviso sobre alterações */}
                {isDirty && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-2 text-blue-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Existem alterações não salvas
                      </span>
                    </div>
                  </motion.div>
                )}

                {/* Botões de ação */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                    <Building className="w-3 h-3 mr-1" />
                    Etapa {etapa.id}
                  </Badge>
                  
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !isDirty}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Salvando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Salvar Alterações
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 