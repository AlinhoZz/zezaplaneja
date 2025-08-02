import type React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NativeInit from "./native-init";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zeza Planeja - Organize sua vida",
  description:
    "Zeza Planeja: Seu aplicativo mobile para organizar atividades diárias e semanais com notificações e metas.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zeza Planeja",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
  generator: "v0.dev",
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Zeza Planeja" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.className} overscroll-none`}>
        {/* Inicializações nativas (StatusBar etc.) */}
        <NativeInit />
        {children}

        {/* Registra SW só quando NÃO é nativo (APK) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
                if (!isNative && 'serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(reg) { console.log('SW registered: ', reg); })
                      .catch(function(err) { console.log('SW registration failed: ', err); });
                  });
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
