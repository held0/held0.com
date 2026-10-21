import type { Metadata } from "next";
import "../admin.css";

export const metadata: Metadata = {
  title: "Anmelden – held0 admin",
  robots: { index: false, follow: false, nocache: true },
};

const MESSAGES: Record<string, string> = {
  falsch: "Benutzer oder Passwort stimmt nicht.",
  sperre: "Zu viele Fehlversuche – bitte in 15 Minuten erneut versuchen.",
  ab: "Abgemeldet.",
};

export default async function Login({ searchParams }: { searchParams: Promise<{ hinweis?: string }> }) {
  const { hinweis } = await searchParams;
  const message = hinweis ? MESSAGES[hinweis] : undefined;
  return (
    <div className="admin admin-login">
      <h1>held0 admin</h1>
      <form method="post" action="/admin/api/login">
        <label>
          Benutzer
          <input name="user" autoComplete="username" autoCapitalize="none" spellCheck={false} required autoFocus />
        </label>
        <label>
          Passwort
          <input name="password" type="password" autoComplete="current-password" required />
        </label>
        {message && (
          <p className={hinweis === "ab" ? "muted" : "admin-error"} role={hinweis === "ab" ? "status" : "alert"}>{message}</p>
        )}
        <button type="submit" className="primary">Anmelden</button>
      </form>
    </div>
  );
}
