import { getAyahOfDay, getMeta } from "@/lib/data"; import { Home } from "@/components/Home";
export const dynamic = "force-dynamic";
export default function Page() {
  const meta = getMeta();
  return <Home surahs={meta.surahs} ayahOfDay={getAyahOfDay(new Date(), meta)} />;
}
