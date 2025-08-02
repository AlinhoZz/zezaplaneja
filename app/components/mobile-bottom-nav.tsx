"use client"

import { Calendar, Target, Bell, Home } from "lucide-react"

interface MobileBottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

/**
 * Barra de navegação inferior fixa, com suporte a safe-area-bottom.
 * Use o <MobileBottomNavSpacer /> antes do </main> para evitar
 * que o conteúdo fique coberto pela barra fixa.
 */
export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const tabs = [
    { id: "today", label: "Hoje", icon: Home },
    { id: "week", label: "Semana", icon: Calendar },
    { id: "goals", label: "Metas", icon: Target },
    { id: "notifications", label: "Avisos", icon: Bell },
  ]

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-white dark:bg-gray-800
        border-t border-gray-200 dark:border-gray-700
        safe-bottom
      "
      role="navigation"
      aria-label="Navegação inferior"
    >
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-3 px-2 transition-colors ${
                isActive
                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
              aria-current={isActive ? "page" : undefined}
              aria-label={tab.label}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

/**
 * Spacer que reserva o espaço da bottom nav fixa (altura base + safe-area-bottom).
 * Coloque <MobileBottomNavSpacer /> logo antes do </main>.
 */
export function MobileBottomNavSpacer() {
  // Altura visual da bottom nav (conteúdo): ~56px. Ajuste se personalizar.
  const BASE_NAV_HEIGHT_PX = 56
  return (
    <div
      aria-hidden
      style={{
        height: `calc(${BASE_NAV_HEIGHT_PX}px + var(--safe-area-bottom, 0px))`,
      }}
    />
  )
}
