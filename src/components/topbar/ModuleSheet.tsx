"use client"
import React from "react"
import { Link } from "react-router-dom"
import { modulesConfig } from "@/config/modules"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LayoutGrid } from "lucide-react"

export function ModuleSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden gap-2">
          <LayoutGrid className="h-4 w-4" /> Módulos
        </Button>
      </SheetTrigger>
      <SheetContent side="top" className="h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Navegar por módulos</SheetTitle>
        </SheetHeader>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modulesConfig.map((mod) => (
            <div key={mod.id} className="rounded-xl border p-4">
              <div className="mb-2 text-sm font-semibold">{mod.label}</div>
              <div className="space-y-1">
                <Link to={(mod.pages && mod.pages[0]?.href) || "/"} className="block rounded-md px-2 py-1.5 hover:bg-gray-50">
                  Abrir {mod.label}
                </Link>
                {mod.pages.map((p) => (
                  <Link key={p.id} to={p.href} className="block rounded-md px-2 py-1.5 text-gray-600 hover:bg-gray-50">
                    {p.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}


