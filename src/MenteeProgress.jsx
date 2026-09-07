import { useState, useEffect } from "react";

var T = {
  bg:           "#0d0d1a",
  header:       "rgba(13,13,26,0.97)",
  card:         "rgba(255,255,255,0.04)",
  border:       "rgba(255,255,255,0.08)",
  text:         "rgba(255,255,255,0.88)",
  textSub:      "rgba(255,255,255,0.55)",
  textMuted:    "rgba(255,255,255,0.45)",
  textDisabled: "rgba(255,255,255,0.25)",
  textWhite:    "white",
};

var PREP_MENTEE_SYSTEM_PROMPT =
  "Sos un asistente que le muestra a un mentee un resumen de su propio progreso en su mentoría, dentro de Mentorcito.\n\n" +
  "Te paso el historial completo de sus sesiones (fecha, temas vistos, qué se llevó, próximos pasos). Tu trabajo es armar un resumen breve, en segunda persona, hablándole directamente al mentee, que lo ayude a ver su propio avance.\n\n" +
  "Estructura de tu respuesta (texto plano, sin JSON, sin markdown pesado):\n" +
  "- Un párrafo corto sobre el camino recorrido hasta ahora (qué fueron trabajando en conjunto).\n" +
  "- Qué tiene pendiente o a mitad de camino de la última sesión.\n" +
  "- Un cierre breve y alentador.\n\n" +
  "Tono cercano, en segunda persona (\"venís trabajando en...\", \"te quedó pendiente...\"). Sé breve — esto se lee en menos de un minuto.";

export default function MenteeProgress() {
  var [initializing, setInitializing] = useState(true);
  var [email, setEmail] = useState(null);
  var [emailInput, setEmailInput] = useState("");
  var [logs, setLogs] = useState([]);
  var [prepResult, setPrepResult] = useState(null);
  var [prepLoading, setPrepLoading] = useState(false);

  useEffect(function () {
    var stored = localStorage.getItem("mentee_progress_email");
    if (stored) {
      setEmail(stored);
      loadProgress(stored);
    } else {
      setInitializing(false);
    }
  }, []);

  async function loadProgress(mail) {
    try {
      var res = await fetch("/api/sheets?action=get_mentee_progress&mentee_email=" + encodeURIComponent(mail));
      var data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error("Error cargando progreso:", e);
    } finally {
      setInitializing(false);
    }
  }

  function handleStartEmail() {
    var trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || trimmed.indexOf("@") === -1) return;
    localStorage.setItem("mentee_progress_email", trimmed);
    setEmail(trimmed);
    setInitializing(true);
    loadProgress(trimmed);
  }

  async function handlePrepararResumen() {
    setPrepLoading(true);
    try {
      var historial = logs.map(function (l) {
        return "Fecha: " + l.fecha + "\nTemas vistos: " + l.temas_vistos + "\nQué se llevó: " + l.que_se_llevo + (l.proximos_pasos ? "\nPróximos pasos: " + l.proximos_pasos : "");
      }).join("\n---\n");

      var res = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 500,
          stream: false,
          system: PREP_MENTEE_SYSTEM_PROMPT,
          messages: [{ role: "user", content: "Historial de mis sesiones:\n\n" + historial }],
        }),
      });
      var data = await res.json();
      var textBlock = (data.content || []).find(function (b) { return b.type === "text"; });
      setPrepResult(textBlock ? textBlock.text : "No se pudo generar el resumen.");
    } catch (e) {
      console.error("Error generando resumen:", e);
    } finally {
      setPrepLoading(false);
    }
  }

  if (initializing) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSub, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Cargando...
      </div>
    );
  }

  if (!email) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ maxWidth: 380, width: "100%", background: T.card, border: "1px solid " + T.border, borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>📈</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.textWhite, marginBottom: 6 }}>Mi progreso</div>
          <div style={{ fontSize: 13, color: T.textSub, marginBottom: 18, lineHeight: 1.5 }}>
            Ingresá el email que le diste a tu mentor para ver el registro de tus sesiones.
          </div>
          <input
            type="email"
            value={emailInput}
            onChange={function (e) { setEmailInput(e.target.value); }}
            onKeyDown={function (e) { if (e.key === "Enter") handleStartEmail(); }}
            placeholder="tu@email.com"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid " + T.border, color: T.text, fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
          />
          <button
            onClick={handleStartEmail}
            disabled={!emailInput.trim()}
            style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: emailInput.trim() ? "linear-gradient(135deg, #4361ee, #7b2ff7)" : "rgba(255,255,255,0.07)", color: emailInput.trim() ? "white" : T.textDisabled, fontWeight: 600, fontSize: 14, cursor: emailInput.trim() ? "pointer" : "not-allowed" }}
          >
            Ver mi progreso
          </button>
        </div>
      </div>
    );
  }

  var mentoresDistintos = Array.from(new Set(logs.map(function (l) { return l.mentor_email; })));

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>
        {"@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; }"}
      </style>

      <div style={{ padding: "16px 20px", borderBottom: "1px solid " + T.border, background: T.header }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.textWhite }}>Mi progreso</div>
      </div>

      <div style={{ padding: 20, maxWidth: 640, margin: "0 auto" }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: T.textMuted, fontSize: 13, lineHeight: 1.6 }}>
            Todavía no tenés sesiones registradas. Pedile a tu mentor que empiece a cargarlas después de cada encuentro.
          </div>
        ) : (
          <>
            {(function () {
              var totalPrograma = (logs.find(function (l) { return l.total_sesiones_programa; }) || {}).total_sesiones_programa;
              if (!totalPrograma) return null;
              return (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textSub, marginBottom: 6 }}>
                    <span>Tu progreso</span>
                    <span>Sesión {logs.length} de {totalPrograma}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: Math.min(100, (logs.length / totalPrograma) * 100) + "%", background: "linear-gradient(90deg, #4361ee, #7b2ff7)", borderRadius: 3 }} />
                  </div>
                </div>
              );
            })()}
            <button
              onClick={handlePrepararResumen}
              disabled={prepLoading}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(123,47,247,0.4)", background: "rgba(123,47,247,0.1)", color: "#c9b8ff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 16 }}
            >
              {prepLoading ? "Generando..." : "✨ Ver cómo viene mi progreso"}
            </button>

            {prepResult && (
              <div style={{ background: "rgba(123,47,247,0.06)", border: "1px solid rgba(123,47,247,0.2)", borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 13, color: T.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {prepResult}
              </div>
            )}

            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
              Historial de sesiones {mentoresDistintos.length > 1 ? "(con más de un mentor)" : ""}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {logs.map(function (log, i) {
                return (
                  <div key={i} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, fontWeight: 600 }}>
                      {log.fecha}{mentoresDistintos.length > 1 ? " · " + log.mentor_email : ""}
                    </div>
                    <div style={{ fontSize: 12.5, color: T.text, marginBottom: 6 }}><strong style={{ color: T.textSub }}>Temas: </strong>{log.temas_vistos}</div>
                    {log.que_se_llevo && <div style={{ fontSize: 12.5, color: T.text, marginBottom: 6 }}><strong style={{ color: T.textSub }}>Me llevé: </strong>{log.que_se_llevo}</div>}
                    {log.proximos_pasos && <div style={{ fontSize: 12.5, color: T.text }}><strong style={{ color: T.textSub }}>Próximos pasos: </strong>{log.proximos_pasos}</div>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
