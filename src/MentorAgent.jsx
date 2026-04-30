import { useState, useEffect } from "react";

// ─────────────────────────────────────────────
// MENTORS DB
// ─────────────────────────────────────────────
var MENTORS_DB = [
  {
    id: "GustavoLoustalet",
    nombre: "Gustavo Loustalet",
    titulo: "Fundador de Mentores con Propósito | Product Builder",
    mentoria: "Crea, validá y lanzá tu mentoría: De Senior a Mentor/a en 4 semanas",
    tags: ["Mentoría", "Edtech", "Product Builder"],
    patas: ["producto", "negocio"],
    nivel: "mid-senior",
    perfil_ideal: ["profesional senior que quiere monetizar su conocimiento", "consultor o experto que quiere lanzar su primera mentoría", "PM o founder que quiere construir su marca personal como mentor"],
    problemas_que_resuelve: ["no sé cómo empaquetar mi conocimiento", "quiero ser mentor pero no sé por dónde empezar", "tengo experiencia pero no sé cómo estructurar mi propuesta de valor"],
    sesiones: "4 sesiones",
    nSesiones: 4,
    precio: 490,
    foto: "https://ui-avatars.com/api/?name=Gustavo+Loustalet&background=4361ee&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/GustavoLoustalet",
  },
  {
    id: "FranciscoSantolo",
    nombre: "Francisco Santolo",
    titulo: "Fundador y CEO de Scalabl | Alumni Harvard, Stanford, MIT",
    mentoria: "Tenés un emprendimiento o empresa que no termina de arrancar?",
    tags: ["Negocio", "Strategy", "Metodología Scalabl"],
    patas: ["negocio"],
    nivel: "senior-founder",
    perfil_ideal: ["founder de startup estancada", "dueño de pyme que necesita estrategia", "emprendedor buscando escalar su modelo de negocio"],
    problemas_que_resuelve: ["mi emprendimiento no termina de arrancar", "no sé cómo validar mi modelo de negocio", "tengo clientes pero no crece", "necesito una estrategia clara para los próximos 6 meses"],
    sesiones: "4 sesiones",
    nSesiones: 4,
    precio: 1500,
    foto: "https://ui-avatars.com/api/?name=Francisco+Santolo&background=7b2ff7&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/FranciscoSantolo",
  },
  {
    id: "MarinaRamirez",
    nombre: "Marina Ramirez",
    titulo: "Senior Product Manager @ Workana | ex-Mercado Libre",
    mentoria: "The Product Sprint: Del caos a operar con un sistema de producto",
    tags: ["Management", "Strategy", "GenIA"],
    patas: ["producto", "tech"],
    nivel: "mid-senior",
    perfil_ideal: ["PM con sobrecarga de prioridades", "PM senior que quiere sistematizar su trabajo", "PM que transiciona de técnico a producto"],
    problemas_que_resuelve: ["opero en modo reactivo todo el tiempo", "no tengo un sistema claro de producto", "quiero incorporar automatizaciones con IA a mi flujo", "me cuesta tomar decisiones de priorización"],
    sesiones: "Sprint de 2/3/6 sesiones",
    nSesiones: 6,
    precio: 1200,
    foto: "https://ui-avatars.com/api/?name=Marina+Ramirez&background=f72585&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/MarinaRamirez",
  },
  {
    id: "MichelHauzeur",
    nombre: "Michel Hauzeur",
    titulo: "Product & Growth Builder | The Growth Game System",
    mentoria: "Think, build and growth in product: Definí tu estrategia clara de producto",
    tags: ["Management", "Strategy", "Gamification"],
    patas: ["producto", "negocio"],
    nivel: "mid-senior",
    perfil_ideal: ["PM o Product Lead que quiere crecer estratégicamente", "emprendedor que necesita estrategia de producto y crecimiento", "profesional que quiere dominar analítica de negocio"],
    problemas_que_resuelve: ["no tengo una visión clara de producto", "no sé cómo medir el impacto de mis decisiones", "quiero diseñar una estrategia de crecimiento basada en datos", "necesito un roadmap que equilibre valor y esfuerzo"],
    sesiones: "4 sesiones",
    nSesiones: 4,
    precio: 440,
    foto: "https://ui-avatars.com/api/?name=Michel+Hauzeur&background=3a86ff&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/MichelHauzeur",
  },
  {
    id: "MartinGiorgetti",
    nombre: "Martín Giorgetti",
    titulo: "Product Market Fit Specialist | Frameworks de crecimiento",
    mentoria: "De 0 A 100: Acelera tu camino hacia Product Market Fit",
    tags: ["Growth", "Go to market", "Frameworks"],
    patas: ["producto", "negocio"],
    nivel: "junior-mid",
    perfil_ideal: ["founder early stage buscando PMF", "PM lanzando un producto nuevo", "emprendedor que quiere validar antes de construir"],
    problemas_que_resuelve: ["no sé si tengo product market fit", "construí algo y no crece", "quiero validar mi idea sin gastar todo el presupuesto", "no entiendo bien a mi cliente objetivo"],
    sesiones: "4 sesiones",
    nSesiones: 4,
    precio: 1080,
    foto: "https://ui-avatars.com/api/?name=Martin+Giorgetti&background=4361ee&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/MartinGiorgetti",
  },
  {
    id: "AnaMarcuse",
    nombre: "Ana Marcuse",
    titulo: "Founder | PM | Technical Mentor for PMs | HealthTech & AI",
    mentoria: "El puente técnico para Product Managers",
    tags: ["Management", "Technical skill", "Product Management"],
    patas: ["tech", "producto"],
    nivel: "junior-mid",
    perfil_ideal: ["PM sin background técnico", "PM de negocio o humanidades que lidera equipo de dev", "PM que cambia de industria y necesita contexto técnico"],
    problemas_que_resuelve: ["me pierdo en las conversaciones técnicas con el equipo", "no puedo evaluar si una estimación es razonable", "no entiendo por qué algo simple tarda semanas", "quiero liderar con más confianza en reuniones técnicas"],
    sesiones: "6 sesiones",
    nSesiones: 6,
    precio: 1020,
    foto: "https://ui-avatars.com/api/?name=Ana+Marcuse&background=7b2ff7&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/AnaMarcuse",
  },
  {
    id: "NataliaJimenez",
    nombre: "Natalia Jiménez Aristizabal",
    titulo: "Co-fundadora Lulo Bank | CEO XAIA Lab | TEDx Speaker | Forbes Fintech & Web3",
    mentoria: "Pensar Producto como un Sistema Vivo",
    tags: ["Strategy", "Liderazgo", "Management"],
    patas: ["producto", "negocio"],
    nivel: "senior-founder",
    perfil_ideal: ["PM senior o lead sintiéndose estancado operativamente", "profesional de producto que busca profundidad estratégica", "líder que quiere ejercer influencia sin autoridad formal"],
    problemas_que_resuelve: ["opero en automático sin pensar estratégicamente", "me cuesta decidir en contextos de alta ambigüedad", "quiero liderar sin depender de mi título o jerarquía", "necesito desarrollar criterio propio para tomar mejores decisiones"],
    sesiones: "4 sesiones",
    nSesiones: 4,
    precio: 585,
    foto: "https://ui-avatars.com/api/?name=Natalia+Jimenez&background=f72585&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/NataliaJimenez",
  },
  {
    id: "LuciaCostilla",
    nombre: "Lucía Costilla",
    titulo: "Product Manager | Product Mentor | Data Analyst | Machine Learning",
    mentoria: "Primeros pasos y transición a Producto",
    tags: ["Product Manager", "Data Analyst", "Analytics"],
    patas: ["producto", "tech"],
    nivel: "junior",
    perfil_ideal: ["profesional en transición a producto", "developer o diseñador queriendo pasar a PM", "recién ingresado al mundo de producto"],
    problemas_que_resuelve: ["no sé cómo entrar al mundo del producto", "tengo perfil técnico pero quiero moverme a PM", "no sé cómo armar mi portfolio de producto", "quiero conseguir mi primer trabajo como PM"],
    sesiones: "6 sesiones",
    nSesiones: 6,
    precio: 750,
    foto: "https://ui-avatars.com/api/?name=Lucia+Costilla&background=3a86ff&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/LuciaCostilla",
  },
  {
    id: "JimenaSosa",
    nombre: "Jimena Sosa",
    titulo: "Sr. Product Analyst | Product Owner | Ingeniera Industrial | Maestría en Fintech (ITBA)",
    mentoria: "Product Data-Driven: del análisis a producto en 6 sesiones",
    tags: ["Data", "Analytics", "Tech"],
    patas: ["tech", "producto"],
    nivel: "mid",
    perfil_ideal: ["PM o PO SSR-SR que quiere tomar decisiones basadas en datos", "PM que depende del equipo de data para todo", "product analyst que quiere ir más allá del dashboard"],
    problemas_que_resuelve: ["las discusiones de producto son batallas de opiniones no de datos", "dependo 100% del equipo de data", "no sé escribir SQL ni interpretar métricas avanzadas", "me cuesta defender mis decisiones con datos ante stakeholders"],
    sesiones: "6 sesiones",
    nSesiones: 6,
    precio: 450,
    foto: "https://ui-avatars.com/api/?name=Jimena+Sosa&background=7b2ff7&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/JimenaSosa",
  },
  {
    id: "NicolasMusa",
    nombre: "Nicolas Musa",
    titulo: "Sr Product Manager | B2B SaaS · Activation & Conversion | Data-Driven Product",
    mentoria: "De PM a Product Builder",
    tags: ["Builder", "Data", "Marketplace"],
    patas: ["tech", "producto"],
    nivel: "mid-senior",
    perfil_ideal: ["PM o PO con al menos 1 año de experiencia", "PM que depende de tech o diseño para avanzar", "PM que quiere crear sus propios productos con autonomía técnica"],
    problemas_que_resuelve: ["no puedo avanzar solo sin depender de tech o diseño", "no sé prototipar mis propias ideas", "no entiendo las decisiones técnicas en las reuniones con ingeniería", "quiero sacar mis propias métricas sin pedirle tiempo al equipo de datos"],
    sesiones: "6 sesiones",
    nSesiones: 6,
    precio: 1000,
    foto: "https://ui-avatars.com/api/?name=Nicolas+Musa&background=4361ee&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/NicolasMusa",
  },
];

