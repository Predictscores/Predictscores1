export function FootballCard({ pick }) {
  const { league, teams, kickoff, market, selection, conf_pct, edge_pp, ev_units, odds, bookmaker, info_url } = pick;
  return (
    <div className="card">
      <div className="hdr">
        <div>
          <div className="small">{league?.name}</div>
          <div style={{fontWeight:600}}>{teams?.home} — {teams?.away}</div>
        </div>
        <span className="badge">{kickoff}</span>
      </div>
      <div className="hr" />
      <div className="kv">
        <span>Market: <b>{market}</b></span>
        <span>Pick: <b>{selection}</b></span>
        <span>Conf: <b>{Math.round(conf_pct)}%</b></span>
        <span>Edge(pp): <b>{edge_pp.toFixed(3)}</b></span>
        <span>EV(u): <b>{ev_units.toFixed(2)}</b></span>
        <span>Odds: <b>{odds?.toFixed(2)}</b></span>
        <span>Bookie: <b>{bookmaker}</b></span>
      </div>
      {info_url ? <div style={{marginTop:8}}><a href={info_url} target="_blank" rel="noreferrer">Detalji</a></div> : null}
    </div>
  );
}

export function CryptoCard({ s }) {
  return (
    <div className="card">
      <div className="hdr">
        <div style={{fontWeight:600}}>{s.symbol}</div>
        <span className="badge">{s.horizon}</span>
      </div>
      <div className="kv" style={{marginTop:8}}>
        <span>Signal: <b>{s.signal}</b></span>
        <span>Price: <b>{s.price?.toFixed?.(2)}</b></span>
        {s.stop ? <span>Stop: <b>{s.stop}</b></span> : null}
        {s.target ? <span>Target: <b>{s.target}</b></span> : null}
        <span>Score: <b>{s.score?.toFixed?.(2)}</b></span>
      </div>
      {s.note ? <div className="small" style={{marginTop:8}}>{s.note}</div> : null}
    </div>
  );
}
