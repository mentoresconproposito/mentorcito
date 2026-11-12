import { useEffect } from "react";

var BLANCO = { color: "white" };
var TH = { textAlign: "left", padding: "8px 10px", color: "white", fontWeight: 700, borderBottom: "1px solid rgba(255,255,255,0.12)", verticalAlign: "top" };
var TD = { padding: "8px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", verticalAlign: "top" };

export default function Privacidad() {
  // La página se dibuja después de cargar, así que el navegador no salta solo a /privacidad#eventos
  useEffect(function() {
    var id = window.location.hash.slice(1);
    if (!id) return;
    var t = setTimeout(function() {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return function() { clearTimeout(t); };
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d0d1a",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: "rgba(255,255,255,0.88)",
      padding: "0 0 60px 0",
    }}>
      {/* Header */}
      <div style={{
        padding: "0 16px",
        height: 56,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(13,13,26,0.97)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/" style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", fontSize: 15, textDecoration: "none", flexShrink: 0 }}>←</a>
          <span style={{ fontSize: 20 }}>💠</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.2 }}>Mentores con Propósito</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.38)" }}>Política de privacidad</div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px" }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Documento legal</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "white", margin: "0 0 8px 0" }}>Política de Privacidad</h1>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Última actualización: noviembre de 2026</div>
        </div>

        <Section titulo="¿Quiénes somos?">
          Mentorcito es un agente de diagnóstico de carrera desarrollado por <strong>Mentores con Propósito</strong>, que es responsable de los datos que recopila. También funciona en eventos para sugerir con quién conversar (ver <a href="#eventos" style={{ color: "#6b87f5" }}>Mentorcito para eventos</a>). Esta política explica qué información recopilamos cuando usás el agente y qué hacemos con ella.
        </Section>

        <Section titulo="¿Qué información recopilamos?">
          <p style={{ marginBottom: 12 }}><strong style={BLANCO}>Durante el diagnóstico:</strong></p>
          <ul style={{ margin: "0 0 16px 0", paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Las respuestas que escribís en el chat (tu situación profesional, tus gaps y tus objetivos)</li>
            <li>El estado del loop profesional resultante (Reinvención, Estancamiento o Liderazgo)</li>
            <li>Los niveles inferidos en las tres dimensiones: Tecnología, Producto y Negocio</li>
          </ul>
          <p style={{ marginBottom: 12 }}><strong style={BLANCO}>De forma opcional, si decidís dejarlo:</strong></p>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Tu nombre</li>
            <li>Tu dirección de email</li>
          </ul>
        </Section>

        <Section titulo="¿Para qué usamos esa información?">
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
            <li>Para generar tu diagnóstico y conectarte con el mentor más adecuado para tu momento</li>
            <li>Para enviarte tu diagnóstico por email si nos lo pedís</li>
            <li>Para mejorar el agente con patrones agregados y anonimizados</li>
            <li>Para hacer seguimiento de tu evolución profesional si consentís en futuras comunicaciones</li>
          </ul>
        </Section>

        <Section titulo="¿Dónde se almacena?">
          Los datos se guardan en <strong style={BLANCO}>Google Sheets</strong> (Google LLC) y se procesan a través de la <strong style={BLANCO}>API de Anthropic</strong> (Anthropic PBC) para generar las respuestas del chat. Ambos servicios tienen sus propias políticas de privacidad y estándares de seguridad internacionales. Google y Anthropic procesan los datos en servidores fuera de Argentina, incluidos Estados Unidos. Al usar el agente, consentís esa transferencia internacional.
        </Section>

        <Section titulo="¿Compartimos tus datos?">
          <strong style={BLANCO}>No vendemos tu información personal.</strong> En el diagnóstico de carrera, los mentores que matchean con tu perfil solo reciben el contexto profesional relevante, nunca tus datos de contacto sin tu consentimiento explícito. En Mentorcito para eventos, si aceptás, compartimos tu perfil y tu contacto con tus matches y con el organizador del evento, como se explica en la <a href="#eventos" style={{ color: "#6b87f5" }}>sección de eventos</a>.
        </Section>

        <Section titulo="¿Por cuánto tiempo guardamos tus datos?">
          Los diagnósticos se conservan por un máximo de <strong style={BLANCO}>12 meses</strong>. Los datos de eventos se conservan hasta <strong style={BLANCO}>6 meses</strong> después del evento. Podés solicitar la eliminación de tus datos en cualquier momento escribiéndonos a través del WhatsApp de Mentores con Propósito.
        </Section>

        <Section titulo="Tus derechos">
          <p style={{ marginBottom: 12 }}>De acuerdo con la Ley 25.326 de Protección de Datos Personales (Argentina) y legislaciones equivalentes en Latam, tenés derecho a:</p>
          <ul style={{ margin: "0 0 12px 0", paddingLeft: 20, lineHeight: 1.9 }}>
            <li><strong style={BLANCO}>Acceder</strong> a los datos que tenemos sobre vos</li>
            <li><strong style={BLANCO}>Corregir</strong> información incorrecta o desactualizada</li>
            <li><strong style={BLANCO}>Eliminar</strong> tus datos de nuestros registros</li>
            <li><strong style={BLANCO}>Oponerte</strong> al procesamiento de tus datos para fines de comunicación</li>
          </ul>
          <p style={{ margin: 0 }}>Respondemos los pedidos de acceso en hasta 10 días corridos y los de corrección o eliminación en hasta 5 días hábiles.</p>
        </Section>

        <Section titulo="Cookies y analytics">
          El agente <strong style={BLANCO}>no usa cookies de seguimiento</strong> ni plataformas de publicidad. Usamos Vercel Analytics para métricas básicas de uso (visitas, errores técnicos) de forma completamente anonimizada.
        </Section>

        <Section id="eventos" titulo="Mentorcito para eventos">
          <p style={{ marginTop: 0, marginBottom: 12 }}>Cuando usás Mentorcito en un evento (mentorcito.vercel.app/eventos), el agente arma tu perfil de networking y te sugiere con quién conversar. El organizador del evento recibe los perfiles de quienes aceptan compartirlos y es responsable del uso que les da.</p>

          <p style={{ marginBottom: 8 }}><strong style={BLANCO}>Qué información recopilamos</strong></p>
          <ul style={{ margin: "0 0 16px 0", paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Tus respuestas en el chat: nombre, rol, empresa, lo que ofrecés, lo que buscás, a qué venís al evento y si preferís charlas 1 a 1 o en grupo</li>
            <li>Si querés dejarlos: tu WhatsApp, tu LinkedIn o tu email</li>
            <li>Tu respuesta a la pregunta de consentimiento</li>
            <li>Tus matches y tu mesa, que calculamos a partir de tu perfil</li>
            <li>Si los usás: el botón "Ya hablamos", la calificación de 1 a 5 de cada charla, la encuesta del evento (de 0 a 10) y el comentario que escribas</li>
          </ul>

          <p style={{ marginBottom: 8 }}><strong style={BLANCO}>Para qué la usamos</strong></p>
          <ul style={{ margin: "0 0 12px 0", paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Para sugerirte personas y mesas afines dentro de ese evento</li>
            <li>Para que tus matches puedan escribirte y encontrarte en el evento</li>
            <li>Para que el organizador vea cómo funcionó el networking</li>
            <li>Para mejorar el agente con datos agregados y anonimizados</li>
          </ul>
          <p style={{ marginBottom: 16 }}>No usamos tus datos del evento para publicidad ni te sumamos a otras comunicaciones sin tu permiso.</p>

          <p style={{ marginBottom: 8 }}><strong style={BLANCO}>Quién ve tus datos</strong></p>
          <div style={{ overflowX: "auto", marginBottom: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, lineHeight: 1.6 }}>
              <thead>
                <tr><th style={TH}>Quién</th><th style={TH}>Qué ve</th></tr>
              </thead>
              <tbody>
                <tr><td style={TD}>Tus matches 1 a 1</td><td style={TD}>Tu nombre, rol, empresa, lo que ofrecés y buscás, y el contacto que dejaste</td></tr>
                <tr><td style={TD}>Las personas de tu mesa</td><td style={TD}>Tu nombre</td></tr>
                <tr><td style={TD}>El organizador del evento</td><td style={TD}>Tu perfil completo con contacto, los matches, tus calificaciones de las charlas y tu respuesta a la encuesta. Puede descargarlos en una planilla.</td></tr>
                <tr><td style={TD}>Sponsors del evento</td><td style={TD}>Ningún dato personal. Solo pueden recibir métricas agregadas, como cuántas personas usaron Mentorcito.</td></tr>
                <tr><td style={TD}>El resto de los asistentes</td><td style={TD}>Nada</td></tr>
              </tbody>
            </table>
          </div>
          <p style={{ marginBottom: 16 }}>Si no aceptás compartir tus datos, tu perfil no se guarda en nuestra base: queda solo en tu navegador y no lo ven otros asistentes ni el organizador. Tus calificaciones de las charlas no se le muestran a la persona calificada.</p>

          <p style={{ marginBottom: 8 }}><strong style={BLANCO}>Dónde se almacena</strong></p>
          <ul style={{ margin: "0 0 16px 0", paddingLeft: 20, lineHeight: 1.8 }}>
            <li>En Google Sheets (Google LLC), donde guardamos los perfiles y las respuestas</li>
            <li>En la API de Anthropic (Anthropic PBC), que procesa el chat para armar tu perfil</li>
            <li>En tu navegador, para que vuelvas a ver tus matches sin repetir el chat. Podés borrarlo limpiando los datos del sitio.</li>
            <li>En tu link personal, que lleva tu perfil. Quien tenga ese link puede verlo, así que compartilo solo con quien quieras.</li>
          </ul>

          <p style={{ marginBottom: 8 }}><strong style={BLANCO}>Por cuánto tiempo</strong></p>
          <p style={{ marginBottom: 16 }}>Guardamos los perfiles, los datos de contacto y las respuestas de cada evento hasta 6 meses después del evento. Después solo conservamos métricas agregadas, sin datos que te identifiquen. Podés pedir que los borremos antes en cualquier momento. Si nos pedís borrar tus datos, también le avisamos al organizador del evento.</p>
        </Section>

        <Section titulo="Cambios en esta política">
          Si actualizamos esta política, lo comunicaremos en esta misma página con la fecha de la última modificación. El uso continuado del agente después de los cambios implica la aceptación de la nueva versión.
        </Section>

        {/* Contacto */}
        <div style={{ marginTop: 40, padding: "20px 20px", background: "rgba(67,97,238,0.06)", border: "1px solid rgba(67,97,238,0.2)", borderRadius: 12 }}>
          <div style={{ fontSize: 11, color: "#6b87f5", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Contacto</div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.7 }}>
            Para ejercer cualquiera de estos derechos o hacer consultas sobre privacidad, escribinos a través de:
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/" style={{ padding: "7px 14px", background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.3)", borderRadius: 8, color: "#6b87f5", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              mentorcito.vercel.app
            </a>
            <a href="https://mentoresconproposito.vercel.app" target="_blank" rel="noopener noreferrer" style={{ padding: "7px 14px", background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.3)", borderRadius: 8, color: "#6b87f5", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              mentoresconproposito.vercel.app
            </a>
          </div>
        </div>

        {/* Aviso obligatorio (Disposición DNPDP 10/2008) */}
        <div style={{ marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.38)", lineHeight: 1.6 }}>
          El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326. La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
        </div>

      </div>
    </div>
  );
}

function Section({ id, titulo, children }) {
  return (
    <div id={id} style={{ marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.06)", scrollMarginTop: 72 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: "0 0 10px 0" }}>{titulo}</h2>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}
