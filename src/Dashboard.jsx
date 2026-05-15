import { useState, useEffect } from "react";

// ── Design tokens ──────────────────────────────────────────────
var BG      = "#080b14";
var CARD    = "rgba(255,255,255,0.03)";
var BORDER  = "rgba(255,255,255,0.07)";
var PRIMARY = "#4361ee";
var ACCENT  = "#f72585";
var GREEN   = "#06d6a0";
var AMBER   = "#fb8500";
var PURPLE  = "#7b2ff7";

var SHEETS_URL = "/api/sheets";

// ── Loop profesional ───────────────────────────────────────────
// Reinvención → Estancamiento → Liderazgo → (nueva) Reinvención
var LOOP_META = {
  "Reinvención": {
    icono: "🔀", color: ACCENT,
    orden: 1,
    descripcion: "Entrada a producto o salida hacia un nuevo ciclo (Founder, Advisor, Mentor, nueva industria). Alta energía, alta incertidumbre. Ocurre al inicio y también en seniority alto.",
    pregunta: "¿Qué está cambiando en tu carrera?",
    señales: ["transición a producto","cambiar de industria","emprender","freelance","consultor","mentor","advisor","founder","nuevo rol","entrar a producto","primer trabajo"],
    mentores: ["Primeros pasos → Lucía Costilla","PMF y validación → Martín Giorgetti","De profesional a Mentor → Gustavo Loustalet","Estrategia de negocio → Francisco Santolo"],
    seniority_tipico: "Junior entrante o Senior saliente",
  },
  "Estancamiento": {
    icono: "🔁", color: AMBER,
    orden: 2,
    descripcion: "Zona de confort que se volvió trampa. El profesional domina su rol pero siente que no crece. Muy frecuente en PMs de 2–5 años de experiencia.",
    pregunta: "¿Qué te tiene bloqueado?",
    señales: ["bloqueado","reactivo","caos","sin sistema","sin claridad","frustr","mismo rol","no avanzo","sin dirección","agotad","automatico","años haciendo lo mismo"],
    mentores: ["Sistema de producto → Marina Ramirez","Estrategia y visión → Michel Hauzeur","Criterio propio → Natalia Jiménez","Data-driven → Jimena Sosa"],
    seniority_tipico: "Mid (2–5 años)",
  },
  "Liderazgo": {
    icono: "📈", color: PRIMARY,
    orden: 3,
    descripcion: "Transición de hacer a liderar. El desafío ya no es técnico sino humano y estratégico. Crítico para PMs que aspiran a Head, VP, CPO — y antesala de la próxima Reinvención.",
    pregunta: "¿Cómo escalás tu impacto?",
    señales: ["liderar","liderazgo","equipo","sin autoridad","influencia","manager","director","head","estrategia","stakeholder","escalar","gestionar personas","ascender"],
    mentores: ["Liderazgo sistémico → Natalia Jiménez","Pensamiento estratégico → Michel Hauzeur","Puente técnico → Ana Marcuse","Tech builder → Nicolas Musa"],
    seniority_tipico: "Senior (5+ años)",
  },
};

// ── Clasificación client-side ──────────────────────────────────
function clasificarEstado(r) {
  var gaps = (r.gaps || []).join(" ").toLowerCase();
  var nAct = r.nivel_actual  || {};
  var nObj = r.nivel_objetivo || {};
  var avg  = ((nAct.tech||0)+(nAct.producto||0)+(nAct.negocio||0)) / 3;
  var gapTotal = ((nObj.tech||0)-(nAct.tech||0)) + ((nObj.producto||0)-(nAct.producto||0)) + ((nObj.negocio||0)-(nAct.negocio||0));

  var scoreR = LOOP_META["Reinvención"].señales.filter(function(k){ return gaps.indexOf(k)!==-1; }).length;
  var scoreE = LOOP_META["Estancamiento"].señales.filter(function(k){ return gaps.indexOf(k)!==-1; }).length;
  var scoreL = LOOP_META["Liderazgo"].señales.filter(function(k){ return gaps.indexOf(k)!==-1; }).length;

  // Senior queriendo emprender/mentorear → nueva Reinvención
  if (avg >= 7 && (nObj.negocio||0) >= 8) return "Reinvención";
  // Junior entrante → Reinvención
  if (avg <= 3) return "Reinvención";

  if (scoreR >= scoreE && scoreR >= scoreL && scoreR > 0) return "Reinvención";
  if (scoreL > scoreE && scoreL > 0) return "Liderazgo";
  if (scoreE > 0 || (gapTotal >= 5 && avg >= 4 && avg <= 7)) return "Estancamiento";
  return "Estancamiento";
}

function calcularUrgencia(r) {
  var nAct = r.nivel_actual  || {};
  var nObj = r.nivel_objetivo || {};
  var gap  = ((nObj.tech||0)-(nAct.tech||0))+((nObj.producto||0)-(nAct.producto||0))+((nObj.negocio||0)-(nAct.negocio||0));
  var gaps = (r.gaps||[]).join(" ").toLowerCase();
  var score = ["urgente","ya","ahora","estancado","años","perdiendo","crisis","burnout","renunci","salir"].filter(function(k){return gaps.indexOf(k)!==-1;}).length;
  if (gap>=12||(gap>=8&&score>=2)) return "Alta";
  if (gap>=6||score>=1) return "Media";
  return "Baja";
}

