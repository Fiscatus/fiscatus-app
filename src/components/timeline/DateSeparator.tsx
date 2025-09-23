import React from 'react';

export function DateSeparator({ label }:{ label:string }) {
  return (
    <div className="relative my-3">
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center">
        <span className="mx-4 h-[1px] w-full bg-slate-200/80" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-2.5 py-0.5 text-xs rounded-full border bg-white text-slate-600 shadow-sm">
          {label}
        </span>
      </div>
    </div>
  );
}


