import ProjectCard from "@/components/ProjectCard";
import SocialLinks from "@/components/SocialLinks";
import { getFeaturedProjects } from "@/lib/projects";
import Link from "next/link";

export default function Home() {
  const featuredProjects = getFeaturedProjects(3);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      {/* Hero Section */}
      <section className="py-16">
        <p className="font-mono text-sm text-[#22d3ee]">{"// hallo, ich bin"}</p>
        <h1 className="mt-4 text-4xl font-bold text-[#e5e5e5] sm:text-5xl">Niklas Held</h1>
        <p className="mt-4 max-w-xl text-lg text-[#737373]">
          Builder aus Deutschland
        </p>
        <div className="mt-8">
          <SocialLinks />
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16">
        <h2 className="font-mono text-sm text-[#22d3ee]">{"// projekte"}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/projekte"
            className="inline-flex items-center gap-2 text-sm text-[#737373] transition-colors hover:text-[#22d3ee]"
          >
            Alle Projekte ansehen
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
