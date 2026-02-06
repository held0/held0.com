"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function KontaktPage() {
  const t = useTranslations("contact");
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
        setErrorMessage(data.error || t("errorGeneric"));
      }
    } catch {
      setStatus("error");
      setErrorMessage(t("errorRetry"));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <section className="py-16">
        <p className="font-mono text-sm text-[#22d3ee]">{t("heading")}</p>
        <h1 className="mt-4 text-3xl font-bold text-[#e5e5e5] sm:text-4xl">{t("pageTitle")}</h1>
        <p className="mt-4 text-[#a3a3a3]">{t("description")}</p>

        <div className="mt-8 max-w-xl">
          {status === "success" ? (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-6">
              <h2 className="font-semibold text-green-400">{t("successTitle")}</h2>
              <p className="mt-2 text-[#a3a3a3]">{t("successMessage")}</p>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 text-[#22d3ee] hover:underline"
              >
                {t("sendAnother")}
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
                  {t("nameLabel")} <span className="text-[#22d3ee]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#333] bg-[#111] px-4 py-3 text-[#e5e5e5] placeholder-[#666] focus:border-[#22d3ee] focus:outline-none focus:ring-1 focus:ring-[#22d3ee]"
                  placeholder={t("namePlaceholder")}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#e5e5e5]">
                  {t("emailLabel")} <span className="text-[#22d3ee]">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#333] bg-[#111] px-4 py-3 text-[#e5e5e5] placeholder-[#666] focus:border-[#22d3ee] focus:outline-none focus:ring-1 focus:ring-[#22d3ee]"
                  placeholder={t("emailPlaceholder")}
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-[#e5e5e5]">
                  {t("subjectLabel")}
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#333] bg-[#111] px-4 py-3 text-[#e5e5e5] placeholder-[#666] focus:border-[#22d3ee] focus:outline-none focus:ring-1 focus:ring-[#22d3ee]"
                  placeholder={t("subjectPlaceholder")}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-[#e5e5e5]">
                  {t("messageLabel")} <span className="text-[#22d3ee]">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-2 w-full resize-none rounded-lg border border-[#333] bg-[#111] px-4 py-3 text-[#e5e5e5] placeholder-[#666] focus:border-[#22d3ee] focus:outline-none focus:ring-1 focus:ring-[#22d3ee]"
                  placeholder={t("messagePlaceholder")}
                />
              </div>

              <p className="text-sm text-[#666]">
                <span className="text-[#22d3ee]">*</span> {t("requiredFields")}{" "}
                <Link href="/datenschutz" className="text-[#22d3ee] hover:underline">
                  {t("privacyPolicy")}
                </Link>{" "}
                {t("requiredFieldsEnd")}
              </p>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-[#22d3ee] px-6 py-3 font-medium text-[#0a0a0a] transition-colors hover:bg-[#06b6d4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? t("sending") : t("send")}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
