import React from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface MultiSelectFieldProps {
  label: string;
  name: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export default function MultiSelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  placeholder = "Selecione as opções",
  className = ""
}: MultiSelectFieldProps) {
  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {/* Chips selecionados */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((selectedValue) => {
            const option = options.find(opt => opt.value === selectedValue);
            return (
              <Badge key={selectedValue} variant="secondary" className="flex items-center gap-1">
                {option?.label}
                <button
                  type="button"
                  onClick={() => handleRemove(selectedValue)}
                  className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Opções disponíveis */}
      <div className="border border-gray-200 rounded-md p-2 min-h-[40px] bg-white">
        <div className="flex flex-wrap gap-1">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              disabled={disabled}
              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                value.includes(option.value)
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 