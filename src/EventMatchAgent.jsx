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

var MAX_MATCHES = 5;      // matches 1 a 1 por persona (por defecto; cada evento puede cambiarlo con la columna max_matches)
var EXTRA_RECIBIDOS = 2;  // a quien ya tiene todos sus matches se le pueden sumar hasta 2 más, solo para que nadie quede sin match
var MIN_MATCH_PCT = 30;   // por debajo de esto no se sugiere
var WHATSAPP_ORGANIZADORES = "5491170043893"; // mismo número que MentorAgent
var MESA_MIN = 3;
var MESA_MAX = 6;

// ─────────────────────────────────────────────
// CATÁLOGO DE SKILLS (el de MentorAgent + "emprendimiento", para eventos de emprendedores)
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
  emprendimiento: [
    { id: "financiamiento",      label: "Financiamiento e inversión", keywords: ["inversión","inversor","inversores","financiamiento","financiación","fondeo","levantar capital","ronda","seed","pre-seed","angel","venture capital","vc","pitch","deck","valuación","subsidio","crédito","préstamo","aceleradora","incubadora","crowdfunding","capital semilla"] },
    { id: "marketing",           label: "Marketing y crecimiento",    keywords: ["marketing","redes sociales","instagram","tiktok","contenido","comunidad","branding","publicidad","ads","meta ads","google ads","seo","performance","growth","difusión","email marketing","influencers"] },
    { id: "finanzas",            label: "Finanzas y administración",  keywords: ["finanzas","flujo de caja","cash flow","costos","presupuesto","contabilidad","administración","facturar","cobranza","rentabilidad","proyecciones","punto de equilibrio","precios"] },
    { id: "legal_impuestos",     label: "Legal e impuestos",          keywords: ["legal","abogado","contrato","contratos","sociedad","sas","srl","monotributo","impuestos","afip","arca","contador","marca registrada","registrar la marca","propiedad intelectual","patente","habilitación","términos y condiciones"] },
    { id: "equipo_talento",      label: "Equipo y talento",           keywords: ["contratar","contratación","talento","armar equipo","armar el equipo","primeras contrataciones","reclutamiento","rrhh","recursos humanos","cultura","socio","socios","cofounder","co-founder","delegar","freelancers"] },
    { id: "operaciones",         label: "Operaciones y logística",    keywords: ["operaciones","logística","procesos","proveedores","proveedor","producción","fabricación","stock","inventario","distribución","envíos","importar","e-commerce","ecommerce","tienda online","calidad","automatizar"] },
    { id: "expansion",           label: "Expansión e internacionalización", keywords: ["exportar","exportación","internacionalización","internacional","otros mercados","otro país","expansión","expandir","latam","estados unidos","europa","franquicia","franquicias","comercio exterior"] },
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

// Solo dígitos, con código de país. Menos de 8 dígitos no es un número usable.
function limpiarWhatsapp(s) {
  var d = (s || "").toString().replace(/\D/g, "");
  return d.length >= 8 ? d : "";
}

function urlLinkedin(s) {
  var t = (s || "").toString().trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  if (/linkedin\.com/i.test(t)) return "https://" + t.replace(/^\/+/, "");
  return "https://www.linkedin.com/in/" + t.replace(/^@/, "");
}

// Identifica a una persona dentro del evento (para no duplicarla ni matchearla consigo misma)
function claveIdentidad(p) {
  return (p.nombre || "").toString().trim().toLowerCase() + "|" + (limpiarWhatsapp(p.whatsapp) || (p.linkedin || p.contacto || "").toString().trim().toLowerCase());
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
    palabras_ofrece: palabrasClave(ofrece),
    palabras_busca: palabrasClave(busca),
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
  var bWords = b.palabras_busca || palabrasClave(b.busca);
  var palabras = (a.palabras_ofrece || palabrasClave(a.ofrece)).filter(function(w) { return bWords.indexOf(w) !== -1; });
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

// Matches 1 a 1, mutuos: si A ve a B, B ve a A. Se reparten de mayor a menor afinidad
// y nadie recibe más de maxMatches, así no se concentran en las mismas personas
// (con 500 asistentes, sin este tope, una persona aparecía en 44 listas y la mitad en ninguna).
// Segunda pasada: quien quedó con menos matches puede sumar a alguien que ya está completo,
// hasta EXTRA_RECIBIDOS por encima del máximo.
function matchesPorPersona(perfiles, matriz, maxMatches) {
  var max = maxMatches || MAX_MATCHES;
  var out = {}, grado = {};
  perfiles.forEach(function(p) { out[p.id] = []; grado[p.id] = 0; });
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
  var usada = [];
  function agregar(e, k) {
    usada[k] = true;
    out[e.a].push({ id: e.b, pct: e.pct, razones: matriz[e.a][e.b].razones });
    out[e.b].push({ id: e.a, pct: e.pct, razones: matriz[e.b][e.a].razones });
    grado[e.a]++; grado[e.b]++;
  }
  aristas.forEach(function(e, k) {
    if (grado[e.a] < max && grado[e.b] < max) agregar(e, k);
  });
  var tope = max + EXTRA_RECIBIDOS;
  aristas.forEach(function(e, k) {
    if (usada[k]) return;
    if ((grado[e.a] < max && grado[e.b] < tope) || (grado[e.b] < max && grado[e.a] < tope)) agregar(e, k);
  });
  perfiles.forEach(function(p) { out[p.id].sort(function(x, y) { return y.pct - x.pct; }); });
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

// opciones: { maxMatches, sinRonda (el servidor no la usa), sinMesas }
// El orden de perfilesCrudos importa: el panel y el Apps Script usan el mismo (el de la hoja),
// así todos ven el mismo armado de matches y de mesas.
function calcularEvento(perfilesCrudos, opciones) {
  var op = opciones || {};
  var perfiles = perfilesCrudos.map(normalizarPerfil);
  var matriz = construirMatriz(perfiles);
  var porPersona = matchesPorPersona(perfiles, matriz, op.maxMatches);
  var pares = op.sinRonda ? [] : rondaDePares(perfiles, matriz);
  var mesas = op.sinMesas ? { mesas: [], sinMesa: [] } : armarMesas(perfiles, matriz);
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

// conMesas = false: el evento no tiene mesas, se saltea la pregunta de formato (quedan 5)
function buildSystemPrompt(nombreEvento, conMesas) {
  if (conMesas === undefined) conMesas = true;
  var nPreg = conMesas ? 6 : 5;
  return "Eres Mentorcito, el agente de Mentores con Propósito que conecta a las personas que van a un mismo evento"
  + (nombreEvento ? " (" + nombreEvento + ")" : "") + ".\n\n"
  + "MISIÓN: En pocas preguntas entendés qué puede ofrecer cada asistente, qué está buscando y a qué viene al evento, para que el sistema le proponga con quién conversar (1 a 1)" + (conMesas ? " y en qué mesa temática sentarse" : "") + ".\n\n"
  + "NOMBRE Y GÉNERO:\n"
  + "- Lo primero es preguntar el nombre. Usalo en cada respuesta.\n"
  + "- Inferí el género por el nombre y adaptá las palabras (bienvenido/bienvenida). Si dudás, usá formas neutras.\n\n"
  + "REGLA DE ORO — UNA PREGUNTA A LA VEZ. Nunca dos preguntas en el mismo mensaje.\n\n"
  + "LÍMITE DURO: EXACTAMENTE " + nPreg + " preguntas (ver flujo). Si las respuestas son cortas, avanzás igual. Sin preguntas de seguimiento.\n\n"
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
  + (conMesas
    ? "PASO 6 — PREGUNTA 5: '¿Cómo preferís conectar? A) Conversaciones 1 a 1 B) Mesas temáticas en grupo chico C) Las dos'\n"
    : "PASO 6 — (este evento no tiene mesas: NO preguntes cómo prefiere conectar, usá formato \"1a1\" y pasá directo al PASO 7)\n")
  + "PASO 7 — PREGUNTA " + nPreg + " (consentimiento y contacto): '¿Aceptás que compartamos tu nombre, tu rol, tu empresa y lo que ofrecés con tus matches, y tu perfil completo con el organizador del evento? Si querés que tus matches te escriban, dejame tu WhatsApp (con código de país) y, si querés, tu LinkedIn. Solo los van a ver tus matches y el organizador.'\n"
  + "PASO 8 — PERFIL: Tu respuesta DEBE empezar con el bloque <PERFIL>...</PERFIL> con todos los campos completos. Después del bloque, en 3 o 4 líneas cálidas y específicas: resumí qué aporta la persona y qué busca, y decile que abajo va a ver sus matches del evento (o que van a ir apareciendo a medida que se sumen asistentes), y que abajo tiene su link personal para volver a verlos cuando quiera. Cerrá sin hacer más preguntas.\n\n"
  + "⚠️ ANTI-LOOP: después de la pregunta " + nPreg + " no hagas más preguntas. Pasá al PASO 8 aunque falte información.\n"
  + "⚠️ ANTI-SKIP: el bloque <PERFIL> va SIEMPRE primero en el PASO 8.\n"
  + "⚠️ Si la persona NO acepta compartir sus datos, igual emití el bloque con \"consentimiento\": false.\n\n"
  + "CÓMO COMPLETAR EL PERFIL:\n"
  + "- ofrece / busca: frases cortas con las palabras de la persona (2 a 4 cada una).\n"
  + "- ofrece_skills / busca_skills: ids del catálogo que mejor representan esas frases. Si nada encaja, dejá la lista vacía.\n"
  + "- nivel: junior (menos de 2 años), mid (2 a 5), senior (más de 5 o lidera equipos), senior-ejecutivo (C-level, founder con tracción, director).\n"
  + "- formato: 1a1, grupo o ambos.\n"
  + "- whatsapp: solo dígitos con código de país, sin + ni espacios (ej: 5491123456789). Si es un número argentino sin código, agregá 549 y sacá el 0 y el 15. Si no lo dio, dejalo vacío.\n"
  + "- linkedin: la URL o el usuario de LinkedIn si lo dio; si no, vacío. contacto: un email si lo dio; si no, vacío.\n"
  + "- resumen: una línea en tercera persona para que otros asistentes entiendan quién es.\n\n"
  + "FORMATO DEL BLOQUE (reemplazá con datos reales):\n"
  + "<PERFIL>\n"
  + "{\"nombre\":\"\",\"rol\":\"\",\"empresa\":\"\",\"nivel\":\"mid\",\"ofrece\":[\"\"],\"ofrece_skills\":[\"\"],\"busca\":[\"\"],\"busca_skills\":[\"\"],\"objetivos\":[\"\"],\"formato\":\"ambos\",\"consentimiento\":true,\"whatsapp\":\"\",\"linkedin\":\"\",\"contacto\":\"\",\"resumen\":\"\"}\n"
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
var AREA_COLOR = { tech: "#3a86ff", producto: "#9b5fff", negocio: "#f72585", emprendimiento: "#ffb703" };

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

// Consulta el registro de eventos del Sheet. Con clave, además dice si es la del organizador.
async function fetchEventoInfo(eventoId, clave) {
  var url = "/api/sheets?action=event_info&evento=" + encodeURIComponent(eventoId);
  if (clave) url += "&clave=" + encodeURIComponent(clave);
  var r = await fetch(url);
  if (!r.ok) throw new Error("HTTP " + r.status);
  var d = await r.json();
  if (d.error) throw new Error(d.error);
  return d;
}

// Lista completa del evento: solo para el panel, requiere la clave de organizador
async function fetchPerfilesEvento(eventoId, clave) {
  var r = await fetch("/api/sheets?action=event_profiles&evento=" + encodeURIComponent(eventoId) + "&clave=" + encodeURIComponent(clave || ""));
  if (!r.ok) throw new Error("HTTP " + r.status);
  var d = await r.json();
  if (d.error) throw new Error(d.error);
  var lista = Array.isArray(d) ? d : (d.perfiles || []);
  return lista.map(function(x) { return typeof x === "string" ? JSON.parse(x) : x; })
    .filter(function(p) { return p && p.consentimiento !== false; });
}

// Matches de una persona: el Apps Script calcula con todo el evento y devuelve solo
// sus matches (con contacto) y su mesa (solo nombres). Ver MatchEventos.gs.
async function fetchMisMatches(eventoId, perfil) {
  var r = await fetch("/api/sheets?action=event_matches&evento=" + encodeURIComponent(eventoId) + "&perfil=" + encodeURIComponent(codificarPerfil(perfil)));
  if (!r.ok) throw new Error("HTTP " + r.status);
  var d = await r.json();
  if (d.error) throw new Error(d.error);
  return d;
}

// ─────────────────────────────────────────────
// FEEDBACK: "Ya hablamos", calificación por charla (1 a 5) y NPS del evento (0 a 10)
// Se guarda en la hoja "feedback_eventos". Si alguien cambia de idea, vale lo último.
// ─────────────────────────────────────────────
function postFeedback(eventoId, yo, otro, tipo, valor, comentario) {
  return postToSheets({
    action: "event_feedback",
    evento: eventoId,
    ts: Date.now(),
    de: yo ? claveIdentidad(yo) : "",
    de_nombre: (yo && yo.nombre) || "",
    con: otro ? claveIdentidad(otro) : "",
    con_nombre: (otro && otro.nombre) || "",
    tipo: tipo,
    valor: valor,
    comentario: comentario || "",
  });
}

// Registros de feedback del evento: solo para el panel, requiere la clave de organizador
async function fetchFeedbackEvento(eventoId, clave) {
  var r = await fetch("/api/sheets?action=event_feedback&evento=" + encodeURIComponent(eventoId) + "&clave=" + encodeURIComponent(clave || ""));
  if (!r.ok) throw new Error("HTTP " + r.status);
  var d = await r.json();
  if (d.error) throw new Error(d.error);
  return d.registros || [];
}

// Métricas del evento a partir de los perfiles, los matches calculados y el feedback
function calcularMetricas(perfiles, res, registros) {
  var claveDe = {};
  perfiles.forEach(function(p, i) { claveDe[(res ? res.perfiles[i].id : i)] = claveIdentidad(p); });
  var nombrePorClave = {};
  var nombreDeRegistro = {};
  registros.forEach(function(r) { if (r.de && r.de_nombre) nombreDeRegistro[r.de] = r.de_nombre; if (r.con && r.con_nombre) nombreDeRegistro[r.con] = r.con_nombre; });
  perfiles.forEach(function(p) { nombrePorClave[claveIdentidad(p)] = p.nombre; });
  var nombre = function(c) { return nombrePorClave[c] || nombreDeRegistro[c] || c.split("|")[0]; };
  var par = function(a, b) { return [a, b].sort().join("§"); };

  // Conversaciones: un par cuenta si alguno de los dos dijo "Ya hablamos" (y no lo deshizo)
  var direccion = {};
  registros.forEach(function(r) { if (r.tipo === "hablamos" && r.de && r.con) direccion[r.de + "→" + r.con] = Number(r.valor) === 1; });
  var conversaciones = {};
  Object.keys(direccion).forEach(function(k) {
    var x = k.split("→");
    var inversa = direccion[x[1] + "→" + x[0]];
    if (direccion[k] || inversa) conversaciones[par(x[0], x[1])] = { a: x[0], b: x[1] };
  });

  // Calificaciones de cada charla (de 1 a 5)
  var ratings = registros.filter(function(r) { return r.tipo === "rating" && Number(r.valor) >= 1; });
  var ratingPorPar = {};
  ratings.forEach(function(r) { var k = par(r.de, r.con); (ratingPorPar[k] = ratingPorPar[k] || []).push(Number(r.valor)); });
  var prom = function(xs) { return xs.length ? xs.reduce(function(a, b) { return a + b; }, 0) / xs.length : null; };

  // NPS: % promotores (9-10) menos % detractores (0-6)
  var nps = registros.filter(function(r) { return r.tipo === "nps" && r.valor !== "" && r.valor != null; });
  var promotores = nps.filter(function(r) { return Number(r.valor) >= 9; }).length;
  var detractores = nps.filter(function(r) { return Number(r.valor) <= 6; }).length;

  // Matches recomendados (pares únicos) que se concretaron
  var recomendados = {};
  if (res) res.perfiles.forEach(function(a) {
    res.porPersona[a.id].forEach(function(m) { recomendados[par(claveDe[a.id], claveDe[m.id])] = true; });
  });
  var nRecomendados = Object.keys(recomendados).length;
  var nConcretados = Object.keys(recomendados).filter(function(k) { return conversaciones[k]; }).length;

  var conAlguna = {};
  Object.keys(conversaciones).forEach(function(k) { conAlguna[conversaciones[k].a] = true; conAlguna[conversaciones[k].b] = true; });
  var nAsistentesCon = Object.keys(conAlguna).filter(function(c) { return nombrePorClave[c]; }).length;

  return {
    conversaciones: Object.keys(conversaciones).map(function(k) {
      var c = conversaciones[k];
      return { a: nombre(c.a), b: nombre(c.b), rating: prom(ratingPorPar[k] || []), recomendado: !!recomendados[k] };
    }),
    nRecomendados: nRecomendados,
    nConcretados: nConcretados,
    pctAsistentesCon: perfiles.length ? Math.round(100 * nAsistentesCon / perfiles.length) : 0,
    nAsistentesCon: nAsistentesCon,
    ratingProm: prom(ratings.map(function(r) { return Number(r.valor); })),
    nRatings: ratings.length,
    nps: nps.length ? Math.round(100 * (promotores - detractores) / nps.length) : null,
    nNps: nps.length, promotores: promotores, detractores: detractores, pasivos: nps.length - promotores - detractores,
    comentarios: nps.filter(function(r) { return (r.comentario || "").trim(); }).map(function(r) { return { nombre: r.de_nombre || "Anónimo", valor: Number(r.valor), texto: r.comentario }; }),
  };
}

// Acepta JSON (array de perfiles) o CSV con columnas: nombre,rol,empresa,nivel,ofrece,busca,objetivos,formato,whatsapp,linkedin
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

function exportarCSV(res, nombreArchivo, conMesas) {
  var byId = {};
  res.perfiles.forEach(function(p) { byId[p.id] = p; });
  var filas = [["persona", "match", "porcentaje", "por_que", "rompehielos", "whatsapp_match", "linkedin_match", "email_match"]];
  res.perfiles.forEach(function(a) {
    res.porPersona[a.id].forEach(function(m) {
      var b = byId[m.id];
      filas.push([a.nombre, b.nombre, m.pct + "%", porQueHablar(a, b, m.razones), rompehielos(a, b, m.razones), b.whatsapp || "", b.linkedin || "", b.contacto || ""]);
    });
  });
  if (conMesas !== false) {
    filas.push([]);
    filas.push(["mesa", "tema", "anfitrion", "integrantes"]);
    res.mesas.forEach(function(m, i) {
      filas.push(["Mesa " + (i + 1), SKILL_BY_ID[m.tema].label, byId[m.anfitrion].nombre, m.integrantes.map(function(id) { return byId[id].nombre; }).join(" | ")]);
    });
  }
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
      <BotonesContacto yo={a} otro={b} razones={m.razones} nombreEvento={props.nombreEvento} />
      {props.feedback && <FeedbackMatch {...props.feedback} nombre={primerNombre(b)} />}
    </div>
  );
}

// Debajo de cada match del asistente: "Ya hablamos" y, después, cómo estuvo la charla
function FeedbackMatch(props) {
  if (!props.hablamos) {
    return (
      <div style={{ borderTop: "1px solid " + T.border, paddingTop: 8, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: T.textSub, flex: 1 }}>¿Ya conversaste con {props.nombre}?</span>
        <button onClick={function() { props.onHablamos(true); }} style={Object.assign({}, btnStyle(false), { borderColor: T.green, color: T.green })}>✅ Ya hablamos</button>
      </div>
    );
  }
  return (
    <div style={{ borderTop: "1px solid " + T.border, paddingTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: T.green, fontWeight: 700, flex: 1 }}>✅ Hablaron</span>
        <button onClick={function() { props.onHablamos(false); }} style={Object.assign({}, estiloLinkSutil, { fontSize: 11 })}>deshacer</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: T.textSub }}>¿Qué tal la charla?</span>
        {[1, 2, 3, 4, 5].map(function(n) {
          var on = props.rating >= n;
          return <button key={n} aria-label={n + " de 5"} onClick={function() { props.onRating(n); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 2, color: on ? "#ffd166" : T.textDisabled }}>★</button>;
        })}
        {props.rating > 0 && <span style={{ fontSize: 11, color: T.textMuted }}>¡Gracias!</span>}
      </div>
    </div>
  );
}

// Pregunta general del evento (NPS de 0 a 10) con comentario opcional
function EncuestaEvento(props) {
  var [valor, setValor] = useState(props.valorInicial != null ? props.valorInicial : null);
  var [comentario, setComentario] = useState("");
  var [nombre, setNombre] = useState("");
  var [enviado, setEnviado] = useState(props.valorInicial != null);

  function enviar() {
    if (valor == null) return;
    var yo = props.perfil || (nombre.trim() ? { nombre: nombre.trim() } : null);
    postFeedback(props.eventoId, yo, null, "nps", valor, comentario.trim());
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div style={{ background: T.green + "14", border: "1px solid " + T.green + "44", borderRadius: 12, padding: 12, fontSize: 13, color: T.text, lineHeight: 1.5 }}>
        🙌 ¡Gracias por contarnos cómo te fue en {props.nombreEvento || "el evento"}!
        {props.perfil && <button onClick={function() { setEnviado(false); }} style={Object.assign({}, estiloLinkSutil, { marginLeft: 8, fontSize: 11 })}>cambiar respuesta</button>}
      </div>
    );
  }
  return (
    <div style={{ background: T.violet + "14", border: "1px solid " + T.violet + "55", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, color: T.textWhite, fontWeight: 700 }}>¿Qué tal estuvo {props.nombreEvento || "el evento"}?</div>
      <div style={{ fontSize: 12, color: T.textSub }}>Del 0 al 10, ¿qué tan probable es que recomiendes usar Mentorcito en otro evento?</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gap: 4 }}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(n) {
          var on = valor === n;
          return <button key={n} onClick={function() { setValor(n); }}
            style={{ padding: "8px 0", borderRadius: 8, border: "1px solid " + (on ? T.violet : T.border), background: on ? T.violet : "transparent", color: on ? "white" : T.text, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{n}</button>;
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted }}><span>Nada probable</span><span>Muy probable</span></div>
      {!props.perfil && (
        <input value={nombre} onChange={function(e) { setNombre(e.target.value); }} placeholder="Tu nombre (opcional)"
          style={{ background: "transparent", border: "1px solid " + T.border, borderRadius: 10, color: T.text, padding: "8px 10px", fontSize: 13, outline: "none" }} />
      )}
      <textarea value={comentario} onChange={function(e) { setComentario(e.target.value); }} rows={2} placeholder="¿Algo que quieras contarnos? (opcional)"
        style={{ background: "transparent", border: "1px solid " + T.border, borderRadius: 10, color: T.text, padding: "8px 10px", fontSize: 13 }} />
      <button onClick={enviar} disabled={valor == null} style={Object.assign({}, btnStyle(true), { alignSelf: "flex-start", opacity: valor == null ? 0.5 : 1 })}>Enviar</button>
    </div>
  );
}

