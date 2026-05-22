import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const C = {
  slate:  "#91a8b3",
  orange: "#F4750C",
  dark:   "#0d1117",
  dark2:  "#161b22",
  dark3:  "#1c2330",
  border: "rgba(145,168,179,0.2)",
  text:   "#e6edf3",
  muted:  "#8b949e",
};

const DEFAULTS = {
  window: 2,
  floor_insulation: 0.3,
  roof_insulation: 0.2,
  wall_insulation: 0.25,
  wwr: 0.3,
  shgc: 0.4,
  overhang: 0.5,
  orientation: 0,
  hvac_efficiency: 0.85,
  HSPT: 21,
  flowINF: 0.5,
  WindowOpen: 0.2,
  OpenTime: 8,
  CloseTime: 18,
  occupancy_density: 0.05,
  equipment_density: 10,
  lighting_density: 10,
  met_rate: 1.2,
  clo: 1.0
};

const EMPTY = Object.fromEntries(
  Object.keys(DEFAULTS).map(k => [k, ""])
);

const FIELDS = {
  envelope: [
    { id: "window",           label: "Window Type",       ph: "e.g. 2",    info: "Type of windows installed"             },
    { id: "floor_insulation", label: "Floor Insulation",  ph: "e.g. 0.3",  info: "Thermal resistance of floor U-value"   },
    { id: "roof_insulation",  label: "Roof Insulation",   ph: "e.g. 0.2",  info: "Thermal resistance of roof U-value"    },
    { id: "wall_insulation",  label: "Wall Insulation",   ph: "e.g. 0.25", info: "Thermal resistance of walls U-value"   },
    { id: "wwr",              label: "Window-Wall Ratio", ph: "e.g. 0.3",  info: "Ratio of window area to wall area 0-1" },
    { id: "shgc",             label: "Solar Heat Gain",   ph: "e.g. 0.4",  info: "Solar heat gain coefficient 0-1"       },
    { id: "overhang",         label: "Overhang Depth",    ph: "e.g. 0.5",  info: "Depth of roof overhang in meters"      },
    { id: "orientation",      label: "Orientation",       ph: "e.g. 0",    info: "0=North 90=East 180=South 270=West"    },
  ],
  hvac: [
    { id: "hvac_efficiency",  label: "HVAC Efficiency",    ph: "e.g. 0.85", info: "Heating system efficiency 0-1"         },
    { id: "HSPT",             label: "Heating Setpoint C", ph: "e.g. 21",   info: "Indoor temperature setpoint Celsius"   },
    { id: "flowINF",          label: "Air Infiltration",   ph: "e.g. 0.5",  info: "Air leakage rate ACH"                  },
    { id: "WindowOpen",       label: "Window Open Pct",    ph: "e.g. 0.2",  info: "Fraction windows open 0-1"             },
    { id: "OpenTime",         label: "Open Hour",          ph: "e.g. 8",    info: "Hour building opens 0-23"              },
    { id: "CloseTime",        label: "Close Hour",         ph: "e.g. 18",   info: "Hour building closes 0-23"             },
  ],
  occupancy: [
    { id: "occupancy_density",  label: "Occupancy Density", ph: "e.g. 0.05", info: "People per square meter"             },
    { id: "equipment_density",  label: "Equipment Density", ph: "e.g. 10",   info: "Equipment heat gain W per m2"        },
    { id: "lighting_density",   label: "Lighting Density",  ph: "e.g. 10",   info: "Lighting heat gain W per m2"         },
    { id: "met_rate",           label: "Met Rate",           ph: "e.g. 1.2",  info: "Metabolic rate of occupants"        },
    { id: "clo",                label: "Clo Value",          ph: "e.g. 1.0",  info: "Clothing insulation of occupants"   },
  ]
};

