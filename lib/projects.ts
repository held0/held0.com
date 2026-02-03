import { Project } from "@/components/ProjectCard";

export const projects: Project[] = [
  {
    title: "imposter-online.com",
    description:
      "Ein Online-Multiplayer-Spiel inspiriert von Among Us. Spielbar direkt im Browser ohne Download.",
    tags: ["Next.js", "Zustand", "Framer Motion", "TypeScript"],
    href: "https://imposter-online.com",
    external: true,
  },
  {
    title: "offenesprechstunde.de",
    description:
      "Plattform zur Suche von Ärzten mit offenen Sprechstunden. Einfach Arzt finden ohne Termin.",
    tags: ["Rails 8", "Hotwire", "PostgreSQL", "Tailwind"],
    href: "https://offenesprechstunde.de",
    external: true,
  },
  {
    title: "held0.com",
    description:
      "Diese Portfolio-Website. Minimalistisches Design mit Developer-Vibe. Open Source auf GitHub.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "MDX"],
    href: "https://github.com/held0/held0.com",
    external: true,
  },
];

export function getFeaturedProjects(count: number = 3): Project[] {
  return projects.slice(0, count);
}

export function getAllProjects(): Project[] {
  return projects;
}
