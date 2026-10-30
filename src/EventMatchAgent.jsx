import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// MENTORCITO PARA EVENTOS
// Mismo motor que MentorAgent (chat + bloque JSON + scoring en JS),
// pero el match es entre asistentes de un mismo evento.
//
// URLs:
//   /eventos?evento=ID                 → chat del asistente
//   /eventos?evento=ID&organizador=1   → panel del organizador
// ─────────────────────────────────────────────

var MODEL = "claude-haiku-4-5-20251001";
var SHEETS_URL = "https://script.google.com/macros/s/AKfycby_UmXK49W239AN1ZbmDIpdMpcbGqqlHIuT7DwmWoWQ7AXt8b-_g6PGIeLeIlKWgNng9Q/exec";

var MAX_MATCHES = 3;      // matches 1 a 1 por persona
var MIN_MATCH_PCT = 30;
var WHATSAPP_ORGANIZADORES = "5491170043893"; // mismo número que MentorAgent   // por debajo de esto no se sugiere
var MESA_MIN = 3;
var MESA_MAX = 6;

// ─────────────────────────────────────────────
// CATÁLOGO DE SKILLS (mismo que MentorAgent)
// ─────────────────────────────────────────────
var SKILLS_CATALOG = {
  tech: [
    { id: "autonomia_tecnica",   label: "Autonomía técnica",      keywords: ["técnico","dev","ingeniería","arquitectura","estimaciones","viabilidad","stack","lenguaje técnico","credibilidad técnica","depender de tech","depender del equipo"] },
    { id: "datos_sql",           label: "Datos y SQL",             keywords: ["sql","datos","métricas","analytics","amplitude","mixpanel","posthog","insights","análisis","dashboard","data","medir","no mido"] },
    { id: "ia_producto",         label: "IA en producto",          keywords: ["ia","inteligencia artificial","llm","agentes","gpt","claude","prompts","rag","fine-tuning","ai product","ai pm"] },
    { id: "arquitectura",        label: "Arquitectura básica",     keywords: ["arquitectura","apis","sistemas","infraestructura","backend","integración","escalabilidad técnica"] },
    { id: "prototipado",         label: "Prototipado y autonomía", keywords: ["prototipo","vibecoding","no-code","figma","prototipar","mockup","construir sin dev"] },
  ],
  producto: [
    { id: "discovery",           label: "Discovery y validación",  keywords: ["discovery","validación","entrevistas","usuario","investigación","ux research","pmf","product-market fit","síntesis","feedback","insights de usuario"] },
    { id: "priorizacion",        label: "Priorización y roadmap",  keywords: ["priorización","roadmap","backlog","planning","sprints","feature","qué construir","qué priorizar","scope","trade-off"] },
    { id: "metricas_producto",   label: "Métricas de producto",    keywords: ["retención","activación","conversión","churn","engagement","dau","mau","funnel","cohortes","métricas de producto","kpi"] },
    { id: "estrategia_producto", label: "Estrategia de producto",  keywords: ["estrategia","visión","north star","big picture","portfolio de producto","criterio estratégico","decisiones en ambigüedad","pensamiento estratégico"] },
    { id: "comunicacion_pm",     label: "Comunicación de producto",keywords: ["narrativa","storytelling","presentar","defender","comunicar","stakeholders","spec","PRD","comunicación ejecutiva"] },
  ],
  negocio: [
    { id: "gtm",                 label: "GTM y primeros clientes", keywords: ["gtm","go-to-market","ventas","b2b","primeros clientes","adquisición","canales","propuesta de valor","icp","sales"] },
    { id: "criterio_estrategico",label: "Criterio estratégico",    keywords: ["criterio","decisiones","ambigüedad","business sense","estrategia de negocio","modelo de negocio","escalabilidad","crecimiento"] },
    { id: "influencia_liderazgo",label: "Influencia y liderazgo",  keywords: ["influencia","autoridad","manage up","liderazgo","stakeholders","alineamiento","sin autoridad formal","política","equipo"] },
    { id: "modelo_negocio",      label: "Modelo de negocio",       keywords: ["pricing","revenue","monetización","unit economics","margen","facturación","modelo de ingreso","runway","burn"] },
    { id: "marca_personal",      label: "Marca personal y carrera",keywords: ["marca personal","linkedin","portfolio","posicionamiento","entrevistas","job search","narrativa de carrera","visibilidad","transición"] },
  ],
};

var SKILL_BY_ID = {};
Object.keys(SKILLS_CATALOG).forEach(function(area) {
  SKILLS_CATALOG[area].forEach(function(s) { SKILL_BY_ID[s.id] = Object.assign({ area: area }, s); });
});

// Objetivos de la persona en el evento. "par" = el objetivo que lo complementa.
var OBJETIVOS = {
  aprender:          { label: "Aprender de alguien con más experiencia", par: "mentorear" },
  mentorear:         { label: "Compartir experiencia / mentorear",        par: "aprender" },
  contratar:         { label: "Contratar talento",                        par: "buscar_trabajo" },
  buscar_trabajo:    { label: "Buscar trabajo o proyecto",                par: "contratar" },
  buscar_inversion:  { label: "Buscar inversión",                         par: "invertir" },
  invertir:          { label: "Invertir en proyectos",                    par: "buscar_inversion" },
  buscar_clientes:   { label: "Conseguir clientes",                       par: "buscar_proveedor" },
  buscar_proveedor:  { label: "Encontrar proveedor o solución",           par: "buscar_clientes" },
  buscar_socio:      { label: "Encontrar socio/a o cofounder",            par: "buscar_socio" },
  networking:        { label: "Ampliar red / pares",                      par: "networking" },
};

var NIVELES = ["junior", "mid", "senior", "senior-ejecutivo"];

// ─────────────────────────────────────────────
// MATCHING (funciones puras, sin React)
// ─────────────────────────────────────────────

// Busca cada keyword como palabra o inicio de palabra, para que "ia" no matchee "estrategia"
function contieneKeyword(texto, kw) {
  var k = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  var re = new RegExp("(^|[^a-záéíóúñü0-9])" + k + (kw.length <= 3 ? "($|[^a-záéíóúñü0-9])" : ""));
  return re.test(texto);
}

function clasificarEnSkills(textos) {
  var t = (Array.isArray(textos) ? textos.join(" ") : textos || "").toLowerCase();
  var ids = [];
  Object.keys(SKILL_BY_ID).forEach(function(id) {
    var hit = SKILL_BY_ID[id].keywords.some(function(kw) { return contieneKeyword(t, kw); });
    if (hit) ids.push(id);
  });
  return ids;
}

function unique(arr) {
  return arr.filter(function(x, i) { return x && arr.indexOf(x) === i; });
}

