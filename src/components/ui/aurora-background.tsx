"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col h-full w-full items-center justify-center bg-zinc-50 dark:bg-zinc-900 text-slate-950 transition-bg",
        className
      )}
      {...props}
    >
      {/* Background animado principal - Efeito Aurora Real */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            `
            absolute inset-0 opacity-35 will-change-[background-position] pointer-events-none
            [background-image:repeating-linear-gradient(100deg,#ffffff_0%,#ffffff_7%,transparent_10%,transparent_12%,#ffffff_16%),repeating-linear-gradient(100deg,#10b981_10%,#34d399_15%,#6ee7b7_20%,#a7f3d0_25%,#d1fae5_30%,#ecfdf5_35%,#f0fdf4_40%,#dcfce7_45%,#bbf7d0_50%,#86efac_55%,#4ade80_60%,#22c55e_65%,#16a34a_70%,#15803d_75%,#166534_80%,#14532d_85%,#052e16_90%,#064e3b_95%,#065f46_100%)]
            dark:[background-image:repeating-linear-gradient(100deg,#000000_0%,#000000_7%,transparent_10%,transparent_12%,#000000_16%),repeating-linear-gradient(100deg,#10b981_10%,#34d399_15%,#6ee7b7_20%,#a7f3d0_25%,#d1fae5_30%,#ecfdf5_35%,#f0fdf4_40%,#dcfce7_45%,#bbf7d0_50%,#86efac_55%,#4ade80_60%,#22c55e_65%,#16a34a_70%,#15803d_75%,#166534_80%,#14532d_85%,#052e16_90%,#064e3b_95%,#065f46_100%)]
            [background-size:400%,_300%]
            [background-position:50%_50%,50%_50%]
            filter blur-[8px] invert dark:invert-0
            animate-aurora
            `,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
          )}
        />
        
        {/* Camada de sobreposição para efeito adicional - Cores complementares */}
        <div
          className={cn(
            `
            absolute inset-0 pointer-events-none
            [background-image:repeating-linear-gradient(100deg,#ffffff_0%,#ffffff_7%,transparent_10%,transparent_12%,#ffffff_16%),repeating-linear-gradient(100deg,#8b5cf6_10%,#a78bfa_15%,#c4b5fd_20%,#ddd6fe_25%,#ede9fe_30%,#f5f3ff_35%,#faf5ff_40%,#fdf4ff_45%,#fce7f3_50%,#fbcfe8_55%,#f9a8d4_60%,#f472b6_65%,#ec4899_70%,#db2777_75%,#be185d_80%,#9d174d_85%,#831843_90%,#701a75_95%,#581c87_100%)]
            dark:[background-image:repeating-linear-gradient(100deg,#000000_0%,#000000_7%,transparent_10%,transparent_12%,#000000_16%),repeating-linear-gradient(100deg,#8b5cf6_10%,#a78bfa_15%,#c4b5fd_20%,#ddd6fe_25%,#ede9fe_30%,#f5f3ff_35%,#faf5ff_40%,#fdf4ff_45%,#fce7f3_50%,#fbcfe8_55%,#f9a8d4_60%,#f472b6_65%,#ec4899_70%,#db2777_75%,#be185d_80%,#9d174d_85%,#831843_90%,#701a75_95%,#581c87_100%)]
            [background-size:300%,_200%]
            [background-attachment:fixed]
            mix-blend-screen
            animate-aurora
            opacity-30
            `,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
          )}
        />

        {/* Terceira camada para profundidade - Azuis e cianos */}
        <div
          className={cn(
            `
            absolute inset-0 pointer-events-none
            [background-image:repeating-linear-gradient(100deg,#ffffff_0%,#ffffff_7%,transparent_10%,transparent_12%,#ffffff_16%),repeating-linear-gradient(100deg,#0ea5e9_10%,#38bdf8_15%,#7dd3fc_20%,#bae6fd_25%,#e0f2fe_30%,#f0f9ff_35%,#f8fafc_40%,#f1f5f9_45%,#e2e8f0_50%,#cbd5e1_55%,#94a3b8_60%,#64748b_65%,#475569_70%,#334155_75%,#1e293b_80%,#0f172a_85%,#020617_90%,#0c0a09_95%,#1c1917_100%)]
            dark:[background-image:repeating-linear-gradient(100deg,#000000_0%,#000000_7%,transparent_10%,transparent_12%,#000000_16%),repeating-linear-gradient(100deg,#0ea5e9_10%,#38bdf8_15%,#7dd3fc_20%,#bae6fd_25%,#e0f2fe_30%,#f0f9ff_35%,#f8fafc_40%,#f1f5f9_45%,#e2e8f0_50%,#cbd5e1_55%,#94a3b8_60%,#64748b_65%,#475569_70%,#334155_75%,#1e293b_80%,#0f172a_85%,#020617_90%,#0c0a09_95%,#1c1917_100%)]
            [background-size:350%,_250%]
            [background-attachment:fixed]
            mix-blend-multiply
            animate-aurora
            opacity-20
            `,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
          )}
        />
      </div>
      
      {/* Conteúdo principal */}
      {children}
    </div>
  );
}; 