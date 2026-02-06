import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "impressum" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    robots: { index: false, follow: true },
  };
}

export default async function ImpressumPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <section className="py-16">
        <p className="font-mono text-sm text-[#22d3ee]">{"// impressum"}</p>
        <h1 className="mt-4 text-3xl font-bold text-[#e5e5e5] sm:text-4xl">Impressum</h1>

        {locale === "en" && (
          <div className="mt-6 rounded-lg border border-[#22d3ee]/20 bg-[#22d3ee]/5 p-4">
            <p className="text-sm text-[#a3a3a3]">{t("legalDisclaimer")}</p>
          </div>
        )}

        <div className="mt-8 space-y-8 text-[#a3a3a3]">
          <div>
            <h2 className="font-mono text-lg font-semibold text-[#e5e5e5]">Anbieter</h2>
            <div className="mt-4 space-y-1">
              <p>Niklas Held</p>
              <p>Gabelsbergerstr. 23</p>
              <p>50674 Köln</p>
              <p>Deutschland</p>
            </div>
          </div>

          <div>
            <h2 className="font-mono text-lg font-semibold text-[#e5e5e5]">Kontakt</h2>
            <div className="mt-4 space-y-1">
              <p>
                E-Mail:{" "}
                <a href="mailto:webmaster@held0.com" className="text-[#22d3ee] hover:underline">
                  webmaster@held0.com
                </a>
              </p>
              <p>
                Formular:{" "}
                <Link href="/kontakt" className="text-[#22d3ee] hover:underline">
                  Kontaktformular
                </Link>
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-mono text-lg font-semibold text-[#e5e5e5]">Haftungsausschluss</h2>

            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-[#e5e5e5]">Haftung für Inhalte</h3>
                <p className="mt-2">
                  Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die
                  Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine
                  Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene
                  Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8
                  bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte
                  oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu
                  forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[#e5e5e5]">Haftung für Links</h3>
                <p className="mt-2">
                  Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir
                  keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
                  Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
                  Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-[#e5e5e5]">Urheberrecht</h3>
                <p className="mt-2">
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                  unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
                  Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
                  bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-mono text-lg font-semibold text-[#e5e5e5]">Datenschutz</h2>
            <p className="mt-4">
              Unsere Datenschutzerklärung finden Sie unter:{" "}
              <Link href="/datenschutz" className="text-[#22d3ee] hover:underline">
                Datenschutz
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