function inferirSeniority(r) {
  var nAct = r.nivel_actual || {};
  var avg  = ((nAct.tech||0)+(nAct.producto||0)+(nAct.negocio||0)) / 3;
  var gaps = (r.gaps||[]).join(" ").toLowerCase();
  var j = ["primer","empezar","entrar","recién","junior"].filter(function(k){return gaps.indexOf(k)!==-1;}).length;
  var s = ["años de experiencia","head","director","vp","cto","cpo","ceo","founder","equipo a cargo","senior"].filter(function(k){return gaps.indexOf(k)!==-1;}).length;
  if (s>=1||avg>=7) return "Senior";
  if (j>=1||avg<=3) return "Junior";
  return "Mid";
}

function normalizeEstado(e) {
  if (!e) return null;
  if (e.indexOf("Reinven") !== -1) return "Reinvención";
  if (e.indexOf("Liderazgo") !== -1 || e.indexOf("Transici") !== -1) return "Liderazgo";
  if (e.indexOf("Estanc") !== -1) return "Estancamiento";
  return null;
}

function buildEstados(records) {
  var dist = { "Reinvención": 0, "Estancamiento": 0, "Liderazgo": 0 };
  var urg  = { "Alta": 0, "Media": 0, "Baja": 0 };
  var sen  = { "Junior": 0, "Mid": 0, "Senior": 0 };
  var gapsByE = { "Reinvención": {}, "Estancamiento": {}, "Liderazgo": {} };
  var total = records.length;

  records.forEach(function(r) {
    var e = normalizeEstado(r.estado) || clasificarEstado(r);
    var u = r.urgencia  || calcularUrgencia(r);
    var s = r.seniority || inferirSeniority(r);
    if (dist[e] !== undefined) dist[e]++;
    if (urg[u]  !== undefined) urg[u]++;
    if (sen[s]  !== undefined) sen[s]++;
    if (gapsByE[e]) {
      (r.gaps||[]).forEach(function(g){ if(g) gapsByE[e][g]=(gapsByE[e][g]||0)+1; });
    }
  });

  var gapsByETop = {};
  Object.keys(gapsByE).forEach(function(e) {
    gapsByETop[e] = Object.entries(gapsByE[e]).sort(function(a,b){return b[1]-a[1];}).slice(0,5);
  });

  var oportunidades = ["Reinvención","Estancamiento","Liderazgo"].map(function(e) {
    var m = LOOP_META[e];
    return {
      estado: e, icono: m.icono, color: m.color,
      count: dist[e], pct: total ? Math.round(dist[e]/total*100) : 0,
      top_gaps: gapsByETop[e].map(function(g){return g[0];}),
      mentorias: m.mentores,
      descripcion: m.descripcion,
      pregunta: m.pregunta,
      seniority_tipico: m.seniority_tipico,
    };
  });

  return { distribucion: dist, urgencia: urg, seniority: sen, gaps_by_estado: gapsByETop, oportunidades: oportunidades };
}

// ── Mentor names ───────────────────────────────────────────────
var MENTOR_NAMES = {
  GustavoLoustalet:"Gustavo Loustalet", FranciscoSantolo:"Francisco Santolo",
  MarinaRamirez:"Marina Ramirez",       MichelHauzeur:"Michel Hauzeur",
  MartinGiorgetti:"Martín Giorgetti",   AnaMarcuse:"Ana Marcuse",
  NataliaJimenez:"Natalia Jiménez",     LuciaCostilla:"Lucía Costilla",
  JimenaSosa:"Jimena Sosa",             NicolasMusa:"Nicolas Musa",
};

var BUSCADOS_NAMES = {
  buscado_cto_fraccionado:"CTO Fraccionado", buscado_ux_research:"UX Researcher",
  buscado_ventas_b2b:"Sales B2B",           buscado_fundraising:"Fundraising",
  buscado_growth_plg:"Growth / PLG",
};

