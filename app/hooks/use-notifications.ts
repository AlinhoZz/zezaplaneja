"use client"

import { useState, useEffect, useCallback } from "react"
import type { Activity } from "../types/activity"
import { LocalNotifications } from "@capacitor/local-notifications" // Import Capacitor LocalNotifications

// Helper para gerar um ID inteiro consistente a partir de um UUID
function getNotificationId(activityId: string, type: "start" | "end" | "reminder"): number {
  let hash = 0
  for (let i = 0; i < activityId.length; i++) {
    const char = activityId.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0 // Converte para inteiro de 32 bits
  }
  // Usa um número grande para garantir unicidade ao adicionar o offset do tipo
  const baseId = Math.abs(hash) % 1000000000 // Mantém dentro de um intervalo de inteiro razoável

  switch (type) {
    case "start":
      return baseId + 1
    case "end":
      return baseId + 2
    case "reminder":
      return baseId + 3
    default:
      return baseId // Fallback
  }
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)
  const [isCapacitor, setIsCapacitor] = useState(false)

  useEffect(() => {
    const checkSupport = async () => {
      const isWebNotificationsSupported = "Notification" in window && "serviceWorker" in navigator
      const isCapacitorApp = typeof window !== "undefined" && (window as any).Capacitor?.isNative

      setIsSupported(isWebNotificationsSupported || isCapacitorApp)
      setIsCapacitor(isCapacitorApp)

      if (isCapacitorApp) {
        const status = await LocalNotifications.checkPermissions()
        setPermission(status.display as NotificationPermission)
      } else if (isWebNotificationsSupported) {
        setPermission(Notification.permission)
      }
    }
    checkSupport()
  }, [])

  const requestPermission = useCallback(async () => {
    if (isCapacitor) {
      const result = await LocalNotifications.requestPermissions()
      setPermission(result.display as NotificationPermission)
      return result.display as NotificationPermission
    } else if ("Notification" in window && permission !== "granted") {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    }
    return permission
  }, [permission, isCapacitor])

  const cancelNotificationsForActivity = useCallback(
    async (activityId: string) => {
      if (isCapacitor) {
        try {
          const idsToCancel = [
            getNotificationId(activityId, "start"),
            getNotificationId(activityId, "end"),
            getNotificationId(activityId, "reminder"),
          ]
          await LocalNotifications.cancel({ notifications: idsToCancel.map((id) => ({ id })) })
          console.log(`🗑️ Notificações locais canceladas para a atividade: ${activityId}, IDs: ${idsToCancel}`)
        } catch (e) {
          console.error("❌ Erro ao cancelar notificações do Capacitor:", e)
        }
      }
      // Não há uma maneira direta de cancelar notificações web baseadas em setTimeout uma vez agendadas
    },
    [isCapacitor],
  )

  const scheduleNotification = useCallback(
    async (activity: Activity) => {
      if (permission !== "granted") {
        console.warn("Permissão de notificação não concedida. Não é possível agendar a notificação.")
        return
      }

      const notificationsToSchedule = []
      const now = new Date()

      // Agendar Notificação de Início
      if (activity.notifications.start) {
        const startTime = new Date(`${activity.date}T${activity.startTime}`)
        if (startTime.getTime() > now.getTime()) {
          notificationsToSchedule.push({
            id: getNotificationId(activity.id, "start"),
            title: `FAÇA ISSO --> ${activity.title}`, // Título atualizado aqui
            body: `Sua atividade "${activity.title}" deve começar agora.`,
            schedule: { at: startTime },
            sound: isCapacitor && activity.notifications.sound ? "beep.wav" : undefined,
            smallIcon: isCapacitor ? "ic_stat_icon_config_sample" : undefined,
            largeIcon: isCapacitor ? "/icon-512x512.png" : undefined,
            attachments: [],
            actionTypeId: "",
            extra: { activityId: activity.id, type: "start" },
          })
        } else {
          console.log(`Pulando notificação de início para atividade passada: ${activity.title}`)
        }
      }

      // Agendar Notificação de Fim
      if (activity.notifications.end) {
        const endTime = new Date(`${activity.date}T${activity.endTime}`)
        if (endTime.getTime() > now.getTime()) {
          notificationsToSchedule.push({
            id: getNotificationId(activity.id, "end"),
            title: `✅ Atividade finalizada: ${activity.title}`,
            body: `Sua atividade "${activity.title}" terminou. Você conseguiu concluir?`,
            schedule: { at: endTime },
            sound: isCapacitor && activity.notifications.sound ? "beep.wav" : undefined,
            smallIcon: isCapacitor ? "ic_stat_icon_config_sample" : undefined,
            largeIcon: isCapacitor ? "/icon-512x512.png" : undefined,
            attachments: [],
            actionTypeId: "",
            extra: { activityId: activity.id, type: "end" },
          })
        } else {
          console.log(`Pulando notificação de fim para atividade passada: ${activity.title}`)
        }
      }

      // Agendar Notificação de Lembrete
      if (activity.notifications.reminder > 0) {
        const startTime = new Date(`${activity.date}T${activity.startTime}`)
        const reminderTime = new Date(startTime.getTime() - activity.notifications.reminder * 60 * 1000)
        if (reminderTime.getTime() > now.getTime()) {
          notificationsToSchedule.push({
            id: getNotificationId(activity.id, "reminder"),
            title: `🔔 Lembrete: ${activity.title}`,
            body: `Sua atividade "${activity.title}" começa em ${activity.notifications.reminder} minutos.`,
            schedule: { at: reminderTime },
            sound: isCapacitor && activity.notifications.sound ? "beep.wav" : undefined,
            smallIcon: isCapacitor ? "ic_stat_icon_config_sample" : undefined,
            largeIcon: isCapacitor ? "/icon-512x512.png" : undefined,
            attachments: [],
            actionTypeId: "",
            extra: { activityId: activity.id, type: "reminder" },
          })
        } else {
          console.log(`Pulando notificação de lembrete para horário passado: ${activity.title}`)
        }
      }

      if (notificationsToSchedule.length === 0) {
        console.log("Nenhuma notificação para agendar para esta atividade.")
        return
      }

      if (isCapacitor) {
        try {
          // Primeiro, cancela quaisquer notificações existentes para esta atividade para evitar duplicatas
          await cancelNotificationsForActivity(activity.id)
          await LocalNotifications.schedule({ notifications: notificationsToSchedule })
          console.log(
            `✅ Notificações do Capacitor agendadas para a atividade ${activity.id}:`,
            notificationsToSchedule.map((n) => n.title),
          )
        } catch (e) {
          console.error("❌ Erro ao agendar notificações do Capacitor:", e)
        }
      } else {
        // Fallback para web (menos confiável para persistência quando a aba é fechada)
        notificationsToSchedule.forEach((notif) => {
          const timeDiff = notif.schedule.at.getTime() - now.getTime()
          if (timeDiff > 0) {
            setTimeout(() => {
              new Notification(notif.title, {
                body: notif.body,
                icon: "/icon-192x192.png",
                badge: "/icon-192x192.png",
                tag: `activity-${activity.id}-${notif.extra.type}`,
                requireInteraction: true,
                vibrate: activity.notifications.vibration ? [200, 100, 200] : undefined,
              })
              console.log(`✅ Notificação web exibida: ${notif.title}`)
            }, timeDiff)
          }
        })
      }
    },
    [permission, isCapacitor, cancelNotificationsForActivity],
  )

  return {
    permission,
    isSupported,
    requestPermission,
    scheduleNotification,
    cancelNotificationsForActivity,
  }
}
