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

// Normaliza espacios (trim + colapsa espacios dobles) sin tocar mayúsculas —
// se usa para lo que se guarda, así "Gabriela " y "Gabriela" quedan iguales.
function normalizarNombre(nombre) {
  return (nombre || "").trim().replace(/\s+/g, " ");
}

// Clave de comparación (además ignora mayúsculas) — se usa SOLO para agrupar
// y filtrar, nunca para lo que se muestra en pantalla. Así "Gabriela" y
// "gabriela" se tratan como la misma persona sin cambiar cómo se escribió.
function claveComparacion(nombre) {
  return normalizarNombre(nombre).toLowerCase();
}

// Agrupa las sesiones en "mentees" usando el EMAIL como identidad real
// cuando existe (es el único dato que garantiza que sean la misma persona),
// y el nombre normalizado solo como respaldo cuando no hay email cargado.
//
// Caso ambiguo: si el mismo nombre aparece con más de un email distinto,
// asumimos que son personas distintas que casualmente comparten nombre —
// no las mezclamos a ciegas, las separamos por email.
function construirGruposDeMentees(logs) {
  var porNombre = {};
  logs.forEach(function (l) {
    var claveNombre = claveComparacion(l.mentee_name);
    if (!porNombre[claveNombre]) {
      porNombre[claveNombre] = { nombreCanonico: normalizarNombre(l.mentee_name), emails: {}, logs: [] };
    }
    porNombre[claveNombre].logs.push(l);
    var emailNorm = (l.mentee_email || "").trim().toLowerCase();
    if (emailNorm) porNombre[claveNombre].emails[emailNorm] = true;
  });

  var grupos = {};
  Object.keys(porNombre).forEach(function (claveNombre) {
    var info = porNombre[claveNombre];
    var emailsDistintos = Object.keys(info.emails);

    if (emailsDistintos.length <= 1) {
      // Sin ambigüedad: un solo email (o ninguno) para este nombre.
      // Usamos el email como clave si existe, el nombre si no.
      var key = emailsDistintos[0] || claveNombre;
      if (!grupos[key]) grupos[key] = { displayName: info.nombreCanonico, logs: [] };
      grupos[key].logs = grupos[key].logs.concat(info.logs);
    } else {
      // Ambiguo: mismo nombre, más de un email → probablemente son
      // personas distintas. Separamos por email; lo que no tiene email
      // queda en un grupo aparte, sin adivinar a quién pertenece.
      info.logs.forEach(function (l) {
        var emailNorm = (l.mentee_email || "").trim().toLowerCase();
        var key = emailNorm || (claveNombre + "::sin_email");
        if (!grupos[key]) {
          grupos[key] = { displayName: info.nombreCanonico + (emailNorm ? "" : " (sin email — revisar)"), logs: [] };
        }
        grupos[key].logs.push(l);
      });
    }
  });

  // Orden descendente por fecha dentro de cada grupo
  Object.keys(grupos).forEach(function (key) {
    grupos[key].logs.sort(function (a, b) { return new Date(b.fecha) - new Date(a.fecha); });
  });

  return grupos;
}

var PREP_SYSTEM_PROMPT =
  "Sos un asistente que ayuda a un mentor a prepararse para su próxima sesión con un mentee específico, dentro de Mentorcito.\n\n" +
  "Te paso el historial completo de sesiones anteriores con este mentee (fecha, temas vistos, qué se llevó, próximos pasos). Tu trabajo es generar un resumen breve y accionable para que el mentor llegue a la sesión con contexto fresco, sin tener que releer todo.\n\n" +
  "Estructura de tu respuesta (texto plano, sin JSON, sin markdown pesado):\n" +
  "- Un párrafo corto de qué se viene trabajando en general con este mentee.\n" +
  "- Qué quedó pendiente o a mitad de camino de la última sesión.\n" +
  "- 1-2 sugerencias concretas de por dónde podría arrancar esta sesión.\n\n" +
  "Sé breve — esto se lee en 30 segundos antes de entrar a la sesión, no es un informe.";