// Normaliza un perfil: une las skills que tipificó el LLM con las que detecta el clasificador por keywords
function normalizarPerfil(p, idx) {
  var ofrece = p.ofrece || [];
  var busca = p.busca || [];
  return Object.assign({}, p, {
    id: p.id || ("p" + idx + "_" + (p.nombre || "anon").toLowerCase().replace(/\W+/g, "")),
    ofrece: ofrece,
    busca: busca,
    ofrece_skills: unique((p.ofrece_skills || []).filter(function(s) { return SKILL_BY_ID[s]; }).concat(clasificarEnSkills(ofrece))),
    busca_skills: unique((p.busca_skills || []).filter(function(s) { return SKILL_BY_ID[s]; }).concat(clasificarEnSkills(busca))),
    objetivos: (p.objetivos || []).filter(function(o) { return OBJETIVOS[o]; }),
    nivel: NIVELES.indexOf(p.nivel) !== -1 ? p.nivel : "mid",
    formato: p.formato || "ambos",
  });
}

var STOPWORDS = ["sobre","desde","hasta","entre","cómo","como","quiero","busco","necesito","tengo","puedo","ayudar","mejorar","aprender","personas","equipo","equipos","trabajo","temas","cosas","otros","otras","mucho","poder","hacer"];

function palabrasClave(textos) {
  var t = (textos || []).join(" ").toLowerCase().replace(/[^a-záéíóúñü0-9\s]/g, " ");
  return unique(t.split(/\s+/).filter(function(w) { return w.length > 4 && STOPWORDS.indexOf(w) === -1; }));
}

// Qué ofrece A que B busca (una dirección)
function cobertura(a, b) {
  var skills = a.ofrece_skills.filter(function(s) { return b.busca_skills.indexOf(s) !== -1; });
  var bWords = palabrasClave(b.busca);
  var palabras = palabrasClave(a.ofrece).filter(function(w) { return bWords.indexOf(w) !== -1; });
  return { skills: skills, palabras: palabras };
}

// Score 0-100 entre dos asistentes + las razones que lo explican
function scorePar(a, b) {
  var razones = [];
  var score = 0;

  // 1. Complementariedad de skills, en las dos direcciones (hasta 30 pts cada una)
  var ab = cobertura(a, b);
  var ba = cobertura(b, a);
  var ptsAB = Math.min(30, ab.skills.length * 20 + Math.min(10, ab.palabras.length * 4));
  var ptsBA = Math.min(30, ba.skills.length * 20 + Math.min(10, ba.palabras.length * 4));
  score += ptsAB + ptsBA;
  ab.skills.forEach(function(s) { razones.push({ tipo: "skill", de: a.id, para: b.id, skill: s }); });
  ba.skills.forEach(function(s) { razones.push({ tipo: "skill", de: b.id, para: a.id, skill: s }); });

  // 2. Reciprocidad: los dos se aportan algo (10 pts)
  if (ptsAB > 0 && ptsBA > 0) {
    score += 10;
    razones.push({ tipo: "reciproco" });
  }

  // 3. Objetivos complementarios (20 pts) o compartidos (8 pts)
  var objPts = 0;
  a.objetivos.forEach(function(o) {
    var par = OBJETIVOS[o].par;
    if (b.objetivos.indexOf(par) !== -1) {
      objPts = Math.max(objPts, par === o ? 12 : 20);
      razones.push({ tipo: "objetivo", quien: a.id, obj: o, otro: b.id, objOtro: par });
    }
  });
  if (objPts === 0) {
    var compartidos = a.objetivos.filter(function(o) { return b.objetivos.indexOf(o) !== -1; });
    if (compartidos.length) { objPts = 8; razones.push({ tipo: "objetivo_comun", obj: compartidos[0] }); }
  }
  score += objPts;

  // 4. Nivel: un escalón de diferencia es ideal para que uno aprenda del otro (10 pts)
  var dif = Math.abs(NIVELES.indexOf(a.nivel) - NIVELES.indexOf(b.nivel));
  score += dif === 1 ? 10 : dif === 0 ? 7 : dif === 2 ? 4 : 0;

  // 5. Penalizaciones: misma empresa, o ya se conocen
  var mismaEmpresa = a.empresa && b.empresa && a.empresa.trim().toLowerCase() === b.empresa.trim().toLowerCase();
  if (mismaEmpresa) { score = score * 0.3; razones.push({ tipo: "misma_empresa" }); }
  var seConocen = (a.conoce || []).indexOf(b.id) !== -1 || (b.conoce || []).indexOf(a.id) !== -1;
  if (seConocen) { score = score * 0.3; razones.push({ tipo: "se_conocen" }); }

  return { pct: Math.round(Math.min(100, score)), razones: razones };
}

function construirMatriz(perfiles) {
  var m = {};
  perfiles.forEach(function(a) { m[a.id] = {}; });
  for (var i = 0; i < perfiles.length; i++) {
    for (var j = i + 1; j < perfiles.length; j++) {
      var r = scorePar(perfiles[i], perfiles[j]);
      m[perfiles[i].id][perfiles[j].id] = r;
      m[perfiles[j].id][perfiles[i].id] = r;
    }
  }
  return m;
}

// Top N matches de cada persona
function matchesPorPersona(perfiles, matriz) {
  var out = {};
  perfiles.forEach(function(a) {
    if (a.formato === "grupo") { out[a.id] = []; return; }
    out[a.id] = perfiles
      .filter(function(b) { return b.id !== a.id && b.formato !== "grupo"; })
      .map(function(b) { return { id: b.id, pct: matriz[a.id][b.id].pct, razones: matriz[a.id][b.id].razones }; })
      .filter(function(x) { return x.pct >= MIN_MATCH_PCT; })
      .sort(function(x, y) { return y.pct - x.pct; })
      .slice(0, MAX_MATCHES);
  });
  return out;
}

// Ronda de pares: cada persona con una sola otra (greedy por mayor score)
function rondaDePares(perfiles, matriz) {
  var aristas = [];
  for (var i = 0; i < perfiles.length; i++) {
    for (var j = i + 1; j < perfiles.length; j++) {
      var a = perfiles[i], b = perfiles[j];
      if (a.formato === "grupo" || b.formato === "grupo") continue;
      var pct = matriz[a.id][b.id].pct;
      if (pct >= MIN_MATCH_PCT) aristas.push({ a: a.id, b: b.id, pct: pct });
    }
  }
  aristas.sort(function(x, y) { return y.pct - x.pct; });
  var usados = {};
  var pares = [];
  aristas.forEach(function(e) {
    if (usados[e.a] || usados[e.b]) return;
    usados[e.a] = usados[e.b] = true;
    pares.push(e);
  });
  return pares;
}

