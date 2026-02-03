import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono text-6xl font-bold text-[#22d3ee]">404</p>
      <h1 className="mt-4 text-2xl font-bold text-[#e5e5e5]">Seite nicht gefunden</h1>
      <p className="mt-2 text-[#737373]">
        Die Seite, die du suchst, existiert nicht oder wurde verschoben.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-6 py-3 text-sm text-[#e5e5e5] transition-colors hover:bg-[#22d3ee]/10 hover:text-[#22d3ee]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
            clipRule="evenodd"
          />
        </svg>
        Zurück zur Startseite
      </Link>
    </div>
  );
}
