export interface Activity {
  id: string
  title: string
  description?: string
  date: string // YYYY-MM-DD format
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  category: string
  priority: "low" | "medium" | "high"
  completed: boolean
  notifications: {
    start: boolean
    end: boolean
    reminder: number // minutes before
  }
  recurrence?: {
    enabled: boolean
    pattern: "daily" | "weekly" | "monthly"
    interval: number
    endDate?: string
  }
  user_id?: string // Adicionado para associar a atividade ao usuário
  createdAt: string
  updatedAt: string
}
