import { Metadata } from "next";
import BlogPostPreview from "@/components/BlogPostPreview";
import { getAllPosts } from "@/lib/mdx";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return {
    title: t("title"),
    description: t("metaDescription"),
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const posts = getAllPosts(locale);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <section className="py-16">
        <p className="font-mono text-sm text-[#22d3ee]">{t("heading")}</p>
        <h1 className="mt-4 text-3xl font-bold text-[#e5e5e5] sm:text-4xl">Blog</h1>
        <p className="mt-4 max-w-xl text-[#737373]">{t("description")}</p>

        <div className="mt-12 grid gap-6">
          {posts.length > 0 ? (
            posts.map((post) => <BlogPostPreview key={post.slug} post={post} locale={locale} />)
          ) : (
            <div className="rounded-lg border border-[#1a1a1a] bg-[#1a1a1a]/50 p-8 text-center">
              <p className="font-mono text-[#737373]">
                <span className="text-[#22d3ee]">{"// "}</span>
                {t("emptyState")}
              </p>
              <p className="mt-2 text-sm text-[#737373]">{t("emptyStateHint")}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
