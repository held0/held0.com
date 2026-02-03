import Link from "next/link";

export interface Project {
  title: string;
  description: string;
  tags: string[];
  href: string;
  external?: boolean;
}

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const CardWrapper = project.external ? "a" : Link;
  const cardProps = project.external
    ? { href: project.href, target: "_blank", rel: "noopener noreferrer" }
    : { href: project.href };

  return (
    <CardWrapper
      {...cardProps}
      className="group block rounded-lg border border-[#1a1a1a] bg-[#1a1a1a]/50 p-6 transition-all hover:border-[#22d3ee]/30 hover:bg-[#1a1a1a]"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-mono text-lg font-semibold text-[#e5e5e5] transition-colors group-hover:text-[#22d3ee]">
          {project.title}
        </h3>
        {project.external && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-[#737373] transition-colors group-hover:text-[#22d3ee]"
          >
            <path
              fillRule="evenodd"
              d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
              clipRule="evenodd"
            />
            <path
              fillRule="evenodd"
              d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <p className="mt-2 text-sm text-[#737373]">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-[#0f0f0f] px-3 py-1 font-mono text-xs text-[#737373]"
          >
            {tag}
          </span>
        ))}
      </div>
    </CardWrapper>
  );
}
