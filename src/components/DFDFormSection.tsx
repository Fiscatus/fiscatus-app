import React from "react";

interface DFDFormSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function DFDFormSection({ title, children, className = "" }: DFDFormSectionProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-md border border-gray-100 p-8 ${className}`}>
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
        {title}
      </h3>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
} 