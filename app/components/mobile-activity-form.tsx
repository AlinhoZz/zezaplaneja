"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Bell, AlertCircle } from "lucide-react"
import type { Activity } from "../types/activity"

interface MobileActivityFormProps {
  activity?: Activity | null
  onSave: (activity: Omit<Activity, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

export function MobileActivityForm({ activity, onSave, onCancel }: MobileActivityFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    category: "outros",
    priority: "medium" as "low" | "medium" | "high",
    notifications: {
      start: true,
      end: true,
      reminder: 15,
    },
    recurrence: {
      enabled: false,
      pattern: "daily" as "daily" | "weekly" | "monthly",
      interval: 1,
      endDate: "",
    },
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (activity) {
      setFormData({
        title: activity.title,
        description: activity.description || "",
        date: activity.date,
        startTime: activity.startTime,
        endTime: activity.endTime,
        category: activity.category,
        priority: activity.priority,
        notifications: activity.notifications,
        recurrence: {
          enabled: activity.recurrence?.enabled ?? false,
          pattern: activity.recurrence?.pattern ?? "daily",
          interval: activity.recurrence?.interval ?? 1,
          endDate: activity.recurrence?.endDate ?? "",
        },
      })
    } else {
      // Set default date to today
      const today = new Date().toISOString().split("T")[0]
      setFormData((prev) => ({ ...prev, date: today }))
    }
  }, [activity])

  const validateForm = () => {
    if (!formData.title.trim()) {
      setFormError("Título é obrigatório")
      return false
    }
    if (!formData.date) {
      setFormError("Data é obrigatória")
      return false
    }
    if (!formData.startTime) {
      setFormError("Horário de início é obrigatório")
      return false
    }
    if (!formData.endTime) {
      setFormError("Horário de fim é obrigatório")
      return false
    }
    if (formData.startTime >= formData.endTime) {
      setFormError("Horário de fim deve ser após o horário de início")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      console.log("📝 Submitting form data:", formData)

      await onSave({
        ...formData,
        completed: activity?.completed || false,
      })

      console.log("✅ Form submitted successfully")
    } catch (error) {
      console.error("❌ Form submission error:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      setFormError(`Erro ao salvar: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    { value: "estudo", label: "📚 Estudo" },
    { value: "trabalho", label: "💼 Trabalho" },
    { value: "exercicio", label: "🏃 Exercício" },
    { value: "alimentacao", label: "🍽️ Alimentação" },
    { value: "lazer", label: "🎮 Lazer" },
    { value: "outros", label: "📝 Outros" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <Card className="w-full max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 rounded-t-xl rounded-b-none">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <CardTitle className="text-lg dark:text-white">{activity ? "Editar" : "Nova"} Atividade</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {formError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200 text-sm">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="dark:text-gray-200">
                  Título *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Estudar matemática"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                />
              </div>

              <div>
                <Label htmlFor="description" className="dark:text-gray-200">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes da atividade..."
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base resize-none"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="date" className="dark:text-gray-200">
                  Data *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startTime" className="dark:text-gray-200">
                    Início *
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="endTime" className="dark:text-gray-200">
                    Fim *
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                  />
                </div>
              </div>

              <div>
                <Label className="dark:text-gray-200">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="dark:text-gray-200">Prioridade</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Baixa</SelectItem>
                    <SelectItem value="medium">🟡 Média</SelectItem>
                    <SelectItem value="high">🔴 Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <Label className="text-base font-medium dark:text-gray-200">Notificações</Label>
              </div>

              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-start" className="dark:text-gray-200">
                    Notificar no início
                  </Label>
                  <Switch
                    id="notif-start"
                    checked={formData.notifications.start}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, start: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="notif-end" className="dark:text-gray-200">
                    Notificar no fim
                  </Label>
                  <Switch
                    id="notif-end"
                    checked={formData.notifications.end}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, end: checked },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 sticky bottom-0 bg-white dark:bg-gray-800 pb-4">
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-base py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  `${activity ? "Atualizar" : "Criar"} Atividade`
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="dark:border-gray-600 px-6 bg-transparent"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
