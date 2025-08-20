import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Users } from "lucide-react";

interface EquipeMember {
  id: string;
  nome: string;
  setor: string;
  funcao: string;
}

interface EquipeMemberFieldProps {
  label: string;
  members: EquipeMember[];
  onChange: (members: EquipeMember[]) => void;
  className?: string;
}

export default function EquipeMemberField({
  label,
  members,
  onChange,
  className = ""
}: EquipeMemberFieldProps) {
  const addMember = () => {
    const newMember: EquipeMember = {
      id: Date.now().toString(),
      nome: "",
      setor: "",
      funcao: ""
    };
    onChange([...members, newMember]);
  };

  const removeMember = (id: string) => {
    onChange(members.filter(member => member.id !== id));
  };

  const updateMember = (id: string, field: keyof EquipeMember, value: string) => {
    onChange(members.map(member => 
      member.id === id ? { ...member, [field]: value } : member
    ));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Users className="w-4 h-4" />
          {label}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMember}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Membro
        </Button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm">Nenhum membro adicionado</p>
          <p className="text-xs">Clique em "Adicionar Membro" para começar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Membro #{members.indexOf(member) + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMember(member.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Nome Completo</Label>
                  <Input
                    value={member.nome}
                    onChange={(e) => updateMember(member.id, 'nome', e.target.value)}
                    placeholder="Nome completo"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Setor</Label>
                  <Input
                    value={member.setor}
                    onChange={(e) => updateMember(member.id, 'setor', e.target.value)}
                    placeholder="Setor"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-600">Função</Label>
                  <Input
                    value={member.funcao}
                    onChange={(e) => updateMember(member.id, 'funcao', e.target.value)}
                    placeholder="Função"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 