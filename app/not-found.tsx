import Link from "next/link";
export default function NotFound() { return (<div><h1 className="text-2xl font-semibold">Page not found</h1><p className="my-3">That Surah or verse does not exist.</p><Link className="btn" href="/">Back to all Surahs</Link></div>); }
