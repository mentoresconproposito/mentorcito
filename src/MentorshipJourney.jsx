import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// THEME (mismo criterio de colores que MentorAgent.jsx)
// ─────────────────────────────────────────────
var T = {
  bg:           "#0d0d1a",
  header:       "rgba(13,13,26,0.97)",
  card:         "rgba(255,255,255,0.04)",
  border:       "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.15)",
  chat:         "#0d0d1a",
  inputBg:      "rgba(255,255,255,0.04)",
  text:         "rgba(255,255,255,0.88)",
  textSub:      "rgba(255,255,255,0.55)",
  textMuted:    "rgba(255,255,255,0.45)",
  textDisabled: "rgba(255,255,255,0.25)",
  textWhite:    "white",
  msgUser:      "rgba(67,97,238,0.14)",
  msgUserBorder:"rgba(67,97,238,0.35)",
  msgBot:       "rgba(255,255,255,0.05)",
  msgBotBorder: "rgba(255,255,255,0.08)",
};

var WEEK_TITLES = {
  1: "Del \"yo sé\" al \"ellos necesitan\"",
  2: "Validación de mercado",
  3: "El MVP de la mentoría",
  4: "GTM & Lanzamiento",
};

var WEEK_INTRO = {
  1: "¡Hola! Vamos a arrancar la Semana 1. Mi objetivo acá es ayudarte a pasar de \"esto es lo que yo sé hacer\" a \"esto es lo que un público específico necesita\". Para arrancar: contame, ¿en qué te consideras experto/a hoy?",
  2: "Semana 2: ahora que tenés un problema y un público identificados, vamos a validarlo con evidencia real. Antes de arrancar, ¿ya hablaste con alguien de tu público objetivo sobre este problema?",
  3: "Semana 3: con el problema ya validado, vamos a definir la primera versión de tu mentoría como producto. Para arrancar, contame: si tuvieras que enseñar esto en 3 o 4 pilares de contenido, ¿cuáles serían?",
  4: "Semana 4, la última: vamos a armar cómo lanzás esto. Empecemos por lo más simple: si tuvieras que resumir tu propuesta en una frase (\"ayudo a X a lograr Y a través de Z\"), ¿cómo la dirías hoy?",
};

// ─────────────────────────────────────────────
// SYSTEM PROMPTS DE LOS 4 MÓDULOS
// (adaptados al patrón de tag embebido <MODULE_COMPLETE>,
// igual que <DIAGNOSIS> en MentorAgent.jsx)
// ─────────────────────────────────────────────

var MODULE1_PROMPT =
  "Sos el asistente de acompañamiento del programa \"Creá tu Mentoría\" de Gustavo Loustalet, en Mentorcito. Estás en la Semana 1: Del \"yo sé\" al \"ellos necesitan\".\n\n" +
  "Tu objetivo es ayudar al usuario a pasar de listar su propia expertise a identificar un problema real y específico de un público concreto. Muchos profesionales seniors confunden \"lo que yo sé hacer\" con \"lo que el mercado necesita\" — tu trabajo es ayudarlos a separar ambas cosas.\n\n" +
  "Reglas de conversación:\n" +
  "- Hacé una pregunta a la vez. Nunca listes varias preguntas juntas.\n" +
  "- Cuando el usuario describa una solución (\"yo ayudo a la gente a hacer X\") en vez de un problema, repreguntá: \"¿y qué le pasa a esa persona si no resuelve X? ¿qué está intentando y no logra?\"\n" +
  "- Si la respuesta es genérica (\"ayudo a profesionales a crecer\"), pedí un ejemplo concreto de una persona real con ese problema.\n" +
  "- No valides ni des palmadas en la espalda prematuras. Cuestioná con respeto cuando algo suene a suposición sin evidencia.\n\n" +
  "Cuando tengas suficiente claridad (problema específico, público específico, y una noción de por qué el usuario cree que es real), cerrá tu respuesta con un bloque, después de tu mensaje conversacional normal al usuario:\n" +
  "<MODULE_COMPLETE>\n" +
  "{\n" +
  '  "problema_identificado": "...",\n' +
  '  "publico_objetivo": "...",\n' +
  '  "evidencia_o_intuicion": "..."\n' +
  "}\n" +
  "</MODULE_COMPLETE>\n" +
  "Si todavía falta profundidad en alguno de estos campos, NO incluyas el bloque, seguí preguntando.";

