import { Metadata } from "next";
import BlogPostPreview from "@/components/BlogPostPreview";
import { getAllPosts } from "@/lib/mdx";

export const metadata: Metadata = {
  title: "Blog",
  description: "Gedanken über Software-Entwicklung, Projekte und Technologie.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <section className="py-16">
        <p className="font-mono text-sm text-[#22d3ee]">{"// blog"}</p>
        <h1 className="mt-4 text-3xl font-bold text-[#e5e5e5] sm:text-4xl">Blog</h1>
        <p className="mt-4 max-w-xl text-[#737373]">
          Gedanken über Software-Entwicklung, Projekte und alles, was mich interessiert.
        </p>

        <div className="mt-12 grid gap-6">
          {posts.length > 0 ? (
            posts.map((post) => <BlogPostPreview key={post.slug} post={post} />)
          ) : (
            <div className="rounded-lg border border-[#1a1a1a] bg-[#1a1a1a]/50 p-8 text-center">
              <p className="font-mono text-[#737373]">
                <span className="text-[#22d3ee]">{"// "}</span>
                Noch keine Blog-Posts vorhanden
              </p>
              <p className="mt-2 text-sm text-[#737373]">Schau bald wieder vorbei!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
