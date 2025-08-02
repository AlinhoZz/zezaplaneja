"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface FloatingActionButtonProps {
  onClick: () => void
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
      size="icon"
    >
      <Plus className="h-6 w-6 text-white" />
    </Button>
  )
}
