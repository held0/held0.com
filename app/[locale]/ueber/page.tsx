import { Metadata } from "next";
import SocialLinks from "@/components/SocialLinks";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

const skills = [
  {
    category: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "React Native"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Python", "PostgreSQL", "Firebase", "REST APIs"],
  },
  {
    category: "Tools",
    items: ["Git", "VS Code", "Figma", "Vercel", "Docker"],
  },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function UeberPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <section className="py-16">
        <p className="font-mono text-sm text-[#22d3ee]">{t("heading")}</p>
        <h1 className="mt-4 text-3xl font-bold text-[#e5e5e5] sm:text-4xl">Niklas Held</h1>

        <div className="mt-8 space-y-6 text-[#a3a3a3]">
          <p>{t("bio1")}</p>
          <p>{t("bio2")}</p>
        </div>

        <div className="mt-8">
          <SocialLinks />
        </div>
      </section>

      <section className="py-16">
        <h2 className="font-mono text-sm text-[#22d3ee]">{t("skillsHeading")}</h2>

        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {skills.map((skillGroup) => (
            <div key={skillGroup.category}>
              <h3 className="font-mono text-lg font-semibold text-[#e5e5e5]">
                {skillGroup.category}
              </h3>
              <ul className="mt-4 space-y-2">
                {skillGroup.items.map((skill) => (
                  <li key={skill} className="flex items-center gap-2 text-[#737373]">
                    <span className="text-[#22d3ee]">{">"}</span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <h2 className="font-mono text-sm text-[#22d3ee]">{t("contactHeading")}</h2>
        <div className="mt-8">
          <p className="text-[#a3a3a3]">{t("contactText")}</p>
          <a
            href="mailto:hello@held0.com"
            className="mt-4 inline-flex items-center gap-2 text-[#22d3ee] transition-opacity hover:opacity-80"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
              <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
            </svg>
            hello@held0.com
          </a>
        </div>
      </section>
    </div>
  );
}
