import React from "react";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/date";

interface DateFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showPresets?: boolean;
  businessDaysOnly?: boolean;
  minDate?: Date;
  maxDate?: Date;
  withTime?: boolean;
}

export default function DateField({
  label,
  name,
  value,
  onChange,
  placeholder = "Selecione uma data",
  required = false,
  disabled = false,
  className = "",
  showPresets = true,
  businessDaysOnly = false,
  minDate,
  maxDate,
  withTime = false
}: DateFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <DatePicker
        value={value || null}
        onChange={(date) => onChange(date || "")}
        placeholder={placeholder}
        disabled={disabled}
        showPresets={showPresets}
        businessDaysOnly={businessDaysOnly}
        minDate={minDate}
        maxDate={maxDate}
        withTime={withTime}
        className="w-full"
        inputClassName={`${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} border-gray-200 focus:border-blue-300 focus:ring-blue-200`}
      />
    </div>
  );
}
