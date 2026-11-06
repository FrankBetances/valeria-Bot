/**
 * Valeria Bot — Cloudflare Worker Webhook Proxy
 * 
 * Intermediario ultra-ligero para Telegram Bot API.
 * Resuelve el fallo de redirección HTTP 302 originado por Google Apps Script:
 * 1. Valida el token secreto de Telegram (X-Telegram-Bot-Api-Secret-Token).
 * 2. Responde 200 OK inmediatamente a Telegram para evitar timeout y bucles de reintento.
 * 3. Reenvía el payload a Google Apps Script en segundo plano vía ctx.waitUntil().
 */

export default {
  async fetch(request, env, ctx) {
    // Solo admitir peticiones POST de Telegram
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Comprobación de seguridad: cabecera secreta de Telegram
    const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    if (!env.TG_SECRET || secret !== env.TG_SECRET) {
      return new Response("Unauthorized", { status: 403 });
    }

    // Lectura del cuerpo recibido
    const body = await request.text();

    // Reenvío asíncrono al backend en Google Apps Script
    if (env.GAS_URL) {
      ctx.waitUntil(
        fetch(env.GAS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: body
        }).catch(err => {
          console.error("Error al reenviar a Apps Script:", err);
        })
      );
    }

    // Respuesta inmediata con código 200 OK a Telegram
    return new Response("ok", {
      status: 200,
      headers: { "Content-Type": "text/plain" }
    });
  }
};