var MODULE2_PROMPT_TEMPLATE =
  "Sos el asistente de acompañamiento del programa \"Creá tu Mentoría\" de Gustavo Loustalet, en Mentorcito. Estás en la Semana 2: Validación de Mercado.\n\n" +
  "Contexto del módulo anterior (Semana 1): __MODULE1_OUTPUT__\n\n" +
  "Contexto adicional (cruce con base de diagnósticos de Mentorcito): __GAP_MATCH_DATA__\n" +
  "Este objeto contiene el resultado de cruzar el problema_identificado y publico_objetivo de la Semana 1 contra los diagnósticos históricos de Mentorcito.\n\n" +
  "El usuario ya identificó un problema y un público objetivo hipotético. Tu trabajo ahora es ayudarlo a validar eso con evidencia real, combinando dos fuentes: (a) evidencia cuantitativa de la base de diagnósticos de Mentorcito, y (b) validación cualitativa con conversaciones reales, que sigue siendo indispensable.\n\n" +
  "Cómo usar el gap_match_data:\n" +
  "- Presentalo como un dato más, no como un veredicto. \"Esto ya te da una señal, pero no reemplaza hablar con gente\" es necesario, no opcional.\n" +
  "- Si cantidad_matches es alto: destacalo como buena señal de demanda, pero preguntá igual si habló con alguien real.\n" +
  "- Si porcentaje_ya_con_mentor es alto: señalalo como dato de saturación a considerar, no como que el nicho esté \"cerrado\". Preguntá qué lo haría diferente.\n" +
  "- Si cantidad_matches es bajo o cero: aclará que esta base está acotada a quienes ya pasaron por Mentorcito (mayormente perfiles de Producto/Tech/Negocio) — un nicho fuera de ese universo simplemente no va a tener matches, sin que eso diga nada sobre su viabilidad real.\n" +
  "- Nunca presentes el cruce como aprobación o rechazo definitivo del nicho.\n\n" +
  "Reglas de conversación:\n" +
  "- Preguntá primero si ya habló con alguien de su público objetivo. Si no lo hizo, ayudalo a armar 3-5 preguntas de entrevista no sesgadas.\n" +
  "- Si ya entrevistó gente, indagá qué aprendió: ¿confirmó el problema? ¿apareció algo inesperado?\n" +
  "- Marcá con cuidado cuando el usuario esté racionalizando una no-respuesta como validación (\"todos me dicen que sí\" sin detalle es una alerta, no una confirmación).\n" +
  "- Ayudalo a distinguir entre \"les interesa la idea\" y \"pagarían por resolver esto\".\n" +
  "- Integrá el gap_match_data en el momento natural de la conversación, no como un bloque de datos al principio desconectado del diálogo.\n\n" +
  "Cuando tengas evidencia cualitativa real (conversaciones, aunque sean informales) y hayas contextualizado la evidencia cuantitativa, cerrá tu respuesta con:\n" +
  "<MODULE_COMPLETE>\n" +
  "{\n" +
  '  "metodo_validacion": "...",\n' +
  '  "hallazgos_clave": "...",\n' +
  '  "problema_confirmado_o_ajustado": "...",\n' +
  '  "evidencia_cuantitativa_resumen": "...",\n' +
  '  "nivel_saturacion_percibido": "bajo | medio | alto"\n' +
  "}\n" +
  "</MODULE_COMPLETE>\n" +
  "Si no hay evidencia real de conversaciones con el público, NO incluyas el bloque — el cruce cuantitativo solo no alcanza para cerrar el módulo.";

