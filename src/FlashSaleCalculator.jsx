import { useState, useMemo } from "react";

const fmtRp = (v) => (!v && v !== 0) ? "-" : "Rp " + Math.round(v).toLocaleString("id-ID");
const fmtPct = (v) => (!v && v !== 0) ? "-" : v.toFixed(1) + "%";
const roundNice = (v) => Math.round(v / 1000) * 1000;

const GRAM_PRESETS = [0.5, 1, 2, 3, 5, 10, 25, 50, 100];

const Input = ({ label, value, onChange, prefix = "Rp", suffix, hint, accent }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--label)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
    <div style={{
      display: "flex", alignItems: "center",
      background: accent ? "rgba(232,184,75,0.06)" : "var(--input-bg)",
      border: `1px solid ${accent ? "rgba(232,184,75,0.3)" : "var(--input-border)"}`,
      borderRadius: "10px", overflow: "hidden",
    }}>
      {prefix && <span style={{ padding: "0 0 0 12px", fontSize: "13px", color: "var(--muted)", fontWeight: 600 }}>{prefix}</span>}
      <input type="number" value={value} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        placeholder="0" step="any" style={{
          flex: 1, padding: "11px 12px", background: "transparent", border: "none", outline: "none",
          fontSize: "15px", fontWeight: 600, color: accent ? "var(--gold)" : "var(--text)", fontFamily: "inherit",
        }}
      />
      {suffix && <span style={{ padding: "0 12px 0 0", fontSize: "13px", color: "var(--muted)", fontWeight: 500 }}>{suffix}</span>}
    </div>
    {hint && <span style={{ fontSize: "11px", color: "var(--muted)" }}>{hint}</span>}
  </div>
);

const Slider = ({ label, value, onChange, min, max, step, hint }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--label)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
      <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--gold)" }}>{value}%</span>
    </div>
    <input type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", cursor: "pointer", height: "6px" }}
    />
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--muted)" }}>
      <span>{min}%</span><span>{hint}</span><span>{max}%</span>
    </div>
  </div>
);

const Card = ({ icon, color, title, children, sub }) => (
  <div style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "16px", padding: "22px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: sub ? "4px" : "16px" }}>
      <span style={{ width: "3px", height: "16px", background: color, borderRadius: "2px" }} />
      <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)" }}>{icon} {title}</span>
    </div>
    {sub && <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "16px", paddingLeft: "11px" }}>{sub}</div>}
    {children}
  </div>
);

const Stat = ({ label, value, sub, variant }) => {
  const s = {
    gold: { bg: "linear-gradient(135deg,#D4A43A,#B8892E)", t: "#fff", m: "rgba(255,255,255,0.6)" },
    green: { bg: "linear-gradient(135deg,#4DAA8A,#3D9478)", t: "#fff", m: "rgba(255,255,255,0.6)" },
    red: { bg: "rgba(216,100,80,0.12)", t: "#D8725A", m: "rgba(216,100,80,0.7)" },
    amber: { bg: "rgba(212,164,58,0.12)", t: "#D4A43A", m: "rgba(212,164,58,0.7)" },
    default: { bg: "var(--card-bg)", t: "var(--text)", m: "var(--muted)" },
  }[variant || "default"];
  return (
    <div style={{ padding: "16px", borderRadius: "12px", flex: "1 1 150px", minWidth: 0, background: s.bg, border: variant === "default" || !variant ? "1px solid var(--card-border)" : "none" }}>
      <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: s.m, marginBottom: "5px" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: 800, color: s.t, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: "11px", color: s.m, marginTop: "4px" }}>{sub}</div>}
    </div>
  );
};


const GramBtn = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    padding: "7px 14px", fontSize: "12px", fontWeight: 700, borderRadius: "8px", cursor: "pointer",
    fontFamily: "inherit", transition: "all 0.15s",
    background: active ? "var(--gold)" : "var(--input-bg)",
    color: active ? "#1a1408" : "var(--muted)",
    border: `1px solid ${active ? "var(--gold)" : "var(--input-border)"}`,
  }}>{label}</button>
);

