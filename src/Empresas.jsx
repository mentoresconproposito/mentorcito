import { useState, useEffect } from "react";

var WA_LINK = "https://wa.me/5491100000000?text=Quiero%20saber%20más%20sobre%20Mentorcito%20para%20equipos";
var EMAIL   = "hola@mentoresconproposito.com";

var PAQUETES = [
  {
    icono: "🌱",
    nombre: "Starter",
    subtitulo: "El primer diagnóstico",
    target: "Startups · 10-50 personas",
    precio: "USD 295",
    unit: "USD 59 por persona",
    diagnosticos: "5 diagnósticos",
    sesion: "1 sesión de resultados",
    followup: "—",
    descuento: "10%",
    nudo: "Add-on disponible",
    color: "#06D6A0",
    destacado: false,
  },
  {
    icono: "🚀",
    nombre: "Growth",
    subtitulo: "Diagnóstico + seguimiento",
    target: "Empresas medianas · 50-200 personas",
    precio: "USD 980",
    unit: "USD 49 por persona",
    diagnosticos: "20 diagnósticos",
    sesion: "2 sesiones de resultados",
    followup: "Check-in 30 días",
    descuento: "15%",
    nudo: "Add-on disponible",
    color: "#4361EE",
    destacado: true,
  },
  {
    icono: "🏢",
    nombre: "Enterprise",
    subtitulo: "Inteligencia de equipo",
    target: "Empresas 200+ personas",
    precio: "Desde USD 1.950",
    unit: "USD 39 por persona",
    diagnosticos: "50+ diagnósticos",
    sesion: "3 sesiones + ejecutiva",
    followup: "Plan 90 días",
    descuento: "20%",
    nudo: "Incluido",
    color: "#F72585",
    destacado: false,
  },
];

var PASOS = [
  {
    n: "01",
    titulo: "Cada persona hace el diagnóstico",
    desc: "5 minutos. Desde el celular. Un agente conversacional detecta el estado del loop profesional, las tensiones y el Índice de Tensión.",
    tag: "Individual",
  },
  {
    n: "02",
    titulo: "El sistema detecta bloqueos estructurales",
    desc: "Cuando el índice supera el umbral, el agente activa el diagnóstico NUDO Mindset — 5 preguntas que detectan barreras invisibles al crecimiento.",
    tag: "Sistema NUDO",
  },
  {
    n: "03",
    titulo: "Ves el mapa completo del equipo",
    desc: "Dashboard con distribución de estados, tensiones más frecuentes, riesgo de rotación y perfil NUDO. En tiempo real.",
    tag: "Dashboard",
  },
  {
    n: "04",
    titulo: "Intervención diferenciada",
    desc: "Mentoría individual para gaps profesionales. NUDO Mindset para barreras estructurales. Cada persona recibe lo que realmente necesita.",
    tag: "Acompañamiento",
  },
];

var DATOS = [
  { numero: "100+", label: "diagnósticos en 3 semanas", color: "#4361EE" },
  { numero: "97%", label: "encontraron un mentor relevante", color: "#06D6A0" },
  { numero: "33%", label: "de PMs en Latam en Estancamiento", color: "#F72585" },
];

var DIFERENCIAL = [
  ["La mayoría de las plataformas", "Asumen qué le falta a cada persona", "❌"],
  ["Mentorcito para empresas", "Diagnostica primero — recomienda después", "✓"],
  ["Cursos y upskilling", "Intervienen en la capa equivocada", "❌"],
  ["Sistema NUDO integrado", "Detecta si el obstáculo es técnico o estructural", "✓"],
];