var MODULE3_PROMPT_TEMPLATE =
  "Sos el asistente de acompañamiento del programa \"Creá tu Mentoría\" de Gustavo Loustalet, en Mentorcito. Estás en la Semana 3: El \"MVP\" de la Mentoría.\n\n" +
  "Contexto de módulos anteriores:\nSemana 1: __MODULE1_OUTPUT__\nSemana 2: __MODULE2_OUTPUT__\n\n" +
  "El usuario ya validó un problema real. Tu trabajo es ayudarlo a definir la primera versión de su mentoría como producto: qué incluye, qué formato tiene, y qué NO incluye todavía.\n\n" +
  "Reglas de conversación:\n" +
  "- Ayudalo a definir 3-4 pilares de contenido concretos (no más).\n" +
  "- Preguntá sobre formato: individual, grupal, cantidad de sesiones, duración.\n" +
  "- Empujá contra el perfeccionismo: recordá que esto es un MVP. Si quiere incluir demasiado, preguntá \"¿esto es necesario para la primera cohorte, o podés agregarlo después?\"\n" +
  "- Chequeá coherencia con lo validado en la Semana 2: ¿el formato y contenido responden al problema real, o se desvió hacia lo que a él le gusta enseñar?\n\n" +
  "Cuando tengas claridad, cerrá tu respuesta con:\n" +
  "<MODULE_COMPLETE>\n" +
  "{\n" +
  '  "pilares_contenido": ["...", "...", "..."],\n' +
  '  "formato": "...",\n' +
  '  "duracion_sesiones": "...",\n' +
  '  "publico_ideal_refinado": "..."\n' +
  "}\n" +
  "</MODULE_COMPLETE>";

var MODULE4_PROMPT_TEMPLATE =
  "Sos el asistente de acompañamiento del programa \"Creá tu Mentoría\" de Gustavo Loustalet, en Mentorcito. Estás en la Semana 4: GTM & Lanzamiento.\n\n" +
  "Contexto de módulos anteriores:\nSemana 1: __MODULE1_OUTPUT__\nSemana 2: __MODULE2_OUTPUT__\nSemana 3: __MODULE3_OUTPUT__\n\n" +
  "El usuario ya tiene definido su MVP de mentoría. Tu trabajo es ayudarlo a armar cómo la va a lanzar: propuesta de valor comunicable, pricing inicial, y un plan simple de primeros mentees.\n\n" +
  "Reglas de conversación:\n" +
  "- Ayudalo a resumir su propuesta en una frase clara (\"Ayudo a [público] a lograr [resultado] a través de [método], sin [dolor común]\").\n" +
  "- En pricing, preguntá primero qué referencias de mercado conoce antes de sugerir un número vos. Si no tiene ninguna, podés dar rangos orientativos aclarando que es una estimación.\n" +
  "- Ayudalo a planear cómo consigue sus primeros 3-5 mentees (algo accionable esta semana).\n" +
  "- Si corresponde, ofrecé estructurar esto como un borrador de landing page.\n\n" +
  "Cuando tengas claridad, cerrá tu respuesta con:\n" +
  "<MODULE_COMPLETE>\n" +
  "{\n" +
  '  "propuesta_valor": "...",\n' +
  '  "pricing_sugerido": "...",\n' +
  '  "plan_primeros_mentees": "...",\n' +
  '  "landing_draft": { "titulo": "...", "subtitulo": "...", "bullets": ["...", "..."] }\n' +
  "}\n" +
  "</MODULE_COMPLETE>";

