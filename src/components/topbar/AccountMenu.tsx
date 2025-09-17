"use client"

import { useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Info,
  Settings,
  Headphones,
  LogOut,
} from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import { useToast } from "@/components/ui/use-toast"

type Props = {
  name: string
  email: string
  avatarUrl?: string
  onOpenSupport?: () => void // abre drawer de suporte (se existir)
}

export function AccountMenu({ name, email, avatarUrl, onOpenSupport }: Props) {
  const navigate = useNavigate()
  const { setUser } = useUser()
  const { toast } = useToast()
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  // Função de logout
  const handleLogout = () => {
    // Limpar token JWT (simulado)
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    // Limpar dados do usuário
    setUser(null);
    
    // Mostrar toast de sucesso
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema com sucesso.",
      variant: "default"
    });
    
    // Redirecionar para login
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 w-9 rounded-full p-0 overflow-hidden"
          aria-label="Abrir menu da conta"
        >
          <Avatar className="h-9 w-9 rounded-full">
            <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
            <AvatarFallback className="h-9 w-9 rounded-full text-sm font-medium">{initials || "US"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[280px]"
      >
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">{name}</span>
            <span className="text-xs text-muted-foreground truncate">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Saiba mais */}
        <DropdownMenuItem asChild>
          <button
            onClick={() => navigate("/sobre")}
            aria-label="Saiba mais sobre o sistema"
            className="flex items-center gap-2 w-full"
          >
            <Info className="h-4 w-4" />
            <span>Saiba mais</span>
          </button>
        </DropdownMenuItem>

        {/* Configurações */}
        <DropdownMenuItem asChild>
          <button
            onClick={() => navigate("/configuracoes")}
            aria-label="Abrir configurações"
            className="flex items-center gap-2 w-full"
          >
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </button>
        </DropdownMenuItem>

        {/* Suporte */}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            if (onOpenSupport) onOpenSupport()
            else navigate("/suporte")
          }}
          aria-label="Abrir suporte"
          className="flex items-center gap-2 cursor-pointer"
        >
          <Headphones className="h-4 w-4" />
          <span>Suporte</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sair */}
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            handleLogout()
          }}
          className="text-red-600 focus:text-red-600"
          aria-label="Sair do sistema"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair do sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