// Mesas temáticas: un tema (skill) con al menos una persona que lo ofrece (anfitrión) y varias que lo buscan
function armarMesas(perfiles, matriz) {
  var candidatos = perfiles.filter(function(p) { return p.formato !== "1a1"; });
  var asignado = {};
  var mesas = [];

  while (true) {
    var mejor = null;
    Object.keys(SKILL_BY_ID).forEach(function(sid) {
      var libres = candidatos.filter(function(p) { return !asignado[p.id]; });
      var anfitriones = libres.filter(function(p) { return p.ofrece_skills.indexOf(sid) !== -1; });
      var buscan = libres.filter(function(p) { return p.busca_skills.indexOf(sid) !== -1 && anfitriones.indexOf(p) === -1; });
      if (!anfitriones.length || buscan.length + 1 < MESA_MIN) return;
      var peso = buscan.length + Math.min(anfitriones.length, 2) * 0.5;
      if (!mejor || peso > mejor.peso) mejor = { skill: sid, anfitriones: anfitriones, buscan: buscan, peso: peso };
    });
    if (!mejor) break;

    var anfitrion = mejor.anfitriones.slice().sort(function(x, y) {
      return NIVELES.indexOf(y.nivel) - NIVELES.indexOf(x.nivel);
    })[0];
    var integrantes = mejor.buscan.slice(0, MESA_MAX - 1);
    var ids = [anfitrion.id].concat(integrantes.map(function(p) { return p.id; }));
    ids.forEach(function(id) { asignado[id] = true; });
    mesas.push({ tema: mejor.skill, anfitrion: anfitrion.id, integrantes: ids });
  }

  // Los que quedaron libres van a la mesa donde más afinidad promedio tienen, si hay lugar
  var sinMesa = [];
  candidatos.filter(function(p) { return !asignado[p.id]; }).forEach(function(p) {
    var mejorMesa = null, mejorProm = 0;
    mesas.forEach(function(m) {
      if (m.integrantes.length >= MESA_MAX) return;
      var prom = m.integrantes.reduce(function(acc, id) { return acc + matriz[p.id][id].pct; }, 0) / m.integrantes.length;
      if (prom > mejorProm) { mejorProm = prom; mejorMesa = m; }
    });
    if (mejorMesa && mejorProm >= MIN_MATCH_PCT * 0.6) { mejorMesa.integrantes.push(p.id); asignado[p.id] = true; }
    else sinMesa.push(p.id);
  });

  return { mesas: mesas, sinMesa: sinMesa };
}

function calcularEvento(perfilesCrudos) {
  var perfiles = perfilesCrudos.map(normalizarPerfil);
  var matriz = construirMatriz(perfiles);
  var porPersona = matchesPorPersona(perfiles, matriz);
  var pares = rondaDePares(perfiles, matriz);
  var mesas = armarMesas(perfiles, matriz);
  var sinMatch = perfiles.filter(function(p) { return p.formato !== "grupo" && !porPersona[p.id].length; }).map(function(p) { return p.id; });
  return { perfiles: perfiles, matriz: matriz, porPersona: porPersona, pares: pares, mesas: mesas.mesas, sinMesa: mesas.sinMesa, sinMatch: sinMatch };
}

// ─────────────────────────────────────────────
// TEXTOS: por qué hablar + rompehielos
// ─────────────────────────────────────────────

function primerNombre(p) { return (p.nombre || "").split(" ")[0] || "esta persona"; }

// "Datos y SQL" → "datos y SQL", pero "IA en producto" queda igual
function enMinuscula(label) {
  return /^[A-ZÁÉÍÓÚ]{2}/.test(label) ? label : label.charAt(0).toLowerCase() + label.slice(1);
}

function listaNatural(items) {
  // Los labels ya llevan "y" ("Datos y SQL"), así que se unen con "además de"
  if (items.length <= 1) return items.join("");
  return items.slice(0, -1).join(", ") + ", además de " + items[items.length - 1];
}

function porQueHablar(a, b, razones) {
  var frases = [];
  var recibe = razones.filter(function(r) { return r.tipo === "skill" && r.de === b.id; }).map(function(r) { return enMinuscula(SKILL_BY_ID[r.skill].label); });
  var aporta = razones.filter(function(r) { return r.tipo === "skill" && r.de === a.id; }).map(function(r) { return enMinuscula(SKILL_BY_ID[r.skill].label); });
  if (recibe.length) frases.push(primerNombre(b) + " puede ayudarte con " + listaNatural(recibe));
  if (aporta.length) frases.push((recibe.length ? "vos" : "Vos") + " podés aportarle en " + listaNatural(aporta));
  razones.forEach(function(r) {
    if (r.tipo === "objetivo" && r.obj === r.objOtro) frases.push("los dos vienen a " + enMinuscula(OBJETIVOS[r.obj].label));
    else if (r.tipo === "objetivo") {
      var miObj = r.quien === a.id ? r.obj : r.objOtro;
      var suObj = r.quien === a.id ? r.objOtro : r.obj;
      frases.push("vos venís a " + enMinuscula(OBJETIVOS[miObj].label) + " y " + primerNombre(b) + " a " + enMinuscula(OBJETIVOS[suObj].label));
    }
    if (r.tipo === "objetivo_comun") frases.push("los dos vienen a " + enMinuscula(OBJETIVOS[r.obj].label));
  });
  frases = unique(frases).slice(0, 2);
  if (!frases.length) return "Tienen perfiles complementarios para conversar.";
  var t = frases.join(", y ");
  return t.charAt(0).toUpperCase() + t.slice(1) + ".";
}

function rompehielos(a, b, razones) {
  var ayuda = razones.filter(function(r) { return r.tipo === "skill" && r.de === b.id; })[0];
  if (ayuda) return "Preguntale a " + primerNombre(b) + ": “¿Cuál fue el error más útil que cometiste con " + enMinuscula(SKILL_BY_ID[ayuda.skill].label) + "?”";
  var aporte = razones.filter(function(r) { return r.tipo === "skill" && r.de === a.id; })[0];
  if (aporte) return "Preguntale a " + primerNombre(b) + " qué está intentando resolver hoy con " + enMinuscula(SKILL_BY_ID[aporte.skill].label) + ".";
  return "Preguntale a " + primerNombre(b) + " qué vino a buscar al evento y qué tendría que pasar para que le valga la pena.";
}

// ─────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────
var SKILLS_LIST = Object.keys(SKILL_BY_ID).map(function(id) {
  return "- " + id + " (" + SKILL_BY_ID[id].area + "): " + SKILL_BY_ID[id].label;
}).join("\n");

var OBJETIVOS_LIST = Object.keys(OBJETIVOS).map(function(id) {
  return "- " + id + ": " + OBJETIVOS[id].label;
}).join("\n");

