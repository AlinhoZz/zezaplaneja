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
import { X, Bell, Repeat } from "lucide-react"
import type { Activity } from "../types/activity"

interface ActivityFormProps {
  activity?: Activity | null
  onSave: (activity: Omit<Activity, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

export function ActivityForm({ activity, onSave, onCancel }: ActivityFormProps) {
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
        recurrence: activity.recurrence ? {
          ...activity.recurrence,
          endDate: activity.recurrence.endDate || ""
        } : {
          enabled: false,
          pattern: "daily",
          interval: 1,
          endDate: "",
        },
      })
    }
  }, [activity])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      completed: activity?.completed || false,
    })
  }

  const categories = [
    { value: "estudo", label: "Estudo" },
    { value: "trabalho", label: "Trabalho" },
    { value: "exercicio", label: "Exercício" },
    { value: "alimentacao", label: "Alimentação" },
    { value: "lazer", label: "Lazer" },
    { value: "outros", label: "Outros" },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl dark:text-white">{activity ? "Editar Atividade" : "Nova Atividade"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

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
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="dark:text-gray-200">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
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
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-4">
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

                <div>
                  <Label htmlFor="reminder" className="dark:text-gray-200">
                    Lembrete (minutos antes)
                  </Label>
                  <Input
                    id="reminder"
                    type="number"
                    min="0"
                    max="1440"
                    value={formData.notifications.reminder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, reminder: Number.parseInt(e.target.value) || 0 },
                      })
                    }
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Recurrence */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <Label className="text-base font-medium dark:text-gray-200">Recorrência</Label>
              </div>

              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="recurrence-enabled" className="dark:text-gray-200">
                    Ativar recorrência
                  </Label>
                  <Switch
                    id="recurrence-enabled"
                    checked={formData.recurrence.enabled}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        recurrence: { ...formData.recurrence, enabled: checked },
                      })
                    }
                  />
                </div>

                {formData.recurrence.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="dark:text-gray-200">Padrão</Label>
                        <Select
                          value={formData.recurrence.pattern}
                          onValueChange={(value: "daily" | "weekly" | "monthly") =>
                            setFormData({
                              ...formData,
                              recurrence: { ...formData.recurrence, pattern: value },
                            })
                          }
                        >
                          <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="interval" className="dark:text-gray-200">
                          Intervalo
                        </Label>
                        <Input
                          id="interval"
                          type="number"
                          min="1"
                          value={formData.recurrence.interval}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recurrence: { ...formData.recurrence, interval: Number.parseInt(e.target.value) || 1 },
                            })
                          }
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="endDate" className="dark:text-gray-200">
                        Data final (opcional)
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.recurrence.endDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurrence: { ...formData.recurrence, endDate: e.target.value },
                          })
                        }
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                {activity ? "Atualizar" : "Criar"} Atividade
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="dark:border-gray-600 bg-transparent"
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
