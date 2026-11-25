// Proxy al Apps Script (Google Sheets).
//
// Cambios de seguridad (16-nov):
//  - Ya no responde a otros sitios (se sacó "Access-Control-Allow-Origin: *").
//  - A TODOS los pedidos les agrega el secreto EVENTOS_SECRETO y la IP de quien pide.
//    El Apps Script rechaza las lecturas (doGet) y las acciones de eventos si no llega el secreto,
//    así que la URL pública del Apps Script ya no devuelve datos. Lo que mande el navegador
//    como "secreto" o "ip" se descarta.
//  - action=records solo devuelve los registros de UNA empresa (?empresa=slug), filtrados acá.
//  - action=stats ya no manda la lista completa de diagnósticos ni nombres o emails.
//  - Los errores internos ya no se devuelven al navegador con detalle.
//
// Cambios de seguridad (25-nov): mentoría y dashboards
//  - Login con código por mail: action=pedir_codigo y action=verificar_codigo (POST).
//    Si el código es correcto, se guarda una cookie de sesión firmada (30 días, HttpOnly)
//    y a cada pedido se le agrega "email_verificado". El Apps Script usa ESE email
//    (no el que manda el navegador). action=mi_sesion (GET) y cerrar_sesion (POST).
//  - action=records exige la clave del dashboard de esa empresa (EMPRESAS_CLAVES en Vercel).
//  - action=stats completo exige DASHBOARD_CLAVE (en Vercel); sin clave solo devuelve
//    los dos números que muestra la página principal (total y match_count).
//  - Las variables nuevas son opcionales: mientras no estén cargadas, todo anda como antes.

import crypto from "crypto";

const COOKIE = "mc_sesion";
const SESION_DIAS = 30;

function ipDe(req) {
  return (req.headers["x-real-ip"] || (req.headers["x-forwarded-for"] || "").split(",")[0] || "").toString().trim();
}

