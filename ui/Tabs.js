import { useState } from "react";

export default function Tabs({ onChange }) {
  const [tab, setTab] = useState("combined");
  const tabs = [
    { id:"combined", label:"Combined" },
    { id:"football", label:"Football" },
    { id:"crypto", label:"Crypto" },
    { id:"history", label:"History (14d)" }
  ];
  return (
    <div className="tabs">
      {tabs.map(t => (
        <button key={t.id}
          className="btn"
          onClick={()=>{ setTab(t.id); onChange?.(t.id); }}
          style={{borderColor: tab===t.id ? "#5bcefa" : "#2a3342"}}
        >{t.label}</button>
      ))}
    </div>
  );
}