// Mensaje que A le manda a B, escrito en primera persona desde A
function mensajeWhatsapp(a, b, razones, nombreEvento) {
  var skills = function(de) {
    return listaNatural(razones.filter(function(r) { return r.tipo === "skill" && r.de === de; }).map(function(r) { return enMinuscula(SKILL_BY_ID[r.skill].label); }));
  };
  var aprendo = skills(b.id), aporto = skills(a.id);
  var motivo = [];
  if (aprendo) motivo.push("me encantaría aprender de vos sobre " + aprendo);
  if (aporto) motivo.push((aprendo ? "y yo te puedo dar una mano con " : "te puedo dar una mano con ") + aporto);
  var porque = motivo.length ? motivo.join(" ") : "creo que tenemos mucho para conversar";
  return "Hola " + primerNombre(b) + "! Soy " + (a.nombre || "") + (a.rol ? " (" + a.rol + ")" : "") + ". Mentorcito nos hizo match en "
    + (nombreEvento || "el evento") + ": " + porque + ". ¿Nos encontramos un rato en el evento? Te cuento dónde estoy 👋";
}

function BotonesContacto(props) {
  var a = props.yo, b = props.otro;
  var wa = limpiarWhatsapp(b.whatsapp);
  var li = urlLinkedin(b.linkedin);
  if (!wa && !li && !b.contacto) {
    return <div style={{ fontSize: 11, color: T.textMuted }}>No dejó contacto: buscalo/a en el evento por su nombre.</div>;
  }
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {wa && (
        <a href={"https://wa.me/" + wa + "?text=" + encodeURIComponent(mensajeWhatsapp(a, b, props.razones, props.nombreEvento))}
          target="_blank" rel="noopener noreferrer"
          style={Object.assign({}, btnStyle(false), { textDecoration: "none", borderColor: "#25D366", color: "#25D366" })}>💬 Escribile por WhatsApp</a>
      )}
      {li && (
        <a href={li} target="_blank" rel="noopener noreferrer"
          style={Object.assign({}, btnStyle(false), { textDecoration: "none", borderColor: "#0a66c2", color: "#5b9ee8" })}>in Ver su LinkedIn</a>
      )}
      {!wa && !li && b.contacto && <div style={{ fontSize: 11, color: T.textMuted }}>Contacto: {b.contacto}</div>}
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
        "@keyframes mc-cinta { from { transform: translateX(0); } to { transform: translateX(-50%); } }",
        ".mc-cinta:hover { animation-play-state: paused !important; }",
        "@media (prefers-reduced-motion: reduce) { .mc-cinta { animation: none !important; } }",
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
  var conMesas = props.conMesas !== false;
  var [texto, setTexto] = useState("");
  var [perfiles, setPerfiles] = useState([]);
  var [error, setError] = useState("");
  var [tab, setTab] = useState("matches");
  var [cargando, setCargando] = useState(false);
  var [manual, setManual] = useState(false); // carga a mano (JSON/CSV), oculta por defecto
  var [registros, setRegistros] = useState([]); // feedback de la hoja feedback_eventos
  var [copiado, setCopiado] = useState(false);

  function cargarDesdeSheets() {
    if (!eventoId) return;
    setCargando(true); setError("");
    fetchFeedbackEvento(eventoId, props.clave).then(setRegistros).catch(function() { setRegistros([]); });
    fetchPerfilesEvento(eventoId, props.clave)
      .then(function(l) { setPerfiles(l); })
      .catch(function(e) { setError("No pude leer los perfiles del evento (" + e.message + "). Podés pegarlos abajo."); })
      .finally(function() { setCargando(false); });
  }

  useEffect(cargarDesdeSheets, [eventoId]);

  function cargarTexto() {
    if (!texto.trim()) { setError("Pegá primero la lista de asistentes."); return; }
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

  var res = perfiles.length >= 2 ? calcularEvento(perfiles, { maxMatches: props.maxMatches, sinMesas: !conMesas }) : null;
  var byId = {};
  if (res) res.perfiles.forEach(function(p) { byId[p.id] = p; });

  var metricas = perfiles.length ? calcularMetricas(perfiles, res, registros) : null;
  var linkEncuesta = window.location.origin + window.location.pathname + "?" + new URLSearchParams({ evento: eventoId || "", encuesta: "1" }).toString();
  var mensajeEncuesta = "¡Gracias por venir a " + (props.nombreEvento || "el evento") + "! 🙌 ¿Nos contás cómo te fue? Son 30 segundos: " + linkEncuesta;
  function copiarEncuesta() {
    try { navigator.clipboard.writeText(mensajeEncuesta).then(function() { setCopiado(true); setTimeout(function() { setCopiado(false); }, 2000); }); } catch (e) {}
  }

  var tabs = [
    { id: "resultados", label: "Resultados" },
    { id: "matches", label: "Matches 1 a 1" },
    { id: "ronda", label: "Ronda de pares" },
    { id: "mesas", label: "Mesas" },
    { id: "sin", label: "Sin match" },
  ].filter(function(t) { return conMesas || t.id !== "mesas"; });

  return (
    <>
    <EstilosBase />
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "20px 16px 40px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: 1 }}>💠 MENTORCITO · PANEL DEL EVENTO</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.textWhite, marginTop: 4 }}>{props.nombreEvento || eventoId || "Evento"}</div>
          <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>
            {perfiles.length} asistentes{res ? " · " + res.pares.length + " pares" + (conMesas ? " · " + res.mesas.length + " mesas" : "") : ""}
          </div>
        </div>

        <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {eventoId && <button onClick={cargarDesdeSheets} style={btnStyle(true)}>{cargando ? "Cargando…" : "↻ Actualizar asistentes"}</button>}
            {res && <button onClick={function() { exportarCSV(res, "matches-" + (eventoId || "evento") + ".csv", conMesas); }} style={btnStyle(false)}>Exportar CSV</button>}
            <button onClick={function() { setManual(!manual); }} style={Object.assign({}, btnStyle(false), { borderColor: "transparent", color: T.textMuted })}>{manual ? "Ocultar carga manual" : "Cargar lista a mano"}</button>
          </div>
          {manual && (
            <>
              <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.5 }}>Para calcular matches con una lista que no viene del chat (por ejemplo, un Excel de inscripción). Pegá un JSON o CSV con columnas nombre, rol, empresa, nivel, ofrece, busca, objetivos, formato, whatsapp, linkedin (listas separadas por |). Reemplaza lo que ves abajo; para volver a los asistentes del evento tocá "Actualizar asistentes".</div>
              <textarea value={texto} onChange={function(e) { setTexto(e.target.value); }} rows={4} placeholder="Pegá acá el JSON o CSV de asistentes…"
                style={{ width: "100%", background: "transparent", border: "1px solid " + T.border, borderRadius: 10, color: T.text, padding: 10, fontSize: 12, fontFamily: "monospace" }} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={cargarTexto} disabled={!texto.trim()} style={Object.assign({}, btnStyle(false), { opacity: texto.trim() ? 1 : 0.5 })}>Calcular con esta lista</button>
                <label style={btnStyle(false)}>Subir archivo<input type="file" accept=".json,.csv,.txt" onChange={cargarArchivo} style={{ display: "none" }} /></label>
              </div>
            </>
          )}
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

            {tab === "resultados" && metricas && <ResultadosEvento m={metricas} sponsor={props.sponsor} nPerfiles={perfiles.length} mensajeEncuesta={mensajeEncuesta} copiado={copiado} onCopiar={copiarEncuesta} />}

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
                    {ms.map(function(m) { return <MatchCard key={m.id} yo={a} otro={byId[m.id]} match={m} nombreEvento={props.nombreEvento} />; })}
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

            {conMesas && tab === "mesas" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
                {res.mesas.map(function(m, i) { return <MesaCard key={i} n={i + 1} mesa={m} byId={byId} />; })}
                {!res.mesas.length && <div style={{ fontSize: 13, color: T.textSub }}>Todavía no hay temas con suficientes personas para armar una mesa (mínimo {MESA_MIN}, con alguien que lo ofrezca).</div>}
              </div>
            )}

            {tab === "sin" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 12, color: T.textSub }}>Personas sin un match 1 a 1 de al menos {MIN_MATCH_PCT}%{conMesas ? " o sin mesa" : ""}. Son buenas candidatas para presentar en persona o para invitar perfiles que les falten.</div>
                {unique(conMesas ? res.sinMatch.concat(res.sinMesa) : res.sinMatch).map(function(id) {
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

function Metrica(props) {
  return (
    <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 14, padding: 14 }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: props.color || T.textWhite }}>{props.valor}</div>
      <div style={{ fontSize: 12, color: T.text, fontWeight: 600, marginTop: 2 }}>{props.titulo}</div>
      {props.detalle && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, lineHeight: 1.4 }}>{props.detalle}</div>}
    </div>
  );
}

