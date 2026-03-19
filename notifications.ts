// ─────────────────────────────────────────────────────────────────────────────
// notifications.ts  —  ضع هذا الملف في: server/notifications.ts
//
// يدعم 4 قنوات: WhatsApp (Twilio) · Email (Resend) · SMS (Twilio) · Telegram
//
// متغيرات البيئة المطلوبة في .env:
//   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
//   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
//   TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
//   TWILIO_SMS_FROM=+1xxxxxxxxxx
//   OWNER_WHATSAPP=whatsapp:+966xxxxxxxxx   ← رقم المالك بالواتساب
//   OWNER_PHONE=+966xxxxxxxxx               ← رقم المالك للـ SMS
//   OWNER_EMAIL=owner@example.com
//   RESEND_API_KEY=re_xxxxxxxxxxxx
//   TELEGRAM_BOT_TOKEN=xxxxxxxxxx:xxxxxxxxxx
//   TELEGRAM_CHAT_ID=xxxxxxxxxx             ← chat_id الخاص بالمالك
// ─────────────────────────────────────────────────────────────────────────────

const ENV = {
  // Twilio
  twilioSid:        process.env.TWILIO_ACCOUNT_SID    ?? "",
  twilioToken:      process.env.TWILIO_AUTH_TOKEN     ?? "",
  twilioWaFrom:     process.env.TWILIO_WHATSAPP_FROM  ?? "whatsapp:+14155238886",
  twilioSmsFrom:    process.env.TWILIO_SMS_FROM       ?? "",
  // Owner contacts
  ownerWhatsApp:    process.env.OWNER_WHATSAPP        ?? "whatsapp:+201029352221",
  ownerPhone:       process.env.OWNER_PHONE           ?? "",
  ownerEmail:       process.env.OWNER_EMAIL           ?? "",
  // Resend (Email)
  resendKey:        process.env.RESEND_API_KEY        ?? "",
  // Telegram
  telegramToken:    process.env.TELEGRAM_BOT_TOKEN    ?? "",
  telegramChatId:   process.env.TELEGRAM_CHAT_ID      ?? "",
};

// ─── Types ────────────────────────────────────────────────────────────────────
export type NotificationPayload =
  | { type: "reservation"; data: ReservationData }
  | { type: "order";       data: OrderData       };

interface ReservationData {
  customerName:    string;
  customerPhone:   string;
  customerEmail?:  string;
  reservationDate: Date;
  numberOfGuests:  number;
  specialRequests?: string;
}

interface OrderData {
  customerName:    string;
  customerPhone:   string;
  deliveryAddress: string;
  items:           string;   // JSON
  totalPrice:      number;   // cents
  deliveryFee:     number;   // cents
  notes?:          string;
}

// ─── Message Builders ─────────────────────────────────────────────────────────
function buildReservationText(d: ReservationData): string {
  const date = new Date(d.reservationDate).toLocaleString("ar-SA", {
    dateStyle: "full", timeStyle: "short",
  });
  return [
    "🍽️ *حجز جديد!*",
    `👤 الاسم: ${d.customerName}`,
    `📞 الهاتف: ${d.customerPhone}`,
    d.customerEmail ? `📧 البريد: ${d.customerEmail}` : "",
    `📅 التاريخ: ${date}`,
    `👥 الأشخاص: ${d.numberOfGuests}`,
    d.specialRequests ? `📝 طلبات خاصة: ${d.specialRequests}` : "",
  ].filter(Boolean).join("\n");
}

function buildOrderText(d: OrderData): string {
  let items: Array<{ name?: string; quantity: number; price: number }> = [];
  try { items = JSON.parse(d.items); } catch {}
  const itemsText = items.map(i => `  • ${i.name ?? "صنف"} × ${i.quantity} — ${(i.price * i.quantity / 100).toFixed(2)} ر.س`).join("\n");
  return [
    "🛵 *طلب توصيل جديد!*",
    `👤 الاسم: ${d.customerName}`,
    `📞 الهاتف: ${d.customerPhone}`,
    `📍 العنوان: ${d.deliveryAddress}`,
    itemsText ? `\n🧾 الأصناف:\n${itemsText}` : "",
    `\n💰 رسوم التوصيل: ${(d.deliveryFee / 100).toFixed(2)} ر.س`,
    `💵 الإجمالي: ${(d.totalPrice / 100).toFixed(2)} ر.س`,
    d.notes ? `📝 ملاحظات: ${d.notes}` : "",
  ].filter(Boolean).join("\n");
}

