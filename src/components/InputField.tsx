import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "number" | "date";
  className?: string;
}

export default function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  type = "text",
  className = ""
}: InputFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} border-gray-200 focus:border-blue-300 focus:ring-blue-200`}
      />
    </div>
  );
} 