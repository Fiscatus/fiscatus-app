import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export default function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  rows = 3,
  className = ""
}: TextareaFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} border-gray-200 focus:border-blue-300 focus:ring-blue-200 resize-none`}
      />
    </div>
  );
} 