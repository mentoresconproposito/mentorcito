export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const SHEETS_URL = process.env.VITE_SHEETS_URL;
  if (!SHEETS_URL) {
    return res.status(500).json({ error: "VITE_SHEETS_URL not configured" });
  }

  try {
    if (req.method === "GET") {
      const action = req.query.action || "stats";
      const response = await fetch(`${SHEETS_URL}?action=${action}`, {
        redirect: "follow",
        headers: { "Accept": "application/json" },
      });
      const text = await response.text();
      const data = JSON.parse(text);
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string"
        ? req.body
        : JSON.stringify(req.body);
      await fetch(SHEETS_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain" },
        body,
      });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
