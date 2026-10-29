"use client";
import Link from "next/link"; import { useLocal } from "@/lib/storage";
export default function Bookmarks() {
  const [m, setM, ready] = useLocal<string[]>("q.bookmarks", []);
  return (<div><h1 className="mb-4 text-2xl font-semibold">Bookmarks</h1><p className="mb-4 text-sm text-muted">Saved only in this browser.</p>
    {!ready ? <p>Loading…</p> : !m.length ? <p>No bookmarks yet. Use “Bookmark” on any verse.</p> : <ul className="space-y-2">{m.map((k) => { const [s, a] = k.split(":"); return <li key={k} className="flex justify-between rounded-lg border border-line bg-surface px-4 py-3"><Link href={`/surah/${s}#ayah-${a}`}>Surah {s}, verse {a}</Link><button className="btn" onClick={() => setM((x) => x.filter((y) => y !== k))}>Remove</button></li>; })}</ul>}</div>);
}
