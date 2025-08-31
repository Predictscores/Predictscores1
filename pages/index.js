import { useEffect, useMemo, useState } from "react";
import Tabs from "@/ui/Tabs";
import { FootballCard, CryptoCard } from "@/ui/Cards";
import HistoryPanel from "@/ui/HistoryPanel";

export default function Home({ initial }) {
  const [tab, setTab] = useState("combined");
  const [football, setFootball] = useState(initial.football || []);
  const [crypto, setCrypto] = useState(initial.crypto || []);
  const [history, setHistory] = useState(initial.history || { summary:{}, list:[] });

  async function reloadFootball() {
    const r = await fetch("/api/football?hours=24", { cache:"no-store" });
    const j = await r.json().catch(()=>({ football:[] }));
    setFootball(j.football || []);
  }
  async function reloadCrypto() {
    const r = await fetch("/api/crypto", { cache:"no-store" });
    const j = await r.json().catch(()=>({ crypto:[] }));
    setCrypto(j.crypto || []);
  }
  async function reloadHistory() {
    const r = await fetch("/api/history", { cache:"no-store" });
    const j = await r.json().catch(()=>({ summary:{}, list:[] }));
    setHistory({ summary: j.summary, list: j.list });
  }

  useEffect(()=>{ /* lazy refresh after mount */ }, []);

  const combined = useMemo(()=>{
    // spoji top iz football + crypto (vizuelno ih renderujemo odvojeno)
    return football;
  },[football]);

  return (
    <div className="container">
      <div className="hdr">
        <h1>PredictScores — Combined</h1>
        <div className="kv">
          <button className="btn" onClick={reloadFootball}>Osveži Football</button>
          <button className="btn" onClick={reloadCrypto}>Osveži Crypto</button>
          <button className="btn" onClick={reloadHistory}>Osveži History</button>
        </div>
      </div>

      <Tabs onChange={setTab} />

      {tab==="combined" && (
        <>
          <div className="small" style={{marginBottom:8}}>Najbolji pickovi (1X2) sortirani po Score-u (Conf/Edge/EV).</div>
          <div className="grid">
            {(combined||[]).map((p,i)=><FootballCard key={i} pick={p} />)}
          </div>
          <div className="hr" />
          <div className="small" style={{marginBottom:8}}>Crypto signali (4h horizont)</div>
          <div className="grid">
            {(crypto||[]).slice(0,5).map((s,i)=><CryptoCard key={i} s={s} />)}
          </div>
        </>
      )}

      {tab==="football" && (
        <>
          <div className="grid">
            {(football||[]).map((p,i)=><FootballCard key={i} pick={p} />)}
          </div>
        </>
      )}

      {tab==="crypto" && (
        <>
          <div className="grid">
            {(crypto||[]).slice(0,5).map((s,i)=><CryptoCard key={i} s={s} />)}
          </div>
        </>
      )}

      {tab==="history" && (
        <HistoryPanel summary={history.summary} list={history.list} />
      )}
    </div>
  );
}

export async function getServerSideProps() {
  async function g(url) {
    try { const r = await fetch(url); return await r.json(); }
    catch { return {}; }
  }
  const [f,c,h] = await Promise.all([
    g(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/football?hours=24`),
    g(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/crypto`),
    g(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/history`)
  ]);
  return { props: { initial: { football: f?.football||[], crypto: c?.crypto||[], history: { summary: h?.summary||{}, list: h?.list||[] } } } };
}