// ─────────────────────────────────────────────
// MENTORES BUSCADOS (perfiles que la plataforma
// está activamente reclutando)
// ─────────────────────────────────────────────
var MENTORS_BUSCADOS = [
  {
    id: "buscado_cto_fraccionado",
    titulo: "CTO Fraccionado / Tech Lead para Founders",
    descripcion: "Ayuda a founders no técnicos a elegir stack, contratar su primer dev, interpretar estimaciones y tomar decisiones arquitectónicas sin perderse.",
    patas: ["tech"],
    nivel: "senior-founder",
    problemas_que_resuelve: [
      "no sé si mi CTO me está cobrando bien",
      "no puedo evaluar a los desarrolladores que entrevisto",
      "no sé qué stack elegir para mi producto",
      "el equipo de tech siempre dice que algo es imposible o tarda semanas",
    ],
    donde_buscarlo: ["LinkedIn", "ADPList", "MentorCruise", "comunidades de CTOs latam"],
    icono: "⚙️",
    color: "#3a86ff",
  },
  {
    id: "buscado_ux_research",
    titulo: "UX Researcher / Discovery Expert",
    descripcion: "Especialista en investigación cualitativa, entrevistas con usuarios, síntesis de insights y mapas de oportunidad. El eslabón más débil en la mayoría de los equipos de producto.",
    patas: ["producto"],
    nivel: "mid-senior",
    problemas_que_resuelve: [
      "construyo features pero no sé si resuelven el problema real",
      "no sé hacer entrevistas de usuario que sirvan",
      "mi discovery es superficial o directamente no existe",
      "no logro sintetizar los aprendizajes de los usuarios en decisiones concretas",
    ],
    donde_buscarlo: ["LinkedIn", "comunidades de UX latam", "ADPList", "IxDA"],
    icono: "🔬",
    color: "#7b2ff7",
  },
  {
    id: "buscado_ventas_b2b",
    titulo: "Sales Lead / Mentor de Ventas B2B",
    descripcion: "Alguien que haya cerrado los primeros clientes enterprise, estructurado un equipo de ventas desde cero y sepa de ciclos de venta largos, demos y manejo de objeciones.",
    patas: ["negocio"],
    nivel: "senior",
    problemas_que_resuelve: [
      "tengo un buen producto pero no sé venderlo",
      "no sé cómo estructurar mi proceso de ventas B2B",
      "pierdo deals en la etapa de demo o negociación",
      "no sé cuándo contratar mi primer vendedor ni cómo evaluarlo",
    ],
    donde_buscarlo: ["LinkedIn", "Revenue Collective", "comunidades de SaaS latam"],
    icono: "🤝",
    color: "#fb8500",
  },
  {
    id: "buscado_fundraising",
    titulo: "Mentor de Fundraising / Inversión",
    descripcion: "Founder que haya levantado rondas seed o serie A, que pueda guiar en preparación de pitch deck, valuación, selección de inversores y negociación de term sheets.",
    patas: ["negocio"],
    nivel: "founder",
    problemas_que_resuelve: [
      "no sé cómo preparar mi pitch para inversores",
      "no entiendo cómo se valúa una startup en etapa temprana",
      "no sé qué buscan los VCs en una reunión",
      "tengo dudas sobre equity, dilución y term sheets",
    ],
    donde_buscarlo: ["LinkedIn", "AngelList", "comunidades de founders latam", "aceleradoras"],
    icono: "💰",
    color: "#06d6a0",
  },
  {
    id: "buscado_growth_plg",
    titulo: "Growth Lead / Especialista en PLG",
    descripcion: "Experto en Product-Led Growth, onboarding, activación, retención y loops virales. Diferente al growth estratégico — alguien que haya movido métricas reales de conversión y retención.",
    patas: ["producto", "negocio"],
    nivel: "mid-senior",
    problemas_que_resuelve: [
      "tengo usuarios registrados pero no activan",
      "mi churn es alto y no sé por qué se van",
      "no sé cómo diseñar un onboarding que convierta",
      "quiero crecer de forma orgánica sin depender solo de publicidad",
    ],
    donde_buscarlo: ["LinkedIn", "GrowthHackers", "comunidades de PLG", "Reforge Alumni"],
    icono: "📈",
    color: "#f72585",
  },
];

