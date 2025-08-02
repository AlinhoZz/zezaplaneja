"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Bell, BellOff, Smartphone, Settings } from "lucide-react"

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)
  const [settings, setSettings] = useState({
    enabled: true,
    sound: true,
    vibration: true,
    showOnLockScreen: true,
    reminderMinutes: 15,
  })

  useEffect(() => {
    setIsSupported("Notification" in window && "serviceWorker" in navigator)
    if ("Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === "granted") {
        // Show test notification
        new Notification("Notificações Ativadas!", {
          body: "Você receberá lembretes das suas atividades.",
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
        })
      }
    }
  }

  const testNotification = () => {
    if (permission === "granted") {
      new Notification("Teste de Notificação", {
        body: "Esta é uma notificação de teste do seu planejador.",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "test-notification",
        requireInteraction: true,
        actions: [
          {
            action: "complete",
            title: "Marcar como Concluído",
          },
          {
            action: "snooze",
            title: "Adiar 10min",
          },
        ],
      } as any)
    }
  }

  if (!isSupported) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-6 text-center">
          <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Notificações não suportadas</h3>
          <p className="text-gray-600 dark:text-gray-400">Seu navegador não suporta notificações push.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Bell className="h-5 w-5 text-blue-600" />
            Status das Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Permissão de Notificações</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {permission === "granted"
                  ? "Notificações estão ativadas"
                  : permission === "denied"
                    ? "Notificações foram negadas"
                    : "Permissão não solicitada"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={permission === "granted" ? "default" : "destructive"}
                className={
                  permission === "granted" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""
                }
              >
                {permission === "granted" ? "Ativado" : permission === "denied" ? "Negado" : "Pendente"}
              </Badge>
              {permission !== "granted" && (
                <Button onClick={requestPermission} size="sm">
                  Ativar
                </Button>
              )}
            </div>
          </div>

          {permission === "granted" && (
            <Button onClick={testNotification} variant="outline" className="w-full dark:border-gray-600 bg-transparent">
              Testar Notificação
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Configurações de Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications-enabled" className="font-medium dark:text-gray-200">
                  Notificações Gerais
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receber notificações de atividades</p>
              </div>
              <Switch
                id="notifications-enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                disabled={permission !== "granted"}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sound-enabled" className="font-medium dark:text-gray-200">
                  Som
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reproduzir som nas notificações</p>
              </div>
              <Switch
                id="sound-enabled"
                checked={settings.sound}
                onCheckedChange={(checked) => setSettings({ ...settings, sound: checked })}
                disabled={!settings.enabled || permission !== "granted"}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="vibration-enabled" className="font-medium dark:text-gray-200">
                  Vibração
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vibrar o dispositivo (mobile)</p>
              </div>
              <Switch
                id="vibration-enabled"
                checked={settings.vibration}
                onCheckedChange={(checked) => setSettings({ ...settings, vibration: checked })}
                disabled={!settings.enabled || permission !== "granted"}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="lockscreen-enabled" className="font-medium dark:text-gray-200">
                  Tela de Bloqueio
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mostrar na tela de bloqueio</p>
              </div>
              <Switch
                id="lockscreen-enabled"
                checked={settings.showOnLockScreen}
                onCheckedChange={(checked) => setSettings({ ...settings, showOnLockScreen: checked })}
                disabled={!settings.enabled || permission !== "granted"}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Installation Guide */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Smartphone className="h-5 w-5 text-green-600" />
            Instalar no Android
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white">
              Para melhor experiência, instale o app na tela inicial:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Abra o menu do navegador (⋮)</li>
              <li>Toque em "Adicionar à tela inicial"</li>
              <li>Confirme a instalação</li>
              <li>O app aparecerá como um aplicativo nativo</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                💡 <strong>Dica:</strong> Após instalar, você receberá notificações mesmo com o navegador fechado!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
