import MentorAgent from './MentorAgent';

// ── EmpresaAgent ─────────────────────────────────────────────
// Wrapper del agente original que activa el modo empresa
// cuando hay ?empresa= y ?token= en la URL.
// El agente original NO se modifica — este componente
// solo inyecta el contexto de empresa antes de renderizarlo.

var EMPRESAS_CONFIG = {
  // Acá agregás los clientes B2B que contrataron el servicio
  // "token": { nombre, logo_emoji, color, max_diagnosticos }
  "demo2026":   { nombre: "Empresa Demo",    icono: "🏢", color: "#4361ee", max: 5  },
  "acme2026":   { nombre: "Acme Corp",        icono: "🚀", color: "#06d6a0", max: 20 },
  "startup2026":{ nombre: "Startup XYZ",      icono: "🌱", color: "#f72585", max: 5  },
};

export default function EmpresaAgent() {
  var params  = new URLSearchParams(window.location.search);
  var empresa = params.get("empresa") || "";
  var token   = params.get("token")   || "";
  var config  = EMPRESAS_CONFIG[token];

  // Token inválido o no existe
  if (!config) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0d0d1a",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        padding: 20,
      }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <div style={{ color: "white", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
            Link inválido o expirado
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Este link de diagnóstico no es válido. Pedile a tu empresa
            el link actualizado o contactá a Mentores con Propósito.
          </div>
          <a href="/" style={{
            display: "inline-block", padding: "10px 20px",
            background: "rgba(67,97,238,0.15)", border: "1px solid rgba(67,97,238,0.3)",
            borderRadius: 8, color: "#6b87f5", fontSize: 13, fontWeight: 600,
            textDecoration: "none",
          }}>
            Ir al diagnóstico público →
          </a>
        </div>
      </div>
    );
  }

  // Inyectar mensaje de bienvenida personalizado si hay empresa
  return <MentorAgent empresaConfig={{ empresa, token, ...config }} />;
}