// ─────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────
var MENTOR_LIST = MENTORS_DB.map(function(m) {
  return "- " + m.id + " | " + m.nombre
    + " | patas: " + m.patas.join("+")
    + " | tags: " + m.tags.join(", ")
    + " | nivel: " + m.nivel
    + " | perfil: " + m.perfil_ideal.join(", ")
    + " | resuelve: " + m.problemas_que_resuelve.join("; ");
}).join("\n");

var BUSCADOS_LIST = MENTORS_BUSCADOS.map(function(b) {
  return "- " + b.id + " | " + b.titulo
    + " | patas: " + b.patas.join("+")
    + " | resuelve: " + b.problemas_que_resuelve.join("; ");
}).join("\n");

var SYSTEM_PROMPT = "Eres Mentorcito, agente de auto-diagnóstico de carrera en producto de Mentores con Propósito.\n\n"
+ "NOMBRE Y GÉNERO:\n"
+ "- Lo primero que hacés es preguntar el nombre de la persona.\n"
+ "- Una vez que tenés el nombre, inferís el género basándote en nombres de habla hispana. Ej: Martín, Juan, Diego, Francisco, Michel, Gustavo = masculino. Lucía, Valentina, María, Marina, Natalia, Jimena, Ana = femenino. En caso de duda, preguntá amablemente.\n"
+ "- Usá el nombre en cada respuesta para personalizar la conversación.\n"
+ "- Adaptá el género: estás preparado/preparada, sos el/la indicado/indicada, bienvenido/bienvenida, posicionado/posicionada, etc.\n\n"
+ "MISIÓN: Guiás a las personas a entender sus gaps en las 3 patas del producto y conectarlas con los mentores correctos.\n\n"
+ "3 PATAS:\n1. Tecnología: ingeniería, arquitectura, datos, infraestructura\n2. Producto: PM, discovery, UX/UI, métricas, roadmap, PMF\n3. Negocio: GTM, revenue, modelos de negocio, liderazgo, estrategia\n\n"
+ "MENTORES ACTIVOS (usá solo estos IDs para recomendar):\n" + MENTOR_LIST + "\n\n"
+ "PERFILES EN BÚSQUEDA ACTIVA (la plataforma está reclutando estos mentores):\n" + BUSCADOS_LIST + "\n\n"
+ "SISTEMA DE MATCHING — 4 SEÑALES:\n"
+ "1. PATAS: Las patas del mentor cubren los gaps del usuario\n"
+ "2. NIVEL: El nivel del mentor coincide con el nivel actual/objetivo\n"
+ "3. PERFIL IDEAL: La persona encaja en el perfil_ideal del mentor\n"
+ "4. PROBLEMAS: El mentor resuelve exactamente el problema de la persona (señal más poderosa)\n"
+ "Priorizar mentores donde coincidan 3 o más señales.\n\n"
+ "CASO DE NO MATCH EXACTO:\n"
+ "A) Si hay mentores activos con 2+ señales: recomendálos igual y aclará que no es match perfecto.\n"
+ "B) Si el gap coincide con un perfil en búsqueda activa (BUSCADOS): indicá el id del buscado en el campo 'mentor_buscado_id' del diagnóstico. El frontend mostrará una card especial de 'próximamente'.\n"
+ "C) Si no hay match ni buscado: construí el prototipo completo con todos los campos.\n\n"
+ "FLUJO:\n"
+ "1. Ya pediste el nombre en el primer mensaje\n"
+ "2. Hacé preguntas para entender rol, empresa, objetivos, nivel actual (máx 2 por turno)\n"
+ "3. Identificá gaps en tech/producto/negocio y el perfil de la persona\n"
+ "4. Después de 3-4 intercambios emitís el diagnóstico\n"
+ "5. Si hay buen match: recomendá 2-3 mentores y explicá qué señales coincidieron\n"
+ "6. Si no hay match: usá la lógica A/B/C de arriba\n\n"
+ "Respondé siempre en español. Sé directo, cálido y personalizado.\n\n"
+ "Cuando tengas suficiente info incluí al final:\n<DIAGNOSIS>\n"
+ "{\"nivel_actual\":{\"tech\":0,\"producto\":0,\"negocio\":0},\"nivel_objetivo\":{\"tech\":0,\"producto\":0,\"negocio\":0},\"gaps\":[\"gap1\"],\"mentores_recomendados\":[{\"id\":\"ID\",\"razon\":\"razon\",\"prioridad\":1}],\"mentor_buscado_id\":null,\"mentor_prototipo\":null,\"proximos_pasos\":[\"paso1\"]}\n"
+ "</DIAGNOSIS>\n"
+ "Cuando no hay match, mentor_prototipo debe ser:\n"
+ "{\"titulo_ideal\":\"...\",\"patas_clave\":[\"...\"],\"experiencia_minima\":\"...\",\"problemas_que_debe_resolver\":[\"...\"],\"donde_buscarlo\":[\"...\"],\"preguntas_para_validarlo\":[\"...\"]}";


// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
var C = {
  bg: "#0d0d1a",
  bgCard: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  text: "rgba(255,255,255,0.9)",
  textSecondary: "rgba(255,255,255,0.55)",
  textMuted: "rgba(255,255,255,0.3)",
  primary: "#4361ee",
  primaryLight: "rgba(67,97,238,0.1)",
  primaryBorder: "rgba(67,97,238,0.35)",
  gap: "#f72585",
  gapLight: "rgba(247,37,133,0.08)",
  gapBorder: "rgba(247,37,133,0.25)",
  success: "#7b2ff7",
  successLight: "rgba(123,47,247,0.08)",
};

var PATA_ICONS = { tech: "🔧", producto: "📦", negocio: "💼" };
var DISCOUNT = 0.20;

