// Proxy a la API de Anthropic (Claude), con candados para que nadie más use la clave.
//
// Antes: cualquiera podía mandar CUALQUIER pedido (cualquier modelo, sin tope de tokens,
// desde cualquier sitio) y lo pagaba Mentorcito. Ahora:
//  1. La clave sale de ANTHROPIC_API_KEY (sin prefijo VITE_, así nunca puede terminar en el navegador).
//  2. Solo acepta pedidos que vienen de las páginas de Mentorcito (Origin permitido).
//  3. Solo el modelo que usa la app (Haiku 4.5) y con tope de tokens de respuesta.
//  4. Solo pasa los campos de un chat normal (sin tools, sin otros parámetros) y con tamaño máximo.
//  5. Límite de pedidos por IP (por instancia del servidor; generoso para que funcione con el WiFi de un evento).
// El freno de fondo es el límite de gasto mensual en console.anthropic.com (ver INSTALAR-seguridad.md).

const MODELOS_PERMITIDOS = (process.env.ANTHROPIC_MODELOS || "claude-haiku-4-5-20251001").split(",").map((s) => s.trim());
const MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS || 4000);
const MAX_BODY_CHARS = 200000;   // ~200 KB: alcanza para el prompt más largo de MentorAgent
const MAX_MENSAJES = 80;
const LIMITE_POR_IP = Number(process.env.ANTHROPIC_LIMITE_IP || 300); // pedidos cada 10 minutos
const VENTANA_MS = 10 * 60 * 1000;

const ORIGENES_EXTRA = (process.env.ORIGENES_PERMITIDOS || "").split(",").map((s) => s.trim()).filter(Boolean);
function origenPermitido(origin) {
  if (!origin) return false;
  if (origin === "https://mentorcito.vercel.app") return true;
  if (/^https:\/\/mentorcito-[a-z0-9-]+\.vercel\.app$/.test(origin)) return true; // previews de Vercel
  if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return ORIGENES_EXTRA.includes(origin);
}

const pedidosPorIp = new Map();
function superaLimite(ip) {
  const ahora = Date.now();
  const lista = (pedidosPorIp.get(ip) || []).filter((t) => ahora - t < VENTANA_MS);
  lista.push(ahora);
  pedidosPorIp.set(ip, lista);
  if (pedidosPorIp.size > 5000) pedidosPorIp.clear(); // que la memoria no crezca sin fin
  return lista.length > LIMITE_POR_IP;
}

function ipDe(req) {
  return (req.headers["x-real-ip"] || (req.headers["x-forwarded-for"] || "").split(",")[0] || "").toString().trim() || "sin-ip";
}

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  if (origenPermitido(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!origenPermitido(origin)) return res.status(403).json({ error: "Origen no permitido" });
  if (superaLimite(ipDe(req))) return res.status(429).json({ error: "Demasiados pedidos. Probá en unos minutos." });

  const API_KEY = process.env.ANTHROPIC_API_KEY || process.env.VITE_ANTHROPIC_API_KEY; // la segunda es solo de transición
  if (!API_KEY) return res.status(500).json({ error: "API key not configured" });

  let entrada;
  try {
    const crudo = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
    if (crudo.length > MAX_BODY_CHARS) return res.status(413).json({ error: "Pedido demasiado grande" });
    entrada = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch (e) {
    return res.status(400).json({ error: "JSON inválido" });
  }

  if (!MODELOS_PERMITIDOS.includes(entrada.model)) return res.status(400).json({ error: "Modelo no permitido" });
  if (!Array.isArray(entrada.messages) || entrada.messages.length === 0 || entrada.messages.length > MAX_MENSAJES) {
    return res.status(400).json({ error: "Mensajes inválidos" });
  }

  // Solo los campos de un chat normal: lo demás se descarta
  const pedido = {
    model: entrada.model,
    max_tokens: Math.min(Math.max(Number(entrada.max_tokens) || 1000, 1), MAX_TOKENS),
    messages: entrada.messages,
  };
  if (entrada.system != null) pedido.system = entrada.system;
  if (entrada.stream === true) pedido.stream = true;
  if (typeof entrada.temperature === "number") pedido.temperature = Math.min(Math.max(entrada.temperature, 0), 1);

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(pedido),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error("Anthropic API error:", upstream.status, errText.slice(0, 500));
      return res.status(upstream.status).json({ error: "Error del servicio de IA (" + upstream.status + ")" });
    }

    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    res.status(upstream.status);
    const reader = upstream.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: "Error del proxy" });
  }
}

export const config = { api: { responseLimit: false } };