function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{
          cursor: "help",
          color: C.slate,
          fontSize: "0.68rem",
          marginLeft: 5,
          border: "1px solid " + C.slate,
          borderRadius: "50%",
          padding: "0 4px",
          lineHeight: "14px",
          display: "inline-block",
          userSelect: "none"
        }}
      >
        ?
      </span>
      {show && (
        <div style={{
          position: "absolute",
          bottom: "130%",
          left: "50%",
          transform: "translateX(-50%)",
          background: C.dark3,
          border: "1px solid " + C.border,
          borderRadius: 6,
          padding: "6px 10px",
          fontSize: "0.73rem",
          color: C.text,
          whiteSpace: "nowrap",
          zIndex: 999,
          boxShadow: "0 4px 16px rgba(0,0,0,0.6)"
        }}>
          {text}
        </div>
      )}
    </span>
  );
}

function InputField({ id, label, ph, info, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{
        fontSize: "0.7rem",
        color: C.slate,
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        display: "flex",
        alignItems: "center"
      }}>
        {label}
        {info && <Tooltip text={info} />}
      </label>
      <input
        type="number"
        step="any"
        value={value}
        placeholder={ph}
        onChange={e => onChange(id, e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: focused ? "rgba(244,117,12,0.06)" : "rgba(145,168,179,0.05)",
          border: focused ? "1px solid #F4750C" : "1px solid rgba(145,168,179,0.2)",
          borderRadius: 8,
          padding: "10px 14px",
          color: C.text,
          fontSize: "0.9rem",
          outline: "none",
          width: "100%",
          transition: "all 0.2s"
        }}
      />
    </div>
  );
}

function FormSection({ fields, form, onChange }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
      gap: 16,
      marginTop: 8
    }}>
      {fields.map(f => (
        <InputField
          key={f.id}
          id={f.id}
          label={f.label}
          ph={f.ph}
          info={f.info}
          value={form[f.id]}
          onChange={onChange}
        />
      ))}
    </div>
  );
}

function ResultCard({ result }) {
  const configs = {
    green:  { bg: "rgba(34,197,94,0.08)",  border: "#22c55e", color: "#22c55e", grade: "A" },
    yellow: { bg: "rgba(244,117,12,0.08)", border: "#F4750C", color: "#F4750C", grade: "B" },
    red:    { bg: "rgba(239,68,68,0.08)",  border: "#ef4444", color: "#ef4444", grade: "C" },
  };
  const cfg = configs[result.color] || configs.green;
  const pct = Math.min((result.heating_load_kwh / 30000) * 100, 100);

  return (
    <div
      className="fade-in"
      style={{
        background: cfg.bg,
        border: "2px solid " + cfg.border,
        borderRadius: 16,
        padding: "32px 28px",
        textAlign: "center",
        marginBottom: 20
      }}
    >
      <div style={{
        display: "inline-block",
        background: cfg.color,
        color: "#000",
        fontWeight: 800,
        fontSize: "0.72rem",
        letterSpacing: 2,
        padding: "4px 14px",
        borderRadius: 20,
        marginBottom: 18,
        textTransform: "uppercase"
      }}>
        Grade {cfg.grade} - {result.efficiency_label}
      </div>
      <div style={{
        color: "#8b949e",
        fontSize: "0.78rem",
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginBottom: 6
      }}>
        Predicted Heating Load
      </div>
      <div style={{
        fontSize: "4rem",
        fontWeight: 900,
        color: cfg.color,
        lineHeight: 1,
        margin: "6px 0",
        letterSpacing: -2
      }}>
        {result.heating_load_kwh.toLocaleString()}
      </div>
      <div style={{ color: "#8b949e", fontSize: "0.88rem", marginBottom: 22 }}>
        kWh / year
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{
          background: "rgba(255,255,255,0.06)",
          borderRadius: 4,
          height: 8,
          overflow: "hidden"
        }}>
          <div style={{
            height: "100%",
            width: pct + "%",
            background: "linear-gradient(90deg," + cfg.border + "," + cfg.color + ")",
            borderRadius: 4,
            transition: "width 1.2s ease"
          }} />
        </div>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.68rem",
          color: "#8b949e",
          marginTop: 5
        }}>
          <span>0 kWh</span>
          <span>30,000 kWh</span>
        </div>
      </div>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        borderRadius: 10,
        padding: "12px 16px",
        color: "#91a8b3",
        fontSize: "0.88rem"
      }}>
        {result.recommendation}
      </div>
    </div>
  );
}