function buildSystemPrompt(nombreEvento) {
  return "Eres Mentorcito, el agente de Mentores con Propósito que conecta a las personas que van a un mismo evento"
  + (nombreEvento ? " (" + nombreEvento + ")" : "") + ".\n\n"
  + "MISIÓN: En pocas preguntas entendés qué puede ofrecer cada asistente, qué está buscando y a qué viene al evento, para que el sistema le proponga con quién conversar (1 a 1) y en qué mesa temática sentarse.\n\n"
  + "NOMBRE Y GÉNERO:\n"
  + "- Lo primero es preguntar el nombre. Usalo en cada respuesta.\n"
  + "- Inferí el género por el nombre y adaptá las palabras (bienvenido/bienvenida). Si dudás, usá formas neutras.\n\n"
  + "REGLA DE ORO — UNA PREGUNTA A LA VEZ. Nunca dos preguntas en el mismo mensaje.\n\n"
  + "LÍMITE DURO: EXACTAMENTE 6 preguntas (ver flujo). Si las respuestas son cortas, avanzás igual. Sin preguntas de seguimiento.\n\n"
  + "EXTENSIÓN: mensajes de máximo 3 líneas durante las preguntas.\n\n"
  + "FORMATO DE TEXTO: NO uses markdown (#, **, *, ---). Texto plano y limpio. Si hace falta una lista, usá •.\n\n"
  + "CATÁLOGO DE SKILLS (usá solo estos ids en ofrece_skills y busca_skills):\n" + SKILLS_LIST + "\n\n"
  + "OBJETIVOS POSIBLES (usá solo estos ids en objetivos):\n" + OBJETIVOS_LIST + "\n\n"
  + "FLUJO — EN ORDEN, SIN SALTEAR:\n"
  + "PASO 1 — APERTURA: ya se mostró el saludo. Recibís el nombre.\n"
  + "PASO 2 — PREGUNTA 1: '¿A qué te dedicás hoy y en qué empresa o proyecto?' — inferís rol, empresa y nivel.\n"
  + "PASO 3 — PREGUNTA 2: '¿En qué temas te buscan los demás? Contame 2 o 3 cosas en las que podrías ayudar a alguien hoy mismo.' — esto es lo que OFRECE.\n"
  + "PASO 4 — PREGUNTA 3: '¿Qué desafío te gustaría destrabar con alguien que ya pasó por eso?' — esto es lo que BUSCA (sus gaps).\n"
  + "PASO 5 — PREGUNTA 4: '¿A qué venís principalmente al evento?' y mostrá las opciones en una lista con •: aprender de alguien con más experiencia, compartir experiencia o mentorear, contratar, buscar trabajo o proyecto, buscar inversión, invertir, conseguir clientes, encontrar proveedor o solución, encontrar socio o cofounder, ampliar red. Puede elegir hasta 2.\n"
  + "PASO 6 — PREGUNTA 5: '¿Cómo preferís conectar? A) Conversaciones 1 a 1 B) Mesas temáticas en grupo chico C) Las dos'\n"
  + "PASO 7 — PREGUNTA 6 (consentimiento): '¿Aceptás que compartamos tu nombre, tu rol y lo que ofrecés con las personas con las que hagas match? Si querés, dejame también tu LinkedIn o email para que te contacten.'\n"
  + "PASO 8 — PERFIL: Tu respuesta DEBE empezar con el bloque <PERFIL>...</PERFIL> con todos los campos completos. Después del bloque, en 3 o 4 líneas cálidas y específicas: resumí qué aporta la persona y qué busca, y decile que abajo va a ver sus matches del evento (o que van a ir apareciendo a medida que se sumen asistentes), y que abajo tiene su link personal para volver a verlos cuando quiera. Cerrá sin hacer más preguntas.\n\n"
  + "⚠️ ANTI-LOOP: después de la pregunta 6 no hagas más preguntas. Pasá al PASO 8 aunque falte información.\n"
  + "⚠️ ANTI-SKIP: el bloque <PERFIL> va SIEMPRE primero en el PASO 8.\n"
  + "⚠️ Si la persona NO acepta compartir sus datos, igual emití el bloque con \"consentimiento\": false.\n\n"
  + "CÓMO COMPLETAR EL PERFIL:\n"
  + "- ofrece / busca: frases cortas con las palabras de la persona (2 a 4 cada una).\n"
  + "- ofrece_skills / busca_skills: ids del catálogo que mejor representan esas frases. Si nada encaja, dejá la lista vacía.\n"
  + "- nivel: junior (menos de 2 años), mid (2 a 5), senior (más de 5 o lidera equipos), senior-ejecutivo (C-level, founder con tracción, director).\n"
  + "- formato: 1a1, grupo o ambos.\n"
  + "- resumen: una línea en tercera persona para que otros asistentes entiendan quién es.\n\n"
  + "FORMATO DEL BLOQUE (reemplazá con datos reales):\n"
  + "<PERFIL>\n"
  + "{\"nombre\":\"\",\"rol\":\"\",\"empresa\":\"\",\"nivel\":\"mid\",\"ofrece\":[\"\"],\"ofrece_skills\":[\"\"],\"busca\":[\"\"],\"busca_skills\":[\"\"],\"objetivos\":[\"\"],\"formato\":\"ambos\",\"consentimiento\":true,\"contacto\":\"\",\"resumen\":\"\"}\n"
  + "</PERFIL>";
}

// ─────────────────────────────────────────────
// TOKENS (mismos que MentorAgent, dark mode fijo)
// ─────────────────────────────────────────────
var T = {
  bg:           "#0d0d1a",
  header:       "rgba(13,13,26,0.97)",
  card:         "rgba(255,255,255,0.04)",
  border:       "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.15)",
  highlightBg:  "rgba(255,255,255,0.06)",
  text:         "rgba(255,255,255,0.88)",
  textSub:      "rgba(255,255,255,0.55)",
  textMuted:    "rgba(255,255,255,0.45)",
  textDisabled: "rgba(255,255,255,0.25)",
  textWhite:    "white",
  primary:      "#4361ee",
  violet:       "#7b2ff7",
  pink:         "#f72585",
  green:        "#06d6a0",
};
var AREA_COLOR = { tech: "#3a86ff", producto: "#9b5fff", negocio: "#f72585" };

function pctColor(pct) {
  return pct >= 70 ? T.green : pct >= 50 ? T.primary : T.textSub;
}

// ─────────────────────────────────────────────
// PERSISTENCIA
// Escribe en el mismo Apps Script que MentorAgent (action: "event_profile")
// y lee con /api/sheets?action=event_profiles&evento=ID
// ─────────────────────────────────────────────
async function postToSheets(payload) {
  try {
    await fetch(SHEETS_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });
  } catch (e) {}
}

async function fetchPerfilesEvento(eventoId) {
  var r = await fetch("/api/sheets?action=event_profiles&evento=" + encodeURIComponent(eventoId));
  if (!r.ok) throw new Error("HTTP " + r.status);
  var d = await r.json();
  var lista = Array.isArray(d) ? d : (d.perfiles || []);
  return lista.map(function(x) { return typeof x === "string" ? JSON.parse(x) : x; })
    .filter(function(p) { return p && p.consentimiento !== false; });
}

