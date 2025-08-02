import type { Activity } from "../types/activity"
import { format, startOfWeek, addDays, endOfWeek } from "date-fns"
import { ptBR } from "date-fns/locale"

export function exportWeeklyReportToPDF(activities: Activity[], selectedDate: Date = new Date()) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Filter activities for the week
  const weekActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.date)
    return activityDate >= weekStart && activityDate <= weekEnd
  })

  // Calculate statistics
  const totalActivities = weekActivities.length
  const completedActivities = weekActivities.filter((a) => a.completed).length
  const completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0

  // Group activities by category
  const categoriesStats = weekActivities.reduce(
    (acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = { total: 0, completed: 0 }
      }
      acc[activity.category].total++
      if (activity.completed) {
        acc[activity.category].completed++
      }
      return acc
    },
    {} as Record<string, { total: number; completed: number }>,
  )

  // Calculate total hours
  const totalHours = weekActivities.reduce((total, activity) => {
    const start = new Date(`2000-01-01T${activity.startTime}`)
    const end = new Date(`2000-01-01T${activity.endTime}`)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return total + hours
  }, 0)

  const completedHours = weekActivities
    .filter((a) => a.completed)
    .reduce((total, activity) => {
      const start = new Date(`2000-01-01T${activity.startTime}`)
      const end = new Date(`2000-01-01T${activity.endTime}`)
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      return total + hours
    }, 0)

  // Create HTML content
  let htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório Semanal - ${format(weekStart, "d 'de' MMM", { locale: ptBR })} a ${format(weekEnd, "d 'de' MMM 'de' yyyy", { locale: ptBR })}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border-radius: 12px;
        }
        
        .header h1 {
          font-size: 28px;
          margin-bottom: 8px;
          font-weight: 700;
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: #f8fafc;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          text-align: center;
        }
        
        .stat-number {
          font-size: 32px;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #1e293b;
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 5px;
        }
        
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .category-item {
          background: #fff;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          display: flex;
          justify-content: between;
          align-items: center;
        }
        
        .category-name {
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .category-stats {
          font-size: 14px;
          color: #64748b;
        }
        
        .day-section {
          margin-bottom: 25px;
          break-inside: avoid;
        }
        
        .day-header {
          background: #f1f5f9;
          padding: 12px 16px;
          border-radius: 8px 8px 0 0;
          font-weight: 600;
          font-size: 16px;
          color: #334155;
          border: 1px solid #e2e8f0;
          border-bottom: none;
        }
        
        .day-content {
          border: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 8px 8px;
          background: #fff;
        }
        
        .activity {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .activity:last-child {
          border-bottom: none;
        }
        
        .activity-status {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .activity-status.completed {
          background: #10b981;
        }
        
        .activity-status.pending {
          background: #f59e0b;
        }
        
        .activity-info {
          flex: 1;
        }
        
        .activity-title {
          font-weight: 500;
          margin-bottom: 2px;
        }
        
        .activity-title.completed {
          text-decoration: line-through;
          opacity: 0.7;
        }
        
        .activity-details {
          font-size: 12px;
          color: #64748b;
        }
        
        .activity-category {
          display: inline-block;
          background: #e2e8f0;
          color: #475569;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          text-transform: capitalize;
          margin-left: 8px;
        }
        
        .no-activities {
          padding: 20px;
          text-align: center;
          color: #94a3b8;
          font-style: italic;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 10px;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #059669);
          transition: width 0.3s ease;
        }
        
        @media print {
          body { padding: 10px; }
          .header { background: #3b82f6 !important; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Relatório Semanal</h1>
        <p>${format(weekStart, "d 'de' MMMM", { locale: ptBR })} - ${format(weekEnd, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${totalActivities}</div>
          <div class="stat-label">Total de Atividades</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${completedActivities}</div>
          <div class="stat-label">Concluídas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${completionRate}%</div>
          <div class="stat-label">Taxa de Conclusão</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${Math.round(totalHours)}h</div>
          <div class="stat-label">Horas Planejadas</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">${Math.round(completedHours)}h</div>
          <div class="stat-label">Horas Concluídas</div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">📈 Progresso Geral</h2>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${completionRate}%"></div>
        </div>
        <p style="margin-top: 10px; text-align: center; color: #64748b;">
          ${completedActivities} de ${totalActivities} atividades concluídas (${completionRate}%)
        </p>
      </div>
  `

  // Add categories section
  if (Object.keys(categoriesStats).length > 0) {
    htmlContent += `
      <div class="section">
        <h2 class="section-title">📋 Por Categoria</h2>
        <div class="categories-grid">
    `

    Object.entries(categoriesStats).forEach(([category, stats]) => {
      const categoryRate = Math.round((stats.completed / stats.total) * 100)
      const categoryEmojis = {
        estudo: "📚",
        trabalho: "💼",
        exercicio: "🏃",
        alimentacao: "🍽️",
        lazer: "🎮",
        outros: "📝",
      }
      const emoji = categoryEmojis[category as keyof typeof categoryEmojis] || "📝"

      htmlContent += `
        <div class="category-item">
          <div>
            <div class="category-name">${emoji} ${category}</div>
            <div class="category-stats">${stats.completed}/${stats.total} atividades (${categoryRate}%)</div>
          </div>
        </div>
      `
    })

    htmlContent += `
        </div>
      </div>
    `
  }

  // Add daily breakdown
  htmlContent += `
    <div class="section">
      <h2 class="section-title">📅 Detalhamento Diário</h2>
  `

  weekDays.forEach((day) => {
    const dayActivities = weekActivities
      .filter((activity) => {
        const activityDate = new Date(activity.date)
        return activityDate.toDateString() === day.toDateString()
      })
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    const dayName = format(day, "EEEE, d 'de' MMMM", { locale: ptBR })
    const isToday = day.toDateString() === new Date().toDateString()

    htmlContent += `
      <div class="day-section">
        <div class="day-header">
          ${dayName} ${isToday ? "(Hoje)" : ""}
          <span style="float: right; font-size: 14px; opacity: 0.8;">
            ${dayActivities.length} atividade${dayActivities.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div class="day-content">
    `

    if (dayActivities.length === 0) {
      htmlContent += '<div class="no-activities">Nenhuma atividade planejada</div>'
    } else {
      dayActivities.forEach((activity) => {
        const categoryEmojis = {
          estudo: "📚",
          trabalho: "💼",
          exercicio: "🏃",
          alimentacao: "🍽️",
          lazer: "🎮",
          outros: "📝",
        }
        const emoji = categoryEmojis[activity.category as keyof typeof categoryEmojis] || "📝"

        htmlContent += `
          <div class="activity">
            <div class="activity-status ${activity.completed ? "completed" : "pending"}"></div>
            <div class="activity-info">
              <div class="activity-title ${activity.completed ? "completed" : ""}">
                ${activity.title}
              </div>
              <div class="activity-details">
                🕐 ${activity.startTime} - ${activity.endTime}
                <span class="activity-category">${emoji} ${activity.category}</span>
                ${activity.priority === "high" ? " 🔴" : activity.priority === "medium" ? " 🟡" : " 🟢"}
              </div>
              ${activity.description ? `<div style="font-size: 12px; color: #64748b; margin-top: 4px;">${activity.description}</div>` : ""}
            </div>
          </div>
        `
      })
    }

    htmlContent += `
        </div>
      </div>
    `
  })

  htmlContent += `
      </div>
      
      <div class="footer">
        <p>📱 Relatório gerado pelo Zeza Planeja em ${format(new Date(), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>
        <p>💡 Mantenha o foco em seus objetivos e celebre cada conquista!</p>
      </div>
    </body>
    </html>
  `

  // Create and download the file
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `relatorio-semanal-${format(weekStart, "yyyy-MM-dd", { locale: ptBR })}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  // Show success message
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("📊 Relatório Exportado!", {
      body: "Seu relatório semanal foi salvo com sucesso. Você pode imprimir como PDF no navegador.",
      icon: "/icon-192x192.png",
    })
  }

  return true
}
