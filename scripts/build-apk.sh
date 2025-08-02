#!/bin/bash

echo "🚀 Iniciando build do APK..."

# 1. Instalar dependências do Capacitor
echo "📦 Instalando Capacitor..."
npm install @capacitor/cli @capacitor/core @capacitor/android @capacitor/local-notifications @capacitor/status-bar @capacitor/splash-screen

# 2. Build do Next.js
echo "🔨 Fazendo build do Next.js..."
npm run export

# 3. Inicializar Capacitor
echo "⚡ Inicializando Capacitor..."
npx cap init "Zeza Planeja" "com.planejador.mobile" --web-dir=out

# 4. Adicionar plataforma Android
echo "🤖 Adicionando plataforma Android..."
npx cap add android

# 5. Sincronizar arquivos
echo "🔄 Sincronizando arquivos..."
npx cap sync

# 6. Abrir Android Studio
echo "📱 Abrindo Android Studio..."
npx cap open android

echo "✅ Pronto! Agora você pode:"
echo "1. No Android Studio, clique em 'Build' > 'Build Bundle(s) / APK(s)' > 'Build APK(s)'"
echo "2. O APK será gerado em: android/app/build/outputs/apk/debug/"