// Acepta JSON (array de perfiles) o CSV con columnas: nombre,rol,empresa,nivel,ofrece,busca,objetivos,formato,contacto
// En CSV, las listas van separadas por "|"
function parsearPerfiles(texto) {
  var t = (texto || "").trim();
  if (!t) return [];
  if (t.charAt(0) === "[" || t.charAt(0) === "{") {
    var j = JSON.parse(t);
    return Array.isArray(j) ? j : (j.perfiles || [j]);
  }
  var filas = t.split(/\r?\n/).filter(function(l) { return l.trim(); });
  var sep = filas[0].indexOf(";") !== -1 && filas[0].indexOf(",") === -1 ? ";" : ",";
  var cab = filas[0].split(sep).map(function(c) { return c.trim().toLowerCase(); });
  var listas = ["ofrece", "busca", "objetivos", "ofrece_skills", "busca_skills"];
  return filas.slice(1).map(function(f) {
    var cols = f.split(sep);
    var p = {};
    cab.forEach(function(c, i) {
      var v = (cols[i] || "").trim();
      p[c] = listas.indexOf(c) !== -1 ? v.split("|").map(function(x) { return x.trim(); }).filter(Boolean) : v;
    });
    return p;
  });
}

function exportarCSV(res, nombreArchivo) {
  var byId = {};
  res.perfiles.forEach(function(p) { byId[p.id] = p; });
  var filas = [["persona", "match", "porcentaje", "por_que", "rompehielos", "contacto_match"]];
  res.perfiles.forEach(function(a) {
    res.porPersona[a.id].forEach(function(m) {
      var b = byId[m.id];
      filas.push([a.nombre, b.nombre, m.pct + "%", porQueHablar(a, b, m.razones), rompehielos(a, b, m.razones), b.contacto || ""]);
    });
  });
  filas.push([]);
  filas.push(["mesa", "tema", "anfitrion", "integrantes"]);
  res.mesas.forEach(function(m, i) {
    filas.push(["Mesa " + (i + 1), SKILL_BY_ID[m.tema].label, byId[m.anfitrion].nombre, m.integrantes.map(function(id) { return byId[id].nombre; }).join(" | ")]);
  });
  var csv = filas.map(function(f) {
    return f.map(function(c) { return "\"" + String(c == null ? "" : c).replace(/"/g, "\"\"") + "\""; }).join(",");
  }).join("\n");
  var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nombreArchivo || "matches-evento.csv";
  a.click();
}

// ─────────────────────────────────────────────
// COMPONENTES DE UI
// ─────────────────────────────────────────────
function Avatar(props) {
  var n = props.nombre || "?";
  var ini = n.split(" ").map(function(w) { return w.charAt(0); }).slice(0, 2).join("").toUpperCase();
  var s = props.size || 34;
  return (
    <div style={{ width: s, height: s, borderRadius: "50%", background: "linear-gradient(135deg, #4361ee, #7b2ff7)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: s * 0.38, fontWeight: 700, flexShrink: 0 }}>{ini}</div>
  );
}

function SkillChip(props) {
  var s = SKILL_BY_ID[props.id];
  if (!s) return null;
  var c = AREA_COLOR[s.area];
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, color: c, background: c + "18", border: "1px solid " + c + "35", borderRadius: 20, padding: "2px 8px", margin: "2px 4px 2px 0" }}>{s.label}</span>
  );
}

function PctBadge(props) {
  var c = pctColor(props.pct);
  return (
    <div style={{ minWidth: 48, textAlign: "center", padding: "4px 8px", borderRadius: 10, background: c + "18", border: "1px solid " + c + "44", color: c, fontWeight: 800, fontSize: 14 }}>{props.pct}%</div>
  );
}

function MatchCard(props) {
  var a = props.yo, b = props.otro, m = props.match;
  return (
    <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar nombre={b.nombre} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.textWhite }}>{b.nombre}</div>
          <div style={{ fontSize: 11, color: T.textSub }}>{[b.rol, b.empresa].filter(Boolean).join(" · ")}</div>
        </div>
        <PctBadge pct={m.pct} />
      </div>
      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{porQueHablar(a, b, m.razones)}</div>
      <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.5, background: T.highlightBg, borderRadius: 10, padding: "8px 10px" }}>💬 {rompehielos(a, b, m.razones)}</div>
      {b.contacto && <div style={{ fontSize: 11, color: T.textMuted }}>Contacto: {b.contacto}</div>}
    </div>
  );
}

function MesaCard(props) {
  var m = props.mesa, byId = props.byId;
  return (
    <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 11, color: T.textMuted, letterSpacing: 1, fontWeight: 700 }}>MESA {props.n}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.textWhite, margin: "4px 0 10px" }}>{SKILL_BY_ID[m.tema].label}</div>
      {m.integrantes.map(function(id) {
        var p = byId[id];
        var esAnf = id === m.anfitrion;
        return (
          <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0" }}>
            <Avatar nombre={p.nombre} size={26} />
            <span style={{ fontSize: 13, color: T.text, flex: 1 }}>{p.nombre}</span>
            {esAnf && <span style={{ fontSize: 10, color: T.green, fontWeight: 700 }}>ANFITRIÓN/A</span>}
          </div>
        );
      })}
    </div>
  );
}

// Estilos globales compartidos por el chat y el panel
function EstilosBase() {
  return (
    <style>
      {[
        "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');",
        "* { box-sizing: border-box; margin: 0; padding: 0; }",
        "html,body,#root { height: 100%; }",
        "body { background: #0d0d1a; overscroll-behavior: none; }",
        "@keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.2); } }",
        "textarea:focus { outline: none; }",
        "textarea { resize: none; }",
        "textarea, button, input { font-family: inherit; }",
        "::placeholder { color: rgba(255,255,255,0.25); }",
        "@media(max-width:640px){textarea,input{font-size:16px!important}}",
      ].join("\n")}
    </style>
  );
}

