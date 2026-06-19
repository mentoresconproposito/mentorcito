import { useState, useEffect } from "react";

// ── Colores ────────────────────────────────────────────────────
var BG      = "#0d0d1a";
var CARD    = "rgba(255,255,255,0.04)";
var BORDER  = "rgba(255,255,255,0.08)";
var PRIMARY = "#4361ee";
var GREEN   = "#06d6a0";
var AMBER   = "#fb8500";
var ACCENT  = "#f72585";
var PURPLE  = "#9b5fff";

// ── Tokens de empresa (mismo objeto que EmpresaAgent) ────────
var EMPRESAS_CONFIG = {
  "demo2026":    { nombre: "Empresa Demo",  icono: "🏢", color: "#4361ee", max: 5  },
  "acme2026":    { nombre: "Acme Corp",     icono: "🚀", color: "#06d6a0", max: 20 },
  "startup2026": { nombre: "Startup XYZ",   icono: "🌱", color: "#f72585", max: 5  },
};

var LOOP_COLORS = {
  "Reinvención":  "#f72585",
  "Estancamiento":"#fb8500",
  "Liderazgo":    "#4361ee",
};

var MENTORES_NOMBRES = {
  GustavoLoustalet:  "Gustavo Loustalet",
  FranciscoSantolo:  "Francisco Santolo",
  MarinaRamirez:     "Marina Ramirez",
  MichelHauzeur:     "Michel Hauzeur",
  MartinGiorgetti:   "Martín Giorgetti",
  AnaMarcuse:        "Ana Marcuse",
  NataliaJimenez:    "Natalia Jiménez",
  LuciaCostilla:     "Lucía Costilla",
  JimenaSosa:        "Jimena Sosa",
  NicolasMusa:       "Nicolas Musa",
  JuanCejas:         "Juan Cejas",
};

