import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// MENTORS DB
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// CATÁLOGO DE SKILLS POR ÁREA
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

// Clasifica gaps de texto libre en skills tipificadas
function clasificarGapsEnSkills(gaps) {
  var resultado = { tech: [], producto: [], negocio: [] };
  var gapsText = (Array.isArray(gaps) ? gaps.join(" ") : gaps || "").toLowerCase();
  Object.keys(SKILLS_CATALOG).forEach(function(area) {
    SKILLS_CATALOG[area].forEach(function(skill) {
      var hit = skill.keywords.some(function(kw) { return gapsText.indexOf(kw.toLowerCase()) !== -1; });
      if (hit) resultado[area].push(skill.id);
    });
  });
  return resultado;
}

// Score de match mentor-usuario basado en skills + patas + problema
function scoreMentorMatch(mentor, diagnosis) {
  var score = 0;
  var gaps = (diagnosis.gaps || []).join(" ").toLowerCase();
  var skills = clasificarGapsEnSkills(diagnosis.gaps || []);
  var nAct = diagnosis.nivel_actual  || {};
  var nObj = diagnosis.nivel_objetivo || {};

  // 1. Match por problema específico declarado (40 pts máx)
  var problemas = mentor.problemas_que_resuelve || [];
  var hitProblemas = problemas.filter(function(p) {
    return p.split(" ").some(function(w) { return w.length > 4 && gaps.indexOf(w.toLowerCase()) !== -1; });
  }).length;
  score += Math.min(40, hitProblemas * 10);

  // 2. Match por skills tipificadas vs patas del mentor (30 pts máx)
  var patas = mentor.patas || [];
  var skillsHit = 0;
  patas.forEach(function(pata) {
    var skillsDelArea = skills[pata] || [];
    skillsHit += skillsDelArea.length;
  });
  score += Math.min(30, skillsHit * 8);

  // 3. Match por gap numérico en patas (20 pts máx)
  var gapPatas = 0;
  patas.forEach(function(pata) {
    var gap = (nObj[pata] || 0) - (nAct[pata] || 0);
    if (gap > 0) gapPatas += gap;
  });
  score += Math.min(20, gapPatas * 2);

  // 4. Match por nivel (10 pts)
  var nivelUsuario = diagnosis.nivel || "mid";
  var nivelMentor  = mentor.nivel   || "mid";
  if (nivelMentor === nivelUsuario) score += 10;
  else if (nivelMentor === "senior-ejecutivo" && nivelUsuario === "senior") score += 6;
  else if (nivelMentor === "senior" && nivelUsuario === "mid") score += 4;

  return score;
}