// ─────────────────────────────────────────────
// PANEL DEL ORGANIZADOR
// ─────────────────────────────────────────────
function PanelOrganizador(props) {
  var eventoId = props.eventoId;
  var [texto, setTexto] = useState("");
  var [perfiles, setPerfiles] = useState([]);
  var [error, setError] = useState("");
  var [tab, setTab] = useState("matches");
  var [cargando, setCargando] = useState(false);

  function cargarDesdeSheets() {
    if (!eventoId) return;
    setCargando(true); setError("");
    fetchPerfilesEvento(eventoId)
      .then(function(l) { setPerfiles(l); })
      .catch(function(e) { setError("No pude leer los perfiles del evento (" + e.message + "). Podés pegarlos abajo."); })
      .finally(function() { setCargando(false); });
  }

  useEffect(cargarDesdeSheets, [eventoId]);

  function cargarTexto() {
    try { setPerfiles(parsearPerfiles(texto)); setError(""); }
    catch (e) { setError("No pude leer el texto: " + e.message); }
  }

  function cargarArchivo(e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function() { setTexto(r.result); try { setPerfiles(parsearPerfiles(r.result)); setError(""); } catch (err) { setError("No pude leer el archivo: " + err.message); } };
    r.readAsText(f);
  }

  var res = perfiles.length >= 2 ? calcularEvento(perfiles) : null;
  var byId = {};
  if (res) res.perfiles.forEach(function(p) { byId[p.id] = p; });

  var tabs = [
    { id: "matches", label: "Matches 1 a 1" },
    { id: "ronda", label: "Ronda de pares" },
    { id: "mesas", label: "Mesas" },
    { id: "sin", label: "Sin match" },
  ];

  return (
    <>
    <EstilosBase />
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: 1 }}>💠 MENTORCITO · PANEL DEL EVENTO</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.textWhite, marginTop: 4 }}>{props.nombreEvento || eventoId || "Evento"}</div>
          <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>
            {perfiles.length} asistentes{res ? " · " + res.pares.length + " pares · " + res.mesas.length + " mesas" : ""}
          </div>
        </div>

        <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 13, color: T.textSub }}>Cargá los perfiles: se leen solos del Sheet del evento, o pegá un JSON / CSV (columnas: nombre, rol, empresa, nivel, ofrece, busca, objetivos, formato, contacto; listas separadas por |).</div>
          <textarea value={texto} onChange={function(e) { setTexto(e.target.value); }} rows={4} placeholder="Pegá acá el JSON o CSV de asistentes…"
            style={{ width: "100%", background: "transparent", border: "1px solid " + T.border, borderRadius: 10, color: T.text, padding: 10, fontSize: 12, fontFamily: "monospace" }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={cargarTexto} style={btnStyle(true)}>Calcular matches</button>
            <label style={btnStyle(false)}>Subir archivo<input type="file" accept=".json,.csv,.txt" onChange={cargarArchivo} style={{ display: "none" }} /></label>
            {eventoId && <button onClick={cargarDesdeSheets} style={btnStyle(false)}>{cargando ? "Cargando…" : "Recargar del Sheet"}</button>}
            {res && <button onClick={function() { exportarCSV(res, "matches-" + (eventoId || "evento") + ".csv"); }} style={btnStyle(false)}>Exportar CSV</button>}
          </div>
          {error && <div style={{ fontSize: 12, color: T.pink }}>{error}</div>}
        </div>

        {res && (
          <>
            <div style={{ display: "flex", gap: 6, overflowX: "auto" }}>
              {tabs.map(function(t) {
                var on = tab === t.id;
                return <button key={t.id} onClick={function() { setTab(t.id); }} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid " + (on ? T.primary : T.border), background: on ? T.primary + "22" : "transparent", color: on ? T.textWhite : T.textSub, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{t.label}</button>;
              })}
            </div>

            {tab === "matches" && res.perfiles.map(function(a) {
              var ms = res.porPersona[a.id];
              if (!ms.length) return null;
              return (
                <div key={a.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar nombre={a.nombre} size={28} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.textWhite }}>{a.nombre}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{a.rol}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
                    {ms.map(function(m) { return <MatchCard key={m.id} yo={a} otro={byId[m.id]} match={m} />; })}
                  </div>
                </div>
              );
            })}

            {tab === "ronda" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 12, color: T.textSub }}>Cada persona con una sola otra, priorizando los matches más altos. Ideal para una ronda de speed networking.</div>
                {res.pares.map(function(p, i) {
                  var a = byId[p.a], b = byId[p.b];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "10px 12px" }}>
                      <span style={{ fontSize: 11, color: T.textMuted, width: 22 }}>{i + 1}</span>
                      <span style={{ flex: 1, fontSize: 13, color: T.text }}>{a.nombre} ↔ {b.nombre}</span>
                      <PctBadge pct={p.pct} />
                    </div>
                  );
                })}
              </div>
            )}

            {tab === "mesas" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                {res.mesas.map(function(m, i) { return <MesaCard key={i} n={i + 1} mesa={m} byId={byId} />; })}
                {!res.mesas.length && <div style={{ fontSize: 13, color: T.textSub }}>Todavía no hay temas con suficientes personas para armar una mesa (mínimo {MESA_MIN}, con alguien que lo ofrezca).</div>}
              </div>
            )}

            {tab === "sin" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 12, color: T.textSub }}>Personas sin un match 1 a 1 de al menos {MIN_MATCH_PCT}% o sin mesa. Son buenas candidatas para presentar en persona o para invitar perfiles que les falten.</div>
                {unique(res.sinMatch.concat(res.sinMesa)).map(function(id) {
                  var p = byId[id];
                  return (
                    <div key={id} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.textWhite }}>{p.nombre} <span style={{ fontWeight: 400, color: T.textMuted }}>· {p.rol}</span></div>
                      <div style={{ fontSize: 11, color: T.textSub, marginTop: 4 }}>Busca: {p.busca_skills.length ? p.busca_skills.map(function(s) { return <SkillChip key={s} id={s} />; }) : (p.busca || []).join(", ")}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </>
  );
}

function btnStyle(primary) {
  return {
    padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
    border: primary ? "none" : "1px solid " + T.borderStrong,
    background: primary ? "linear-gradient(135deg, #4361ee, #7b2ff7)" : "transparent",
    color: primary ? "white" : T.text,
  };
}

// ─────────────────────────────────────────────
// LINK PERSONAL: el perfil viaja codificado en la URL (?yo=...) y además
// queda guardado en el navegador, para que la persona vuelva a ver sus matches
// ─────────────────────────────────────────────
function codificarPerfil(p) {
  var json = JSON.stringify(p);
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodificarPerfil(str) {
  try {
    var b64 = str.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(b64))));
  } catch (e) { return null; }
}

function linkPersonal(eventoId, nombreEvento, p) {
  var params = new URLSearchParams();
  if (eventoId) params.set("evento", eventoId);
  if (nombreEvento) params.set("nombre", nombreEvento);
  params.set("yo", codificarPerfil(p));
  return window.location.origin + window.location.pathname + "?" + params.toString();
}

function storageKey(eventoId) { return "mentorcito_evento_" + (eventoId || "sin_evento"); }

function guardarPerfilLocal(eventoId, p) {
  try { localStorage.setItem(storageKey(eventoId), JSON.stringify(p)); } catch (e) {}
}

function leerPerfilLocal(eventoId) {
  try { return JSON.parse(localStorage.getItem(storageKey(eventoId)) || "null"); } catch (e) { return null; }
}

function borrarPerfilLocal(eventoId) {
  try { localStorage.removeItem(storageKey(eventoId)); } catch (e) {}
}