// Pestaña "Resultados" del panel: si los matches se hicieron reales y cómo les fue
function ResultadosEvento(props) {
  var m = props.m;
  var estrellas = function(x) { return x == null ? "—" : x.toFixed(1) + " ★"; };
  var npsColor = m.nps == null ? T.textWhite : m.nps >= 30 ? T.green : m.nps >= 0 ? "#ffd166" : T.pink;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
        <Metrica valor={m.conversaciones.length} titulo="Conversaciones confirmadas" detalle={m.nAsistentesCon + " asistentes (" + m.pctAsistentesCon + "%) hablaron con al menos un match"} />
        <Metrica valor={m.nRecomendados ? Math.round(100 * m.nConcretados / m.nRecomendados) + "%" : "—"} titulo="Matches que se concretaron" detalle={m.nConcretados + " de " + m.nRecomendados + " matches recomendados"} />
        <Metrica valor={estrellas(m.ratingProm)} titulo="Satisfacción con las charlas" detalle={m.nRatings + " calificaciones de 1 a 5"} color="#ffd166" />
        <Metrica valor={m.nps == null ? "—" : m.nps} titulo="NPS del evento" color={npsColor}
          detalle={m.nNps ? m.nNps + " respuestas · " + m.promotores + " promotores, " + m.pasivos + " pasivos, " + m.detractores + " detractores" : "Todavía no hay respuestas a la encuesta"} />
      </div>

      {props.sponsor && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <SponsorCinta sponsor={props.sponsor} style={{ borderRadius: 12, border: "1px solid " + T.border }} />
          <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.5 }}>
            {props.nPerfiles} {props.nPerfiles === 1 ? "persona vio" : "personas vieron"} {listaSponsors(props.sponsor).length > 1 ? "los sponsors" : "la marca"} mientras usaban Mentorcito{m.conversaciones.length ? ", y el networking generó " + m.conversaciones.length + (m.conversaciones.length === 1 ? " conversación confirmada" : " conversaciones confirmadas") : ""}.
          </div>
        </div>
      )}

      <div style={{ background: T.violet + "14", border: "1px solid " + T.violet + "44", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 13, color: T.text, fontWeight: 700 }}>📨 Encuesta para después del evento</div>
        <div style={{ fontSize: 12, color: T.textSub, lineHeight: 1.5 }}>Mandá este mensaje al grupo o por mail al día siguiente. Quien hizo el chat en ese celular ve sus matches para marcar con quién habló y calificar cada charla; el resto responde la encuesta igual.</div>
        <div style={{ fontSize: 12, color: T.text, background: T.highlightBg, borderRadius: 8, padding: "8px 10px", wordBreak: "break-word" }}>{props.mensajeEncuesta}</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={props.onCopiar} style={btnStyle(true)}>{props.copiado ? "¡Copiado!" : "Copiar mensaje"}</button>
          <a href={"https://wa.me/?text=" + encodeURIComponent(props.mensajeEncuesta)} target="_blank" rel="noopener noreferrer" style={Object.assign({}, btnStyle(false), { textDecoration: "none", borderColor: "#25D366", color: "#25D366" })}>Compartir por WhatsApp</a>
        </div>
      </div>

      {m.conversaciones.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: 1 }}>CONVERSACIONES</div>
          {m.conversaciones.map(function(c, i) {
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "10px 12px" }}>
                <span style={{ flex: 1, fontSize: 13, color: T.text }}>{c.a} ↔ {c.b}</span>
                {!c.recomendado && <span style={{ fontSize: 10, color: T.textMuted }}>fuera de sus matches actuales</span>}
                <span style={{ fontSize: 12, color: c.rating == null ? T.textMuted : "#ffd166", fontWeight: 700 }}>{c.rating == null ? "sin calificar" : c.rating.toFixed(1) + " ★"}</span>
              </div>
            );
          })}
        </div>
      )}

      {m.comentarios.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: 1 }}>COMENTARIOS</div>
          {m.comentarios.map(function(c, i) {
            return (
              <div key={i} style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>{c.nombre} · {c.valor}/10</div>
                <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{c.texto}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
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

var estiloLinkSutil = { background: "none", border: "none", padding: 0, color: T.textMuted, fontSize: 12, cursor: "pointer", textDecoration: "underline" };

function LinkDiagnostico() {
  return <a href="https://mentorcito.vercel.app/" target="_blank" rel="noopener noreferrer" style={estiloLinkSutil}>¿Buscás un mentor/a? Hacé tu diagnóstico</a>;
}

// ─────────────────────────────────────────────
// COMPARTIR EL EVENTO: QR en pantalla para que alguien al lado lo escanee,
// o el link por WhatsApp / menú de compartir del celular. Es el link del EVENTO
// (no el personal), así cada uno hace su propio perfil.
// ─────────────────────────────────────────────
var QR_LIB_URL = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
var qrLibPromesa = null;
function cargarQrLib() {
  if (window.qrcode) return Promise.resolve(window.qrcode);
  if (!qrLibPromesa) {
    qrLibPromesa = new Promise(function(resolve, reject) {
      var s = document.createElement("script");
      s.src = QR_LIB_URL; s.async = true;
      s.onload = function() { window.qrcode ? resolve(window.qrcode) : reject(new Error("sin qrcode")); };
      s.onerror = function() { qrLibPromesa = null; reject(new Error("no cargó")); };
      document.head.appendChild(s);
    });
  }
  return qrLibPromesa;
}

function linkEvento(eventoId, nombreEvento) {
  var params = new URLSearchParams();
  if (eventoId) params.set("evento", eventoId);
  if (nombreEvento) params.set("nombre", nombreEvento);
  return window.location.origin + window.location.pathname + "?" + params.toString();
}

function CompartirEvento(props) {
  var [abierto, setAbierto] = useState(false);
  var [svg, setSvg] = useState("");
  var [error, setError] = useState(false);
  var [copiado, setCopiado] = useState(false);
  var url = linkEvento(props.eventoId, props.nombreEvento);
  var texto = "Estoy usando Mentorcito en " + (props.nombreEvento || "el evento") + " para saber con quién hablar. Hacé tu perfil y te dice tus matches: " + url;

  useEffect(function() {
    if (!abierto || svg) return;
    cargarQrLib()
      .then(function(qrcode) {
        var qr = qrcode(0, "M"); qr.addData(url); qr.make();
        setSvg(qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true }));
      })
      .catch(function() { setError(true); });
  }, [abierto]);

  function compartir() {
    if (navigator.share) {
      navigator.share({ title: "Mentorcito para eventos", text: texto }).catch(function() {});
    } else {
      window.open("https://wa.me/?text=" + encodeURIComponent(texto), "_blank", "noopener");
    }
  }
  function copiar() {
    try { navigator.clipboard.writeText(url).then(function() { setCopiado(true); setTimeout(function() { setCopiado(false); }, 2000); }); } catch (e) {}
  }

  return (
    <div style={{ background: T.highlightBg, border: "1px solid " + T.border, borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>👥 ¿Alguien de tu grupo también quiere sus matches? Mostrale el QR o mandale el link.</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={function() { setAbierto(!abierto); }} style={btnStyle(!abierto)}>{abierto ? "Ocultar QR" : "Mostrar QR"}</button>
        <button onClick={compartir} style={btnStyle(false)}>Compartir link</button>
      </div>
      {abierto && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "6px 0" }}>
          {svg && <div aria-label="Código QR del evento" role="img" style={{ width: "min(260px, 80vw)", background: "white", borderRadius: 14, padding: 10, boxSizing: "border-box" }} dangerouslySetInnerHTML={{ __html: svg }} />}
          {!svg && !error && <div style={{ fontSize: 12, color: T.textSub }}>Generando QR…</div>}
          {error && <div style={{ fontSize: 12, color: T.textSub }}>No se pudo generar el QR. Usá "Compartir link".</div>}
          <div style={{ fontSize: 12, color: T.textSub, textAlign: "center" }}>Que lo escanee con la cámara del celular</div>
          <button onClick={copiar} style={Object.assign({}, estiloLinkSutil, { wordBreak: "break-all" })}>{copiado ? "¡Link copiado!" : url.replace(/^https?:\/\//, "")}</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// SPONSOR DEL NETWORKING (columnas sponsor, sponsor_logo y sponsor_link de registro_eventos)
// ─────────────────────────────────────────────
// Un link de Google Drive ("drive.google.com/file/d/ID/...") se pasa a uno que sirve como imagen
function urlImagen(u) {
  var s = (u || "").trim();
  var m = s.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/);
  if (m) return "https://lh3.googleusercontent.com/d/" + m[1];
  return s;
}
function urlLink(u) {
  var s = (u || "").trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : "https://" + s;
}

// Varios sponsors: en cada columna, separados por coma y en el mismo orden
// (ej. sponsor "Banco Ejemplo, Café Sur" y sponsor_logo "link1, link2")
function listaSponsors(sp) {
  if (!sp || !sp.nombre) return [];
  var partes = function(v) { return (v || "").split(",").map(function(x) { return x.trim(); }); };
  var logos = partes(sp.logo), links = partes(sp.link);
  return partes(sp.nombre).filter(Boolean).map(function(nombre, i) {
    return { nombre: nombre, logo: logos[i] || "", link: links[i] || "" };
  });
}

function SponsorItem(props) {
  var sp = props.sp;
  var [logoOk, setLogoOk] = useState(true);
  var logo = sp.logo && logoOk ? urlImagen(sp.logo) : "";
  var marca = logo
    ? <img src={logo} alt={sp.nombre} onError={function() { setLogoOk(false); }} style={{ height: 24, maxWidth: 120, objectFit: "contain", background: "white", borderRadius: 6, padding: "2px 6px", display: "block" }} />
    : <span style={{ fontSize: 13, fontWeight: 800, color: T.textWhite, whiteSpace: "nowrap" }}>{sp.nombre}</span>;
  var link = urlLink(sp.link);
  var estilo = { display: "flex", alignItems: "center", padding: "0 18px", textDecoration: "none", flexShrink: 0 };
  return link
    ? <a href={link} target="_blank" rel="noopener noreferrer" style={estilo} tabIndex={props.oculto ? -1 : 0} aria-hidden={props.oculto || undefined}>{marca}</a>
    : <span style={estilo} aria-hidden={props.oculto || undefined}>{marca}</span>;
}

// Cinta al pie: "Presentado por" fijo a la izquierda y los sponsors pasando de derecha a izquierda, sin fin.
// Con "reducir movimiento" activado en el celular, queda quieta.
function SponsorCinta(props) {
  var lista = listaSponsors(props.sponsor);
  if (!lista.length) return null;
  // La mitad de la pista tiene que ser más ancha que la pantalla: se repite la lista hasta tener 6 o más
  var mitad = [];
  while (mitad.length < 6) mitad = mitad.concat(lista);
  var segundos = Math.max(14, mitad.length * 3);
  return (
    <div style={Object.assign({ display: "flex", alignItems: "center", height: 40, overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif", background: T.header, borderTop: "1px solid " + T.border }, props.style || {})}>
      <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: 1, color: T.textMuted, padding: "0 10px 0 12px", textTransform: "uppercase", background: T.header, zIndex: 1, boxShadow: "8px 0 10px " + T.bg }}>Presentado por</span>
      <div style={{ flex: 1, overflow: "hidden", minWidth: 0 }} aria-label={"Sponsors: " + lista.map(function(x) { return x.nombre; }).join(", ")}>
        <div className="mc-cinta" style={{ display: "flex", width: "max-content", animation: "mc-cinta " + segundos + "s linear infinite" }}>
          {mitad.concat(mitad).map(function(sp, k) { return <SponsorItem key={k} sp={sp} oculto={k >= lista.length} />; })}
        </div>
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
  var [datos, setDatos] = useState(null); // null = cargando; { matches, mesa, mi_nps }
  var [recarga, setRecarga] = useState(0);
  var [fb, setFb] = useState({}); // feedback local por match: { [id]: { hablamos, rating } }

  useEffect(function() {
    if (!eventoId) { setDatos({ matches: [], mesa: null }); return; }
    setDatos(null);
    fetchMisMatches(eventoId, perfil)
      .then(function(d) {
        setDatos(d);
        var ini = {};
        (d.matches || []).forEach(function(m) { ini[m.otro.id] = { hablamos: !!m.hablamos, rating: m.mi_rating || 0 }; });
        setFb(ini);
      })
      .catch(function() { setDatos({ matches: [], mesa: null }); });
  }, [eventoId, recarga]);

  function feedbackDe(m) {
    var f = fb[m.otro.id] || { hablamos: false, rating: 0 };
    function set(cambios) { var n = Object.assign({}, fb); n[m.otro.id] = Object.assign({}, f, cambios); setFb(n); }
    return {
      hablamos: f.hablamos, rating: f.rating,
      onHablamos: function(v) { set({ hablamos: v }); postFeedback(eventoId, perfil, m.otro, "hablamos", v ? 1 : 0); },
      onRating: function(n) { set({ rating: n }); postFeedback(eventoId, perfil, m.otro, "rating", n); },
    };
  }
  var algunaCharla = Object.keys(fb).some(function(k) { return fb[k].hablamos; });
  var mostrarEncuesta = datos !== null && (props.encuesta || algunaCharla || (datos && datos.mi_nps != null));

  var yo = Object.assign(normalizarPerfil(perfil, 0), { id: "yo" });
  var matches = (datos && datos.matches) || [];
  var mesa = props.conMesas !== false && datos && datos.mesa;
  var mesaById = {};
  if (mesa) mesa.integrantes.forEach(function(p) { mesaById[p.id] = p; });

  return (
    <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ background: T.highlightBg, borderRadius: 12, padding: 12 }}>
        <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>OFRECÉS</div>
        <div>{yo.ofrece_skills.length ? yo.ofrece_skills.map(function(s) { return <SkillChip key={s} id={s} />; }) : <span style={{ fontSize: 12, color: T.textSub }}>{yo.ofrece.join(", ")}</span>}</div>
        <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 1, margin: "10px 0 4px" }}>BUSCÁS</div>
        <div>{yo.busca_skills.length ? yo.busca_skills.map(function(s) { return <SkillChip key={s} id={s} />; }) : <span style={{ fontSize: 12, color: T.textSub }}>{yo.busca.join(", ")}</span>}</div>
      </div>

      {datos === null && <div style={{ fontSize: 12, color: T.textSub }}>Buscando con quién conectarte…</div>}

      {mostrarEncuesta && props.encuesta && <EncuestaEvento eventoId={eventoId} perfil={perfil} nombreEvento={props.nombreEvento} valorInicial={datos.mi_nps} />}

      {matches.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: 1 }}>TUS MATCHES EN EL EVENTO</div>
          {matches.map(function(m) {
            return <MatchCard key={m.otro.id} yo={yo} otro={m.otro} match={m} nombreEvento={props.nombreEvento} feedback={eventoId ? feedbackDe(m) : null} />;
          })}
        </>
      )}

      {mesa && <MesaCard n={mesa.numero} mesa={{ tema: mesa.tema, anfitrion: mesa.anfitrion, integrantes: mesa.integrantes.map(function(p) { return p.id; }) }} byId={mesaById} />}

      {datos !== null && !matches.length && (
        <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.5 }}>Todavía hay pocas personas registradas para darte un buen match. Volvé con tu link personal más cerca del evento: los matches aparecen solos a medida que se suman asistentes.</div>
      )}

      {mostrarEncuesta && !props.encuesta && <EncuestaEvento eventoId={eventoId} perfil={perfil} nombreEvento={props.nombreEvento} valorInicial={datos.mi_nps} />}

      {datos !== null && (
        <button onClick={function() { setRecarga(recarga + 1); }} style={Object.assign({}, btnStyle(false), { alignSelf: "flex-start" })}>↻ Actualizar matches</button>
      )}

      <LinkPersonal perfil={perfil} eventoId={eventoId} nombreEvento={props.nombreEvento} />

      {eventoId && <CompartirEvento eventoId={eventoId} nombreEvento={props.nombreEvento} />}

      {props.pie || <LinkDiagnostico />}
    </div>
  );
}

