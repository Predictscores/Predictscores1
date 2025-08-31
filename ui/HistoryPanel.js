export default function HistoryPanel({ summary, list }) {
  return (
    <div className="card">
      <div className="hdr"><h1>History (14d)</h1></div>
      <div className="kv">
        <span>ROI(u): <b>{summary?.roi_units?.toFixed?.(2) ?? "0.00"}</b></span>
        <span>W-L-V: <b>{summary?.wins ?? 0}-{summary?.losses ?? 0}-{summary?.voids ?? 0}</b></span>
        <span>Hit rate: <b>{(summary?.hit_rate ?? 0).toFixed?.(1)}%</b></span>
        <span>Avg odds: <b>{(summary?.avg_odds ?? 0).toFixed?.(2)}</b></span>
        <span>Avg edge: <b>{(summary?.avg_edge ?? 0).toFixed?.(3)}</b></span>
      </div>
      <div className="hr" />
      {(list ?? []).length === 0 ? <div className="small">Nema zaključених pickova u poslednjih 14 dana.</div> : null}
      <div className="grid">
        {(list ?? []).map((p,i)=>(
          <div key={i} className="card" style={{background:"#0f141c"}}>
            <div className="small">{p.league?.name}</div>
            <div style={{fontWeight:600}}>{p.teams?.home} — {p.teams?.away}</div>
            <div className="kv" style={{marginTop:6}}>
              <span>{p.market} / {p.selection}</span>
              <span>odds {p.odds?.toFixed?.(2)}</span>
              <span>res: <b>{p.result}</b></span>
              <span>roi(u): <b>{p.unit_result?.toFixed?.(2)}</b></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