export default function Empresas() {
  var [hovPack, setHovPack] = useState(null);
  var [visible, setVisible] = useState(false);

  useEffect(function() {
    var t = setTimeout(function() { setVisible(true); }, 80);
    return function() { clearTimeout(t); };
  }, []);

  return (
    <div style={{
      background: "#0A0A14",
      minHeight: "100vh",
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: "#F5F5F0",
      overflowX: "hidden",
    }}>

      {/* Google fonts */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap" />

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "16px 24px",
        background: "rgba(10,10,20,0.88)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <a href="https://mentorcito.vercel.app" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>💠</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#4361EE", letterSpacing: 0.5 }}>Mentorcito</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>para empresas</span>
        </a>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{
          padding: "8px 18px", background: "#4361EE", borderRadius: 8,
          color: "white", fontSize: 13, fontWeight: 600, textDecoration: "none",
          letterSpacing: 0.3,
        }}>
          Hablar con nosotros →
        </a>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "120px 24px 80px",
        textAlign: "center",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.6s ease",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 3,
          textTransform: "uppercase", color: "#4361EE",
          marginBottom: 32,
        }}>
          Diagnóstico de liderazgo en producto
        </div>

        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "clamp(36px, 7vw, 72px)",
          fontWeight: 400,
          lineHeight: 1.08,
          margin: "0 0 24px",
          maxWidth: 800,
          color: "#F5F5F0",
          letterSpacing: "-0.5px",
        }}>
          ¿Sabés en qué punto de carrera está cada PM de tu equipo?
        </h1>

        <p style={{
          fontSize: 18, lineHeight: 1.7,
          color: "rgba(245,245,240,0.5)",
          maxWidth: 520, margin: "0 auto 48px",
          fontWeight: 400,
        }}>
          El 33% de los profesionales de producto en Latam está en Estancamiento.
          Sin ese mapa, cualquier programa de desarrollo es genérico.
        </p>

        {/* Datos */}
        <div style={{
          display: "flex", gap: 40, marginBottom: 56,
          flexWrap: "wrap", justifyContent: "center",
        }}>
          {DATOS.map(function(d, i) {
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 48, fontWeight: 400,
                  color: d.color, lineHeight: 1,
                  marginBottom: 6,
                }}>
                  {d.numero}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", maxWidth: 140 }}>
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="#piloto" style={{
            padding: "14px 28px",
            background: "#4361EE",
            borderRadius: 10, color: "white",
            fontSize: 15, fontWeight: 600,
            textDecoration: "none",
            letterSpacing: 0.2,
          }}>
            Diagnóstico gratuito para 3 personas →
          </a>
          <a href="#como-funciona" style={{
            padding: "14px 28px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 10, color: "rgba(255,255,255,0.6)",
            fontSize: 15, textDecoration: "none",
          }}>
            Ver cómo funciona
          </a>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" style={{
        padding: "100px 24px",
        maxWidth: 680, margin: "0 auto",
      }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 3,
          textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
          marginBottom: 16, textAlign: "center",
        }}>
          El proceso
        </div>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 400, textAlign: "center",
          margin: "0 0 64px", color: "#F5F5F0",
          letterSpacing: "-0.3px",
        }}>
          Diagnóstico primero.<br/>Recomendación después.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {PASOS.map(function(paso, i) {
            return (
              <div key={i} style={{
                display: "flex", gap: 24,
                padding: "28px 0",
                borderBottom: i < PASOS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                <div style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 32, color: "rgba(255,255,255,0.08)",
                  lineHeight: 1, flexShrink: 0, width: 48,
                  fontWeight: 400,
                }}>
                  {paso.n}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#F5F5F0" }}>
                      {paso.titulo}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 600, letterSpacing: 1.5,
                      textTransform: "uppercase", padding: "3px 8px",
                      borderRadius: 4,
                      background: i === 1 ? "rgba(123,47,247,0.15)" : "rgba(67,97,238,0.12)",
                      color: i === 1 ? "#9b5fff" : "#6b87f5",
                    }}>
                      {paso.tag}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 14, lineHeight: 1.7,
                    color: "rgba(245,245,240,0.45)",
                    margin: 0,
                  }}>
                    {paso.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* El diferencial */}
      <section style={{
        padding: "80px 24px",
        background: "rgba(255,255,255,0.02)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(24px, 3.5vw, 36px)",
            fontWeight: 400, margin: "0 0 40px",
            color: "#F5F5F0", letterSpacing: "-0.3px",
          }}>
            La única propuesta en Latam con diagnóstico de bloqueo estructural integrado.
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {DIFERENCIAL.map(function(row, i) {
              var esNuestro = row[2] === "✓";
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center",
                  padding: "14px 16px",
                  background: esNuestro ? "rgba(67,97,238,0.07)" : "transparent",
                  borderRadius: 8, marginBottom: 4,
                  border: esNuestro ? "1px solid rgba(67,97,238,0.15)" : "1px solid transparent",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    background: esNuestro ? "rgba(6,214,160,0.15)" : "rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, marginRight: 14,
                    color: esNuestro ? "#06D6A0" : "rgba(255,255,255,0.2)",
                  }}>
                    {row[2]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 14, fontWeight: esNuestro ? 600 : 400,
                      color: esNuestro ? "#F5F5F0" : "rgba(245,245,240,0.35)",
                    }}>
                      {row[0]}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: esNuestro ? "rgba(245,245,240,0.5)" : "rgba(245,245,240,0.2)",
                    }}>
                      {row[1]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Paquetes */}
      <section id="paquetes" style={{ padding: "100px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 3,
          textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
          marginBottom: 16, textAlign: "center",
        }}>
          Paquetes
        </div>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: "clamp(28px, 4vw, 40px)",
          fontWeight: 400, textAlign: "center",
          margin: "0 0 56px", color: "#F5F5F0",
        }}>
          Tres tamaños. Un sistema.
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}>
          {PAQUETES.map(function(pk, i) {
            var isHov = hovPack === i;
            return (
              <div key={i}
                onMouseEnter={function() { setHovPack(i); }}
                onMouseLeave={function() { setHovPack(null); }}
                style={{
                  background: pk.destacado
                    ? "rgba(67,97,238,0.08)"
                    : "rgba(255,255,255,0.03)",
                  border: pk.destacado
                    ? "1px solid rgba(67,97,238,0.3)"
                    : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  padding: "28px 24px",
                  position: "relative",
                  transition: "transform 0.2s, border-color 0.2s",
                  transform: isHov ? "translateY(-3px)" : "none",
                  cursor: "default",
                }}>
                {pk.destacado && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%",
                    transform: "translateX(-50%)",
                    background: "#4361EE", color: "white",
                    fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                    textTransform: "uppercase",
                    padding: "4px 14px", borderRadius: 20,
                  }}>
                    Más elegido
                  </div>
                )}

                <div style={{ fontSize: 24, marginBottom: 10 }}>{pk.icono}</div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: 2,
                  textTransform: "uppercase", color: pk.color,
                  marginBottom: 4,
                }}>
                  {pk.nombre}
                </div>
                <div style={{
                  fontFamily: "'DM Serif Display', serif",
                  fontSize: 30, fontWeight: 400,
                  color: "#F5F5F0", lineHeight: 1,
                  marginBottom: 4,
                }}>
                  {pk.precio}
                </div>
                <div style={{
                  fontSize: 12, color: "rgba(255,255,255,0.3)",
                  marginBottom: 20,
                }}>
                  {pk.unit}
                </div>

                <div style={{
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  paddingTop: 16, marginBottom: 20,
                }}>
                  {[
                    ["📊", pk.diagnosticos],
                    ["🗣️", pk.sesion],
                    ["📋", pk.followup],
                    ["🔮", "NUDO Mindset: " + pk.nudo],
                    ["💰", "Descuento mentorías: " + pk.descuento],
                  ].map(function(item, j) {
                    var noDisp = item[1] === "—";
                    return (
                      <div key={j} style={{
                        display: "flex", gap: 8, marginBottom: 8,
                        opacity: noDisp ? 0.3 : 1,
                      }}>
                        <span style={{ fontSize: 13, flexShrink: 0 }}>{item[0]}</span>
                        <span style={{ fontSize: 13, color: "rgba(245,245,240,0.65)" }}>
                          {item[1]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  fontSize: 11, color: "rgba(255,255,255,0.25)",
                  marginBottom: 16,
                }}>
                  Para: {pk.target}
                </div>

                <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{
                  display: "block", textAlign: "center",
                  padding: "11px 0",
                  background: pk.destacado ? "#4361EE" : "transparent",
                  border: pk.destacado ? "none" : "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  color: pk.destacado ? "white" : "rgba(245,245,240,0.5)",
                  fontSize: 13, fontWeight: 600,
                  textDecoration: "none",
                  transition: "opacity 0.15s",
                }}>
                  Hablar con nosotros →
                </a>
              </div>
            );
          })}
        </div>

        {/* Add-on NUDO */}
        <div style={{
          marginTop: 24,
          padding: "20px 24px",
          background: "rgba(123,47,247,0.07)",
          border: "1px solid rgba(123,47,247,0.2)",
          borderRadius: 12,
          display: "flex", alignItems: "center", gap: 16,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 20 }}>🔮</span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: "#c99eff", marginBottom: 3,
            }}>
              Add-on NUDO Mindset disponible en todos los paquetes
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              Sesión exploratoria (score 31-45): USD 180 por persona · Programa intensivo 4 sesiones (score ≥ 46): USD 490
            </div>
          </div>
        </div>
      </section>

      {/* Piloto gratuito */}
      <section id="piloto" style={{
        padding: "80px 24px",
        background: "rgba(67,97,238,0.05)",
        borderTop: "1px solid rgba(67,97,238,0.1)",
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 3,
            textTransform: "uppercase", color: "#06D6A0",
            marginBottom: 16,
          }}>
            Sin compromiso
          </div>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 400, margin: "0 0 16px", color: "#F5F5F0",
          }}>
            3 diagnósticos gratuitos para tu equipo
          </h2>
          <p style={{
            fontSize: 16, color: "rgba(245,245,240,0.45)",
            lineHeight: 1.7, margin: "0 0 36px",
          }}>
            Elegís 3 personas. En 3-5 días tenés resultados reales.
            Hacemos 30 minutos juntos para revisarlos.
            Sin compromiso de compra.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" style={{
              padding: "15px 32px",
              background: "#4361EE",
              borderRadius: 10, color: "white",
              fontSize: 15, fontWeight: 600,
              textDecoration: "none",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>💬</span> Solicitar piloto por WhatsApp
            </a>
            <a href={"mailto:" + EMAIL + "?subject=Piloto%20Mentorcito%20empresas"} style={{
              padding: "15px 32px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, color: "rgba(245,245,240,0.55)",
              fontSize: 15, textDecoration: "none",
            }}>
              ✉️ Escribir por email
            </a>
          </div>

          <div style={{
            marginTop: 24, fontSize: 12,
            color: "rgba(255,255,255,0.2)",
            lineHeight: 1.6,
          }}>
            La condición: 30 minutos de feedback sobre el diagnóstico.<br/>
            Eso es todo.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "40px 24px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16,
        maxWidth: 900, margin: "0 auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>💠</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            Mentorcito · Mentores con Propósito · 2026
          </span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[
            ["Diagnóstico individual", "https://mentorcito.vercel.app"],
            ["Mentores", "https://mentoresconproposito.vercel.app"],
            ["NUDO Mindset", "https://www.mauriciojimenezpsicologo.com"],
            ["Privacidad", "https://mentorcito.vercel.app/privacidad"],
          ].map(function(link, i) {
            return (
              <a key={i} href={link[1]} target="_blank" rel="noopener noreferrer" style={{
                fontSize: 12, color: "rgba(255,255,255,0.25)",
                textDecoration: "none",
              }}>
                {link[0]}
              </a>
            );
          })}
        </div>
      </footer>

    </div>
  );
}
