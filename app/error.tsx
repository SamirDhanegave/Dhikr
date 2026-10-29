"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (<div role="alert"><h1 className="text-2xl font-semibold">Something went wrong</h1><p className="my-3 text-muted">{error.message.includes("data missing") ? "Quran data has not been generated yet. Run `npm run data`." : "Please try again."}</p><button className="btn" onClick={reset}>Retry</button></div>);
}
