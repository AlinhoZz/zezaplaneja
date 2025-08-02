"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Clock, MoreVertical, FileText, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Activity } from "../types/activity"
import { format, startOfWeek, addDays, addWeeks, subWeeks, isWithinInterval, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { exportWeeklyReportToPDF } from "../utils/pdf-export"

interface MobileWeeklyPlannerProps {
  activities: Activity[]
  onEditActivity: (activity: Activity) => void
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void
  onDeleteActivity: (id: string) => void
}

export function MobileWeeklyPlanner({
  activities,
  onEditActivity,
  onUpdateActivity,
  onDeleteActivity,
}: MobileWeeklyPlannerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isExporting, setIsExporting] = useState(false)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getActivitiesForDay = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd")
    return activities
      .filter((activity) => {
        return activity.date === formattedDate
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const handleToggleComplete = (activity: Activity) => {
    onUpdateActivity(activity.id, { completed: !activity.completed })
  }

  const handleExportReport = async () => {
    try {
      setIsExporting(true)
      await exportWeeklyReportToPDF(activities, selectedDate)
    } catch (error) {
      console.error("Error exporting report:", error)
      alert("Erro ao exportar relatório. Tente novamente.")
    } finally {
      setIsExporting(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      estudo: "bg-blue-500",
      trabalho: "bg-green-500",
      exercicio: "bg-red-500",
      alimentacao: "bg-yellow-500",
      lazer: "bg-purple-500",
      outros: "bg-gray-500",
    }
    return colors[category as keyof typeof colors] || colors.outros
  }

  // Helper function to check if an activity is currently active
  const isActivityCurrentlyActive = (activity: Activity) => {
    const now = new Date()
    const activityDate = activity.date
    const activityStartTime = activity.startTime
    const activityEndTime = activity.endTime

    try {
      const startDateTime = parseISO(`${activityDate}T${activityStartTime}`)
      const endDateTime = parseISO(`${activityDate}T${activityEndTime}`)
      return isWithinInterval(now, { start: startDateTime, end: endDateTime })
    } catch (e) {
      console.error("Error parsing activity date/time for active check:", activity, e)
      return false
    }
  }

  // Calculate week statistics
  const weekActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.date + "T12:00:00")
    return activityDate >= weekStart && activityDate <= addDays(weekStart, 6)
  })

  const completedThisWeek = weekActivities.filter((a) => a.completed).length
  const totalThisWeek = weekActivities.length
  const completionRate = totalThisWeek > 0 ? Math.round((completedThisWeek / totalThisWeek) * 100) : 0

  return (
    <div className="p-4 space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedDate(subWeeks(selectedDate, 1))}
          className="dark:border-gray-700 h-10 w-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(weekStart, "MMM yyyy", { locale: ptBR })}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {format(weekStart, "d", { locale: ptBR })} - {format(addDays(weekStart, 6), "d", { locale: ptBR })}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSelectedDate(addWeeks(selectedDate, 1))}
          className="dark:border-gray-700 h-10 w-10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Statistics */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalThisWeek}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Planejadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedThisWeek}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Concluídas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{completionRate}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Taxa</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setSelectedDate(new Date())}
          className="flex-1 dark:border-gray-700 bg-transparent"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Ir para Hoje
        </Button>
        <Button onClick={handleExportReport} disabled={isExporting} className="flex-1 bg-blue-600 hover:bg-blue-700">
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exportando...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Relatório PDF
            </>
          )}
        </Button>
      </div>

      {/* Week Days */}
      <div className="space-y-3">
        {weekDays.map((day, index) => {
          const dayActivities = getActivitiesForDay(day)
          const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

          return (
            <Card
              key={index}
              className={`dark:bg-gray-800 dark:border-gray-700 ${isToday ? "ring-2 ring-blue-500" : ""}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {format(day, "EEEE", { locale: ptBR })}
                    </div>
                    <div
                      className={`text-lg ${isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}
                    >
                      {format(day, "d 'de' MMM", { locale: ptBR })}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {dayActivities.length} atividades
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayActivities.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma atividade</p>
                ) : (
                  dayActivities.map((activity) => {
                    const isActive = isActivityCurrentlyActive(activity)
                    return (
                      <div
                        key={activity.id}
                        className={`relative p-3 rounded-lg border transition-all ${
                          activity.completed
                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                            : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                        } ${isActive ? "ring-2 ring-purple-500 dark:ring-purple-400" : ""}`}
                      >
                        {isActive && (
                          <Badge className="absolute bottom-2 right-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
                            Em Andamento
                          </Badge>
                        )}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1">
                            <button
                              onClick={() => handleToggleComplete(activity)}
                              className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                activity.completed
                                  ? "bg-green-500 border-green-500"
                                  : "border-gray-300 dark:border-gray-600 hover:border-green-500"
                              }`}
                            >
                              {activity.completed && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </button>

                            <div className="flex-1 min-w-0">
                              <h4
                                className={`text-sm font-medium truncate ${
                                  activity.completed
                                    ? "line-through text-gray-500 dark:text-gray-400"
                                    : "text-gray-900 dark:text-white"
                                }`}
                              >
                                {activity.title}
                              </h4>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {activity.startTime} - {activity.endTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className={`w-2 h-2 rounded-full ${getCategoryColor(activity.category)}`}></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                  {activity.category}
                                </span>
                                {activity.priority === "high" && <span className="text-xs">🔴</span>}
                                {activity.priority === "medium" && <span className="text-xs">🟡</span>}
                                {activity.priority === "low" && <span className="text-xs">🟢</span>}
                              </div>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditActivity(activity)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onDeleteActivity(activity.id)}
                                className="text-red-600 dark:text-red-400"
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
