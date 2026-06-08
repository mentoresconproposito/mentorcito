import { useState } from "react";

export default function Privacidad() {
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
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Última actualización: junio de 2026</div>
        </div>

        <Section titulo="¿Quiénes somos?">
          Mentorcito es un agente de diagnóstico de carrera desarrollado por <strong>Mentores con Propósito</strong>. Esta política explica qué información recopilamos cuando usás el agente y qué hacemos con ella.
        </Section>

        <Section titulo="¿Qué información recopilamos?">
          <p style={{ marginBottom: 12 }}><strong style={{ color: "white" }}>Durante el diagnóstico:</strong></p>
          <ul style={{ margin: "0 0 16px 0", paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Las respuestas que escribís en el chat (tu situación profesional, tus gaps y tus objetivos)</li>
            <li>El estado del loop profesional resultante (Reinvención, Estancamiento o Liderazgo)</li>
            <li>Los niveles inferidos en las tres dimensiones: Tecnología, Producto y Negocio</li>
          </ul>
          <p style={{ marginBottom: 12 }}><strong style={{ color: "white" }}>De forma opcional, si decidís dejarlo:</strong></p>
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
          Los datos se guardan en <strong style={{ color: "white" }}>Google Sheets</strong> (Google LLC) y se procesan a través de la <strong style={{ color: "white" }}>API de Anthropic</strong> (Anthropic PBC) para generar las respuestas del chat. Ambos servicios tienen sus propias políticas de privacidad y estándares de seguridad internacionales.
        </Section>

        <Section titulo="¿Compartimos tus datos?">
          <strong style={{ color: "white" }}>No vendemos ni compartimos tu información personal con terceros.</strong> Los mentores que matchean con tu perfil solo reciben el contexto profesional relevante, nunca datos de contacto sin tu consentimiento explícito.
        </Section>

        <Section titulo="¿Por cuánto tiempo guardamos tus datos?">
          Los diagnósticos se conservan por un máximo de <strong style={{ color: "white" }}>12 meses</strong>. Podés solicitar la eliminación de tus datos en cualquier momento escribiéndonos a través del WhatsApp de Mentores con Propósito.
        </Section>

        <Section titulo="Tus derechos">
          <p style={{ marginBottom: 12 }}>De acuerdo con la Ley 25.326 de Protección de Datos Personales (Argentina) y legislaciones equivalentes en Latam, tenés derecho a:</p>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.9 }}>
            <li><strong style={{ color: "white" }}>Acceder</strong> a los datos que tenemos sobre vos</li>
            <li><strong style={{ color: "white" }}>Corregir</strong> información incorrecta o desactualizada</li>
            <li><strong style={{ color: "white" }}>Eliminar</strong> tus datos de nuestros registros</li>
            <li><strong style={{ color: "white" }}>Oponerte</strong> al procesamiento de tus datos para fines de comunicación</li>
          </ul>
        </Section>

        <Section titulo="Cookies y analytics">
          El agente <strong style={{ color: "white" }}>no usa cookies de seguimiento</strong> ni plataformas de publicidad. Usamos Vercel Analytics para métricas básicas de uso (visitas, errores técnicos) de forma completamente anonimizada.
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

      </div>
    </div>
  );
}

function Section({ titulo, children }) {
  return (
    <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: "white", margin: "0 0 10px 0" }}>{titulo}</h2>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}
