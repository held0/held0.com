import Link from "next/link";

export default function NotFound() {
  return (
    <div className="legal">
      <h1>404</h1>
      <p>Diese Seite gibt es nicht.</p>
      <p>
        <Link href="/">← held0</Link>
      </p>
    </div>
  );
}