function AboutTab() {
  const stats = [
    { label: "Training Samples", value: "45,000" },
    { label: "ML Algorithm",     value: "XGBoost" },
    { label: "Input Features",   value: "24"      },
    { label: "Target",           value: "kWh/yr"  },
  ];
  const steps = [
    { icon: "📐", title: "Input Parameters",   desc: "Enter 19 building parameters across 3 categories. Hover the ? icons for help." },
    { icon: "⚡", title: "XGBoost Prediction", desc: "Model trained on 45,000 EnergyPlus simulations predicts heating load instantly." },
    { icon: "📊", title: "Efficiency Rating",  desc: "Result classified into High, Moderate, or Low efficiency with a recommendation." },
  ];
  const levels = [
    { color: "#22c55e", label: "Highly Efficient",     range: "Below 5,000 kWh/yr"     },
    { color: "#F4750C", label: "Moderately Efficient", range: "5,000 to 15,000 kWh/yr"  },
    { color: "#ef4444", label: "Low Efficiency",       range: "Above 15,000 kWh/yr"    },
  ];

  return (
    <div>
      <div style={{
        background: "rgba(244,117,12,0.06)",
        border: "1px solid rgba(244,117,12,0.2)",
        borderRadius: 14,
        padding: 24,
        marginBottom: 20
      }}>
        <h3 style={{ color: "#F4750C", marginBottom: 10, fontSize: "1rem" }}>
          About This Project
        </h3>
        <p style={{ color: "#91a8b3", fontSize: "0.9rem", lineHeight: 1.75 }}>
          This tool predicts the annual heating energy consumption of a building
          based on architectural and operational parameters. Built using XGBoost
          trained on 45,000 EnergyPlus simulations, it helps architects and
          engineers quickly estimate energy performance during early design.
        </p>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))",
        gap: 14,
        marginBottom: 20
      }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: "#161b22",
            border: "1px solid rgba(145,168,179,0.2)",
            borderRadius: 12,
            padding: "18px 14px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#F4750C" }}>
              {s.value}
            </div>
            <div style={{ fontSize: "0.73rem", color: "#8b949e", marginTop: 5 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            background: "#161b22",
            border: "1px solid rgba(145,168,179,0.2)",
            borderRadius: 12,
            padding: "16px 20px"
          }}>
            <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{s.icon}</span>
            <div>
              <div style={{ color: "#e6edf3", fontWeight: 600, marginBottom: 4 }}>
                {s.title}
              </div>
              <div style={{ color: "#8b949e", fontSize: "0.84rem", lineHeight: 1.65 }}>
                {s.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{
        background: "#161b22",
        border: "1px solid rgba(145,168,179,0.2)",
        borderRadius: 12,
        padding: 20
      }}>
        <h4 style={{
          color: "#91a8b3",
          fontSize: "0.84rem",
          marginBottom: 14,
          textTransform: "uppercase",
          letterSpacing: "0.8px"
        }}>
          Efficiency Classification
        </h4>
        {levels.map(e => (
          <div key={e.label} style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 10,
            padding: "10px 14px",
            background: "rgba(255,255,255,0.02)",
            borderRadius: 8
          }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: e.color,
              flexShrink: 0
            }} />
            <span style={{ color: "#e6edf3", fontSize: "0.88rem", flex: 1 }}>
              {e.label}
            </span>
            <span style={{
              color: "#8b949e",
              fontSize: "0.78rem",
              background: "rgba(255,255,255,0.05)",
              padding: "2px 10px",
              borderRadius: 10
            }}>
              {e.range}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryTab({ history, onClear }) {
  if (history.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "70px 20px", color: "#8b949e" }}>
        <div style={{ fontSize: "3.5rem", marginBottom: 14 }}>📭</div>
        <p style={{ fontSize: "1rem", marginBottom: 6 }}>No predictions yet</p>
        <p style={{ fontSize: "0.84rem" }}>Go to Predict tab and run your first prediction.</p>
      </div>
    );
  }

  const colorMap = { green: "#22c55e", yellow: "#F4750C", red: "#ef4444" };

  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 18
      }}>
        <span style={{ color: "#8b949e", fontSize: "0.85rem" }}>
          {history.length} prediction{history.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={onClear}
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8,
            color: "#ef4444",
            padding: "6px 16px",
            fontSize: "0.8rem",
            cursor: "pointer"
          }}
        >
          Clear History
        </button>
      </div>
      {[...history].reverse().map((h, i) => (
        <div key={i} style={{
          background: "#161b22",
          border: "1px solid rgba(145,168,179,0.2)",
          borderRadius: 12,
          padding: "18px 20px",
          marginBottom: 12
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8
          }}>
            <span style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: colorMap[h.color] || "#F4750C"
            }}>
              {h.heating_load_kwh.toLocaleString()} kWh
            </span>
            <span style={{
              fontSize: "0.73rem",
              color: "#8b949e",
              background: "rgba(255,255,255,0.05)",
              padding: "3px 10px",
              borderRadius: 20
            }}>
              {h.time}
            </span>
          </div>
          <div style={{ color: "#91a8b3", fontSize: "0.82rem", marginBottom: 4 }}>
            {h.efficiency_label}
          </div>
          <div style={{ color: "#8b949e", fontSize: "0.8rem" }}>
            {h.recommendation}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [activeTab,  setActiveTab]  = useState("predict");
  const [form,       setForm]       = useState(EMPTY);
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [apiStatus,  setApiStatus]  = useState("checking");
  const [history,    setHistory]    = useState([]);

  useEffect(() => {
    axios.get(API_URL + "/")
      .then(() => setApiStatus("online"))
      .catch(() => setApiStatus("offline"));
  }, []);

  const handleChange = (id, val) =>
    setForm(prev => ({ ...prev, [id]: val }));

  const fillDefaults = () =>
    setForm(Object.fromEntries(
      Object.entries(DEFAULTS).map(([k, v]) => [k, String(v)])
    ));

  const clearAll = () => {
    setForm(EMPTY);
    setResult(null);
    setError("");
  };

  const handlePredict = async () => {
    setError("");
    setResult(null);

    const missing = Object.entries(form)
      .filter(([, v]) => v === "")
      .map(([k]) => k);

    if (missing.length > 0) {
      setError("Please fill all fields. Missing: " + missing.join(", "));
      return;
    }

    const nums = {};
    for (const [k, v] of Object.entries(form)) {
      const n = parseFloat(v);
      if (isNaN(n)) {
        setError("Invalid number for: " + k);
        return;
      }
      nums[k] = n;
    }

    nums.window_x_wwr          = nums.window * nums.wwr;
    nums.insulation_combined   = nums.wall_insulation * nums.roof_insulation;
    nums.occupancy_x_equipment = nums.occupancy_density * nums.equipment_density;
    nums.hvac_x_flow           = nums.hvac_efficiency * nums.flowINF;
    nums.open_duration         = nums.CloseTime - nums.OpenTime;

    setLoading(true);
    try {
      const res = await axios.post(API_URL + "/predict", nums);
      if (res.data.status === "success") {
        setResult(res.data);
        setHistory(prev => [
          ...prev,
          { ...res.data, time: new Date().toLocaleTimeString() }
        ]);
      } else {
        setError("Prediction error: " + res.data.message);
      }
    } catch (err) {
      setError(
        err.code === "ERR_NETWORK"
          ? "Backend offline. Run: python main.py in the backend folder."
          : "Error: " + err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { id: "predict", label: "Predict" },
    { id: "history", label: "History", badge: history.length },
    { id: "about",   label: "About"   },
  ];

  const apiColor = apiStatus === "online" ? "#22c55e" : apiStatus === "offline" ? "#ef4444" : "#8b949e";

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3" }}>

      <div style={{
        background: "#161b22",
        borderBottom: "1px solid rgba(145,168,179,0.2)",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.4rem" }}>🏢</span>
          <span style={{ fontWeight: 700, fontSize: "1rem" }}>
            Heating Load Predictor
          </span>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.78rem",
          padding: "5px 14px",
          borderRadius: 20,
          background: apiStatus === "online" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          border: "1px solid " + apiColor
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: apiColor,
            display: "inline-block"
          }} />
          <span style={{ color: apiColor }}>
            {apiStatus === "online" ? "API Online" : apiStatus === "offline" ? "API Offline" : "Checking..."}
          </span>
        </div>
      </div>

      <div style={{
        background: "linear-gradient(180deg, rgba(244,117,12,0.07) 0%, transparent 100%)",
        borderBottom: "1px solid rgba(145,168,179,0.2)",
        padding: "34px 24px 28px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "clamp(1.5rem,4vw,2.3rem)", fontWeight: 900, marginBottom: 8 }}>
          Building Energy <span style={{ color: "#F4750C" }}>Efficiency</span> Predictor
        </h1>
        <p style={{ color: "#8b949e", fontSize: "0.93rem" }}>
          Predict annual heating load from architectural parameters - Powered by XGBoost
        </p>
      </div>

      <div style={{
        display: "flex",
        borderBottom: "1px solid rgba(145,168,179,0.2)",
        background: "#161b22",
        padding: "0 24px"
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "14px 22px",
                background: "none",
                border: "none",
                borderBottom: active ? "2px solid #F4750C" : "2px solid transparent",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: active ? "#F4750C" : "#8b949e",
                fontWeight: active ? 600 : 400,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  background: "#F4750C",
                  color: "#fff",
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  padding: "1px 7px",
                  borderRadius: 10
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>

        {activeTab === "predict" && (
          <div>
            {[
              { title: "Building Envelope",           key: "envelope",  fields: FIELDS.envelope  },
              { title: "HVAC and Systems",             key: "hvac",      fields: FIELDS.hvac      },
              { title: "Occupancy and Internal Loads", key: "occupancy", fields: FIELDS.occupancy },
            ].map(sec => (
              <div key={sec.key} style={{
                background: "#161b22",
                border: "1px solid rgba(145,168,179,0.2)",
                borderRadius: 14,
                padding: "22px 24px",
                marginBottom: 16
              }}>
                <h2 style={{
                  fontSize: "0.85rem",
                  color: "#91a8b3",
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: "1px solid rgba(145,168,179,0.2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px"
                }}>
                  {sec.title}
                </h2>
                <FormSection fields={sec.fields} form={form} onChange={handleChange} />
              </div>
            ))}

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button
                onClick={fillDefaults}
                style={{
                  background: "rgba(145,168,179,0.07)",
                  border: "1px solid rgba(145,168,179,0.2)",
                  borderRadius: 8,
                  color: "#91a8b3",
                  padding: "9px 18px",
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  flex: 1
                }}
              >
                Fill Sample Values
              </button>
              <button
                onClick={clearAll}
                style={{
                  background: "rgba(145,168,179,0.07)",
                  border: "1px solid rgba(145,168,179,0.2)",
                  borderRadius: 8,
                  color: "#91a8b3",
                  padding: "9px 18px",
                  fontSize: "0.84rem",
                  cursor: "pointer",
                  flex: 1
                }}
              >
                Clear All
              </button>
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10,
                padding: "12px 16px",
                color: "#fc8181",
                marginBottom: 16,
                fontSize: "0.88rem"
              }}>
                {error}
              </div>
            )}

            {result && <ResultCard result={result} />}

            <button
              onClick={handlePredict}
              disabled={loading}
              style={{
                width: "100%",
                padding: 16,
                background: loading ? "rgba(244,117,12,0.4)" : "linear-gradient(135deg,#F4750C,#d4600a)",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px rgba(244,117,12,0.3)",
                transition: "all 0.2s"
              }}
            >
              {loading ? "Predicting..." : "Predict Heating Load"}
            </button>
          </div>
        )}

        {activeTab === "history" && (
          <HistoryTab history={history} onClear={() => setHistory([])} />
        )}

        {activeTab === "about" && <AboutTab />}

        <p style={{ textAlign: "center", color: "#2d3748", fontSize: "0.74rem", marginTop: 30 }}>
          XGBoost - FastAPI - React - Vite
        </p>
      </div>
    </div>
  );
}
