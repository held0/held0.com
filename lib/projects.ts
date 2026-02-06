import { Project } from "@/components/ProjectCard";

export const projects: Project[] = [
  {
    title: "imposter-online.com",
    descriptionKey: "imposter-online",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "next-intl"],
    href: "https://imposter-online.com",
    external: true,
  },
  {
    title: "offenesprechstunden.de",
    descriptionKey: "offenesprechstunden",
    tags: ["Rails 8", "Hotwire", "PostgreSQL", "Tailwind CSS", "Flowbite"],
    href: "https://offenesprechstunden.de",
    external: true,
  },
  {
    title: "held0.com",
    descriptionKey: "held0",
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
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
