export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const SHEETS_URL = process.env.VITE_SHEETS_URL;
  if (!SHEETS_URL) return res.status(500).json({ error: "VITE_SHEETS_URL not configured" });

  try {
    if (req.method === "GET") {
      const action = req.query.action || "stats";
      const url = `${SHEETS_URL}?action=${action}`;

      // Google Apps Script hace redirects — seguirlos manualmente
      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json, text/plain, */*",
        },
      });

      const text = await response.text();

      // Validar que es JSON antes de parsear
      const trimmed = text.trim();
      if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        console.error("Google returned non-JSON:", trimmed.slice(0, 200));
        return res.status(502).json({ 
          error: "Google Apps Script returned non-JSON",
          preview: trimmed.slice(0, 100)
        });
      }

      const data = JSON.parse(trimmed);
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);

      await fetch(SHEETS_URL, {
        method: "POST",
        redirect: "follow",
        headers: {
          "Content-Type": "text/plain",
          "User-Agent": "Mozilla/5.0",
        },
        body,
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("Proxy error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