// ── Seed data ──────────────────────────────────────────────────
var SEED = [
  { ts:Date.now()-86400000*6, gaps:["no tengo sistema de producto","me cuesta priorizar"], nivel_actual:{tech:3,producto:5,negocio:4}, nivel_objetivo:{tech:5,producto:8,negocio:6}, mentores_ids:["MarinaRamirez","MichelHauzeur"], tiene_match:true, mentor_buscado_id:null, vio_paquete:true, abrio_formulario:true, envio_wa:true, opcion:"A" },
  { ts:Date.now()-86400000*5, gaps:["no entiendo las conversaciones técnicas"], nivel_actual:{tech:2,producto:6,negocio:5}, nivel_objetivo:{tech:6,producto:8,negocio:6}, mentores_ids:["AnaMarcuse"], tiene_match:true, mentor_buscado_id:null, vio_paquete:true, abrio_formulario:true, envio_wa:false, opcion:"B" },
  { ts:Date.now()-86400000*5, gaps:["no sé si tengo PMF","no crece"], nivel_actual:{tech:4,producto:4,negocio:3}, nivel_objetivo:{tech:6,producto:7,negocio:7}, mentores_ids:["MartinGiorgetti","FranciscoSantolo"], tiene_match:true, mentor_buscado_id:null, vio_paquete:true, abrio_formulario:false, envio_wa:false, opcion:null },
  { ts:Date.now()-86400000*4, gaps:["no sé vender mi producto","necesito estructura de ventas"], nivel_actual:{tech:5,producto:6,negocio:2}, nivel_objetivo:{tech:6,producto:7,negocio:7}, mentores_ids:[], tiene_match:false, mentor_buscado_id:"buscado_ventas_b2b", vio_paquete:false, abrio_formulario:false, envio_wa:true, opcion:null },
  { ts:Date.now()-86400000*4, gaps:["quiero levantar capital","no entiendo term sheets"], nivel_actual:{tech:4,producto:5,negocio:3}, nivel_objetivo:{tech:5,producto:6,negocio:8}, mentores_ids:[], tiene_match:false, mentor_buscado_id:"buscado_fundraising", vio_paquete:false, abrio_formulario:false, envio_wa:false, opcion:null },
  { ts:Date.now()-86400000*3, gaps:["las decisiones son opiniones no datos","dependo 100% del equipo de data"], nivel_actual:{tech:3,producto:6,negocio:5}, nivel_objetivo:{tech:7,producto:8,negocio:6}, mentores_ids:["JimenaSosa","NicolasMusa"], tiene_match:true, mentor_buscado_id:null, vio_paquete:true, abrio_formulario:true, envio_wa:true, opcion:"A" },
  { ts:Date.now()-86400000*3, gaps:["quiero liderar un equipo","liderazgo sin autoridad formal"], nivel_actual:{tech:4,producto:6,negocio:5}, nivel_objetivo:{tech:5,producto:9,negocio:8}, mentores_ids:["NataliaJimenez"], tiene_match:true, mentor_buscado_id:null, vio_paquete:true, abrio_formulario:true, envio_wa:true, opcion:"B" },
  { ts:Date.now()-86400000*2, gaps:["no sé elegir stack","no puedo evaluar devs"], nivel_actual:{tech:1,producto:4,negocio:5}, nivel_objetivo:{tech:6,producto:6,negocio:7}, mentores_ids:[], tiene_match:false, mentor_buscado_id:"buscado_cto_fraccionado", vio_paquete:false, abrio_formulario:false, envio_wa:true, opcion:null },
  { ts:Date.now()-86400000*2, gaps:["mi discovery es superficial","no sé hacer entrevistas útiles"], nivel_actual:{tech:4,producto:4,negocio:4}, nivel_objetivo:{tech:5,producto:8,negocio:5}, mentores_ids:[], tiene_match:false, mentor_buscado_id:"buscado_ux_research", vio_paquete:false, abrio_formulario:false, envio_wa:false, opcion:null },
  { ts:Date.now()-86400000*1, gaps:["quiero ser mentor pero no sé por dónde empezar","de profesional a mentor"], nivel_actual:{tech:5,producto:7,negocio:6}, nivel_objetivo:{tech:6,producto:9,negocio:8}, mentores_ids:["GustavoLoustalet"], tiene_match:true, mentor_buscado_id:null, vio_paquete:true, abrio_formulario:true, envio_wa:false, opcion:"A" },
  { ts:Date.now()-3600000*8, gaps:["no tengo visión de producto","no sé medir impacto"], nivel_actual:{tech:4,producto:5,negocio:4}, nivel_objetivo:{tech:5,producto:8,negocio:7}, mentores_ids:["MichelHauzeur","MartinGiorgetti"], tiene_match:true, mentor_buscado_id:null, vio_paquete:true, abrio_formulario:true, envio_wa:true, opcion:"A" },
  { ts:Date.now()-3600000*4, gaps:["no sé diseñar un onboarding","mi churn es alto"], nivel_actual:{tech:4,producto:5,negocio:5}, nivel_objetivo:{tech:5,producto:8,negocio:8}, mentores_ids:[], tiene_match:false, mentor_buscado_id:"buscado_growth_plg", vio_paquete:false, abrio_formulario:false, envio_wa:true, opcion:null },
  { ts:Date.now()-3600000*2, gaps:["quiero entrar al mundo del producto","no sé armar mi portfolio"], nivel_actual:{tech:5,producto:2,negocio:3}, nivel_objetivo:{tech:6,producto:7,negocio:5}, mentores_ids:["LuciaCostilla"], tiene_match:true, mentor_buscado_id:null, vio_paquete:true, abrio_formulario:false, envio_wa:false, opcion:null },
  { ts:Date.now()-3600000*1, gaps:["mismo rol hace 3 años","bloqueado","sin crecimiento"], nivel_actual:{tech:5,producto:6,negocio:5}, nivel_objetivo:{tech:6,producto:8,negocio:7}, mentores_ids:["MarinaRamirez"], tiene_match:true, mentor_buscado_id:null, vio_paquete:true, abrio_formulario:true, envio_wa:true, opcion:"B" },
  { ts:Date.now()-1800000, gaps:["me fui de una corporación y quiero fundar una startup"], nivel_actual:{tech:6,producto:7,negocio:6}, nivel_objetivo:{tech:7,producto:8,negocio:9}, mentores_ids:["FranciscoSantolo"], tiene_match:true, mentor_buscado_id:null, vio_paquete:true, abrio_formulario:true, envio_wa:true, opcion:"C" },
];

// ── Stats builder from seed ────────────────────────────────────
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
    total:total, match_count:matches.length, no_match_count:noMatches.length,
    avg_actual:{tech:af("nivel_actual","tech"),producto:af("nivel_actual","producto"),negocio:af("nivel_actual","negocio")},
    avg_objetivo:{tech:af("nivel_objetivo","tech"),producto:af("nivel_objetivo","producto"),negocio:af("nivel_objetivo","negocio")},
    top_gaps:Object.entries(gapCount).sort(function(a,b){return b[1]-a[1];}).slice(0,8),
    top_mentores:Object.entries(mentorCount).sort(function(a,b){return b[1]-a[1];}),
    buscado_count:Object.entries(buscadoCount).sort(function(a,b){return b[1]-a[1];}),
    funnel:{
      diagnostico:total,con_match:matches.length,
      vio_paquete:records.filter(function(r){return r.vio_paquete;}).length,
      abrio_formulario:records.filter(function(r){return r.abrio_formulario;}).length,
      envio_wa:records.filter(function(r){return r.envio_wa;}).length,
      opcion_a:records.filter(function(r){return r.opcion==="A";}).length,
      opcion_b:records.filter(function(r){return r.opcion==="B";}).length,
    },
    estados:buildEstados(records),
    recent:records.slice().sort(function(a,b){return b.ts-a.ts;}).slice(0,30),
  };
}