function Stat({ icon, value, label, sub, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 22, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || "white", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 4, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Bar({ pct, color, height = 6 }) {
  return (
    <div style={{ height, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
      <div style={{ height: "100%", width: Math.min(100, pct) + "%", background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
    </div>
  );
}

export default function EmpresaDashboard() {
  var params  = new URLSearchParams(window.location.search);
  var token   = params.get("token") || "";
  // empresa slug viene de la URL /empresa/slug
  var slug    = window.location.pathname.split("/empresa/")[1]?.split("?")[0] || "";
  var config  = EMPRESAS_CONFIG[token];

  var [records, setRecords]   = useState([]);
  var [loading, setLoading]   = useState(true);
  var [error, setError]       = useState(null);
  var [tab, setTab]           = useState("overview");
  var [lastUpdate, setLastUpdate] = useState(null);

  // Token inválido
  if (!config) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 20 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ color: "white", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Acceso no autorizado</div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.6 }}>
            El link de acceso al dashboard no es válido o expiró. Contactá a Mentores con Propósito.
          </div>
        </div>
      </div>
    );
  }

  function loadData() {
    setLoading(true);
    fetch("/api/sheets?action=records")
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && d.records) {
          var filtered = d.records.filter(function(r) {
            return r.empresa_id === slug;
          });
          setRecords(filtered);
          setLastUpdate(new Date().toLocaleTimeString("es-AR"));
        }
        setLoading(false);
      })
      .catch(function(e) {
        setError("No se pudo cargar la información. Intentá de nuevo.");
        setLoading(false);
      });
  }

  useEffect(function() { loadData(); }, []);

  var total = records.length;

  // Riesgo de rotación — Senior + Estancamiento + tensión de crecimiento/identidad
  var altaRotacion = records.filter(function(r) {
    var esSenior      = r.seniority === "Senior";
    var estancado     = (r.estado || "").includes("Estancamiento");
    var tensTensas    = (r.tensiones || []).some(function(t) {
      return t.includes("crecimiento") || t.includes("identidad") || t.includes("sistema");
    });
    return esSenior && estancado && tensTensas;
  }).length;

  var riesgoMedio = records.filter(function(r) {
    var estancado = (r.estado || "").includes("Estancamiento");
    var sinMatch  = r.tiene_match !== true && r.tiene_match !== "SI";
    return estancado && sinMatch;
  }).length;

  // Benchmark vs mercado (datos de los 100+ diagnósticos de Mentorcito)
  var BENCHMARK = {
    estados: { "Reinvención": 12, "Estancamiento": 33, "Liderazgo": 55 },
    tensiones: { "Tensión de sistema": 24, "Tensión de influencia": 19, "Tensión de crecimiento": 15, "Tensión de identidad": 12, "Brecha técnica": 8 },
    matchRate: 97,
    seniorPct: 58,
  };
  var tensionCount = {};
  records.forEach(function(r) {
    (r.tensiones || []).forEach(function(t) {
      if (t) tensionCount[t] = (tensionCount[t] || 0) + 1;
    });
  });
  var topTensiones = Object.entries(tensionCount).sort(function(a,b){ return b[1]-a[1]; }).slice(0, 5);
  var nudoPrioritario = records.filter(function(r){ return r.nudo_nivel === "prioritario"; }).length;
  var nudoExploratorio = records.filter(function(r){ return r.nudo_nivel === "exploratorio"; }).length;
  var nudoTotal = nudoPrioritario + nudoExploratorio;
  var matches = records.filter(function(r) { return r.tiene_match === "SI"; }).length;
  var matchPct = total ? Math.round(matches / total * 100) : 0;

  // Distribución de estados
  var estados = { "Reinvención": 0, "Estancamiento": 0, "Liderazgo": 0 };
  records.forEach(function(r) {
    var e = r.estado || "Estancamiento";
    if (e.includes("Reinven")) estados["Reinvención"]++;
    else if (e.includes("Liderazgo")) estados["Liderazgo"]++;
    else estados["Estancamiento"]++;
  });

  // Top gaps del equipo
  var gapCount = {};
  records.forEach(function(r) {
    (r.gaps || []).forEach(function(g) {
      if (g) gapCount[g] = (gapCount[g] || 0) + 1;
    });
  });
  var topGaps = Object.entries(gapCount).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 8);

  // Distribución de seniority
  var seniorityCount = { "Junior": 0, "Mid": 0, "Senior": 0 };
  records.forEach(function(r) {
    var s = r.seniority || "Mid";
    if (seniorityCount[s] !== undefined) seniorityCount[s]++;
  });

  // Tensión promedio
  var avgScore = total ? Math.round(records.reduce(function(sum, r) { return sum + (parseInt(r.score) || 50); }, 0) / total) : 0;

  var accentColor = config.color || PRIMARY;

  var tabs = [
    { key: "overview",   label: "📊 Resumen ejecutivo" },
    { key: "riesgos",    label: "🔴 Riesgos y benchmark" },
    { key: "estados",    label: "🔁 Estados del loop" },
    { key: "gaps",       label: "🔍 Tensiones del equipo" },
    { key: "personas",   label: "👥 Por persona" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.88)", paddingBottom: 60, overflowX: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "0 16px", height: 60, borderBottom: "1px solid " + BORDER, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(13,13,26,0.97)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: accentColor + "22", border: "1px solid " + accentColor + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{config.icono}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.2 }}>{config.nombre}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>Dashboard de diagnósticos · Mentorcito</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastUpdate && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Actualizado {lastUpdate}</div>}
          <button onClick={loadData} style={{ padding: "6px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid " + BORDER, borderRadius: 8, color: "rgba(255,255,255,0.6)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
            ↻ Actualizar
          </button>
        </div>
      </div>

      {/* Progreso del paquete */}
      <div style={{ padding: "10px 14px", background: accentColor + "0A", borderBottom: "1px solid " + accentColor + "22", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Diagnósticos usados</span>
            <span style={{ fontSize: 11, color: accentColor, fontWeight: 700 }}>{total} / {config.max}</span>
          </div>
          <Bar pct={total / config.max * 100} color={accentColor} height={5} />
        </div>
        <a href={"/?empresa=" + slug + "&token=" + token} target="_blank" rel="noopener noreferrer"
          style={{ flexShrink: 0, padding: "6px 12px", background: accentColor + "18", border: "1px solid " + accentColor + "44", borderRadius: 8, color: accentColor, fontSize: 11, fontWeight: 700, textDecoration: "none" }}>
          Compartir link →
        </a>
      </div>

      {loading && (
        <div style={{ padding: 60, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
          Cargando diagnósticos del equipo...
        </div>
      )}

      {error && (
        <div style={{ padding: 20, margin: "20px 14px", background: "rgba(247,37,133,0.08)", border: "1px solid rgba(247,37,133,0.2)", borderRadius: 10, color: "rgba(247,37,133,0.9)", fontSize: 13 }}>
          {error}
        </div>
      )}

      {!loading && !error && total === 0 && (
        <div style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div style={{ color: "white", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Aún no hay diagnósticos</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 24 }}>
            Compartí el link con tu equipo para empezar a recopilar diagnósticos.
          </div>
          <a href={"/?empresa=" + slug + "&token=" + token} target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-block", padding: "10px 20px", background: accentColor, borderRadius: 10, color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            Abrir link del equipo →
          </a>
        </div>
      )}

      {!loading && !error && total > 0 && (
        <div>
          {/* Tabs */}
          <div style={{ padding: "0 14px", borderBottom: "1px solid " + BORDER, display: "flex", gap: 4, overflowX: "auto" }}>
            {tabs.map(function(t) {
              var active = tab === t.key;
              return (
                <button key={t.key} onClick={function() { setTab(t.key); }}
                  style={{ padding: "12px 14px", background: "none", border: "none", borderBottom: active ? "2px solid " + accentColor : "2px solid transparent", color: active ? accentColor : "rgba(255,255,255,0.45)", fontSize: 12, fontWeight: active ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap", marginBottom: -1 }}>
                  {t.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: "16px 14px", overflowX: "hidden" }}>

            {/* ── OVERVIEW ──────────────────────────────────── */}
            {tab === "overview" && (
              <div>
                {/* KPIs */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10, marginBottom: 20 }}>
                  {[
                    { icon: "🧭", value: total, label: "Diagnósticos", sub: `de ${config.max} contratados`, color: accentColor },
                    { icon: "✅", value: matchPct + "%", label: "Con match", sub: `${matches} encontraron mentor`, color: GREEN },
                    { icon: "⚡", value: avgScore, label: "Tensión promedio", sub: "Índice 0-100", color: AMBER },
                    { icon: "📈", value: Object.entries(estados).sort((a,b)=>b[1]-a[1])[0][0], label: "Estado predominante", sub: "en el loop", color: LOOP_COLORS[Object.entries(estados).sort((a,b)=>b[1]-a[1])[0][0]] },
                  ].map(function(s, i) {
                    return (
                      <div key={i} style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 12, padding: "16px 12px" }}>
                        <Stat {...s} />
                      </div>
                    );
                  })}
                </div>

                {/* Insight principal */}
                <div style={{ background: accentColor + "0A", border: "1px solid " + accentColor + "25", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: accentColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Insight del equipo</div>
                  {(function() {
                    var topEstado = Object.entries(estados).sort((a,b)=>b[1]-a[1])[0];
                    var pctTop = total ? Math.round(topEstado[1] / total * 100) : 0;
                    var topGap = topGaps[0] ? topGaps[0][0] : "sin datos";
                    var insights = {
                      "Estancamiento": `El ${pctTop}% del equipo está en Estancamiento. El riesgo principal es la pérdida silenciosa de talento que no ve un camino de crecimiento claro.`,
                      "Liderazgo": `El ${pctTop}% del equipo está en transición hacia Liderazgo. Es el momento ideal para inversión en acompañamiento — la palanca de impacto es alta.`,
                      "Reinvención": `El ${pctTop}% del equipo está en Reinvención activa. Sin estructura de acompañamiento, estas transiciones tienen alta tasa de fracaso.`,
                    };
                    return <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.7 }}>{insights[topEstado[0]] || ""} La tensión más frecuente es <strong style={{ color: "white" }}>"{topGap}"</strong>.</div>;
                  })()}
                </div>

                {/* Distribución del loop */}
                <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Distribución del loop profesional</div>
                  {Object.entries(estados).map(function([estado, count], i) {
                    var pct = total ? Math.round(count / total * 100) : 0;
                    var color = LOOP_COLORS[estado] || PRIMARY;
                    var iconos = { "Reinvención": "🔀", "Estancamiento": "🔁", "Liderazgo": "📈" };
                    return (
                      <div key={estado} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{iconos[estado]}  {estado}</span>
                          <span style={{ fontSize: 12, color, fontWeight: 700 }}>{count} ({pct}%)</span>
                        </div>
                        <Bar pct={pct} color={color} height={8} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── RIESGOS Y BENCHMARK ───────────────────── */}
            {tab === "riesgos" && (
              <div>

                {/* Riesgo de rotación */}
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
                  Estimación basada en combinación de estado del loop, seniority y tensiones detectadas.
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 16 }}>
                  <div style={{ background: altaRotacion > 0 ? "rgba(247,37,133,0.08)" : CARD, border: "1px solid " + (altaRotacion > 0 ? "rgba(247,37,133,0.3)" : BORDER), borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: altaRotacion > 0 ? "#f72585" : GREEN }}>{altaRotacion}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4, fontWeight: 600 }}>Riesgo alto</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Senior + Estancamiento + tensión crítica</div>
                  </div>
                  <div style={{ background: riesgoMedio > 0 ? "rgba(251,133,0,0.08)" : CARD, border: "1px solid " + (riesgoMedio > 0 ? "rgba(251,133,0,0.3)" : BORDER), borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: riesgoMedio > 0 ? AMBER : GREEN }}>{riesgoMedio}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4, fontWeight: 600 }}>Riesgo medio</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Estancamiento sin match de mentor</div>
                  </div>
                  <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 12, padding: "16px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 32, fontWeight: 800, color: GREEN }}>{total - altaRotacion - riesgoMedio}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4, fontWeight: 600 }}>Sin señal de riesgo</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Sin indicadores críticos</div>
                  </div>
                </div>

                {altaRotacion > 0 && (
                  <div style={{ background: "rgba(247,37,133,0.06)", border: "1px solid rgba(247,37,133,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
                    ⚠️ <strong style={{ color: "white" }}>Acción recomendada:</strong> Las {altaRotacion} persona{altaRotacion > 1 ? "s" : ""} en riesgo alto tienen un costo de reemplazo estimado de <strong style={{ color: "#f72585" }}>USD {(altaRotacion * 15000).toLocaleString()}</strong> si se van (1× salario anual promedio en producto Latam). Una mentoría de USD {altaRotacion * 440} puede prevenir esa pérdida.
                  </div>
                )}

                <div style={{ height: 1, background: BORDER, margin: "20px 0" }} />

                {/* Benchmark vs mercado */}
                <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>
                  📊 Benchmark vs. mercado Latam
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>
                  Comparación con los datos de 100+ diagnósticos de Mentorcito en equipos de producto de Latam.
                </div>

                {/* Benchmark estados */}
                <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Estados del loop</div>
                  {Object.entries({ "Reinvención": "#f72585", "Estancamiento": AMBER, "Liderazgo": PRIMARY }).map(function([estado, color]) {
                    var tuEquipo = total ? Math.round((estados[estado] || 0) / total * 100) : 0;
                    var mercado  = BENCHMARK.estados[estado] || 0;
                    var diff     = tuEquipo - mercado;
                    var mejor    = estado === "Liderazgo" ? diff > 0 : diff < 0;
                    return (
                      <div key={estado} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{estado}</span>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Mercado: {mercado}%</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color }}>Tu equipo: {tuEquipo}%</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: mejor ? GREEN : "#f72585" }}>
                              {diff > 0 ? "+" : ""}{diff}%
                            </span>
                          </div>
                        </div>
                        <div style={{ position: "relative", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
                          {/* Barra mercado */}
                          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: mercado + "%", background: "rgba(255,255,255,0.15)", borderRadius: 4 }} />
                          {/* Barra equipo */}
                          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: tuEquipo + "%", background: color, borderRadius: 4, opacity: 0.85, transition: "width 0.8s" }} />
                        </div>
                        <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>░ Mercado Latam</span>
                          <span style={{ fontSize: 9, color }}>█ Tu equipo</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Benchmark tensiones */}
                {topTensiones.length > 0 && (
                  <div style={{ background: CARD, border: "1px solid rgba(155,95,255,0.2)", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: PURPLE, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Tensiones vs. mercado</div>
                    {topTensiones.map(function(t, i) {
                      var tuEquipo = total ? Math.round(t[1] / total * 100) : 0;
                      var mercado  = BENCHMARK.tensiones[t[0]] || 0;
                      var diff     = tuEquipo - mercado;
                      var alerta   = diff > 10;
                      return (
                        <div key={i} style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>⚡ {t[0]}</span>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Mercado: {mercado}%</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: PURPLE }}>Tu equipo: {tuEquipo}%</span>
                              {alerta && <span style={{ fontSize: 10, color: "#f72585", fontWeight: 700 }}>+{diff}% ⚠️</span>}
                            </div>
                          </div>
                          <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: (mercado || 0) + "%", background: "rgba(155,95,255,0.2)", borderRadius: 3 }} />
                            <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: Math.min(100, tuEquipo) + "%", background: alerta ? "#f72585" : PURPLE, borderRadius: 3, transition: "width 0.8s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Match rate benchmark */}
                <div style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 12, padding: "16px 18px" }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Tasa de match</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: matchPct >= BENCHMARK.matchRate ? GREEN : AMBER }}>{matchPct}%</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Tu equipo</div>
                    </div>
                    <div style={{ fontSize: 24, color: "rgba(255,255,255,0.15)" }}>vs.</div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>{BENCHMARK.matchRate}%</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Promedio Latam</div>
                    </div>
                    <div style={{ padding: "6px 14px", borderRadius: 20, background: matchPct >= BENCHMARK.matchRate ? "rgba(6,214,160,0.1)" : "rgba(251,133,0,0.1)", border: "1px solid " + (matchPct >= BENCHMARK.matchRate ? "rgba(6,214,160,0.3)" : "rgba(251,133,0,0.3)") }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: matchPct >= BENCHMARK.matchRate ? GREEN : AMBER }}>
                        {matchPct >= BENCHMARK.matchRate ? "✅ Por encima" : "⚠️ Por debajo"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ── ESTADOS ───────────────────────────────────── */}
            {tab === "estados" && (
              <div>
                {Object.entries(estados).map(function([estado, count]) {
                  var color = LOOP_COLORS[estado] || PRIMARY;
                  var pct = total ? Math.round(count / total * 100) : 0;
                  var iconos = { "Reinvención": "🔀", "Estancamiento": "🔁", "Liderazgo": "📈" };
                  var descripciones = {
                    "Reinvención":   "Profesionales en transición activa de identidad. Necesitan estructura y acompañamiento para aterrizar el cambio.",
                    "Estancamiento": "Dominan su rol pero no avanzan. Alto riesgo de rotación si no se interviene. La intervención correcta genera los mayores saltos.",
                    "Liderazgo":     "En transición de ejecución a impacto colectivo. El límite ya no es lo que saben — es cómo lideran.",
                  };
                  return (
                    <div key={estado} style={{ background: CARD, border: "1px solid " + color + "30", borderRadius: 12, padding: "18px 18px", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{iconos[estado]}</div>
                        <div>
                          <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{estado}</div>
                          <div style={{ color, fontWeight: 700, fontSize: 20 }}>{count} personas <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>({pct}%)</span></div>
                        </div>
                      </div>
                      <Bar pct={pct} color={color} height={6} />
                      <div style={{ marginTop: 12, color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 1.6 }}>{descripciones[estado]}</div>
                    </div>
                  );
                })}

                {/* NUDO — bloqueo estructural */}
                {nudoTotal > 0 && (
                  <div style={{ background: "rgba(123,47,247,0.06)", border: "1px solid rgba(123,47,247,0.25)", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: PURPLE, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                      🔮 Bloqueo estructural del equipo (NUDO)
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                      {[
                        { label: "Sin bloqueo", value: total - nudoTotal, color: GREEN },
                        { label: "Exploratorio", value: nudoExploratorio, color: AMBER },
                        { label: "Prioritario", value: nudoPrioritario, color: ACCENT },
                      ].map(function(s, i) {
                        return (
                          <div key={i} style={{ background: "rgba(123,47,247,0.08)", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
                          </div>
                        );
                      })}
                    </div>
                    {nudoPrioritario > 0 && (
                      <div style={{ background: "rgba(247,37,133,0.08)", border: "1px solid rgba(247,37,133,0.2)", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                        ⚠️ <strong style={{ color: "#f72585" }}>{nudoPrioritario} persona{nudoPrioritario > 1 ? "s" : ""}</strong> con bloqueo prioritario — derivación recomendada a NUDO Mindset antes del acompañamiento profesional.
                      </div>
                    )}
                  </div>
                )}

                {/* Tensiones transversales */}
                {topTensiones.length > 0 && (
                  <div style={{ background: CARD, border: "1px solid rgba(155,95,255,0.2)", borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: PURPLE, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                      ⚡ Tensiones transversales del equipo
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
                      Patrones psicológicos detectados en el lenguaje de los diagnósticos
                    </div>
                    {topTensiones.map(function(t, i) {
                      var pct = total ? Math.round(t[1] / total * 100) : 0;
                      var colors = [PURPLE, "#b57bee", "#c99eff", "#9b5fff", "#ddc5ff"];
                      var color = colors[i] || PURPLE;
                      return (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: i === 0 ? 700 : 400 }}>⚡ {t[0]}</span>
                            <span style={{ fontSize: 11, color, fontWeight: 700 }}>{t[1]} ({pct}%)</span>
                          </div>
                          <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                            <div style={{ height: "100%", width: Math.min(100, pct) + "%", background: color, borderRadius: 3, transition: "width 0.8s" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Recomendación de intervención */}
                <div style={{ background: "rgba(67,97,238,0.06)", border: "1px solid rgba(67,97,238,0.2)", borderRadius: 12, padding: "16px 18px", marginTop: 8 }}>
                  <div style={{ fontSize: 10, color: "#6b87f5", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Recomendación de intervención</div>
                  <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.7 }}>
                    Basado en la distribución del equipo, la intervención de mayor impacto es una <strong style={{ color: "white" }}>cohorte grupal por estado del loop</strong> — grupos de 6-8 personas en el mismo estado trabajando con el mismo mentor. Cada estado tiene dinámicas distintas y el grupo homogéneo acelera el proceso.
                  </div>
                </div>
              </div>
            )}

            {/* ── GAPS ──────────────────────────────────────── */}
            {tab === "gaps" && (
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
                  Tensiones más frecuentes declaradas por el equipo en sus propias palabras.
                </div>
                {topGaps.length === 0 && (
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: 40 }}>Sin datos suficientes</div>
                )}
                {topGaps.map(function([gap, count], i) {
                  var pct = total ? Math.round(count / total * 100) : 0;
                  var colors = [ACCENT, PRIMARY, AMBER, GREEN, PURPLE, "#3a86ff", ACCENT, PRIMARY];
                  var color = colors[i % colors.length];
                  return (
                    <div key={i} style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ flex: 1, marginRight: 12 }}>
                          <span style={{ fontSize: 10, color: color, fontWeight: 700, marginRight: 6 }}>#{i + 1}</span>
                          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{gap}</span>
                        </div>
                        <div style={{ flexShrink: 0, fontSize: 12, color, fontWeight: 700 }}>{count} / {total}</div>
                      </div>
                      <Bar pct={pct} color={color} height={5} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── PERSONAS ──────────────────────────────────── */}
            {tab === "personas" && (
              <div>
                <div style={{ background: "rgba(6,214,160,0.06)", border: "1px solid rgba(6,214,160,0.2)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                  ✅  Solo aparecen con nombre las personas que eligieron compartir su diagnóstico. El resto aparece como anónimo.
                </div>

                {/* Stats de opt-in */}
                {(function() {
                  var compartieron = records.filter(function(r){ return r.compartir_empresa; }).length;
                  var pctOpt = total ? Math.round(compartieron / total * 100) : 0;
                  return (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                      {[
                        { label: "Compartieron", value: compartieron, pct: pctOpt, color: GREEN },
                        { label: "Eligieron roadmap", value: records.filter(function(r){ return r.eligen_roadmap; }).length, pct: total ? Math.round(records.filter(function(r){ return r.eligen_roadmap; }).length / total * 100) : 0, color: PRIMARY },
                        { label: "Eligieron mentoría", value: records.filter(function(r){ return r.eligen_mentoria; }).length, pct: total ? Math.round(records.filter(function(r){ return r.eligen_mentoria; }).length / total * 100) : 0, color: PURPLE },
                      ].map(function(s, i) {
                        return (
                          <div key={i} style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
                            <div style={{ fontSize: 9, color: s.color, fontWeight: 600 }}>{s.pct}%</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

                {records.map(function(r, i) {
                  var estado = r.estado || "Estancamiento";
                  var color = LOOP_COLORS[estado] || PRIMARY;
                  var iconos = { "Reinvención": "🔀", "Estancamiento": "🔁", "Liderazgo": "📈" };
                  var nombre = r.compartir_empresa ? (r.nombre || "Sin nombre") : "Anónimo";
                  var fecha = r.fecha ? r.fecha.split(",")[0] : "";
                  var hasMatch = r.tiene_match === true || r.tiene_match === "SI";
                  var eligioRoadmap = r.eligen_roadmap;
                  var eligioMentoria = r.eligen_mentoria;
                  return (
                    <div key={i} style={{ background: CARD, border: "1px solid " + color + "25", borderRadius: 10, padding: "14px 16px", marginBottom: 8, opacity: r.compartir_empresa ? 1 : 0.65 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{r.compartir_empresa ? (iconos[estado] || "👤") : "🔒"}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: r.compartir_empresa ? "white" : "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: 13 }}>{nombre}</div>
                          <div style={{ color, fontSize: 11, fontWeight: 600 }}>{estado} · {fecha}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Match</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: hasMatch ? GREEN : AMBER }}>
                            {hasMatch ? "✅" : "⚠️"}
                          </div>
                        </div>
                      </div>

                      {r.compartir_empresa && (
                        <div>
                          {r.gaps && r.gaps.length > 0 && (
                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                              {r.gaps.slice(0, 3).map(function(g, j) {
                                return <span key={j} style={{ padding: "2px 8px", borderRadius: 20, background: color + "12", border: "1px solid " + color + "25", color: "rgba(255,255,255,0.55)", fontSize: 10 }}>{g}</span>;
                              })}
                            </div>
                          )}

                          {/* Tensiones psicológicas */}
                          {r.tensiones && r.tensiones.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                                Tensión{r.tensiones.length > 1 ? "es" : ""} detectada{r.tensiones.length > 1 ? "s" : ""}
                              </div>
                              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                {r.tensiones.map(function(t, j) {
                                  return (
                                    <span key={j} style={{ padding: "2px 8px", borderRadius: 20, background: "rgba(155,95,255,0.1)", border: "1px solid rgba(155,95,255,0.2)", color: PURPLE, fontSize: 10 }}>
                                      ⚡ {t}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Mentores matcheados */}
                          {r.mentores_ids && r.mentores_ids.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                                Mentor{r.mentores_ids.length > 1 ? "es" : ""} matcheado{r.mentores_ids.length > 1 ? "s" : ""}
                              </div>
                              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                {r.mentores_ids.slice(0, 3).map(function(id, j) {
                                  var nombre = MENTORES_NOMBRES[id] || id;
                                  return (
                                    <span key={j} style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(6,214,160,0.08)", border: "1px solid rgba(6,214,160,0.2)", color: GREEN, fontSize: 10, fontWeight: 600 }}>
                                      👤 {nombre}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {eligioRoadmap && <span style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(67,97,238,0.1)", border: "1px solid rgba(67,97,238,0.25)", color: "#6b87f5", fontSize: 10, fontWeight: 600 }}>🗺️ Eligió roadmap 90 días</span>}
                            {eligioMentoria && <span style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(155,95,255,0.1)", border: "1px solid rgba(155,95,255,0.25)", color: PURPLE, fontSize: 10, fontWeight: 600 }}>👥 Interesado en mentoría</span>}
                            {r.nudo_nivel === "prioritario" && <span style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(247,37,133,0.1)", border: "1px solid rgba(247,37,133,0.3)", color: "#f72585", fontSize: 10, fontWeight: 700 }}>🔮 NUDO prioritario · {r.score_nudo}pts</span>}
                            {r.nudo_nivel === "exploratorio" && <span style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(251,133,0,0.1)", border: "1px solid rgba(251,133,0,0.3)", color: "#fb8500", fontSize: 10, fontWeight: 700 }}>🔮 NUDO exploratorio · {r.score_nudo}pts</span>}
                            {!eligioRoadmap && !eligioMentoria && (!r.nudo_nivel || r.nudo_nivel === "ninguno") && <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>No eligió acompañamiento aún</span>}
                          </div>
                        </div>
                      )}

                      {!r.compartir_empresa && (
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>
                          Esta persona eligió mantener su diagnóstico privado.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: "16px 14px", borderTop: "1px solid " + BORDER, marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Mentorcito · Mentores con Propósito · 2026</div>
        <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
          Política de privacidad
        </a>
      </div>
    </div>
  );
}
