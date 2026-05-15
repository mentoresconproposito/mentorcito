// v3.0 — loop profesional rebuild 2026
import { useState, useEffect } from "react";
var DASHBOARD_VERSION = "3.0.0";

// ── Paleta ────────────────────────────────────────────────────────────────────
var BG   = "#080b14";
var CARD = "rgba(255,255,255,0.03)";
var BORDER = "rgba(255,255,255,0.07)";
var PRIMARY = "#4361ee";
var ACCENT  = "#f72585";
var GREEN   = "#06d6a0";
var AMBER   = "#fb8500";
var PURPLE  = "#7b2ff7";

var MENTOR_NAMES = {
  GustavoLoustalet: "Gustavo Loustalet",
  FranciscoSantolo: "Francisco Santolo",
  MarinaRamirez:    "Marina Ramirez",
  MichelHauzeur:    "Michel Hauzeur",
  MartinGiorgetti:  "Martín Giorgetti",
  AnaMarcuse:       "Ana Marcuse",
  NataliaJimenez:   "Natalia Jiménez",
  LuciaCostilla:    "Lucía Costilla",
  JimenaSosa:       "Jimena Sosa",
  NicolasMusa:      "Nicolas Musa",
};

var BUSCADOS_NAMES = {
  buscado_cto_fraccionado: "CTO Fraccionado",
  buscado_ux_research:     "UX Researcher",
  buscado_ventas_b2b:      "Sales B2B",
  buscado_fundraising:     "Fundraising",
  buscado_growth_plg:      "Growth / PLG",
};

// ── Seed data para demo ───────────────────────────────────────────────────────
var SEED = [
  { ts: Date.now() - 86400000*6, gaps: ["no tengo sistema de producto", "me cuesta priorizar"], nivel_actual: {tech:3,producto:5,negocio:4}, nivel_objetivo: {tech:5,producto:8,negocio:6}, mentores_ids: ["MarinaRamirez","MichelHauzeur"], tiene_match: true, mentor_buscado_id: null, tiene_prototipo: false, vio_paquete: true, abrio_formulario: true, envio_wa: true, opcion: "A" },
  { ts: Date.now() - 86400000*5, gaps: ["no entiendo las conversaciones técnicas", "no puedo evaluar estimaciones"], nivel_actual: {tech:2,producto:6,negocio:5}, nivel_objetivo: {tech:6,producto:8,negocio:6}, mentores_ids: ["AnaMarcuse"], tiene_match: true, mentor_buscado_id: null, tiene_prototipo: false, vio_paquete: true, abrio_formulario: true, envio_wa: false, opcion: "B" },
  { ts: Date.now() - 86400000*5, gaps: ["no sé si tengo PMF", "no crece"], nivel_actual: {tech:4,producto:4,negocio:3}, nivel_objetivo: {tech:6,producto:7,negocio:7}, mentores_ids: ["MartinGiorgetti","FranciscoSantolo"], tiene_match: true, mentor_buscado_id: null, tiene_prototipo: false, vio_paquete: true, abrio_formulario: false, envio_wa: false, opcion: null },
  { ts: Date.now() - 86400000*4, gaps: ["no sé vender mi producto", "necesito estructura de ventas"], nivel_actual: {tech:5,producto:6,negocio:2}, nivel_objetivo: {tech:6,producto:7,negocio:7}, mentores_ids: [], tiene_match: false, mentor_buscado_id: "buscado_ventas_b2b", tiene_prototipo: false, vio_paquete: false, abrio_formulario: false, envio_wa: true, opcion: null },
  { ts: Date.now() - 86400000*4, gaps: ["quiero levantar capital", "no entiendo term sheets"], nivel_actual: {tech:4,producto:5,negocio:3}, nivel_objetivo: {tech:5,producto:6,negocio:8}, mentores_ids: [], tiene_match: false, mentor_buscado_id: "buscado_fundraising", tiene_prototipo: false, vio_paquete: false, abrio_formulario: false, envio_wa: false, opcion: null },
  { ts: Date.now() - 86400000*3, gaps: ["las decisiones son opiniones no datos", "dependo 100% del equipo de data"], nivel_actual: {tech:3,producto:6,negocio:5}, nivel_objetivo: {tech:7,producto:8,negocio:6}, mentores_ids: ["JimenaSosa","NicolasMusa"], tiene_match: true, mentor_buscado_id: null, tiene_prototipo: false, vio_paquete: true, abrio_formulario: true, envio_wa: true, opcion: "A" },
  { ts: Date.now() - 86400000*3, gaps: ["no puedo avanzar sin tech", "quiero prototipar mis ideas"], nivel_actual: {tech:2,producto:5,negocio:4}, nivel_objetivo: {tech:6,producto:7,negocio:5}, mentores_ids: ["NicolasMusa"], tiene_match: true, mentor_buscado_id: null, tiene_prototipo: false, vio_paquete: true, abrio_formulario: false, envio_wa: false, opcion: null },
  { ts: Date.now() - 86400000*2, gaps: ["no sé elegir stack", "no puedo evaluar devs"], nivel_actual: {tech:1,producto:4,negocio:5}, nivel_objetivo: {tech:6,producto:6,negocio:7}, mentores_ids: [], tiene_match: false, mentor_buscado_id: "buscado_cto_fraccionado", tiene_prototipo: false, vio_paquete: false, abrio_formulario: false, envio_wa: true, opcion: null },
  { ts: Date.now() - 86400000*2, gaps: ["mi discovery es superficial", "no sé hacer entrevistas útiles"], nivel_actual: {tech:4,producto:4,negocio:4}, nivel_objetivo: {tech:5,producto:8,negocio:5}, mentores_ids: [], tiene_match: false, mentor_buscado_id: "buscado_ux_research", tiene_prototipo: false, vio_paquete: false, abrio_formulario: false, envio_wa: false, opcion: null },
  { ts: Date.now() - 86400000*1, gaps: ["no tengo criterio propio", "liderazgo sin autoridad formal"], nivel_actual: {tech:4,producto:6,negocio:5}, nivel_objetivo: {tech:5,producto:9,negocio:8}, mentores_ids: ["NataliaJimenez"], tiene_match: true, mentor_buscado_id: null, tiene_prototipo: false, vio_paquete: true, abrio_formulario: true, envio_wa: true, opcion: "B" },
  { ts: Date.now() - 86400000*1, gaps: ["quiero ser mentor pero no sé por dónde empezar"], nivel_actual: {tech:5,producto:7,negocio:6}, nivel_objetivo: {tech:6,producto:9,negocio:8}, mentores_ids: ["GustavoLoustalet"], tiene_match: true, mentor_buscado_id: null, tiene_prototipo: false, vio_paquete: true, abrio_formulario: true, envio_wa: false, opcion: "A" },
  { ts: Date.now() - 3600000*8, gaps: ["no tengo visión de producto", "no sé medir impacto"], nivel_actual: {tech:4,producto:5,negocio:4}, nivel_objetivo: {tech:5,producto:8,negocio:7}, mentores_ids: ["MichelHauzeur","MartinGiorgetti"], tiene_match: true, mentor_buscado_id: null, tiene_prototipo: false, vio_paquete: true, abrio_formulario: true, envio_wa: true, opcion: "A" },
  { ts: Date.now() - 3600000*4, gaps: ["no sé diseñar un onboarding", "mi churn es alto"], nivel_actual: {tech:4,producto:5,negocio:5}, nivel_objetivo: {tech:5,producto:8,negocio:8}, mentores_ids: [], tiene_match: false, mentor_buscado_id: "buscado_growth_plg", tiene_prototipo: false, vio_paquete: false, abrio_formulario: false, envio_wa: true, opcion: null },
  { ts: Date.now() - 3600000*2, gaps: ["quiero entrar al mundo del producto", "no sé armar mi portfolio"], nivel_actual: {tech:5,producto:2,negocio:3}, nivel_objetivo: {tech:6,producto:7,negocio:5}, mentores_ids: ["LuciaCostilla"], tiene_match: true, mentor_buscado_id: null, tiene_prototipo: false, vio_paquete: true, abrio_formulario: false, envio_wa: false, opcion: null },
  { ts: Date.now() - 3600000*1, gaps: ["no sé cómo validar sin gastar todo el presupuesto", "no entiendo a mi cliente"], nivel_actual: {tech:3,producto:4,negocio:3}, nivel_objetivo: {tech:4,producto:7,negocio:7}, mentores_ids: ["MartinGiorgetti"], tiene_match: true, mentor_buscado_id: null, tiene_prototipo: false, vio_paquete: true, abrio_formulario: true, envio_wa: true, opcion: "B" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  var diff = Date.now() - ts;
  var m = Math.floor(diff / 60000);
  if (m < 60) return m + "m";
  var h = Math.floor(m / 60);
  if (h < 24) return h + "h";
  return Math.floor(h / 24) + "d";
}

function avg(arr) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce(function(s, v) { return s + v; }, 0) / arr.length * 10) / 10;
}