function iguales(a, b) {
  const x = Buffer.from(String(a || ""));
  const y = Buffer.from(String(b || ""));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

// ── Sesión firmada (sin base de datos): base64(email|vence).firma ──
function firmar(texto, secreto) {
  return crypto.createHmac("sha256", "sesion-mentoria:" + secreto).update(texto).digest("base64url");
}

function crearSesion(email, secreto) {
  const vence = Date.now() + SESION_DIAS * 86400000;
  const cuerpo = Buffer.from(email + "|" + vence).toString("base64url");
  return cuerpo + "." + firmar(cuerpo, secreto);
}

function leerCookie(req, nombre) {
  for (const c of (req.headers.cookie || "").split(";")) {
    const i = c.indexOf("=");
    if (i > -1 && c.slice(0, i).trim() === nombre) {
      try { return decodeURIComponent(c.slice(i + 1).trim()); } catch (e) { return ""; }
    }
  }
  return "";
}

function emailDeSesion(req, secreto) {
  if (!secreto) return "";
  const [cuerpo, firma] = leerCookie(req, COOKIE).split(".");
  if (!cuerpo || !firma || !iguales(firma, firmar(cuerpo, secreto))) return "";
  const [email, vence] = Buffer.from(cuerpo, "base64url").toString().split("|");
  if (!email || !(Number(vence) > Date.now())) return "";
  return email;
}

function ponerCookie(res, valor, segundos) {
  res.setHeader("Set-Cookie", `${COOKIE}=${valor}; Path=/api; Max-Age=${segundos}; HttpOnly; Secure; SameSite=Lax`);
}

// "acme:clave1, demo:clave2" → { acme: "clave1", demo: "clave2" }
function clavesEmpresas() {
  const mapa = {};
  (process.env.EMPRESAS_CLAVES || "").split(",").forEach((par) => {
    const i = par.indexOf(":");
    if (i > 0) mapa[par.slice(0, i).trim()] = par.slice(i + 1).trim();
  });
  return mapa;
}

async function llamarGet(SHEETS_URL, query) {
  const url = `${SHEETS_URL}?${new URLSearchParams(query).toString()}`;
  // Google Apps Script hace redirects — seguirlos
  const response = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json, text/plain, */*" },
  });
  const trimmed = (await response.text()).trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    console.error("Google returned non-JSON:", trimmed.slice(0, 200));
    return null;
  }
  return JSON.parse(trimmed);
}

async function llamarPost(SHEETS_URL, payload) {
  const gsResponse = await fetch(SHEETS_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "text/plain", "User-Agent": "Mozilla/5.0" },
    body: JSON.stringify(payload),
  });
  // Devolvemos lo que respondió Apps Script (si no es JSON, ok:true como antes)
  const gsText = (await gsResponse.text()).trim();
  try {
    return JSON.parse(gsText);
  } catch (e) {
    return { ok: true };
  }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(204).end();
  res.setHeader("Cache-Control", "no-store");

  // SHEETS_URL (privada, sin prefijo VITE_) tiene prioridad; VITE_SHEETS_URL queda como respaldo.
  const SHEETS_URL = process.env.SHEETS_URL || process.env.VITE_SHEETS_URL;
  if (!SHEETS_URL) return res.status(500).json({ error: "SHEETS_URL not configured" });
  const SECRETO = process.env.EVENTOS_SECRETO || "";

  try {
    const emailSesion = emailDeSesion(req, SECRETO);

    if (req.method === "GET") {
      const query = Object.assign({}, req.query);
      delete query.secreto;
      delete query.ip;
      delete query.email_verificado;
      delete query.callback; // sin JSONP
      if (!query.action) query.action = "stats"; // el Apps Script usa stats por defecto

      // ¿Con qué email entró esta persona? (no llama a Google)
      if (query.action === "mi_sesion") return res.status(200).json({ email: emailSesion || null });

      // Dashboard de una empresa: exige su clave (si EMPRESAS_CLAVES está cargada en Vercel)
      const empresa = (query.action === "records") ? (query.empresa || "").toString() : null;
      if (query.action === "records") {
        if (!empresa) return res.status(400).json({ error: "Falta empresa" });
        const claves = clavesEmpresas();
        if (Object.keys(claves).length && !iguales(query.clave, claves[empresa])) {
          return res.status(401).json({ error: "clave_incorrecta" });
        }
      }

      // Dashboard interno: stats completo solo con DASHBOARD_CLAVE (si está cargada en Vercel)
      const DASHBOARD_CLAVE = process.env.DASHBOARD_CLAVE || "";
      const statsCompleto = query.action === "stats" && (!DASHBOARD_CLAVE || iguales(query.clave, DASHBOARD_CLAVE));
      if (query.action === "stats" && query.clave !== undefined && !statsCompleto) {
        return res.status(401).json({ error: "clave_incorrecta" });
      }
      // La clave del dashboard no viaja a Google (la del organizador de eventos sí: la valida el Apps Script)
      if (query.action === "stats" || query.action === "records") delete query.clave;

      query.secreto = SECRETO;
      query.ip = ipDe(req);
      if (emailSesion) query.email_verificado = emailSesion;

      const data = await llamarGet(SHEETS_URL, query);
      if (!data) return res.status(502).json({ error: "Google Apps Script returned non-JSON" });

      // Datos personales: el navegador nunca recibe emails, y nombres solo si la persona aceptó compartir con su empresa
      const anonimo = (r) => {
        const c = Object.assign({}, r);
        delete c.email;
        if (!c.compartir_empresa) delete c.nombre;
        return c;
      };
      if (query.action === "stats") {
        delete data.all_records;
        if (Array.isArray(data.recent)) data.recent = data.recent.map((r) => { const c = anonimo(r); delete c.nombre; return c; });
        // Sin la clave del Dashboard, solo lo que muestra la página principal
        if (!statsCompleto) return res.status(200).json({ total: data.total, match_count: data.match_count });
      }
      if (empresa && Array.isArray(data.records)) {
        data.records = data.records.filter((r) => r && r.empresa_id === empresa).map(anonimo);
      }
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      let payload;
      try {
        payload = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      } catch (e) {
        return res.status(400).json({ error: "JSON inválido" });
      }
      if (JSON.stringify(payload).length > 50000) return res.status(413).json({ error: "Pedido demasiado grande" });
      delete payload.secreto;
      delete payload.ip;
      delete payload.email_verificado;

      if (payload.action === "cerrar_sesion") {
        ponerCookie(res, "", 0);
        return res.status(200).json({ ok: true });
      }

      payload.secreto = SECRETO;
      payload.ip = ipDe(req);
      if (emailSesion) payload.email_verificado = emailSesion;

      const data = await llamarPost(SHEETS_URL, payload);

      // Código correcto → sesión de 30 días
      if (payload.action === "verificar_codigo" && data && data.ok && data.email && SECRETO) {
        ponerCookie(res, crearSesion(String(data.email).toLowerCase(), SECRETO), SESION_DIAS * 86400);
      }
      return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Proxy error:", err.message);
    return res.status(500).json({ error: "Error del proxy" });
  }
}
