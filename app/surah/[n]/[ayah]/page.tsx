import { notFound, redirect } from "next/navigation"; import { getMeta, validSurah } from "@/lib/data";
export default function Page({ params }: { params: { n: string; ayah: string } }) {
  const n = +params.n, a = +params.ayah; if (!validSurah(n) || !Number.isInteger(a) || a < 1 || a > getMeta().surahs[n - 1].ayahs) notFound();
  redirect(`/surah/${n}#ayah-${a}`);
}