var GAP_CLASSIFIER_SYSTEM_PROMPT =
  "Sos un clasificador. Te paso un problema/nicho de mentoría propuesto y una base de diagnósticos históricos de Mentorcito (formato: [{gaps: string[], tiene_match: boolean, score_nudo: number}]).\n\n" +
  "Tu tarea es identificar cuáles de esos diagnósticos tienen un gap semánticamente similar al nicho propuesto (aunque estén escritos con palabras distintas), y devolver SOLO un JSON con esta forma exacta, sin texto adicional, sin backticks, sin markdown:\n\n" +
  "{\n" +
  '  "cantidad_matches": number,\n' +
  '  "porcentaje_sobre_total": number,\n' +
  '  "perfiles_predominantes": string[],\n' +
  '  "porcentaje_ya_con_mentor": number,\n' +
  '  "score_nudo_promedio": number,\n' +
  '  "ejemplos_relevantes": string[]\n' +
  "}\n\n" +
  "Reglas:\n" +
  "- porcentaje_ya_con_mentor: de los matches encontrados, qué % tiene tiene_match=true.\n" +
  "- score_nudo_promedio: promedio real del campo score_nudo de los matches encontrados (viene en la data, no lo estimes).\n" +
  "- ejemplos_relevantes: 2-3 gaps textuales reales que mejor matchean, para trazabilidad.\n" +
  "- Si cantidad_matches es 0 o muy bajo, no lo interpretes como que el nicho es malo, solo reportá el número.\n" +
  "- Devolvé SOLO el JSON, nada más.";

function getModuleSystemPrompt(week, ctx) {
  if (week === 1) return MODULE1_PROMPT;
  if (week === 2) {
    return MODULE2_PROMPT_TEMPLATE
      .replace("__MODULE1_OUTPUT__", JSON.stringify(ctx.moduleOutputs[1] || {}))
      .replace("__GAP_MATCH_DATA__", JSON.stringify(ctx.gapMatchData || {}));
  }
  if (week === 3) {
    return MODULE3_PROMPT_TEMPLATE
      .replace("__MODULE1_OUTPUT__", JSON.stringify(ctx.moduleOutputs[1] || {}))
      .replace("__MODULE2_OUTPUT__", JSON.stringify(ctx.moduleOutputs[2] || {}));
  }
  if (week === 4) {
    return MODULE4_PROMPT_TEMPLATE
      .replace("__MODULE1_OUTPUT__", JSON.stringify(ctx.moduleOutputs[1] || {}))
      .replace("__MODULE2_OUTPUT__", JSON.stringify(ctx.moduleOutputs[2] || {}))
      .replace("__MODULE3_OUTPUT__", JSON.stringify(ctx.moduleOutputs[3] || {}));
  }
  return "";
}

function extractModuleComplete(text) {
  var match = text.match(/<MODULE_COMPLETE>([\s\S]*?)<\/MODULE_COMPLETE>/);
  if (match) {
    try { return JSON.parse(match[1]); } catch (e) { return null; }
  }
  return null;
}

function cleanText(text) {
  var start = text.indexOf("<MODULE_COMPLETE>");
  if (start !== -1) {
    var before = text.slice(0, start).trim();
    var clean = text.replace(/<MODULE_COMPLETE>[\s\S]*?<\/MODULE_COMPLETE>/g, "").trim();
    if (text.indexOf("</MODULE_COMPLETE>") === -1) return before || "";
    return clean;
  }
  return text.trim();
}

