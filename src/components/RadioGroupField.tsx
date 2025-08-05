import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RadioGroupFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function RadioGroupField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  className = ""
}: RadioGroupFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className="flex gap-4"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
            <Label htmlFor={`${name}-${option.value}`} className="text-sm text-gray-700 cursor-pointer">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
} 