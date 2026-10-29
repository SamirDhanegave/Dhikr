"use client";
import Link from "next/link"; import { useSettings } from "./Providers";
export function Header() {
  const { s, set } = useSettings();
  return (<header className="border-b border-line"><nav aria-label="Main" className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
    <Link href="/" className="font-semibold text-brand">Quran Study</Link>
    <div className="flex items-center gap-4 text-sm"><Link href="/learn">Learn</Link><Link href="/bookmarks">Bookmarks</Link>
      <button className="btn" aria-pressed={s.dark} onClick={() => set({ dark: !s.dark })}>{s.dark ? "Light" : "Dark"}</button></div></nav></header>);
}
