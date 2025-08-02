// lib/native/notifications.ts
import { Capacitor } from "@capacitor/core";
import { LocalNotifications, type PendingResult } from "@capacitor/local-notifications";

export const isNative = () => Capacitor.isNativePlatform();

const CHANNEL_ID = "reminders";

export async function initLocalNotifications() {
  if (!isNative()) return;

  // Permissão (Android 13+ pede runtime)
  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== "granted") {
    await LocalNotifications.requestPermissions();
  }

  // Canal Android (necessário p/ som/importância)
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Lembretes",
      description: "Notificações do Zeza Planeja",
      importance: 5, // MAX
      visibility: 1,
      sound: undefined, // deixe undefined se você não colocou um .wav em res/raw
      lights: true,
      vibration: true,
    });
  } catch (e) {
    console.warn("createChannel error", e);
  }
}

/** Gera IDs estáveis para cada notificação da atividade */
function makeIds(activityId: string) {
  // Atenção: IDs devem ser inteiros 32-bit
  const base = Math.abs(hashCode(activityId)) % 1000000000;
  return {
    start: base + 1,
    end: base + 2,
    reminder: base + 3,
  };
}
function hashCode(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

/** Cancela todas as notificações programadas p/ uma atividade */
export async function cancelActivityNotifications(activityId: string) {
  if (!isNative()) return;
  const { start, end, reminder } = makeIds(activityId);
  await LocalNotifications.cancel({ notifications: [
    { id: start }, { id: end }, { id: reminder }
  ]});
}

/** Agenda início/fim/lembrete da atividade (datas no fuso do dispositivo) */
export async function scheduleActivityNotifications(activity: {
  id: string;
  title: string;
  date: string;         // "yyyy-MM-dd"
  startTime: string;    // "HH:mm"
  endTime: string;      // "HH:mm"
  notifications?: { start: boolean; end: boolean; reminder: number }; // minutos
}) {
  if (!isNative()) return;

  const { start, end, reminder } = makeIds(activity.id);

  const startAt = toDeviceDate(activity.date, activity.startTime);
  const endAt = toDeviceDate(activity.date, activity.endTime);
  const reminderMinutes = Math.max(0, activity.notifications?.reminder ?? 0);
  const reminderAt = new Date(startAt.getTime() - reminderMinutes * 60_000);

  const notifs: any[] = [];

  if (activity.notifications?.start) {
    notifs.push({
      id: start,
      title: activity.title || "Atividade",
      body: "Está começando agora.",
      schedule: { at: startAt, allowWhileIdle: true },
      channelId: CHANNEL_ID,
      // smallIcon deve ser um recurso válido. Use o padrão do app:
      smallIcon: "ic_launcher", // NÃO use caminhos web
      // largeIcon aceita recurso; evite caminho web
      // sound: "beep.wav", // só se você colocou res/raw/beep.wav
    });
  }

  if (activity.notifications?.end) {
    notifs.push({
      id: end,
      title: activity.title || "Atividade",
      body: "Terminou agora.",
      schedule: { at: endAt, allowWhileIdle: true },
      channelId: CHANNEL_ID,
      smallIcon: "ic_launcher",
    });
  }

  if (reminderMinutes > 0 && reminderAt.getTime() > Date.now()) {
    notifs.push({
      id: reminder,
      title: activity.title || "Lembrete",
      body: `Começa em ${reminderMinutes} min.`,
      schedule: { at: reminderAt, allowWhileIdle: true },
      channelId: CHANNEL_ID,
      smallIcon: "ic_launcher",
    });
  }

  if (notifs.length) {
    await LocalNotifications.schedule({ notifications: notifs });
  }
}

/** Converte "yyyy-MM-dd" + "HH:mm" para Date no fuso local */
function toDeviceDate(dateStr: string, timeStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  return new Date(y, (m - 1), d, hh, mm, 0, 0);
}