function LinkPersonal(props) {
  var [copiado, setCopiado] = useState(false);
  var url = linkPersonal(props.eventoId, props.nombreEvento, props.perfil);
  function copiar() {
    try {
      navigator.clipboard.writeText(url).then(function() { setCopiado(true); setTimeout(function() { setCopiado(false); }, 2000); });
    } catch (e) {}
  }
  return (
    <div style={{ background: T.primary + "14", border: "1px solid " + T.primary + "44", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>🔖 Guardá tu link personal. Tus matches se actualizan a medida que se suman personas al evento, así que volvé cuando quieras.</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={copiar} style={btnStyle(true)}>{copiado ? "¡Copiado!" : "Copiar mi link"}</button>
        <a href={"https://wa.me/?text=" + encodeURIComponent("Mis matches para " + (props.nombreEvento || "el evento") + ": " + url)} target="_blank" rel="noopener noreferrer" style={Object.assign({}, btnStyle(false), { textDecoration: "none" })}>Enviármelo por WhatsApp</a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RESULTADO DEL ASISTENTE (debajo del bloque <PERFIL>, o al volver con su link)
// ─────────────────────────────────────────────
function ResultadoAsistente(props) {
  var perfil = props.perfil;
  var eventoId = props.eventoId;
  var [otros, setOtros] = useState(null);
  var [recarga, setRecarga] = useState(0);

  useEffect(function() {
    if (!eventoId) { setOtros([]); return; }
    setOtros(null);
    fetchPerfilesEvento(eventoId)
      .then(function(l) { setOtros(l); })
      .catch(function() { setOtros([]); });
  }, [eventoId, recarga]);

  var yo = normalizarPerfil(perfil, 0);
  yo.id = "yo";
  var res = null, mesa = null, byId = {};
  if (otros && otros.length) {
    var lista = [yo].concat(otros.filter(function(o) { return (o.nombre || "") !== (perfil.nombre || "") || (o.contacto || "") !== (perfil.contacto || ""); }));
    res = calcularEvento(lista);
    res.perfiles.forEach(function(p) { byId[p.id] = p; });
    var yoNorm = res.perfiles[0];
    mesa = res.mesas.filter(function(m) { return m.integrantes.indexOf(yoNorm.id) !== -1; })[0] || null;
  }

  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ background: T.highlightBg, borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>OFRECÉS</div>
        <div>{yo.ofrece_skills.length ? yo.ofrece_skills.map(function(s) { return <SkillChip key={s} id={s} />; }) : <span style={{ fontSize: 12, color: T.textSub }}>{yo.ofrece.join(", ")}</span>}</div>
        <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 1, margin: "10px 0 4px" }}>BUSCÁS</div>
        <div>{yo.busca_skills.length ? yo.busca_skills.map(function(s) { return <SkillChip key={s} id={s} />; }) : <span style={{ fontSize: 12, color: T.textSub }}>{yo.busca.join(", ")}</span>}</div>
      </div>

      {otros === null && <div style={{ fontSize: 12, color: T.textSub }}>Buscando con quién conectarte…</div>}

      {res && res.porPersona[res.perfiles[0].id].length > 0 && (
        <>
          <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: 1 }}>TUS MATCHES EN EL EVENTO</div>
          {res.porPersona[res.perfiles[0].id].map(function(m) {
            return <MatchCard key={m.id} yo={res.perfiles[0]} otro={byId[m.id]} match={m} />;
          })}
        </>
      )}

      {mesa && <MesaCard n={res.mesas.indexOf(mesa) + 1} mesa={mesa} byId={byId} />}

      {otros !== null && (!res || !res.porPersona[res.perfiles[0].id].length) && (
        <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.5 }}>Todavía hay pocas personas registradas para darte un buen match. Volvé con tu link personal más cerca del evento: los matches aparecen solos a medida que se suman asistentes.</div>
      )}

      {otros !== null && (
        <button onClick={function() { setRecarga(recarga + 1); }} style={Object.assign({}, btnStyle(false), { alignSelf: "flex-start" })}>↻ Actualizar matches</button>
      )}

      <LinkPersonal perfil={perfil} eventoId={eventoId} nombreEvento={props.nombreEvento} />
    </div>
  );
}

