"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect, useMemo } from "react" // Adicionado useMemo
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, CheckCircle, Clock, FileText, LogOut, MoreVertical, Search } from "lucide-react" // Adicionado Search icon
import { MobileHeader } from "./components/mobile-header"
import { MobileWeeklyPlanner } from "./components/mobile-weekly-planner"
import { MobileActivityForm } from "./components/mobile-activity-form"
import { MobileGoals } from "./components/mobile-goals"
import { MobileNotifications } from "./components/mobile-notifications"
import { MobileBottomNav } from "./components/mobile-bottom-nav"
import { FloatingActionButton } from "./components/floating-action-button"
import { useActivities } from "./hooks/use-activities"
import { useTheme } from "./hooks/use-theme"
import { useNotifications } from "./hooks/use-notifications"
import { exportWeeklyReportToPDF } from "./utils/pdf-export"
import type { Activity } from "./types/activity"
import { AuthForm } from "./components/auth-form"
import { supabase } from "@/lib/supabase"
import { format, isWithinInterval, parseISO } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Session } from "@supabase/supabase-js"
import { Input } from "@/components/ui/input" // Importado Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Importado Select components

export default function MobilePlannerApp() {
  const [user, setUser] = useState<any>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  const { activities, addActivity, updateActivity, deleteActivity, loading, error, refetch } = useActivities(user?.id)
  const { theme, toggleTheme } = useTheme()
  const { requestPermission, scheduleNotification, cancelNotificationsForActivity } = useNotifications()
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [activeTab, setActiveTab] = useState("today")
  const [isExportingReport, setIsExportingReport] = useState(false)

  // Novos estados para busca e filtro
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all") // 'all' para todas as categorias

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (data.session) {
        setUser(data.session.user)
        setSession(data.session)
      }
      setLoadingAuth(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setSession(session || null)
      setLoadingAuth(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user) {
      requestPermission()
    }
  }, [user, requestPermission])

  const handleAddActivity = async (activity: Omit<Activity, "id" | "createdAt" | "updatedAt">) => {
    if (!user) {
      alert("Você precisa estar logado para adicionar atividades.")
      return
    }
    const newActivity = await addActivity(activity)
    if (newActivity) {
      scheduleNotification(newActivity)
    }
    setShowActivityForm(false)
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setShowActivityForm(true)
  }

  const handleUpdateActivity = async (updatedActivityData: Omit<Activity, "id" | "createdAt" | "updatedAt">) => {
    if (editingActivity && user) {
      await cancelNotificationsForActivity(editingActivity.id)
      const updated = await updateActivity(editingActivity.id, updatedActivityData)
      if (updated) {
        scheduleNotification(updated)
      }
      setEditingActivity(null)
      setShowActivityForm(false)
    }
  }

  const handleDeleteActivity = async (id: string) => {
    if (user) {
      await deleteActivity(id)
      await cancelNotificationsForActivity(id)
    }
  }

  const handleToggleActivityComplete = async (activityId: string, completed: boolean) => {
    const updated = await updateActivity(activityId, { completed })
    if (updated) {
      scheduleNotification(updated)
    }
  }

  const handleExportWeeklyReport = async () => {
    try {
      setIsExportingReport(true)
      await exportWeeklyReportToPDF(activities)
    } catch (error) {
      console.error("Error exporting weekly report:", error)
      alert("Erro ao exportar relatório. Tente novamente.")
    } finally {
      setIsExportingReport(false)
    }
  }

  const handleLogout = async () => {
    setLoadingAuth(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error logging out:", error)
      alert("Erro ao sair: " + error.message)
    } else {
      setUser(null)
      setSession(null)
      refetch()
    }
    setLoadingAuth(false)
  }

  // Categorias para o filtro
  const categories = [
    { value: "all", label: "Todas as Categorias" },
    { value: "estudo", label: "📚 Estudo" },
    { value: "trabalho", label: "💼 Trabalho" },
    { value: "exercicio", label: "🏃 Exercício" },
    { value: "alimentacao", label: "🍽️ Alimentação" },
    { value: "lazer", label: "🎮 Lazer" },
    { value: "outros", label: "📝 Outros" },
  ]

  // Atividades de hoje filtradas e memorizadas
  const todayActivities = useMemo(() => {
    const todayString = format(new Date(), "yyyy-MM-dd")
    return activities
      .filter((activity) => {
        const matchesDate = activity.date === todayString
        const matchesSearch =
          activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesCategory = filterCategory === "all" || activity.category === filterCategory
        return matchesDate && matchesSearch && matchesCategory
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [activities, searchTerm, filterCategory])

  const completedToday = todayActivities.filter((a) => a.completed).length
  const totalToday = todayActivities.length

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm onAuthSuccess={() => setLoadingAuth(false)} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Carregando atividades...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Erro no Banco de Dados</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={refetch} className="bg-blue-600 hover:bg-blue-700">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${theme === "dark" ? "dark bg-gray-900" : "bg-gray-50"}`}
    >
      {/* Mobile Header */}
      <MobileHeader theme={theme} onToggleTheme={toggleTheme}>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="h-9 w-9">
          <LogOut className="h-4 w-4" />
        </Button>
      </MobileHeader>

      {/* Main Content with proper spacing */}
      <div className="pb-20 pt-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="today" className="mt-0 px-4 space-y-6">
            {/* Today Stats with top margin */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Concluídas</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {completedToday}/{totalToday}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Restantes</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{totalToday - completedToday}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Report Button */}
            <Button
              onClick={handleExportWeeklyReport}
              disabled={isExportingReport}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isExportingReport ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />📊 Exportar Relatório Semanal
                </>
              )}
            </Button>

            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Categoria" />
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

            {/* Today's Activities with proper spacing */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white px-1">Hoje</h2>
              {todayActivities.length === 0 ? (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Nenhuma atividade para hoje</p>
                    <Button
                      onClick={() => setShowActivityForm(true)}
                      className="mt-3 bg-blue-600 hover:bg-blue-700"
                      size="sm"
                    >
                      Adicionar Atividade
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                todayActivities.map((activity) => (
                  <MobileActivityCard
                    key={activity.id}
                    activity={activity}
                    onEdit={handleEditActivity}
                    onToggleComplete={(id) => handleToggleActivityComplete(id, !activity.completed)}
                    onDelete={handleDeleteActivity}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="week" className="mt-0">
            <MobileWeeklyPlanner
              activities={activities}
              onEditActivity={handleEditActivity}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
            />
          </TabsContent>

          <TabsContent value="goals" className="mt-0">
            <MobileGoals activities={activities} />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <MobileNotifications />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setShowActivityForm(true)} />

      {/* Activity Form Modal */}
      {showActivityForm && (
        <MobileActivityForm
          activity={editingActivity}
          onSave={editingActivity ? handleUpdateActivity : handleAddActivity}
          onCancel={() => {
            setShowActivityForm(false)
            setEditingActivity(null)
          }}
        />
      )}
    </div>
  )
}

// Mobile Activity Card Component (mantido inalterado, pois não é a causa do erro)
function MobileActivityCard({
  activity,
  onEdit,
  onToggleComplete,
  onDelete,
}: {
  activity: Activity
  onEdit: (activity: Activity) => void
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
}) {
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

  const isActive = isActivityCurrentlyActive(activity)

  return (
    <Card
      className={`relative dark:bg-gray-800 dark:border-gray-700 ${isActive ? "ring-2 ring-purple-500 dark:ring-purple-400" : ""}`}
    >
      <CardContent className="p-4">
        {isActive && (
          <Badge className="absolute bottom-2 right-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs px-2 py-1 rounded-full">
            Em Andamento
          </Badge>
        )}
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggleComplete(activity.id)}
            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              activity.completed
                ? "bg-green-500 border-green-500"
                : "border-gray-300 dark:border-gray-600 hover:border-green-500"
            }`}
          >
            {activity.completed && <CheckCircle className="h-3 w-3 text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className={`font-medium text-gray-900 dark:text-white ${
                    activity.completed ? "line-through opacity-60" : ""
                  }`}
                >
                  {activity.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.startTime} - {activity.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-2 h-2 rounded-full ${getCategoryColor(activity.category)}`}></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{activity.category}</span>
                </div>
              </div>

              <div className="flex gap-1 ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(activity)}>Editar</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(activity.id)} className="text-red-600 dark:text-red-400">
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