// ── Mini components ────────────────────────────────────────────
function Bar(props) {
  var pct = Math.min(100, props.max ? Math.round(props.value/props.max*100) : 0);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
      <div style={{ width:props.lw||140, color:"rgba(255,255,255,0.65)", fontSize:12, flexShrink:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{props.label}</div>
      <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.06)", borderRadius:3, position:"relative" }}>
        <div style={{ position:"absolute", left:0, top:0, height:"100%", width:pct+"%", background:props.color||PRIMARY, borderRadius:3, transition:"width 0.6s" }} />
      </div>
      <div style={{ width:28, textAlign:"right", color:"rgba(255,255,255,0.5)", fontSize:11, fontFamily:"monospace", flexShrink:0 }}>{props.value}</div>
    </div>
  );
}

function Stat(props) {
  return (
    <div style={{ background:CARD, border:"1px solid "+BORDER, borderRadius:14, padding:"16px 18px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, right:0, width:50, height:50, borderRadius:"0 14px 0 50px", background:props.color+"12" }} />
      <div style={{ fontSize:20, marginBottom:6 }}>{props.icon}</div>
      <div style={{ fontSize:28, fontWeight:800, color:"white", lineHeight:1, marginBottom:4 }}>{props.value}</div>
      <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>{props.label}</div>
      {props.sub && <div style={{ fontSize:10, color:props.color, fontWeight:600, marginTop:4 }}>{props.sub}</div>}
    </div>
  );
}

function RadarMini(props) {
  var W=120, cx=60, cy=60, R=38;
  var keys=["tech","producto","negocio"];
  function pt(idx,val){ var a=(Math.PI*2*idx/3)-Math.PI/2; var r=((val||0)/10)*R; return {x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)}; }
  function poly(vals){ return keys.map(function(k,i){ var p=pt(i,vals[k]||0); return p.x+","+p.y; }).join(" "); }
  return (
    <svg width={W} height={W} viewBox={"0 0 "+W+" "+W}>
      {[3,6,10].map(function(g){ return <polygon key={g} points={poly({tech:g,producto:g,negocio:g})} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>; })}
      <polygon points={poly(props.obj)} fill="rgba(247,37,133,0.12)" stroke={ACCENT} strokeWidth="1.5" strokeDasharray="3,2"/>
      <polygon points={poly(props.act)} fill="rgba(67,97,238,0.2)" stroke={PRIMARY} strokeWidth="1.5"/>
      <text x="60" y="16" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">📦</text>
      <text x="18" y="88" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">🔧</text>
      <text x="102" y="88" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">💼</text>
    </svg>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────
export default function Dashboard() {
  var [stats, setStats]         = useState(null);
  var [loading, setLoading]     = useState(true);
  var [error, setError]         = useState(null);
  var [tab, setTab]             = useState("overview");
  var [lastRefresh, setRefresh] = useState(null);

  async function fetchStats() {
    setLoading(true);
    async function doFetch() {
      var res  = await fetch(SHEETS_URL+"?action=stats");
      if (!res.ok) throw new Error("HTTP "+res.status);
      var data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    }
    try {
      var data = await doFetch();
      setStats(data);
      setError(null);
      setRefresh(new Date());
    } catch(e) {
      try {
        await new Promise(function(r){ setTimeout(r,2000); });
        var data2 = await doFetch();
        setStats(data2);
        setError(null);
        setRefresh(new Date());
      } catch(e2) {
        setStats(buildStatsFromSeed(SEED));
        setError("Mostrando datos de demo — "+e2.message);
      }
    } finally { setLoading(false); }
  }

  useEffect(function(){ fetchStats(); var iv=setInterval(fetchStats,60000); return function(){clearInterval(iv);}; },[]);

  if (loading && !stats) return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif"}}>
      <div style={{color:"rgba(255,255,255,0.4)",fontSize:14}}>Cargando datos...</div>
    </div>
  );
  if (!stats) return null;

  // ── Extract ────────────────────────────────────────────────
  var total       = stats.total || 0;
  var matchCount  = stats.match_count || 0;
  var matchRate   = total ? Math.round(matchCount/total*100) : 0;
  var topGaps     = stats.top_gaps     || [];
  var topMentores = stats.top_mentores || [];
  var topBuscados = stats.buscado_count|| [];
  var avgActual   = stats.avg_actual   || {tech:0,producto:0,negocio:0};
  var avgObjetivo = stats.avg_objetivo || {tech:0,producto:0,negocio:0};
  var funnel      = stats.funnel       || {};
  var records     = stats.recent       || [];
  var estadosData = stats.estados      || buildEstados(records);
  var opcionA     = funnel.opcion_a    || 0;
  var opcionB     = funnel.opcion_b    || 0;
  var hoy         = records.filter(function(r){return Date.now()-r.ts<86400000;}).length;
  var semana      = records.filter(function(r){return Date.now()-r.ts<604800000;}).length;

  var funnelSteps = [
    {key:"diagnostico",     label:"Diagnóstico generado",  count:funnel.diagnostico      ||total,       color:PRIMARY,   icon:"🧭"},
    {key:"con_match",       label:"Con mentor matcheado",  count:funnel.con_match        ||matchCount,  color:"#3a86ff", icon:"✅"},
    {key:"vio_paquete",     label:"Vió el paquete",        count:funnel.vio_paquete      ||0,           color:PURPLE,    icon:"📦"},
    {key:"abrio_formulario",label:"Abrió el formulario",   count:funnel.abrio_formulario ||0,           color:AMBER,     icon:"📝"},
    {key:"envio_wa",        label:"Envió WhatsApp",        count:funnel.envio_wa         ||0,           color:"#25D366", icon:"💬"},
  ];
  function dropoff(from,to){ return from?Math.round((1-to/from)*100):0; }

  function tabStyle(t) {
    return { padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", border:"none", background:tab===t?PRIMARY:"transparent", color:tab===t?"white":"rgba(255,255,255,0.45)", whiteSpace:"nowrap", transition:"all 0.15s" };
  }

  function timeAgo(ts) {
    var m=Math.floor((Date.now()-ts)/60000);
    if(m<60) return m+"m"; var h=Math.floor(m/60);
    if(h<24) return h+"h"; return Math.floor(h/24)+"d";
  }

  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"'Plus Jakarta Sans',sans-serif",color:"rgba(255,255,255,0.88)",paddingBottom:60}}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:rgba(67,97,238,0.3);border-radius:2px;}@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}.card{animation:fadeUp 0.4s ease forwards;}"}</style>

      {error && <div style={{padding:"8px 20px",background:"rgba(251,133,0,0.1)",borderBottom:"1px solid rgba(251,133,0,0.25)",color:AMBER,fontSize:11}}>{error}</div>}

      {/* Header */}
      <div style={{padding:"14px 16px",borderBottom:"1px solid "+BORDER,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,background:"rgba(8,11,20,0.97)",backdropFilter:"blur(12px)",zIndex:10,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:20}}>📊</span>
          <div>
            <div style={{fontSize:15,fontWeight:800,color:"white"}}>Mentorcito Analytics</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>{lastRefresh?"Actualizado "+lastRefresh.toLocaleTimeString("es-AR"):"Dashboard de demanda"}</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={fetchStats} disabled={loading} style={{padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.6)",fontSize:11,cursor:loading?"not-allowed":"pointer",fontWeight:600}}>{loading?"...":"↻"}</button>
          <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:"rgba(6,214,160,0.1)",border:"1px solid rgba(6,214,160,0.25)"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:GREEN}}/>
            <span style={{fontSize:10,color:GREEN,fontWeight:600}}>{total} diagnósticos</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{padding:"8px 12px",display:"flex",gap:4,overflowX:"auto",WebkitOverflowScrolling:"touch",borderBottom:"1px solid "+BORDER,background:"rgba(255,255,255,0.01)"}}>
        {[
          {key:"overview", label:"📈 Overview"},
          {key:"estados",  label:"🧠 Estados"},
          {key:"problemas",label:"🗣️ Problemas"},
          {key:"demanda",  label:"🔍 Demanda"},
          {key:"mentores", label:"👥 Mentores"},
          {key:"funnel",   label:"🎯 Funnel"},
          {key:"feed",     label:"📋 Feed"},
        ].map(function(t){ return <button key={t.key} onClick={function(){setTab(t.key);}} style={tabStyle(t.key)}>{t.label}</button>; })}
      </div>

      <div style={{padding:"16px 12px"}}>

        {/* ── OVERVIEW ── */}
        {tab==="overview" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:16}}>
              <div className="card"><Stat icon="🧭" value={total} label="Diagnósticos totales" sub={"+"+hoy+" hoy · +"+semana+" semana"} color={PRIMARY}/></div>
              <div className="card"><Stat icon="✅" value={matchRate+"%"} label="Tasa de match" sub={matchCount+" con mentor"} color={GREEN}/></div>
              <div className="card"><Stat icon="❌" value={stats.no_match_count} label="Sin match" sub="Demanda insatisfecha" color={ACCENT}/></div>
              <div className="card"><Stat icon="🔥" value={topGaps[0]?topGaps[0][1]:0} label="Gap más frecuente" sub={topGaps[0]?topGaps[0][0].slice(0,28)+"...":"-"} color={AMBER}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12,marginBottom:12}}>
              <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Perfil promedio de mentees</div>
                <div style={{display:"flex",alignItems:"center",gap:16}}>
                  <RadarMini act={avgActual} obj={avgObjetivo}/>
                  <div style={{flex:1}}>
                    {["tech","producto","negocio"].map(function(k){
                      var labels={tech:"🔧 Tech",producto:"📦 Producto",negocio:"💼 Negocio"};
                      var gap=avgObjetivo[k]-avgActual[k];
                      return (
                        <div key={k} style={{marginBottom:10}}>
                          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                            <span style={{fontSize:11,color:"rgba(255,255,255,0.6)"}}>{labels[k]}</span>
                            <span style={{fontSize:10,color:ACCENT,fontFamily:"monospace"}}>{avgActual[k]}→{avgObjetivo[k]}</span>
                          </div>
                          <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,position:"relative"}}>
                            <div style={{position:"absolute",left:0,top:0,height:"100%",width:(avgActual[k]*10)+"%",background:PRIMARY,borderRadius:2}}/>
                            <div style={{position:"absolute",left:(avgActual[k]*10)+"%",top:0,height:"100%",width:(gap*10)+"%",background:"rgba(247,37,133,0.5)",borderRadius:2}}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Top problemas declarados</div>
                {topGaps.slice(0,6).map(function(g,i){ return <Bar key={i} label={g[0]} value={g[1]} max={topGaps[0][1]} color={i<3?ACCENT:PRIMARY} lw={160}/>; })}
              </div>
            </div>
          </div>
        )}

        {/* ── ESTADOS ── */}
        {tab==="estados" && (
          <div>
            {/* Loop visual */}
            <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"20px 22px",marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>El loop profesional en producto</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,flexWrap:"wrap"}}>
                {["Reinvención","Estancamiento","Liderazgo"].map(function(e,i){
                  var m=LOOP_META[e];
                  var count=(estadosData.distribucion||{})[e]||0;
                  var pct=total?Math.round(count/total*100):0;
                  return (
                    <div key={e} style={{display:"flex",alignItems:"center"}}>
                      <div style={{textAlign:"center",padding:"14px 18px",background:m.color+"12",border:"2px solid "+m.color+"44",borderRadius:12,minWidth:120}}>
                        <div style={{fontSize:24,marginBottom:4}}>{m.icono}</div>
                        <div style={{color:"white",fontSize:13,fontWeight:700,marginBottom:2}}>{e}</div>
                        <div style={{color:m.color,fontSize:20,fontWeight:800}}>{pct}%</div>
                        <div style={{color:"rgba(255,255,255,0.35)",fontSize:10}}>{count} usuarios</div>
                      </div>
                      {i<2 && <div style={{color:"rgba(255,255,255,0.25)",fontSize:18,margin:"0 4px"}}>→</div>}
                    </div>
                  );
                })}
                <div style={{color:"rgba(255,255,255,0.25)",fontSize:18,margin:"0 4px"}}>↩</div>
              </div>
              <div style={{textAlign:"center",marginTop:12,color:"rgba(255,255,255,0.3)",fontSize:11}}>
                El loop es cíclico — incluso un CPO puede volver a Reinvención al fundar o mentorear
              </div>
            </div>

            {/* Urgencia + Seniority */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12,marginBottom:16}}>
              <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Urgencia detectada</div>
                {[{key:"Alta",color:ACCENT,icon:"🔴"},{key:"Media",color:AMBER,icon:"🟡"},{key:"Baja",color:GREEN,icon:"🟢"}].map(function(u){
                  var count=(estadosData.urgencia||{})[u.key]||0;
                  var pct=total?Math.round(count/total*100):0;
                  return (
                    <div key={u.key} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",marginBottom:6,background:u.color+"0a",border:"1px solid "+u.color+"25",borderRadius:8}}>
                      <span style={{fontSize:16}}>{u.icon}</span>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{color:"rgba(255,255,255,0.75)",fontSize:12,fontWeight:600}}>Urgencia {u.key}</span>
                          <span style={{color:u.color,fontSize:12,fontWeight:700}}>{pct}%</span>
                        </div>
                        <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                          <div style={{height:"100%",width:pct+"%",background:u.color,borderRadius:2}}/>
                        </div>
                      </div>
                      <span style={{color:"rgba(255,255,255,0.4)",fontSize:11,fontFamily:"monospace",flexShrink:0}}>{count}</span>
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Seniority predominante</div>
                {[{key:"Junior",color:"#3a86ff",desc:"Primeros pasos"},{key:"Mid",color:PURPLE,desc:"2–5 años"},{key:"Senior",color:GREEN,desc:"5+ años / liderazgo"}].map(function(s){
                  var count=(estadosData.seniority||{})[s.key]||0;
                  var pct=total?Math.round(count/total*100):0;
                  var allCounts=Object.values(estadosData.seniority||{Junior:0,Mid:0,Senior:0});
                  var isBig=count===Math.max.apply(null,allCounts);
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

            {/* Cards por estado: descripción + gaps + mentorías */}
            {(estadosData.oportunidades||[]).map(function(op){
              return (
                <div key={op.estado} className="card" style={{background:CARD,border:"1px solid "+op.color+"35",borderRadius:14,padding:"18px 20px",marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:26}}>{op.icono}</span>
                      <div>
                        <div style={{color:"white",fontSize:15,fontWeight:700}}>{op.estado}</div>
                        <div style={{color:"rgba(255,255,255,0.4)",fontSize:11}}>{op.count} usuarios · {op.pct}% del total</div>
                        <div style={{color:"rgba(255,255,255,0.35)",fontSize:10,marginTop:2,fontStyle:"italic"}}>{op.seniority_tipico}</div>
                      </div>
                    </div>
                    <div style={{padding:"3px 12px",borderRadius:20,background:op.color+"18",border:"1px solid "+op.color+"35",color:op.color,fontSize:12,fontWeight:700}}>{op.pct}%</div>
                  </div>
                  <div style={{color:"rgba(255,255,255,0.55)",fontSize:12,lineHeight:"1.6",marginBottom:14,padding:"10px 12px",background:"rgba(255,255,255,0.02)",borderRadius:8,borderLeft:"3px solid "+op.color}}>
                    {op.descripcion}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:10}}>
                    <div style={{background:"rgba(255,255,255,0.02)",borderRadius:8,padding:"12px 14px"}}>
                      <div style={{color:op.color,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Problemas recurrentes</div>
                      {(op.top_gaps||[]).length===0 && <div style={{color:"rgba(255,255,255,0.3)",fontSize:11}}>Sin datos aún</div>}
                      {(op.top_gaps||[]).map(function(g,i){
                        return <div key={i} style={{display:"flex",gap:6,marginBottom:5}}><span style={{color:op.color,fontSize:11,flexShrink:0}}>▸</span><span style={{color:"rgba(255,255,255,0.7)",fontSize:11,lineHeight:"1.4"}}>{g}</span></div>;
                      })}
                    </div>
                    <div style={{background:"rgba(255,255,255,0.02)",borderRadius:8,padding:"12px 14px"}}>
                      <div style={{color:GREEN,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Mentorías recomendadas</div>
                      {(op.mentorias||[]).map(function(m,i){
                        return <div key={i} style={{display:"flex",gap:6,marginBottom:5}}><span style={{color:GREEN,fontSize:11,flexShrink:0}}>✓</span><span style={{color:"rgba(255,255,255,0.7)",fontSize:11,lineHeight:"1.4"}}>{m}</span></div>;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PROBLEMAS ── */}
        {tab==="problemas" && (
          <div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:16}}>{topGaps.length} problemas únicos declarados</div>
            <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"18px 20px",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:16}}>Ranking completo</div>
              {topGaps.map(function(g,i){
                var pct=topGaps[0][1]?Math.round(g[1]/topGaps[0][1]*100):0;
                var isTop=i<3;
                return (
                  <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",marginBottom:6,background:isTop?"rgba(247,37,133,0.05)":"rgba(255,255,255,0.02)",border:"1px solid "+(isTop?"rgba(247,37,133,0.2)":BORDER),borderRadius:10}}>
                    <div style={{minWidth:26,height:26,borderRadius:"50%",flexShrink:0,background:isTop?ACCENT:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:isTop?"white":"rgba(255,255,255,0.4)"}}>{i+1}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:"rgba(255,255,255,0.88)",fontSize:12,lineHeight:"1.5",marginBottom:6,fontWeight:isTop?600:400}}>{g[0]}</div>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,height:3,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                          <div style={{height:"100%",width:pct+"%",background:isTop?ACCENT:PRIMARY,borderRadius:2}}/>
                        </div>
                        <span style={{color:isTop?ACCENT:"rgba(255,255,255,0.4)",fontSize:10,fontWeight:700,fontFamily:"monospace"}}>{g[1]}x</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {topGaps.length>0 && (
              <div style={{background:"rgba(67,97,238,0.08)",border:"1px solid rgba(67,97,238,0.25)",borderRadius:12,padding:"14px 18px"}}>
                <div style={{color:PRIMARY,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>💡 Insight</div>
                <div style={{color:"rgba(255,255,255,0.7)",fontSize:12,lineHeight:"1.6"}}>
                  El problema más frecuente es <strong style={{color:"white"}}>"{topGaps[0][0]}"</strong> con {topGaps[0][1]} menciones.
                  {topGaps.length>2 && " Los top 3 concentran "+topGaps.slice(0,3).reduce(function(s,g){return s+g[1];},0)+" de "+topGaps.reduce(function(s,g){return s+g[1];},0)+" menciones totales."}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DEMANDA INSATISFECHA ── */}
        {tab==="demanda" && (
          <div>
            <div style={{background:"rgba(247,37,133,0.06)",border:"1px solid rgba(247,37,133,0.2)",borderRadius:12,padding:"14px 18px",marginBottom:16}}>
              <div style={{color:"white",fontSize:13,fontWeight:700,marginBottom:4}}>⚠️ {stats.no_match_count} diagnósticos sin match</div>
              <div style={{color:"rgba(255,255,255,0.55)",fontSize:12}}>Estos perfiles son la demanda que el catálogo no cubre. Cada fila es una oportunidad de reclutamiento.</div>
            </div>
            <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"18px 20px",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Demanda por perfil buscado</div>
              {topBuscados.map(function(entry,i){
                var id=entry[0],count=entry[1];
                var name=BUSCADOS_NAMES[id]||"Prototipo personalizado";
                var colors={buscado_cto_fraccionado:"#3a86ff",buscado_ux_research:PURPLE,buscado_ventas_b2b:AMBER,buscado_fundraising:GREEN,buscado_growth_plg:ACCENT,prototipo_custom:"rgba(255,255,255,0.4)"};
                var icons={buscado_cto_fraccionado:"⚙️",buscado_ux_research:"🔬",buscado_ventas_b2b:"🤝",buscado_fundraising:"💰",buscado_growth_plg:"📈",prototipo_custom:"🧩"};
                var col=colors[id]||PRIMARY;
                var pct=stats.no_match_count?Math.round(count/stats.no_match_count*100):0;
                return (
                  <div key={id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",marginBottom:8,background:col+"0a",border:"1px solid "+col+"25",borderRadius:10}}>
                    <span style={{fontSize:20,flexShrink:0}}>{icons[id]||"🧩"}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:"white",fontSize:12,fontWeight:700,marginBottom:4}}>{name}</div>
                      <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2}}>
                        <div style={{height:"100%",width:pct+"%",background:col,borderRadius:2,transition:"width 0.6s"}}/>
                      </div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{color:"white",fontSize:18,fontWeight:800}}>{count}</div>
                      <div style={{color:col,fontSize:10,fontWeight:600}}>{pct}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MENTORES ── */}
        {tab==="mentores" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:12,marginBottom:12}}>
              <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Más matcheados</div>
                {topMentores.length===0 && <div style={{color:"rgba(255,255,255,0.3)",fontSize:12}}>Sin datos aún</div>}
                {topMentores.map(function(entry,i){
                  return <Bar key={entry[0]} label={MENTOR_NAMES[entry[0]]||entry[0]} value={entry[1]} max={topMentores[0][1]} color={i===0?GREEN:PRIMARY} lw={150}/>;
                })}
              </div>
              <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"18px 20px"}}>
                <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:14}}>Sin ningún match</div>
                {(function(){
                  var matchedIds=topMentores.map(function(e){return e[0];});
                  var sinMatch=Object.keys(MENTOR_NAMES).filter(function(id){return matchedIds.indexOf(id)===-1;});
                  if(sinMatch.length===0) return <div style={{color:GREEN,fontSize:12,fontWeight:600}}>✅ Todos tienen al menos 1 match</div>;
                  return sinMatch.map(function(id){
                    return <div key={id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}><div style={{width:6,height:6,borderRadius:"50%",background:ACCENT,flexShrink:0}}/><span style={{color:"rgba(255,255,255,0.55)",fontSize:12}}>{MENTOR_NAMES[id]}</span></div>;
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ── FUNNEL ── */}
        {tab==="funnel" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:16}}>
              <div className="card"><Stat icon="🎯" value={funnelSteps[funnelSteps.length-1].count} label="Enviaron WhatsApp" sub={"de "+total+" diagnósticos"} color={GREEN}/></div>
              <div className="card"><Stat icon="📊" value={total?Math.round(funnelSteps[funnelSteps.length-1].count/total*100)+"%":"0%"} label="Conversión global" sub="diagnóstico → WA" color={PRIMARY}/></div>
              <div className="card"><Stat icon="⚡" value={opcionA+opcionB>0?Math.round(opcionA/(opcionA+opcionB)*100)+"%":"0%"} label="Eligen opción A" sub="paquete completo" color={AMBER}/></div>
            </div>
            <div className="card" style={{background:CARD,border:"1px solid "+BORDER,borderRadius:14,padding:"20px 22px",marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:20}}>Funnel paso a paso</div>
              {funnelSteps.map(function(step,i){
                var prev=i>0?funnelSteps[i-1].count:step.count;
                var pct=total?Math.round(step.count/total*100):0;
                var drop=dropoff(prev,step.count);
                return (
                  <div key={step.key}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
                      <div style={{width:180,display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:step.color+"20",border:"1px solid "+step.color+"40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>{step.icon}</div>
                        <span style={{color:"rgba(255,255,255,0.75)",fontSize:11,fontWeight:600}}>{step.label}</span>
                      </div>
                      <div style={{flex:1,height:24,background:"rgba(255,255,255,0.04)",borderRadius:6,position:"relative",overflow:"hidden"}}>
                        <div style={{position:"absolute",left:0,top:0,height:"100%",width:pct+"%",background:step.color+"55",borderRight:"2px solid "+step.color,transition:"width 0.8s"}}/>
                        <div style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:"white",fontSize:11,fontWeight:700}}>{step.count} <span style={{color:step.color,fontSize:10}}>({pct}%)</span></div>
                      </div>
                    </div>
                    {i<funnelSteps.length-1 && drop>0 && (
                      <div style={{paddingLeft:14,marginBottom:6}}>
                        <span style={{fontSize:10,color:drop>50?ACCENT:drop>25?AMBER:"rgba(255,255,255,0.25)",fontWeight:600}}>↓ {drop}% de caída{drop>40?" — ⚠️ fricción alta":""}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── FEED ── */}
        {tab==="feed" && (
          <div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:12}}>Últimos {Math.min(records.length,20)} diagnósticos</div>
            {records.slice(0,20).map(function(r,i){
              var hasMatch=r.tiene_match;
              var estado=normalizeEstado(r.estado)||clasificarEstado(r);
              var em=LOOP_META[estado]||{icono:"❓",color:"rgba(255,255,255,0.3)"};
              return (
                <div key={i} className="card" style={{background:CARD,border:"1px solid "+(hasMatch?"rgba(6,214,160,0.15)":"rgba(247,37,133,0.15)"),borderRadius:10,padding:"12px 14px",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
                        <span style={{padding:"2px 7px",borderRadius:20,background:hasMatch?"rgba(6,214,160,0.12)":"rgba(247,37,133,0.12)",color:hasMatch?GREEN:ACCENT,fontSize:9,fontWeight:700}}>{hasMatch?"✅ Match":"❌ Sin match"}</span>
                        <span style={{padding:"2px 7px",borderRadius:20,background:em.color+"15",color:em.color,fontSize:9,fontWeight:600}}>{em.icono} {estado}</span>
                        <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:"monospace"}}>{timeAgo(r.ts)}</span>
                      </div>
                      {(r.gaps||[]).length>0 && <div style={{color:"rgba(255,255,255,0.6)",fontSize:11,lineHeight:"1.5"}}>{r.gaps.slice(0,2).join(" · ")}</div>}
                      {hasMatch && (r.mentores_ids||[]).length>0 && (
                        <div style={{display:"flex",gap:4,flexWrap:"wrap",marginTop:5}}>
                          {r.mentores_ids.map(function(id){ return <span key={id} style={{padding:"1px 7px",borderRadius:20,background:"rgba(67,97,238,0.12)",color:PRIMARY,fontSize:9,fontWeight:600}}>{MENTOR_NAMES[id]||id}</span>; })}
                        </div>
                      )}
                    </div>
                    <div style={{flexShrink:0,textAlign:"right"}}>
                      {["tech","producto","negocio"].map(function(k){
                        var act=(r.nivel_actual||{})[k]||0;
                        var obj=(r.nivel_objetivo||{})[k]||0;
                        return <div key={k} style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:"monospace"}}>{k[0].toUpperCase()}:{act}→{obj}</div>;
                      })}
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
