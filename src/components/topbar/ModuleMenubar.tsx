"use client"
import React from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar"
import { modulesConfig } from "@/config/modules"
import { cn } from "@/lib/utils"

export function ModuleMenubar() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <div className="hidden md:block">
      <Menubar className="h-10 rounded-full border border-gray-200 bg-white/80 backdrop-blur px-1 py-0.5 shadow-xs hover:shadow-sm transition-shadow duration-200">
        {modulesConfig.map((mod) => (
          <MenubarMenu key={mod.id}>
            <MenubarTrigger className="rounded-full px-2.5 py-1 text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900 transition-all duration-200 ease-in-out gap-1 group">
              <span className={mod.color}>{mod.label}</span>
              <ChevronDown className="ml-1 h-4 w-4 text-gray-400 group-data-[state=open]:rotate-180 transition-transform duration-200 ease-in-out" />
            </MenubarTrigger>

            <MenubarContent align="start" alignOffset={-2} sideOffset={6} className="min-w-[14rem] p-1 py-1.5 text-sm">
              {/* Páginas do módulo */}
              {mod.pages.map((p) => {
                const active = pathname === p.href || pathname.startsWith(`${p.href}/`)
                const Icon = p.icon
                return (
                  <Link key={p.id} to={p.href}>
                    <MenubarItem
                      className={cn(
                        "cursor-pointer px-2 py-1.5 rounded-sm transition-colors duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100",
                        active && "bg-indigo-50 text-indigo-700 font-medium"
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
                      {p.label}
                    </MenubarItem>
                  </Link>
                )
              })}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </Menubar>
    </div>
  )
}


