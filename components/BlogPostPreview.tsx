import Link from "next/link";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
}

interface BlogPostPreviewProps {
  post: BlogPost;
}

export default function BlogPostPreview({ post }: BlogPostPreviewProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-lg border border-[#1a1a1a] bg-[#1a1a1a]/50 p-6 transition-all hover:border-[#22d3ee]/30 hover:bg-[#1a1a1a]"
    >
      <div className="flex items-center gap-3 text-xs text-[#737373]">
        <time dateTime={post.date}>
          {new Date(post.date).toLocaleDateString("de-DE", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
        <span className="text-[#22d3ee]">/</span>
        <span>{post.readingTime}</span>
      </div>
      <h3 className="mt-3 font-mono text-lg font-semibold text-[#e5e5e5] transition-colors group-hover:text-[#22d3ee]">
        {post.title}
      </h3>
      <p className="mt-2 text-sm text-[#737373]">{post.description}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm text-[#22d3ee] opacity-0 transition-opacity group-hover:opacity-100">
        Lesen
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
      </span>
    </Link>
  );
}
