import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DateField from "./DateField";

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
  // Props específicas para data
  showPresets?: boolean;
  businessDaysOnly?: boolean;
  minDate?: Date;
  maxDate?: Date;
  withTime?: boolean;
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
  className = "",
  // Props específicas para data
  showPresets = true,
  businessDaysOnly = false,
  minDate,
  maxDate,
  withTime = false
}: InputFieldProps) {
  // Se for tipo date, usar o DateField com o novo calendário
  if (type === "date") {
    return (
      <DateField
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={className}
        showPresets={showPresets}
        businessDaysOnly={businessDaysOnly}
        minDate={minDate}
        maxDate={maxDate}
        withTime={withTime}
      />
    );
  }

  // Para outros tipos, usar o input normal
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