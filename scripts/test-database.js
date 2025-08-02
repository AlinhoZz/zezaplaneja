// Script para testar o banco de dados
const fs = require("fs").promises
const path = require("path")

const DATA_FILE = path.join(process.cwd(), "data", "activities.json")

async function testDatabase() {
  console.log("🧪 Testando o banco de dados...\n")

  try {
    // 1. Verificar se o diretório existe
    const dataDir = path.dirname(DATA_FILE)
    console.log("📁 Verificando diretório:", dataDir)

    try {
      await fs.access(dataDir)
      console.log("✅ Diretório existe")
    } catch {
      console.log("📁 Criando diretório...")
      await fs.mkdir(dataDir, { recursive: true })
      console.log("✅ Diretório criado")
    }

    // 2. Testar criação de atividade
    console.log("\n📝 Testando criação de atividade...")
    const testActivity = {
      id: "test_" + Date.now(),
      title: "Atividade de Teste",
      description: "Esta é uma atividade de teste do banco de dados",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      category: "teste",
      priority: "medium",
      completed: false,
      notifications: {
        start: true,
        end: true,
        reminder: 15,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 3. Ler atividades existentes
    let activities = []
    try {
      const data = await fs.readFile(DATA_FILE, "utf-8")
      activities = JSON.parse(data)
      console.log(`📖 Lidas ${activities.length} atividades existentes`)
    } catch {
      console.log("📖 Arquivo não existe, criando novo...")
    }

    // 4. Adicionar nova atividade
    activities.push(testActivity)
    await fs.writeFile(DATA_FILE, JSON.stringify(activities, null, 2))
    console.log("✅ Atividade de teste criada")

    // 5. Verificar se foi salva corretamente
    const savedData = await fs.readFile(DATA_FILE, "utf-8")
    const savedActivities = JSON.parse(savedData)
    const foundActivity = savedActivities.find((a) => a.id === testActivity.id)

    if (foundActivity) {
      console.log("✅ Atividade encontrada no banco de dados")
      console.log("📊 Dados salvos:", {
        id: foundActivity.id,
        title: foundActivity.title,
        date: foundActivity.date,
        time: `${foundActivity.startTime} - ${foundActivity.endTime}`,
      })
    } else {
      console.log("❌ Atividade não encontrada!")
    }

    // 6. Testar atualização
    console.log("\n🔄 Testando atualização...")
    foundActivity.completed = true
    foundActivity.updatedAt = new Date().toISOString()

    const updatedActivities = savedActivities.map((a) => (a.id === testActivity.id ? foundActivity : a))

    await fs.writeFile(DATA_FILE, JSON.stringify(updatedActivities, null, 2))
    console.log("✅ Atividade atualizada")

    // 7. Testar exclusão
    console.log("\n🗑️ Testando exclusão...")
    const filteredActivities = updatedActivities.filter((a) => a.id !== testActivity.id)
    await fs.writeFile(DATA_FILE, JSON.stringify(filteredActivities, null, 2))
    console.log("✅ Atividade excluída")

    // 8. Verificar estado final
    const finalData = await fs.readFile(DATA_FILE, "utf-8")
    const finalActivities = JSON.parse(finalData)
    console.log(`\n📊 Estado final: ${finalActivities.length} atividades no banco`)

    console.log("\n🎉 Todos os testes passaram! O banco de dados está funcionando corretamente.")
  } catch (error) {
    console.error("\n❌ Erro no teste:", error)
    console.log("\n🔧 Possíveis soluções:")
    console.log("1. Verificar permissões de escrita na pasta do projeto")
    console.log("2. Verificar se o Next.js está rodando")
    console.log("3. Tentar reiniciar o servidor")
  }
}

// Executar teste
testDatabase()
