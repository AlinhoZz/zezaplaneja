"use client";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { initLocalNotifications } from "@/lib/native/notifications";

export default function NativeInit() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    (async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: "#0F172A" });

        // 🔔 Inicializa Local Notifications
        await initLocalNotifications();
      } catch (e) {
        console.warn("Native init error", e);
      }
    })();
  }, []);

  return null;
}
