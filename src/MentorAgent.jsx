import { useState, useEffect, useRef } from "react";

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
  {
    id: "JuanCejas",
    nombre: "Juan Cejas",
    titulo: "UX Designer @ Mercado Libre | UX Artist | Diseño que lidera producto",
    mentoria: "De diseñador que ejecuta a diseñador que lidera producto",
    tags: ["UX Design", "UX/UI", "Diseño de Producto"],
    patas: ["producto", "tech"],
    nivel: "mid-senior",
    perfil_ideal: ["diseñador UX/UI que quiere pasar de ejecutar a liderar producto", "diseñador que siente que sus ideas no se implementan", "diseñador que quiere conectar su trabajo con métricas de negocio", "profesional de diseño que quiere influir en decisiones de producto"],
    problemas_que_resuelve: ["me ven como el que dibuja pantallas y no como alguien estratégico", "no sé cómo conectar mi trabajo de diseño con métricas de negocio", "mis ideas no llegan a implementarse porque no sé defenderlas", "no sé trabajar con stakeholders sin perder mi criterio", "quiero incorporar IA a mi proceso de diseño"],
    sesiones: "6 sesiones + 1 personalizada",
    nSesiones: 6,
    precio: 1100,
    foto: "https://ui-avatars.com/api/?name=Juan+Cejas&background=7b2ff7&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/JuanCejas",
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
    color: "#9b5fff",
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
  {
    id: "buscado_job_search_pm",
    titulo: "Mentor de Búsqueda de Trabajo en Producto",
    descripcion: "Alguien que haya contratado PMs o que haya navegado exitosamente el proceso de búsqueda en producto. Conoce el CV, el portfolio, las entrevistas de caso y la negociación de oferta.",
    patas: ["producto"],
    nivel: "senior",
    problemas_que_resuelve: [
      "no sé cómo entrar al mundo del producto",
      "no tengo portfolio de producto",
      "no paso las entrevistas de PM",
      "quiero cambiar de empresa pero no sé cómo posicionarme",
      "no sé cuánto pedir de salario",
    ],
    donde_buscarlo: ["LinkedIn", "comunidades de producto", "ex-recruiters tech"],
    icono: "🧭",
    color: "#3a86ff",
  },
  {
    id: "buscado_operations_automation",
    titulo: "Mentor de Operaciones y Automatización",
    descripcion: "Especialista en eficiencia operativa y automatización de procesos usando herramientas no-code y low-code. Para equipos de producto que pierden tiempo en procesos manuales.",
    patas: ["tech", "producto"],
    nivel: "mid",
    problemas_que_resuelve: [
      "mis procesos son manuales y consumen mucho tiempo",
      "no sé automatizar flujos de trabajo",
      "pierdo tiempo en tareas repetitivas",
      "no tengo un sistema operativo claro en mi equipo",
    ],
    donde_buscarlo: ["Make/Zapier communities", "No-code Latam", "LinkedIn operaciones"],
    icono: "⚡",
    color: "#ffd166",
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
+ "LOOP PROFESIONAL — clasificá el estado del usuario en el campo 'estado':\n"
+ "- Reinvención: entra a producto, cambia de industria, quiere emprender, ser mentor, advisor, founder\n"
+ "- Estancamiento: bloqueado, reactivo, sin sistema, mismo rol, sin crecimiento, frustr, caos\n"
+ "- Liderazgo: quiere liderar equipo, manager, head, director, sin autoridad formal, escalar impacto\n\n"
+ "Cuando tengas suficiente info incluí al final:\n<DIAGNOSIS>\n"
+ "{\"nivel_actual\":{\"tech\":0,\"producto\":0,\"negocio\":0},\"nivel_objetivo\":{\"tech\":0,\"producto\":0,\"negocio\":0},\"gaps\":[\"gap1\"],\"estado\":\"Estancamiento\",\"mentores_recomendados\":[{\"id\":\"ID\",\"razon\":\"razon\",\"prioridad\":1}],\"mentor_buscado_id\":null,\"mentor_prototipo\":null,\"proximos_pasos\":[\"paso1\"]}\n"
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
// ── Tokens de tema (dark mode fijo) ──────────────────────────
var T = {
  bg:           "#0d0d1a",
  header:       "rgba(13,13,26,0.97)",
  card:         "rgba(255,255,255,0.04)",
  border:       "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.15)",
  pillars:      "rgba(255,255,255,0.015)",
  chat:         "#0d0d1a",
  inputBg:      "rgba(255,255,255,0.04)",
  inputBorder:  "rgba(255,255,255,0.1)",
  sectionBg:    "rgba(255,255,255,0.03)",
  highlightBg:  "rgba(255,255,255,0.06)",
  text:         "rgba(255,255,255,0.88)",
  textSub:      "rgba(255,255,255,0.55)",
  textMuted:    "rgba(255,255,255,0.45)",
  textDisabled: "rgba(255,255,255,0.25)",
  textOnPrimary:"white",
  textWhite:    "white",
  msgUser:      "rgba(67,97,238,0.14)",
  msgUserBorder:"rgba(67,97,238,0.35)",
  msgBot:       "rgba(255,255,255,0.05)",
  msgBotBorder: "rgba(255,255,255,0.08)",
  msgLabel:     "#6b87f5",
  toggleBg:     "rgba(255,255,255,0.06)",
  backBtn:      "rgba(255,255,255,0.06)",
  backBtnBorder:"rgba(255,255,255,0.1)",
  backBtnColor: "rgba(255,255,255,0.6)",
};

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
      <div style={{ width: sz, height: sz, borderRadius: "50%", flexShrink: 0, border: border, display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: T.textWhite, fontSize: Math.round(sz * 0.35), fontWeight: "700", fontFamily: "sans-serif" }}>
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

  // Opción A: todos los mentores, paquete completo
  var precioA = mentors.reduce(function(s, m) { return s + m.precio; }, 0);
  var descA   = Math.round(precioA * DISCOUNT);
  var finalA  = precioA - descA;

  // Opción B: 1 sesión de cada mentor
  var precioB = mentors.reduce(function(s, m) { return s + m.precio / m.nSesiones; }, 0);
  var descB   = Math.round(precioB * DISCOUNT);
  var finalB  = Math.round(precioB - descB);

  // Opción C: mejor match individual (prioridad 1), paquete completo con descuento
  var topMentor = mentors[0];
  var precioC   = topMentor ? topMentor.precio : 0;
  var descC     = Math.round(precioC * DISCOUNT);
  var finalC    = precioC - descC;

  var precio = opcion === "A" ? precioA : opcion === "B" ? precioB : precioC;
  var desc   = opcion === "A" ? descA   : opcion === "B" ? descB   : descC;
  var finalP = opcion === "A" ? finalA  : opcion === "B" ? finalB  : finalC;

  function buildHistorial() {
    return (allMessages || []).slice(1).map(function(m) {
      var txt = m.content.replace(/<DIAGNOSIS>[\s\S]*?<\/DIAGNOSIS>/g, "").trim();
      if (!txt) return null;
      return (m.role === "user" ? "Yo" : "Mentorcito") + ": " + txt;
    }).filter(Boolean).join("\n\n");
  }

  function buildWaText() {
    var t = "Paquete: " + packageName + "\nOpcion: " + opcion + "\nNombre: " + nombre + "\nEmail: " + email + (wa ? "\nWA: " + wa : "") + "\n\nMentores:\n";
    var mentorsToShow = opcion === "C" ? [topMentor] : mentors;
    mentorsToShow.forEach(function(m, i) {
      var p = opcion === "A" ? m.precio : opcion === "B" ? Math.round(m.precio / m.nSesiones) : m.precio;
      var s = opcion === "A" ? m.sesiones : opcion === "B" ? "1 sesion" : m.sesiones;
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
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: T.textSub, textTransform: "uppercase", marginBottom: 6 }}>Paquete 100% personalizado</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.textWhite, marginBottom: 14 }}>{packageName}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {mentors.map(function(m, i) {
            return (
              <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -10, zIndex: mentors.length - i, position: "relative" }}>
                <MentorAvatar src={m.foto} nombre={m.nombre} sz={38} border="2px solid rgba(255,255,255,0.4)" />
              </div>
            );
          })}
          <span style={{ color: T.text, fontSize: 12, marginLeft: 12, fontWeight: 600 }}>{mentors.length} mentores · {totalSesiones} sesiones</span>
        </div>
      </div>

      <div style={{ padding: "20px 22px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>Elegí tu opción</div>
          <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
            {[
              { k: "A", label: "Opción A — Paquete completo", sub: totalSesiones + " sesiones · " + mentors.length + " mentores", fp: finalA, badge: null },
              { k: "B", label: "Opción B — 1 sesión por mentor", sub: mentors.length + " sesiones · 1 por mentor", fp: finalB, badge: null },
              { k: "C", label: "Opción C — Mejor match individual", sub: (topMentor ? topMentor.nSesiones + " sesiones · " + topMentor.nombre : ""), fp: finalC, badge: "INTERMEDIA" },
            ].map(function(opt) {
              var isSelected = opcion === opt.k;
              return (
                <button key={opt.k} onClick={function() { setOpcion(opt.k); }}
                  style={{ width: "100%", padding: 12, borderRadius: 12, cursor: "pointer", textAlign: "left", background: isSelected ? "rgba(67,97,238,0.2)" : "rgba(255,255,255,0.03)", border: "2px solid " + (isSelected ? "#4361ee" : "rgba(255,255,255,0.08)"), position: "relative" }}>
                  {opt.badge && (
                    <span style={{ position: "absolute", top: -1, right: 12, background: "#7b2ff7", color: T.textWhite, fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "2px 8px", borderRadius: "0 0 6px 6px", textTransform: "uppercase" }}>{opt.badge}</span>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ color: T.textWhite, fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{opt.label}</div>
                      <div style={{ color: C.textSecondary, fontSize: 11 }}>{opt.sub}</div>
                    </div>
                    <div style={{ color: isSelected ? "white" : "rgba(255,255,255,0.5)", fontSize: 20, fontWeight: 800, flexShrink: 0, marginLeft: 12 }}>USD {opt.fp}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {(opcion === "C" ? [topMentor] : mentors).map(function(m, i) {
          var pM = opcion === "A" ? m.precio : opcion === "B" ? Math.round(m.precio / m.nSesiones) : m.precio;
          var sM = opcion === "A" ? m.sesiones : opcion === "B" ? "1 sesión" : m.sesiones;
          return (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 8, background: T.sectionBg, border: "1px solid " + T.border, borderRadius: 12 }}>
              <MentorAvatar src={m.foto} nombre={m.nombre} sz={44} border="1.5px solid rgba(255,255,255,0.1)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: T.textWhite, fontSize: 13, fontWeight: 700 }}>{m.nombre}</div>
                <div style={{ color: C.textSecondary, fontSize: 11, marginTop: 2 }}>{sM} · {m.mentoria.slice(0, 50)}...</div>
              </div>
              <div style={{ color: T.textWhite, fontSize: 14, fontWeight: 700, flexShrink: 0 }}>USD {pM}</div>
            </div>
          );
        })}

        <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 14, padding: "16px 18px", margin: "16px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ color: C.textSecondary, fontSize: 13 }}>
              {opcion === "A" ? "Paquetes individuales (" + mentors.length + " mentores)" :
               opcion === "C" ? "Paquete " + (topMentor ? topMentor.nombre.split(" ")[0] : "") + " (" + (topMentor ? topMentor.nSesiones : 0) + " sesiones)" :
               "1 sesión × " + mentors.length + " mentores"}
            </span>
            <span style={{ color: C.textSecondary, fontSize: 13, textDecoration: "line-through" }}>USD {Math.round(precio)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ padding: "2px 8px", borderRadius: 20, background: "rgba(247,37,133,0.18)", border: "1px solid rgba(247,37,133,0.4)", color: "#ff6db5", fontSize: 11, fontWeight: 700 }}>−20% paquete</span>
            <span style={{ color: "#f72585", fontSize: 13, fontWeight: 700 }}>−USD {desc}</span>
          </div>
          <div style={{ height: 1, background: T.highlightBg, marginBottom: 14 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ color: T.textWhite, fontSize: 15, fontWeight: 800 }}>Total</div>
              <div style={{ color: "#f72585", fontSize: 11, fontWeight: 600 }}>Ahorrás USD {desc}</div>
            </div>
            <div style={{ color: T.textWhite, fontSize: 28, fontWeight: 800 }}>USD {finalP}</div>
          </div>
        </div>

        {formStep === "idle" && (
          <button onClick={function() { setFormStep("form"); trackEvent("abrio_formulario", true); trackEvent("opcion", opcion); }}
            style={{ width: "100%", padding: 14, background: "linear-gradient(135deg, #4361ee, #7b2ff7)", border: "none", borderRadius: 12, color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            Quiero este paquete
          </button>
        )}

        {formStep === "form" && (
          <div style={{ background: T.sectionBg, border: "1px solid " + T.border, borderRadius: 14, padding: 18 }}>
            <div style={{ color: T.textWhite, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Dejanos tus datos</div>
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
                    style={{ width: "100%", padding: "10px 12px", background: T.card, border: "1px solid " + T.borderStrong, borderRadius: 8, color: T.text, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
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
                style={{ flex: 1, padding: 12, borderRadius: 10, background: ready ? "#4361ee" : "rgba(255,255,255,0.04)", border: "1px solid " + (ready ? "#4361ee" : "rgba(255,255,255,0.07)"), color: ready ? "white" : "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center", cursor: ready ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
            <div style={{ color: T.textWhite, fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Listo!</div>
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
            <div style={{ fontSize: 18, fontWeight: 800, color: T.textWhite, lineHeight: "1.2" }}>{buscado.titulo}</div>
          </div>
        </div>
        <div style={{ color: T.textSub, fontSize: 13, lineHeight: "1.6" }}>
          {buscado.descripcion}
        </div>
      </div>

      {/* Problemas que resuelve */}
      <div style={{ background: T.sectionBg, border: "1px solid " + T.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
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
      <div style={{ background: T.sectionBg, border: "1px solid " + T.border, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ color: T.textSub, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
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
        <div style={{ color: T.textWhite, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Sumate a la lista de espera</div>
        <div style={{ color: T.textSub, fontSize: 12, lineHeight: "1.6", marginBottom: 12 }}>
          Te avisamos cuando este mentor esté disponible en la plataforma. También podés ayudarnos a encontrarlo.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href={"https://wa.me/5491170043893?text=" + buildWaText()}
            target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#25D366", color: "#003d14", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            💬 Anotarme en lista de espera
          </a>
          <a href={"https://mentoresconproposito.vercel.app/alta-mentores"}
            target="_blank" rel="noopener noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: T.highlightBg, border: "1px solid rgba(255,255,255,0.15)", color: T.textSub, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
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
      color: "#9b5fff",
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
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: T.textSub, textTransform: "uppercase", marginBottom: 3 }}>No encontramos match exacto en el catálogo</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.textWhite }}>Prototipo de mentor ideal</div>
          </div>
        </div>
        <div style={{ color: T.textSub, fontSize: 13, lineHeight: "1.6" }}>
          Construimos el perfil del mentor que necesitás. Usalo como brief para buscarlo en plataformas externas o para reconocerlo cuando lo encuentres.
        </div>
      </div>

      {/* Sections */}
      {sections.map(function(s) {
        var hasContent = s.content && (Array.isArray(s.content) ? s.content.length > 0 : s.content.length > 0);
        if (!hasContent) return null;
        return (
          <div key={s.title} style={{ background: T.sectionBg, border: "1px solid " + T.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ color: s.color, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{s.title}</span>
            </div>
            {s.type === "text" && (
              <div style={{ color: T.text, fontSize: 14, lineHeight: "1.6" }}>{s.content}</div>
            )}
            {s.type === "list" && (
              <div>
                {s.content.map(function(item, i) {
                  return (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, marginTop: 6, flexShrink: 0 }} />
                      <span style={{ color: T.text, fontSize: 13, lineHeight: "1.5" }}>{item}</span>
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
                      <span style={{ color: T.text, fontSize: 13, lineHeight: "1.6", fontStyle: "italic" }}>{item}</span>
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
        <div style={{ color: T.textWhite, fontSize: 13, fontWeight: 700, marginBottom: 6 }}>¿Conocés a alguien que encaje en este perfil?</div>
        <div style={{ color: T.textSub, fontSize: 12, lineHeight: "1.6", marginBottom: 12 }}>
          Compartile este diagnóstico o contactanos — estamos construyendo el catálogo de mentores y podría sumar.
        </div>
        <a href={"https://wa.me/5491170043893?text=" + buildWaText()}
          target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#25D366", color: "#003d14", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          💬 Enviar diagnóstico completo por WhatsApp
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SCORE DE RIESGO PROFESIONAL
// ─────────────────────────────────────────────
function calcularScore(diagnosis) {
  var nAct = diagnosis.nivel_actual  || {};
  var nObj = diagnosis.nivel_objetivo || {};
  var gapTotal = ((nObj.tech||0)-(nAct.tech||0)) + ((nObj.producto||0)-(nAct.producto||0)) + ((nObj.negocio||0)-(nAct.negocio||0));
  var scoreGap   = Math.min(30, gapTotal * 3.3);
  var minPata    = Math.min(nAct.tech||0, nAct.producto||0, nAct.negocio||0);
  var scorePata  = Math.min(25, (10 - minPata) * 2.5);
  var scoreEstado = { "Estancamiento":25, "Liderazgo":18, "Reinvención":15 }[diagnosis.estado] || 20;
  var maxPata    = Math.max(nAct.tech||0, nAct.producto||0, nAct.negocio||0);
  var scoreDeseq = Math.min(20, (maxPata - minPata) * 4);
  return Math.round(scoreGap + scorePata + scoreEstado + scoreDeseq);
}

function nivelScore(score) {
  if (score >= 76) return { label: "Alto",           color: "#f72585", desc: "Riesgo real de quedarte donde estás" };
  if (score >= 56) return { label: "Moderado-Alto",  color: "#fb8500", desc: "El momento de actuar es ahora" };
  if (score >= 31) return { label: "Moderado",       color: "#ffd166", desc: "Hay tensión acumulada que conviene resolver" };
  return             { label: "Bajo",                color: "#06d6a0", desc: "Estás en una etapa de consolidación" };
}

// ─────────────────────────────────────────────
// PANTALLA POST-DIAGNÓSTICO
// ─────────────────────────────────────────────
var ESTADO_META_AGENT = {
  "Estancamiento": {
    icono: "🔁",
    taglines: [
      "Tenés el conocimiento. Te falta el sistema para usarlo.",
      "Sabés hacer tu trabajo. Pero ya no te está llevando a ningún lado nuevo.",
      "El problema no es tu capacidad. Es que el contexto dejó de desafiarte.",
      "Dominás el rol. Pero el rol ya no te hace crecer.",
    ],
    identidades: [
      "PM con experiencia bloqueada",
      "Profesional que superó su rol actual",
      "Experto/a en zona de confort",
    ],
    tensiones: [
      "Sin un cambio estructural, el estancamiento tiende a profundizarse. El 68% de los PMs en este estado reportan estar en la misma situación 12 meses después.",
      "El estancamiento no duele al principio. Duele cuando te das cuenta de cuánto tiempo pasó sin que nada cambie.",
      "La comodidad operativa es la trampa más difícil de ver. Porque todo funciona, pero nada crece.",
    ],
  },
  "Liderazgo": {
    icono: "📈",
    taglines: [
      "Estás lista/o para liderar. Pero nadie te está esperando ahí arriba.",
      "El siguiente paso existe. El problema es que nadie te lo va a dar.",
      "Ya no alcanza con ser buena/o ejecutando. Ahora tenés que hacer que otros sean buenos.",
      "La transición no es un ascenso. Es un cambio de identidad.",
    ],
    identidades: [
      "Profesional en transición a liderazgo",
      "Ejecutor/a lista/o para el salto estratégico",
      "PM que está dejando de hacer para empezar a liderar",
    ],
    tensiones: [
      "La transición a liderazgo es el momento de mayor abandono profesional en producto. Sin apoyo específico, el 54% regresa a roles de ejecución.",
      "La mayoría de los PMs que aspiran a liderar nunca llegan porque no saben cuándo dejaron de ser ejecutores para ser estrategas.",
      "El liderazgo no se practica en el papel. Se practica antes de tenerlo.",
    ],
  },
  "Reinvención": {
    icono: "🔀",
    taglines: [
      "Cambiar es la parte fácil. Aterrizar el cambio es lo difícil.",
      "Sabés que tenés que moverte. El problema es hacia dónde exactamente.",
      "La energía está. La dirección todavía no.",
      "Estás en el punto más importante de tu carrera. Y también el más incierto.",
    ],
    identidades: [
      "Profesional en reinvención activa",
      "Experto/a buscando nuevo contexto",
      "PM en transición a un nuevo ciclo",
    ],
    tensiones: [
      "Las reinvenciones sin estructura duran en promedio 8 meses antes de que la persona vuelva a lo conocido. El timing es crítico.",
      "La reinvención profesional no es una decisión. Es un proceso. Y la mayoría lo subestima.",
      "El mayor riesgo de la reinvención no es fallar. Es aterrizar en un lugar parecido al que dejaste.",
    ],
  },
};

function elegirVariante(arr, seed) {
  return arr[seed % arr.length];
}

function PantallaPostDiagnostico(props) {
  var diagnosis = props.diagnosis;
  var onContinuar = props.onContinuar;
  if (!diagnosis) return null;

  var estado = diagnosis.estado || "Estancamiento";
  if (estado.indexOf("Liderazgo") !== -1 || estado.indexOf("Transici") !== -1) estado = "Liderazgo";
  else if (estado.indexOf("Reinven") !== -1) estado = "Reinvención";
  else estado = "Estancamiento";

  var score = calcularScore(diagnosis);
  var nivel = nivelScore(score);
  var meta  = ESTADO_META_AGENT[estado] || ESTADO_META_AGENT["Estancamiento"];

  var tagline   = elegirVariante(meta.taglines,    score);
  var identidad = elegirVariante(meta.identidades, score + 1);
  var tension   = elegirVariante(meta.tensiones,   score + 2);

  var nAct = diagnosis.nivel_actual || {};
  var pataMin = "producto";
  var valMin  = 999;
  ["tech","producto","negocio"].forEach(function(p) {
    if ((nAct[p]||0) < valMin) { valMin = nAct[p]||0; pataMin = p; }
  });
  var pataLabels = { tech: "tecnologia", producto: "producto", negocio: "negocio" };
  var gaps = (diagnosis.gaps || []).slice(0, 2);

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ background: "linear-gradient(135deg, rgba(67,97,238,0.12), rgba(123,47,247,0.08))", border: "1px solid rgba(67,97,238,0.3)", borderRadius: 16, padding: "22px 20px", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 28 }}>{meta.icono}</span>
          <div>
            <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Tu estado profesional hoy</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.textWhite }}>{estado}</div>
          </div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.92)", lineHeight: "1.4", marginBottom: 14, fontStyle: "italic", borderLeft: "3px solid #4361ee", paddingLeft: 12 }}>
          {tagline}
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Lo que detectamos</div>
          {gaps.map(function(g, i) {
            return (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                <span style={{ color: "#4361ee", fontSize: 12, flexShrink: 0, marginTop: 1 }}>▸</span>
                <span style={{ color: T.text, fontSize: 13, lineHeight: "1.4" }}>{g}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "10px 12px", background: T.card, borderRadius: 8, border: "1px solid " + T.border }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>Tu identidad profesional actual</div>
          <div style={{ color: T.textSub, fontSize: 12, fontWeight: 600 }}>
            {identidad} · brecha en {pataLabels[pataMin]}
          </div>
        </div>
      </div>

      <div style={{ background: nivel.color + "10", border: "1px solid " + nivel.color + "40", borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Score de Riesgo Profesional</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: T.textWhite, lineHeight: 1 }}>{score}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: nivel.color, marginBottom: 2 }}>{nivel.label}</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>de 100 posibles</div>
          </div>
        </div>
        <div style={{ height: 8, background: T.highlightBg, borderRadius: 4, marginBottom: 10, position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: score + "%", background: "linear-gradient(90deg, #4361ee, " + nivel.color + ")", borderRadius: 4 }} />
        </div>
        <div style={{ color: nivel.color, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>{nivel.desc}</div>
        <div style={{ color: T.textSub, fontSize: 12, lineHeight: "1.6" }}>{tension}</div>
      </div>

      <button onClick={onContinuar}
        style={{ width: "100%", padding: "14px 20px", background: "linear-gradient(135deg, #4361ee, #7b2ff7)", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 8 }}>
        Ver mi plan de accion
      </button>
      <div style={{ textAlign: "center", color: T.textMuted, fontSize: 10, marginBottom: 12 }}>
        Tu diagnostico incluye mentores especificos para tu situacion
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: T.highlightBg }} />
        <span style={{ color: T.textDisabled, fontSize: 10 }}>o compartí tu estado</span>
        <div style={{ flex: 1, height: 1, background: T.highlightBg }} />
      </div>
      <button onClick={function() {
        var link = "https://mentorcito.vercel.app?estado=" + encodeURIComponent(estado);
        var texto = meta.icono + " Estoy en " + estado + "\n\n" + tagline + "\n\nHace tu diagnostico gratis:\n" + link;
        if (navigator.share) {
          navigator.share({ title: "Mentorcito - Mi estado profesional", text: texto, url: link });
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(texto);
          alert("Link copiado. Compartilo con quien creas que esta en el mismo estado.");
        }
      }} style={{ width: "100%", marginTop: 10, padding: "10px 16px", background: "transparent", border: "1px solid " + T.border, borderRadius: 10, color: T.textSub, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
        Compartir mi estado con un colega
      </button>
    </div>
  );
}

var ROADMAP_META = {
  "Estancamiento": [
    { mes: "MES 1", titulo: "Diagnóstico profundo", items: ["Mapear tu sistema actual de trabajo", "Identificar el cuello de botella real", "Primer experimento de cambio", "Medir y ajustar"], bloqueado: false },
    { mes: "MES 2", titulo: "Construcción de sistema", items: ["Diseñar tu sistema de producto propio", "Implementar rutinas de decisión"], bloqueado: true },
    { mes: "MES 3", titulo: "Escalado y visibilidad", items: ["Consolidar el cambio", "Posicionarte para el próximo paso"], bloqueado: true },
  ],
  "Liderazgo": [
    { mes: "MES 1", titulo: "Claridad de transición", items: ["Mapear tu brecha actual hacia el liderazgo", "Identificar tu estilo de influencia", "Primer proyecto de liderazgo sin autoridad", "Medir impacto"], bloqueado: false },
    { mes: "MES 2", titulo: "Construcción de presencia", items: ["Desarrollar tu voz estratégica", "Gestionar hacia arriba y hacia los lados"], bloqueado: true },
    { mes: "MES 3", titulo: "Consolidación del rol", items: ["Asumir responsabilidades de liderazgo", "Hacer visible el cambio"], bloqueado: true },
  ],
  "Reinvención": [
    { mes: "MES 1", titulo: "Aterrizaje del cambio", items: ["Mapear tus transferencias reales de valor", "Validar la nueva dirección con evidencia", "Primer paso concreto en el nuevo contexto", "Reducir el riesgo del salto"], bloqueado: false },
    { mes: "MES 2", titulo: "Construcción de credibilidad", items: ["Generar prueba social en el nuevo rol", "Conectar con la nueva comunidad"], bloqueado: true },
    { mes: "MES 3", titulo: "Consolidación", items: ["Cerrar el ciclo anterior", "Abrazar la nueva identidad"], bloqueado: true },
  ],
};

function RoadmapNoventa(props) {
  var estado = props.estado || "Estancamiento";
  var score  = props.score  || 50;
  var nivel  = nivelScore(score);
  var onWA   = props.onWA;
  if (estado.indexOf("Liderazgo") !== -1 || estado.indexOf("Transici") !== -1) estado = "Liderazgo";
  else if (estado.indexOf("Reinven") !== -1) estado = "Reinvención";
  else estado = "Estancamiento";
  var roadmap = ROADMAP_META[estado] || ROADMAP_META["Estancamiento"];

  return (
    <div style={{ marginTop: 12, background: T.sectionBg, border: "1px solid " + T.border, borderRadius: 14, padding: "18px 16px", marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Tu roadmap de 90 días</div>
      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Generado para tu perfil de {estado.toLowerCase()}</div>
      {roadmap.map(function(fase, i) {
        return (
          <div key={i} style={{ marginBottom: 12, opacity: fase.bloqueado ? 0.6 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: fase.bloqueado ? "rgba(255,255,255,0.3)" : "#4361ee", textTransform: "uppercase" }}>{fase.mes}</div>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              {fase.bloqueado && <span style={{ fontSize: 12 }}>🔒</span>}
            </div>
            <div style={{ fontWeight: 700, color: fase.bloqueado ? "rgba(255,255,255,0.4)" : "white", fontSize: 13, marginBottom: 6 }}>{fase.titulo}</div>
            {!fase.bloqueado && fase.items.map(function(item, j) {
              return (
                <div key={j} style={{ display: "flex", gap: 7, marginBottom: 4 }}>
                  <span style={{ color: "#4361ee", fontSize: 11, flexShrink: 0 }}>·</span>
                  <span style={{ color: T.textSub, fontSize: 12, lineHeight: "1.4" }}>{item}</span>
                </div>
              );
            })}
            {fase.bloqueado && (
              <div style={{ fontSize: 11, color: T.textDisabled, fontStyle: "italic" }}>Desbloqueado con mentoría personalizada</div>
            )}
          </div>
        );
      })}
      <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "16px 0" }} />
      <div style={{ fontSize: 12, color: T.textSub, marginBottom: 16, lineHeight: "1.6" }}>
        ¿Querés que un mentor te ayude a ejecutar este plan?
      </div>
      <a href={onWA} target="_blank" rel="noopener noreferrer"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "14px 20px", background: "#25D366", border: "none", borderRadius: 12, color: "#003d14", fontSize: 14, fontWeight: 800, textDecoration: "none", marginBottom: 8 }}>
        💬 Hablar con el equipo sobre mi diagnóstico
      </a>
      <div style={{ textAlign: "center", color: T.textMuted, fontSize: 10, lineHeight: "1.5" }}>
        El equipo responde en menos de 24h. No es una llamada de ventas — es una conversación sobre tu diagnóstico.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CTA ACCORDION — dos caminos, el usuario elige
// ─────────────────────────────────────────────
function CtaAccordion(props) {
  var onRoadmap     = props.onRoadmap;
  var diagnosis     = props.diagnosis;
  var mentorsToShow = props.mentorsToShow;
  var allMessages   = props.allMessages;
  var trackEvent    = props.trackEvent || function() {};
  var hasMatch      = props.hasMatch;
  var [open, setOpen] = useState(null); // null | "roadmap" | "paquete"

  return (
    <div style={{ marginTop: 20 }}>
      {/* Separador */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        <span style={{ color: T.textDisabled, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>¿Cómo querés avanzar?</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
      </div>

      {/* Opción A — Plan de acción */}
      <div style={{ marginBottom: 8, border: "1px solid " + (open === "roadmap" ? "rgba(67,97,238,0.5)" : "rgba(255,255,255,0.09)"), borderRadius: 12, overflow: "hidden", transition: "border 0.2s" }}>
        <button onClick={function() { setOpen(open === "roadmap" ? null : "roadmap"); }}
          style={{ width: "100%", padding: "14px 18px", background: open === "roadmap" ? "rgba(67,97,238,0.12)" : "rgba(255,255,255,0.03)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>🗺️</span>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: T.textWhite, fontSize: 13, fontWeight: 700 }}>Quiero un plan de acción</div>
              <div style={{ color: T.textMuted, fontSize: 11 }}>Roadmap de 90 días + conversación con el equipo</div>
            </div>
          </div>
          <span style={{ color: T.textSub, fontSize: 16, transform: open === "roadmap" ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>›</span>
        </button>
        {open === "roadmap" && (
          <div style={{ padding: "0 18px 16px", background: T.sectionBg }}>
            <div style={{ color: T.text, fontSize: 12, lineHeight: "1.6", marginBottom: 14, paddingTop: 12 }}>
              Te mostramos tu roadmap de 90 días personalizado y te conectamos con el equipo para entender qué opciones tenés. Sin presión de venta.
            </div>
            <button onClick={onRoadmap}
              style={{ width: "100%", padding: "12px 18px", background: "linear-gradient(135deg, #4361ee, #7b2ff7)", border: "none", borderRadius: 10, color: "white", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
              Ver mi roadmap →
            </button>
          </div>
        )}
      </div>

      {/* Opción B — Paquete directo (solo si hay match) */}
      {hasMatch && (
        <div style={{ marginBottom: 4, border: "1px solid " + (open === "paquete" ? "rgba(123,47,247,0.5)" : "rgba(255,255,255,0.09)"), borderRadius: 12, overflow: "hidden", transition: "border 0.2s" }}>
          <button onClick={function() { setOpen(open === "paquete" ? null : "paquete"); trackEvent("vio_paquete", true); }}
            style={{ width: "100%", padding: "14px 18px", background: open === "paquete" ? "rgba(123,47,247,0.12)" : "rgba(255,255,255,0.03)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <div style={{ textAlign: "left" }}>
                <div style={{ color: T.textWhite, fontSize: 13, fontWeight: 700 }}>Quiero contratar una mentoría</div>
                <div style={{ color: T.textMuted, fontSize: 11 }}>Ver el paquete personalizado con opciones A, B y C</div>
              </div>
            </div>
            <span style={{ color: "rgba(123,47,247,0.8)", fontSize: 16, transform: open === "paquete" ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.2s" }}>›</span>
          </button>
          {open === "paquete" && (
            <div style={{ padding: "0 0 0 0" }}>
              <PackagePanel diagnosis={diagnosis} mentors={mentorsToShow} allMessages={allMessages} trackEvent={trackEvent} onVisible={function(){}} />
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 10, color: T.textDisabled, fontSize: 10 }}>
        Podés explorar las dos opciones antes de decidir
      </div>
    </div>
  );
}

function DiagnosisPanel(props) {
  var diagnosis    = props.diagnosis;
  var allMessages  = props.allMessages;
  var trackEvent   = props.trackEvent  || function() {};
  var postToSheets = props.postToSheets || function() {};
  var diagKey      = props.diagKey     || null;
  var [step, setStep]       = useState("insight");
  var [userEmail, setUserEmail] = useState("");
  var [userName, setUserName]   = useState("");
  if (!diagnosis) return null;

  var mentorsToShow = (diagnosis.mentores_recomendados || []).map(function(rec) {
    var recId = (rec.id || "").trim();
    var found = MENTORS_DB.find(function(m) { return m.id === recId; });
    if (!found) {
      var recLow = recId.toLowerCase().replace(/\s+/g, "");
      found = MENTORS_DB.find(function(m) {
        return m.id.toLowerCase() === recLow ||
               m.nombre.toLowerCase().replace(/\s+/g,"").indexOf(recLow) !== -1 ||
               recLow.indexOf(m.id.toLowerCase()) !== -1;
      });
    }
    return found ? Object.assign({}, found, { razon: rec.razon }) : null;
  }).filter(Boolean);

  var hasMatch  = mentorsToShow.length > 0;
  var prototipo = diagnosis.mentor_prototipo || null;
  var buscadoId = diagnosis.mentor_buscado_id || null;
  var buscado   = buscadoId ? MENTORS_BUSCADOS.find(function(b) { return b.id === buscadoId; }) || null : null;
  var score     = calcularScore(diagnosis);

  var estado = diagnosis.estado || "Estancamiento";
  if (estado.indexOf("Liderazgo") !== -1 || estado.indexOf("Transici") !== -1) estado = "Liderazgo";
  else if (estado.indexOf("Reinven") !== -1) estado = "Reinvención";
  else estado = "Estancamiento";

  function buildWaMsg() {
    var gaps = (diagnosis.gaps || []).slice(0, 3).map(function(g) { return "\u2022 " + g; }).join("\n");
    return "https://wa.me/5491170043893?text=" + encodeURIComponent(
      "Hola! Acabo de hacer el diagnóstico con Mentorcito.\n\n" +
      "Mi estado: " + estado + "\nScore de riesgo: " + score + "/100\n\n" +
      "Gaps detectados:\n" + gaps + "\n\nMe gustaría entender qué opciones tengo."
    );
  }

  // STEP 1 — Insight psicológico + score
  if (step === "insight") {
    return (
      <div style={{ marginTop: 16 }}>
        <PantallaPostDiagnostico
          diagnosis={Object.assign({}, diagnosis, { estado: estado })}
          onContinuar={function() { setStep("email"); }}
          />
      </div>
    );
  }

  // STEP EMAIL — captura liviana antes de ver el plan
  if (step === "email") {
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ background: T.sectionBg, border: "1px solid " + T.border, borderRadius: 16, padding: "22px 18px" }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Antes de continuar</div>
          <div style={{ color: T.textWhite, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            Te mandamos tu diagnóstico por email
          </div>
          <div style={{ color: T.textSub, fontSize: 12, lineHeight: "1.6", marginBottom: 18 }}>
            Para que lo tengas guardado y puedas revisarlo cuando quieras. Es opcional.
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 5 }}>Tu nombre</div>
            <input
              value={userName}
              onChange={function(e) { setUserName(e.target.value); }}
              placeholder="Ej: Martín García"
              style={{ width: "100%", padding: "10px 12px", background: T.card, border: "1px solid " + T.borderStrong, borderRadius: 8, color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 5 }}>Tu email</div>
            <input
              value={userEmail}
              onChange={function(e) { setUserEmail(e.target.value); }}
              placeholder="tu@email.com"
              type="email"
              style={{ width: "100%", padding: "10px 12px", background: T.card, border: "1px solid " + T.borderStrong, borderRadius: 8, color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>

          <button onClick={function() {
            if (userEmail && diagKey) {
              postToSheets({
                action: "update_contact",
                diag_key: diagKey,
                nombre: userName,
                email: userEmail,
              });
              trackEvent("dejo_email", true);
            }
            setStep("mentores");
            trackEvent("vio_paquete", true);
          }}
            style={{ width: "100%", padding: "13px 18px", background: "linear-gradient(135deg, #4361ee, #7b2ff7)", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 10 }}>
            Ver mi plan de acción →
          </button>

          <button onClick={function() { setStep("mentores"); trackEvent("vio_paquete", true); }}
            style={{ width: "100%", padding: "9px 18px", background: "transparent", border: "none", color: T.textMuted, fontSize: 12, cursor: "pointer" }}>
            Continuar sin guardar
          </button>
        </div>
      </div>
    );
  }

  // STEP 2 — Mentores + radar + gaps
  if (step === "mentores") {
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 16, padding: 20, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <RadarChart data={diagnosis} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 14 }}>
            {[["Actual", C.primary], ["Objetivo", C.gap]].map(function(x) {
              return (
                <div key={x[0]} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: x[1] }} />
                  <span style={{ color: C.textSecondary, fontSize: 10 }}>{x[0]}</span>
                </div>
              );
            })}
          </div>
          {["tech", "producto", "negocio"].map(function(key) {
            var lbl = { tech: "Tecnología", producto: "Producto", negocio: "Negocio" };
            var act = (diagnosis.nivel_actual  || {})[key] || 0;
            var obj = (diagnosis.nivel_objetivo || {})[key] || 0;
            var gap = obj - act;
            return (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: C.text, fontSize: 12, fontWeight: 600 }}>{lbl[key]}</span>
                  <span style={{ color: gap > 0 ? C.gap : C.primary, fontSize: 11, fontWeight: 600 }}>{act} → {obj}</span>
                </div>
                <div style={{ height: 5, background: T.highlightBg, borderRadius: 3, position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: (act*10)+"%", background: C.primary, borderRadius: 3 }} />
                  {gap > 0 && <div style={{ position: "absolute", left: (act*10)+"%", top: 0, height: "100%", width: (gap*10)+"%", background: "rgba(247,37,133,0.5)", borderRadius: 3 }} />}
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
                <div key={m.id} style={{ background: C.bgCard, border: "1px solid " + (i===0?C.primaryBorder:C.border), borderRadius: 14, padding: 16, marginBottom: 10, position: "relative" }}>
                  {i===0 && <div style={{ position: "absolute", top: -1, right: 14, background: C.primary, color: "white", fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: "3px 10px", borderRadius: "0 0 8px 8px", textTransform: "uppercase" }}>Mejor match</div>}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <MentorAvatar src={m.foto} nombre={m.nombre} sz={48} border={"2px solid "+(i===0?C.primaryBorder:C.border)} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{m.nombre}</div>
                      <div style={{ color: T.msgLabel, fontSize: 11, marginBottom: 8 }}>{m.titulo}</div>
                      <div style={{ color: "rgba(67,97,238,0.9)", fontSize: 12, lineHeight: "1.4", marginBottom: 10, background: "rgba(67,97,238,0.18)", padding: "7px 10px", borderRadius: 7, fontStyle: "italic", color: T.text, border: "1px solid " + T.border }}>{m.razon}</div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                        {m.tags.map(function(tag){ return <span key={tag} style={{ padding: "2px 8px", borderRadius: 20, background: "rgba(67,97,238,0.25)", color: T.text, fontSize: 10, fontWeight: 600 }}>{tag}</span>; })}
                      </div>
                      <a href={m.url} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: i===0?C.primary:"transparent", color: i===0?"white":C.primary, fontSize: 12, fontWeight: 700, textDecoration: "none", border: "1.5px solid "+C.primary }}>
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
                <span style={{ minWidth: 20, height: 20, borderRadius: "50%", background: C.success, color: "white", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i+1}</span>
                <span style={{ color: C.textSecondary, fontSize: 13, lineHeight: "1.5" }}>{paso}</span>
              </div>
            );
          })}
        </div>

        {/* ── CTA accordion: dos caminos, el usuario elige ── */}
        <CtaAccordion
          onRoadmap={function(){ setStep("roadmap"); trackEvent("abrio_formulario", true); }}
          diagnosis={diagnosis}
          mentorsToShow={mentorsToShow}
          allMessages={allMessages}
          trackEvent={trackEvent}
          hasMatch={hasMatch}
         
        />
      </div>
    );
  }

  // STEP 3 — Roadmap 90 días + WA directo
  return (
    <div style={{ marginTop: 16 }}>
      <RoadmapNoventa estado={estado} score={score} onWA={buildWaMsg()} />
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// LANDING DE ESTADO COMPARTIDO
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// LOOP PROFESIONAL — metadatos para landing
// ─────────────────────────────────────────────
var LOOP_META = {
  "Reinvención": {
    icono: "🔀", color: "#f72585",
    descripcion: "Entrada a producto o salida hacia un nuevo ciclo. Founder, Advisor, Mentor, nueva industria. Alta energía, alta incertidumbre.",
    tagline: "Cambiar es la parte fácil. Aterrizar el cambio es lo difícil.",
  },
  "Estancamiento": {
    icono: "🔁", color: "#fb8500",
    descripcion: "Zona de confort que se volvió trampa. El profesional domina su rol pero siente que no crece. Muy frecuente en PMs de 2-5 años.",
    tagline: "Tenés el conocimiento. Te falta el sistema para usarlo.",
  },
  "Liderazgo": {
    icono: "📈", color: "#4361ee",
    descripcion: "Transición de hacer a liderar. El desafío ya no es técnico sino humano y estratégico. Antesala de la próxima Reinvención.",
    tagline: "Estás listo para liderar. Pero nadie te está esperando ahí arriba.",
  },
};

function EstadoLanding(props) {
  var estado = props.estado;
  var onStart = props.onStart;
  var m = LOOP_META[estado];
  if (!m) return null;

  var PREGUNTAS = {
    "Estancamiento": "Cuanto hace que sentis que no avanzas?",
    "Liderazgo":     "Ya sabes que queres liderar, pero no encontraste como?",
    "Reinvención":   "Estas en un momento de cambio sin saber bien hacia donde?",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans', sans-serif", color: T.text, alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}"}</style>

      <div style={{ maxWidth: 420, width: "100%", animation: "fadeUp 0.4s ease forwards" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, justifyContent: "center" }}>
          <span style={{ fontSize: 20 }}>💠</span>
          <span style={{ color: T.textMuted, fontSize: 13, fontWeight: 600 }}>Mentorcito · Mentores con Propósito</span>
        </div>

        <div style={{ background: m.color + "10", border: "2px solid " + m.color + "40", borderRadius: 20, padding: "28px 24px", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{m.icono}</div>
          <div style={{ fontSize: 10, color: m.color, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Un colega tuyo esta en</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: T.textWhite, marginBottom: 14 }}>{estado}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text, lineHeight: "1.5", fontStyle: "italic", marginBottom: 16, borderLeft: "3px solid " + m.color, paddingLeft: 14, textAlign: "left" }}>
            {m.tagline}
          </div>
          <div style={{ color: T.textSub, fontSize: 13, lineHeight: "1.6" }}>
            {m.descripcion}
          </div>
        </div>

        <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 14, padding: "18px 20px", marginBottom: 20, textAlign: "center" }}>
          <div style={{ color: T.textWhite, fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{PREGUNTAS[estado]}</div>
          <div style={{ color: T.textMuted, fontSize: 12 }}>
            Hace tu diagnostico gratis y descubri en que punto del loop profesional estas vos.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 24 }}>
          {["Reinvención","Estancamiento","Liderazgo"].map(function(e, i) {
            var meta = LOOP_META[e] || {};
            var isActive = e === estado;
            return (
              <div key={e} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ padding: "4px 10px", borderRadius: 20, background: isActive ? meta.color + "25" : "rgba(255,255,255,0.04)", border: "1px solid " + (isActive ? meta.color + "60" : "rgba(255,255,255,0.08)"), color: isActive ? meta.color : "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: isActive ? 700 : 400 }}>
                  {meta.icono} {e}
                </div>
                {i < 2 && <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10 }}>→</span>}
              </div>
            );
          })}
        </div>

        <button onClick={onStart}
          style={{ width: "100%", padding: "16px 20px", background: "linear-gradient(135deg, #4361ee, #7b2ff7)", border: "none", borderRadius: 14, color: "white", fontSize: 15, fontWeight: 800, cursor: "pointer", marginBottom: 10 }}>
          Hacer mi diagnostico gratis
        </button>
        <div style={{ textAlign: "center", color: T.textDisabled, fontSize: 11 }}>
          5 minutos - Sin registro - 100% gratuito
        </div>
      </div>
    </div>
  );
}


var INITIAL_MSG = {
  role: "assistant",
  content: "Hola! Soy **Mentorcito**, tu agente de diagnóstico de carrera en producto.\n\nMi objetivo es entender **dónde estás parado/a hoy** y **a dónde querés llegar**, para conectarte con los mentores que pueden hacer la diferencia en tu camino.\n\nVamos a explorar las **3 patas del producto**:\n🔧 **Tecnología** · 📦 **Producto** · 💼 **Negocio**\n\nAntes de empezar: **¿Cómo te llamás?**",
};

export default function MentorAgent() {
  // Detectar ?estado= en la URL para landing compartida
  var urlParams = new URLSearchParams(window.location.search);
  var estadoParam = urlParams.get("estado");
  var estadoNormalizado = null;
  if (estadoParam) {
    var p = decodeURIComponent(estadoParam).toLowerCase();
    if (p.indexOf("estanc") !== -1) estadoNormalizado = "Estancamiento";
    else if (p.indexOf("lider") !== -1 || p.indexOf("transic") !== -1) estadoNormalizado = "Liderazgo";
    else if (p.indexOf("reinven") !== -1) estadoNormalizado = "Reinvención";
  }

  var [showLanding, setShowLanding] = useState(!!estadoNormalizado);
  var [messages, setMessages] = useState([INITIAL_MSG]);
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var [diagnosis, setDiagnosis] = useState(null);
  var [phase, setPhase] = useState("intro");
  var [currentDiagKey, setCurrentDiagKey] = useState(null);
  var bottomRef = useRef(null);

  // Theme tokens

  // Mostrar landing si viene con ?estado=
  if (showLanding && estadoNormalizado) {
    return <EstadoLanding estado={estadoNormalizado} onStart={function() { setShowLanding(false); }} />;
  }

  // Calcular tema actual en cada render y sincronizar global T

  // Auto-scroll al último mensaje
  useEffect(function() {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // URL del Google Apps Script — reemplazá con la tuya
  var SHEETS_URL = "https://script.google.com/macros/s/AKfycbzzBE8YngAYyH1PsLYKScZ0_V5Xkl7BdK-uHIr-oUFxB5QoerbZeMyEFc4tdjBIdIJcpQ/exec";

  async function postToSheets(payload) {
    try {
      await fetch(SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
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
    // Si hay un <DIAGNOSIS parcial (empieza pero no cierra), ocultar desde ahí
    var diagStart = text.indexOf("<DIAGNOSIS>");
    if (diagStart !== -1) {
      var before = text.slice(0, diagStart).trim();
      // Si hay bloque completo, eliminarlo
      var clean = text.replace(/<DIAGNOSIS>[\s\S]*?<\/DIAGNOSIS>/g, "").trim();
      // Si el bloque no cerró todavía (streaming), mostrar solo lo anterior
      if (text.indexOf("</DIAGNOSIS>") === -1) {
        return before || "";
      }
      return clean;
    }
    return text.trim();
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
      var res = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            // Build chat summary (first 3 user messages)
            var resumen = newMessages.filter(function(m){ return m.role === "user"; })
              .slice(0, 4).map(function(m){ return m.content; }).join(" | ");
            // Extract nombre from messages if agent asked
            var nombreDetectado = "";
            newMessages.forEach(function(m) {
              if (m.role === "user" && m.content.length < 40 && newMessages.indexOf(m) < 4) {
                nombreDetectado = m.content.trim();
              }
            });
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
              nombre: nombreDetectado,
              email: "",
              resumen: resumen,
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
    // Solo enviar con Enter en desktop (no mobile)
    // En mobile, Enter = nueva línea siempre
    var isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
    if (e.key === "Enter" && !e.shiftKey && !isMobile) {
      e.preventDefault();
      sendMessage();
    }
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
          "html,body,#root { height: 100%; }",
          "body { background: #0d0d1a; overscroll-behavior: none; }",
          "::-webkit-scrollbar { width: 3px; }",
          "::-webkit-scrollbar-track { background: transparent; }",
          "::-webkit-scrollbar-thumb { background: rgba(67,97,238,0.3); border-radius: 2px; }",
          "@keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1.2); } }",
          "@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }",
          ".msg-appear { animation: fadeUp 0.3s ease forwards; }",
          "textarea:focus { outline: none; }",
          "textarea { resize: none; }",
          "::placeholder { color: rgba(255,255,255,0.25); }",
          "@media(max-width:640px){textarea,input{font-size:16px!important}}",
        ].join("\n")}
      </style>

      <div style={{ height: "100vh", background: T.bg, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Plus Jakarta Sans', sans-serif", color: T.text }}>

        <div style={{ padding: "0 16px", height: 56, borderBottom: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(13,13,26,0.97)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <a href="https://mentoresconproposito.vercel.app/" style={{ width: 32, height: 32, borderRadius: 8, background: T.highlightBg, border: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSub, fontSize: 16, textDecoration: "none", flexShrink: 0 }}>←</a>
            <span style={{ fontSize: 22 }}>💠</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.textWhite }}>Mentores con Propósito</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)" }}>Agente de diagnóstico</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: phaseColor[phase] + "18", border: "1px solid " + phaseColor[phase] + "44" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: phaseColor[phase] }} />
              <span style={{ fontSize: 11, color: phaseColor[phase], fontWeight: 600 }}>{phaseLabel[phase]}</span>
          </div>
        </div>

        <div style={{ padding: "8px 12px", display: "flex", gap: 6, alignItems: "center", borderBottom: "1px solid " + T.border, background: T.pillars, flexShrink: 0, overflowX: "auto" }}>
          <span style={{ fontSize: 11, color: T.textMuted, marginRight: 4 }}>Exploramos:</span>
          {[{ icon: "🔧", label: "Tecnología", color: "#3a86ff" }, { icon: "📦", label: "Producto", color: "#9b5fff" }, { icon: "💼", label: "Negocio", color: "#f72585" }].map(function(p) {
            return (
              <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, background: p.color + "18", border: "1px solid " + p.color + "35" }}>
                <span style={{ fontSize: 12 }}>{p.icon}</span>
                <span style={{ fontSize: 11, color: p.color, fontWeight: 600 }}>{p.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 12px", display: "flex", flexDirection: "column", gap: 12, WebkitOverflowScrolling: "touch", background: T.chat }}>
          {messages.map(function(msg, i) {
            return (
              <div key={i} className="msg-appear" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginRight: 8, marginTop: 18 }}>💠</div>
                )}
                <div style={{ display: "flex", flexDirection: "column", maxWidth: "85%", gap: 2 }}>
                  {msg.role === "assistant" && (
                    <span style={{ fontSize: 10, color: "#4361ee", fontWeight: 700, letterSpacing: 1, paddingLeft: 2 }}>AGENTE MENTORCITO</span>
                  )}
                  <div style={{ padding: "13px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px", background: msg.role === "user" ? "rgba(67,97,238,0.14)" : "rgba(255,255,255,0.05)", border: "1px solid " + (msg.role === "user" ? "rgba(67,97,238,0.35)" : "rgba(255,255,255,0.08)"), fontSize: 14, lineHeight: "1.6" }}>
                    {formatMessage(msg.content)}
                    {msg.role === "assistant" && diagnosis && i === messages.length - 1 && (
                      <DiagnosisPanel diagnosis={diagnosis} allMessages={messages} trackEvent={trackFunnelEvent} postToSheets={postToSheets} diagKey={currentDiagKey} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>💠</div>
              <div style={{ borderRadius: "4px 18px 18px 18px", background: T.card, border: "1px solid " + T.border, padding: "12px 16px", display: "flex", gap: 5 }}>
                {[0, 1, 2].map(function(i) {
                  return <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary, animation: "pulse 1.2s ease-in-out infinite", animationDelay: (i * 0.2) + "s", opacity: 0.5 }} />;
                })}
              </div>
            </div>
          )}
          <div ref={bottomRef} style={{ height: 1, flexShrink: 0 }} />
        </div>

        <div style={{ padding: "8px 12px 16px", borderTop: "1px solid " + T.border, background: T.header, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: T.card, border: "1.5px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "10px 14px" }}>
            <textarea value={input} onChange={function(e) { setInput(e.target.value); }} onKeyDown={handleKey}
              placeholder="Contame sobre tu situación actual..."
              rows={2}
              style={{ flex: 1, background: "transparent", border: "none", color: T.text, fontSize: 14, lineHeight: "1.5", caretColor: "#4361ee" }} />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              style={{ width: 36, height: 36, borderRadius: 10, background: (input.trim() && !loading) ? "linear-gradient(135deg, #4361ee, #7b2ff7)" : "rgba(255,255,255,0.07)", border: "none", cursor: (input.trim() && !loading) ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, color: (input.trim() && !loading) ? "white" : "rgba(255,255,255,0.25)" }}>
              ➤
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: T.textDisabled }}>En desktop: Enter para enviar · En mobile: botón ➤</span>
          </div>
        </div>
      </div>
    </>
  );
}