var MENTORS_DB = [
  {
    id: "GustavoLoustalet",
    nombre: "Gustavo Loustalet",
    titulo: "Fundador de Mentores con Propósito | Product Builder",
    mentoria: "Crea, validá y lanzá tu mentoría: De Senior a Mentor/a en 4 semanas",
    tags: ["Mentoría", "Edtech", "Product Builder"],
    patas: ["producto", "negocio"],
    nivel: "mid-senior",
    skills: { producto: ["estrategia_producto","comunicacion_pm"], negocio: ["marca_personal"] },
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
    skills: { negocio: ["gtm","criterio_estrategico","modelo_negocio"] },
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
    id: "FranciscoSantoloIA",
    nombre: "Francisco Santolo — Del estancamiento a la estrategia de negocio liderada por la IA",
    titulo: "Mentoría Estratégica en IA para Empresas | Harvard, MIT, Stanford Alumni",
    mentoria: "Del estancamiento a la estrategia de negocio liderada por la IA — estrategia primero, tecnología como palanca",
    tags: ["IA", "Estrategia", "Negocio", "Empresas", "Scalabl"],
    patas: ["negocio", "tech"],
    skills: { negocio: ["criterio_estrategico","modelo_negocio"], tech: ["ia_producto"] },
    nivel: "senior-founder",
    perfil_ideal: [
      "Dueños de empresas, PyMEs y scaleups que sienten presión de hacer algo con IA",
      "Líderes que quieren integrar IA en su modelo de negocio con criterio estratégico",
      "Empresas que quieren evitar inversiones innecesarias o mal enfocadas en IA",
      "Founders que buscan impacto real en resultados, no experimentos aislados",
    ],
    problemas_que_resuelve: [
      "siento presión de hacer algo con IA pero no sé por dónde empezar",
      "no tengo claridad sobre para qué, dónde y cómo usar IA en mi empresa",
      "estamos haciendo experimentos de IA pero no conectan con la estrategia del negocio",
      "quiero usar IA para crecer pero no sé si vale la pena invertir",
      "necesito un roadmap estratégico de IA que tenga sentido para mi modelo de negocio",
      "tengo miedo de hacer inversiones innecesarias o mal enfocadas en IA",
      "quiero integrar IA en el corazón de mi modelo de negocio, no como un add-on",
    ],
    sesiones: "4 sesiones estratégicas de 1 hora",
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
    skills: { producto: ["priorizacion","estrategia_producto"], tech: ["ia_producto","prototipado"] },
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
    skills: { producto: ["metricas_producto","estrategia_producto"], negocio: ["criterio_estrategico","modelo_negocio"] },
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
    skills: { producto: ["discovery","priorizacion"], negocio: ["gtm","modelo_negocio"] },
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
    skills: { tech: ["autonomia_tecnica","arquitectura"], producto: ["comunicacion_pm"] },
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
    mentoria: "Product Influence: de 'ejecutor de caprichos' a Líder Estratégico de Producto",
    tags: ["Strategy", "Liderazgo", "Management", "Revenue", "C-level"],
    patas: ["producto", "negocio"],
    skills: { producto: ["estrategia_producto","comunicacion_pm","priorizacion"], negocio: ["influencia_liderazgo","criterio_estrategico","modelo_negocio"] },
    nivel: "senior-founder",
    perfil_ideal: [
      "PM Senior atrapado en ejecución reactiva que quiere pasar a liderazgo estratégico",
      "PM que opera como Head desde una silla de PM sin reconocimiento ni autonomía",
      "PM que necesita gestionar hacia arriba con founders y C-level",
      "PM que quiere conectar producto con revenue y hablar el lenguaje del dinero",
      "PM con ambición de ascenso a Head of Product o Director de Producto",
    ],
    problemas_que_resuelve: [
      "me siento ejecutor de caprichos del CEO o los stakeholders",
      "opero en modo reactivo apagando incendios todo el día",
      "no logro que mis ideas se implementen sin autoridad formal",
      "los founders están metidos en el proceso y no tengo autonomía",
      "no sé cómo hablar de producto en términos de revenue y márgenes",
      "no tengo criterio de priorización que resista la presión externa",
      "quiero ascender a Head of Product o Director pero no sé cómo posicionarme",
      "me cuesta defender mis decisiones ante el C-level con datos",
      "hay silos entre áreas y no logro alinear a ventas o marketing",
      "trabajo duro pero no soy percibido como líder estratégico",
    ],
    sesiones: "8 sesiones — Mentoría individual USD 1.200 · Mentoría grupal USD 800",
    nSesiones: 8,
    precio: 1200,
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
    skills: { producto: ["priorizacion","discovery"], negocio: ["marca_personal"] },
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
    skills: { tech: ["datos_sql"], producto: ["metricas_producto","priorizacion"] },
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
    skills: { tech: ["autonomia_tecnica","ia_producto","prototipado"], producto: ["estrategia_producto"] },
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
    skills: { tech: ["prototipado"], producto: ["discovery","comunicacion_pm"] },
    nivel: "mid-senior",
    perfil_ideal: ["diseñador UX/UI que quiere pasar de ejecutar a liderar producto", "diseñador que siente que sus ideas no se implementan", "diseñador que quiere conectar su trabajo con métricas de negocio", "profesional de diseño que quiere influir en decisiones de producto"],
    problemas_que_resuelve: ["me ven como el que dibuja pantallas y no como alguien estratégico", "no sé cómo conectar mi trabajo de diseño con métricas de negocio", "mis ideas no llegan a implementarse porque no sé defenderlas", "no sé trabajar con stakeholders sin perder mi criterio", "quiero incorporar IA a mi proceso de diseño"],
    sesiones: "6 sesiones + 1 personalizada",
    nSesiones: 6,
    precio: 1100,
    foto: "https://ui-avatars.com/api/?name=Juan+Cejas&background=7b2ff7&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/JuanCejas",
  },
  {
    id: "XavierFlores",
    nombre: "Xavier Flores",
    titulo: "Founder & CEO de GomiGuide | Fractional CPO",
    mentoria: "Product Breakout Mentorship: Master the Game",
    tags: ["Liderazgo", "Strategy", "Fractional CPO"],
    patas: ["producto", "negocio"],
    skills: { producto: ["estrategia_producto","comunicacion_pm"], negocio: ["influencia_liderazgo","criterio_estrategico","marca_personal"] },
    nivel: "mid-senior",
    perfil_ideal: [
      "Product Manager que siente que llegó a un límite y necesita criterio estratégico para dar el próximo salto",
      "Product Leader que quiere ganar influencia y decidir con claridad incluso sin autoridad formal",
      "PM o líder de producto que quiere romper el siguiente techo de su carrera",
    ],
    problemas_que_resuelve: [
      "no sé cuál es mi verdadero siguiente nivel",
      "tengo el rol pero no la influencia que debería tener",
      "me cuesta liderar con criterio en contextos de alta ambigüedad",
      "quiero un roadmap claro para mi próximo salto de carrera",
      "sé ejecutar pero no sé cómo jugar el juego estratégico de producto",
    ],
    sesiones: "7 sesiones (90 días)",
    nSesiones: 7,
    precio: 900,
    foto: "https://ui-avatars.com/api/?name=Xavier+Flores&background=7b2ff7&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/XavierFlores",
  },
  {
    id: "LucasPatano",
    nombre: "Lucas Patanó",
    titulo: "Gerente de Innovación en BICE · ex CPO Global66 · Coach Ontológico",
    mentoria: "De líder de producto a ejecutivo: decidir desde el criterio propio",
    tags: ["Liderazgo", "Fintech", "Product Coaching", "Ejecutivo", "Decisiones de carrera"],
    patas: ["producto", "negocio"],
    skills: { producto: ["estrategia_producto"], negocio: ["influencia_liderazgo","criterio_estrategico","marca_personal","modelo_negocio"] },
    nivel: "senior-ejecutivo",
    perfil_ideal: [
      "Founders y co-founders de fintechs o startups digitales",
      "CPOs, Heads of Product y líderes que están por dar el salto a ejecutivo",
      "Líderes de innovación corporativa o company building dentro de bancos y holdings",
      "PMs senior que quieren construir su marca personal en la industria de producto",
      "Quienes están en la frontera startup/corporate y necesitan navegar las dos velocidades",
    ],
    problemas_que_resuelve: [
      "no sé si dar el salto a Head of Product, CPO o Director — ni cómo prepararme",
      "tengo que tomar una decisión de carrera de alto impacto y no sé por dónde empezar",
      "quiero emprender pero vengo de corporate y no sé cómo hacer la transición",
      "estoy en corporate y necesito moverme como si fuera una startup",
      "necesito construir y escalar un equipo de producto desde cero",
      "no sé cómo gestionar stakeholders complejos: board, C-level, comité de innovación",
      "quiero construir mi marca personal en la industria de producto",
      "tengo criterio pero no sé cómo fundamentarlo ante el C-level",
      "estoy trabado en una decisión de fondo y necesito pensar en voz alta con alguien que conoce el terreno",
      "quiero pasar de líder operativo a ejecutivo estratégico",
    ],
    sesiones: "3 a 6 sesiones + Sesión 0 gratuita (Programa A: 4 ses · Programa B: 6 ses · Programa C Coaching: 3 ses)",
    nSesiones: 4,
    precio: 800,
    foto: "https://ui-avatars.com/api/?name=Lucas+Patano&background=4361EE&color=fff&size=128&bold=true&rounded=true",
    url: "https://mentoresconproposito.vercel.app/mentor/LucasPatano",
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
+ "REGLA DE ORO — UNA PREGUNTA A LA VEZ:\n"
+ "- Hacé siempre UNA SOLA pregunta por mensaje. Nunca dos preguntas en el mismo turno.\n"
+ "- Esperá la respuesta antes de hacer la siguiente pregunta.\n"
+ "- Si necesitás saber varias cosas, priorizá la más importante para ese momento de la conversación.\n"
+ "- Esta regla aplica en todo momento: apertura, exploración y cierre.\n\n"
+ "LÍMITE DURO DE PREGUNTAS — MUY IMPORTANTE:\n"
+ "- Hacé EXACTAMENTE 7 preguntas de diagnóstico (ver flujo abajo). Nada más.\n"
+ "- Si el usuario da respuestas muy cortas en las abiertas, igualmente avanzás — no hagas preguntas de seguimiento.\n"
+ "- Es mejor un diagnóstico con información parcial que una conversación interminable.\n\n"
+ "EXTENSIÓN DE RESPUESTAS:\n"
+ "- En la fase conversacional (preguntas y respuestas) tus mensajes deben ser cortos: máximo 3-4 líneas.\n"
+ "- No acumules información ni hagas resúmenes intermedios largos.\n"
+ "- El diagnóstico final puede ser más extenso — el usuario ya está comprometido en ese punto.\n\n"
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
+ "FLUJO — SEGUÍ ESTOS PASOS EN ORDEN, SIN SALTEAR NINGUNO:\n"
+ "PASO 1 — APERTURA: Presentate brevemente. Explicá que van a explorar las 3 áreas clave (tecnología, producto, negocio) y que al final van a recibir su mapa de Product Sense + match con mentores. Luego pedí el nombre.\n"
+ "PASO 2 — NOMBRE: Recibís el nombre, inferís el género, y hacés la Pregunta 1.\n"
+ "PASO 3 — PREGUNTA 1 (abierta): '¿Cuál es tu rol actual y en qué tipo de empresa o contexto estás?' — inferís patas actuales y estado del loop.\n"
+ "PASO 4 — PREGUNTA 2 (abierta): '¿Cuál es tu principal frustración o desafío hoy en tu trabajo?' — inferís tensiones.\n"
+ "PASO 5 — PREGUNTA 3 (abierta): '¿Cuál sería tu siguiente paso ideal en tu carrera?' — inferís nivel objetivo y estado. Al FINAL de tu respuesta procesando esta pregunta, agregá en una línea separada: 'Ya tengo bastante para armar tu mapa — dos preguntas más y te cuento dónde estás parado/a.' Esto prepara al usuario para las clasificaciones que vienen.\n"
+ "PASO 6 — PREGUNTA 4 (situación): Presentá esta situación exactamente así: 'Una pregunta de criterio: tu CEO te pide priorizar entre dos features — una que pide el 20% de tus usuarios más activos, y otra que podría abrir un segmento nuevo pero es incierta. ¿Cómo decidís?' — Evaluá la calidad del razonamiento: ¿pide más datos antes de decidir? ¿habla de impacto en negocio? ¿prioriza por intuición o por framework? Esto calibra product_strategy y business_acumen.\n"
+ "PASO 7 — PREGUNTA 5 (clasificación): '¿Cómo describirías tu nivel de experiencia? A) Junior — menos de 2 años B) Mid — 2 a 5 años C) Senior — más de 5 años o liderando equipos' — da el nivel para el matching.\n"
+ "PASO 8 — PREGUNTA 6 (situación): Presentá esta situación exactamente así: 'Otra de criterio: te llega feedback de que el 40% de tus usuarios abandona en el onboarding. Tenés una semana. ¿Qué es lo primero que hacés?' — Evaluá si investiga antes de actuar (alto user_insights), si va directo a la solución (bajo), si analiza datos primero (alto data_fluency), si asume la causa sin validar (bajo). Esto calibra user_insights y data_fluency.\n"
+ "PASO 9 — PREGUNTA 7 (clasificación): '¿Cómo usás IA en tu trabajo hoy? A) La integré en mi proceso B) Experimento con algunas tareas C) Todavía no la incorporé' — calibra ai_fluency.\n"
+ "PASO 10 — RESUMEN DEL PERFIL: Antes del resumen, escribí UNA línea de transición empática, por ejemplo: 'Con esto ya tengo una imagen bastante clara de dónde estás parado/a. Mirá lo que veo:'. Luego mostrá el resumen del perfil detectado con el estado del loop (ver cómo presentar el estado abajo). El resumen debe ser cálido, específico a lo que dijeron, no genérico.\n"
+ "PASO 11 — CONFIRMACIÓN: Terminá el resumen con esta pregunta simple: '¿Esto te representa?' — no ofrescas opciones de ajuste largas, solo hacé la pregunta. Si el usuario ajusta algo, incorporalo brevemente y confirmá el ajuste.\n"
+ "PASO 12 — DIAGNÓSTICO: Tu respuesta DEBE comenzar SIEMPRE con el bloque <DIAGNOSIS>...</DIAGNOSIS> con TODOS los campos completos y valores reales (no ceros, no placeholders). Este bloque es lo que activa el radar visual — si no lo emitís, el usuario no ve ningún resultado. DESPUÉS de cerrar </DIAGNOSIS>, recomendás 2-3 mentores en texto con razones claras y específicas para esta persona. NO repitas el mismo mentor dos veces. El orden es fijo: primero el bloque, después el texto.\n"
+ "PASO 13 — PEDIDO DE EMAIL: Después de mostrar los mentores, pedí el email. Decí exactamente: '¿Me dejás tu email? Así te enviamos el resumen del diagnóstico y coordinamos la primera sesión con el mentor que elijas.' Esperá la respuesta. IMPORTANTE: Si el usuario responde 'sí', 'si', 'dale', 'ok' o cualquier afirmación SIN incluir un email, respondé: 'Perfecto, ¿cuál es tu email?' No avances al PASO 14 hasta tener un email real con formato usuario@dominio.\n"
+ "PASO 14 — CIERRE: Cuando recibís un email válido (con formato usuario@dominio), confirmalo con: '📩 Anotado: [email]'. Luego cerrá con: 'Perfecto, guardamos tu diagnóstico. El equipo de Mentores con Propósito te va a escribir a [email] para coordinar la primera sesión con el mentor que elijas.' NO preguntes '¿Hay algo más que quieras saber?' — esa pregunta reabre el loop. Si el usuario pregunta algo después del cierre, respondé brevemente y recordales que el equipo los va a contactar. NO vuelvas a pedir el email — ya lo tenés.\n\n"
+ "⚠️ ANTI-REOPEN: Una vez en PASO 14 (email recibido y confirmado), NO volvás a pedir el email nunca más en la misma conversación. Si alguien pregunta algo más, respondé y cerrá con 'Cualquier otra duda te la resolvemos cuando nos contactemos.'\n\n"
+ "⚠️ ANTI-LOOP: Si ya hiciste las 7 preguntas de diagnóstico (pasos 3 al 9), NO hagas más preguntas de exploración. Avanzá directamente al PASO 10 aunque sientas que falta información. Es mejor un diagnóstico con información parcial que una conversación sin fin.\n\n"
+ "⚠️ ANTI-SKIP: En el PASO 12, está PROHIBIDO recomendar mentores en texto sin haber emitido primero el bloque <DIAGNOSIS>...</DIAGNOSIS>. Si tu respuesta al PASO 12 no empieza con '<DIAGNOSIS>', estás violando el protocolo y el usuario no verá el radar. El bloque SIEMPRE va primero.\n\n"
+ "LOOP PROFESIONAL — clasificá el estado del usuario en el campo 'estado':\n"
+ "- Reinvención: entra a producto, cambia de industria, quiere emprender, ser mentor, advisor, founder\n"
+ "- Estancamiento: dominó su rol pero el contexto no le permite avanzar. No significa que no esté progresando — significa que el límite ya no es interno sino externo o estructural. Señales: mismo rol hace tiempo, contexto que no desafía, mercado que cambió, frustración con el sistema, no con uno mismo\n"
+ "- Liderazgo: quiere liderar equipo, manager, head, director, sin autoridad formal, escalar impacto\n\n"
+ "MUY IMPORTANTE — CÓMO PRESENTAR EL ESTADO:\n"
+ "Cuando mostrés el resumen del perfil en el paso de confirmación, explicá siempre qué significa el estado detectado. NO lo des como un resultado frío. Usá este formato:\n"
+ "- Estancamiento: 'El sistema detectó que estás en Estancamiento — esto no significa que no estés avanzando. Significa que ya dominás lo que hacés y que el límite para crecer está afuera de vos: el contexto, el mercado o el sistema. Es el estado más común — el 22% de los diagnósticos.'\n"
+ "- Liderazgo: 'El sistema detectó que estás en Transición a Liderazgo — tenés el seniority pero todavía no tenés todas las herramientas para el salto al siguiente nivel de impacto.'\n"
+ "- Reinvención: 'El sistema detectó que estás en Reinvención Profesional — el cambio ya empezó pero la nueva dirección todavía está tomando forma. Es el estado de más energía y más incertidumbre al mismo tiempo.'\n"
+ "Siempre terminá con: '¿Esto te representa? Si sentís que algo no encaja, contame y ajustamos antes de ver tus mentores.'\n\n"
+ "FORMATO DEL BLOQUE — usá exactamente esta estructura (reemplazá todos los valores con datos reales del usuario):\n"
+ "<DIAGNOSIS>\n"
+ "{\"nivel_actual\":{\"tech\":0,\"producto\":0,\"negocio\":0},\"nivel_objetivo\":{\"tech\":0,\"producto\":0,\"negocio\":0},\"gaps\":[\"gap1\"],\"estado\":\"Estancamiento\",\"mentores_recomendados\":[{\"id\":\"ID\",\"razon\":\"razon\",\"prioridad\":1}],\"mentor_buscado_id\":null,\"mentor_prototipo\":null,\"proximos_pasos\":[\"paso1\"],\"product_sense\":{\"user_insights\":5,\"business_acumen\":5,\"product_quality\":5,\"product_strategy\":5,\"execution\":5,\"influence\":5,\"data_fluency\":5,\"ai_fluency\":5}}\n"
+ "</DIAGNOSIS>\n"
+ "PRODUCT SENSE — instrucciones de scoring (framework Shreyas Doshi):\n"
+ "Inferí un score del 1 al 10 para cada dimensión basándote en las señales del lenguaje del usuario:\n"
+ "- user_insights: qué tan profundo conoce al usuario — entrevistas, síntesis, empatía. Alto si menciona discovery, entrevistas, insights. Bajo si construye por intuición o bajada de línea.\n"
+ "- business_acumen: qué tan bien conecta producto con negocio — revenue, métricas de negocio, criterio estratégico. Alto si habla el lenguaje del negocio. Bajo si solo piensa en features.\n"
+ "- product_quality: criterio sobre qué hace bueno un producto — pulido, coherencia, experiencia. Inferí del contexto y el tipo de empresa.\n"
+ "- product_strategy: visión y dirección de largo plazo — roadmap, priorización estratégica, north star. Alto si tiene visión clara. Bajo si opera en modo reactivo.\n"
+ "- execution: capacidad de llevar ideas a la realidad — entrega, coordinación, velocidad. Alto si menciona entrega consistente. Bajo si hay caos o bloqueos de ejecución.\n"
+ "- influence: hacer que las cosas pasen sin autoridad formal — manage up, stakeholders, alineamiento. Alto si tiene buenas relaciones con el equipo. Bajo si menciona que sus ideas no se implementan o que el CEO invalida su criterio.\n"
+ "- data_fluency: tomar decisiones con datos — métricas, SQL, analítica, evidencia cuantitativa. Alto si menciona datos en sus decisiones. Bajo si decide por intuición o no tiene acceso a datos.\n"
+ "- ai_fluency: integración de IA en el trabajo de producto — uso de LLMs para discovery, síntesis, specs, prototipado, análisis. Alto si usa IA como parte del proceso. Bajo si no la incorporó o solo la usa ocasionalmente.\n"
+ "IMPORTANTE — Cómo convertir las respuestas situacionales en scores:\n"
+ "- Pregunta 4 (situación de priorización): calibra product_strategy y business_acumen.\n"
+ "  Score ALTO (8-9): pide más datos antes de decidir, habla de impacto en revenue o segmento, usa un framework (ICE, RICE, valor vs esfuerzo), evalúa riesgo estratégico.\n"
+ "  Score MEDIO (5-6): reconoce la tensión pero resuelve por intuición o 'depende del contexto' sin profundizar.\n"
+ "  Score BAJO (2-4): elige una opción sin razonar, responde por preferencia personal ('yo siempre priorizaría a los usuarios activos'), no menciona el impacto en negocio.\n"
+ "- Pregunta 6 (situación de onboarding): calibra user_insights y data_fluency.\n"
+ "  Score ALTO (8-9): lo primero que haría es investigar (entrevistas, grabaciones de sesión, heatmaps, funnel de datos) antes de actuar. Distingue entre síntoma y causa.\n"
+ "  Score MEDIO (5-6): combina investigación con acción, o menciona revisar datos pero no especifica cuáles.\n"
+ "  Score BAJO (2-4): va directo a la solución ('simplificaría el onboarding', 'lo haría más corto') sin validar la causa primero.\n"
+ "- Pregunta 7 (AI fluency): A=9, B=6, C=2. Ajustá ±1 según señales adicionales de las respuestas abiertas.\n"
+ "- Para data_fluency: usá tanto la respuesta situacional del onboarding como señales de las preguntas abiertas (menciones de métricas, SQL, analytics).\n"
+ "Calibrá el score según el nivel declarado: el benchmark esperado para un senior es 7-8 en la mayoría de dimensiones.\n\n"
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
// PRODUCT SENSE RADAR (Shreyas Doshi framework)
// ─────────────────────────────────────────────
function ProductSenseRadar(props) {
  var ps = props.productSense || {};
  var nivel = props.nivel || "mid";
  var gaps = props.gaps || [];
  var svgRef = useRef(null);
  var [copied, setCopied] = useState(false);
  var [downloading, setDownloading] = useState(false);

  var archetypeData = props.archetypeData || null;
  var superpoderText = props.superpoderText || null;
  var puntoCiegoText = props.puntoCiegoText || null;
  var proximaSkillData = props.proximaSkillData || null;
  var psPct = props.psPct || null;

  var DIMS = [
    { key: "user_insights",    label: "Perspectiva\ndel Usuario" },
    { key: "business_acumen",  label: "Visión de\nNegocio" },
    { key: "product_quality",  label: "Calidad de\nProducto" },
    { key: "product_strategy", label: "Estrategia de\nProducto" },
    { key: "execution",        label: "Ejecución" },
    { key: "influence",        label: "Influencia" },
    { key: "data_fluency",     label: "Fluidez de\nDatos" },
    { key: "ai_fluency",       label: "Fluidez\nen IA" },
  ];

  var BENCHMARKS = {
    junior: { user_insights:5, business_acumen:4, product_quality:5, product_strategy:4, execution:5, influence:4, data_fluency:4, ai_fluency:5 },
    mid:    { user_insights:6, business_acumen:6, product_quality:6, product_strategy:6, execution:7, influence:6, data_fluency:6, ai_fluency:7 },
    senior: { user_insights:7, business_acumen:7, product_quality:7, product_strategy:8, execution:7, influence:8, data_fluency:7, ai_fluency:8 },
  };

  var benchmark = BENCHMARKS[nivel] || BENCHMARKS["mid"];
  var n = DIMS.length;
  var W = 260; var cx = W / 2; var cy = W / 2; var R = 90;

  function pt(idx, val) {
    var angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
    var r = (val / 10) * R;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function polyFor(obj) {
    return DIMS.map(function(d, i) {
      var p = pt(i, obj[d.key] || 0);
      return p.x + "," + p.y;
    }).join(" ");
  }

  function labelPt(idx) {
    var angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
    return { x: cx + (R + 32) * Math.cos(angle), y: cy + (R + 32) * Math.sin(angle) };
  }

  var gapColor = function(key) {
    var score = ps[key] || 0;
    var exp   = benchmark[key] || 6;
    var gap   = exp - score;
    if (gap > 2) return "#f72585";
    if (gap > 0) return "#fb8500";
    return "#06d6a0";
  };

  function downloadRadarPNG() {
    setDownloading(true);
    try {
      // ── Layout: HORIZONTAL — left column text, right column radar ──
      var SCALE    = 2;
      var TOTAL_W  = 900;   // canvas width (landscape)
      var PAD_V    = 36;    // top/bottom padding
      var PAD_H    = 32;    // outer left/right padding
      var COL_GAP  = 28;    // gap between columns
      var LEFT_W   = 440;   // left column width
      var RADAR_W  = 320;   // radar square size
      var RADAR_R  = 108;
      var LABEL_R  = RADAR_R + 34;
      var RADAR_CX = RADAR_W / 2;
      var RADAR_CY = RADAR_W / 2;
      var INFO_GAP = 12;
      var infoCardFont = "400 13px system-ui, sans-serif";
      var infoInnerW = LEFT_W - 32;  // inner text width in left col cards
      // Right col starts at:
      var RIGHT_X  = PAD_H + LEFT_W + COL_GAP;

      // ── STEP 1: Create canvas (temporary height) for measurement ──
      var canvas = document.createElement("canvas");
      canvas.width  = TOTAL_W * SCALE;
      canvas.height = 100 * SCALE;
      var ctx = canvas.getContext("2d");
      ctx.scale(SCALE, SCALE);

      // ── STEP 2: wrapText2 helper ──
      function wrapText2(text, font, maxW) {
        ctx.font = font;
        var words = String(text).split(" ");
        var lines = [], cur = "";
        words.forEach(function(w) {
          var test = cur ? cur + " " + w : w;
          if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
          else { cur = test; }
        });
        if (cur) lines.push(cur);
        return lines;
      }

      // ── STEP 3: Pre-measure left column content ──
      var arcCardH = 0, taglineLines = [];
      if (archetypeData) {
        taglineLines = wrapText2(archetypeData.tagline, "italic 400 13px Georgia, serif", infoInnerW);
        // pad(16) + "PS·Shreyas"(16) + gap(8) + "TU RESULTADO"(14) + gap(6) + name(34) + gap(8) + taglines + gap(8) + pct? + pad(16)
        arcCardH = 16 + 16 + 8 + 14 + 6 + 34 + 8 + taglineLines.length * 18 + 8 + (psPct != null ? 28 : 0) + 16;
      }

      var INFO_CARDS_H = 0, N_INFO = 0;
      if (superpoderText) {
        var ls = wrapText2(superpoderText, infoCardFont, infoInnerW);
        INFO_CARDS_H += 14 + 18 + 6 + ls.length * 20 + 14; N_INFO++;
      }
      if (puntoCiegoText) {
        var lp = wrapText2(puntoCiegoText, infoCardFont, infoInnerW);
        INFO_CARDS_H += 14 + 18 + 6 + lp.length * 20 + 14; N_INFO++;
      }
      if (proximaSkillData) {
        var lt = wrapText2(proximaSkillData.tip, infoCardFont, infoInnerW);
        INFO_CARDS_H += 14 + 18 + 6 + 26 + lt.length * 20 + 14; N_INFO++;
      }
      if (N_INFO > 1) INFO_CARDS_H += (N_INFO - 1) * INFO_GAP;

      // Left column total height (excluding badge row at top)
      var leftContentH = (arcCardH > 0 ? arcCardH + 14 : 0) + (INFO_CARDS_H > 0 ? INFO_CARDS_H : 0);

      // Right column: legend(20) + gap(6) + radar(RADAR_W) = RADAR_W + 26
      var rightColH = 20 + 6 + RADAR_W;

      // Canvas height = badge row + max(left, right) + footer
      var BODY_H = Math.max(leftContentH, rightColH);
      var BADGE_H = 30;
      var FOOTER_H = 40;
      var TOTAL_H = PAD_V + BADGE_H + 14 + BODY_H + FOOTER_H + PAD_V;

      // ── STEP 4: Resize canvas to exact size, re-get context ──
      canvas.width  = TOTAL_W * SCALE;
      canvas.height = TOTAL_H * SCALE;
      ctx = canvas.getContext("2d");
      ctx.scale(SCALE, SCALE);

      // ── STEP 5: Background ──
      ctx.fillStyle = "#0d0d1a";
      ctx.fillRect(0, 0, TOTAL_W, TOTAL_H);

      // Optional: subtle vertical divider between columns
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(PAD_H + LEFT_W + COL_GAP / 2 - 0.5, PAD_V, 1, TOTAL_H - PAD_V * 2);

      var y = PAD_V;

      // ── STEP 6: Badge row (full width) ──
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      roundRect(ctx, PAD_H, y, 80, 20, 4);
      ctx.fill();
      ctx.fillStyle = "#0d0d1a";
      ctx.font = "700 9px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("MI PERFIL", PAD_H + 9, y + 13);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "500 10px system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("mentorcito.vercel.app", TOTAL_W - PAD_H, y + 14);
      y += BADGE_H + 14;

      // ── From here: left column (lx origin = PAD_H) ──
      var ly = y;  // left column y cursor
      var lx = PAD_H;

      // ── STEP 7: Archetype card (left col) ──
      if (archetypeData && arcCardH > 0) {
        var grad = ctx.createLinearGradient(lx, ly, lx + LEFT_W, ly + arcCardH);
        grad.addColorStop(0, "rgba(67,97,238,0.30)");
        grad.addColorStop(1, "rgba(123,47,247,0.30)");
        ctx.fillStyle = grad;
        roundRect(ctx, lx, ly, LEFT_W, arcCardH, 12);
        ctx.fill();
        ctx.strokeStyle = "rgba(165,180,252,0.25)";
        ctx.lineWidth = 1;
        roundRect(ctx, lx, ly, LEFT_W, arcCardH, 12);
        ctx.stroke();

        var ay = ly + 16;
        // "Product Sense · Shreyas Doshi"
        ctx.fillStyle = "rgba(165,180,252,0.45)";
        ctx.font = "600 10px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("Product Sense  ·  Shreyas Doshi", lx + 16, ay);
        ay += 24;
        // "TU RESULTADO"
        ctx.fillStyle = "rgba(165,180,252,0.65)";
        ctx.font = "700 9px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("TU RESULTADO", lx + 16, ay);
        ay += 6;
        // Archetype name
        ctx.fillStyle = "#a5b4fc";
        ctx.font = "800 28px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(archetypeData.label, lx + 16, ay + 26);
        ay += 42;
        // Tagline
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.font = "italic 400 13px Georgia, serif";
        ctx.textAlign = "left";
        taglineLines.forEach(function(line, li) { ctx.fillText(line, lx + 16, ay + li * 18); });
        ay += taglineLines.length * 18 + 10;
        // % Product Sense
        if (psPct != null) {
          ctx.font = "800 18px system-ui, sans-serif";
          var pctW = ctx.measureText(psPct + "%").width;
          ctx.fillStyle = "#06d6a0";
          ctx.textAlign = "left";
          ctx.fillText(psPct + "%", lx + 16, ay + 16);
          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.font = "400 12px system-ui, sans-serif";
          ctx.fillText("  de Product Sense desarrollado", lx + 16 + pctW, ay + 16);
        }
        ly += arcCardH + 14;
      }

      // ── STEP 8: Info cards helper (left col) ──
      function drawInfoCard(emojiChar, label, titleLine, content, cardY, bgColor, borderColor, labelColor) {
        var contentLines = wrapText2(content, infoCardFont, infoInnerW - 22);
        var contentH = contentLines.length * 20;
        var actualH = 14 + 18 + 6 + (titleLine ? 26 : 0) + contentH + 14;
        ctx.fillStyle = bgColor;
        roundRect(ctx, lx, cardY, LEFT_W, actualH, 10);
        ctx.fill();
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1.2;
        roundRect(ctx, lx, cardY, LEFT_W, actualH, 10);
        ctx.stroke();
        var cx2 = lx + 14, cy2 = cardY + 14;
        ctx.font = "14px serif";
        ctx.textAlign = "left";
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillText(emojiChar, cx2, cy2 + 12);
        ctx.fillStyle = labelColor;
        ctx.font = "700 10px system-ui, sans-serif";
        ctx.fillText(label.toUpperCase(), cx2 + 20, cy2 + 12);
        cy2 += 24;
        if (titleLine) {
          ctx.fillStyle = "#a5b4fc";
          ctx.font = "700 13px system-ui, sans-serif";
          ctx.fillText(titleLine, cx2, cy2 + 14);
          cy2 += 26;
        }
        ctx.fillStyle = "rgba(255,255,255,0.82)";
        ctx.font = infoCardFont;
        contentLines.forEach(function(line, li) { ctx.fillText(line, cx2, cy2 + li * 20); });
        return actualH;
      }

      if (superpoderText) {
        var h = drawInfoCard("⚡", "Superpoder", null, superpoderText, ly,
          "rgba(6,214,160,0.09)", "rgba(6,214,160,0.28)", "rgba(6,214,160,0.8)");
        ly += h + INFO_GAP;
      }
      if (puntoCiegoText) {
        var h = drawInfoCard("🎯", "Punto ciego", null, puntoCiegoText, ly,
          "rgba(247,37,133,0.09)", "rgba(247,37,133,0.28)", "rgba(247,37,133,0.8)");
        ly += h + INFO_GAP;
      }
      if (proximaSkillData) {
        var h = drawInfoCard("🚀", "Próxima skill", proximaSkillData.label, proximaSkillData.tip, ly,
          "rgba(67,97,238,0.09)", "rgba(67,97,238,0.30)", "rgba(130,150,255,0.85)");
        ly += h;
      }

      // ── STEP 9: Right column — Legend + Radar ──
      var ry = y;  // right column y cursor starts same as left body

      // Legend
      ctx.beginPath();
      ctx.arc(RIGHT_X + 7, ry + 7, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#4f8ef7";
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.font = "600 10px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Yo", RIGHT_X + 18, ry + 11);
      ctx.beginPath();
      ctx.setLineDash([4, 3]);
      ctx.moveTo(RIGHT_X + 64, ry + 7);
      ctx.lineTo(RIGHT_X + 85, ry + 7);
      ctx.strokeStyle = "#f72585";
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText("Benchmark " + (nivel.charAt(0).toUpperCase() + nivel.slice(1)), RIGHT_X + 90, ry + 11);
      ry += 26;

      // Radar — center it in right column
      var radarColW = TOTAL_W - PAD_H - RIGHT_X;  // available width for radar
      var radarOffX = RIGHT_X + (radarColW - RADAR_W) / 2;

      function radarPt(idx, val) {
        var angle = (Math.PI * 2 * idx / 8) - Math.PI / 2;
        var r = (val / 10) * RADAR_R;
        return { x: radarOffX + RADAR_CX + r * Math.cos(angle), y: ry + RADAR_CY + r * Math.sin(angle) };
      }

      // Grid rings
      [2,4,6,8,10].forEach(function(v) {
        ctx.beginPath();
        DIMS.forEach(function(d, i) {
          var p = radarPt(i, v);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.strokeStyle = v === 10 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.07)";
        ctx.lineWidth = 1; ctx.setLineDash([]); ctx.stroke();
      });
      // Axis lines
      DIMS.forEach(function(d, i) {
        var p = radarPt(i, 10);
        ctx.beginPath();
        ctx.moveTo(radarOffX + RADAR_CX, ry + RADAR_CY);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1; ctx.setLineDash([]); ctx.stroke();
      });
      // Benchmark polygon
      ctx.beginPath();
      DIMS.forEach(function(d, i) {
        var p = radarPt(i, benchmark[d.key] || 6);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.strokeStyle = "#f72585"; ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]); ctx.stroke(); ctx.setLineDash([]);
      // User polygon
      ctx.beginPath();
      DIMS.forEach(function(d, i) {
        var p = radarPt(i, ps[d.key] || 0);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(79,142,247,0.18)"; ctx.fill();
      ctx.strokeStyle = "#4f8ef7"; ctx.lineWidth = 2.5; ctx.stroke();
      // Dots
      DIMS.forEach(function(d, i) {
        var p = radarPt(i, ps[d.key] || 0);
        ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = "#4f8ef7"; ctx.fill();
        ctx.strokeStyle = "#0d0d1a"; ctx.lineWidth = 1.5; ctx.stroke();
      });
      // Labels
      DIMS.forEach(function(d, i) {
        var angle = (Math.PI * 2 * i / 8) - Math.PI / 2;
        var lx2 = radarOffX + RADAR_CX + LABEL_R * Math.cos(angle);
        var ly2 = ry + RADAR_CY + LABEL_R * Math.sin(angle);
        var lines = d.label.split("\n");
        ctx.font = "600 9.5px system-ui, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.75)";
        ctx.textAlign = "center";
        var lineH = 12;
        lines.forEach(function(line, li) {
          ctx.fillText(line, lx2, ly2 + (li - (lines.length - 1) / 2) * lineH + 4);
        });
      });

      // ── STEP 10: Footer (full width) ──
      var footerY = TOTAL_H - PAD_V - 10;
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "400 9px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Mentorcito · Mentores con Propósito", TOTAL_W / 2, footerY);

      // ── STEP 11: Export ──
      canvas.toBlob(function(blob) {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "mi-product-sense-radar.png";
        a.click();
        setTimeout(function() { URL.revokeObjectURL(a.href); }, 1000);
        setDownloading(false);
      }, "image/png");
    } catch(e) { console.error("downloadRadarPNG error:", e); setDownloading(false); }
  }

  // helper: rounded rect path
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function buildShareUrl() {
    var base = window.location.origin;
    var params = new URLSearchParams();
    DIMS.forEach(function(d) { params.set(d.key, ps[d.key] || 0); });
    params.set("nivel", nivel);
    if (archetypeData) {
      params.set("arc_label", archetypeData.label);
      params.set("arc_tagline", archetypeData.tagline);
    }
    if (psPct != null) params.set("pspct", psPct);
    if (superpoderText) params.set("superpoder", superpoderText);
    if (puntoCiegoText) params.set("puntociego", puntoCiegoText);
    if (proximaSkillData) {
      params.set("proxima_label", proximaSkillData.label);
      params.set("proxima_tip", proximaSkillData.tip);
    }
    return base + "/?compartir=1&" + params.toString();
  }

  function copyShareLink() {
    var url = buildShareUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function() {
        setCopied(true);
        setTimeout(function() { setCopied(false); }, 2500);
      });
    }
  }

  if (!ps || Object.keys(ps).length === 0) return null;

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
        Product Sense · Shreyas Doshi
      </div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        {/* Radar */}
        <svg ref={svgRef} width={W} height={W} viewBox={"0 0 " + W + " " + W} style={{ overflow: "visible", flexShrink: 0 }}>
          {[2,4,6,8,10].map(function(g) {
            var pts = DIMS.map(function(d,i){ var p=pt(i,g); return p.x+","+p.y; }).join(" ");
            return <polygon key={g} points={pts} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />;
          })}
          {DIMS.map(function(d,i) {
            var p = pt(i,10);
            return <line key={d.key} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
          })}
          <polygon points={polyFor(benchmark)} fill="rgba(247,37,133,0.06)" stroke="rgba(247,37,133,0.4)" strokeWidth="1.5" strokeDasharray="4,3" />
          <polygon points={polyFor(ps)} fill="rgba(67,97,238,0.18)" stroke="#4361ee" strokeWidth="2" />
          {DIMS.map(function(d,i) {
            var curr = pt(i, ps[d.key] || 0);
            var targ = pt(i, benchmark[d.key] || 6);
            return (
              <g key={d.key}>
                <circle cx={targ.x} cy={targ.y} r="3" fill="rgba(247,37,133,0.5)" />
                <circle cx={curr.x} cy={curr.y} r="5" fill="#4361ee" />
                <circle cx={curr.x} cy={curr.y} r="2.5" fill="white" />
              </g>
            );
          })}
          {DIMS.map(function(d,i) {
            var lp = labelPt(i);
            var lines = d.label.split("\n");
            return (
              <g key={d.key}>
                {lines.map(function(line, li) {
                  return (
                    <text key={li} x={lp.x} y={lp.y + (li * 13) - ((lines.length - 1) * 6)}
                      textAnchor="middle" fill="rgba(255,255,255,0.65)"
                      fontSize="10" fontWeight="600" fontFamily="sans-serif">
                      {line}
                    </text>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {/* Tarjetas de scores */}
        <div style={{ flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 6 }}>
          {DIMS.map(function(d) {
            var score = ps[d.key] || 0;
            var exp   = benchmark[d.key] || 6;
            var gap   = exp - score;
            var color = gapColor(d.key);
            var pct   = Math.round(score / 10 * 100);
            return (
              <div key={d.key} style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "6px 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{d.label.replace("\n"," ")}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: color }}>{score}/10</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: 3, width: pct + "%", background: color, borderRadius: 2 }} />
                </div>
                {gap > 0 && (
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>gap {gap} vs nivel esperado</div>
                )}
              </div>
            );
          })}
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 4, fontStyle: "italic" }}>
            Línea punteada = benchmark para tu nivel
          </div>
        </div>
      </div>
      {/* Acciones: descargar + compartir */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
        <button
          onClick={downloadRadarPNG}
          disabled={downloading}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.4)", borderRadius: 8, padding: "8px 14px", color: "#a5b4fc", fontSize: 12, fontWeight: 600, cursor: downloading ? "wait" : "pointer", transition: "all 0.2s" }}>
          <span>{downloading ? "⏳" : "⬇️"}</span>
          {downloading ? "Generando..." : "Descargar mi radar"}
        </button>
        <button
          onClick={copyShareLink}
          style={{ display: "flex", alignItems: "center", gap: 6, background: copied ? "rgba(6,214,160,0.15)" : "rgba(247,37,133,0.12)", border: "1px solid " + (copied ? "rgba(6,214,160,0.4)" : "rgba(247,37,133,0.35)"), borderRadius: 8, padding: "8px 14px", color: copied ? "#06d6a0" : "#f9a8d4", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
          <span>{copied ? "✅" : "🔗"}</span>
          {copied ? "¡Link copiado!" : "Compartir mi resultado"}
        </button>
      </div>
    </div>
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
// ─────────────────────────────────────────────
// ÍNDICE DE TENSIÓN PROFESIONAL (antes: Score de Riesgo)
// ─────────────────────────────────────────────
function calcularScore(diagnosis) {
  var nAct = diagnosis.nivel_actual  || {};
  var nObj = diagnosis.nivel_objetivo || {};
  var gaps = (diagnosis.gaps || []).join(" ").toLowerCase();

  // 1. Gap estructural (máx 30pts)
  var gapTotal = ((nObj.tech||0)-(nAct.tech||0)) + ((nObj.producto||0)-(nAct.producto||0)) + ((nObj.negocio||0)-(nAct.negocio||0));
  var scoreGap = Math.min(30, gapTotal * 3.3);

  // 2. Estado del loop (máx 20pts)
  var scoreEstado = { "Estancamiento": 20, "Liderazgo": 12, "Reinvención": 8 }[diagnosis.estado] || 15;

  // 3. Señales semánticas de tensión (máx 30pts)
  var señales = ["bloqueado","estancado","años","frustrado","sin claridad","no sé","perdido","caos","sin sistema","reactivo","burnout","urgente","crisis","renunciar","salir","agotado","dependencia","caos","sin criterio","no avanzo"];
  var hits = señales.filter(function(s){ return gaps.indexOf(s) !== -1; }).length;
  var scoreSemantico = Math.min(30, hits * 6);

  // 4. Desequilibrio entre patas (máx 20pts)
  var minPata = Math.min(nAct.tech||0, nAct.producto||0, nAct.negocio||0);
  var maxPata = Math.max(nAct.tech||0, nAct.producto||0, nAct.negocio||0);
  var scoreDeseq = Math.min(20, (maxPata - minPata) * 4);

  return Math.round(scoreGap + scoreEstado + scoreSemantico + scoreDeseq);
}

function nivelScore(score) {
  if (score >= 76) return { label: "Alta tensión",    color: "#f72585", desc: "Hay tensión acumulada que necesita movimiento pronto" };
  if (score >= 56) return { label: "Tensión notable", color: "#fb8500", desc: "El patrón actual tiene un costo que ya se siente" };
  if (score >= 31) return { label: "Tensión latente", color: "#ffd166", desc: "Hay algo que empuja pero todavía no explotó" };
  return             { label: "Tensión baja",         color: "#06d6a0", desc: "Estás en un momento de consolidación" };
}

function detectarTensiones(diagnosis) {
  var gaps   = (diagnosis.gaps || []).join(" ").toLowerCase();
  var nAct   = diagnosis.nivel_actual  || {};
  var nObj   = diagnosis.nivel_objetivo || {};
  var estado = diagnosis.estado || "Estancamiento";
  var tensiones = [];

  // Tensión de sistema
  if (["sin sistema","reactivo","caos","priorizar","proceso"].some(function(k){ return gaps.indexOf(k) !== -1; }))
    tensiones.push({ icono: "⚡", label: "Tensión de sistema", desc: "Operás de forma reactiva sin un proceso propio de toma de decisiones" });

  // Tensión de influencia
  if (["sin autoridad","influencia","stakeholder","decisiones","liderazgo","no me escuchan"].some(function(k){ return gaps.indexOf(k) !== -1; }))
    tensiones.push({ icono: "⚡", label: "Tensión de influencia", desc: "Tenés criterio pero te cuesta que se escuche en la organización" });

  // Tensión de identidad
  if (["no sé","perdido","cambio","hacia dónde","próximo paso","qué quiero","reinven"].some(function(k){ return gaps.indexOf(k) !== -1; }))
    tensiones.push({ icono: "⚡", label: "Tensión de identidad", desc: "No está del todo claro cuál es el próximo capítulo profesional" });

  // Tensión de crecimiento
  if (["estancado","mismo rol","no avanzo","años","sin crecimiento","bloqueado"].some(function(k){ return gaps.indexOf(k) !== -1; }))
    tensiones.push({ icono: "⚡", label: "Tensión de crecimiento", desc: "El contexto actual ya no te desafía ni te lleva a ningún lugar nuevo" });

  // Tensión técnica
  var gapTech = (nObj.tech||0) - (nAct.tech||0);
  if (gapTech >= 3)
    tensiones.push({ icono: "⚡", label: "Brecha técnica", desc: "Hay una distancia significativa entre tu nivel técnico actual y donde querés llegar" });

  // Si no detectó ninguna, agregar una genérica por estado
  if (tensiones.length === 0) {
    var genericas = {
      "Estancamiento": { icono: "⚡", label: "Tensión de movimiento", desc: "Hay energía acumulada sin canal de salida claro" },
      "Liderazgo":     { icono: "⚡", label: "Tensión de transición", desc: "El salto al liderazgo requiere cambios que todavía no terminaron de consolidarse" },
      "Reinvención":   { icono: "⚡", label: "Tensión de aterrizaje", desc: "El cambio ya empezó pero la nueva dirección todavía está tomando forma" },
    };
    tensiones.push(genericas[estado] || genericas["Estancamiento"]);
  }

  return tensiones.slice(0, 3); // máximo 3
}

// Benchmark por estado (basado en datos acumulados del agente)
var BENCHMARK = {
  "Estancamiento": { pct: 68, desc: "de los profesionales en Estancamiento tienen un índice similar" },
  "Liderazgo":     { pct: 54, desc: "de quienes transicionan a Liderazgo reportan tensión en este rango" },
  "Reinvención":   { pct: 61, desc: "de los profesionales en Reinvención activa tienen un perfil parecido" },
};

// ─────────────────────────────────────────────
// PANTALLA POST-DIAGNÓSTICO
// ─────────────────────────────────────────────
var ESTADO_META_AGENT = {
  "Estancamiento": {
    icono: "🔁",
    taglines: [
      "No es que no estés avanzando. Es que el sistema no te está dejando.",
      "Dominás tu rol. El límite ya no está en vos — está en el contexto.",
      "Estancamiento no significa quietud. Significa que lo que hacés ya no te lleva a un lugar nuevo.",
      "El problema no es tu capacidad. Es que el contexto dejó de desafiarte.",
    ],
    identidades: [
      "Profesional que superó su rol actual",
      "Experto/a en zona de confort",
      "PM con experiencia lista para el siguiente nivel",
    ],
    tensiones: [
      "Estancamiento no significa que no estés progresando — significa que ya dominás lo que hacés y que el límite para crecer está afuera de vos: el contexto, el mercado o el sistema.",
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

      <div style={{ background: nivel.color + "0e", border: "1px solid " + nivel.color + "35", borderRadius: 14, padding: "18px 20px", marginBottom: 12 }}>
        {/* Header */}
        <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
          Índice de Tensión Profesional
        </div>

        {/* Número + nivel */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: T.textWhite, lineHeight: 1 }}>{score}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: nivel.color, marginBottom: 2 }}>{nivel.label}</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>de 100 posibles</div>
          </div>
        </div>

        {/* Barra */}
        <div style={{ height: 8, background: T.highlightBg, borderRadius: 4, marginBottom: 10, position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: score + "%", background: "linear-gradient(90deg, #4361ee, " + nivel.color + ")", borderRadius: 4, transition: "width 1s ease" }} />
        </div>

        {/* Descripción del nivel */}
        <div style={{ color: nivel.color, fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{nivel.desc}</div>

        {/* Frase interpretativa */}
        <div style={{ color: T.textSub, fontSize: 12, lineHeight: "1.6", marginBottom: 14 }}>{tension}</div>

        {/* Tensiones detectadas */}
        {(function() {
          var tensiones = detectarTensiones(Object.assign({}, diagnosis, { estado: estado }));
          return (
            <div style={{ borderTop: "1px solid " + T.border, paddingTop: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                Tensiones detectadas en tu perfil
              </div>
              {tensiones.map(function(t, i) {
                return (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                    <span style={{ color: nivel.color, fontSize: 13, flexShrink: 0, marginTop: 1 }}>{t.icono}</span>
                    <div>
                      <div style={{ color: T.textWhite, fontSize: 12, fontWeight: 700, marginBottom: 1 }}>{t.label}</div>
                      <div style={{ color: T.textSub, fontSize: 11, lineHeight: "1.4" }}>{t.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Benchmark */}
        {(function() {
          var bm = BENCHMARK[estado];
          if (!bm) return null;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: T.sectionBg, borderRadius: 8 }}>
              <span style={{ fontSize: 14 }}>👥</span>
              <span style={{ color: T.textMuted, fontSize: 11, lineHeight: "1.4" }}>
                El <strong style={{ color: T.text }}>{bm.pct}%</strong> {bm.desc}
              </span>
            </div>
          );
        })()}
      </div>

      <button onClick={onContinuar}
        style={{ width: "100%", padding: "14px 20px", background: "linear-gradient(135deg, #4361ee, #7b2ff7)", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 8 }}>
        Ver mi radar Product Sense
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
        var texto = meta.icono + " Estoy en " + estado + "\n\n" + tagline + "\n\nHacé tu diagnóstico gratis:\n" + link;
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

// ─────────────────────────────────────────────
// Por qué 90 días: es el horizonte mínimo para
// generar un cambio de patrón real y medible.
// Menos tiempo → insights sin anclaje conductual.
// Más tiempo → pérdida de foco y urgencia.
// ─────────────────────────────────────────────
var ROADMAP_META = {
  "Estancamiento": {
    logica: "90 días es el tiempo mínimo para romper un patrón de estancamiento. El Mes 1 abre el sistema. El Mes 2 lo reconstruye. El Mes 3 lo consolida para que no vuelva a cerrarse.",
    hito_final: "Al día 90: tenés un sistema propio de toma de decisiones, una posición clara de dónde querés ir, y evidencia concreta de que el patrón cambió.",
    fases: [
      {
        mes: "MES 1", titulo: "Diagnóstico profundo", bloqueado: false,
        descripcion: "El objetivo no es resolver el problema — es entenderlo realmente. La mayoría de los estancamientos tienen una causa raíz diferente a lo que parece.",
        items: [
          "Mapear cómo tomás decisiones hoy y dónde se corta el flujo",
          "Identificar el cuello de botella real (no el síntoma)",
          "Diseñar y ejecutar un primer experimento de cambio acotado",
          "Medir qué funcionó y por qué",
        ],
        resultado: "Tenés un diagnóstico honesto de tu situación y un experimento corriendo."
      },
      {
        mes: "MES 2", titulo: "Construcción de sistema", bloqueado: true,
        descripcion: "Con el diagnóstico claro, se construye el sistema que reemplaza el patrón viejo.",
        items: ["Diseñar tu sistema de producto propio", "Implementar rutinas de decisión con criterio propio"],
        resultado: "Tenés un sistema que no depende de la motivación del día."
      },
      {
        mes: "MES 3", titulo: "Escalado y posicionamiento", bloqueado: true,
        descripcion: "El sistema ya funciona. Ahora se consolida y se hace visible.",
        items: ["Consolidar el cambio como hábito", "Posicionarte para el próximo salto profesional"],
        resultado: "Al día 90 podés articular con precisión dónde estás y hacia dónde vas."
      },
    ],
  },
  "Liderazgo": {
    logica: "La transición a liderazgo no es una promoción — es un cambio de identidad. 90 días es el tiempo necesario para anclar una nueva forma de operar sin perder lo que ya construiste.",
    hito_final: "Al día 90: influís con criterio propio, gestionás hacia arriba y hacia los lados con claridad, y tenés un proyecto de liderazgo concreto para mostrar.",
    fases: [
      {
        mes: "MES 1", titulo: "Claridad de transición", bloqueado: false,
        descripcion: "Antes de liderar a otros, necesitás saber exactamente qué tipo de líder querés ser — y qué te falta para llegar ahí.",
        items: [
          "Mapear la brecha real entre dónde estás y el liderazgo que querés ejercer",
          "Identificar tu estilo natural de influencia (y sus límites)",
          "Diseñar y ejecutar un primer proyecto de liderazgo sin autoridad formal",
          "Medir el impacto y ajustar el enfoque",
        ],
        resultado: "Tenés claridad de tu punto de partida real y un primer ejercicio de liderazgo en marcha."
      },
      {
        mes: "MES 2", titulo: "Construcción de presencia", bloqueado: true,
        descripcion: "La presencia se construye con consistencia, no con gestos aislados.",
        items: ["Desarrollar tu voz estratégica en reuniones y decisiones", "Gestionar hacia arriba, hacia los lados y hacia el equipo con intención"],
        resultado: "Tu entorno empieza a verte diferente — y vos también te ves diferente."
      },
      {
        mes: "MES 3", titulo: "Consolidación del rol", bloqueado: true,
        descripcion: "El liderazgo se consolida cuando se vuelve el modo por defecto, no el esfuerzo extra.",
        items: ["Asumir responsabilidades de liderazgo con naturalidad", "Hacer visible tu evolución a las personas que importan"],
        resultado: "Al día 90 tenés evidencia concreta de tu nuevo nivel de impacto."
      },
    ],
  },
  "Reinvención": {
    logica: "Las reinvenciones fracasan por falta de estructura en el momento crítico, no por falta de talento. 90 días es el período donde se define si el cambio aterriza o se convierte en otro ciclo incompleto.",
    hito_final: "Al día 90: tenés un pie firme en el nuevo contexto, prueba social de tu valor en la nueva dirección, y claridad sobre el próximo paso.",
    fases: [
      {
        mes: "MES 1", titulo: "Aterrizaje del cambio", bloqueado: false,
        descripcion: "El primer mes no es para acelerar — es para aterrizar bien. Un cambio bien aterrizado avanza más rápido en los meses siguientes.",
        items: [
          "Mapear qué habilidades y experiencias sí se transfieren al nuevo contexto",
          "Validar la nueva dirección con evidencia real (no con suposiciones)",
          "Dar el primer paso concreto y medible en el nuevo contexto",
          "Reducir el riesgo del salto identificando qué podés hacer hoy sin dejarlo todo",
        ],
        resultado: "Tenés una hipótesis validada de tu nueva dirección y al menos un paso concreto dado."
      },
      {
        mes: "MES 2", titulo: "Construcción de credibilidad", bloqueado: true,
        descripcion: "La credibilidad en un nuevo rol no se declara — se demuestra.",
        items: ["Generar prueba social tangible en el nuevo contexto", "Conectar con la comunidad o red relevante de la nueva dirección"],
        resultado: "Tenés casos concretos que demuestran tu valor en el nuevo rol."
      },
      {
        mes: "MES 3", titulo: "Consolidación de identidad", bloqueado: true,
        descripcion: "El último mes es el cierre de un ciclo y la apertura del siguiente.",
        items: ["Cerrar formalmente el ciclo anterior con intención", "Abrazar la nueva identidad profesional con evidencia que la sostenga"],
        resultado: "Al día 90 la reinvención dejó de ser una intención y se convirtió en una realidad."
      },
    ],
  },
};

function RoadmapNoventa(props) {
  var estado   = props.estado || "Estancamiento";
  var score    = props.score  || 50;
  var nivel    = nivelScore(score);
  var onWA     = props.onWA;
  var [mesAbierto, setMesAbierto] = useState(null);

  if (estado.indexOf("Liderazgo") !== -1 || estado.indexOf("Transici") !== -1) estado = "Liderazgo";
  else if (estado.indexOf("Reinven") !== -1) estado = "Reinvención";
  else estado = "Estancamiento";

  var meta    = ROADMAP_META[estado] || ROADMAP_META["Estancamiento"];
  var roadmap = meta.fases;

  return (
    <div style={{ marginTop: 12, background: T.sectionBg, border: "1px solid " + T.border, borderRadius: 14, padding: "18px 16px", marginBottom: 12 }}>

      {/* Header */}
      <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
        Tu plan estratégico a 90 días
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.textWhite, marginBottom: 8 }}>
        Diseñado para tu perfil de {estado.toLowerCase()}
      </div>

      {/* Por qué 90 días */}
      <div style={{ background: "rgba(67,97,238,0.08)", border: "1px solid rgba(67,97,238,0.2)", borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#6b87f5", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>¿Por qué 90 días?</div>
        <div style={{ fontSize: 12, color: T.textSub, lineHeight: "1.6" }}>{meta.logica}</div>
      </div>

      {/* Fases */}
      {roadmap.map(function(fase, i) {
        var isOpen = mesAbierto === i;
        return (
          <div key={i} style={{ marginBottom: 8 }}>
            <div
              onClick={function(){ if (!fase.bloqueado) setMesAbierto(isOpen ? null : i); }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: fase.bloqueado ? "rgba(255,255,255,0.02)" : (isOpen ? "rgba(67,97,238,0.1)" : "rgba(255,255,255,0.04)"), borderRadius: 8, border: "1px solid " + (fase.bloqueado ? T.border : isOpen ? "rgba(67,97,238,0.35)" : T.border), cursor: fase.bloqueado ? "default" : "pointer", opacity: fase.bloqueado ? 0.6 : 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: fase.bloqueado ? T.textDisabled : "#6b87f5", textTransform: "uppercase", flexShrink: 0 }}>{fase.mes}</div>
              <div style={{ flex: 1, fontWeight: 700, color: fase.bloqueado ? T.textMuted : T.textWhite, fontSize: 12 }}>{fase.titulo}</div>
              {fase.bloqueado
                ? <span style={{ fontSize: 12 }}>🔒</span>
                : <span style={{ color: T.textMuted, fontSize: 14 }}>{isOpen ? "▾" : "▸"}</span>
              }
            </div>

            {/* Contenido expandido — Mes 1 */}
            {!fase.bloqueado && isOpen && (
              <div style={{ padding: "12px 14px", background: "rgba(67,97,238,0.05)", borderRadius: "0 0 8px 8px", marginTop: -2, border: "1px solid rgba(67,97,238,0.2)", borderTop: "none" }}>
                <div style={{ color: T.textSub, fontSize: 12, lineHeight: "1.6", marginBottom: 10, fontStyle: "italic" }}>{fase.descripcion}</div>
                <div style={{ fontSize: 10, color: "#6b87f5", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Qué trabajamos</div>
                {fase.items.map(function(item, j) {
                  return (
                    <div key={j} style={{ display: "flex", gap: 7, marginBottom: 5 }}>
                      <span style={{ color: "#4361ee", fontSize: 11, flexShrink: 0, marginTop: 1 }}>▸</span>
                      <span style={{ color: T.textSub, fontSize: 12, lineHeight: "1.4" }}>{item}</span>
                    </div>
                  );
                })}
                <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(6,214,160,0.07)", borderRadius: 6, border: "1px solid rgba(6,214,160,0.2)" }}>
                  <div style={{ fontSize: 10, color: "#06d6a0", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Resultado al final del mes</div>
                  <div style={{ fontSize: 12, color: T.textSub, lineHeight: "1.5" }}>{fase.resultado}</div>
                </div>
              </div>
            )}

            {/* Bloqueados: mostrar resultado prometido */}
            {fase.bloqueado && (
              <div style={{ padding: "8px 12px", marginTop: -2 }}>
                <div style={{ fontSize: 11, color: T.textDisabled, fontStyle: "italic" }}>
                  🔒 Desbloqueado con mentoría — {fase.resultado}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Hito final */}
      <div style={{ background: "rgba(6,214,160,0.06)", border: "1px solid rgba(6,214,160,0.2)", borderRadius: 8, padding: "10px 12px", margin: "14px 0" }}>
        <div style={{ fontSize: 10, color: "#06d6a0", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Al finalizar los 90 días</div>
        <div style={{ fontSize: 12, color: T.textSub, lineHeight: "1.6" }}>{meta.hito_final}</div>
      </div>

      <div style={{ height: 1, background: T.border, margin: "14px 0" }} />
      <div style={{ fontSize: 12, color: T.textSub, marginBottom: 14, lineHeight: "1.6" }}>
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
        <button onClick={function() { var opening = open !== "roadmap"; setOpen(opening ? "roadmap" : null); if(opening){ trackEvent("eligen_roadmap", true); } }}
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
          <button onClick={function() { var opening = open !== "paquete"; setOpen(opening ? "paquete" : null); if(opening){ trackEvent("eligen_mentoria", true); trackEvent("vio_paquete", true); } }}
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
  var empresaCtx   = props.empresaCtx  || null;
  var [step, setStep]           = useState("insight");
  var [userEmail, setUserEmail]     = useState("");
  var [userName, setUserName]       = useState("");
  var [compartirEmpresa, setCompartirEmpresa] = useState(false);
  // Estado NUDO en React state para garantizar re-renders correctos
  var [nudoPregActual, setNudoPregActual] = useState(-1); // -1 = intro
  var [nudoRespuestas, setNudoRespuestas] = useState({});
  var [nudoGuardado, setNudoGuardado]     = useState(false);
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
      "Mi estado: " + estado + "\nÍndice de tensión: " + score + "/100\n\n" +
      "Gaps detectados:\n" + gaps + "\n\nMe gustaría entender qué opciones tengo."
    );
  }

  // ── Barra de progreso global ──────────────────────────────
  var STEPS_CONFIG = [
    { key: "insight",  icono: "💡", label: "Diagnóstico" },
    { key: "email",    icono: "📧", label: "Tus datos"   },
    { key: "nudo",     icono: "🔮", label: "NUDO"        },
    { key: "mentores", icono: "👥", label: "Mentores"    },
  ];
  // Si el score < 31 no hay paso NUDO — flujo de 3 pasos
  var stepsVisibles = score >= 31
    ? STEPS_CONFIG
    : STEPS_CONFIG.filter(function(s) { return s.key !== "nudo"; });
  var stepActualIdx = stepsVisibles.findIndex(function(s) { return s.key === step; });
  if (stepActualIdx === -1 && step === "mentores") stepActualIdx = stepsVisibles.length - 1;

  function ProgressBar() {
    var total = stepsVisibles.length;
    // Sub-label para NUDO con contador de preguntas
    var nudoLabel = step === "nudo" && nudoPregActual >= 0 && !Object.keys(nudoRespuestas).length === 0
      ? "NUDO " + Math.min(nudoPregActual + 1, 5) + "/5"
      : null;
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 0, marginBottom: 14, padding: "10px 0",
      }}>
        {stepsVisibles.map(function(s, i) {
          var isDone   = i < stepActualIdx;
          var isActive = i === stepActualIdx;
          var isLast   = i === total - 1;
          // Color según estado
          var dotColor = isDone ? "#06D6A0" : isActive ? "#9b5fff" : "rgba(255,255,255,0.12)";
          var textColor = isDone ? "#06D6A0" : isActive ? "#c99eff" : "rgba(255,255,255,0.25)";
          // Label: si es NUDO activo y hay preguntas, mostrar contador
          var labelText = (isActive && s.key === "nudo" && nudoPregActual >= 0)
            ? (Object.keys(nudoRespuestas).length < 5
                ? "NUDO " + (nudoPregActual + 1) + "/5"
                : "NUDO ✓")
            : s.label;
          return (
            <div key={s.key} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {/* Dot + label */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: isActive ? 28 : 22,
                  height: isActive ? 28 : 22,
                  borderRadius: "50%",
                  background: isActive ? "rgba(123,47,247,0.2)" : isDone ? "rgba(6,214,160,0.15)" : "rgba(255,255,255,0.05)",
                  border: "2px solid " + dotColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isActive ? 13 : 11,
                  transition: "all 0.3s",
                  flexShrink: 0,
                }}>
                  {isDone ? "✓" : s.icono}
                </div>
                <div style={{
                  fontSize: 9, fontWeight: isActive ? 700 : 400,
                  color: textColor, textAlign: "center",
                  whiteSpace: "nowrap", letterSpacing: isActive ? 0.3 : 0,
                  transition: "all 0.3s",
                }}>
                  {labelText}
                </div>
              </div>
              {/* Conector */}
              {!isLast && (
                <div style={{
                  width: 28, height: 2,
                  background: isDone ? "#06D6A0" : "rgba(255,255,255,0.08)",
                  margin: "0 4px", marginBottom: 16, flexShrink: 0,
                  transition: "background 0.3s",
                }} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // STEP 1 — Insight psicológico + score
  if (step === "insight") {
    return (
      <div style={{ marginTop: 16 }}>
        <ProgressBar />
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
        <ProgressBar />
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

          {/* Opt-in compartir con empresa */}
          {empresaCtx && (
            <div onClick={function(){ setCompartirEmpresa(!compartirEmpresa); }}
              style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: compartirEmpresa ? "rgba(6,214,160,0.06)" : "rgba(255,255,255,0.03)", border: "1px solid " + (compartirEmpresa ? "rgba(6,214,160,0.2)" : "rgba(255,255,255,0.08)"), borderRadius: 8, cursor: "pointer", marginBottom: 16, transition: "all 0.2s" }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: compartirEmpresa ? "#06d6a0" : "transparent", border: "2px solid " + (compartirEmpresa ? "#06d6a0" : "rgba(255,255,255,0.25)"), flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {compartirEmpresa && <span style={{ color: "#003d14", fontSize: 10, fontWeight: 900 }}>✓</span>}
              </div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600, marginBottom: 2 }}>
                  Compartir mi diagnóstico con {empresaCtx.nombre}
                </div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, lineHeight: "1.4" }}>
                  Para que puedan acompañarte. Solo lo verá tu equipo de RRHH o liderazgo de producto. Si no tildás, aparecés como anónimo.
                </div>
              </div>
            </div>
          )}

          <button onClick={function() {
            if (userEmail && diagKey) {
              postToSheets({
                action: "update_contact",
                diag_key: diagKey,
                nombre: userName,
                email: userEmail,
                compartir_empresa: compartirEmpresa,
              });
              trackEvent("dejo_email", true);
            }
            setStep(score >= 31 ? "nudo" : "mentores");
            trackEvent("vio_paquete", true);
          }}
            style={{ width: "100%", padding: "13px 18px", background: "linear-gradient(135deg, #4361ee, #7b2ff7)", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 10 }}>
            Ver mi radar Product Sense →
          </button>
        </div>
      </div>
    );
  }

  // STEP NUDO — diagnóstico conversacional de 5 preguntas dentro del agente
  if (step === "nudo") {
    var NUDO_PREGUNTAS = [
      { id: "inhibicion",  dim: "Barrera decisional",    pregunta: "¿Con qué frecuencia postergás decisiones importantes aunque ya sabés qué tenés que hacer?",                        opciones: ["0 — Casi nunca","1 — A veces","2 — Con frecuencia","3 — Casi siempre"] },
      { id: "repeticion",  dim: "Patrones de liderazgo", pregunta: "¿Los mismos conflictos o bloqueos reaparecen en tu trabajo, aunque cambies de contexto o de equipo?",              opciones: ["0 — Casi nunca","1 — A veces","2 — Con frecuencia","3 — Casi siempre"] },
      { id: "dependencia", dim: "Criterio propio",       pregunta: "¿Necesitás la validación o aprobación de otros para sostener tus decisiones bajo presión?",                       opciones: ["0 — Casi nunca","1 — A veces","2 — Con frecuencia","3 — Casi siempre"] },
      { id: "angustia",    dim: "Crecimiento del rol",   pregunta: "¿Las oportunidades de crecimiento o expansión de responsabilidades te generan más tensión que entusiasmo?",       opciones: ["0 — Casi nunca","1 — A veces","2 — Con frecuencia","3 — Casi siempre"] },
      { id: "identidad",   dim: "Identidad profesional", pregunta: "¿Sentís que tu valor como persona depende fuertemente de tu rendimiento o tu rol actual?",                       opciones: ["0 — Casi nunca","1 — A veces","2 — Con frecuencia","3 — Casi siempre"] },
    ];
    var totalPreg  = NUDO_PREGUNTAS.length;
    var respondidas = Object.keys(nudoRespuestas).length;
    var completado = respondidas === totalPreg;
    var scoreNudo = 0;
    if (completado) { Object.values(nudoRespuestas).forEach(function(v) { scoreNudo += v; }); scoreNudo = Math.round(scoreNudo / totalPreg * 20); }
    var nivelNudo = scoreNudo >= 77 ? "prioritario" : scoreNudo >= 52 ? "exploratorio" : "ninguno";
    var colorNudo = nivelNudo === "prioritario" ? "#f72585" : nivelNudo === "exploratorio" ? "#fb8500" : "#06d6a0";
    if (completado && !nudoGuardado) {
      setNudoGuardado(true);
      if (diagKey) {
        postToSheets({ action: "funnel_event", diag_key: diagKey, vio_nudo: true, abrio_nudo: true, nudo_nivel: nivelNudo });
        postToSheets({ action: "update_nudo",  diag_key: diagKey, score_nudo: scoreNudo, nudo_nivel: nivelNudo });
      }
    }
    function responder(pregIdx, valor) {
      var pregId = NUDO_PREGUNTAS[pregIdx].id;
      setNudoRespuestas(function(prev) { return Object.assign({}, prev, { [pregId]: valor }); });
      setNudoPregActual(pregIdx + 1 < totalPreg ? pregIdx + 1 : totalPreg);
    }
    return (
      <div style={{ marginTop: 16 }}>
        <ProgressBar />
        <div style={{ background: "rgba(123,47,247,0.06)", border: "1px solid rgba(123,47,247,0.25)", borderRadius: 16, padding: "20px 18px", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(123,47,247,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🔮</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "#9b5fff", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>Diagnóstico adicional · NUDO Mindset</div>
              <div style={{ color: "white", fontSize: 14, fontWeight: 800 }}>
                {completado ? "Diagnóstico completo" : nudoPregActual === -1 ? "5 preguntas · 2 minutos" : "Pregunta " + (nudoPregActual + 1) + " de " + totalPreg}
              </div>
            </div>
            {nudoPregActual >= 0 && !completado && (
              <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: (respondidas / totalPreg * 100) + "%", height: "100%", background: "#9b5fff", borderRadius: 2, transition: "width 0.3s" }} />
              </div>
            )}
          </div>

          {nudoPregActual === -1 && (
            <div>
              <div style={{ background: "rgba(123,47,247,0.1)", border: "1px solid rgba(123,47,247,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>
                  Tu índice de tensión indica que puede haber <strong style={{ color: "#c99eff" }}>barreras invisibles al crecimiento</strong> que van más allá de habilidades o estrategia.
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 1.6 }}>
                  Antes de ver tus mentores, quiero hacerte 5 preguntas más del equipo de NUDO Mindset. Son rápidas — te ayudarán a entender qué está sosteniendo la situación.
                </div>
              </div>
              <button onClick={function() { setNudoPregActual(0); setNudoRespuestas({}); if (diagKey) postToSheets({ action: "funnel_event", diag_key: diagKey, vio_nudo: true, nudo_nivel: "pendiente" }); }}
                style={{ width: "100%", padding: "13px 18px", background: "linear-gradient(135deg, #7b2ff7, #9b5fff)", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer", marginBottom: 8 }}>
                Hacer las 5 preguntas →
              </button>
              <button onClick={function() { setStep("mentores"); trackEvent("vio_paquete", true); }}
                style={{ width: "100%", padding: "9px 18px", background: "transparent", border: "none", color: T.textMuted, fontSize: 12, cursor: "pointer" }}>
                Saltar · Ir a mis mentores →
              </button>
            </div>
          )}

          {nudoPregActual >= 0 && !completado && (function() {
            var pq = NUDO_PREGUNTAS[nudoPregActual];
            return (
              <div>
                {nudoPregActual > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    {NUDO_PREGUNTAS.slice(0, nudoPregActual).map(function(pr, i) {
                      var val = nudoRespuestas[pr.id];
                      return (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 10px", borderRadius: 8, background: "rgba(123,47,247,0.05)", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{pr.dim}</span>
                          <span style={{ fontSize: 11, color: "#c99eff", fontWeight: 700 }}>{"★".repeat(val) + "☆".repeat(3 - val)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div style={{ background: "rgba(123,47,247,0.08)", border: "1px solid rgba(123,47,247,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#9b5fff", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{pq.dim}</div>
                  <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, lineHeight: 1.7 }}>{pq.pregunta}</div>
                </div>
                {pq.opciones.map(function(op, i) {
                  return (
                    <button key={i} onClick={function() { responder(nudoPregActual, i); }}
                      style={{ width: "100%", padding: "11px 14px", marginBottom: 8, background: "rgba(123,47,247,0.08)", border: "1px solid rgba(123,47,247,0.2)", borderRadius: 10, color: "rgba(255,255,255,0.8)", fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                      {op}
                    </button>
                  );
                })}
              </div>
            );
          })()}

          {completado && (
            <div>
              <div style={{ background: "rgba(123,47,247,0.08)", border: "1px solid " + colorNudo + "44", borderRadius: 12, padding: "18px 16px", marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Índice de arquitectura interna</div>
                <div style={{ fontSize: 44, fontWeight: 900, color: colorNudo, lineHeight: 1, marginBottom: 6 }}>{scoreNudo}</div>
                <div style={{ fontSize: 13, color: colorNudo, fontWeight: 700, marginBottom: 8 }}>
                  {nivelNudo === "prioritario" ? "Barreras significativas detectadas" : nivelNudo === "exploratorio" ? "Señales moderadas de bloqueo estructural" : "Sin bloqueo estructural significativo"}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Tus respuestas</div>
                {NUDO_PREGUNTAS.map(function(pq, i) {
                  var val = nudoRespuestas[pq.id];
                  return (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{pq.dim}</span>
                        <span style={{ fontSize: 11, color: val >= 2 ? colorNudo : "rgba(255,255,255,0.35)", fontWeight: 700 }}>{pq.opciones[val].split(" — ")[1]}</span>
                      </div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: (val / 3 * 100) + "%", height: "100%", background: val >= 2 ? colorNudo : "rgba(123,47,247,0.4)", borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={function() { setStep("mentores"); trackEvent("vio_paquete", true); }}
                style={{ width: "100%", padding: "13px 18px", background: "linear-gradient(135deg, #4361ee, #7b2ff7)", border: "none", borderRadius: 12, color: "white", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                Ver mis mentores →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Product Sense Hero ────────────────────────────────────────
  var PS_LABELS = {
    user_insights:    "User Insights",
    business_acumen:  "Business Acumen",
    product_quality:  "Product Quality",
    product_strategy: "Product Strategy",
    execution:        "Execution",
    influence:        "Influence",
    data_fluency:     "Data Fluency",
    ai_fluency:       "AI Fluency",
  };

  var PS_ARCHETYPES = [
    { id: "estratega",  label: "El Estratega",    tagline: "Pensás en sistemas, no en features.",    top: ["product_strategy","business_acumen","influence"] },
    { id: "detective",  label: "El Detective",    tagline: "No construís hasta entender el problema de verdad.", top: ["user_insights","product_quality"] },
    { id: "ejecutor",   label: "El Ejecutor/a",   tagline: "Llevás ideas al mundo cuando el resto todavía las debate.", top: ["execution","product_quality"] },
    { id: "constructor",label: "El Constructor/a",tagline: "Sabés qué construir, cuándo y por qué.", top: ["product_strategy","execution","data_fluency"] },
    { id: "influencer", label: "El Comunicador/a",tagline: "Hacés que las cosas pasen sin tener autoridad formal.", top: ["influence","business_acumen","product_strategy"] },
    { id: "datadriven", label: "El Data Mind",    tagline: "Tus decisiones tienen evidencia detrás, no solo intuición.", top: ["data_fluency","user_insights","business_acumen"] },
    { id: "aiadopter",  label: "El Augmented PM", tagline: "Usás IA como palanca para multiplicar tu impacto.", top: ["ai_fluency","execution","product_strategy"] },
    { id: "generalista",label: "El Generalista",  tagline: "Cubrís todas las patas. Tu valor está en la versatilidad.", top: [] },
  ];

  function inferirArchetype(ps) {
    if (!ps) return PS_ARCHETYPES[PS_ARCHETYPES.length - 1];
    var scores = Object.keys(ps).map(function(k) { return { k: k, v: ps[k] || 0 }; });
    var sorted = scores.slice().sort(function(a, b) { return b.v - a.v; });
    var top2 = sorted.slice(0, 2).map(function(x) { return x.k; });
    var best = null, bestHits = -1;
    PS_ARCHETYPES.forEach(function(arc) {
      var hits = arc.top.filter(function(t) { return top2.indexOf(t) !== -1; }).length;
      if (hits > bestHits) { bestHits = hits; best = arc; }
    });
    return best || PS_ARCHETYPES[PS_ARCHETYPES.length - 1];
  }

  function calcPSPct(ps) {
    if (!ps) return null;
    var vals = Object.values(ps).filter(function(v) { return typeof v === "number"; });
    if (!vals.length) return null;
    var avg = vals.reduce(function(a, b) { return a + b; }, 0) / vals.length;
    return Math.round(avg * 10);
  }

  function inferirSuperpoder(ps) {
    if (!ps) return null;
    var entries = Object.entries(ps);
    if (!entries.length) return null;
    var top = entries.sort(function(a,b){ return b[1]-a[1]; })[0];
    var superpoderes = {
      user_insights:    "Encontrás lo que los usuarios sienten pero no dicen.",
      business_acumen:  "Conectás producto con negocio con naturalidad.",
      product_quality:  "Tu criterio de calidad eleva el estándar del equipo.",
      product_strategy: "Tenés visión de largo plazo cuando el resto opera en el corto.",
      execution:        "Llevás ideas al mundo mientras otros todavía debaten.",
      influence:        "Hacés que las cosas pasen sin necesitar autoridad formal.",
      data_fluency:     "Tus decisiones tienen evidencia detrás, no solo intuición.",
      ai_fluency:       "Usás IA como palanca cuando el resto la usa como juguete.",
    };
    return superpoderes[top[0]] || null;
  }

  function inferirPuntoCiego(ps) {
    if (!ps) return null;
    var entries = Object.entries(ps);
    if (!entries.length) return null;
    var low = entries.sort(function(a,b){ return a[1]-b[1]; })[0];
    var puntosCiegos = {
      user_insights:    "Construís antes de escuchar suficiente. A veces la solución llega antes que el problema.",
      business_acumen:  "Te concentrás en el usuario y el producto, pero la lógica del negocio queda en segundo plano.",
      product_quality:  "Priorizás velocidad sobre pulido. Eso suma deuda que después hay que pagar.",
      product_strategy: "Operás bien en el corto plazo. La dirección de largo plazo todavía no está clara.",
      execution:        "Pensás bien, pero la ejecución consistente puede ser el cuello de botella.",
      influence:        "Tenés el criterio pero que se escuche depende más del contexto que de vos.",
      data_fluency:     "Tomás buenas decisiones, pero sin datos que las soporten es difícil defenderlas.",
      ai_fluency:       "Hay ciclos que podrían automatizarse. Eso todavía no está pasando.",
    };
    return puntosCiegos[low[0]] || null;
  }

  function inferirProximaSkill(ps) {
    if (!ps) return null;
    var entries = Object.entries(ps);
    if (!entries.length) return null;
    var low = entries.sort(function(a,b){ return a[1]-b[1]; })[0];
    var nextSkills = {
      user_insights:    { label: "Discovery continuo", tip: "Agendá una entrevista de usuario esta semana. Una conversación real vale más que diez métricas de comportamiento." },
      business_acumen:  { label: "Métricas de negocio", tip: "Conectá tu roadmap a revenue, CAC o retención. Que cada feature tenga una métrica de negocio asociada." },
      product_quality:  { label: "Criterio de calidad", tip: "Definí los 3 principios de calidad de tu producto antes de escribir la próxima spec." },
      product_strategy: { label: "Estrategia de producto", tip: "Escribí en una página: ¿a dónde va el producto en 12 meses y por qué ese camino y no otro?" },
      execution:        { label: "Sistema de entrega", tip: "Elegí un proceso de priorización y seguilo consistentemente por 30 días. La disciplina vence al talento." },
      influence:        { label: "Comunicación ejecutiva", tip: "La próxima presentación que hagas, empezá por el 'por qué importa', no por el 'qué hicimos'." },
      data_fluency:     { label: "Data para PMs", tip: "Aprendé a leer un funnel en tu herramienta de analytics. No necesitás saber SQL — necesitás saber qué preguntar." },
      ai_fluency:       { label: "IA en tu proceso", tip: "Elegí una tarea repetitiva de tu semana y automatizala con IA. Un solo flujo que funcione vale más que diez prompts sueltos." },
    };
    return nextSkills[low[0]] || null;
  }

  // STEP 2 — Mentores + radar + gaps
  if (step === "mentores") {
    var ps = diagnosis.product_sense || null;
    var psPct = calcPSPct(ps);
    var archetype = inferirArchetype(ps);
    var superpoder = inferirSuperpoder(ps);
    var puntoCiego = inferirPuntoCiego(ps);
    var proximaSkill = inferirProximaSkill(ps);

    return (
      <div style={{ marginTop: 16 }}>
        <ProgressBar />

        {/* ── 1. HERO: Tu resultado (archetype) ──────────────── */}
        {ps && psPct !== null && (
          <div style={{ background: "linear-gradient(160deg, rgba(67,97,238,0.08) 0%, rgba(123,47,247,0.06) 100%)", border: "1px solid " + T.border, borderRadius: 20, padding: "24px 20px", marginBottom: 14 }}>
            {/* Tag "TU RESULTADO" */}
            <div style={{ display: "inline-block", background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.3)", borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 800, color: C.primary, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>
              Tu resultado
            </div>

            {/* Nombre del archetype */}
            <div style={{ fontSize: 30, fontWeight: 900, color: C.text, lineHeight: 1.1, marginBottom: 6 }}>
              {archetype.label}
            </div>
            <div style={{ fontSize: 15, color: C.textSecondary, fontStyle: "italic", marginBottom: 20, lineHeight: 1.5 }}>
              {archetype.tagline}
            </div>

            {/* % Product Sense */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 42, fontWeight: 900, color: C.primary, lineHeight: 1 }}>{psPct}%</span>
              <span style={{ fontSize: 13, color: C.textSecondary, lineHeight: 1.4 }}>de Product Sense<br />desarrollado</span>
            </div>

            {/* Superpoder */}
            {superpoder && (
              <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "13px 16px", marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: C.textSecondary, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 5 }}>Tu superpoder</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{superpoder}</div>
              </div>
            )}

            {/* Punto ciego */}
            {puntoCiego && (
              <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 12, padding: "13px 16px", marginBottom: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: C.textSecondary, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 5 }}>Tu punto ciego</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{puntoCiego}</div>
              </div>
            )}

            {/* Próxima skill */}
            {proximaSkill && (
              <div style={{ background: "rgba(247,37,133,0.06)", border: "1px solid rgba(247,37,133,0.2)", borderRadius: 12, padding: "13px 16px" }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "#f9a8d4", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 5 }}>Tu próxima skill: {proximaSkill.label}</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{proximaSkill.tip}</div>
              </div>
            )}
          </div>
        )}

        {/* ── 2. PRODUCT SENSE · SHREYAS DOSHI (radar detallado) ── */}
        {diagnosis.product_sense && Object.keys(diagnosis.product_sense).length > 0 && (
          <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 16, padding: 20, marginBottom: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: C.textSecondary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, textAlign: "center" }}>
              Product Sense · Shreyas Doshi
            </div>
            <ProductSenseRadar
              productSense={diagnosis.product_sense}
              nivel={diagnosis.nivel || "mid"}
              gaps={diagnosis.gaps || []}
              archetypeData={archetype}
              superpoderText={superpoder}
              puntoCiegoText={puntoCiego}
              proximaSkillData={proximaSkill}
              psPct={psPct}
            />
          </div>
        )}

        {/* ── 3. TECNOLOGÍA / PRODUCTO / NEGOCIO (barras) ─────── */}
        <div style={{ background: T.card, border: "1px solid " + T.border, borderRadius: 16, padding: 20, marginBottom: 12 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: C.textSecondary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>
            Niveles por área
          </div>
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

        {/* ── 4. GAPS IDENTIFICADOS ───────────────────────────── */}
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

        {/* ── 5. MENTORES RECOMENDADOS ────────────────────────── */}
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
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <a href="https://calendar.app.google/guPzaxaV4QVy3x1ZA" target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: C.primary, color: "white", fontSize: 12, fontWeight: 700, textDecoration: "none", border: "1.5px solid "+C.primary }}>
                          Reservar un café virtual ☕
                        </a>
                        <a href={m.url} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 8, background: "transparent", color: C.primary, fontSize: 12, fontWeight: 700, textDecoration: "none", border: "1.5px solid "+C.primary }}>
                          Ver programa de mentoría →
                        </a>
                      </div>
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

        {/* ── 6. PRÓXIMOS PASOS ───────────────────────────────── */}
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
    "Estancamiento": "¿Cuánto hace que sentís que no avanzás?",
    "Liderazgo":     "¿Ya sabés que querés liderar, pero no encontraste cómo?",
    "Reinvención":   "¿Estás en un momento de cambio sin saber bien hacia dónde?",
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
          <div style={{ fontSize: 10, color: m.color, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Un colega tuyo está en</div>
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
            Hacé tu diagnóstico gratis y descubrí en qué punto del loop profesional estás vos.
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
          Hacer mi diagnóstico gratis →
        </button>
        <div style={{ textAlign: "center", color: T.textDisabled, fontSize: 11 }}>
          5 minutos · Sin registro · 100% gratuito
        </div>
      </div>
    </div>
  );
}



// ─────────────────────────────────────────────
// HOME LANDING (pantalla de entrada, fondo claro)
// ─────────────────────────────────────────────
function HomeLanding(props) {
  var onStart = props.onStart;
  var [hoveredDim, setHoveredDim] = useState(null);
  var [tooltipPos, setTooltipPos]  = useState({ x: 0, y: 0 });
  var svgRef = useRef(null);

  // Radar preview estático con valores de ejemplo
  var PREVIEW_PS = {
    user_insights: 7, business_acumen: 5, product_quality: 8,
    product_strategy: 6, execution: 7, influence: 4, data_fluency: 5,
    ai_fluency: 6,
  };
  var DIMS_HOME = [
    {
      key: "user_insights",
      label: "Perspectiva del Usuario",
      sublabel: "User Insights",
      desc: "Capacidad para empatizar con los clientes, entender sus dolores reales y traducir sus necesidades en soluciones de producto.",
    },
    {
      key: "business_acumen",
      label: "Visión de Negocio",
      sublabel: "Business Acumen",
      desc: "Habilidad para conectar las características del producto con la rentabilidad, los objetivos de la empresa y la monetización.",
    },
    {
      key: "product_quality",
      label: "Calidad de Producto",
      sublabel: "Product Quality",
      desc: "Criterio técnico y estético para identificar qué hace que una experiencia de usuario sea fluida, intuitiva y de alto nivel.",
    },
    {
      key: "product_strategy",
      label: "Estrategia de Producto",
      sublabel: "Product Strategy",
      desc: "Visión a largo plazo para definir hacia dónde va el producto y cómo competir en el mercado de manera sostenible.",
    },
    {
      key: "execution",
      label: "Ejecución",
      sublabel: "Execution",
      desc: "Capacidad operativa para coordinar equipos, cumplir plazos, priorizar tareas y transformar ideas en lanzamientos reales.",
    },
    {
      key: "influence",
      label: "Influencia",
      sublabel: "Influence",
      desc: "Habilidad de liderazgo para alinear a diseñadores, desarrolladores y directivos hacia una misma meta sin tener autoridad jerárquica sobre ellos.",
    },
    {
      key: "data_fluency",
      label: "Fluidez de Datos",
      sublabel: "Data Fluency",
      desc: "Destreza para analizar métricas, interpretar experimentos (como pruebas A/B) y tomar decisiones respaldadas por datos objetivos.",
    },
    {
      key: "ai_fluency",
      label: "Fluidez en IA",
      sublabel: "AI Fluency",
      desc: "Capacidad para entender las tecnologías de IA, no solo en su teoría, sino en saber cómo y cuándo aplicarlas para resolver problemas reales de forma eficiente.",
    },
  ];
  var n = DIMS_HOME.length;
  var W = 320; var cx = W / 2; var cy = W / 2; var R = 110;

  function pt(idx, val) {
    var angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
    var r = (val / 10) * R;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }
  function labelPt(idx) {
    var angle = (Math.PI * 2 * idx / n) - Math.PI / 2;
    return { x: cx + (R + 42) * Math.cos(angle), y: cy + (R + 42) * Math.sin(angle) };
  }
  function polyFor(obj) {
    return DIMS_HOME.map(function(d, i) {
      var p = pt(i, obj[d.key] || 0);
      return p.x + "," + p.y;
    }).join(" ");
  }

  function handleDimHover(d, i, e) {
    setHoveredDim(d);
    if (svgRef.current) {
      var rect = svgRef.current.getBoundingClientRect();
      var lp = labelPt(i);
      var scaleX = rect.width / W;
      var scaleY = rect.height / W;
      setTooltipPos({
        x: rect.left + lp.x * scaleX,
        y: rect.top  + lp.y * scaleY,
      });
    }
  }

  // Grid rings
  var rings = [2, 4, 6, 8, 10];

  // Benchmark mid
  var bench = { user_insights:6, business_acumen:6, product_quality:6, product_strategy:6, execution:7, influence:6, data_fluency:6, ai_fluency:7 };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Nav */}
      <div style={{ padding: "18px clamp(16px, 4vw, 32px)", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#f0f0f0", letterSpacing: -0.3 }}>Mentorcito</div>
        <div style={{ marginLeft: 8, fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>by Mentores con Propósito</div>
      </div>

      {/* Hero */}
      <div className="home-hero-gap" style={{
        flex: 1,
        maxWidth: 1100,
        width: "100%",
        margin: "0 auto",
        padding: "clamp(32px, 6vw, 60px) clamp(20px, 5vw, 40px) clamp(28px, 4vw, 40px)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "clamp(28px, 5vw, 64px)",
        flexWrap: "wrap",
        boxSizing: "border-box",
        overflow: "hidden",
      }}>
        {/* Left: copy */}
        <div style={{ flex: "1 1 280px", minWidth: 0, maxWidth: "100%", boxSizing: "border-box" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.8)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            padding: "6px 14px",
            borderRadius: 999,
            marginBottom: 28,
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#06d6a0", display: "inline-block" }}></span>
            Diagnóstico gratuito · 8 preguntas
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: "clamp(28px, 6vw, 52px)",
            fontWeight: 800,
            color: "#f0f0f0",
            lineHeight: 1.1,
            letterSpacing: "clamp(-0.5px, -0.03em, -1.5px)",
            marginBottom: 20,
          }}>
            Tu mapa de<br /><em style={{ fontStyle: "italic", color: "#a5b4fc" }}>Product Sense</em>,<br />en 8 preguntas
          </h1>

          {/* Subtítulo */}
          <p style={{
            fontSize: "clamp(15px, 2.5vw, 17px)",
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.65,
            marginBottom: 32,
            maxWidth: "min(420px, 100%)",
          }}>
            Soy Mentorcito — entrenado con el conocimiento de los mejores mentores, coaches y psicólogos de la red. Contame tus desafíos profesionales y te devuelvo un mapa honesto: dónde estás parado hoy, qué fortalezas tenés, y hacia dónde tiene sentido crecer.
          </p>

          {/* Stats */}
          <div style={{
            display: "flex",
            gap: 24,
            marginBottom: 36,
            flexWrap: "wrap",
          }}>
            {[
              { n: "8", label: "preguntas" },
              { n: "8", label: "dimensiones" },
              { n: "3", label: "estados del loop" },
            ].map(function(s) {
              return (
                <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#f0f0f0" }}>{s.n}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <button
            onClick={onStart}
            style={{
              background: "linear-gradient(135deg, #4361ee, #7b2ff7)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "16px clamp(24px, 5vw, 36px)",
              fontSize: "clamp(15px, 2.5vw, 16px)",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: -0.2,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              transition: "opacity 0.15s",
              minHeight: 52,
            }}
            onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.88"; }}
            onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}
          >
            Empezar mi diagnóstico
            <span style={{ fontSize: 18 }}>→</span>
          </button>
          <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 500 }}>
            Gratis · Para PMs en Latinoamérica
          </div>

          {/* Urgency block */}
          <div style={{
            marginTop: 32,
            background: "rgba(247,37,133,0.07)",
            border: "1px solid rgba(247,37,133,0.2)",
            borderRadius: 12,
            padding: "16px 20px",
            maxWidth: 420,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f9a8d4", marginBottom: 6 }}>
              ¿Cuál es el costo de no hacer nada?
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
              El <strong style={{ color: "#f0f0f0" }}>29% de los profesionales</strong> se estancan por años sin entender por qué, llevándolos al burnout.
            </div>
          </div>
        </div>

        {/* Right: radar preview interactivo */}
        <div style={{ flex: "1 1 280px", minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", width: "100%" }}>
          <svg ref={svgRef} className="home-radar-svg" width={W} height={W} viewBox={"0 0 " + W + " " + W} style={{ overflow: "visible", maxWidth: "100%", height: "auto" }}>
            {/* Grid rings */}
            {rings.map(function(v) {
              var rr = (v / 10) * R;
              var pts = DIMS_HOME.map(function(_, i) {
                var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
                return (cx + rr * Math.cos(angle)) + "," + (cy + rr * Math.sin(angle));
              }).join(" ");
              return <polygon key={v} points={pts} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
            })}
            {/* Axes */}
            {DIMS_HOME.map(function(_, i) {
              var angle = (Math.PI * 2 * i / n) - Math.PI / 2;
              return <line key={i}
                x1={cx} y1={cy}
                x2={cx + R * Math.cos(angle)}
                y2={cy + R * Math.sin(angle)}
                stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
            })}
            {/* Benchmark polygon */}
            <polygon points={polyFor(bench)} fill="rgba(67,97,238,0.08)" stroke="rgba(165,180,252,0.35)" strokeWidth="1.5" strokeDasharray="4 3" />
            {/* Preview polygon */}
            <polygon points={polyFor(PREVIEW_PS)} fill="rgba(67,97,238,0.2)" stroke="#4f8ef7" strokeWidth="2" />
            {/* Dots */}
            {DIMS_HOME.map(function(d, i) {
              var p = pt(i, PREVIEW_PS[d.key] || 0);
              var isHov = hoveredDim && hoveredDim.key === d.key;
              return <circle key={d.key} cx={p.x} cy={p.y}
                r={isHov ? 7 : 5}
                fill={isHov ? "#a5b4fc" : "#4f8ef7"}
                stroke="#0d1117" strokeWidth="2"
                style={{ transition: "r 0.15s, fill 0.15s", cursor: "pointer" }}
                onMouseEnter={function(e) { handleDimHover(d, i, e); }}
                onMouseLeave={function() { setHoveredDim(null); }}
              />;
            })}
            {/* Labels interactivos */}
            {DIMS_HOME.map(function(d, i) {
              var lp = labelPt(i);
              var isHov = hoveredDim && hoveredDim.key === d.key;
              return (
                <g key={d.key} style={{ cursor: "pointer" }}
                  onMouseEnter={function(e) { handleDimHover(d, i, e); }}
                  onMouseLeave={function() { setHoveredDim(null); }}>
                  {/* Label principal en español */}
                  <text x={lp.x} y={lp.y - 7} textAnchor="middle" dominantBaseline="middle"
                    fill={isHov ? "#a5b4fc" : "rgba(255,255,255,0.75)"} fontSize="10.5" fontWeight="700"
                    fontFamily="'Plus Jakarta Sans',system-ui,sans-serif"
                    style={{ transition: "fill 0.15s" }}>
                    {d.label}
                  </text>
                  {/* Sublabel en inglés */}
                  <text x={lp.x} y={lp.y + 8} textAnchor="middle" dominantBaseline="middle"
                    fill={isHov ? "rgba(165,180,252,0.7)" : "rgba(255,255,255,0.28)"} fontSize="9" fontWeight="500"
                    fontFamily="'Plus Jakarta Sans',system-ui,sans-serif"
                    style={{ transition: "fill 0.15s" }}>
                    {d.sublabel}
                  </text>
                  {/* Hit area invisible más grande para hover cómodo */}
                  <rect x={lp.x - 50} y={lp.y - 18} width="100" height="34"
                    fill="transparent" />
                </g>
              );
            })}
          </svg>

          {/* Tooltip flotante — solo en desktop (hover) */}
          {hoveredDim && (
            <div style={{
              position: "fixed",
              left: Math.max(8, Math.min(tooltipPos.x - 115, (typeof window !== "undefined" ? window.innerWidth : 400) - 244)),
              top: Math.min(tooltipPos.y + 16, (typeof window !== "undefined" ? window.innerHeight : 700) - 160),
              width: "min(230px, calc(100vw - 32px))",
              background: "rgba(15,20,35,0.97)",
              border: "1px solid rgba(165,180,252,0.3)",
              borderRadius: 12,
              padding: "12px 14px",
              zIndex: 1000,
              pointerEvents: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#a5b4fc", letterSpacing: 0.3, marginBottom: 2 }}>
                {hoveredDim.label}
              </div>
              <div style={{ fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.3)", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>
                {hoveredDim.sublabel}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
                {hoveredDim.desc}
              </div>
            </div>
          )}

          {/* Legend */}
          <div style={{ display: "flex", gap: 20, marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 16, height: 2, background: "#4f8ef7", borderRadius: 1 }}></div>
              Tu perfil
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 16, height: 2, background: "rgba(165,180,252,0.4)", borderRadius: 1, borderTop: "2px dashed rgba(165,180,252,0.4)" }}></div>
              Benchmark nivel
            </div>
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
            Framework adaptado · Product Sense
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "20px clamp(16px, 4vw, 32px)", fontSize: 11, color: "rgba(255,255,255,0.2)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        Mentores con Propósito · Para PMs en Latinoamérica
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        /* Mobile: ocultar tooltip hover y mostrar leyenda de dimensiones */
        @media (hover: none) and (pointer: coarse) {
          .home-tooltip { display: none !important; }
        }

        /* Mobile: layout vertical, márgenes seguros */
        @media (max-width: 600px) {
          .home-hero-gap {
            flex-direction: column !important;
            align-items: flex-start !important;
            row-gap: 28px !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
          }
          .home-radar-svg {
            max-width: min(320px, calc(100vw - 40px)) !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// SHARED RADAR VIEW (landing de resultado compartido)
// ─────────────────────────────────────────────
function SharedRadarView() {
  var params = new URLSearchParams(window.location.search);
  var DIMS_KEYS = ["user_insights","business_acumen","product_quality","product_strategy","execution","influence","data_fluency","ai_fluency"];
  var ps = {};
  DIMS_KEYS.forEach(function(k) {
    var v = parseInt(params.get(k), 10);
    ps[k] = isNaN(v) ? 0 : Math.max(0, Math.min(10, v));
  });
  var nivel = params.get("nivel") || "mid";

  // Reconstruct shared data from URL params
  var arcLabel = params.get("arc_label");
  var arcTagline = params.get("arc_tagline");
  var archetypeData = (arcLabel && arcTagline) ? { label: arcLabel, tagline: arcTagline } : null;
  var psPct = params.get("pspct") ? parseInt(params.get("pspct"), 10) : null;
  var superpoderText = params.get("superpoder") || null;
  var puntoCiegoText = params.get("puntociego") || null;
  var proximaLabel = params.get("proxima_label");
  var proximaTip = params.get("proxima_tip");
  var proximaSkillData = (proximaLabel && proximaTip) ? { label: proximaLabel, tip: proximaTip } : null;

  function goToDiag() {
    window.location.href = window.location.origin;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d1a", color: "#f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>Mentorcito · Product Sense Radar</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Este es mi mapa de Product Sense</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Framework Shreyas Doshi · Nivel <span style={{ color: "#a5b4fc", fontWeight: 700 }}>{nivel}</span></div>
        </div>
        {archetypeData && (
          <div style={{ marginBottom: 20, textAlign: "center" }}>
            <div style={{ display: "inline-block", background: "linear-gradient(135deg, rgba(67,97,238,0.18), rgba(123,47,247,0.18))", border: "1px solid rgba(165,180,252,0.25)", borderRadius: 14, padding: "16px 24px", maxWidth: 480, width: "100%" }}>
              <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "rgba(165,180,252,0.6)", marginBottom: 8 }}>Tu resultado</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#a5b4fc", marginBottom: 6, letterSpacing: -0.5 }}>{archetypeData.label}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", fontStyle: "italic", marginBottom: psPct != null ? 12 : 0, lineHeight: 1.5 }}>{archetypeData.tagline}</div>
              {psPct != null && (
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
                  <span style={{ color: "#06d6a0", fontWeight: 800, fontSize: 18 }}>{psPct}%</span> de Product Sense desarrollado
                </div>
              )}
            </div>
          </div>
        )}

        {(superpoderText || puntoCiegoText || proximaSkillData) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {superpoderText && (
              <div style={{ background: "rgba(6,214,160,0.07)", border: "1px solid rgba(6,214,160,0.2)", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(6,214,160,0.6)", marginBottom: 4 }}>⚡ Superpoder</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{superpoderText}</div>
              </div>
            )}
            {puntoCiegoText && (
              <div style={{ background: "rgba(247,37,133,0.07)", border: "1px solid rgba(247,37,133,0.2)", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(247,37,133,0.6)", marginBottom: 4 }}>🎯 Punto ciego</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>{puntoCiegoText}</div>
              </div>
            )}
            {proximaSkillData && (
              <div style={{ background: "rgba(67,97,238,0.07)", border: "1px solid rgba(67,97,238,0.25)", borderRadius: 12, padding: "12px 16px" }}>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(130,150,255,0.6)", marginBottom: 4 }}>🚀 Próxima skill</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#a5b4fc", marginBottom: 3 }}>{proximaSkillData.label}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{proximaSkillData.tip}</div>
              </div>
            )}
          </div>
        )}

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px" }}>
          <ProductSenseRadar
            productSense={ps}
            nivel={nivel}
            archetypeData={archetypeData}
            psPct={psPct}
            superpoderText={superpoderText}
            puntoCiegoText={puntoCiegoText}
            proximaSkillData={proximaSkillData}
          />
        </div>
        <div style={{ marginTop: 28, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>¿Querés ver el tuyo?</div>
          <button
            onClick={goToDiag}
            style={{ background: "linear-gradient(135deg, #4361ee, #7b2ff7)", border: "none", borderRadius: 12, padding: "14px 32px", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
            Hacer mi diagnóstico →
          </button>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 12 }}>Gratis · 5 minutos · Para PMs en Latinoamérica</div>
        </div>
      </div>
    </div>
  );
}

export default function MentorAgent(props) {
  var empresaConfig = props.empresaConfig || null;

  var INITIAL_MSG = {
    role: "assistant",
    content: empresaConfig
      ? "Hola, soy **Mentorcito** 💠\n\n**" + empresaConfig.nombre + "** está invirtiendo en entender en qué momento de carrera está su equipo de producto.\n\nEn los próximos 5 minutos vamos a explorar juntos en qué punto del loop profesional estás hoy — y qué necesitás para avanzar.\n\nNo es un test, ni una evaluación de desempeño. Es confidencial. Y te sirve a vos.\n\n**¿Cómo te llamás?**"
      : "Hola, soy **Mentorcito** 💠\n\nEn los próximos minutos voy a hacerte algunas preguntas para entender en qué punto de tu carrera estás hoy. Al final vas a recibir:\n\n→ Un mapa de tus fortalezas y gaps en las 3 áreas clave de producto: **tecnología**, **producto** y **negocio**\n→ Tu **Product Sense Radar** — 8 dimensiones del framework Shreyas Doshi, incluyendo AI Fluency\n→ Tu estado actual del loop profesional (**Reinvención**, **Estancamiento** o **Liderazgo**)\n→ Los mentores que mejor matchean con tu momento y tus objetivos\n\n**¿Cómo te llamás?**",
  };
  // Detectar modos especiales de URL (se calcula antes de hooks para usarlos como flags)
  var urlParams = new URLSearchParams(window.location.search);
  var isCompartir = urlParams.get("compartir") === "1";
  var estadoParam = urlParams.get("estado");
  var estadoNormalizado = null;
  if (estadoParam) {
    var p = decodeURIComponent(estadoParam).toLowerCase();
    if (p.indexOf("estanc") !== -1) estadoNormalizado = "Estancamiento";
    else if (p.indexOf("lider") !== -1 || p.indexOf("transic") !== -1) estadoNormalizado = "Liderazgo";
    else if (p.indexOf("reinven") !== -1) estadoNormalizado = "Reinvención";
  }

  // Declarar TODOS los hooks antes de cualquier early return (regla de React)
  var [showHome, setShowHome] = useState(!empresaConfig && !isCompartir && !estadoNormalizado);
  var [showLanding, setShowLanding] = useState(!!estadoNormalizado);
  var [messages, setMessages] = useState([INITIAL_MSG]);
  var [input, setInput] = useState("");
  var [loading, setLoading] = useState(false);
  var [diagnosis, setDiagnosis] = useState(null);
  var [phase, setPhase] = useState("intro");
  var [currentDiagKey, setCurrentDiagKey] = useState(null);
  var [liveStats, setLiveStats] = useState(null);
  var bottomRef = useRef(null);

  // Auto-scroll al último mensaje — declarado ANTES de los early returns (regla de hooks)
  useEffect(function() {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Fetch stats en tiempo real para el header — declarado ANTES de los early returns
  useEffect(function() {
    fetch("/api/sheets?action=stats")
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && d.total) setLiveStats(d);
      })
      .catch(function() {});
  }, []);

  // Early returns DESPUÉS de todos los hooks
  if (isCompartir) return <SharedRadarView />;

  // Home landing (pantalla de entrada)
  if (showHome) return <HomeLanding onStart={function() { setShowHome(false); }} />;

  // Mostrar landing si viene con ?estado=
  if (showLanding && estadoNormalizado) {
    return <EstadoLanding estado={estadoNormalizado} onStart={function() { setShowLanding(false); }} />;
  }

  // Calcular tema actual en cada render y sincronizar global T

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
            // Calcular tensiones del diagnóstico para guardar en Sheet
            var estadoDiag = diag.estado || "Estancamiento";
            var tensionesDiag = detectarTensiones(Object.assign({}, diag, { estado: estadoDiag }));
            var tensionesStr = tensionesDiag.map(function(t){ return t.label; }).join(" | ");

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
              empresa_id: empresaConfig ? empresaConfig.empresa : "",
              tensiones: tensionesStr,
              score_nudo: calcularScore(diag),
              nudo_nivel: calcularScore(diag) >= 46 ? "prioritario" : calcularScore(diag) >= 31 ? "exploratorio" : "ninguno",
              skills_tech: clasificarGapsEnSkills(diag.gaps || []).tech.join("|"),
              skills_producto: clasificarGapsEnSkills(diag.gaps || []).producto.join("|"),
              skills_negocio: clasificarGapsEnSkills(diag.gaps || []).negocio.join("|"),
            });
          }
        } catch (e) {}
      } else if (newMessages.length > 4) { setPhase("exploring"); }

      // Detectar email en los mensajes del usuario y actualizar en Sheets
      if (!diag && currentDiagKey && SHEETS_URL.indexOf("TU_GOOGLE") === -1) {
        var emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
        var lastUserMsg = userMsg.content || "";
        var emailMatch = lastUserMsg.match(emailRegex);
        if (emailMatch) {
          postToSheets({ action: "update_email", diag_key: currentDiagKey, email: emailMatch[0] });
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

        <div style={{ padding: "0 12px", height: 56, borderBottom: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(13,13,26,0.97)", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="https://mentoresconproposito.vercel.app/" style={{ width: 30, height: 30, borderRadius: 8, background: T.highlightBg, border: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSub, fontSize: 15, textDecoration: "none", flexShrink: 0 }}>←</a>
            <span style={{ fontSize: 20 }}>💠</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.textWhite, lineHeight: 1.2 }}>
                {empresaConfig ? empresaConfig.icono + "  " + empresaConfig.nombre : "Mentores con Propósito"}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>
                {empresaConfig ? "Diagnóstico de equipo · Mentorcito" : "Agente de diagnóstico"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: phaseColor[phase] + "18", border: "1px solid " + phaseColor[phase] + "44" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: phaseColor[phase] }} />
            <span style={{ fontSize: 10, color: phaseColor[phase], fontWeight: 600 }}>{phaseLabel[phase]}</span>
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
                      <DiagnosisPanel diagnosis={diagnosis} allMessages={messages} trackEvent={trackFunnelEvent} postToSheets={postToSheets} diagKey={currentDiagKey} empresaCtx={empresaConfig} />
                    )}
                  </div>
                  {/* Social proof debajo del primer mensaje */}
                  {msg.role === "assistant" && i === 0 && liveStats && liveStats.total > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 4, padding: "5px 12px", borderRadius: 20, background: "rgba(6,214,160,0.07)", border: "1px solid rgba(6,214,160,0.18)", alignSelf: "flex-start" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#06d6a0", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "#06d6a0", fontWeight: 600 }}>
                        {liveStats.total} profesionales ya lo hicieron · {Math.round(liveStats.match_count / liveStats.total * 100)}% encontraron su mentor/a
                      </span>
                    </div>
                  )}
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 10, color: T.textDisabled }}>En desktop: Enter para enviar · En mobile: botón ➤</span>
              <a href="/privacidad" target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: T.textDisabled, textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                Política de privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