// ─────────────────────────────────────────────
// RADAR CHART
// ─────────────────────────────────────────────
function RadarChart(props) {
  var data = props.data;
  if (!data) return null;
  var W = 260, cx = 130, cy = 130, R = 72;
  var keys = ["tech", "producto", "negocio"];
  var labels = ["Tecnología", "Producto", "Negocio"];
  var icons = ["🔧", "📦", "💼"];

  function pt(idx, val) {
    var angle = (Math.PI * 2 * idx / 3) - Math.PI / 2;
    var r = ((val || 0) / 10) * R;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function poly(vals) {
    return keys.map(function(k, i) {
      var p = pt(i, vals[k]);
      return p.x + "," + p.y;
    }).join(" ");
  }

  function labelPt(idx) {
    var angle = (Math.PI * 2 * idx / 3) - Math.PI / 2;
    return { x: cx + (R + 38) * Math.cos(angle), y: cy + (R + 38) * Math.sin(angle) };
  }

  return (
    <svg width={W} height={W} viewBox={"0 0 " + W + " " + W} style={{ overflow: "visible", display: "block" }}>
      {[2, 4, 6, 8, 10].map(function(g) {
        return <polygon key={g} points={poly({ tech: g, producto: g, negocio: g })} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />;
      })}
      {keys.map(function(k, i) {
        var p = pt(i, 10);
        return <line key={k} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
      })}
      <polygon points={poly(data.nivel_objetivo)} fill="rgba(247,37,133,0.1)" stroke="#f72585" strokeWidth="2" strokeDasharray="5,3" />
      <polygon points={poly(data.nivel_actual)} fill="rgba(67,97,238,0.2)" stroke="#4361ee" strokeWidth="2.5" />
      {keys.map(function(k, i) {
        var curr = pt(i, data.nivel_actual[k]);
        var targ = pt(i, data.nivel_objetivo[k]);
        return (
          <g key={k}>
            <circle cx={targ.x} cy={targ.y} r="4" fill="#f72585" />
            <circle cx={curr.x} cy={curr.y} r="6" fill="#4361ee" />
            <circle cx={curr.x} cy={curr.y} r="3" fill="white" />
          </g>
        );
      })}
      {labels.map(function(label, i) {
        var lp = labelPt(i);
        return (
          <g key={label}>
            <text x={lp.x} y={lp.y - 10} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="13">{icons[i]}</text>
            <text x={lp.x} y={lp.y + 8} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="11" fontWeight="700" fontFamily="sans-serif">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────
// MENTOR AVATAR
// ─────────────────────────────────────────────
function MentorAvatar(props) {
  var nombre = props.nombre || "";
  var sz = props.sz || 48;
  var border = props.border || "none";
  var [failed, setFailed] = useState(false);
  var initials = nombre.split(" ").slice(0, 2).map(function(n) { return n[0] || ""; }).join("").toUpperCase();
  var palette = ["#4361ee", "#7b2ff7", "#f72585", "#3a86ff", "#06d6a0", "#fb8500"];
  var bg = palette[nombre.charCodeAt(0) % palette.length];
  if (failed) {
    return (
      <div style={{ width: sz, height: sz, borderRadius: "50%", flexShrink: 0, border: border, display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: "white", fontSize: Math.round(sz * 0.35), fontWeight: "700", fontFamily: "sans-serif" }}>
        {initials}
      </div>
    );
  }
  return (
    <img src={props.src} alt={nombre} onError={function() { setFailed(true); }}
      style={{ width: sz, height: sz, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: border, display: "block" }} />
  );
}

// ─────────────────────────────────────────────
// PACKAGE PANEL
// ─────────────────────────────────────────────
function PackagePanel(props) {
  var diagnosis = props.diagnosis;
  var mentors = props.mentors;
  var allMessages = props.allMessages;
  var trackEvent = props.trackEvent || function() {};
  var onVisible = props.onVisible || function() {};
  var [opcion, setOpcion] = useState("A");
  var [formStep, setFormStep] = useState("idle");
  var [nombre, setNombre] = useState("");
  var [email, setEmail] = useState("");
  var [wa, setWa] = useState("");

  // Fires vio_paquete on mount
  useEffect(function() { onVisible(); }, []);

  if (!mentors || mentors.length === 0) return null;

  var patas = [];
  mentors.forEach(function(m) {
    m.patas.forEach(function(p) { if (patas.indexOf(p) === -1) patas.push(p); });
  });

  var packageName = "Paquete Personalizado";
  if (patas.indexOf("tech") !== -1 && patas.indexOf("producto") !== -1 && patas.indexOf("negocio") !== -1) {
    packageName = "Paquete 360° — Producto Integral";
  } else if (patas.indexOf("producto") !== -1 && patas.indexOf("negocio") !== -1) {
    packageName = "Paquete Estratégico — Producto & Negocio";
  } else if (patas.indexOf("tech") !== -1 && patas.indexOf("producto") !== -1) {
    packageName = "Paquete Builder — Tech & Producto";
  }

  var totalSesiones = mentors.reduce(function(s, m) { return s + m.nSesiones; }, 0);
  var precioA = mentors.reduce(function(s, m) { return s + m.precio; }, 0);
  var descA = Math.round(precioA * DISCOUNT);
  var finalA = precioA - descA;
  var precioB = mentors.reduce(function(s, m) { return s + m.precio / m.nSesiones; }, 0);
  var descB = Math.round(precioB * DISCOUNT);
  var finalB = Math.round(precioB - descB);
  var precio = opcion === "A" ? precioA : precioB;
  var desc = opcion === "A" ? descA : descB;
  var finalP = opcion === "A" ? finalA : finalB;

  function buildHistorial() {
    return (allMessages || []).slice(1).map(function(m) {
      var txt = m.content.replace(/<DIAGNOSIS>[\s\S]*?<\/DIAGNOSIS>/g, "").trim();
      if (!txt) return null;
      return (m.role === "user" ? "Yo" : "Mentorcito") + ": " + txt;
    }).filter(Boolean).join("\n\n");
  }

  function buildWaText() {
    var t = "Paquete: " + packageName + "\nOpcion: " + opcion + "\nNombre: " + nombre + "\nEmail: " + email + (wa ? "\nWA: " + wa : "") + "\n\nMentores:\n";
    mentors.forEach(function(m, i) {
      var p = opcion === "A" ? m.precio : Math.round(m.precio / m.nSesiones);
      var s = opcion === "A" ? m.sesiones : "1 sesion";
      t += (i + 1) + ". " + m.nombre + " - " + s + " - USD " + p + "\n";
    });
    t += "\nTotal: USD " + finalP + " (ahorro: USD " + desc + ")\n\nGaps:\n";
    (diagnosis.gaps || []).forEach(function(g) { t += "- " + g + "\n"; });
    t += "\nHistorial:\n" + buildHistorial();
    return encodeURIComponent(t);
  }

  var ready = !!(nombre && email);

  return (
    <div style={{ marginTop: 24, borderRadius: 20, overflow: "hidden", background: "linear-gradient(145deg, rgba(67,97,238,0.08), rgba(123,47,247,0.06))", border: "1px solid rgba(67,97,238,0.3)" }}>
      <div style={{ background: "linear-gradient(135deg, #4361ee, #7b2ff7)", padding: "20px 22px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 6 }}>Paquete 100% personalizado</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 14 }}>{packageName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {mentors.map(function(m, i) {
            return (
              <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: mentors.length - i, position: "relative" }}>
                <MentorAvatar src={m.foto} nombre={m.nombre} sz={38} border="2px solid rgba(255,255,255,0.4)" />
              </div>
            );
          })}
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginLeft: 12, fontWeight: 600 }}>{mentors.length} mentores · {totalSesiones} sesiones</span>
        </div>
      </div>

      <div style={{ padding: "20px 22px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>Elegí tu opción</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["A", "B"].map(function(k) {
              var isSelected = opcion === k;
              var label = k === "A" ? "Opción A — Paquete completo" : "Opción B — 1 sesión por mentor";
              var sub = k === "A" ? totalSesiones + " sesiones" : mentors.length + " sesiones";
              var fp = k === "A" ? finalA : finalB;
              return (
                <button key={k} onClick={function() { setOpcion(k); }}
                  style={{ flex: 1, padding: 12, borderRadius: 12, cursor: "pointer", textAlign: "left", background: isSelected ? "rgba(67,97,238,0.2)" : "rgba(255,255,255,0.03)", border: "2px solid " + (isSelected ? "#4361ee" : "rgba(255,255,255,0.08)") }}>
                  <div style={{ color: "white", fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{label}</div>
                  <div style={{ color: C.textSecondary, fontSize: 11, marginBottom: 4 }}>{sub}</div>
                  <div style={{ color: isSelected ? "#4361ee" : "rgba(255,255,255,0.5)", fontSize: 18, fontWeight: 800 }}>USD {fp}</div>
                </button>
              );
            })}
          </div>
        </div>

        {mentors.map(function(m, i) {
          var pM = opcion === "A" ? m.precio : Math.round(m.precio / m.nSesiones);
          var sM = opcion === "A" ? m.sesiones : "1 sesión";
          return (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12 }}>
              <MentorAvatar src={m.foto} nombre={m.nombre} sz={44} border="1.5px solid rgba(255,255,255,0.1)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{m.nombre}</div>
                <div style={{ color: C.textSecondary, fontSize: 11, marginTop: 2 }}>{sM} · {m.mentoria.slice(0, 50)}...</div>
              </div>
              <div style={{ color: "white", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>USD {pM}</div>
            </div>
          );
        })}

        <div style={{ background: "rgba(67,97,238,0.07)", border: "1px solid rgba(67,97,238,0.2)", borderRadius: 14, padding: "16px 18px", margin: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: C.textSecondary, fontSize: 13 }}>Precio sin descuento</span>
            <span style={{ color: C.textSecondary, fontSize: 13, textDecoration: "line-through" }}>USD {Math.round(precio)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ padding: "2px 8px", borderRadius: 20, background: "rgba(247,37,133,0.15)", border: "1px solid rgba(247,37,133,0.3)", color: "#f72585", fontSize: 11, fontWeight: 700 }}>−20% paquete</span>
            <span style={{ color: "#f72585", fontSize: 13, fontWeight: 700 }}>−USD {desc}</span>
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 14 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: "white", fontSize: 15, fontWeight: 800 }}>Total</div>
              <div style={{ color: "#f72585", fontSize: 11, fontWeight: 600 }}>Ahorrás USD {desc}</div>
            </div>
            <div style={{ color: "white", fontSize: 28, fontWeight: 800 }}>USD {finalP}</div>
          </div>
        </div>

        {formStep === "idle" && (
          <button onClick={function() { setFormStep("form"); trackEvent("abrio_formulario", true); trackEvent("opcion", opcion); }}
            style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #4361ee, #7b2ff7)", border: "none", borderRadius: 12, color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            Quiero este paquete
          </button>
        )}

        {formStep === "form" && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18 }}>
            <div style={{ color: "white", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Dejanos tus datos</div>
            <div style={{ color: C.textSecondary, fontSize: 12, marginBottom: 16 }}>Te contactamos para coordinar el paquete.</div>
            {[
              { label: "Tu nombre", val: nombre, fn: setNombre, ph: "Ej: Martín García" },
              { label: "Email", val: email, fn: setEmail, ph: "tu@email.com" },
              { label: "WhatsApp (opcional)", val: wa, fn: setWa, ph: "+54 9 11 1234-5678" },
            ].map(function(field) {
              return (
                <div key={field.label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 5 }}>{field.label}</div>
                  <input value={field.val} onChange={function(e) { field.fn(e.target.value); }} placeholder={field.ph}
                    style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "rgba(255,255,255,0.9)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <a href={ready ? "https://wa.me/5491170043893?text=" + buildWaText() : "#"}
                target="_blank" rel="noopener noreferrer"
                onClick={function() { if (ready) { setFormStep("sent"); trackEvent("envio_wa", true); } }}
                style={{ flex: 1, padding: 12, borderRadius: 10, background: ready ? "#25D366" : "rgba(255,255,255,0.07)", color: ready ? "white" : C.textMuted, fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center", cursor: ready ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: "none" }}>
                WhatsApp
              </a>
              <a href={ready ? "mailto:mentoresconproposito@gmail.com?subject=Paquete%3A%20" + encodeURIComponent(packageName) + "&body=" + encodeURIComponent("Nombre: " + nombre + "\nEmail: " + email + "\nPaquete: " + packageName + "\nTotal: USD " + finalP) : "#"}
                onClick={function() { if (ready) { setFormStep("sent"); trackEvent("envio_wa", true); } }}
                style={{ flex: 1, padding: 12, borderRadius: 10, background: ready ? "rgba(67,97,238,0.2)" : "rgba(255,255,255,0.04)", border: "1px solid " + (ready ? "rgba(67,97,238,0.4)" : "rgba(255,255,255,0.07)"), color: ready ? "#4361ee" : C.textMuted, fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center", cursor: ready ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                Email
              </a>
            </div>
            <button onClick={function() { setFormStep("idle"); }}
              style={{ width: "100%", marginTop: 10, padding: 8, background: "transparent", border: "none", color: C.textMuted, fontSize: 12, cursor: "pointer" }}>
              Volver
            </button>
          </div>
        )}

        {formStep === "sent" && (
          <div style={{ textAlign: "center", padding: "28px 20px", background: "rgba(123,47,247,0.08)", border: "1px solid rgba(123,47,247,0.25)", borderRadius: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <div style={{ color: "white", fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Listo!</div>
            <div style={{ color: C.textSecondary, fontSize: 13, lineHeight: "1.6" }}>Tu solicitud del {packageName} fue enviada. El equipo te va a contactar pronto.</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DIAGNOSIS PANEL
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// MENTOR BUSCADO — perfil en reclutamiento activo
// ─────────────────────────────────────────────
function MentorBuscado(props) {
  var buscado = props.buscado;
  var allMessages = props.allMessages;
  if (!buscado) return null;

  function buildHistorial() {
    return (allMessages || []).slice(1).map(function(m) {
      var txt = m.content.replace(/<DIAGNOSIS>[\s\S]*?<\/DIAGNOSIS>/g, "").trim();
      if (!txt) return null;
      return (m.role === "user" ? "👤 Yo" : "🧭 Mentorcito") + ": " + txt;
    }).filter(Boolean).join("\n\n");
  }

  function buildWaText() {
    var t = buscado.icono + " *Mentor buscado: " + buscado.titulo + "*\n";
    t += "_Mentores con Propósito_\n\n";
    t += "Problemas que debe resolver:\n";
    buscado.problemas_que_resuelve.forEach(function(p) { t += "• " + p + "\n"; });
    t += "\nDónde buscarlo: " + buscado.donde_buscarlo.join(", ") + "\n\n";
    t += "📋 *Historial del diagnóstico*\n" + "─".repeat(24) + "\n";
    t += buildHistorial();
    return encodeURIComponent(t);
  }

  return (
    <div style={{ marginTop: 16 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, " + buscado.color + "22, " + buscado.color + "0a)", border: "1px solid " + buscado.color + "44", borderRadius: 16, padding: "20px 22px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 32 }}>{buscado.icono}</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ padding: "3px 10px", borderRadius: 20, background: buscado.color + "25", border: "1px solid " + buscado.color + "55", color: buscado.color, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                Próximamente en MCP
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "white", lineHeight: "1.2" }}>{buscado.titulo}</div>
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: "1.6" }}>
          {buscado.descripcion}
        </div>
      </div>

      {/* Problemas que resuelve */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ color: buscado.color, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          🩺 Problemáticas que va a resolver
        </div>
        {buscado.problemas_que_resuelve.map(function(p, i) {
          return (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "flex-start" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: buscado.color, marginTop: 6, flexShrink: 0 }} />
              <span style={{ color: "rgba(255,255,255,0.78)", fontSize: 13, lineHeight: "1.5" }}>{p}</span>
            </div>
          );
        })}
      </div>

      {/* Dónde buscarlo */}
      <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
          🔍 Dónde estamos buscando este perfil
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {buscado.donde_buscarlo.map(function(d) {
            return (
              <span key={d} style={{ padding: "4px 10px", borderRadius: 20, background: buscado.color + "15", border: "1px solid " + buscado.color + "35", color: buscado.color, fontSize: 11, fontWeight: 600 }}>{d}</span>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "rgba(67,97,238,0.08)", border: "1px solid rgba(67,97,238,0.25)", borderRadius: 14, padding: "16px 18px" }}>
        <div style={{ color: "white", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Sumate a la lista de espera</div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: "1.6", marginBottom: 12 }}>
          Te avisamos cuando este mentor esté disponible en la plataforma. También podés ayudarnos a encontrarlo.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href={"https://wa.me/5491170043893?text=" + buildWaText()}
            target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#25D366", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            💬 Anotarme en lista de espera
          </a>
          <a href={"https://mentoresconproposito.vercel.app/alta-mentores"}
            target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Conocés a alguien? →
          </a>
        </div>
      </div>
    </div>
  );
}


function MentorPrototipo(props) {
  var p = props.prototipo;
  var allMessages = props.allMessages;
  if (!p) return null;

  function buildHistorial() {
    return (allMessages || []).slice(1).map(function(m) {
      var txt = m.content.replace(/<DIAGNOSIS>[\s\S]*?<\/DIAGNOSIS>/g, "").trim();
      if (!txt) return null;
      return (m.role === "user" ? "👤 Yo" : "🧭 Mentorcito") + ": " + txt;
    }).filter(Boolean).join("\n\n");
  }

  function buildWaText() {
    var t = "🧩 *Prototipo de mentor ideal — Mentorcito*\n";
    t += "_Mentores con Propósito_\n\n";
    t += "🎯 *Rol ideal:* " + (p.titulo_ideal || "") + "\n\n";
    if (p.patas_clave && p.patas_clave.length) {
      t += "🔧 *Patas clave:* " + p.patas_clave.join(", ") + "\n\n";
    }
    if (p.experiencia_minima) {
      t += "📋 *Experiencia mínima:* " + p.experiencia_minima + "\n\n";
    }
    if (p.problemas_que_debe_resolver && p.problemas_que_debe_resolver.length) {
      t += "🩺 *Problemas que debe resolver:*\n";
      p.problemas_que_debe_resolver.forEach(function(pr) { t += "• " + pr + "\n"; });
      t += "\n";
    }
    if (p.donde_buscarlo && p.donde_buscarlo.length) {
      t += "🔍 *Dónde buscarlo:* " + p.donde_buscarlo.join(", ") + "\n\n";
    }
    if (p.preguntas_para_validarlo && p.preguntas_para_validarlo.length) {
      t += "❓ *Preguntas para validarlo:*\n";
      p.preguntas_para_validarlo.forEach(function(q, i) { t += (i + 1) + ". " + q + "\n"; });
      t += "\n";
    }
    t += "📋 *Historial del diagnóstico*\n" + "─".repeat(24) + "\n";
    t += buildHistorial();
    return encodeURIComponent(t);
  }

  var sections = [
    {
      icon: "🎯",
      color: "#4361ee",
      title: "Rol ideal del mentor",
      content: p.titulo_ideal,
      type: "text",
    },
    {
      icon: "🔧",
      color: "#3a86ff",
      title: "Patas que debe dominar",
      content: p.patas_clave,
      type: "list",
    },
    {
      icon: "📋",
      color: "#7b2ff7",
      title: "Experiencia mínima requerida",
      content: p.experiencia_minima,
      type: "text",
    },
    {
      icon: "🩺",
      color: "#f72585",
      title: "Problemas que debe saber resolver",
      content: p.problemas_que_debe_resolver,
      type: "list",
    },
    {
      icon: "🔍",
      color: "#06d6a0",
      title: "Dónde buscarlo",
      content: p.donde_buscarlo,
      type: "list",
    },
    {
      icon: "❓",
      color: "#fb8500",
      title: "Preguntas para validarlo antes de contratar",
      content: p.preguntas_para_validarlo,
      type: "numbered",
    },
  ];

  return (
    <div style={{ marginTop: 16 }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, rgba(67,97,238,0.15), rgba(247,37,133,0.1))", border: "1px solid rgba(67,97,238,0.3)", borderRadius: 16, padding: "20px 22px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 28 }}>🧩</div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 3 }}>No encontramos match exacto en el catálogo</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "white" }}>Prototipo de mentor ideal</div>
          </div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: "1.6" }}>
          Construimos el perfil del mentor que necesitás. Usalo como brief para buscarlo en plataformas externas o para reconocerlo cuando lo encuentres.
        </div>
      </div>

      {/* Sections */}
      {sections.map(function(s) {
        var hasContent = s.content && (Array.isArray(s.content) ? s.content.length > 0 : s.content.length > 0);
        if (!hasContent) return null;
        return (
          <div key={s.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ color: s.color, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{s.title}</span>
            </div>
            {s.type === "text" && (
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: "1.6" }}>{s.content}</div>
            )}
            {s.type === "list" && (
              <div>
                {s.content.map(function(item, i) {
                  return (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, marginTop: 6, flexShrink: 0 }} />
                      <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: "1.5" }}>{item}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {s.type === "numbered" && (
              <div>
                {s.content.map(function(item, i) {
                  return (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                      <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: s.color + "22", border: "1px solid " + s.color + "55", display: "flex", alignItems: "center", justifyContent: "center", color: s.color, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: "1.6", fontStyle: "italic" }}>{item}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* CTA */}
      <div style={{ background: "rgba(67,97,238,0.08)", border: "1px solid rgba(67,97,238,0.25)", borderRadius: 14, padding: "16px 18px", marginTop: 4 }}>
        <div style={{ color: "white", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>¿Conocés a alguien que encaje en este perfil?</div>
        <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: "1.6", marginBottom: 12 }}>
          Compartile este diagnóstico o contactanos — estamos construyendo el catálogo de mentores y podría sumar.
        </div>
        <a href={"https://wa.me/5491170043893?text=" + buildWaText()}
          target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#25D366", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          💬 Enviar diagnóstico completo por WhatsApp
        </a>
      </div>
    </div>
  );
}

function DiagnosisPanel(props) {
  var diagnosis = props.diagnosis;
  var allMessages = props.allMessages;
  var trackEvent = props.trackEvent || function() {};
  var [paqueteVisible, setPaqueteVisible] = useState(false);
  if (!diagnosis) return null;

  var mentorsToShow = (diagnosis.mentores_recomendados || []).map(function(rec) {
    var recId = (rec.id || "").trim();
    var found = MENTORS_DB.find(function(m) { return m.id === recId; });
    if (!found) {
      var recLow = recId.toLowerCase().replace(/\s+/g,"");
      found = MENTORS_DB.find(function(m) {
        return m.id.toLowerCase()===recLow ||
               m.nombre.toLowerCase().replace(/\s+/g,"").indexOf(recLow)!==-1 ||
               recLow.indexOf(m.id.toLowerCase())!==-1;
      });
    }
    return found ? Object.assign({}, found, { razon: rec.razon }) : null;
  }).filter(Boolean);

  var hasMatch = mentorsToShow.length > 0;
  var prototipo = diagnosis.mentor_prototipo || null;
  var buscadoId = diagnosis.mentor_buscado_id || null;
  var buscado = buscadoId ? MENTORS_BUSCADOS.find(function(b) { return b.id === buscadoId; }) || null : null;

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ background: C.bgCard, border: "1px solid " + C.border, borderRadius: 16, padding: 20, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <RadarChart data={diagnosis} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: C.primary }} />
            <span style={{ color: C.textSecondary, fontSize: 11 }}>Nivel actual</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: C.gap }} />
            <span style={{ color: C.textSecondary, fontSize: 11 }}>Nivel objetivo</span>
          </div>
        </div>
        {["tech", "producto", "negocio"].map(function(key) {
          var labelsMap = { tech: "Tecnología", producto: "Producto", negocio: "Negocio" };
          var actual = (diagnosis.nivel_actual && diagnosis.nivel_actual[key]) || 0;
          var objetivo = (diagnosis.nivel_objetivo && diagnosis.nivel_objetivo[key]) || 0;
          var gap = objetivo - actual;
          return (
            <div key={key} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{labelsMap[key]}</span>
                <span style={{ color: gap > 0 ? C.gap : C.primary, fontSize: 11, fontWeight: 600 }}>{actual} → {objetivo}</span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: (actual * 10) + "%", background: C.primary, borderRadius: 3 }} />
                {gap > 0 && <div style={{ position: "absolute", left: (actual * 10) + "%", top: 0, height: "100%", width: (gap * 10) + "%", background: "rgba(247,37,133,0.5)", borderRadius: 3 }} />}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: C.gapLight, border: "1px solid " + C.gapBorder, borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ color: C.gap, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Gaps identificados</div>
        {(diagnosis.gaps || []).map(function(gap, i) {
          return (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
              <span style={{ color: C.gap, flexShrink: 0 }}>▸</span>
              <span style={{ color: C.textSecondary, fontSize: 13, lineHeight: "1.5" }}>{gap}</span>
            </div>
          );
        })}
      </div>

      {hasMatch ? (
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: C.primary, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Mentores recomendados</div>
          {mentorsToShow.map(function(m, i) {
            return (
              <div key={m.id} style={{ background: C.bgCard, border: "1px solid " + (i === 0 ? C.primaryBorder : C.border), borderRadius: 14, padding: 16, marginBottom: 10, position: "relative" }}>
                {i === 0 && (
                  <div style={{ position: "absolute", top: -1, right: 14, background: C.primary, color: "white", fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "3px 10px", borderRadius: "0 0 8px 8px", textTransform: "uppercase" }}>Mejor match</div>
                )}
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <MentorAvatar src={m.foto} nombre={m.nombre} sz={52} border={"2px solid " + (i === 0 ? C.primaryBorder : C.border)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: C.text, fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{m.nombre}</div>
                    <div style={{ color: C.primary, fontSize: 11, marginBottom: 8, fontWeight: 500 }}>{m.titulo}</div>
                    <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "8px 11px", marginBottom: 8 }}>
                      <div style={{ color: C.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Mentoría</div>
                      <div style={{ color: C.text, fontSize: 12, lineHeight: "1.4" }}>{m.mentoria}</div>
                      <div style={{ color: C.textMuted, fontSize: 10, marginTop: 3 }}>{m.sesiones}</div>
                    </div>
                    <div style={{ color: "rgba(67,97,238,0.9)", fontSize: 12, lineHeight: "1.4", marginBottom: 10, background: C.primaryLight, padding: "7px 10px", borderRadius: 7, fontStyle: "italic" }}>
                      {m.razon}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                      {m.tags.map(function(tag) {
                        return <span key={tag} style={{ padding: "2px 9px", borderRadius: 20, background: C.primaryLight, color: C.primary, fontSize: 10, fontWeight: 600 }}>{tag}</span>;
                      })}
                    </div>
                    <a href={m.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", borderRadius: 8, background: i === 0 ? C.primary : "transparent", color: i === 0 ? "white" : C.primary, fontSize: 13, fontWeight: 700, textDecoration: "none", border: "1.5px solid " + C.primary }}>
                      Reservar mentoría →
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : buscado ? (
        <MentorBuscado buscado={buscado} allMessages={allMessages} />
      ) : (
        <MentorPrototipo prototipo={prototipo} allMessages={allMessages} />
      )}

      <div style={{ background: C.successLight, border: "1px solid rgba(123,47,247,0.25)", borderRadius: 12, padding: 16, marginBottom: 12 }}>
        <div style={{ color: C.success, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Próximos pasos</div>
        {(diagnosis.proximos_pasos || []).map(function(paso, i) {
          return (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7 }}>
              <span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: C.success, color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
              <span style={{ color: C.textSecondary, fontSize: 13, lineHeight: "1.5" }}>{paso}</span>
            </div>
          );
        })}
      </div>

      {hasMatch && <PackagePanel diagnosis={diagnosis} mentors={mentorsToShow} allMessages={allMessages} trackEvent={trackEvent} onVisible={function(){ trackEvent("vio_paquete", true); }} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
var INITIAL_MSG = {
  role: "assistant",
  content: "Hola! Soy **Mentorcito**, tu agente de diagnóstico de carrera en producto.\n\nMi objetivo es entender **dónde estás parado/a hoy** y **a dónde querés llegar**, para conectarte con los mentores que pueden hacer la diferencia en tu camino.\n\nVamos a explorar las **3 patas del producto**:\n🔧 **Tecnología** · 📦 **Producto** · 💼 **Negocio**\n\nAntes de empezar: **¿Cómo te llamás?**",
};

export default function MentorAgent() {
  var [messages, setMessages] = useState([INITIAL_MSG]);
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var [diagnosis, setDiagnosis] = useState(null);
  var [phase, setPhase] = useState("intro");
  var [currentDiagKey, setCurrentDiagKey] = useState(null);

  // URL del Google Apps Script — reemplazá con la tuya
  var SHEETS_URL = "/api/sheets";

  async function postToSheets(payload) {
    try {
      await fetch(SHEETS_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
    } catch (e) {}
  }

  async function trackFunnelEvent(field, value) {
    if (!currentDiagKey || SHEETS_URL.indexOf("TU_GOOGLE") !== -1) return;
    var payload = { action: "funnel_event", diag_key: currentDiagKey };
    payload[field] = value;
    await postToSheets(payload);
  }

  var phaseLabel = { intro: "Inicio", exploring: "Explorando", diagnosis: "Diagnóstico" };
  var phaseColor = { intro: "#4361ee", exploring: "#7b2ff7", diagnosis: "#f72585" };

  function extractDiagnosis(text) {
    var match = text.match(/<DIAGNOSIS>([\s\S]*?)<\/DIAGNOSIS>/);
    if (match) {
      try { return JSON.parse(match[1]); } catch (e) { return null; }
    }
    return null;
  }

  function cleanText(text) {
    return text.replace(/<DIAGNOSIS>[\s\S]*?<\/DIAGNOSIS>/g, "").trim();
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;
    var userMsg = { role: "user", content: input.trim() };
    var newMessages = messages.concat([userMsg]);
    setMessages(newMessages.concat([{ role: "assistant", content: "" }]));
    setInput("");
    setLoading(true);

    var apiMessages = newMessages.slice(1).map(function(m) {
      return { role: m.role, content: m.content };
    });
    if (apiMessages.length > 10) apiMessages = apiMessages.slice(-10);

    try {
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: (function(){
          var h={"Content-Type":"application/json"};
          if(typeof VITE_ANTHROPIC_KEY!=="undefined"&&VITE_ANTHROPIC_KEY){
            h["x-api-key"]=VITE_ANTHROPIC_KEY;
            h["anthropic-version"]="2023-06-01";
            h["anthropic-dangerous-direct-browser-access"]="true";
          }
          return h;
        })(),
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 4000,
          stream: true,
          system: SYSTEM_PROMPT,
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
        var lines = decoder.decode(chunk.value).split("\n").filter(function(l) { return l.indexOf("data: ") === 0; });
        for (var li = 0; li < lines.length; li++) {
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

      var diag = extractDiagnosis(fullText);
      if (diag) {
        setDiagnosis(diag);
        setPhase("diagnosis");
        // Guardar diagnóstico en storage compartido para el dashboard
        try {
          var diagKey = "diag:" + Date.now();
          setCurrentDiagKey(diagKey);
          if (SHEETS_URL.indexOf("TU_GOOGLE") === -1) {
            postToSheets({
              action: "new_diagnosis",
              ts: Date.now(),
              gaps: diag.gaps || [],
              nivel_actual: diag.nivel_actual || {},
              nivel_objetivo: diag.nivel_objetivo || {},
              mentores_ids: (diag.mentores_recomendados || []).map(function(m) { return m.id; }),
              tiene_match: (diag.mentores_recomendados || []).length > 0,
              mentor_buscado_id: diag.mentor_buscado_id || null,
              tiene_prototipo: !!diag.mentor_prototipo,
              diag_key: diagKey,
            });
          }
        } catch (e) {}
      } else if (newMessages.length > 4) { setPhase("exploring"); }

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
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function formatMessage(text) {
    return text.split("\n").map(function(line, i) {
      var html = line.replace(/\*\*(.*?)\*\*/g, "<strong style=\"color:rgba(255,255,255,0.95)\">$1</strong>");
      return <p key={i} style={{ margin: "3px 0", lineHeight: "1.6", color: "rgba(255,255,255,0.82)" }} dangerouslySetInnerHTML={{ __html: html }} />;
    });
  }

  return (
    <>
      <style>
        {[
          "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');",
          "* { box-sizing: border-box; margin: 0; padding: 0; }",
          "body { background: #0d0d1a; }",
          "::-webkit-scrollbar { width: 4px; }",
          "::-webkit-scrollbar-track { background: transparent; }",
          "::-webkit-scrollbar-thumb { background: rgba(67,97,238,0.3); border-radius: 2px; }",
          "@keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.2); } }",
          "@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }",
          ".msg-appear { animation: fadeUp 0.3s ease forwards; }",
          "textarea:focus { outline: none; }",
          "textarea { resize: none; }",
          "::placeholder { color: rgba(255,255,255,0.25); }",
        ].join("\n")}
      </style>

      <div style={{ minHeight: "100vh", background: "#0d0d1a", display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.88)" }}>

        <div style={{ padding: "0 24px", height: 60, borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(13,13,26,0.97)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="https://mentoresconproposito.vercel.app/" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", fontSize: 16, textDecoration: "none", flexShrink: 0 }}>←</a>
            <span style={{ fontSize: 22 }}>💠</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "white" }}>Mentores con Propósito</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>Agente de diagnóstico</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: phaseColor[phase] + "18", border: "1px solid " + phaseColor[phase] + "44" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: phaseColor[phase] }} />
            <span style={{ fontSize: 11, color: phaseColor[phase], fontWeight: 600 }}>{phaseLabel[phase]}</span>
          </div>
        </div>

        <div style={{ padding: "10px 24px", display: "flex", gap: 8, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginRight: 4 }}>Exploramos:</span>
          {[{ icon: "🔧", label: "Tecnología", color: "#3a86ff" }, { icon: "📦", label: "Producto", color: "#7b2ff7" }, { icon: "💼", label: "Negocio", color: "#f72585" }].map(function(p) {
            return (
              <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: p.color + "18", border: "1px solid " + p.color + "35" }}>
                <span style={{ fontSize: 12 }}>{p.icon}</span>
                <span style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>{p.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, maxHeight: "calc(100vh - 200px)" }}>
          {messages.map(function(msg, i) {
            return (
              <div key={i} className="msg-appear" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 18 }}>💠</div>
                )}
                <div style={{ display: "flex", flexDirection: "column", maxWidth: "78%", gap: 3 }}>
                  {msg.role === "assistant" && (
                    <span style={{ fontSize: 10, color: "#4361ee", fontWeight: 700, letterSpacing: 1, paddingLeft: 2 }}>AGENTE MENTORCITO</span>
                  )}
                  <div style={{ padding: "13px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px", background: msg.role === "user" ? "rgba(67,97,238,0.14)" : "rgba(255,255,255,0.05)", border: "1px solid " + (msg.role === "user" ? "rgba(67,97,238,0.35)" : "rgba(255,255,255,0.08)"), fontSize: 14, lineHeight: "1.6" }}>
                    {formatMessage(msg.content)}
                    {msg.role === "assistant" && diagnosis && i === messages.length - 1 && (
                      <DiagnosisPanel diagnosis={diagnosis} allMessages={messages} trackEvent={trackFunnelEvent} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💠</div>
              <div style={{ borderRadius: "4px 18px 18px 18px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", display: "flex", gap: 5 }}>
                {[0, 1, 2].map(function(i) {
                  return <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary, animation: "pulse 1.2s ease-in-out infinite", animationDelay: (i * 0.2) + "s", opacity: 0.5 }} />;
                })}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "12px 24px 20px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(13,13,26,0.97)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 14px" }}>
            <textarea value={input} onChange={function(e) { setInput(e.target.value); }} onKeyDown={handleKey}
              placeholder="Contame sobre tu situación actual..."
              rows={2}
              style={{ flex: 1, background: "transparent", border: "none", color: "rgba(255,255,255,0.88)", fontSize: 14, lineHeight: "1.5", caretColor: "#4361ee" }} />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              style={{ width: 36, height: 36, borderRadius: 10, background: (input.trim() && !loading) ? "linear-gradient(135deg, #4361ee, #7b2ff7)" : "rgba(255,255,255,0.07)", border: "none", cursor: (input.trim() && !loading) ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, color: (input.trim() && !loading) ? "white" : "rgba(255,255,255,0.25)" }}>
              ➤
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>Enter para enviar · Shift+Enter para nueva línea</span>
          </div>
        </div>
      </div>
    </>
  );
}
