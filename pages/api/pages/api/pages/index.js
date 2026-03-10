import { useState, useEffect } from "react";

const C = { bg:"#F7F8FA", card:"#fff", border:"#E5E7EB", primary:"#2563EB", text:"#111827", sub:"#6B7280" };

const s = {
  wrap: { maxWidth:800, margin:"0 auto", padding:"32px 24px", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" },
  card: { background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:24, marginBottom:16 },
  input: { width:"100%", padding:"10px 12px", fontSize:14, border:`1px solid ${C.border}`, borderRadius:8, boxSizing:"border-box", fontFamily:"inherit", outline:"none", resize:"vertical" },
  label: { fontSize:13, fontWeight:600, display:"block", marginBottom:4 },
  hint: { fontSize:12, color:C.sub, marginBottom:6 },
  mb: { marginBottom:16 },
  row: { display:"flex", gap:8, alignItems:"center" },
  btnP: { background:C.primary, color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:14, fontWeight:600, cursor:"pointer" },
  btnS: { background:"#F3F4F6", color:C.text, border:"none", borderRadius:8, padding:"10px 20px", fontSize:14, fontWeight:600, cursor:"pointer" },
  btnD: { background:"#FEE2E2", color:"#EF4444", border:"none", borderRadius:8, padding:"6px 14px", fontSize:13, fontWeight:600, cursor:"pointer" },
  btnSm: { padding:"6px 14px", fontSize:13 },
  err: { background:"#FEE2E2", border:"1px solid #FECACA", borderRadius:8, padding:12, color:"#EF4444", fontSize:13, marginBottom:16 },
  badge: (c) => ({ borderRadius:999, padding:"2px 10px", fontSize:12, fontWeight:600,
    background: c==="green"?"#DCFCE7":c==="yellow"?"#FEF3C7":c==="red"?"#FEE2E2":"#DBEAFE",
    color: c==="green"?"#16A34A":c==="yellow"?"#D97706":c==="red"?"#EF4444":"#2563EB" })
};

function Input({ label, hint, value, onChange, placeholder, rows }) {
  return (
    <div style={s.mb}>
      {label && <label style={s.label}>{label}</label>}
      {hint && <p style={s.hint}>{hint}</p>}
      {rows ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={s.input} />
             : <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={s.input} />}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("list");
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // New job form
  const [title, setTitle] = useState(""); const [dept, setDept] = useState(""); const [cond, setCond] = useState(""); const [saving, setSaving] = useState(false);

  // Evaluate
  const [name, setName] = useState(""); const [resume, setResume] = useState(""); const [result, setResult] = useState(""); const [evaluating, setEvaluating] = useState(false);

  useEffect(() => { loadJobs(); }, []);

  async function loadJobs() {
    setLoading(true);
    try { const r = await fetch("/api/jobs"); setJobs(await r.json()); } catch(e) { setErr(e.message); }
    setLoading(false);
  }

  async function saveJob() {
    if (!title.trim() || !cond.trim()) return;
    setSaving(true);
    await fetch("/api/jobs", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({title,department:dept,conditions:cond}) });
    setTitle(""); setDept(""); setCond("");
    await loadJobs();
    setSaving(false);
    setPage("list");
  }

  async function deleteJob(id) {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/jobs?id=${id}`, { method:"DELETE" });
    loadJobs();
  }

  async function evaluate() {
    if (!resume.trim()) return;
    setEvaluating(true); setErr("");
    try {
      const r = await fetch("/api/evaluate", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ jobTitle:job.title, department:job.department, conditions:job.conditions, candidateName:name, resume }) });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch(e) { setErr(e.message); }
    setEvaluating(false);
  }

  const verdict = result.includes("推薦する") ? ["推薦する","green"] : result.includes("要面談") ? ["要面談","yellow"] : result.includes("見送り") ? ["見送り","red"] : null;

  return (
    <div style={{ background:C.bg, minHeight:"100vh" }}>
      <div style={{ background:"#fff", borderBottom:`1px solid ${C.border}`, padding:"0 24px", height:56, display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontWeight:700, fontSize:16 }}>採用AIエージェント</span>
        <span style={s.badge("blue")}>Vercel版</span>
      </div>

      <div style={s.wrap}>
        {err && <div style={s.err}>{err}</div>}

        {/* 求人一覧 */}
        {page === "list" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div><div style={{ fontSize:18, fontWeight:700 }}>求人一覧</div><div style={{ fontSize:13, color:C.sub }}>{jobs.length}件登録</div></div>
              <button style={s.btnP} onClick={() => setPage("new")}>+ 新しい求人を追加</button>
            </div>
            {loading ? <div style={{ textAlign:"center", color:C.sub, padding:48 }}>読み込み中...</div> : jobs.length === 0 ? (
              <div style={{ ...s.card, textAlign:"center", padding:48, color:C.sub }}>求人がまだ登録されていません</div>
            ) : jobs.map(j => (
              <div key={j.id} style={s.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1, cursor:"pointer" }} onClick={() => { setJob(j); setName(""); setResume(""); setResult(""); setPage("eval"); }}>
                    <span style={{ fontSize:16, fontWeight:700, marginRight:8 }}>{j.title}</span>
                    <span style={s.badge("blue")}>{j.department || "未設定"}</span>
                    <div style={{ fontSize:13, color:C.sub, marginTop:4, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{j.conditions}</div>
                    <div style={{ fontSize:12, color:"#9CA3AF", marginTop:8 }}>登録日: {new Date(j.created_at).toLocaleDateString("ja-JP")}</div>
                  </div>
                  <div style={{ ...s.row, marginLeft:16 }}>
                    <button style={{ ...s.btnP, ...s.btnSm }} onClick={() => { setJob(j); setName(""); setResume(""); setResult(""); setPage("eval"); }}>候補者を評価</button>
                    <button style={s.btnD} onClick={() => deleteJob(j.id)}>削除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 求人作成 */}
        {page === "new" && (
          <div>
            <div style={{ ...s.row, gap:12, marginBottom:24 }}>
              <button style={{ background:"none", border:"none", color:C.sub, cursor:"pointer", textDecoration:"underline", fontSize:14 }} onClick={() => setPage("list")}>← 戻る</button>
              <div style={{ fontSize:18, fontWeight:700 }}>新しい求人を作成</div>
            </div>
            <div style={s.card}>
              <Input label="求人タイトル" value={title} onChange={setTitle} placeholder="例: バックエンドエンジニア（シニア）" />
              <Input label="部署・チーム" value={dept} onChange={setDept} placeholder="例: プロダクト開発部" />
              <Input label="採用条件" hint="箇条書きやメモ書きで構いません" value={cond} onChange={setCond} rows={10} placeholder={"例:\n【必須】\nPython or Go 3年以上\n\n【歓迎】\nスタートアップ経験\n\n【求める人物像】\n自ら課題を発見して動ける人"} />
              <div style={{ ...s.row, justifyContent:"flex-end" }}>
                <button style={s.btnS} onClick={() => setPage("list")}>キャンセル</button>
                <button style={{ ...s.btnP, opacity: saving||!title.trim()||!cond.trim() ? 0.5 : 1 }} disabled={saving||!title.trim()||!cond.trim()} onClick={saveJob}>{saving ? "保存中..." : "保存する"}</button>
              </div>
            </div>
          </div>
        )}

        {/* 評価 */}
        {page === "eval" && (
          <div>
            <div style={{ ...s.row, gap:12, marginBottom:20 }}>
              <button style={{ background:"none", border:"none", color:C.sub, cursor:"pointer", textDecoration:"underline", fontSize:14 }} onClick={() => setPage("list")}>← 求人一覧</button>
              <div><div style={{ fontSize:18, fontWeight:700 }}>{job?.title}</div><div style={{ fontSize:13, color:C.sub }}>{job?.department}</div></div>
            </div>

            {!result ? (
              <div style={s.card}>
                <Input label="候補者名（任意）" value={name} onChange={setName} placeholder="例: 山田 太郎" />
                <Input label="経歴書・職務経歴書" hint="職務経歴書の内容をそのまま貼り付けてください" value={resume} onChange={setResume} rows={14} placeholder="職務経歴書の内容をここに貼り付けてください..." />
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <button style={{ ...s.btnP, opacity: evaluating||!resume.trim() ? 0.5 : 1 }} disabled={evaluating||!resume.trim()} onClick={evaluate}>{evaluating ? "評価基準を生成→判定中..." : "判定する"}</button>
                </div>
              </div>
            ) : (
              <div>
                <div style={s.card}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                    <div><div style={{ fontSize:13, color:C.sub }}>候補者</div><div style={{ fontSize:18, fontWeight:700 }}>{name || "（名前未入力）"}</div></div>
                    {verdict && <span style={s.badge(verdict[1])}>{verdict[0]}</span>}
                  </div>
                  <div style={{ whiteSpace:"pre-wrap", fontSize:14, lineHeight:1.9, borderTop:`1px solid ${C.border}`, paddingTop:16 }}>{result}</div>
                </div>
                <div style={s.row}>
                  <button style={s.btnS} onClick={() => { setName(""); setResume(""); setResult(""); }}>別の候補者を評価する</button>
                  <button style={{ background:"none", border:"none", color:C.sub, cursor:"pointer", textDecoration:"underline", fontSize:14 }} onClick={() => setPage("list")}>求人一覧に戻る</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ textAlign:"center", padding:24, fontSize:12, color:"#D1D5DB" }}>求人データはSupabaseに保存されます</div>
    </div>
  );
}
