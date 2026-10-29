"use client";
import { createContext, useContext, useEffect } from "react";
import { DEFAULTS, Settings, useLocal } from "@/lib/storage";
const Ctx = createContext<{ s: Settings; set: (p: Partial<Settings>) => void }>({ s: DEFAULTS, set: () => {} });
export const useSettings = () => useContext(Ctx);
export function Providers({ children }: { children: React.ReactNode }) {
  const [s, setS] = useLocal<Settings>("q.settings", DEFAULTS);
  useEffect(() => { document.documentElement.classList.toggle("dark", s.dark); }, [s.dark]);
  return <Ctx.Provider value={{ s, set: (p) => setS((o) => ({ ...o, ...p })) }}>{children}</Ctx.Provider>;
}
