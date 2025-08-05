import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X,
  User,
  Calendar
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const uploadSchema = z.object({
  arquivo: z.any().refine((files) => files?.length === 1, "Arquivo é obrigatório"),
  observacoes: z.string().optional()
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface EtapaUploadFormProps {
  etapa: {
    id: number;
    nome: string;
    nomeCompleto: string;
    gerencia: string;
  };
  onSubmit: (data: UploadFormData & { dataEnvio: string; enviadoPor: string }) => void;
  onCancel: () => void;
  isVisible: boolean;
}

export default function EtapaUploadForm({ 
  etapa, 
  onSubmit, 
  onCancel, 
  isVisible 
}: EtapaUploadFormProps) {
  const { user } = useUser();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema)
  });

  const watchedFile = watch("arquivo");

  const handleFileSelect = (file: File) => {
    if (file.type === "application/pdf" || file.type.startsWith("image/")) {
      setSelectedFile(file);
      setValue("arquivo", [file]);
    } else {
      alert("Apenas arquivos PDF ou imagens são permitidos.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValue("arquivo", null);
  };

  const onFormSubmit = async (data: UploadFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    // Simular delay de upload
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const submissionData = {
      ...data,
      dataEnvio: new Date().toLocaleString('pt-BR'),
      enviadoPor: user.nome
    };
    
    onSubmit(submissionData);
    setIsSubmitting(false);
    reset();
    setSelectedFile(null);
  };

  const handleCancel = () => {
    reset();
    setSelectedFile(null);
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <Card className="w-full max-w-2xl bg-white shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Upload className="w-6 h-6 text-blue-600" />
                Enviar Documento - Etapa {etapa.id}
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
            {/* Informações do usuário */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Responsável</p>
                  <p className="font-semibold text-gray-900">{user?.nome}</p>
                  <p className="text-xs text-gray-600">{user?.cargo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Data de Envio</p>
                  <p className="font-semibold text-gray-900">
                    {new Date().toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {new Date().toLocaleTimeString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload de arquivo */}
            <div className="space-y-2">
              <Label htmlFor="arquivo" className="text-sm font-medium text-gray-700">
                Documento da Etapa *
              </Label>
              
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${isDragging 
                    ? 'border-blue-400 bg-blue-50' 
                    : selectedFile 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-4"
                  >
                    <FileText className="w-8 h-8 text-green-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Arraste e solte seu arquivo aqui ou
                    </p>
                    <Button type="button" variant="outline" className="mb-2">
                      Selecionar Arquivo
                    </Button>
                    <p className="text-xs text-gray-500">
                      Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
                    </p>
                  </div>
                )}
                
                <Input
                  {...register("arquivo")}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              
              {errors.arquivo && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{errors.arquivo.message as string}</span>
                </div>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes" className="text-sm font-medium text-gray-700">
                Observações (opcional)
              </Label>
              <Textarea
                {...register("observacoes")}
                placeholder="Adicione observações sobre o documento ou etapa..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Botões de ação */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                Gerência: {etapa.gerencia}
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
                  disabled={!selectedFile || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enviando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Confirmar Envio
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
} 