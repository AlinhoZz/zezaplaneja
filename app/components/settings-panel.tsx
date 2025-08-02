"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, Database, Download, Upload, Trash2, RefreshCw } from "lucide-react"

export function SettingsPanel() {
  const [settings, setSettings] = useState({
    theme: "system",
    language: "pt-BR",
    weekStartsOn: 1, // Monday
    timeFormat: "24h",
    autoSync: true,
    offlineMode: true,
    dataRetention: 90, // days
    backupFrequency: "weekly",
  })

  const [storageInfo, setStorageInfo] = useState({
    used: "2.3 MB",
    available: "47.7 MB",
    activities: 156,
    lastBackup: "2024-01-15",
  })

  const handleExportData = () => {
    // Export all data as JSON
    const data = {
      activities: JSON.parse(localStorage.getItem("planner-activities") || "[]"),
      goals: JSON.parse(localStorage.getItem("planner-goals") || "[]"),
      settings: JSON.parse(localStorage.getItem("planner-settings") || "{}"),
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `planner-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string)
            if (data.activities) localStorage.setItem("planner-activities", JSON.stringify(data.activities))
            if (data.goals) localStorage.setItem("planner-goals", JSON.stringify(data.goals))
            if (data.settings) localStorage.setItem("planner-settings", JSON.stringify(data.settings))
            alert("Dados importados com sucesso!")
            window.location.reload()
          } catch (error) {
            alert("Erro ao importar dados. Verifique se o arquivo está correto.")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleClearData = () => {
    if (confirm("Tem certeza que deseja apagar todos os dados? Esta ação não pode ser desfeita.")) {
      localStorage.clear()
      alert("Todos os dados foram apagados.")
      window.location.reload()
    }
  }

  const handleSyncNow = () => {
    // Simulate sync process
    alert("Sincronização iniciada... (funcionalidade em desenvolvimento)")
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="dark:text-gray-200">Idioma</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="dark:text-gray-200">Formato de Hora</Label>
              <Select
                value={settings.timeFormat}
                onValueChange={(value) => setSettings({ ...settings, timeFormat: value })}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 horas</SelectItem>
                  <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="dark:text-gray-200">Início da Semana</Label>
              <Select
                value={settings.weekStartsOn.toString()}
                onValueChange={(value) => setSettings({ ...settings, weekStartsOn: Number.parseInt(value) })}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Domingo</SelectItem>
                  <SelectItem value="1">Segunda-feira</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="dark:text-gray-200">Retenção de Dados</Label>
              <Select
                value={settings.dataRetention.toString()}
                onValueChange={(value) => setSettings({ ...settings, dataRetention: Number.parseInt(value) })}
              >
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                  <SelectItem value="180">6 meses</SelectItem>
                  <SelectItem value="365">1 ano</SelectItem>
                  <SelectItem value="-1">Nunca excluir</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-sync" className="font-medium dark:text-gray-200">
                  Sincronização Automática
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sincronizar dados automaticamente</p>
              </div>
              <Switch
                id="auto-sync"
                checked={settings.autoSync}
                onCheckedChange={(checked) => setSettings({ ...settings, autoSync: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="offline-mode" className="font-medium dark:text-gray-200">
                  Modo Offline
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Funcionar sem conexão com internet</p>
              </div>
              <Switch
                id="offline-mode"
                checked={settings.offlineMode}
                onCheckedChange={(checked) => setSettings({ ...settings, offlineMode: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Database className="h-5 w-5 text-blue-600" />
            Gerenciamento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Storage Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{storageInfo.used}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Usado</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{storageInfo.available}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Disponível</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{storageInfo.activities}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Atividades</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{storageInfo.lastBackup}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Último Backup</div>
            </div>
          </div>

          {/* Data Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button onClick={handleExportData} variant="outline" className="dark:border-gray-600 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>
            <Button onClick={handleImportData} variant="outline" className="dark:border-gray-600 bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              Importar Dados
            </Button>
            <Button onClick={handleSyncNow} variant="outline" className="dark:border-gray-600 bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar Agora
            </Button>
            <Button onClick={handleClearData} variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Limpar Todos os Dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Informações do App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Versão</span>
            <Badge variant="secondary">1.0.0</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Última Atualização</span>
            <span className="text-sm text-gray-900 dark:text-white">15/01/2024</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Modo PWA</span>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Ativo</Badge>
          </div>
          <div className="pt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Desenvolvido com ❤️ para organizar sua vida</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
