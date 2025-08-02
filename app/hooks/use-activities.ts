"use client"

import { useState, useEffect, useCallback } from "react"
import type { Activity } from "../types/activity"
import { supabase } from "@/lib/supabase" // Importa o cliente Supabase do lado do cliente

export function useActivities(userId?: string | null) {
  // Aceita userId e accessToken como props
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadActivities = useCallback(async () => {
    if (!userId) {
      setActivities([]) // Limpa as atividades se não houver usuário logado
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Loading activities from Supabase for user:", userId)

      // O cliente Supabase (lado do cliente) já gerencia a autenticação automaticamente
      // e aplica o RLS com base na sessão do usuário.
      const { data, error: dbError } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId) // Filtra por user_id (RLS também fará isso)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })

      if (dbError) {
        console.error("❌ Erro ao buscar atividades do Supabase:", dbError)
        throw new Error(dbError.message)
      }

      // Mapeia os nomes das colunas do banco de dados para o formato da interface Activity
      const fetchedActivities: Activity[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        date: item.date,
        startTime: item.start_time,
        endTime: item.end_time,
        category: item.category,
        priority: item.priority,
        completed: item.completed,
        notifications: item.notifications || { start: true, end: true, reminder: 15 },
        recurrence: item.recurrence || { enabled: false, pattern: "daily", interval: 1, endDate: "" },
        user_id: item.user_id, // Inclui o user_id
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }))

      console.log(`✅ Retornando ${fetchedActivities.length} atividades do Supabase para o usuário ${userId}`)
      setActivities(fetchedActivities)
    } catch (error: any) {
      console.error("❌ Error loading activities:", error)
      setError(
        `Erro ao carregar atividades: ${error.message}. Verifique sua conexão com o Supabase e se você está logado.`,
      )
    } finally {
      setLoading(false)
    }
  }, [userId]) // Recarrega atividades quando o userId muda

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  const addActivity = async (activityData: Omit<Activity, "id" | "createdAt" | "updatedAt">) => {
    if (!userId) {
      setError("Usuário não autenticado ou token de acesso ausente. Não é possível adicionar atividade.")
      throw new Error("User not authenticated or access token missing.")
    }

    try {
      setError(null)
      console.log("➕ Adding activity via API:", activityData.title)

      const { data, error: dbError } = await supabase
        .from("activities")
        .insert({
          title: activityData.title,
          description: activityData.description,
          date: activityData.date,
          start_time: activityData.startTime, // Mapeia para o nome da coluna do DB
          end_time: activityData.endTime, // Mapeia para o nome da coluna do DB
          category: activityData.category,
          priority: activityData.priority,
          completed: activityData.completed,
          notifications: activityData.notifications,
          recurrence: activityData.recurrence,
          user_id: userId, // Garante que o user_id seja associado
        })
        .select()
        .single()

      if (dbError) {
        console.error("❌ Erro ao adicionar atividade no Supabase:", dbError)
        throw new Error(dbError.message)
      }

      // Mapeia de volta para o formato da interface Activity
      const newActivity: Activity = {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        category: data.category,
        priority: data.priority,
        completed: data.completed,
        notifications: data.notifications,
        recurrence: data.recurrence,
        user_id: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
      console.log("✅ Atividade adicionada diretamente ao Supabase:", newActivity.id)
      setActivities((prev) => [...prev, newActivity])
      return newActivity
    } catch (error: any) {
      console.error("❌ Error adding activity:", error)
      setError(`Erro ao criar atividade: ${error.message}.`)
      throw error
    }
  }

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    if (!userId) {
      setError("Usuário não autenticado ou token de acesso ausente. Não é possível atualizar atividade.")
      throw new Error("User not authenticated or access token missing.")
    }

    try {
      setError(null)
      console.log("🔄 Updating activity via API:", id)

      const activityUpdates = {
        title: updates.title,
        description: updates.description,
        date: updates.date,
        start_time: updates.startTime, // Mapeia para o nome da coluna do DB
        end_time: updates.endTime, // Mapeia para o nome da coluna do DB
        category: updates.category,
        priority: updates.priority,
        completed: updates.completed,
        notifications: updates.notifications,
        recurrence: updates.recurrence,
        // user_id não é atualizado aqui, pois é o proprietário
      }

      const { data, error: dbError } = await supabase
        .from("activities")
        .update(activityUpdates)
        .eq("id", id)
        .eq("user_id", userId) // Garante que só o dono possa atualizar
        .select()
        .single()

      if (dbError) {
        console.error("❌ Erro ao atualizar atividade no Supabase:", dbError)
        throw new Error(dbError.message)
      }

      // Mapeia de volta para o formato da interface Activity
      const updatedActivity: Activity = {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.start_time,
        endTime: data.end_time,
        category: data.category,
        priority: data.priority,
        completed: data.completed,
        notifications: data.notifications,
        recurrence: data.recurrence,
        user_id: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      }
      console.log("✅ Atividade atualizada diretamente no Supabase:", updatedActivity.id)
      setActivities((prev) => prev.map((activity) => (activity.id === id ? updatedActivity : activity)))
      return updatedActivity
    } catch (error: any) {
      console.error("❌ Error updating activity:", error)
      setError(`Erro ao atualizar atividade: ${error.message}.`)
      throw error
    }
  }

  const deleteActivity = async (id: string) => {
    if (!userId) {
      setError("Usuário não autenticado ou token de acesso ausente. Não é possível excluir atividade.")
      throw new Error("User not authenticated or access token missing.")
    }

    try {
      setError(null)
      console.log("🗑️ Deleting activity via API:", id)

      const { error: dbError } = await supabase.from("activities").delete().eq("id", id).eq("user_id", userId) // Garante que só o dono possa excluir

      if (dbError) {
        console.error("❌ Erro ao excluir atividade do Supabase:", dbError)
        throw new Error(dbError.message)
      }
      console.log("✅ Atividade excluída diretamente do Supabase:", id)
      setActivities((prev) => prev.filter((activity) => activity.id !== id))
    } catch (error: any) {
      console.error("❌ Error deleting activity:", error)
      setError(`Erro ao excluir atividade: ${error.message}.`)
      throw error
    }
  }

  return {
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    loading,
    error,
    refetch: loadActivities,
  }
}