function nombreDesdeCodigo(codigo) {
  return (codigo || "").split(/[-_\s]+/).filter(Boolean).map(function(w) {
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(" ");
}

// ─────────────────────────────────────────────
// LINK A LA POLÍTICA DE PRIVACIDAD: abajo a la derecha del chat y al pie de la portada
var URL_PRIVACIDAD = "https://mentorcito.vercel.app/privacidad#eventos";

// PORTADA: /eventos sin ?evento= (no hay a qué evento sumar a la persona)
// ─────────────────────────────────────────────
function PortadaSinEvento(props) {
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
          {props.error && (
            <div style={{ fontSize: 13, color: T.pink, background: T.pink + "14", border: "1px solid " + T.pink + "44", borderRadius: 10, padding: "10px 12px", lineHeight: 1.5 }}>{props.error}</div>
          )}
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
          <a href={URL_PRIVACIDAD} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: T.textMuted }}>Política de privacidad</a>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
function PantallaCargando() {
  return (
    <>
      <EstilosBase />
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        {[0, 1, 2].map(function(i) {
          return <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.primary, animation: "pulse 1.2s ease-in-out infinite", animationDelay: (i * 0.2) + "s" }} />;
        })}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// PANEL CON CLAVE: el organizador entra con &clave= en el link o la escribe acá
// ─────────────────────────────────────────────
function PanelConClave(props) {
  var claveUrl = new URLSearchParams(window.location.search).get("clave") || "";
  var [estado, setEstado] = useState(claveUrl ? "verificando" : "pedir");
  var [clave, setClave] = useState(claveUrl);
  var [error, setError] = useState("");

  function verificar(c) {
    setEstado("verificando"); setError("");
    fetchEventoInfo(props.eventoId, c)
      .then(function(d) {
        if (d.clave_ok) setEstado("ok");
        else { setEstado("pedir"); setError("La clave no es correcta."); }
      })
      .catch(function(e) { setEstado("pedir"); setError("No pude verificar la clave (" + e.message + ")."); });
  }

  useEffect(function() { if (claveUrl) verificar(claveUrl); }, []);

  if (estado === "ok") return <PanelOrganizador eventoId={props.eventoId} nombreEvento={props.nombreEvento} clave={clave.trim()} conMesas={props.conMesas} maxMatches={props.maxMatches} sponsor={props.sponsor} />;
  if (estado === "verificando") return <PantallaCargando />;

  return (
    <>
      <EstilosBase />
      <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ maxWidth: 380, width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: 1 }}>💠 PANEL DEL EVENTO</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.textWhite }}>{props.nombreEvento}</div>
          <div style={{ fontSize: 13, color: T.textSub }}>Ingresá la clave de organizador para ver los asistentes y los matches.</div>
          <input type="password" value={clave} onChange={function(e) { setClave(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter" && clave.trim()) verificar(clave.trim()); }}
            placeholder="Clave"
            style={{ background: T.card, border: "1px solid " + T.borderStrong, borderRadius: 10, color: T.text, padding: "10px 12px", fontSize: 14, outline: "none" }} />
          <button onClick={function() { if (clave.trim()) verificar(clave.trim()); }} style={btnStyle(true)}>Entrar</button>
          {error && <div style={{ fontSize: 12, color: T.pink }}>{error}</div>}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE RAÍZ: valida el código contra el registro de eventos y decide qué mostrar
// ─────────────────────────────────────────────
export default function EventMatchAgent(props) {
  var urlParams = new URLSearchParams(window.location.search);
  var eventoId = (props.eventoId || urlParams.get("evento") || "").trim().toLowerCase();
  var esOrganizador = urlParams.get("organizador") === "1";
  var [info, setInfo] = useState(null); // null = verificando

  useEffect(function() {
    if (!eventoId) return;
    fetchEventoInfo(eventoId)
      .then(function(d) { setInfo(d); })
      .catch(function(e) { setInfo({ error: e.message }); });
  }, [eventoId]);

  if (!eventoId) return <PortadaSinEvento />;
  if (!info) return <PantallaCargando />;
  if (info.error) return <PortadaSinEvento error={"No pudimos verificar el evento. Probá de nuevo en un rato."} />;
  if (!info.found) return <PortadaSinEvento error={"No encontramos ningún evento con el código “" + eventoId + "”. Revisá el link o el código."} />;
  if (!info.activo) return <PortadaSinEvento error={"El evento “" + (info.nombre || eventoId) + "” ya no está activo."} />;

  // Prioridad del nombre: &nombre= del link, el del registro, o uno armado desde el código
  var nombreEvento = props.nombreEvento || urlParams.get("nombre") || info.nombre || nombreDesdeCodigo(eventoId);

  // Columna "mesas" del registro: NO apaga las mesas en todo el evento (vacío = SI)
  var conMesas = info.mesas !== false;
  // Columna "max_matches" del registro: cuántos matches 1 a 1 recibe cada persona (vacío = MAX_MATCHES)
  var maxMatches = Number(info.max_matches) > 0 ? Number(info.max_matches) : MAX_MATCHES;

  // Columnas sponsor del registro: null si el evento no tiene sponsor
  var sponsor = info.sponsor && info.sponsor.nombre ? info.sponsor : null;

  if (esOrganizador) return <PanelConClave eventoId={eventoId} nombreEvento={nombreEvento} conMesas={conMesas} maxMatches={maxMatches} sponsor={sponsor} />;
  return <VistaAsistente eventoId={eventoId} nombreEvento={nombreEvento} conMesas={conMesas} sponsor={sponsor} />;
}

// ─────────────────────────────────────────────
// VISTA DEL ASISTENTE: chat, o sus matches si ya hizo el chat
// ─────────────────────────────────────────────
function VistaAsistente(props) {
  var urlParams = new URLSearchParams(window.location.search);
  var eventoId = props.eventoId;
  var nombreEvento = props.nombreEvento;
  var conMesas = props.conMesas !== false;

  var INITIAL_MSG = {
    role: "assistant",
    content: "Hola, soy Mentorcito 💠\n\n"
      + (nombreEvento ? "Te ayudo a aprovechar " + nombreEvento + " al máximo." : "Te ayudo a aprovechar el evento al máximo.")
      + " Con " + (conMesas ? 6 : 5) + " preguntas rápidas voy a entender qué podés aportar y qué estás buscando, y te digo con quién te conviene conversar" + (conMesas ? " y en qué mesa sentarte" : "") + ".\n\n¿Cómo te llamás?",
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
  // &encuesta=1: el link que se manda después del evento para medir satisfacción
  var [encuesta, setEncuesta] = useState(urlParams.get("encuesta") === "1");
  var bottomRef = useRef(null);
  var systemPrompt = useRef(buildSystemPrompt(nombreEvento, conMesas)).current;

  useEffect(function() {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);


  if (perfilGuardado) {
    return (
      <>
        <EstilosBase />
        <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "20px 16px " + (props.sponsor ? 88 : 40) + "px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: 1 }}>💠 MENTORCITO · {(nombreEvento || "EVENTO").toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.textWhite, marginTop: 4 }}>Hola de nuevo, {primerNombre(perfilGuardado)} 👋</div>
            <ResultadoAsistente perfil={perfilGuardado} eventoId={eventoId} nombreEvento={nombreEvento} conMesas={conMesas} sponsor={props.sponsor} encuesta={encuesta} pie={
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 6 }}>
                <button onClick={function() {
                  borrarPerfilLocal(eventoId);
                  window.history.replaceState(null, "", window.location.pathname + "?" + new URLSearchParams({ evento: eventoId }).toString());
                  setPerfilGuardado(null);
                }} style={estiloLinkSutil}>No soy {primerNombre(perfilGuardado)} / hacer el chat de nuevo</button>
                <LinkDiagnostico />
              </div>
            } />
          </div>
        </div>
        {props.sponsor && <SponsorCinta sponsor={props.sponsor} style={{ position: "fixed", left: 0, right: 0, bottom: 0, paddingBottom: "env(safe-area-inset-bottom)", boxSizing: "content-box" }} />}
      </>
    );
  }

  // Encuesta sin perfil en este navegador: se responde igual (anónima o con nombre)
  if (encuesta) {
    return (
      <>
        <EstilosBase />
        <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "20px 16px 40px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 11, color: T.primary, fontWeight: 700, letterSpacing: 1 }}>💠 MENTORCITO · {(nombreEvento || "EVENTO").toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.textWhite }}>¡Gracias por venir! 🙌</div>
            <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.5 }}>Si hiciste el chat de Mentorcito, abrí tu link personal para marcar con quién hablaste y calificar cada charla.</div>
            <EncuestaEvento eventoId={eventoId} perfil={null} nombreEvento={nombreEvento} />
            <button onClick={function() { setEncuesta(false); }} style={Object.assign({}, estiloLinkSutil, { alignSelf: "flex-start" })}>No hice el chat: quiero ver con quién conectar</button>
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
                  {esBot && perfil && i === messages.length - 1 && !loading && <ResultadoAsistente perfil={perfil} eventoId={eventoId} nombreEvento={nombreEvento} conMesas={conMesas} sponsor={props.sponsor} />}
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
          <div style={{ textAlign: "right", marginTop: 6 }}>
            <a href={URL_PRIVACIDAD} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: T.textMuted }}>Política de privacidad</a>
          </div>
        </div>
        <SponsorCinta sponsor={props.sponsor} style={{ flexShrink: 0 }} />
      </div>
    </>
  );
}

// Exportadas para tests o para usarlas desde otro componente
export { calcularMetricas, claveIdentidad, limpiarWhatsapp, calcularEvento, scorePar, normalizarPerfil, parsearPerfiles, porQueHablar, rompehielos, buildSystemPrompt };
