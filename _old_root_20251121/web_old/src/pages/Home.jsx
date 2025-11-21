// /Users/roby80/Projects/ai-ads-revolution/web/src/pages/Home.jsx
import React from "react";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        margin: 0,
        background:
          "radial-gradient(circle at top, #1d293b 0, #020617 45%, #000 100%)",
        color: "#e5e7eb",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* TOP BAR */}
      <header
        style={{
          borderBottom: "1px solid rgba(148,163,184,0.18)",
          backdropFilter: "blur(14px)",
          background:
            "linear-gradient(90deg, rgba(15,23,42,0.85), rgba(15,23,42,0.4))",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div
          style={{
            maxWidth: "1120px",
            margin: "0 auto",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "999px",
                background:
                  "conic-gradient(from 140deg, #22c55e, #0ea5e9, #6366f1, #a855f7, #22c55e)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 22px rgba(56,189,248,0.6)",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#0b1120",
                }}
              >
                AI
              </span>
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  fontSize: 14,
                  textTransform: "uppercase",
                }}
              >
                AI Ads Revolution
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#9ca3af",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                performance ad network
              </div>
            </div>
          </div>

          {/* Right area */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <nav
              style={{
                display: "flex",
                gap: 16,
                fontSize: 13,
                color: "#9ca3af",
              }}
            >
              <a href="#advertisers" style={{ textDecoration: "none", color: "inherit" }}>
                Inserzionisti
              </a>
              <a href="#publishers" style={{ textDecoration: "none", color: "inherit" }}>
                Publisher
              </a>
              <a href="#ai-engine" style={{ textDecoration: "none", color: "inherit" }}>
                Motore AI
              </a>
            </nav>

            <button
              style={{
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.6)",
                background: "transparent",
                color: "#e5e7eb",
                padding: "7px 14px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Login
            </button>
            <button
              style={{
                borderRadius: 999,
                border: "none",
                background:
                  "linear-gradient(135deg, #22c55e, #16a34a, #22c55e)",
                color: "#020617",
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 10px 30px rgba(34,197,94,0.35)",
              }}
            >
              Crea account
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          padding: "32px 16px 40px",
        }}
      >
        <div
          style={{
            maxWidth: "1120px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2.7fr)",
            gap: 32,
            alignItems: "center",
          }}
        >
          {/* HERO LEFT */}
          <section>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 9px",
                borderRadius: 999,
                border: "1px solid rgba(148,163,184,0.35)",
                background:
                  "linear-gradient(90deg, rgba(15,23,42,0.9), rgba(15,23,42,0.2))",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background:
                    "radial-gradient(circle, #22c55e 0, #16a34a 45%, transparent 70%)",
                  boxShadow: "0 0 16px rgba(34,197,94,0.9)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#a5b4fc",
                }}
              >
                Piattaforma adv AI-first
              </span>
            </div>

            <h1
              style={{
                fontSize: 40,
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: "-0.05em",
                marginBottom: 14,
              }}
            >
              La tua{" "}
              <span style={{ color: "#22c55e" }}>prossima generazione</span> di
              pubblicità digitale.
            </h1>

            <p
              style={{
                fontSize: 15,
                color: "#9ca3af",
                maxWidth: 520,
                marginBottom: 22,
              }}
            >
              AI Ads Revolution ottimizza automaticamente budget, creatività e
              posizionamenti in tempo reale. Meno sprechi, più conversioni, zero
              complicazioni. Una sola piattaforma per dominare campagne{" "}
              <strong>search, social, display e native</strong>.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <button
                style={{
                  borderRadius: 999,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #22c55e, #16a34a, #22c55e)",
                  color: "#020617",
                  padding: "10px 22px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 12px 40px rgba(34,197,94,0.35)",
                }}
              >
                Inizia come Inserzionista
              </button>
              <button
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(148,163,184,0.6)",
                  background: "transparent",
                  color: "#e5e7eb",
                  padding: "10px 18px",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Monetizza il tuo traffico
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              <div>
                <span style={{ color: "#e5e7eb", fontWeight: 600 }}>
                  +30% ROAS
                </span>{" "}
                medio dopo 60 giorni
              </div>
              <div>
                <span style={{ color: "#e5e7eb", fontWeight: 600 }}>AI</span>{" "}
                per bidding, targeting e creatività
              </div>
              <div>
                <span style={{ color: "#e5e7eb", fontWeight: 600 }}>
                  No lock-in
                </span>{" "}
                cancelli quando vuoi
              </div>
            </div>
          </section>

          {/* HERO RIGHT – CARD PANORAMICA */}
          <section>
            <div
              style={{
                borderRadius: 26,
                border: "1px solid rgba(148,163,184,0.6)",
background:
  "radial-gradient(circle at top left, rgba(34,197,94,0.12), transparent 55%), radial-gradient(circle at bottom right, rgba(56,189,248,0.18), rgba(15,23,42,0.95))",

                padding: 20,
                boxShadow:
                  "0 24px 70px rgba(15,23,42,0.9), 0 0 40px rgba(56,189,248,0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 14,
                  alignItems: "center",
                }}
              >
                <h2
                  style={{
                    fontSize: 14,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: "#9ca3af",
                  }}
                >
                  Pannello AI Live
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 999,
                    border: "1px solid rgba(94,234,212,0.55)",
                    color: "#a5f3fc",
                    background:
                      "linear-gradient(135deg, rgba(8,47,73,0.9), rgba(15,23,42,0.9))",
                  }}
                >
                  Demo realtime
                </span>
              </div>

              {/* Statistiche */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                  gap: 12,
                  marginBottom: 18,
                  fontSize: 12,
                }}
              >
                {[
                  {
                    label: "Budget di oggi",
                    value: "€ 1.250",
                    sub: "Distribuito su 8 campagne",
                  },
                  {
                    label: "CTR medio",
                    value: "4,9%",
                    sub: "+38% vs ultimo mese",
                  },
                  {
                    label: "Conversioni",
                    value: "126",
                    sub: "Costo per lead € 9,30",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderRadius: 16,
                      border: "1px solid rgba(148,163,184,0.45)",
                      padding: "10px 10px",
                      background:
                        "linear-gradient(145deg, rgba(15,23,42,0.96), rgba(15,23,42,0.75))",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        marginBottom: 2,
                      }}
                    >
                      {item.value}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>
                      {item.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* “Grafico” semplificato */}
              <div
                style={{
                  borderRadius: 18,
                  border: "1px solid rgba(148,163,184,0.45)",
                  padding: 12,
                  background:
                    "radial-gradient(circle at top, rgba(30,64,175,0.8), rgba(15,23,42,1))",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    fontSize: 11,
                    color: "#d1d5db",
                  }}
                >
                  <span>Performance ultime 24h</span>
                  <span>Smart Bidding: ON</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 5,
                    height: 80,
                  }}
                >
                  {[20, 35, 28, 50, 65, 80, 72, 76, 68, 83].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        borderRadius: 999,
                        height: `${h}%`,
                        background:
                          "linear-gradient(180deg, #22c55e, #0f766e)",
                        boxShadow: "0 0 12px rgba(34,197,94,0.6)",
                        opacity: 0.92,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom info */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 11,
                  color: "#9ca3af",
                }}
              >
                <div>
                  Motore AI sta spostando il budget verso{" "}
                  <span style={{ color: "#e5e7eb", fontWeight: 600 }}>
                    sorgenti con CPC più basso
                  </span>{" "}
                  mantenendo il target di ROAS.
                </div>
                <button
                  style={{
                    borderRadius: 999,
                    border: "none",
                    padding: "6px 12px",
                    background:
                      "linear-gradient(135deg, #38bdf8, #6366f1, #a855f7)",
                    color: "#020617",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Vedi dettagli campagne
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* SEZIONI SOTTO – Advertiser / Publisher / AI Engine */}
        <div
          style={{
            maxWidth: "1120px",
            margin: "40px auto 0",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0,1fr))",
            gap: 20,
            fontSize: 13,
          }}
        >
          <div id="advertisers">
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Inserzionisti
            </h3>
            <p style={{ color: "#9ca3af", marginBottom: 8 }}>
              Lancia campagne multicanale in pochi minuti: scegli l’obiettivo
              (lead, vendite, traffico) e l’AI gestisce bidding, segmenti e
              creatività.
            </p>
            <ul
              style={{
                paddingLeft: 18,
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              <li>Dashboard unica per Google, social, native e display</li>
              <li>Budget flessibile giornaliero o mensile</li>
              <li>Report chiari e pronto-per-commercialista</li>
            </ul>
          </div>

          <div id="publishers">
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Publisher & Creator
            </h3>
            <p style={{ color: "#9ca3af", marginBottom: 8 }}>
              Monetizza blog, portali e community con annunci che rispettano
              UX e performance.
            </p>
            <ul
              style={{
                paddingLeft: 18,
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              <li>Widget intelligente con una sola riga di codice</li>
              <li>Pagamenti regolari e trasparenti</li>
              <li>Filtri per categorie e brand ammessi</li>
            </ul>
          </div>

          <div id="ai-engine">
            <h3
              style={{
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 6,
              }}
            >
              Motore AI
            </h3>
            <p style={{ color: "#9ca3af", marginBottom: 8 }}>
              Il cuore di AI Ads Revolution: analizza milioni di segnali in
              tempo quasi reale.
            </p>
            <ul
              style={{
                paddingLeft: 18,
                color: "#6b7280",
                lineHeight: 1.6,
              }}
            >
              <li>Ottimizzazione continua del ROAS</li>
              <li>Rilevamento traffico sospetto e click fraudolenti</li>
              <li>Segmentazione dinamica per interessi e intenti</li>
            </ul>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid rgba(31,41,55,0.9)",
          background: "rgba(15,23,42,0.96)",
          marginTop: 30,
        }}
      >
        <div
          style={{
            maxWidth: "1120px",
            margin: "0 auto",
            padding: "14px 16px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 11,
            color: "#6b7280",
          }}
        >
          <span>© {new Date().getFullYear()} AI Ads Revolution. All rights reserved.</span>
          <span>Made in Italy · Powered by AI</span>
        </div>
      </footer>
    </div>
  );
}

