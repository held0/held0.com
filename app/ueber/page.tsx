import { Metadata } from "next";
import SocialLinks from "@/components/SocialLinks";

export const metadata: Metadata = {
  title: "Über mich",
  description: "Erfahre mehr über mich, meine Arbeit und meine Interessen.",
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

export default function UeberPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <section className="py-16">
        <p className="font-mono text-sm text-[#22d3ee]">{"// über mich"}</p>
        <h1 className="mt-4 text-3xl font-bold text-[#e5e5e5] sm:text-4xl">Niklas Held</h1>

        <div className="mt-8 space-y-6 text-[#a3a3a3]">
          <p>
            Ich bin Software Developer aus Deutschland mit einer Leidenschaft für sauberen Code und
            durchdachte User Experiences. Mein Fokus liegt auf der Entwicklung von Web-Apps und
            mobilen Anwendungen mit modernen Technologien.
          </p>
          <p>
            Wenn ich nicht gerade code, findest du mich wahrscheinlich beim Erkunden neuer
            Technologien, beim Lesen von Tech-Blogs oder beim Arbeiten an Side-Projects, die
            niemand braucht aber ich trotzdem bauen muss.
          </p>
        </div>

        <div className="mt-8">
          <SocialLinks />
        </div>
      </section>

      <section className="py-16">
        <h2 className="font-mono text-sm text-[#22d3ee]">{"// skills"}</h2>

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
        <h2 className="font-mono text-sm text-[#22d3ee]">{"// kontakt"}</h2>
        <div className="mt-8">
          <p className="text-[#a3a3a3]">
            Hast du eine Frage oder möchtest an einem Projekt zusammenarbeiten? Schreib mir gerne
            eine E-Mail oder kontaktiere mich über Social Media.
          </p>
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
