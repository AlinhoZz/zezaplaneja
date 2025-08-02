"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Plus, Trash2, Target } from "lucide-react"
import type { Activity } from "../types/activity"
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns"

interface Goal {
  id: string
  title: string
  category: string
  target: number
  period: "daily" | "weekly" | "monthly"
  unit: "activities" | "hours"
  createdAt: string
}

interface MobileGoalsProps {
  activities: Activity[]
}

export function MobileGoals({ activities }: MobileGoalsProps) {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Estudar todos os dias",
      category: "estudo",
      target: 7,
      period: "weekly",
      unit: "activities",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Exercitar-se regularmente",
      category: "exercicio",
      target: 3,
      period: "weekly",
      unit: "activities",
      createdAt: new Date().toISOString(),
    },
  ])

  const [showGoalForm, setShowGoalForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: "",
    category: "outros",
    target: 1,
    period: "weekly" as "daily" | "weekly" | "monthly",
    unit: "activities" as "activities" | "hours",
  })

  const calculateGoalProgress = (goal: Goal) => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (goal.period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
        break
      case "weekly":
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        endDate = endOfWeek(now, { weekStartsOn: 1 })
        break
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        break
    }

    const relevantActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date)
      return (
        activity.category === goal.category &&
        activity.completed &&
        isWithinInterval(activityDate, { start: startDate, end: endDate })
      )
    })

    let current: number
    if (goal.unit === "activities") {
      current = relevantActivities.length
    } else {
      current = relevantActivities.reduce((total, activity) => {
        const start = new Date(`2000-01-01T${activity.startTime}`)
        const end = new Date(`2000-01-01T${activity.endTime}`)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return total + hours
      }, 0)
    }

    return {
      current: Math.round(current * 10) / 10,
      target: goal.target,
      percentage: Math.min((current / goal.target) * 100, 100),
    }
  }

  const handleAddGoal = () => {
    if (newGoal.title.trim()) {
      const goal: Goal = {
        id: Date.now().toString(),
        ...newGoal,
        createdAt: new Date().toISOString(),
      }
      setGoals([...goals, goal])
      setNewGoal({
        title: "",
        category: "outros",
        target: 1,
        period: "weekly",
        unit: "activities",
      })
      setShowGoalForm(false)
    }
  }

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  const categories = [
    { value: "estudo", label: "📚 Estudo" },
    { value: "trabalho", label: "💼 Trabalho" },
    { value: "exercicio", label: "🏃 Exercício" },
    { value: "alimentacao", label: "🍽️ Alimentação" },
    { value: "lazer", label: "🎮 Lazer" },
    { value: "outros", label: "📝 Outros" },
  ]

  const weeklyStats = useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

    const weekActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date)
      return isWithinInterval(activityDate, { start: weekStart, end: weekEnd })
    })

    const completed = weekActivities.filter((a) => a.completed).length
    const total = weekActivities.length
    const completionRate = total > 0 ? (completed / total) * 100 : 0

    return {
      completed,
      total,
      completionRate: Math.round(completionRate),
    }
  }, [activities])

  return (
    <div className="p-4 space-y-4">
      {/* Weekly Overview */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white text-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Resumo da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{weeklyStats.completed}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Concluídas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyStats.total}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Planejadas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{weeklyStats.completionRate}%</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Taxa</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={weeklyStats.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Goals Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Metas</h2>
        <Button onClick={() => setShowGoalForm(true)} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-1" />
          Nova
        </Button>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const progress = calculateGoalProgress(goal)
          const isCompleted = progress.percentage >= 100

          return (
            <Card key={goal.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{goal.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find((c) => c.value === goal.category)?.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {goal.period === "daily" ? "Diário" : goal.period === "weekly" ? "Semanal" : "Mensal"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progresso</span>
                    <span
                      className={`font-medium ${isCompleted ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"}`}
                    >
                      {progress.current} / {progress.target} {goal.unit === "activities" ? "atividades" : "horas"}
                    </span>
                  </div>
                  <Progress
                    value={progress.percentage}
                    className={`h-2 ${isCompleted ? "[&>div]:bg-green-500" : ""}`}
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{Math.round(progress.percentage)}% concluído</span>
                    {isCompleted && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                        ✓ Concluída
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <Card className="w-full max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 rounded-t-xl rounded-b-none">
            <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700">
              <CardTitle className="dark:text-white text-lg">Nova Meta</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowGoalForm(false)} className="h-8 w-8">
                <Target className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <Label htmlFor="goal-title" className="dark:text-gray-200">
                  Título
                </Label>
                <Input
                  id="goal-title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Ex: Estudar todos os dias"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                />
              </div>

              <div>
                <Label className="dark:text-gray-200">Categoria</Label>
                <Select value={newGoal.category} onValueChange={(value) => setNewGoal({ ...newGoal, category: value })}>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="goal-target" className="dark:text-gray-200">
                    Meta
                  </Label>
                  <Input
                    id="goal-target"
                    type="number"
                    min="1"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: Number.parseInt(e.target.value) || 1 })}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white text-base"
                  />
                </div>

                <div>
                  <Label className="dark:text-gray-200">Unidade</Label>
                  <Select
                    value={newGoal.unit}
                    onValueChange={(value: "activities" | "hours") => setNewGoal({ ...newGoal, unit: value })}
                  >
                    <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activities">Atividades</SelectItem>
                      <SelectItem value="hours">Horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="dark:text-gray-200">Período</Label>
                <Select
                  value={newGoal.period}
                  onValueChange={(value: "daily" | "weekly" | "monthly") => setNewGoal({ ...newGoal, period: value })}
                >
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-800 pb-4">
                <Button onClick={handleAddGoal} className="flex-1 bg-blue-600 hover:bg-blue-700 text-base py-3">
                  Criar Meta
                </Button>
                <Button variant="outline" onClick={() => setShowGoalForm(false)} className="dark:border-gray-600 px-6">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