// ─────────────────────────────────────────────
// PORTADA: /eventos sin ?evento= (no hay a qué evento sumar a la persona)
// ─────────────────────────────────────────────
function PortadaSinEvento() {
  var [codigo, setCodigo] = useState("");
  function ir() {
    var c = codigo.trim().toLowerCase().replace(/\s+/g, "-");
    if (c) window.location.search = "?evento=" + encodeURIComponent(c);
  }
  return (
    <>
      <EstilosBase />
      <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ maxWidth: 440, width: "100%", display: "flex", flexDirection: "column", gap: 14, textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🤝</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: T.textWhite, lineHeight: 1.25 }}>Mentorcito para eventos</div>
          <div style={{ fontSize: 14, color: T.textSub, lineHeight: 1.6 }}>
            Te ayudamos a saber con quién conversar en un evento según lo que ofrecés y lo que buscás. Para empezar necesitás el link de tu evento: pedíselo a quien lo organiza.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <input value={codigo} onChange={function(e) { setCodigo(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") ir(); }}
              placeholder="¿Tenés el código del evento?"
              style={{ flex: 1, minWidth: 0, background: T.card, border: "1px solid " + T.borderStrong, borderRadius: 10, color: T.text, padding: "10px 12px", fontSize: 14, outline: "none" }} />
            <button onClick={ir} disabled={!codigo.trim()} style={Object.assign({}, btnStyle(true), { opacity: codigo.trim() ? 1 : 0.5 })}>Entrar</button>
          </div>
          <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid " + T.border, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
            <div style={{ fontSize: 14, color: T.text, fontWeight: 700 }}>¿Organizás un evento?</div>
            <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.5 }}>Escribinos y te armamos el link para que tus asistentes lleguen sabiendo con quién hablar.</div>
            <a href={"https://wa.me/" + WHATSAPP_ORGANIZADORES + "?text=" + encodeURIComponent("Hola! Quiero crear un evento en Mentorcito para eventos. Nombre del evento: ... Fecha: ... Cantidad estimada de asistentes: ...")}
              target="_blank" rel="noopener noreferrer"
              style={Object.assign({}, btnStyle(false), { textDecoration: "none", borderColor: "#25D366", color: "#25D366" })}>💬 Escribinos por WhatsApp</a>
          </div>
          <a href="https://mentorcito.vercel.app/" style={{ fontSize: 12, color: T.textMuted, marginTop: 8 }}>¿Buscás un mentor/a? Hacé tu diagnóstico</a>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function EventMatchAgent(props) {
  var urlParams = new URLSearchParams(window.location.search);
  var eventoId = props.eventoId || urlParams.get("evento") || "";
  var nombreEvento = props.nombreEvento || urlParams.get("nombre") || "";
  var esOrganizador = urlParams.get("organizador") === "1";

  var INITIAL_MSG = {
    role: "assistant",
    content: "Hola, soy Mentorcito 💠\n\n"
      + (nombreEvento ? "Te ayudo a aprovechar " + nombreEvento + " al máximo." : "Te ayudo a aprovechar el evento al máximo.")
      + " Con 6 preguntas rápidas voy a entender qué podés aportar y qué estás buscando, y te digo con quién te conviene conversar y en qué mesa sentarte.\n\n¿Cómo te llamás?",
  };

  var [messages, setMessages] = useState([INITIAL_MSG]);
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var [perfil, setPerfil] = useState(null);
  // Perfil guardado: viene del link personal (?yo=) o del navegador
  var [perfilGuardado, setPerfilGuardado] = useState(function() {
    var yo = urlParams.get("yo");
    var p = yo ? decodificarPerfil(yo) : leerPerfilLocal(eventoId);
    if (p && yo) guardarPerfilLocal(eventoId, p);
    return p;
  });
  var bottomRef = useRef(null);
  var systemPrompt = useRef(buildSystemPrompt(nombreEvento)).current;

  useEffect(function() {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (esOrganizador) return <PanelOrganizador eventoId={eventoId} nombreEvento={nombreEvento} />;

  if (!eventoId) return <PortadaSinEvento />;

  if (perfilGuardado) {
    return (
      <>
        <EstilosBase />
        <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "20px 16px 40px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: 1 }}>💠 MENTORCITO · {(nombreEvento || "EVENTO").toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.textWhite, marginTop: 4 }}>Hola de nuevo, {primerNombre(perfilGuardado)} 👋</div>
            <ResultadoAsistente perfil={perfilGuardado} eventoId={eventoId} nombreEvento={nombreEvento} />
            <button onClick={function() {
              borrarPerfilLocal(eventoId);
              window.history.replaceState(null, "", window.location.pathname + "?" + new URLSearchParams({ evento: eventoId, nombre: nombreEvento }).toString());
              setPerfilGuardado(null);
            }} style={{ marginTop: 16, background: "none", border: "none", color: T.textMuted, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>No soy {primerNombre(perfilGuardado)} / hacer el chat de nuevo</button>
          </div>
        </div>
      </>
    );
  }

  function extractPerfil(text) {
    var m = text.match(/<PERFIL>([\s\S]*?)<\/PERFIL>/);
    if (m) { try { return JSON.parse(m[1]); } catch (e) { return null; } }
    return null;
  }

  function cleanText(text) {
    var start = text.indexOf("<PERFIL>");
    if (start === -1) return text.trim();
    if (text.indexOf("</PERFIL>") === -1) return text.slice(0, start).trim();
    return text.replace(/<PERFIL>[\s\S]*?<\/PERFIL>/g, "").trim();
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    var userMsg = { role: "user", content: input.trim() };
    var newMessages = messages.concat([userMsg]);
    setMessages(newMessages.concat([{ role: "assistant", content: "" }]));
    setInput("");
    setLoading(true);

    var apiMessages = newMessages.slice(1).map(function(m) { return { role: m.role, content: m.content }; });

    try {
      var res = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2000,
          temperature: 0,
          stream: true,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var fullText = "";
      var buffer = "";
      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        var lines = buffer.split("\n");
        buffer = lines.pop();
        for (var li = 0; li < lines.length; li++) {
          if (lines[li].indexOf("data: ") !== 0) continue;
          var json = lines[li].slice(6).trim();
          if (json === "[DONE]") continue;
          try {
            var evt = JSON.parse(json);
            var delta = evt && evt.delta && evt.delta.text ? evt.delta.text : "";
            if (delta) {
              fullText += delta;
              var visible = cleanText(fullText);
              setMessages(function(prev) {
                var updated = prev.slice();
                updated[updated.length - 1] = { role: "assistant", content: visible };
                return updated;
              });
            }
          } catch (e) {}
        }
      }

      var p = extractPerfil(fullText);
      if (p) {
        setPerfil(p);
        guardarPerfilLocal(eventoId, p);
        if (p.consentimiento !== false && eventoId) {
          postToSheets({ action: "event_profile", evento: eventoId, ts: Date.now(), perfil: p });
        }
      }
    } catch (err) {
      setMessages(function(prev) {
        var updated = prev.slice();
        updated[updated.length - 1] = { role: "assistant", content: "Error: " + err.message + ". Intentá de nuevo." };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    var isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
    if (e.key === "Enter" && !e.shiftKey && !isMobile) { e.preventDefault(); sendMessage(); }
  }

  function formatMessage(text) {
    return text.split("\n").map(function(line, i) {
      if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
      return <p key={i} style={{ margin: "3px 0", lineHeight: "1.6", color: "rgba(255,255,255,0.82)" }}>{line.replace(/^[\s]*[-*]\s+/, "• ").replace(/\*\*/g, "")}</p>;
    });
  }

  return (
    <>
      <EstilosBase />

      <div style={{ height: "100vh", background: T.bg, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif", color: T.text }}>
        <div style={{ padding: "0 12px", height: 56, borderBottom: "1px solid " + T.border, display: "flex", alignItems: "center", gap: 10, background: T.header, flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>💠</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.textWhite, lineHeight: 1.2 }}>{nombreEvento || "Mentores con Propósito"}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>Match entre asistentes · Mentorcito</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map(function(msg, i) {
            var esBot = msg.role === "assistant";
            return (
              <div key={i} style={{ display: "flex", justifyContent: esBot ? "flex-start" : "flex-end" }}>
                <div style={{ maxWidth: "85%", padding: "13px 16px", borderRadius: esBot ? "4px 18px 18px 18px" : "18px 18px 4px 18px", background: esBot ? "rgba(255,255,255,0.05)" : "rgba(67,97,238,0.14)", border: "1px solid " + (esBot ? "rgba(255,255,255,0.08)" : "rgba(67,97,238,0.35)"), fontSize: 14 }}>
                  {formatMessage(msg.content)}
                  {esBot && perfil && i === messages.length - 1 && !loading && <ResultadoAsistente perfil={perfil} eventoId={eventoId} nombreEvento={nombreEvento} />}
                </div>
              </div>
            );
          })}
          {loading && messages[messages.length - 1].content === "" && (
            <div style={{ display: "flex", gap: 5, padding: "12px 16px" }}>
              {[0, 1, 2].map(function(i) {
                return <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: T.primary, animation: "pulse 1.2s ease-in-out infinite", animationDelay: (i * 0.2) + "s" }} />;
              })}
            </div>
          )}
          <div ref={bottomRef} style={{ height: 1, flexShrink: 0 }} />
        </div>

        <div style={{ padding: "8px 12px 16px", borderTop: "1px solid " + T.border, background: T.header, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: T.card, border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 14px" }}>
            <textarea value={input} onChange={function(e) { setInput(e.target.value); }} onKeyDown={handleKey}
              placeholder="Escribí tu respuesta…" rows={2}
              style={{ flex: 1, background: "transparent", border: "none", color: T.text, fontSize: 14, lineHeight: "1.5", caretColor: T.primary }} />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              style={{ width: 36, height: 36, borderRadius: 10, background: (input.trim() && !loading) ? "linear-gradient(135deg, #4361ee, #7b2ff7)" : "rgba(255,255,255,0.07)", border: "none", cursor: (input.trim() && !loading) ? "pointer" : "not-allowed", color: (input.trim() && !loading) ? "white" : "rgba(255,255,255,0.25)", fontSize: 15 }}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Exportadas para tests o para usarlas desde otro componente
export { calcularEvento, scorePar, normalizarPerfil, parsearPerfiles, porQueHablar, rompehielos, buildSystemPrompt };
