import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPostSlugs } from "@/lib/mdx";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post nicht gefunden",
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <article className="py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-[#737373] transition-colors hover:text-[#22d3ee]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Zurück zum Blog
        </Link>

        <header className="mt-8">
          <div className="flex items-center gap-3 text-sm text-[#737373]">
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
          <h1 className="mt-4 text-3xl font-bold text-[#e5e5e5] sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-lg text-[#737373]">{post.description}</p>
        </header>

        <div className="prose prose-invert mt-12 max-w-none prose-headings:font-mono prose-headings:text-[#e5e5e5] prose-p:text-[#a3a3a3] prose-a:text-[#22d3ee] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#e5e5e5] prose-code:text-[#22d3ee] prose-pre:bg-[#1a1a1a] prose-li:text-[#a3a3a3]">
          <MDXRemote
            source={post.content}
            options={{
              mdxOptions: {
                rehypePlugins: [rehypeHighlight, rehypeSlug],
              },
            }}
          />
        </div>
      </article>
    </div>
  );
}
