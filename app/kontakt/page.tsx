"use client";

import { useState } from "react";
import Link from "next/link";

export default function KontaktPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Ein Fehler ist aufgetreten.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <section className="py-16">
        <p className="font-mono text-sm text-[#22d3ee]">{"// kontakt"}</p>
        <h1 className="mt-4 text-3xl font-bold text-[#e5e5e5] sm:text-4xl">Kontakt</h1>
        <p className="mt-4 text-[#a3a3a3]">
          Haben Sie Fragen oder ein Projekt? Schreiben Sie mir!
        </p>

        <div className="mt-8 max-w-xl">
          {status === "success" ? (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6">
              <h2 className="font-semibold text-green-400">Nachricht gesendet!</h2>
              <p className="mt-2 text-[#a3a3a3]">
                Vielen Dank für Ihre Nachricht. Ich werde mich so schnell wie möglich bei Ihnen melden.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 text-[#22d3ee] hover:underline"
              >
                Weitere Nachricht senden
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === "error" && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <p className="text-red-400">{errorMessage}</p>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#e5e5e5]">
                  Name <span className="text-[#22d3ee]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#333] bg-[#111] px-4 py-3 text-[#e5e5e5] placeholder-[#666] focus:border-[#22d3ee] focus:outline-none focus:ring-1 focus:ring-[#22d3ee]"
                  placeholder="Ihr Name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#e5e5e5]">
                  E-Mail <span className="text-[#22d3ee]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#333] bg-[#111] px-4 py-3 text-[#e5e5e5] placeholder-[#666] focus:border-[#22d3ee] focus:outline-none focus:ring-1 focus:ring-[#22d3ee]"
                  placeholder="ihre@email.de"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[#e5e5e5]">
                  Betreff
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#333] bg-[#111] px-4 py-3 text-[#e5e5e5] placeholder-[#666] focus:border-[#22d3ee] focus:outline-none focus:ring-1 focus:ring-[#22d3ee]"
                  placeholder="Worum geht es?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#e5e5e5]">
                  Nachricht <span className="text-[#22d3ee]">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-2 w-full resize-none rounded-lg border border-[#333] bg-[#111] px-4 py-3 text-[#e5e5e5] placeholder-[#666] focus:border-[#22d3ee] focus:outline-none focus:ring-1 focus:ring-[#22d3ee]"
                  placeholder="Ihre Nachricht..."
                />
              </div>

              <p className="text-sm text-[#666]">
                <span className="text-[#22d3ee]">*</span> Pflichtfelder. Mit dem Absenden erklären Sie sich mit der Verarbeitung Ihrer Daten gemäß unserer{" "}
                <Link href="/datenschutz" className="text-[#22d3ee] hover:underline">
                  Datenschutzerklärung
                </Link>{" "}
                einverstanden.
              </p>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-[#22d3ee] px-6 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#06b6d4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? "Wird gesendet..." : "Nachricht senden"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