// ── Mini bar ─────────────────────────────────────────────────────────────────
function Bar(props) {
  var pct = Math.min(100, Math.round((props.value / props.max) * 100));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <div style={{ width: props.labelWidth || 140, color: "rgba(255,255,255,0.65)", fontSize: 12, flexShrink: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{props.label}</div>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: pct + "%", background: props.color || PRIMARY, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
      <div style={{ width: 28, textAlign: "right", color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "monospace", flexShrink: 0 }}>{props.value}</div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function Stat(props) {
  return (
    <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, borderRadius: "0 14px 0 60px", background: props.color + "12" }} />
      <div style={{ fontSize: 22, marginBottom: 8 }}>{props.icon}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "white", lineHeight: 1, marginBottom: 4 }}>{props.value}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{props.label}</div>
      {props.sub && <div style={{ fontSize: 11, color: props.color, fontWeight: 600, marginTop: 6 }}>{props.sub}</div>}
    </div>
  );
}

// ── Radar mini ─────────────────────────────────────────────────────────────────
function RadarMini(props) {
  var data = props.data;
  var W = 120, cx = 60, cy = 60, R = 38;
  var keys = ["tech", "producto", "negocio"];

  function pt(idx, val) {
    var angle = (Math.PI * 2 * idx / 3) - Math.PI / 2;
    var r = ((val || 0) / 10) * R;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function poly(vals) {
    return keys.map(function(k, i) {
      var p = pt(i, vals[k] || 0);
      return p.x + "," + p.y;
    }).join(" ");
  }

  return (
    <svg width={W} height={W} viewBox={"0 0 " + W + " " + W}>
      {[3, 6, 10].map(function(g) {
        return <polygon key={g} points={poly({tech:g,producto:g,negocio:g})} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />;
      })}
      <polygon points={poly(data.obj)} fill="rgba(247,37,133,0.12)" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="3,2" />
      <polygon points={poly(data.act)} fill="rgba(67,97,238,0.2)" stroke={PRIMARY} strokeWidth="1.5" />
      <text x="60" y="16" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">📦</text>
      <text x="18" y="88" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">🔧</text>
      <text x="102" y="88" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">💼</text>
    </svg>
  );
}

// ── Google Sheets URL ──────────────────────────────────────────────────────────
var SHEETS_URL = "https://script.google.com/macros/s/AKfycbzzBE8YngAYyH1PsLYKScZ0_V5Xkl7BdK-uHIr-oUFxB5QoerbZeMyEFc4tdjBIdIJcpQ/exec";

// ── Compute stats from seed records (fallback) ────────────────────────────────
function buildStatsFromSeed(records) {
  var total = records.length;
  if (!total) return null;
  var matches   = records.filter(function(r){ return r.tiene_match; });
  var noMatches = records.filter(function(r){ return !r.tiene_match; });
  var gapCount = {}, mentorCount = {}, buscadoCount = {};
  records.forEach(function(r) {
    (r.gaps||[]).forEach(function(g){ gapCount[g]=(gapCount[g]||0)+1; });
    (r.mentores_ids||[]).forEach(function(id){ mentorCount[id]=(mentorCount[id]||0)+1; });
  });
  noMatches.forEach(function(r){ var k=r.mentor_buscado_id||"prototipo_custom"; buscadoCount[k]=(buscadoCount[k]||0)+1; });
  function af(key,sub){ return Math.round(records.reduce(function(s,r){return s+((r[key]||{})[sub]||0);},0)/total*10)/10; }
  return {
    total: total, match_count: matches.length, no_match_count: noMatches.length,
    avg_actual:   {tech:af("nivel_actual","tech"),   producto:af("nivel_actual","producto"),   negocio:af("nivel_actual","negocio")},
    avg_objetivo: {tech:af("nivel_objetivo","tech"), producto:af("nivel_objetivo","producto"), negocio:af("nivel_objetivo","negocio")},
    top_gaps:     Object.entries(gapCount).sort(function(a,b){return b[1]-a[1];}).slice(0,8),
    top_mentores: Object.entries(mentorCount).sort(function(a,b){return b[1]-a[1];}),
    buscado_count:Object.entries(buscadoCount).sort(function(a,b){return b[1]-a[1];}),
    funnel: {
      diagnostico:total, con_match:matches.length,
      vio_paquete:records.filter(function(r){return r.vio_paquete;}).length,
      abrio_formulario:records.filter(function(r){return r.abrio_formulario;}).length,
      envio_wa:records.filter(function(r){return r.envio_wa;}).length,
      opcion_a:records.filter(function(r){return r.opcion==="A";}).length,
      opcion_b:records.filter(function(r){return r.opcion==="B";}).length,
    },
    estados: buildEstadosFromRecords(records),
    recent: records.slice().sort(function(a,b){return b.ts-a.ts;}).slice(0,30),
  };
}

// ── Loop profesional ──────────────────────────────────────────
var LOOP_META = {
  "Reinvención": {
    icono: "🔀", color: "#f72585", orden: 1,
    descripcion: "Entrada a producto o salida hacia un nuevo ciclo. Founder, Advisor, Mentor, nueva industria. Alta energía, alta incertidumbre.",
    pregunta: "¿Qué está cambiando en tu carrera?",
    señales: ["transición","cambiar","emprender","freelance","consultor","mentor","advisor","founder","nuevo rol","entrar a producto","primer trabajo"],
    mentores: ["Primeros pasos → Lucía Costilla","PMF y validación → Martín Giorgetti","De profesional a Mentor → Gustavo Loustalet","Estrategia de negocio → Francisco Santolo"],
    seniority_tipico: "Junior entrante o Senior saliente",
  },
  "Estancamiento": {
    icono: "🔁", color: "#fb8500", orden: 2,
    descripcion: "Zona de confort que se volvió trampa. El profesional domina su rol pero no crece. Muy frecuente en PMs de 2–5 años.",
    pregunta: "¿Qué te tiene bloqueado?",
    señales: ["bloqueado","reactivo","caos","sin sistema","frustr","mismo rol","no avanzo","sin dirección","agotad","automatico","años haciendo lo mismo"],
    mentores: ["Sistema de producto → Marina Ramirez","Estrategia y visión → Michel Hauzeur","Criterio propio → Natalia Jiménez","Data-driven → Jimena Sosa"],
    seniority_tipico: "Mid (2–5 años)",
  },
  "Liderazgo": {
    icono: "📈", color: "#4361ee", orden: 3,
    descripcion: "Transición de hacer a liderar. El desafío ya no es técnico sino humano y estratégico. Antesala de la próxima Reinvención.",
    pregunta: "¿Cómo escalás tu impacto?",
    señales: ["liderar","liderazgo","equipo","sin autoridad","manager","director","head","estrategia","escalar","gestionar personas","ascender"],
    mentores: ["Liderazgo sistémico → Natalia Jiménez","Pensamiento estratégico → Michel Hauzeur","Puente técnico → Ana Marcuse","Tech builder → Nicolas Musa"],
    seniority_tipico: "Senior (5+ años)",
  },
};

function normalizarEstado(e) {
  if (!e) return null;
  if (e.indexOf("Reinven") !== -1) return "Reinvención";
  if (e.indexOf("Liderazgo") !== -1 || e.indexOf("Transici") !== -1) return "Liderazgo";
  if (e.indexOf("Estanc") !== -1) return "Estancamiento";
  return null;
}

function clasificarEstadoFront(r) {
  var gaps = (r.gaps || []).join(" ").toLowerCase();
  var nAct = r.nivel_actual  || {};
  var nObj = r.nivel_objetivo || {};
  var avg  = ((nAct.tech||0)+(nAct.producto||0)+(nAct.negocio||0)) / 3;
  var gapT = ((nObj.tech||0)-(nAct.tech||0))+((nObj.producto||0)-(nAct.producto||0))+((nObj.negocio||0)-(nAct.negocio||0));
  var sR = LOOP_META["Reinvención"].señales.filter(function(k){return gaps.indexOf(k)!==-1;}).length;
  var sE = LOOP_META["Estancamiento"].señales.filter(function(k){return gaps.indexOf(k)!==-1;}).length;
  var sL = LOOP_META["Liderazgo"].señales.filter(function(k){return gaps.indexOf(k)!==-1;}).length;
  if (avg >= 7 && (nObj.negocio||0) >= 8) return "Reinvención";
  if (avg <= 3) return "Reinvención";
  if (sR >= sE && sR >= sL && sR > 0) return "Reinvención";
  if (sL > sE && sL > 0) return "Liderazgo";
  if (sE > 0 || (gapT >= 5 && avg >= 4 && avg <= 7)) return "Estancamiento";
  return "Estancamiento";
}

function calcularUrgenciaFront(r) {
  var nAct = r.nivel_actual  || {};
  var nObj = r.nivel_objetivo || {};
  var gap  = ((nObj.tech||0)-(nAct.tech||0))+((nObj.producto||0)-(nAct.producto||0))+((nObj.negocio||0)-(nAct.negocio||0));
  var gaps = (r.gaps||[]).join(" ").toLowerCase();
  var score = ["urgente","ya","ahora","estancado","años","perdiendo","crisis","burnout","renunci","salir"].filter(function(k){return gaps.indexOf(k)!==-1;}).length;
  if (gap>=12||(gap>=8&&score>=2)) return "Alta";
  if (gap>=6||score>=1) return "Media";
  return "Baja";
}

function inferirSeniorityFront(r) {
  var nAct = r.nivel_actual || {};
  var avg  = ((nAct.tech||0)+(nAct.producto||0)+(nAct.negocio||0)) / 3;
  var gaps = (r.gaps||[]).join(" ").toLowerCase();
  var j = ["primer","empezar","entrar","recién","junior"].filter(function(k){return gaps.indexOf(k)!==-1;}).length;
  var s = ["head","director","vp","cto","cpo","ceo","founder","equipo a cargo","senior"].filter(function(k){return gaps.indexOf(k)!==-1;}).length;
  if (s>=1||avg>=7) return "Senior";
  if (j>=1||avg<=3) return "Junior";
  return "Mid";
}

function buildEstadosFromRecords(records) {
  var ESTADOS = ["Reinvención","Estancamiento","Liderazgo"];
  var dist = {"Reinvención":0,"Estancamiento":0,"Liderazgo":0};
  var urg  = {"Alta":0,"Media":0,"Baja":0};
  var sen  = {"Junior":0,"Mid":0,"Senior":0};
  var gapsByE = {"Reinvención":{},"Estancamiento":{},"Liderazgo":{}};
  var total = records.length;
  records.forEach(function(r) {
    var e = normalizarEstado(r.estado) || clasificarEstadoFront(r);
    var u = r.urgencia  || calcularUrgenciaFront(r);
    var s = r.seniority || inferirSeniorityFront(r);
    if (dist[e]!==undefined) dist[e]++;
    if (urg[u] !==undefined) urg[u]++;
    if (sen[s] !==undefined) sen[s]++;
    if (gapsByE[e]) (r.gaps||[]).forEach(function(g){ if(g) gapsByE[e][g]=(gapsByE[e][g]||0)+1; });
  });
  var gapsByETop = {};
  ESTADOS.forEach(function(e) {
    gapsByETop[e] = Object.entries(gapsByE[e]||{}).sort(function(a,b){return b[1]-a[1];}).slice(0,5);
  });
  var oportunidades = ESTADOS.map(function(e) {
    var m = LOOP_META[e];
    return { estado:e, icono:m.icono, color:m.color, count:dist[e], pct:total?Math.round(dist[e]/total*100):0,
             top_gaps:gapsByETop[e].map(function(g){return g[0];}), mentorias:m.mentores,
             descripcion:m.descripcion, pregunta:m.pregunta, seniority_tipico:m.seniority_tipico };
  });
  return { distribucion:dist, urgencia:urg, seniority:sen, gaps_by_estado:gapsByETop, oportunidades:oportunidades };
}

// ── Main dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  var [stats, setStats] = useState(null);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState(null);
  var [tab, setTab] = useState("overview");
  var [lastRefresh, setLastRefresh] = useState(null);

  async function fetchStats() {
    setLoading(true);
    async function doFetch() {
      var res = await fetch(SHEETS_URL + "?action=stats");
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    }
    try {
      var data = await doFetch();
      setStats(data);
      setError(null);
      setLastRefresh(new Date());
    } catch(e) {
      try {
        await new Promise(function(r){ setTimeout(r, 2000); });
        var data2 = await doFetch();
        setStats(data2);
        setError(null);
        setLastRefresh(new Date());
      } catch(e2) {
        setStats(buildStatsFromSeed(SEED));
        setError("Sin conexión con Google Sheets — mostrando datos de demo.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(function() {
    fetchStats();
    var iv = setInterval(fetchStats, 60000);
    return function(){ clearInterval(iv); };
  }, []);

  if (loading && !stats) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Cargando datos...</div>
      </div>
    );
  }

  if (!stats) return null;

  // ── Extraer métricas del objeto stats ────────────────────────────────────────
  var total      = stats.total || 0;
  var matchCount = stats.match_count || 0;
  var matchRate  = total ? Math.round(matchCount / total * 100) : 0;
  var topGaps    = stats.top_gaps    || [];
  var topMentores= stats.top_mentores|| [];
  var topBuscados= stats.buscado_count || [];
  var avgActual  = stats.avg_actual  || {tech:0,producto:0,negocio:0};
  var avgObjetivo= stats.avg_objetivo|| {tech:0,producto:0,negocio:0};
  var funnel     = stats.funnel      || {};
  var estadosRaw = stats.estados     || buildEstadosFromRecords(records);

  // Normalizar claves del servidor (nombres viejos → nombres nuevos del loop)
  function normalizeDistribucion(dist) {
    var out = {"Reinvención":0,"Estancamiento":0,"Liderazgo":0};
    Object.keys(dist||{}).forEach(function(k) {
      var n = normalizarEstado(k) || k;
      if (out[n] !== undefined) out[n] += dist[k];
    });
    return out;
  }
  function normalizeOportunidades(ops) {
    if (!ops) return [];
    return ops.map(function(op) {
      var estado = normalizarEstado(op.estado) || op.estado;
      var m = LOOP_META[estado] || {};
      return Object.assign({}, op, {
        estado: estado,
        icono: m.icono || op.icono,
        color: m.color || op.color,
        descripcion: m.descripcion || op.descripcion,
        seniority_tipico: m.seniority_tipico || op.seniority_tipico || "",
        mentorias: m.mentores || op.mentorias || [],
      });
    }).filter(function(op, i, arr) {
      // Deduplicar por estado normalizado
      return arr.findIndex(function(o){ return o.estado === op.estado; }) === i;
    });
  }

  var estados = {
    distribucion:   normalizeDistribucion(estadosRaw.distribucion),
    urgencia:       estadosRaw.urgencia || {},
    seniority:      estadosRaw.seniority || {},
    gaps_by_estado: estadosRaw.gaps_by_estado || {},
    oportunidades:  normalizeOportunidades(estadosRaw.oportunidades),
  };
  var records    = stats.recent      || [];
  var opcionA    = funnel.opcion_a   || 0;
  var opcionB    = funnel.opcion_b   || 0;

  var hoy    = records.filter(function(r){ return Date.now()-r.ts < 86400000; }).length;
  var semana = records.filter(function(r){ return Date.now()-r.ts < 604800000; }).length;

  var funnelSteps = [
    { key: "diagnostico",      label: "Diagnóstico generado",     count: funnel.diagnostico      || total,       color: PRIMARY,   icon: "🧭" },
    { key: "con_match",        label: "Con mentor matcheado",     count: funnel.con_match        || matchCount,  color: "#3a86ff", icon: "✅" },
    { key: "vio_paquete",      label: "Vió el insight + score",   count: funnel.vio_paquete      || 0,           color: PURPLE,    icon: "💡" },
    { key: "abrio_formulario", label: "Eligió plan o paquete",    count: funnel.abrio_formulario || 0,           color: AMBER,     icon: "🗺️" },
    { key: "envio_wa",         label: "Inició conversación WA",   count: funnel.envio_wa         || 0,           color: "#25D366", icon: "💬" },
  ];

  function dropoff(from, to) { return from ? Math.round((1 - to/from) * 100) : 0; }

  var tabStyle = function(t) {
    return {
      padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
      cursor: "pointer", border: "none",
      background: tab === t ? PRIMARY : "transparent",
      color: tab === t ? "white" : "rgba(255,255,255,0.45)",
      transition: "all 0.15s",
    };
  };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.88)", paddingBottom: 60 }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(67,97,238,0.3); border-radius: 2px; } @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } } .card { animation: fadeUp 0.4s ease forwards; }"}</style>

      {/* Error banner */}
      {error && (
        <div style={{ padding: "10px 28px", background: "rgba(251,133,0,0.1)", borderBottom: "1px solid rgba(251,133,0,0.25)", color: AMBER, fontSize: 12, fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "14px 16px", borderBottom: "1px solid " + BORDER, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, position: "sticky", top: 0, background: "rgba(8,11,20,0.97)", backdropFilter: "blur(12px)", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>📊</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>Mentorcito Analytics — Estados</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              {lastRefresh ? "Actualizado " + lastRefresh.toLocaleTimeString("es-AR") : "Dashboard de demanda del Marketplace"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={fetchStats} disabled={loading}
            style={{ padding: "6px 14px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 12, cursor: loading ? "not-allowed" : "pointer", fontWeight: 600 }}>
            {loading ? "..." : "↻ Actualizar"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, boxShadow: "0 0 6px " + GREEN }} />
            <span style={{ fontSize: 11, color: GREEN, fontWeight: 600 }}>{total} diagnósticos</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: "8px 12px", display: "flex", gap: 4, overflowX: "auto", WebkitOverflowScrolling: "touch", borderBottom: "1px solid " + BORDER, background: "rgba(255,255,255,0.01)" }}>
        {[
          { key: "overview",  label: "📈 Overview" },
          { key: "estados",   label: "🧠 Estados" },
          { key: "problemas", label: "🗣️ Problemas" },
          { key: "demanda",   label: "🔍 Demanda insatisfecha" },
          { key: "mentores",  label: "👥 Performance mentores" },
          { key: "funnel",    label: "🎯 Funnel de conversión" },
          { key: "feed",      label: "📋 Feed de diagnósticos" },
        ].map(function(t) {
          return <button key={t.key} onClick={function(){ setTab(t.key); }} style={tabStyle(t.key)}>{t.label}</button>;
        })}
      </div>

      <div style={{ padding: "16px 12px" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
              <div className="card"><Stat icon="🧭" value={total} label="Diagnósticos totales" sub={"+" + hoy + " hoy · +" + semana + " esta semana"} color={PRIMARY} /></div>
              <div className="card"><Stat icon="✅" value={matchRate + "%"} label="Tasa de match" sub={matchCount + " con mentor asignado"} color={GREEN} /></div>
              <div className="card"><Stat icon="❌" value={stats.no_match_count} label="Sin match" sub={"Demanda insatisfecha"} color={ACCENT} /></div>
              <div className="card"><Stat icon="🔥" value={topGaps[0] ? topGaps[0][1] : 0} label="Gap más frecuente" sub={topGaps[0] ? topGaps[0][0].slice(0,32) + "..." : "-"} color={AMBER} /></div>
            </div>

            {/* Radar promedio + gaps */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 12 }}>

              {/* Radar poblacional */}
              <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Perfil promedio de los mentees</div>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <RadarMini data={{ act: avgActual, obj: avgObjetivo }} />
                  <div style={{ flex: 1 }}>
                    {["tech", "producto", "negocio"].map(function(k) {
                      var labels = { tech: "🔧 Tech", producto: "📦 Producto", negocio: "💼 Negocio" };
                      var gap = avgObjetivo[k] - avgActual[k];
                      return (
                        <div key={k} style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{labels[k]}</span>
                            <span style={{ fontSize: 11, color: ACCENT, fontFamily: "monospace" }}>{avgActual[k]} → {avgObjetivo[k]} (+{gap.toFixed(1)})</span>
                          </div>
                          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, position: "relative" }}>
                            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: (avgActual[k]*10)+"%", background: PRIMARY, borderRadius: 2 }} />
                            <div style={{ position: "absolute", left: (avgActual[k]*10)+"%", top: 0, height: "100%", width: (gap*10)+"%", background: "rgba(247,37,133,0.5)", borderRadius: 2 }} />
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ marginTop: 12, padding: "8px 10px", borderRadius: 8, background: "rgba(247,37,133,0.08)", border: "1px solid rgba(247,37,133,0.2)" }}>
                      <div style={{ fontSize: 10, color: ACCENT, fontWeight: 700, marginBottom: 2 }}>GAP MÁS GRANDE</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                        {["tech","producto","negocio"].reduce(function(prev, k) {
                          return (avgObjetivo[k]-avgActual[k]) > (avgObjetivo[prev]-avgActual[prev]) ? k : prev;
                        })} — necesita +{Math.max(
                          avgObjetivo.tech-avgActual.tech,
                          avgObjetivo.producto-avgActual.producto,
                          avgObjetivo.negocio-avgActual.negocio
                        ).toFixed(1)} puntos promedio
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top gaps */}
              <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Top problemas declarados</div>
                {topGaps.map(function(g, i) {
                  return <Bar key={i} label={g[0]} value={g[1]} max={topGaps[0][1]} color={i < 3 ? ACCENT : PRIMARY} labelWidth={160} />;
                })}
              </div>
            </div>

            {/* Match rate by day */}
            <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Diagnósticos últimos 7 días</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
                {[6,5,4,3,2,1,0].map(function(daysAgo) {
                  var from = Date.now() - (daysAgo+1)*86400000;
                  var to   = Date.now() - daysAgo*86400000;
                  var dayRecords = records.filter(function(r){ return r.ts >= from && r.ts < to; });
                  var dayMatches = dayRecords.filter(function(r){ return r.tiene_match; }).length;
                  var dayNoMatch = dayRecords.length - dayMatches;
                  var maxH = 64;
                  var d = new Date(to);
                  var label = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"][d.getDay()];
                  var totalH = dayRecords.length ? Math.max(8, Math.round((dayRecords.length / Math.max(...([6,5,4,3,2,1,0].map(function(da){
                    var f2=Date.now()-(da+1)*86400000; var t2=Date.now()-da*86400000;
                    return records.filter(function(r){return r.ts>=f2&&r.ts<t2;}).length;
                  })))) * maxH)) : 0;
                  var matchH = dayRecords.length ? Math.round((dayMatches/dayRecords.length)*totalH) : 0;
                  return (
                    <div key={daysAgo} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{dayRecords.length}</div>
                      <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: maxH }}>
                        {dayRecords.length > 0 && (
                          <div style={{ width: "100%", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ height: matchH, background: GREEN }} />
                            <div style={{ height: totalH - matchH, background: ACCENT + "99" }} />
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{label}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: GREEN }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Con match</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: ACCENT + "99" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Sin match</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROBLEMAS ── */}
        {tab === "problemas" && (
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
              {topGaps.length} problemas únicos declarados por los mentees en sus diagnósticos
            </div>

            {/* Todos los gaps con texto completo */}
            <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 24px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20 }}>
                Ranking completo de problemas declarados
              </div>
              {topGaps.length === 0 && (
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Sin datos aún — generá diagnósticos para ver los problemas.</div>
              )}
              {topGaps.map(function(g, i) {
                var pct = topGaps[0][1] ? Math.round(g[1] / topGaps[0][1] * 100) : 0;
                var isTop3 = i < 3;
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "14px 16px", marginBottom: 8,
                    background: isTop3 ? "rgba(247,37,133,0.05)" : "rgba(255,255,255,0.02)",
                    border: "1px solid " + (isTop3 ? "rgba(247,37,133,0.2)" : BORDER),
                    borderRadius: 10,
                  }}>
                    {/* Ranking */}
                    <div style={{
                      minWidth: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: isTop3 ? ACCENT : "rgba(255,255,255,0.08)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800,
                      color: isTop3 ? "white" : "rgba(255,255,255,0.4)",
                    }}>{i + 1}</div>

                    {/* Texto completo del problema */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "rgba(255,255,255,0.88)", fontSize: 13, lineHeight: "1.5", marginBottom: 8, fontWeight: isTop3 ? 600 : 400 }}>
                        {g[0]}
                      </div>
                      {/* Barra de frecuencia */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                          <div style={{ height: "100%", width: pct + "%", background: isTop3 ? ACCENT : PRIMARY, borderRadius: 2, transition: "width 0.6s" }} />
                        </div>
                        <span style={{ color: isTop3 ? ACCENT : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, flexShrink: 0, fontFamily: "monospace" }}>
                          {g[1]}x
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Insight automático */}
            {topGaps.length > 0 && (
              <div style={{ background: "rgba(67,97,238,0.08)", border: "1px solid rgba(67,97,238,0.25)", borderRadius: 14, padding: "16px 20px" }}>
                <div style={{ color: PRIMARY, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  💡 Insight
                </div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: "1.7" }}>
                  El problema más frecuente es <strong style={{ color: "white" }}>"{topGaps[0][0]}"</strong>, declarado {topGaps[0][1]} {topGaps[0][1] === 1 ? "vez" : "veces"}.
                  {topGaps.length > 1 && " Los top 3 problemas concentran " + topGaps.slice(0,3).reduce(function(s,g){return s+g[1];},0) + " de " + topGaps.reduce(function(s,g){return s+g[1];},0) + " menciones totales."}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DEMANDA INSATISFECHA ── */}
        {tab === "demanda" && (
          <div>
            <div style={{ background: "rgba(247,37,133,0.06)", border: "1px solid rgba(247,37,133,0.2)", borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div>
                  <div style={{ color: "white", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{stats.no_match_count} diagnósticos sin match en el catálogo actual</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: "1.6" }}>
                    Estos son los perfiles que la plataforma necesita reclutar con más urgencia. Cada fila es demanda real documentada.
                  </div>
                </div>
              </div>
            </div>

            {/* Perfiles buscados */}
            <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Demanda por perfil buscado</div>
              {topBuscados.map(function(entry, i) {
                var id = entry[0], count = entry[1];
                var name = BUSCADOS_NAMES[id] || "Prototipo personalizado";
                var icons = {
                  buscado_cto_fraccionado: "⚙️",
                  buscado_ux_research: "🔬",
                  buscado_ventas_b2b: "🤝",
                  buscado_fundraising: "💰",
                  buscado_growth_plg: "📈",
                  prototipo_custom: "🧩",
                };
                var colors = {
                  buscado_cto_fraccionado: "#3a86ff",
                  buscado_ux_research: PURPLE,
                  buscado_ventas_b2b: AMBER,
                  buscado_fundraising: GREEN,
                  buscado_growth_plg: ACCENT,
                  prototipo_custom: "rgba(255,255,255,0.4)",
                };
                var col = colors[id] || PRIMARY;
                var pct = Math.round(count / (stats.no_match_count || 1) * 100);
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", marginBottom: 8, background: col + "0a", border: "1px solid " + col + "25", borderRadius: 10 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{icons[id] || "🧩"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "white", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{name}</div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: pct + "%", background: col, borderRadius: 2, transition: "width 0.6s" }} />
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ color: "white", fontSize: 20, fontWeight: 800 }}>{count}</div>
                      <div style={{ color: col, fontSize: 10, fontWeight: 600 }}>{pct}%</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Prioridad de reclutamiento */}
            <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Prioridad de reclutamiento sugerida</div>
              {topBuscados.slice(0, 5).map(function(entry, i) {
                var id = entry[0], count = entry[1];
                var name = BUSCADOS_NAMES[id] || "Prototipo personalizado";
                var urgencia = i === 0 ? "🔴 Urgente" : i === 1 ? "🟠 Alta" : i === 2 ? "🟡 Media" : "🟢 Normal";
                return (
                  <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", marginBottom: 6, background: "rgba(255,255,255,0.02)", border: "1px solid " + BORDER, borderRadius: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>{"0" + (i+1)}</span>
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{count} leads esperando</span>
                      <span style={{ fontSize: 11, fontWeight: 600 }}>{urgencia}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MENTORES ── */}
        {tab === "mentores" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 12 }}>
              <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Mentores más matcheados</div>
                {topMentores.length === 0 && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Sin datos aún</div>}
                {topMentores.map(function(entry, i) {
                  var id = entry[0], count = entry[1];
                  var name = MENTOR_NAMES[id] || id;
                  return <Bar key={id} label={name} value={count} max={topMentores[0][1]} color={i === 0 ? GREEN : PRIMARY} labelWidth={150} />;
                })}
              </div>
              <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Sin ningún match</div>
                {(function() {
                  var matchedIds = topMentores.map(function(e){ return e[0]; });
                  var sinMatch = Object.keys(MENTOR_NAMES).filter(function(id){ return matchedIds.indexOf(id) === -1; });
                  if (sinMatch.length === 0) {
                    return <div style={{ color: GREEN, fontSize: 13, fontWeight: 600 }}>Todos los mentores tienen al menos 1 match</div>;
                  }
                  return sinMatch.map(function(id) {
                    return (
                      <div key={id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
                        <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>{MENTOR_NAMES[id]}</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Cobertura de patas */}
            <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Cobertura del catálogo por pata</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
                {[
                  { pata: "🔧 Tecnología", count: 5, total: 10, color: "#3a86ff", gap: "CTO fraccionado, DevOps" },
                  { pata: "📦 Producto", count: 9, total: 10, color: PURPLE, gap: "UX Research, Design" },
                  { pata: "💼 Negocio", count: 5, total: 10, color: AMBER, gap: "Ventas B2B, Fundraising" },
                ].map(function(item) {
                  var pct = Math.round(item.count / item.total * 100);
                  return (
                    <div key={item.pata} style={{ background: item.color + "08", border: "1px solid " + item.color + "25", borderRadius: 12, padding: "16px 18px" }}>
                      <div style={{ fontSize: 18, marginBottom: 8 }}>{item.pata.split(" ")[0]}</div>
                      <div style={{ color: "white", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{item.pata.split(" ").slice(1).join(" ")}</div>
                      <div style={{ fontSize: 28, fontWeight: 800, color: item.color, marginBottom: 6 }}>{item.count}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>/{item.total}</span></div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 10 }}>
                        <div style={{ height: "100%", width: pct + "%", background: item.color, borderRadius: 2 }} />
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Gap: {item.gap}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── FUNNEL ── */}
        {tab === "funnel" && (
          <div>
            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 24 }}>
              <div className="card">
                <Stat icon="🎯" value={funnelSteps[funnelSteps.length-1].count} label="Enviaron WhatsApp" sub={"de " + total + " diagnósticos totales"} color={GREEN} />
              </div>
              <div className="card">
                <Stat icon="📊"
                  value={total ? Math.round(funnelSteps[funnelSteps.length-1].count / total * 100) + "%" : "0%"}
                  label="Tasa de conversión global"
                  sub={"diagnóstico → WhatsApp"}
                  color={PRIMARY} />
              </div>
              <div className="card">
                <Stat icon="⚡"
                  value={funnelSteps[2].count ? Math.round(funnelSteps[funnelSteps.length-1].count / funnelSteps[2].count * 100) + "%" : "0%"}
                  label="Conversión paquete → WA"
                  sub={"quien ve el paquete y actúa"}
                  color={AMBER} />
              </div>
            </div>

            {/* Funnel visual */}
            <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "16px 12px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 24 }}>
                Funnel de conversión — paso a paso
              </div>
              {funnelSteps.map(function(step, i) {
                var prev = i > 0 ? funnelSteps[i-1].count : step.count;
                var pct = total ? Math.round(step.count / total * 100) : 0;
                var drop = dropoff(prev, step.count);
                var barW = pct;
                return (
                  <div key={step.key} style={{ marginBottom: i < funnelSteps.length - 1 ? 0 : 0 }}>
                    {/* Step row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
                      {/* Icon + label */}
                      <div style={{ width: 200, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: step.color + "20", border: "1px solid " + step.color + "40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{step.icon}</div>
                        <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 600 }}>{step.label}</span>
                      </div>
                      {/* Bar */}
                      <div style={{ flex: 1, height: 28, background: "rgba(255,255,255,0.04)", borderRadius: 6, position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: barW + "%", background: step.color + "55", borderRight: "2px solid " + step.color, transition: "width 0.8s ease", borderRadius: "6px 0 0 6px" }} />
                        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "white", fontSize: 12, fontWeight: 700 }}>
                          {step.count} <span style={{ color: step.color, fontSize: 11 }}>({pct}%)</span>
                        </div>
                      </div>
                    </div>
                    {/* Drop-off arrow */}
                    {i < funnelSteps.length - 1 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6, paddingLeft: 14 }}>
                        <div style={{ width: 200, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                          <div style={{ fontSize: 10, color: drop > 50 ? ACCENT : drop > 25 ? AMBER : "rgba(255,255,255,0.25)", fontWeight: 600 }}>
                            {drop > 0 ? "↓ " + drop + "% de caída" : "↓"}
                          </div>
                        </div>
                        <div style={{ flex: 1, height: 1, background: drop > 50 ? "rgba(247,37,133,0.2)" : "rgba(255,255,255,0.05)" }} />
                        {drop > 40 && (
                          <div style={{ padding: "2px 8px", borderRadius: 20, background: "rgba(247,37,133,0.1)", border: "1px solid rgba(247,37,133,0.25)", color: ACCENT, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", flexShrink: 0 }}>⚠️ fricción alta</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Opción A vs B */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 12 }}>
              <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Opción elegida en el paquete</div>
                {(opcionA + opcionB) === 0 ? (
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>Sin datos aún</div>
                ) : (
                  <div>
                    <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                      {[
                        { label: "Opción A", sub: "Paquete completo", count: opcionA, color: PRIMARY },
                        { label: "Opción B", sub: "1 sesión por mentor", count: opcionB, color: PURPLE },
                      ].map(function(opt) {
                        var total_ab = opcionA + opcionB;
                        var pct_ab = total_ab ? Math.round(opt.count / total_ab * 100) : 0;
                        return (
                          <div key={opt.label} style={{ flex: 1, background: opt.color + "10", border: "1px solid " + opt.color + "30", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: opt.color, marginBottom: 2 }}>{opt.count}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{opt.label}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{opt.sub}</div>
                            <div style={{ marginTop: 8, padding: "2px 8px", borderRadius: 20, background: opt.color + "20", color: opt.color, fontSize: 11, fontWeight: 700, display: "inline-block" }}>{pct_ab}%</div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: "1.6" }}>
                      {opcionB > opcionA
                        ? "⚡ La mayoría prefiere empezar con 1 sesión — menor fricción de entrada."
                        : opcionA > opcionB
                        ? "💪 La mayoría va por el paquete completo — alta intención de compra."
                        : "Datos equilibrados entre ambas opciones."}
                    </div>
                  </div>
                )}
              </div>

              {/* Dónde se pierde más gente */}
              <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Fricciones detectadas</div>
                {funnelSteps.slice(1).map(function(step, i) {
                  var prev = funnelSteps[i].count;
                  var drop = dropoff(prev, step.count);
                  var nivel = drop > 50 ? { label: "Alta", color: ACCENT, icon: "🔴" } : drop > 25 ? { label: "Media", color: AMBER, icon: "🟡" } : { label: "Baja", color: GREEN, icon: "🟢" };
                  var sugerencia = {
                    "con_match":        "Catálogo con gaps — reclutar más mentores",
                    "vio_paquete":      "El usuario se va antes de ver el insight",
                    "abrio_formulario": "El insight no generó urgencia suficiente para actuar",
                    "envio_wa":         "Eligió explorar pero no inició la conversación",
                  }[step.key] || "";
                  return (
                    <div key={step.key} style={{ padding: "10px 12px", marginBottom: 8, background: "rgba(255,255,255,0.02)", border: "1px solid " + BORDER, borderRadius: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{funnelSteps[i].label} → {step.label}</span>
                        <span style={{ fontSize: 11 }}>{nivel.icon} <span style={{ color: nivel.color, fontWeight: 700 }}>{drop}% caída</span></span>
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: "1.4" }}>{sugerencia}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tiempo promedio diagnóstico → WA */}
            <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>
                La métrica que importa en bootstrap
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ textAlign: "center", padding: "20px 28px", background: "rgba(67,97,238,0.08)", border: "1px solid rgba(67,97,238,0.2)", borderRadius: 12 }}>
                  <div style={{ fontSize: 42, fontWeight: 800, color: PRIMARY, lineHeight: 1 }}>~5min</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Tiempo diagnóstico → WhatsApp</div>
                  <div style={{ fontSize: 11, color: GREEN, fontWeight: 600, marginTop: 4 }}>✅ Por debajo de 7 días</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: "1.7" }}>
                    El funnel completo ocurre dentro de una sola sesión. Eso es una señal muy positiva — significa que <strong style={{ color: "white" }}>el valor percibido es inmediato</strong> y no requiere nurturing largo.
                  </div>
                  <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(6,214,160,0.06)", border: "1px solid rgba(6,214,160,0.2)", borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: GREEN, fontWeight: 700, marginBottom: 4 }}>BENCHMARK</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                      &lt; 7 días → funnel sano · &lt; 1 día → producto con pull fuerte · &gt; 30 días → hay fricción que resolver
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ── ESTADOS PROFESIONALES ── */}
        {tab === "estados" && (
          <div>
            <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"20px 22px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>El loop profesional en producto</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,flexWrap:"wrap",marginBottom:12}}>
                {["Reinvención","Estancamiento","Liderazgo"].map(function(e,i){
                  var m=LOOP_META[e];
                  var count=(estados.distribucion||{})[e]||0;
                  var pct=total?Math.round(count/total*100):0;
                  return (
                    <div key={e} style={{display:"flex",alignItems:"center"}}>
                      <div style={{textAlign:"center",padding:"14px 16px",background:m.color+"12",border:"2px solid "+m.color+"44",borderRadius:12,minWidth:110}}>
                        <div style={{fontSize:22,marginBottom:3}}>{m.icono}</div>
                        <div style={{color:"white",fontSize:12,fontWeight:700,marginBottom:2}}>{e}</div>
                        <div style={{color:m.color,fontSize:22,fontWeight:800}}>{pct}%</div>
                        <div style={{color:"rgba(255,255,255,0.35)",fontSize:10}}>{count} usuarios</div>
                      </div>
                      {i<2 && <div style={{color:"rgba(255,255,255,0.2)",fontSize:16,margin:"0 2px"}}>→</div>}
                    </div>
                  );
                })}
                <div style={{color:"rgba(255,255,255,0.2)",fontSize:16,margin:"0 2px"}}>↩</div>
              </div>
              <div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:11}}>Loop cíclico — incluso un CPO puede volver a Reinvención al fundar o mentorear</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:12,marginBottom:16}}>
              <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Urgencia detectada</div>
                {[{key:"Alta",color:ACCENT,icon:"🔴"},{key:"Media",color:AMBER,icon:"🟡"},{key:"Baja",color:GREEN,icon:"🟢"}].map(function(u){
                  var count=(estados.urgencia||{})[u.key]||0;
                  var pct=total?Math.round(count/total*100):0;
                  return (
                    <div key={u.key} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",marginBottom:6,background:u.color+"0a",border:"1px solid "+u.color+"25",borderRadius:8}}>
                      <span style={{fontSize:16}}>{u.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{color:"rgba(255,255,255,0.75)",fontSize:12,fontWeight:600}}>Urgencia {u.key}</span>
                          <span style={{color:u.color,fontSize:12,fontWeight:700}}>{pct}%</span>
                        </div>
                        <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2}}><div style={{height:"100%",width:pct+"%",background:u.color,borderRadius:2}}/></div>
                      </div>
                      <span style={{color:"rgba(255,255,255,0.4)",fontSize:11,fontFamily:"monospace",flexShrink:0}}>{count}</span>
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Seniority predominante</div>
                {[{key:"Junior",color:"#3a86ff",desc:"Primeros pasos / Reinvención entrante"},{key:"Mid",color:PURPLE,desc:"2-5 años / Estancamiento frecuente"},{key:"Senior",color:GREEN,desc:"5+ años / Liderazgo o nueva Reinvención"}].map(function(s){
                  var count=(estados.seniority||{})[s.key]||0;
                  var pct=total?Math.round(count/total*100):0;
                  var allVals=Object.values(estados.seniority||{Junior:0,Mid:0,Senior:0});
                  var isBig=count===Math.max.apply(null,allVals)&&count>0;
                  return (
                    <div key={s.key} style={{padding:"10px 12px",marginBottom:6,background:isBig?s.color+"12":"rgba(255,255,255,0.02)",border:"1px solid "+(isBig?s.color+"35":BORDER),borderRadius:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{color:isBig?"white":"rgba(255,255,255,0.65)",fontSize:12,fontWeight:isBig?700:400}}>{isBig?"⭐ ":""}{s.key}</span>
                        <span style={{color:s.color,fontSize:12,fontWeight:700}}>{count} <span style={{color:"rgba(255,255,255,0.4)",fontSize:10}}>({pct}%)</span></span>
                      </div>
                      <div style={{color:"rgba(255,255,255,0.35)",fontSize:10}}>{s.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {(estados.oportunidades||[]).map(function(op){
              return (
                <div key={op.estado} className="card" style={{background:CARD,border:"1px solid "+op.color+"35",borderRadius:14,padding:"18px 20px",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:24}}>{op.icono}</span>
                      <div>
                        <div style={{color:"white",fontSize:14,fontWeight:700}}>{op.estado}</div>
                        <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{op.count} usuarios · {op.pct}% · {op.seniority_tipico}</div>
                      </div>
                    </div>
                    <div style={{padding:"3px 12px",borderRadius:20,background:op.color+"18",border:"1px solid "+op.color+"35",color:op.color,fontSize:12,fontWeight:700}}>{op.pct}%</div>
                  </div>
                  <div style={{color:"rgba(255,255,255,0.55)",fontSize:12,lineHeight:"1.6",marginBottom:12,padding:"10px 12px",background:"rgba(255,255,255,0.02)",borderRadius:8,borderLeft:"3px solid "+op.color}}>{op.descripcion}</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
                    <div style={{background:"rgba(255,255,255,0.02)",borderRadius:8,padding:"12px 14px"}}>
                      <div style={{color:op.color,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Problemas recurrentes</div>
                      {(op.top_gaps||[]).length===0&&<div style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>Sin datos aún</div>}
                      {(op.top_gaps||[]).map(function(g,i){return <div key={i} style={{display:"flex",gap:6,marginBottom:5}}><span style={{color:op.color,fontSize:11,flexShrink:0}}>▸</span><span style={{color:"rgba(255,255,255,0.7)",fontSize:11,lineHeight:"1.4"}}>{g}</span></div>;})}
                    </div>
                    <div style={{background:"rgba(255,255,255,0.02)",borderRadius:8,padding:"12px 14px"}}>
                      <div style={{color:GREEN,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Mentorías recomendadas</div>
                      {(op.mentorias||[]).map(function(m,i){return <div key={i} style={{display:"flex",gap:6,marginBottom:5}}><span style={{color:GREEN,fontSize:11,flexShrink:0}}>✓</span><span style={{color:"rgba(255,255,255,0.7)",fontSize:11,lineHeight:"1.4"}}>{m}</span></div>;})}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "estados" && (
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 20 }}>
              Clasificación automática basada en el análisis semántico de cada diagnóstico
            </div>

            {/* Distribución + urgencia + seniority */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 16 }}>

              {/* Distribución por estado */}
              <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Distribución por estado</div>
                {[
                  { key: "Estancamiento",          icon: "🔁", color: AMBER },
                  { key: "Transición a Liderazgo", icon: "📈", color: PRIMARY },
                  { key: "Reinvención Profesional", icon: "🔀", color: ACCENT },
                ].map(function(e) {
                  var count = (estados.distribucion || {})[e.key] || 0;
                  var pct   = total ? Math.round(count/total*100) : 0;
                  return (
                    <div key={e.key} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)" }}>{e.icon} {e.key}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: e.color }}>{count} <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: pct+"%", background: e.color, borderRadius: 3, transition: "width 0.6s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Urgencia */}
              <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Nivel de urgencia detectado</div>
                {[
                  { key: "Alta",  color: ACCENT, icon: "🔴" },
                  { key: "Media", color: AMBER,  icon: "🟡" },
                  { key: "Baja",  color: GREEN,  icon: "🟢" },
                ].map(function(u) {
                  var count = (estados.urgencia || {})[u.key] || 0;
                  var pct   = total ? Math.round(count/total*100) : 0;
                  return (
                    <div key={u.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 8, background: u.color+"0a", border: "1px solid "+u.color+"25", borderRadius: 10 }}>
                      <span style={{ fontSize: 18 }}>{u.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: 600 }}>Urgencia {u.key}</span>
                          <span style={{ color: u.color, fontSize: 13, fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                          <div style={{ height: "100%", width: pct+"%", background: u.color, borderRadius: 2 }} />
                        </div>
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "monospace", flexShrink: 0 }}>{count}</span>
                    </div>
                  );
                })}
              </div>

              {/* Seniority */}
              <div className="card" style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Seniority predominante</div>
                {[
                  { key: "Junior", color: "#3a86ff", desc: "Primeros pasos en producto" },
                  { key: "Mid",    color: PURPLE,    desc: "2-5 años de experiencia" },
                  { key: "Senior", color: GREEN,     desc: "Referente con equipo a cargo" },
                ].map(function(s) {
                  var count = (estados.seniority || {})[s.key] || 0;
                  var pct   = total ? Math.round(count/total*100) : 0;
                  var isBig = count === Math.max.apply(null, Object.values(estados.seniority || {Junior:0,Mid:0,Senior:0}));
                  return (
                    <div key={s.key} style={{ padding: "12px 14px", marginBottom: 8, background: isBig ? s.color+"12" : "rgba(255,255,255,0.02)", border: "1px solid "+(isBig ? s.color+"35" : BORDER), borderRadius: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ color: isBig ? "white" : "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: isBig ? 700 : 400 }}>
                          {isBig ? "⭐ " : ""}{s.key}
                        </span>
                        <span style={{ color: s.color, fontSize: 13, fontWeight: 700 }}>{count} <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{s.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Problemas por estado + oportunidades de mentoría */}
            {(estados.oportunidades || []).filter(function(o){ return !o.es_reclutamiento; }).map(function(op) {
              var colors = { "Estancamiento": AMBER, "Transición a Liderazgo": PRIMARY, "Reinvención Profesional": ACCENT };
              var col = colors[op.estado] || PRIMARY;
              return (
                <div key={op.estado} className="card" style={{ background: CARD, border: "1px solid "+col+"25", borderRadius: 14, padding: "20px 22px", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{op.icono}</span>
                      <div>
                        <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{op.estado}</div>
                        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{op.count} usuarios · {op.pct}% del total</div>
                      </div>
                    </div>
                    <div style={{ padding: "4px 12px", borderRadius: 20, background: col+"18", border: "1px solid "+col+"35", color: col, fontSize: 12, fontWeight: 700 }}>
                      {op.pct}%
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                    {/* Problemas recurrentes */}
                    <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ color: col, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Problemas recurrentes</div>
                      {(op.top_gaps||[]).length === 0 && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Sin datos aún</div>}
                      {(op.top_gaps||[]).map(function(g, i) {
                        return (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                            <span style={{ color: col, fontSize: 12, flexShrink: 0 }}>▸</span>
                            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: "1.4" }}>{g}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Oportunidades de mentoría */}
                    <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ color: GREEN, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Mentorías recomendadas</div>
                      {(op.mentorias||[]).map(function(m, i) {
                        return (
                          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                            <span style={{ color: GREEN, fontSize: 12, flexShrink: 0 }}>✓</span>
                            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, lineHeight: "1.4" }}>{m}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Oportunidades de reclutamiento */}
            {(estados.oportunidades || []).some(function(o){ return o.es_reclutamiento; }) && (
              <div className="card" style={{ background: "rgba(67,97,238,0.06)", border: "1px solid rgba(67,97,238,0.25)", borderRadius: 14, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span style={{ fontSize: 18 }}>🎯</span>
                  <div style={{ color: PRIMARY, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Oportunidades de reclutamiento detectadas</div>
                </div>
                {(estados.oportunidades||[]).filter(function(o){ return o.es_reclutamiento; }).map(function(op, i) {
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", marginBottom: 6, background: "rgba(255,255,255,0.03)", border: "1px solid "+BORDER, borderRadius: 8 }}>
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>🔍 {op.mentorias[0]}</span>
                      <span style={{ color: ACCENT, fontSize: 12, fontWeight: 700 }}>{op.count} leads esperando</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── FEED ── */}
        {tab === "feed" && (
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>
              Mostrando los últimos {Math.min(records.length, 20)} diagnósticos
            </div>
            {records.slice(0, 20).map(function(r, i) {
              var hasMatch = r.tiene_match;
              var buscadoName = r.mentor_buscado_id ? (BUSCADOS_NAMES[r.mentor_buscado_id] || r.mentor_buscado_id) : null;
              return (
                <div key={i} className="card" style={{ background: CARD, border: "1px solid " + (hasMatch ? "rgba(6,214,160,0.15)" : "rgba(247,37,133,0.15)"), borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ padding: "2px 8px", borderRadius: 20, background: hasMatch ? "rgba(6,214,160,0.12)" : "rgba(247,37,133,0.12)", color: hasMatch ? GREEN : ACCENT, fontSize: 10, fontWeight: 700 }}>
                          {hasMatch ? "✅ Match" : buscadoName ? "🔍 " + buscadoName : "🧩 Prototipo"}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{timeAgo(r.ts)}</span>
                      </div>
                      {(r.gaps || []).length > 0 && (
                        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 6, lineHeight: "1.5" }}>
                          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Gaps: </span>
                          {r.gaps.slice(0,2).join(" · ")}
                        </div>
                      )}
                      {hasMatch && r.mentores_ids && r.mentores_ids.length > 0 && (
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {r.mentores_ids.map(function(id) {
                            return <span key={id} style={{ padding: "2px 8px", borderRadius: 20, background: "rgba(67,97,238,0.12)", color: PRIMARY, fontSize: 10, fontWeight: 600 }}>{MENTOR_NAMES[id] || id}</span>;
                          })}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        {["tech","producto","negocio"].map(function(k) {
                          var act = (r.nivel_actual||{})[k]||0;
                          var obj = (r.nivel_objetivo||{})[k]||0;
                          return <span key={k} style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>{k[0].toUpperCase()}:{act}→{obj}</span>;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
