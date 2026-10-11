/**
 * Avisos de novas mensagens de contato. Cada canal é opcional:
 * só é usado se as variáveis de ambiente correspondentes estiverem definidas.
 * Falhas aqui nunca afetam o visitante: a mensagem já foi salva no banco.
 */

export type NewMessage = { name: string; email: string; subject: string; message: string };

const TIMEOUT_MS = 8000;

async function sendEmail(m: NewMessage) {
  const { RESEND_API_KEY, NOTIFY_EMAIL_TO, NOTIFY_EMAIL_FROM } = process.env;
  if (!RESEND_API_KEY || !NOTIFY_EMAIL_TO) return;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: NOTIFY_EMAIL_FROM || "Portfólio <onboarding@resend.dev>",
      to: [NOTIFY_EMAIL_TO],
      reply_to: m.email, // responder o e-mail já vai direto para o visitante
      subject: `Novo contato: ${m.subject}`,
      text: `De: ${m.name} <${m.email}>\nAssunto: ${m.subject}\n\n${m.message}`,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Resend respondeu ${res.status}: ${await res.text()}`);
}

async function sendWhatsApp(m: NewMessage) {
  const { CALLMEBOT_PHONE, CALLMEBOT_APIKEY } = process.env;
  if (!CALLMEBOT_PHONE || !CALLMEBOT_APIKEY) return;

  const preview = m.message.length > 400 ? `${m.message.slice(0, 400)}…` : m.message;
  const text = `Novo contato no portfólio\nDe: ${m.name} (${m.email})\nAssunto: ${m.subject}\n\n${preview}`;

  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", CALLMEBOT_PHONE);
  url.searchParams.set("text", text);
  url.searchParams.set("apikey", CALLMEBOT_APIKEY);

  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`CallMeBot respondeu ${res.status}`);
}

export async function notifyNewMessage(m: NewMessage) {
  const results = await Promise.allSettled([sendEmail(m), sendWhatsApp(m)]);
  for (const r of results) {
    if (r.status === "rejected") console.error("Falha ao enviar aviso de contato:", r.reason);
  }
}