function summarizeModule1ForClassifier(module1Output) {
  if (!module1Output) return "";
  var parts = [];
  if (module1Output.problema_identificado) parts.push("Problema: " + module1Output.problema_identificado);
  if (module1Output.publico_objetivo) parts.push("Público objetivo: " + module1Output.publico_objetivo);
  return parts.join(". ");
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function MentorshipJourney() {
  var [initializing, setInitializing] = useState(true);
  var [email, setEmail] = useState(null);
  var [emailInput, setEmailInput] = useState("");
  var [mentorshipKey, setMentorshipKey] = useState(null);
  var [semanaActual, setSemanaActual] = useState(1);
  var [viewingWeek, setViewingWeek] = useState(1); // qué semana se está viendo (puede ser distinta a la activa, si mira una ya completada)
  var [moduleOutputs, setModuleOutputs] = useState({ 1: null, 2: null, 3: null, 4: null });
  var [conversationHistories, setConversationHistories] = useState({ 1: [], 2: [], 3: [], 4: [] });
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var [gapMatchData, setGapMatchData] = useState(null);
  var [gapMatchLoading, setGapMatchLoading] = useState(false);
  var [justCompletedWeek, setJustCompletedWeek] = useState(null); // semana recién cerrada, muestra la pantalla de transición
  var bottomRef = useRef(null);

  useEffect(function () {
    var stored = localStorage.getItem("mentorship_email");
    if (stored) {
      setEmail(stored);
      loadProgress(stored);
    } else {
      setInitializing(false);
    }
  }, []);

  useEffect(function () {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [conversationHistories, viewingWeek, loading]);

  // Al entrar a la Semana 2 (activa), buscar el gap_match_data si todavía no está
  useEffect(function () {
    if (semanaActual === 2 && viewingWeek === 2 && moduleOutputs[1] && !gapMatchData && !gapMatchLoading) {
      fetchGapMatchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semanaActual, viewingWeek, moduleOutputs[1]]);

  async function loadProgress(mail) {
    try {
      var res = await fetch("/api/sheets?action=get_module_progress&email=" + encodeURIComponent(mail));
      var data = await res.json();
      if (data && data.found) {
        setMentorshipKey(data.mentorship_key);
        var semana = data.semana_actual || 1;
        setSemanaActual(semana);
        setViewingWeek(semana);
        setModuleOutputs({
          1: data.module1_output || null,
          2: data.module2_output || null,
          3: data.module3_output || null,
          4: data.module4_output || null,
        });
        // Si ya se había calculado el gap-match en una sesión anterior, lo
        // restauramos para no volver a llamar al clasificador de nuevo.
        if (data.gap_match_raw) setGapMatchData(data.gap_match_raw);
        // El historial guardado corresponde al módulo en el que se quedó
        var hist = data.conversation_history || [];
        setConversationHistories(function (prev) {
          var updated = Object.assign({}, prev);
          updated[semana] = hist.length ? hist : [{ role: "assistant", content: WEEK_INTRO[semana] }];
          return updated;
        });
      } else {
        // Primera vez con este email
        setSemanaActual(1);
        setViewingWeek(1);
        setConversationHistories(function (prev) {
          var updated = Object.assign({}, prev);
          updated[1] = [{ role: "assistant", content: WEEK_INTRO[1] }];
          return updated;
        });
      }
    } catch (e) {
      console.error("Error cargando progreso:", e);
    } finally {
      setInitializing(false);
    }
  }

  function handleStartEmail() {
    var trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || trimmed.indexOf("@") === -1) return;
    localStorage.setItem("mentorship_email", trimmed);
    setEmail(trimmed);
    setInitializing(true);
    loadProgress(trimmed);
  }

  async function fetchGapMatchData() {
    setGapMatchLoading(true);
    try {
      var recordsRes = await fetch("/api/sheets?action=records");
      var recordsJson = await recordsRes.json();
      var records = recordsJson.records || [];
      var compact = records.map(function (r) {
        return {
          gaps: r.gaps || [],
          tiene_match: !!r.tiene_match,
          score_nudo: typeof r.score_nudo === "number" ? r.score_nudo : null,
        };
      });

      var nichoTexto = summarizeModule1ForClassifier(moduleOutputs[1]);

      var classifierRes = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          stream: false,
          system: GAP_CLASSIFIER_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: "Nicho propuesto: \"" + nichoTexto + "\"\n\nBase de diagnósticos:\n" + JSON.stringify(compact),
            },
          ],
        }),
      });
      var data = await classifierRes.json();
      var textBlock = (data.content || []).find(function (b) { return b.type === "text"; });
      if (!textBlock) throw new Error("Respuesta sin contenido de texto");
      var clean = textBlock.text.replace(/```json|```/g, "").trim();
      var parsed = JSON.parse(clean);
      setGapMatchData(parsed);

      // Persistimos el gap-match crudo: le sirve al mentor como evidencia
      // de demanda de mercado para ese mentee, sin depender de mirar la
      // pestaña Network en el momento en que se calculó.
      postToSheets({
        action: "save_module_progress",
        email: email,
        mentorship_key: mentorshipKey,
        gap_match_raw: parsed,
      });
    } catch (e) {
      console.error("Error en gap match:", e);
    } finally {
      setGapMatchLoading(false);
    }
  }

  async function postToSheets(payload) {
    try {
      await fetch("/api/sheets", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("Error guardando progreso:", e);
    }
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    if (semanaActual === 2 && !gapMatchData) return; // esperar a que termine el análisis de demanda

    var week = semanaActual;
    var userMsg = { role: "user", content: input.trim() };
    var currentHistory = conversationHistories[week] || [];
    var newHistory = currentHistory.concat([userMsg]);

    setConversationHistories(function (prev) {
      var updated = Object.assign({}, prev);
      updated[week] = newHistory.concat([{ role: "assistant", content: "" }]);
      return updated;
    });
    setInput("");
    setLoading(true);

    var apiMessages = newHistory.map(function (m) { return { role: m.role, content: m.content }; });
    if (apiMessages.length > 12) apiMessages = apiMessages.slice(-12);

    var systemPrompt = getModuleSystemPrompt(week, { moduleOutputs: moduleOutputs, gapMatchData: gapMatchData });

    try {
      var res = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4000,
          stream: true,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });

      if (!res.ok) throw new Error("HTTP " + res.status);

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var fullText = "";

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        var lines = decoder.decode(chunk.value).split("\n").filter(function (l) { return l.indexOf("data: ") === 0; });
        for (var li = 0; li < lines.length; li++) {
          var jsonStr = lines[li].slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            var evt = JSON.parse(jsonStr);
            var delta = evt && evt.delta && evt.delta.text ? evt.delta.text : "";
            if (delta) {
              fullText += delta;
              var visible = cleanText(fullText);
              setConversationHistories(function (prev) {
                var updated = Object.assign({}, prev);
                var hist = prev[week].slice();
                hist[hist.length - 1] = { role: "assistant", content: visible };
                updated[week] = hist;
                return updated;
              });
            }
          } catch (e) {}
        }
      }

      var moduleResult = extractModuleComplete(fullText);
      if (moduleResult) {
        var finalHistory = newHistory.concat([{ role: "assistant", content: cleanText(fullText) }]);
        var nextWeek = Math.min(week + 1, 4);
        var newKey = mentorshipKey || ("mentorship:" + Date.now());

        // Guardamos el resultado del módulo y el historial, pero NO avanzamos
        // de semana automáticamente — eso queda a cargo de la pantalla de
        // transición (el mentee hace click en "Continuar"), así evitamos
        // condiciones de carrera entre varios setState encadenados.
        setModuleOutputs(function (prev) {
          var updated = Object.assign({}, prev);
          updated[week] = moduleResult;
          return updated;
        });
        setConversationHistories(function (prev) {
          var updated = Object.assign({}, prev);
          updated[week] = finalHistory;
          return updated;
        });
        if (!mentorshipKey) setMentorshipKey(newKey);
        setJustCompletedWeek(week);

        // Guardamos con semana_actual = week (todavía NO avanzamos): el
        // avance real ocurre recién cuando el mentee confirma en la
        // pantalla de transición (advanceToNextWeek).
        postToSheets({
          action: "save_module_progress",
          email: email,
          mentorship_key: newKey,
          semana_actual: week,
          module_number: week,
          module_output: moduleResult,
          conversation_history: finalHistory,
        });
      }
    } catch (err) {
      setConversationHistories(function (prev) {
        var updated = Object.assign({}, prev);
        var hist = prev[week].slice();
        hist[hist.length - 1] = { role: "assistant", content: "Error: " + err.message + ". Intentá de nuevo." };
        updated[week] = hist;
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function advanceToNextWeek() {
    var completedWeek = justCompletedWeek;
    if (!completedWeek) return;
    var nextWeek = Math.min(completedWeek + 1, 4);
    var introMsg = { role: "assistant", content: WEEK_INTRO[nextWeek] };

    setSemanaActual(nextWeek);
    setViewingWeek(nextWeek);
    setJustCompletedWeek(null);
    setConversationHistories(function (prev) {
      var updated = Object.assign({}, prev);
      // Solo pisamos con el intro si esa semana todavía no tiene conversación propia
      // (por ej. si el mentee ya la había empezado en otra sesión)
      if (!prev[nextWeek] || prev[nextWeek].length === 0) {
        updated[nextWeek] = [introMsg];
      }
      return updated;
    });

    if (nextWeek !== completedWeek) {
      postToSheets({
        action: "save_module_progress",
        email: email,
        mentorship_key: mentorshipKey,
        semana_actual: nextWeek,
        module_number: completedWeek,
        module_output: moduleOutputs[completedWeek],
        conversation_history: [introMsg],
      });
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function formatMessage(text) {
    return (text || "").split("\n").map(function (line, i) {
      var html = line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:rgba(255,255,255,0.95)">$1</strong>');
      return <p key={i} style={{ margin: "3px 0", lineHeight: "1.6", color: "rgba(255,255,255,0.82)" }} dangerouslySetInnerHTML={{ __html: html }} />;
    });
  }

  // ── Render: cargando ──
  if (initializing) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSub, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Cargando tu progreso...
      </div>
    );
  }

  // ── Render: captura de email (primera vez / dispositivo nuevo) ──
  if (!email) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ maxWidth: 380, width: "100%", background: T.card, border: "1px solid " + T.border, borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}>💠</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: T.textWhite, marginBottom: 6 }}>Tu asistente de mentoría</div>
          <div style={{ fontSize: 13, color: T.textSub, marginBottom: 14, lineHeight: 1.5 }}>
            Este es tu espacio para trabajar, semana a semana, en crear tu propia mentoría — entre las sesiones en vivo con Gustavo.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 18 }}>
            {[
              "Semana 1 · Encontrar el problema real que resolvés",
              "Semana 2 · Validarlo con evidencia de mercado",
              "Semana 3 · Definir el MVP de tu mentoría",
              "Semana 4 · Armar tu lanzamiento",
            ].map(function (line, i) {
              return (
                <div key={i} style={{ fontSize: 11.5, color: T.textMuted, textAlign: "left", paddingLeft: 4 }}>
                  {line}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 12, color: T.textSub, marginBottom: 18, lineHeight: 1.5 }}>
            Ingresá tu email para arrancar o retomar donde quedaste.
          </div>
          <input
            type="email"
            value={emailInput}
            onChange={function (e) { setEmailInput(e.target.value); }}
            onKeyDown={function (e) { if (e.key === "Enter") handleStartEmail(); }}
            placeholder="tu@email.com"
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: T.inputBg, border: "1px solid " + T.border, color: T.text, fontSize: 14, marginBottom: 12, boxSizing: "border-box" }}
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

  var isActiveWeek = viewingWeek === semanaActual;
  var currentMessages = conversationHistories[viewingWeek] || [];
  var currentOutput = moduleOutputs[viewingWeek];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>
        {"@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');" +
          "* { box-sizing: border-box; } " +
          "@keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.2); } } " +
          "@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } " +
          ".msg-appear { animation: fadeUp 0.3s ease forwards; }"}
      </style>

      {/* Header con tabs de semanas */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid " + T.border, background: T.header, display: "flex", gap: 8, overflowX: "auto" }}>
        {[1, 2, 3, 4].map(function (w) {
          var locked = w > semanaActual;
          var completed = !!moduleOutputs[w];
          var active = w === viewingWeek;
          return (
            <button
              key={w}
              disabled={locked}
              onClick={function () { if (!locked) setViewingWeek(w); }}
              style={{
                flexShrink: 0,
                padding: "8px 14px",
                borderRadius: 10,
                border: "1px solid " + (active ? "rgba(67,97,238,0.5)" : T.border),
                background: active ? "rgba(67,97,238,0.15)" : "transparent",
                color: locked ? T.textDisabled : (active ? "#8fa5ff" : T.textSub),
                fontSize: 12,
                fontWeight: 600,
                cursor: locked ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {locked ? "🔒" : completed ? "✅" : "○"} Semana {w}
            </button>
          );
        })}
      </div>

      {/* Barra de progreso: minimiza la ansiedad de "no sé dónde estoy" */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid " + T.border, background: "rgba(255,255,255,0.02)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textWhite }}>{WEEK_TITLES[viewingWeek]}</div>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Semana {semanaActual} de 4</div>
        </div>
        <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: (((semanaActual - 1) + (moduleOutputs[semanaActual] ? 1 : 0)) / 4 * 100) + "%",
            background: "linear-gradient(90deg, #4361ee, #7b2ff7)",
            borderRadius: 3,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      {/* Pantalla de transición: se muestra al completar un módulo, hasta que el mentee confirma avanzar */}
      {justCompletedWeek && justCompletedWeek === viewingWeek ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 19, fontWeight: 700, color: T.textWhite, marginBottom: 8 }}>
              ¡Felicitaciones, completaste la Semana {justCompletedWeek}!
            </div>
            <div style={{ fontSize: 13, color: T.textSub, marginBottom: 24, lineHeight: 1.6 }}>
              {justCompletedWeek < 4
                ? "Ya tenés lo necesario de \"" + WEEK_TITLES[justCompletedWeek] + "\". La próxima semana vamos a trabajar en: " + WEEK_TITLES[Math.min(justCompletedWeek + 1, 4)] + "."
                : "Completaste las 4 semanas del programa. Tu propuesta de mentoría ya está armada de punta a punta."}
            </div>
            <button
              onClick={advanceToNextWeek}
              style={{ padding: "12px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #4361ee, #7b2ff7)", color: "white", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            >
              {justCompletedWeek < 4 ? "Continuar con la Semana " + (justCompletedWeek + 1) : "Ver mi propuesta completa"}
            </button>
          </div>
        </div>
      ) : !isActiveWeek && currentOutput ? (
        <div style={{ flex: 1, padding: 20, overflowY: "auto" }}>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            Resultado de esta semana
          </div>
          <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: 16 }}>
            {Object.keys(currentOutput).map(function (key) {
              var val = currentOutput[key];
              return (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{key}</div>
                  <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>
                    {Array.isArray(val) ? val.join(" · ") : typeof val === "object" ? JSON.stringify(val) : String(val)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          {/* Chat activo */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 12, background: T.chat }}>
            {gapMatchLoading && viewingWeek === 2 && (
              <div style={{ textAlign: "center", padding: 20, color: T.textMuted, fontSize: 13 }}>
                Analizando demanda contra la base de diagnósticos de Mentorcito...
              </div>
            )}
            {currentMessages.map(function (msg, i) {
              return (
                <div key={i} className="msg-appear" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "85%" }}>
                    <div style={{
                      padding: "13px 16px",
                      borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                      background: msg.role === "user" ? T.msgUser : T.msgBot,
                      border: "1px solid " + (msg.role === "user" ? T.msgUserBorder : T.msgBotBorder),
                      fontSize: 14,
                    }}>
                      {formatMessage(msg.content)}
                    </div>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div style={{ display: "flex", gap: 5, padding: "12px 16px" }}>
                {[0, 1, 2].map(function (i) {
                  return <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#4361ee", animation: "pulse 1.2s ease-in-out infinite", animationDelay: (i * 0.2) + "s" }} />;
                })}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px 16px", borderTop: "1px solid " + T.border, background: T.header }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: T.card, border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 14px" }}>
              <textarea
                value={input}
                onChange={function (e) { setInput(e.target.value); }}
                onKeyDown={handleKey}
                placeholder={gapMatchLoading ? "Esperando análisis de demanda..." : "Escribí tu respuesta..."}
                rows={2}
                disabled={gapMatchLoading}
                style={{ flex: 1, background: "transparent", border: "none", color: T.text, fontSize: 14, resize: "none" }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim() || gapMatchLoading}
                style={{
                  width: 36, height: 36, borderRadius: 10, border: "none",
                  background: (input.trim() && !loading && !gapMatchLoading) ? "linear-gradient(135deg, #4361ee, #7b2ff7)" : "rgba(255,255,255,0.07)",
                  cursor: (input.trim() && !loading && !gapMatchLoading) ? "pointer" : "not-allowed",
                  color: (input.trim() && !loading && !gapMatchLoading) ? "white" : T.textDisabled,
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