export default function MentorshipManagement() {
  var [initializing, setInitializing] = useState(true);
  var [email, setEmail] = useState(null);
  var [emailInput, setEmailInput] = useState("");
  var [hasAccess, setHasAccess] = useState(false);
  var [mentorNombre, setMentorNombre] = useState("");
  var [necesitaNombre, setNecesitaNombre] = useState(false);
  var [nombreInput, setNombreInput] = useState("");
  var [sessionLogs, setSessionLogs] = useState([]);
  var [selectedMentee, setSelectedMentee] = useState(null);
  var [showNewForm, setShowNewForm] = useState(false);
  var [formMenteeName, setFormMenteeName] = useState("");
  var [formMenteeEmail, setFormMenteeEmail] = useState("");
  var [formTotalSesiones, setFormTotalSesiones] = useState("");
  var [formFecha, setFormFecha] = useState(new Date().toISOString().slice(0, 10));
  var [formTemasVistos, setFormTemasVistos] = useState("");
  var [formQueSeLlevo, setFormQueSeLlevo] = useState("");
  var [formProximosPasos, setFormProximosPasos] = useState("");
  var [saving, setSaving] = useState(false);
  var [prepResults, setPrepResults] = useState({}); // { [menteeName]: texto }
  var [prepLoading, setPrepLoading] = useState(null); // nombre del mentee que está cargando

  useEffect(function () {
    var stored = localStorage.getItem("mentorship_email");
    if (stored) {
      setEmail(stored);
      checkAccessAndLoad(stored);
    } else {
      setInitializing(false);
    }
  }, []);

  async function checkAccessAndLoad(mail) {
    try {
      var res = await fetch("/api/sheets?action=get_module_progress&email=" + encodeURIComponent(mail));
      var data = await res.json();
      var access = !!(data && data.found && (data.module4_output || data.acceso_gestion === "si"));
      setHasAccess(access);
      if (access) {
        if (data.nombre) {
          setMentorNombre(data.nombre);
        } else {
          setNecesitaNombre(true);
        }
        await loadSessionLogs(mail);
      }
    } catch (e) {
      console.error("Error chequeando acceso:", e);
    } finally {
      setInitializing(false);
    }
  }

  async function loadSessionLogs(mail) {
    try {
      var res = await fetch("/api/sheets?action=get_session_logs&mentor_email=" + encodeURIComponent(mail));
      var data = await res.json();
      var logs = data.logs || [];
      setSessionLogs(logs);
      return logs;
    } catch (e) {
      console.error("Error cargando sesiones:", e);
      return [];
    }
  }

  function handleStartEmail() {
    var trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || trimmed.indexOf("@") === -1) return;
    localStorage.setItem("mentorship_email", trimmed);
    setEmail(trimmed);
    setInitializing(true);
    checkAccessAndLoad(trimmed);
  }

  async function handleGuardarNombre() {
    var trimmed = nombreInput.trim();
    if (!trimmed) return;
    setMentorNombre(trimmed);
    setNecesitaNombre(false);
    try {
      await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "save_module_progress", email: email, nombre: trimmed }),
      });
    } catch (e) {
      console.error("Error guardando nombre:", e);
    }
  }

  function abrirNuevaSesionParaMentee(grupo) {
    var logConEmail = grupo.logs.find(function (l) { return l.mentee_email; });
    var logConTotal = grupo.logs.find(function (l) { return l.total_sesiones_programa; });
    setFormMenteeName(grupo.displayName.replace(" (sin email — revisar)", ""));
    setFormMenteeEmail(logConEmail ? logConEmail.mentee_email : "");
    setFormTotalSesiones(logConTotal ? String(logConTotal.total_sesiones_programa) : "");
    setShowNewForm(true);
  }

  async function handleSaveSession() {
    if (!formMenteeName.trim() || !formTemasVistos.trim()) return;
    setSaving(true);
    // Nombre canónico ya usado para ese nombre (por tipeo), si existe.
    var claveNombre = claveComparacion(formMenteeName);
    var nombreExistente = sessionLogs.find(function (l) { return claveComparacion(l.mentee_name) === claveNombre; });
    var nombreFinal = nombreExistente ? normalizarNombre(nombreExistente.mentee_name) : normalizarNombre(formMenteeName);
    var emailFinal = formMenteeEmail.trim().toLowerCase();

    try {
      await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "save_session_log",
          mentor_email: email,
          mentee_name: nombreFinal,
          mentee_email: emailFinal,
          mentor_nombre: mentorNombre,
          total_sesiones_programa: formTotalSesiones ? Number(formTotalSesiones) : "",
          fecha: formFecha,
          temas_vistos: formTemasVistos.trim(),
          que_se_llevo: formQueSeLlevo.trim(),
          proximos_pasos: formProximosPasos.trim(),
        }),
      });
      var logsActualizados = await loadSessionLogs(email);
      // Buscamos la clave REAL que le va a tocar a este mentee según el
      // agrupador (puede ser un email ya conocido de antes, aunque esta
      // sesión puntual se haya cargado sin email).
      var gruposActualizados = construirGruposDeMentees(logsActualizados);
      var claveFinal = emailFinal || claveNombre;
      Object.keys(gruposActualizados).forEach(function (k) {
        var perteneceAEsteNombre = gruposActualizados[k].logs.some(function (l) { return claveComparacion(l.mentee_name) === claveNombre; });
        if (perteneceAEsteNombre && (!emailFinal || k === emailFinal)) claveFinal = k;
      });
      setSelectedMentee(claveFinal);
      setShowNewForm(false);
      setFormMenteeName("");
      setFormMenteeEmail("");
      setFormTotalSesiones("");
      setFormTemasVistos("");
      setFormQueSeLlevo("");
      setFormProximosPasos("");
      setFormFecha(new Date().toISOString().slice(0, 10));
    } catch (e) {
      console.error("Error guardando sesión:", e);
    } finally {
      setSaving(false);
    }
  }

  async function handlePrepararSesion(menteeKey, menteeDisplayName) {
    setPrepLoading(menteeKey);
    try {
      var grupos = construirGruposDeMentees(sessionLogs);
      var logsDeEsteMentee = (grupos[menteeKey] || { logs: [] }).logs;
      var historial = logsDeEsteMentee.map(function (l) {
        return "Fecha: " + l.fecha + "\nTemas vistos: " + l.temas_vistos + "\nQué se llevó: " + l.que_se_llevo + (l.proximos_pasos ? "\nPróximos pasos: " + l.proximos_pasos : "");
      }).join("\n---\n");

      var res = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 500,
          stream: false,
          system: PREP_SYSTEM_PROMPT,
          messages: [{ role: "user", content: "Historial de sesiones con este mentee:\n\n" + historial }],
        }),
      });
      var data = await res.json();
      var textBlock = (data.content || []).find(function (b) { return b.type === "text"; });
      setPrepResults(function (prev) {
        var updated = Object.assign({}, prev);
        updated[menteeKey] = textBlock ? textBlock.text : "No se pudo generar el resumen.";
        return updated;
      });
    } catch (e) {
      console.error("Error preparando sesión:", e);
    } finally {
      setPrepLoading(null);
    }
  }

  // ── Render: cargando ──
  if (initializing) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSub, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Cargando...
      </div>
    );
  }

  // ── Render: captura de email ──
  if (!email) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ maxWidth: 380, width: "100%", background: T.card, border: "1px solid " + T.border, borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>🗂️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.textWhite, marginBottom: 6 }}>Gestioná tu Mentoría</div>
          <div style={{ fontSize: 13, color: T.textSub, marginBottom: 18, lineHeight: 1.5 }}>
            Centralizá el seguimiento de tus sesiones — qué vieron, qué se llevó cada mentee, y preparate para la próxima con un resumen automático.
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
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // ── Render: falta el nombre (una sola vez, después de confirmar acceso) ──
  if (necesitaNombre) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ maxWidth: 380, width: "100%", background: T.card, border: "1px solid " + T.border, borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>👋</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.textWhite, marginBottom: 6 }}>¿Cómo te llamás?</div>
          <div style={{ fontSize: 13, color: T.textSub, marginBottom: 18, lineHeight: 1.5 }}>
            Así tus mentees te ven por tu nombre (no tu email) cuando revisan su progreso en /miprogreso. Se pregunta una sola vez.
          </div>
          <input
            type="text"
            value={nombreInput}
            onChange={function (e) { setNombreInput(e.target.value); }}
            onKeyDown={function (e) { if (e.key === "Enter") handleGuardarNombre(); }}
            placeholder="Tu nombre"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid " + T.border, color: T.text, fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
          />
          <button
            onClick={handleGuardarNombre}
            disabled={!nombreInput.trim()}
            style={{ width: "100%", padding: "11px", borderRadius: 10, border: "none", background: nombreInput.trim() ? "linear-gradient(135deg, #4361ee, #7b2ff7)" : "rgba(255,255,255,0.07)", color: nombreInput.trim() ? "white" : T.textDisabled, fontWeight: 600, fontSize: 14, cursor: nombreInput.trim() ? "pointer" : "not-allowed" }}
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }


  if (!hasAccess) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 19, fontWeight: 700, color: T.textWhite, marginBottom: 8 }}>Necesitás acceso para esta sección</div>
          <div style={{ fontSize: 13, color: T.textSub, marginBottom: 22, lineHeight: 1.6 }}>
            Esta herramienta es para mentores que completaron "Creá tu Mentoría", o que ya forman parte de la red de Mentorcito. Escribile a Gustavo para que te habilite el acceso.
          </div>
          <a
            href={"https://wa.me/5491170043893?text=" + encodeURIComponent("Hola Gustavo! Quiero acceso a Gestioná tu Mentoría (" + email + ")")}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "inline-block", padding: "12px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #4361ee, #7b2ff7)", color: "white", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
          >
            Escribir a Gustavo
          </a>
        </div>
      </div>
    );
  }

  var grupos = construirGruposDeMentees(sessionLogs);
  var menteeKeys = Object.keys(grupos).sort(function (a, b) { return grupos[a].displayName.localeCompare(grupos[b].displayName); });
  var grupoSeleccionado = selectedMentee ? grupos[selectedMentee] : null;
  var logsDelSeleccionado = grupoSeleccionado ? grupoSeleccionado.logs : [];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>
        {"@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; }"}
      </style>

      <div style={{ padding: "16px 20px", borderBottom: "1px solid " + T.border, background: T.header, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.textWhite }}>
          {selectedMentee ? "← " : ""}
          <span style={{ cursor: selectedMentee ? "pointer" : "default" }} onClick={function () { setSelectedMentee(null); }}>
            {grupoSeleccionado ? grupoSeleccionado.displayName : "Tus mentees"}
          </span>
        </div>
        {!showNewForm && (
          <button
            onClick={function () {
              if (grupoSeleccionado) {
                abrirNuevaSesionParaMentee(grupoSeleccionado);
              } else {
                setFormMenteeName(""); setFormMenteeEmail(""); setFormTotalSesiones("");
                setShowNewForm(true);
              }
            }}
            style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #4361ee, #7b2ff7)", color: "white", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}
          >
            + Nueva sesión
          </button>
        )}
      </div>

      <div style={{ padding: 20, maxWidth: 640, margin: "0 auto" }}>

        {/* Lista de mentees */}
        {!selectedMentee && !showNewForm && (
          <div>
            {menteeKeys.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: T.textMuted, fontSize: 13 }}>
                Todavía no cargaste ninguna sesión. Empezá con "+ Nueva sesión" arriba.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {menteeKeys.map(function (key) {
                  var grupo = grupos[key];
                  var logsDeM = grupo.logs;
                  var totalProgramaM = (logsDeM.find(function (l) { return l.total_sesiones_programa; }) || {}).total_sesiones_programa;
                  var completo = totalProgramaM && logsDeM.length >= totalProgramaM;
                  return (
                    <div
                      key={key}
                      onClick={function () { setSelectedMentee(key); }}
                      style={{ background: T.card, border: "1px solid " + (completo ? "rgba(123,222,150,0.3)" : T.border), borderRadius: 12, padding: "14px 16px", cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: T.textWhite }}>{grupo.displayName}</div>
                          <div style={{ fontSize: 12, color: completo ? "#7bde96" : T.textMuted, marginTop: 2 }}>
                            {completo
                              ? "🎉 Programa completo (" + totalProgramaM + "/" + totalProgramaM + ")"
                              : totalProgramaM
                                ? "Sesión " + logsDeM.length + " de " + totalProgramaM
                                : logsDeM.length + " sesión" + (logsDeM.length !== 1 ? "es" : "") + " registrada" + (logsDeM.length !== 1 ? "s" : "")}
                          </div>
                        </div>
                        <span style={{ color: T.textMuted }}>→</span>
                      </div>
                      {totalProgramaM && (
                        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden", marginTop: 10 }}>
                          <div style={{ height: "100%", width: Math.min(100, (logsDeM.length / totalProgramaM) * 100) + "%", background: completo ? "#7bde96" : "linear-gradient(90deg, #4361ee, #7b2ff7)", borderRadius: 2 }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Formulario nueva sesión */}
        {showNewForm && (
          <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Mentee</div>
            <input
              list="mentee-options"
              value={formMenteeName}
              onChange={function (e) {
                var val = e.target.value;
                setFormMenteeName(val);
                // Si el nombre coincide con uno ya existente, prellenamos
                // el total de sesiones y (si no es ambiguo) el email.
                var logsDeEseNombre = sessionLogs.filter(function (l) { return claveComparacion(l.mentee_name) === claveComparacion(val); });
                if (logsDeEseNombre.length > 0) {
                  var conTotal = logsDeEseNombre.find(function (l) { return l.total_sesiones_programa; });
                  if (conTotal) setFormTotalSesiones(String(conTotal.total_sesiones_programa));

                  var emailsDeEseNombre = Array.from(new Set(logsDeEseNombre.map(function (l) { return (l.mentee_email || "").trim().toLowerCase(); }).filter(Boolean)));
                  if (emailsDeEseNombre.length === 1 && !formMenteeEmail) {
                    setFormMenteeEmail(emailsDeEseNombre[0]);
                  }
                }
              }}
              placeholder="Nombre del mentee (nuevo o existente)"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid " + T.border, color: T.text, fontSize: 13, marginBottom: 14, boxSizing: "border-box" }}
            />
            <datalist id="mentee-options">
              {Array.from(new Set(menteeKeys.map(function (k) { return grupos[k].displayName; }))).map(function (n) { return <option key={n} value={n} />; })}
            </datalist>

            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Email del mentee (opcional)</div>
            <input
              type="email"
              value={formMenteeEmail}
              onChange={function (e) { setFormMenteeEmail(e.target.value); }}
              placeholder="Para que pueda ver su propio progreso en /miprogreso"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid " + T.border, color: T.text, fontSize: 13, marginBottom: 14, boxSizing: "border-box" }}
            />

            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Total de sesiones de este programa (opcional)</div>
            <input
              type="number"
              min="1"
              value={formTotalSesiones}
              onChange={function (e) { setFormTotalSesiones(e.target.value); }}
              placeholder="Ej: 4 — se recuerda para las próximas sesiones con este mentee"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid " + T.border, color: T.text, fontSize: 13, marginBottom: 14, boxSizing: "border-box" }}
            />

            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Fecha</div>
            <input
              type="date"
              value={formFecha}
              onChange={function (e) { setFormFecha(e.target.value); }}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid " + T.border, color: T.text, fontSize: 13, marginBottom: 14, boxSizing: "border-box" }}
            />

            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Temas vistos</div>
            <textarea
              value={formTemasVistos}
              onChange={function (e) { setFormTemasVistos(e.target.value); }}
              rows={3}
              placeholder="¿Qué trabajaron en esta sesión?"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid " + T.border, color: T.text, fontSize: 13, marginBottom: 14, boxSizing: "border-box", resize: "vertical" }}
            />

            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Qué se llevó el mentee</div>
            <textarea
              value={formQueSeLlevo}
              onChange={function (e) { setFormQueSeLlevo(e.target.value); }}
              rows={2}
              placeholder="Principal takeaway o tarea"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid " + T.border, color: T.text, fontSize: 13, marginBottom: 14, boxSizing: "border-box", resize: "vertical" }}
            />

            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Próximos pasos (opcional)</div>
            <textarea
              value={formProximosPasos}
              onChange={function (e) { setFormProximosPasos(e.target.value); }}
              rows={2}
              placeholder="Qué queda pendiente para la próxima"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid " + T.border, color: T.text, fontSize: 13, marginBottom: 18, boxSizing: "border-box", resize: "vertical" }}
            />

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleSaveSession}
                disabled={saving || !formMenteeName.trim() || !formTemasVistos.trim()}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: (!saving && formMenteeName.trim() && formTemasVistos.trim()) ? "linear-gradient(135deg, #4361ee, #7b2ff7)" : "rgba(255,255,255,0.07)", color: (!saving && formMenteeName.trim() && formTemasVistos.trim()) ? "white" : T.textDisabled, fontWeight: 600, fontSize: 14, cursor: "pointer" }}
              >
                {saving ? "Guardando..." : "Guardar sesión"}
              </button>
              <button
                onClick={function () { setShowNewForm(false); }}
                style={{ padding: "11px 16px", borderRadius: 10, border: "1px solid " + T.border, background: "transparent", color: T.textSub, fontSize: 14, cursor: "pointer" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Historial de un mentee */}
        {selectedMentee && grupoSeleccionado && !showNewForm && (
          <div>
            {(function () {
              var totalPrograma = (logsDelSeleccionado.find(function (l) { return l.total_sesiones_programa; }) || {}).total_sesiones_programa;
              if (!totalPrograma) return null;
              var completo = logsDelSeleccionado.length >= totalPrograma;
              return (
                <div style={{ marginBottom: 16 }}>
                  {completo && (
                    <div style={{ background: "rgba(123,222,150,0.08)", border: "1px solid rgba(123,222,150,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 10, fontSize: 13, color: "#7bde96", fontWeight: 600 }}>
                      🎉 Completó las {totalPrograma} sesiones de su programa
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textSub, marginBottom: 6 }}>
                    <span>Progreso del programa</span>
                    <span>Sesión {logsDelSeleccionado.length} de {totalPrograma}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: Math.min(100, (logsDelSeleccionado.length / totalPrograma) * 100) + "%", background: completo ? "#7bde96" : "linear-gradient(90deg, #4361ee, #7b2ff7)", borderRadius: 3 }} />
                  </div>
                </div>
              );
            })()}
            <button
              onClick={function () { handlePrepararSesion(selectedMentee, grupoSeleccionado.displayName); }}
              disabled={prepLoading === selectedMentee}
              style={{ width: "100%", padding: "12px", borderRadius: 10, border: "1px solid rgba(123,47,247,0.4)", background: "rgba(123,47,247,0.1)", color: "#c9b8ff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 16 }}
            >
              {prepLoading === selectedMentee ? "Preparando..." : "✨ Preparar próxima sesión"}
            </button>

            {prepResults[selectedMentee] && (
              <div style={{ background: "rgba(123,47,247,0.06)", border: "1px solid rgba(123,47,247,0.2)", borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 13, color: T.text, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {prepResults[selectedMentee]}
              </div>
            )}

            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Historial de sesiones</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {logsDelSeleccionado.map(function (log) {
                return (
                  <div key={log.log_id} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, fontWeight: 600 }}>{log.fecha}</div>
                    <div style={{ fontSize: 12.5, color: T.text, marginBottom: 6 }}><strong style={{ color: T.textSub }}>Temas: </strong>{log.temas_vistos}</div>
                    {log.que_se_llevo && <div style={{ fontSize: 12.5, color: T.text, marginBottom: 6 }}><strong style={{ color: T.textSub }}>Se llevó: </strong>{log.que_se_llevo}</div>}
                    {log.proximos_pasos && <div style={{ fontSize: 12.5, color: T.text }}><strong style={{ color: T.textSub }}>Próximos pasos: </strong>{log.proximos_pasos}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
