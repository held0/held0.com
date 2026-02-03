import { Metadata } from "next";
import ProjectCard from "@/components/ProjectCard";
import { getAllProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projekte",
  description: "Eine Übersicht meiner Projekte und Open-Source-Arbeiten.",
};

export default function ProjektePage() {
  const projects = getAllProjects();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <section className="py-16">
        <p className="font-mono text-sm text-[#22d3ee]">{"// projekte"}</p>
        <h1 className="mt-4 text-3xl font-bold text-[#e5e5e5] sm:text-4xl">Meine Projekte</h1>
        <p className="mt-4 max-w-xl text-[#737373]">
          Eine Sammlung meiner Projekte, an denen ich gearbeitet habe. Von Web-Apps bis hin zu
          mobilen Anwendungen.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
