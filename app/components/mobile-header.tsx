"use client"

import type React from "react" // Importa React para tipagem de children

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface MobileHeaderProps {
  theme: "light" | "dark"
  onToggleTheme: () => void
  children?: React.ReactNode // Adiciona children para o botão de logout
}

export function MobileHeader({ theme, onToggleTheme, children }: MobileHeaderProps) {
  const today = new Date()

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 pb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Zeza Planeja</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleTheme} className="h-9 w-9">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {children} {/* Renderiza os children (botão de logout) aqui */}
        </div>
      </div>
    </div>
  )
}