export default function FlashSaleCalculator() {
  const [productName, setProductName] = useState("");
  const [gramasi, setGramasi] = useState("");
  const [hargaEU, setHargaEU] = useState("");
  const [hargaRS, setHargaRS] = useState("");
  const [kompMin, setKompMin] = useState("");
  const [kompMax, setKompMax] = useState("");
  const [diskonType, setDiskonType] = useState("persen"); // "persen" | "fixPrice"
  const [diskonEU, setDiskonEU] = useState(10);
  const [diskonRS, setDiskonRS] = useState(5);
  const [diskonFixEU, setDiskonFixEU] = useState("");
  const [diskonFixRS, setDiskonFixRS] = useState("");
  const [minProfit, setMinProfit] = useState("");
  const [overrideEU, setOverrideEU] = useState("");
  const [overrideRS, setOverrideRS] = useState("");

  const calc = useMemo(() => {
    const eu = Number(hargaEU) || 0;
    const rs = Number(hargaRS) || 0;
    const kmin = Number(kompMin) || 0;
    const kmax = Number(kompMax) || 0;
    const kavg = kmin && kmax ? (kmin + kmax) / 2 : 0;
    const mp = Number(minProfit) || 0;
    const gram = Number(gramasi) || 0;

    const fixEU = Number(diskonFixEU) || 0;
    const fixRS = Number(diskonFixRS) || 0;
    let flashEU = eu > 0 ? roundNice(diskonType === "fixPrice" ? eu - fixEU : eu * (1 - diskonEU / 100)) : 0;
    let flashRS = rs > 0 ? roundNice(diskonType === "fixPrice" ? rs - fixRS : rs * (1 - diskonRS / 100)) : 0;
    const floorFromProfit = kavg > 0 && mp > 0 ? roundNice(kavg + mp) : 0;

    let cappedEU = false, cappedRS = false;
    if (floorFromProfit > 0 && flashEU > 0 && flashEU < floorFromProfit) { flashEU = floorFromProfit; cappedEU = true; }
    if (floorFromProfit > 0 && flashRS > 0 && flashRS < floorFromProfit) { flashRS = floorFromProfit; cappedRS = true; }

    const finalEU = Number(overrideEU) || flashEU;
    const finalRS = Number(overrideRS) || flashRS;
    const actualDiskonEU = eu > 0 && finalEU > 0 ? ((eu - finalEU) / eu) * 100 : 0;
    const actualDiskonRS = rs > 0 && finalRS > 0 ? ((rs - finalRS) / rs) * 100 : 0;
    const selisihEU = eu > 0 && finalEU > 0 ? eu - finalEU : 0;
    const selisihRS = rs > 0 && finalRS > 0 ? rs - finalRS : 0;
    const profitEU = finalEU > 0 && kavg > 0 ? finalEU - kavg : 0;
    const profitRS = finalRS > 0 && kavg > 0 ? finalRS - kavg : 0;
    const profitPerGramEU = profitEU > 0 && gram > 0 ? profitEU / gram : 0;
    const profitPerGramRS = profitRS > 0 && gram > 0 ? profitRS / gram : 0;
    const profitEUMax = eu > 0 && finalEU > 0 ? finalEU - kmax : 0;
    const profitRSMax = rs > 0 && finalRS > 0 ? finalRS - kmax : 0;
    const profitEUMin = eu > 0 && finalEU > 0 ? finalEU - kmin : 0;
    const profitRSMin = rs > 0 && finalRS > 0 ? finalRS - kmin : 0;

    let posisiEU = "-";
    if (finalEU > 0 && kavg > 0) { const d = ((finalEU - kavg) / kavg) * 100; posisiEU = d < -2 ? "Lebih Murah" : d > 2 ? "Lebih Mahal" : "Setara"; }
    const diffEUvsKomp = finalEU > 0 && kavg > 0 ? finalEU - kavg : 0;
    const maxDiskonEU = eu > 0 && floorFromProfit > 0 ? Math.max(((eu - floorFromProfit) / eu) * 100, 0) : 100;
    const maxDiskonRS = rs > 0 && floorFromProfit > 0 ? Math.max(((rs - floorFromProfit) / rs) * 100, 0) : 100;

    return { eu, rs, kmin, kmax, kavg, gram, mp, flashEU, flashRS, finalEU, finalRS, floorFromProfit, cappedEU, cappedRS, actualDiskonEU, actualDiskonRS, selisihEU, selisihRS, profitEU, profitEUMax, profitRSMax, profitEUMin, profitRSMin, profitRS, profitPerGramEU, profitPerGramRS, posisiEU, diffEUvsKomp, maxDiskonEU, maxDiskonRS };
  }, [hargaEU, hargaRS, kompMin, kompMax, diskonType, diskonEU, diskonRS, diskonFixEU, diskonFixRS, minProfit, gramasi, overrideEU, overrideRS]);


  return (
    <div style={{
      "--bg": "#101318", "--card-bg": "#181d26", "--card-border": "rgba(255,255,255,0.055)",
      "--input-bg": "rgba(255,255,255,0.03)", "--input-border": "rgba(255,255,255,0.07)",
      "--text": "#E8E4DF", "--muted": "#717784", "--label": "#9BA0AC",
      "--gold": "#E0B44C", "--gold-dark": "#C49A38",
      "--sage": "#5BB898", "--sage-dark": "#4AA385",
      "--lavender": "#8B9BF7", "--lavender-soft": "#6E80E8",
      "--coral": "#D8725A", "--coral-soft": "#C4604A",
      "--bar-bg": "rgba(255,255,255,0.04)",
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      background: "var(--bg)", color: "var(--text)", minHeight: "100vh", padding: "20px 16px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none}
        input[type=number]{-moz-appearance:textfield}
        input::placeholder{color:#3d4250}
        input[type=range]{-webkit-appearance:none;appearance:none;background:rgba(255,255,255,0.07);border-radius:4px;outline:none}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#E0B44C;cursor:pointer;border:2px solid #101318;box-shadow:0 0 8px rgba(224,180,76,0.3)}
      `}</style>

      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg,rgba(224,180,76,0.1),rgba(212,164,58,0.06))", border: "1px solid rgba(224,180,76,0.15)", borderRadius: "999px", padding: "5px 16px", marginBottom: "16px" }}>
            <span>⚡</span>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Flash Sale Calculator</span>
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Hitung Harga{" "}
            <span style={{ background: "linear-gradient(135deg,#E8C35A,#D4A43A)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Flash Sale</span>
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "8px" }}>Input harga normal & harga pasaran, atur diskon, dapat harga flash sale optimal</p>
        </div>

        <details style={{ marginBottom: "14px" }}>
          <summary style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", cursor: "pointer", padding: "8px 0", userSelect: "none" }}>📖 Keterangan Istilah</summary>
          <div style={{ marginTop: "8px", padding: "14px 16px", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", lineHeight: 1.6 }}>
            <div><strong style={{ color: "var(--gold)" }}>EU (End User)</strong> <span style={{ color: "var(--muted)" }}>— Pembeli langsung / konsumen akhir</span></div>
            <div><strong style={{ color: "var(--sage)" }}>RS (Reseller)</strong> <span style={{ color: "var(--muted)" }}>— Penjual kembali / agen yang beli untuk dijual lagi</span></div>
            <div><strong style={{ color: "var(--text)" }}>Profit Min</strong> <span style={{ color: "var(--muted)" }}>— Keuntungan minimal per pcs (dihitung dari harga pasaran tertinggi)</span></div>
            <div><strong style={{ color: "var(--text)" }}>Profit Max</strong> <span style={{ color: "var(--muted)" }}>— Keuntungan maksimal per pcs (dihitung dari harga pasaran terendah)</span></div>
            <div><strong style={{ color: "var(--text)" }}>Profit Avg</strong> <span style={{ color: "var(--muted)" }}>— Keuntungan rata-rata per pcs (dihitung dari rata-rata harga pasaran)</span></div>
          </div>
        </details>

        <Card icon="①" color="var(--gold)" title="Produk">
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--label)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Nama Produk</label>
              <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="cth: Antam 0.5gr" style={{ padding: "11px 12px", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "10px", fontSize: "15px", fontWeight: 600, color: "var(--text)", outline: "none", fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--label)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Gramasi</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {GRAM_PRESETS.map((g) => (<GramBtn key={g} label={`${g}g`} active={Number(gramasi) === g} onClick={() => setGramasi(g)} />))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>atau input manual:</span>
                <input type="number" value={gramasi} onChange={(e) => setGramasi(e.target.value === "" ? "" : Number(e.target.value))} placeholder="0" step="any" style={{ width: "100px", padding: "8px 10px", background: "var(--input-bg)", border: "1px solid var(--input-border)", borderRadius: "8px", fontSize: "14px", fontWeight: 600, color: "var(--text)", outline: "none", fontFamily: "inherit" }} />
                <span style={{ fontSize: "13px", color: "var(--muted)", fontWeight: 500 }}>gram</span>
              </div>
            </div>
          </div>
        </Card>

        <div style={{ height: "14px" }} />

        <Card icon="②" color="var(--lavender)" title="Harga Jual Normal">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <Input label="Harga End User" value={hargaEU} onChange={setHargaEU} hint="Harga jual normal ke pembeli" />
            <Input label="Harga Reseller" value={hargaRS} onChange={setHargaRS} hint="Harga jual normal ke reseller" />
          </div>
          {calc.gram > 0 && (calc.eu > 0 || calc.rs > 0) && (
            <div style={{ marginTop: "12px", display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12px", color: "var(--muted)" }}>
              {calc.eu > 0 && <span>EU: <strong style={{ color: "var(--text)" }}>{fmtRp(calc.eu / calc.gram)}/g</strong></span>}
              {calc.rs > 0 && <span>RS: <strong style={{ color: "var(--text)" }}>{fmtRp(calc.rs / calc.gram)}/g</strong></span>}
            </div>
          )}
        </Card>

        <div style={{ height: "14px" }} />

        <Card icon="③" color="var(--lavender-soft)" title="Harga Pasaran" sub="Harga yang beredar di pasaran dari penjual lain">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <Input label="Harga Beli Minimal" value={kompMin} onChange={setKompMin} hint="Termurah di pasaran" />
            <Input label="Harga Beli Maksimal" value={kompMax} onChange={setKompMax} hint="Termahal di pasaran" />
          </div>
          {calc.kavg > 0 && (
            <div style={{ marginTop: "14px", padding: "12px 16px", background: "rgba(139,155,247,0.06)", border: "1px solid rgba(139,155,247,0.12)", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--lavender)" }}>Rata-rata Harga Pasaran</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--lavender)" }}>{fmtRp(calc.kavg)}</span>
                {calc.gram > 0 && <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "8px" }}>({fmtRp(calc.kavg / calc.gram)}/g)</span>}
              </div>
            </div>
          )}
        </Card>

        <div style={{ height: "14px" }} />

        <Card icon="④" color="var(--sage)" title="Strategi Flash Sale">
          <div style={{ display: "flex", gap: "6px", marginBottom: "18px" }}>
            {[{ key: "persen", label: "Diskon Persen (%)" }, { key: "fixPrice", label: "Diskon Fix Price (Rp)" }].map(({ key, label }) => (
              <button key={key} onClick={() => setDiskonType(key)} style={{
                flex: 1, padding: "9px 14px", fontSize: "12px", fontWeight: 700, borderRadius: "10px", cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
                background: diskonType === key ? "rgba(91,184,152,0.12)" : "var(--input-bg)",
                color: diskonType === key ? "var(--sage)" : "var(--muted)",
                border: `1px solid ${diskonType === key ? "rgba(91,184,152,0.3)" : "var(--input-border)"}`,
              }}>{label}</button>
            ))}
          </div>
          {diskonType === "persen" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <Slider label="Diskon End User" value={diskonEU} onChange={setDiskonEU} min={0} max={50} step={0.5} hint="Potongan dari harga normal" />
              <Slider label="Diskon Reseller" value={diskonRS} onChange={setDiskonRS} min={0} max={30} step={0.5} hint="Potongan dari harga normal" />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
              <Input label="Potongan End User" value={diskonFixEU} onChange={setDiskonFixEU} hint={calc.eu > 0 ? `Harga normal: ${fmtRp(calc.eu)}` : "Isi harga EU dulu"} />
              <Input label="Potongan Reseller" value={diskonFixRS} onChange={setDiskonFixRS} hint={calc.rs > 0 ? `Harga normal: ${fmtRp(calc.rs)}` : "Isi harga RS dulu"} />
            </div>
          )}
          <div style={{ marginTop: "20px", paddingTop: "18px", borderTop: "1px solid var(--card-border)" }}>
            <Input label="Minimal Profit per Pcs" value={minProfit} onChange={setMinProfit} hint={calc.kavg > 0 ? `Profit = Harga Flash Sale - Avg Pasaran (${fmtRp(calc.kavg)})` : "Isi harga pasaran dulu untuk aktivasi"} />
          </div>
          {calc.floorFromProfit > 0 && (
            <div style={{ marginTop: "14px", padding: "12px 16px", background: "rgba(91,184,152,0.06)", border: "1px solid rgba(91,184,152,0.12)", borderRadius: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--sage)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Floor Price (Avg Pasaran + Min Profit)</div>
              <div style={{ fontSize: "16px", fontWeight: 800 }}>{fmtRp(calc.floorFromProfit)}</div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>{fmtRp(calc.kavg)} + {fmtRp(calc.mp)} ≈ {fmtRp(calc.floorFromProfit)} (dibulatkan ke Rp 1.000)</div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>Maks diskon EU: {fmtPct(calc.maxDiskonEU)} · Maks diskon RS: {fmtPct(calc.maxDiskonRS)}</div>
            </div>
          )}
          {(calc.cappedEU || calc.cappedRS) && (
            <div style={{ marginTop: "10px", padding: "10px 14px", background: "rgba(224,180,76,0.08)", border: "1px solid rgba(224,180,76,0.15)", borderRadius: "10px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "14px" }}>🔒</span>
              <div style={{ fontSize: "11px", color: "var(--gold)", lineHeight: 1.6 }}>
                <strong>Diskon di-cap otomatis</strong> supaya profit tidak di bawah {fmtRp(calc.mp)}/pcs.
                {calc.cappedEU && ` EU: ${fmtPct(diskonEU)} → aktual ${fmtPct(calc.actualDiskonEU)}.`}
                {calc.cappedRS && ` RS: ${fmtPct(diskonRS)} → aktual ${fmtPct(calc.actualDiskonRS)}.`}
              </div>
            </div>
          )}
          {(calc.eu > 0 || calc.rs > 0) && (
            <div style={{ marginTop: "14px", padding: "12px 16px", background: "rgba(255,255,255,0.015)", border: "1px solid var(--card-border)", borderRadius: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--label)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Perhitungan</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {calc.eu > 0 && (<div style={{ fontSize: "13px" }}><span style={{ color: "var(--muted)" }}>EU: {diskonType === "fixPrice" ? `${fmtRp(calc.eu)} - ${fmtRp(Number(diskonFixEU) || 0)}` : `${fmtRp(calc.eu)} × ${100 - diskonEU}%`} ≈ </span><strong style={{ color: "var(--gold)" }}>{fmtRp(calc.flashEU)}</strong>{calc.cappedEU && <span style={{ color: "var(--gold-dark)", fontSize: "11px" }}> (di-cap ke floor)</span>}</div>)}
                {calc.rs > 0 && (<div style={{ fontSize: "13px" }}><span style={{ color: "var(--muted)" }}>RS: {diskonType === "fixPrice" ? `${fmtRp(calc.rs)} - ${fmtRp(Number(diskonFixRS) || 0)}` : `${fmtRp(calc.rs)} × ${100 - diskonRS}%`} ≈ </span><strong style={{ color: "var(--sage)" }}>{fmtRp(calc.flashRS)}</strong>{calc.cappedRS && <span style={{ color: "var(--gold-dark)", fontSize: "11px" }}> (di-cap ke floor)</span>}</div>)}
              </div>
              <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "6px", fontStyle: "italic" }}>Hasil dibulatkan ke Rp 1.000 terdekat · Belum termasuk ongkos kirim</div>
            </div>
          )}
        </Card>

        <div style={{ height: "14px" }} />

        <Card icon="⑤" color="var(--gold)" title="Harga Flash Sale">
          <div style={{ background: "linear-gradient(135deg,rgba(224,180,76,0.06),rgba(212,164,58,0.03))", border: "1px solid rgba(224,180,76,0.12)", borderRadius: "14px", padding: "20px", marginBottom: "16px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "10px", left: "-4px", background: "linear-gradient(135deg,var(--coral),var(--coral-soft))", color: "#fff", padding: "3px 14px 3px 18px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.06em", clipPath: "polygon(6px 0,100% 0,95% 50%,100% 100%,6px 100%,0 50%)" }}>FLASH SALE</div>
            <div style={{ marginTop: "28px" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>{productName || "Nama Produk"}{calc.gram > 0 ? ` · ${calc.gram}g` : ""}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--gold)" }}>{fmtRp(calc.finalEU)}</span>
                {calc.eu > 0 && <span style={{ fontSize: "14px", color: "var(--muted)", textDecoration: "line-through" }}>{fmtRp(calc.eu)}</span>}
                {calc.actualDiskonEU > 0 && (<span style={{ background: "rgba(216,114,90,0.12)", color: "var(--coral)", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 700 }}>-{fmtPct(calc.actualDiskonEU)}</span>)}
              </div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px", fontStyle: "italic" }}>* Belum termasuk ongkos kirim</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div style={{ padding: "14px", background: "rgba(224,180,76,0.05)", border: "1px solid rgba(224,180,76,0.1)", borderRadius: "12px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Flash End User</div>
              <div style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px" }}>{fmtRp(calc.finalEU)}</div>
              <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>Hemat {fmtRp(calc.selisihEU)} ({fmtPct(calc.actualDiskonEU)})</div>
              {calc.profitEUMax !== 0 && <div style={{ fontSize: "11px", color: calc.profitEUMax > 0 ? "var(--sage)" : "var(--coral)", marginTop: "2px" }}>Profit Min {fmtRp(calc.profitEUMax)}/pcs</div>}
              {calc.profitEUMin !== 0 && <div style={{ fontSize: "11px", color: calc.profitEUMin > 0 ? "var(--sage)" : "var(--coral)", marginTop: "2px" }}>Profit Max {fmtRp(calc.profitEUMin)}/pcs</div>}
              {calc.profitEU !== 0 && <div style={{ fontSize: "11px", color: calc.profitEU > 0 ? "var(--sage)" : "var(--coral)", marginTop: "2px" }}>Profit Avg {fmtRp(calc.profitEU)}/pcs</div>}
            </div>
            <div style={{ padding: "14px", background: "rgba(91,184,152,0.05)", border: "1px solid rgba(91,184,152,0.1)", borderRadius: "12px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--sage)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Flash Reseller</div>
              <div style={{ fontSize: "22px", fontWeight: 800, marginTop: "4px" }}>{fmtRp(calc.finalRS)}</div>
                <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>Hemat {fmtRp(calc.selisihRS)} ({fmtPct(calc.actualDiskonRS)})</div>
              {calc.profitRSMax !== 0 && <div style={{ fontSize: "11px", color: calc.profitRSMax > 0 ? "var(--sage)" : "var(--coral)", marginTop: "2px" }}>Profit Min {fmtRp(calc.profitRSMax)}/pcs</div>}
              {calc.profitRSMin !== 0 && <div style={{ fontSize: "11px", color: calc.profitRSMin > 0 ? "var(--sage)" : "var(--coral)", marginTop: "2px" }}>Profit Max {fmtRp(calc.profitRSMin)}/pcs</div>}
              {calc.profitRS !== 0 && <div style={{ fontSize: "11px", color: calc.profitRS > 0 ? "var(--sage)" : "var(--coral)", marginTop: "2px" }}>Profit Avg {fmtRp(calc.profitRS)}/pcs</div>}
            </div>
          </div>

          <details>
            <summary style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", cursor: "pointer", padding: "8px 0", userSelect: "none" }}>✏️ Override harga manual (tanpa pembulatan)</summary>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "10px" }}>
              <Input label="Override End User" value={overrideEU} onChange={setOverrideEU} accent hint="Kosongkan = pakai hitungan" />
              <Input label="Override Reseller" value={overrideRS} onChange={setOverrideRS} accent hint="Kosongkan = pakai hitungan" />
            </div>
            {(overrideEU || overrideRS) && (<button onClick={() => { setOverrideEU(""); setOverrideRS(""); }} style={{ marginTop: "10px", padding: "8px 16px", fontSize: "12px", fontWeight: 700, background: "rgba(216,114,90,0.1)", color: "var(--coral)", border: "1px solid rgba(216,114,90,0.2)", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit" }}>Reset ke Hitungan</button>)}
          </details>
        </Card>

        {(calc.finalEU > 0 && calc.finalRS > 0 && calc.finalEU < calc.finalRS) && (
          <div style={{ marginTop: "14px", padding: "14px 18px", background: "rgba(216,114,90,0.08)", border: "1px solid rgba(216,114,90,0.15)", borderRadius: "12px", display: "flex", gap: "10px" }}>
            <span>🚨</span>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}><strong style={{ color: "var(--coral)" }}>Flash end user lebih murah dari reseller!</strong> Cek diskon atau override harga.</div>
          </div>
        )}
        {(calc.profitEU < 0 || calc.profitRS < 0) && (
          <div style={{ marginTop: "10px", padding: "14px 18px", background: "rgba(216,114,90,0.08)", border: "1px solid rgba(216,114,90,0.15)", borderRadius: "12px", display: "flex", gap: "10px" }}>
            <span>⚠️</span>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}><strong style={{ color: "var(--coral)" }}>Harga flash sale di bawah rata-rata harga pasaran!</strong>{calc.profitEU < 0 && ` EU: ${fmtRp(calc.profitEU)}.`}{calc.profitRS < 0 && ` RS: ${fmtRp(calc.profitRS)}.`}</div>
          </div>
        )}

        <div style={{ marginTop: "14px", padding: "12px 16px", background: "rgba(139,155,247,0.05)", border: "1px solid rgba(139,155,247,0.1)", borderRadius: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "14px" }}>📦</span>
          <div style={{ fontSize: "11px", color: "var(--lavender)", lineHeight: 1.5 }}><strong>Semua harga belum termasuk ongkos kirim.</strong> Ongkir ditanggung pembeli atau dihitung terpisah saat checkout.</div>
        </div>

        <div style={{
          marginTop: "14px", padding: "20px", background: "linear-gradient(135deg,rgba(224,180,76,0.06),rgba(212,164,58,0.03))",
          border: "1px solid rgba(224,180,76,0.12)", borderRadius: "14px", textAlign: "center",
        }}>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>☕</div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>Suka tools ini?</div>
          <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "14px", lineHeight: 1.5 }}>Traktir saya kopi biar makin semangat bikin tools gratis lainnya</div>
          <a href="https://saweria.co/dayat1989" target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "10px 24px", borderRadius: "10px", fontSize: "13px", fontWeight: 700,
            background: "linear-gradient(135deg,#E0B44C,#C49A38)", color: "#1a1408",
            textDecoration: "none", cursor: "pointer", border: "none",
            boxShadow: "0 2px 12px rgba(224,180,76,0.25)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}>☕ Traktir Kopi</a>
        </div>

        <div style={{ textAlign: "center", padding: "28px 0 8px", fontSize: "10px", color: "var(--muted)" }}>⚡ Flash Sale Calculator</div>
      </div>
    </div>
  );
}
