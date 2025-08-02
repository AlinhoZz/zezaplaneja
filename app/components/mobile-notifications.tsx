"use client";

import { useState, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Smartphone, Settings, CheckCircle } from "lucide-react";

/**
 * Observações (Android/Capacitor):
 * - smallIcon DEVE ser um recurso nativo. Use "ic_launcher" (padrão) ou um ic_stat_* gerado no Android Studio.
 * - sound só funciona se o arquivo existir em android/app/src/main/res/raw/beep.wav (ou outro nome).
 * - Em Web Notifications, ícones via URL funcionam; no Android nativo NÃO.
 */

export function MobileNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    sound: true,
    vibration: true,
    showOnLockScreen: true,
  });

  // Canal Android para as notificações locais
  const CHANNEL_ID = "reminders";

  useEffect(() => {
    const init = async () => {
      const native = Capacitor.isNativePlatform();
      setIsNative(native);

      // No app nativo, sempre suportado; no web, depende da API Notification
      const webSupported = typeof window !== "undefined" && "Notification" in window;
      setIsSupported(native || webSupported);

      if (native) {
        // 1) Checa permissão
        const p = await LocalNotifications.checkPermissions();
        const mapped = (p.display as NotificationPermission) ?? "default";
        setPermission(mapped);

        // 2) Cria canal Android (som, importância etc.)
        try {
          await LocalNotifications.createChannel({
            id: CHANNEL_ID,
            name: "Lembretes",
            description: "Notificações do Zeza Planeja",
            importance: 5, // IMPORTANCE_MAX
            visibility: 1, // VISIBILITY_PUBLIC
            lights: true,
            vibration: true,
            // sound: "beep.wav", // descomente se você colocou res/raw/beep.wav
          });
        } catch (e) {
          console.warn("Falha ao criar canal", e);
        }
      } else if (webSupported) {
        setPermission(Notification.permission);
      }
    };

    init();
  }, []);

  const requestPermission = async () => {
    if (isNative) {
      const result = await LocalNotifications.requestPermissions();
      setPermission((result.display as NotificationPermission) ?? "default");
    } else if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        // Notificação de confirmação (apenas web)
        new Notification("Notificações Ativadas! 🎉", {
          body: "Você receberá lembretes das suas atividades.",
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
        });
      }
    }
  };

  const testNotification = async () => {
    if (permission !== "granted") return;

    if (isNative) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 9999,
              title: "Teste de Notificação 📱",
              body: "Esta é uma notificação de teste do Zeza Planeja.",
              schedule: { at: new Date(Date.now() + 1500), allowWhileIdle: true },
              channelId: CHANNEL_ID,
              smallIcon: "ic_launcher", // ícone nativo
              // sound: settings.sound ? "beep.wav" : undefined, // use apenas se raw/beep.wav existir
              // vibrate: settings.vibration ? [200, 100, 200] : undefined, // opcional
              extra: { type: "test" },
            },
          ],
        });
        console.log("✅ Notificação local (Capacitor) agendada.");
      } catch (e) {
        console.error("❌ Erro ao agendar notificação Capacitor:", e);
      }
    } else {
      // Web Notification (página aberta/ativa)
      new Notification("Teste de Notificação 📣", {
        body: "Esta é uma notificação de teste (Web).",
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        tag: "test-notification",
        requireInteraction: true,
      });
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6 text-center">
            <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Não suportado</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              O ambiente atual não suporta notificações.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Status da permissão */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white text-lg">
            <Bell className="h-5 w-5 text-blue-600" />
            Status das Notificações {isNative ? <span className="ml-1 text-xs text-gray-500">(APK)</span> : <span className="ml-1 text-xs text-gray-500">(Web)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">Permissão</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {permission === "granted"
                  ? "Notificações estão ativadas"
                  : permission === "denied"
                  ? "Notificações foram negadas"
                  : "Permissão não solicitada"}
              </p>
            </div>
            <Badge
              variant={permission === "granted" ? "default" : "destructive"}
              className={permission === "granted" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
            >
              {permission === "granted" ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <BellOff className="h-3 w-3 mr-1" />
              )}
              {permission === "granted" ? "Ativo" : permission === "denied" ? "Negado" : "Pendente"}
            </Badge>
          </div>

          {permission !== "granted" && (
            <Button onClick={requestPermission} className="w-full bg-blue-600 hover:bg-blue-700 text-base py-3">
              <Bell className="h-4 w-4 mr-2" />
              Ativar Notificações
            </Button>
          )}

          {permission === "granted" && (
            <Button
              onClick={testNotification}
              variant="outline"
              className="w-full dark:border-gray-600 bg-transparent text-base py-3"
            >
              Testar Notificação
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Configurações locais */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white text-lg">
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
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

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="sound-enabled" className="font-medium dark:text-gray-200">
                  Som
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reproduzir som (requer arquivo em <code>res/raw</code>)
                </p>
              </div>
              <Switch
                id="sound-enabled"
                checked={settings.sound}
                onCheckedChange={(checked) => setSettings({ ...settings, sound: checked })}
                disabled={!settings.enabled || permission !== "granted"}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="vibration-enabled" className="font-medium dark:text-gray-200">
                  Vibração
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Vibrar o dispositivo</p>
              </div>
              <Switch
                id="vibration-enabled"
                checked={settings.vibration}
                onCheckedChange={(checked) => setSettings({ ...settings, vibration: checked })}
                disabled={!settings.enabled || permission !== "granted"}
              />
            </div>

            <div className="flex items-center justify-between py-2">
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

      {/* Guia de instalação (PWA) */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white text-lg">
            <Smartphone className="h-5 w-5 text-green-600" />
            Instalar no Android
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium text-gray-900 dark:text-white">
              {isNative
                ? "Você já está usando o app nativo (APK)."
                : "Para melhor experiência, instale como app (PWA):"}
            </p>

            {!isNative && (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <span>Abra o menu do navegador (⋮)</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <span>Toque em "Adicionar à tela inicial"</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <span>Confirme a instalação</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    ✓
                  </div>
                  <span>Use como app!</span>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                💡 <strong>Dica:</strong> No APK, as notificações são locais e funcionam sem navegador.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