function buildEmailSubject(payload: NotificationPayload): string {
  return payload.type === "reservation"
    ? `🍽️ حجز جديد — ${payload.data.customerName}`
    : `🛵 طلب توصيل جديد — ${(payload.data as OrderData).customerName}`;
}

function buildEmailHtml(text: string): string {
  const html = text
    .replace(/\*(.+?)\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
  return `
    <div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;background:#fffbf0;border-radius:12px;border:1px solid #fcd34d">
      <h2 style="color:#b45309;margin-bottom:16px">إشعار من موقع المطعم</h2>
      <div style="background:white;padding:16px;border-radius:8px;line-height:1.8;color:#1e293b">${html}</div>
      <p style="color:#94a3b8;font-size:12px;margin-top:16px;text-align:center">تم الإرسال تلقائياً من نظام المطعم</p>
    </div>`;
}

// ─── Channel Senders ──────────────────────────────────────────────────────────

/** WhatsApp عبر Twilio */
async function sendWhatsApp(text: string): Promise<void> {
  if (!ENV.twilioSid || !ENV.ownerWhatsApp) return;
  const url = `https://api.twilio.com/2010-04-01/Accounts/${ENV.twilioSid}/Messages.json`;
  const body = new URLSearchParams({
    From: ENV.twilioWaFrom,
    To:   ENV.ownerWhatsApp,
    Body: text,
  });
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${ENV.twilioSid}:${ENV.twilioToken}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("[WhatsApp] فشل الإرسال:", err);
  } else {
    console.log("[WhatsApp] ✅ تم الإرسال");
  }
}

/** SMS عبر Twilio */
async function sendSMS(text: string): Promise<void> {
  if (!ENV.twilioSid || !ENV.ownerPhone || !ENV.twilioSmsFrom) return;
  // إزالة markdown للـ SMS
  const plain = text.replace(/\*/g, "");
  const url = `https://api.twilio.com/2010-04-01/Accounts/${ENV.twilioSid}/Messages.json`;
  const body = new URLSearchParams({
    From: ENV.twilioSmsFrom,
    To:   ENV.ownerPhone,
    Body: plain,
  });
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${ENV.twilioSid}:${ENV.twilioToken}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("[SMS] فشل الإرسال:", err);
  } else {
    console.log("[SMS] ✅ تم الإرسال");
  }
}

/** Email عبر Resend */
async function sendEmail(subject: string, html: string): Promise<void> {
  if (!ENV.resendKey || !ENV.ownerEmail) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ENV.resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from:    "noreply@restaurant.com",   // ← غيّر لدومينك
      to:      [ENV.ownerEmail],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("[Email] فشل الإرسال:", err);
  } else {
    console.log("[Email] ✅ تم الإرسال");
  }
}

/** Telegram Bot */
async function sendTelegram(text: string): Promise<void> {
  if (!ENV.telegramToken || !ENV.telegramChatId) return;
  const url = `https://api.telegram.org/bot${ENV.telegramToken}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id:    ENV.telegramChatId,
      text,
      parse_mode: "Markdown",
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("[Telegram] فشل الإرسال:", err);
  } else {
    console.log("[Telegram] ✅ تم الإرسال");
  }
}

// ─── Main Dispatcher ──────────────────────────────────────────────────────────
/**
 * استدعِ هذه الدالة من routers.ts عند كل حجز أو طلب جديد.
 * تُرسل لجميع القنوات المُضبوطة تلقائياً — بالتوازي.
 */
export async function sendOwnerNotification(payload: NotificationPayload): Promise<void> {
  const text =
    payload.type === "reservation"
      ? buildReservationText(payload.data)
      : buildOrderText(payload.data as OrderData);

  const subject  = buildEmailSubject(payload);
  const emailHtml = buildEmailHtml(text);

  // إرسال كل القنوات بالتوازي — فشل قناة لا يوقف الباقي
  await Promise.allSettled([
    sendWhatsApp(text),
    sendSMS(text),
    sendEmail(subject, emailHtml),
    sendTelegram(text),
  ]);
}
