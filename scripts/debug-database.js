// Script para debugar o banco de dados
const fs = require("fs").promises
const path = require("path")

const DATA_FILE = path.join(process.cwd(), "data", "activities.json")

async function debugDatabase() {
  console.log("🔍 Debugando o banco de dados...\n")

  try {
    // 1. Verificar estrutura de pastas
    console.log("📁 Verificando estrutura:")
    console.log("- Diretório atual:", process.cwd())
    console.log("- Arquivo de dados:", DATA_FILE)

    // 2. Verificar se o diretório data existe
    const dataDir = path.dirname(DATA_FILE)
    try {
      await fs.access(dataDir)
      console.log("✅ Diretório 'data' existe")
    } catch {
      console.log("❌ Diretório 'data' não existe, criando...")
      await fs.mkdir(dataDir, { recursive: true })
      console.log("✅ Diretório 'data' criado")
    }

    // 3. Verificar se o arquivo existe
    try {
      const stats = await fs.stat(DATA_FILE)
      console.log("✅ Arquivo activities.json existe")
      console.log("- Tamanho:", stats.size, "bytes")
      console.log("- Modificado em:", stats.mtime)
    } catch {
      console.log("❌ Arquivo activities.json não existe, criando...")
      await fs.writeFile(DATA_FILE, "[]", "utf-8")
      console.log("✅ Arquivo activities.json criado")
    }

    // 4. Ler conteúdo atual
    const content = await fs.readFile(DATA_FILE, "utf-8")
    console.log("\n📄 Conteúdo atual do arquivo:")
    console.log(content)

    try {
      const activities = JSON.parse(content)
      console.log(`\n📊 Atividades encontradas: ${activities.length}`)

      if (activities.length > 0) {
        console.log("📋 Primeira atividade:")
        console.log(JSON.stringify(activities[0], null, 2))
      }
    } catch (parseError) {
      console.log("❌ Erro ao fazer parse do JSON:", parseError.message)
      console.log("🔧 Corrigindo arquivo...")
      await fs.writeFile(DATA_FILE, "[]", "utf-8")
      console.log("✅ Arquivo corrigido")
    }

    // 5. Testar permissões de escrita
    console.log("\n🔐 Testando permissões de escrita...")
    const testData = [
      {
        id: "test_" + Date.now(),
        title: "Teste de Escrita",
        description: "Teste de permissões",
        date: new Date().toISOString().split("T")[0],
        startTime: "10:00",
        endTime: "11:00",
        category: "teste",
        priority: "medium",
        completed: false,
        notifications: { start: true, end: true, reminder: 15 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    await fs.writeFile(DATA_FILE, JSON.stringify(testData, null, 2), "utf-8")
    console.log("✅ Escrita bem-sucedida")

    // 6. Verificar se foi escrito corretamente
    const verifyContent = await fs.readFile(DATA_FILE, "utf-8")
    const verifyData = JSON.parse(verifyContent)

    if (verifyData.length === 1 && verifyData[0].title === "Teste de Escrita") {
      console.log("✅ Verificação bem-sucedida")
    } else {
      console.log("❌ Erro na verificação")
    }

    // 7. Limpar arquivo de teste
    await fs.writeFile(DATA_FILE, "[]", "utf-8")
    console.log("🧹 Arquivo limpo")

    console.log("\n🎉 Debug concluído! O banco de dados está funcionando.")
  } catch (error) {
    console.error("\n❌ Erro durante o debug:", error)
    console.log("\n🔧 Possíveis soluções:")
    console.log("1. Verificar se você tem permissões de escrita na pasta")
    console.log("2. Verificar se o Next.js está rodando")
    console.log("3. Tentar executar como administrador")
    console.log("4. Verificar se não há antivírus bloqueando")
  }
}

// Executar debug
debugDatabase()
