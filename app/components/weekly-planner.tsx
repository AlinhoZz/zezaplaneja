"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Clock, Edit, Trash2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Activity } from "../types/activity"
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns"
import { ptBR } from "date-fns/locale"

interface WeeklyPlannerProps {
  activities: Activity[]
  onEditActivity: (activity: Activity) => void
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void
  onDeleteActivity: (id: string) => void
  selectedDate: Date
  onDateChange: (date: Date) => void
}

export function WeeklyPlanner({
  activities,
  onEditActivity,
  onUpdateActivity,
  onDeleteActivity,
  selectedDate,
  onDateChange,
}: WeeklyPlannerProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getActivitiesForDay = (date: Date) => {
    return activities
      .filter((activity) => {
        const activityDate = new Date(activity.date)
        return activityDate.toDateString() === date.toDateString()
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  const handleToggleComplete = (activity: Activity) => {
    onUpdateActivity(activity.id, { completed: !activity.completed })
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      estudo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      trabalho: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      exercicio: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      alimentacao: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      lazer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      outros: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
    }
    return colors[category as keyof typeof colors] || colors.outros
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange(subWeeks(selectedDate, 1))}
            className="dark:border-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {format(weekStart, "d 'de' MMMM", { locale: ptBR })} -{" "}
            {format(addDays(weekStart, 6), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDateChange(addWeeks(selectedDate, 1))}
            className="dark:border-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => onDateChange(new Date())} className="dark:border-gray-700">
          Hoje
        </Button>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayActivities = getActivitiesForDay(day)
          const isToday = day.toDateString() === new Date().toDateString()

          return (
            <Card
              key={index}
              className={`dark:bg-gray-800 dark:border-gray-700 ${isToday ? "ring-2 ring-blue-500" : ""}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-center">
                  <div className="text-gray-600 dark:text-gray-400">{format(day, "EEEE", { locale: ptBR })}</div>
                  <div
                    className={`text-lg ${isToday ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}
                  >
                    {format(day, "d")}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayActivities.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma atividade</p>
                ) : (
                  dayActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-3 rounded-lg border transition-all ${
                        activity.completed
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          <Checkbox
                            checked={activity.completed}
                            onCheckedChange={() => handleToggleComplete(activity)}
                            className="mt-0.5"
                          />
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
                            <Badge className={`text-xs mt-1 ${getCategoryColor(activity.category)}`}>
                              {activity.category}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEditActivity(activity)}>
                              <Edit className="h-3 w-3 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteActivity(activity.id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
