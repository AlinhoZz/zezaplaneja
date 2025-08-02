"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface MobileHeaderProps {
  theme: "light" | "dark"
  onToggleTheme: () => void
  /** Conteúdo adicional no canto direito (ex.: botão de logout) */
  children?: React.ReactNode
  /** Título mostrado no topo; padrão: "Zeza Planeja" */
  title?: string
  /** Mostrar data sob o título (padrão: true) */
  showDate?: boolean
}

/**
 * Header fixo com padding para safe-area (notch) e sombra sutil.
 * Use o <MobileHeaderSpacer /> logo após este componente para evitar
 * que o conteúdo fique coberto pelo header fixo.
 */
export function MobileHeader({
  theme,
  onToggleTheme,
  children,
  title = "Zeza Planeja",
  showDate = true,
}: MobileHeaderProps) {
  const today = new Date()

  return (
    <div
      className="
        fixed top-0 left-0 right-0 z-50
        bg-white dark:bg-gray-800
        border-b border-gray-200 dark:border-gray-700
        safe-top
        shadow-sm
      "
    >
      {/* Conteúdo do header (já deslocado pela safe-top) */}
      <div className="flex items-center justify-between px-4 pb-3 pt-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{title}</h1>
          {showDate && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            aria-label="Alternar tema"
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="h-9 w-9"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Spacer que reserva o espaço exato do header fixo (altura base + safe-area-top).
 * Coloque <MobileHeaderSpacer /> logo após o <MobileHeader />.
 */
export function MobileHeaderSpacer() {
  // Altura visual do header (conteúdo): ~60px. Ajuste se mudar paddings/acessórios.
  const BASE_HEADER_HEIGHT_PX = 60
  return (
    <div
      aria-hidden
      style={{
        height: `calc(${BASE_HEADER_HEIGHT_PX}px + var(--safe-area-top, 0px))`,
      }}
    />
  )
}
