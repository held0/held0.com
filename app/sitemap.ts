import { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/mdx";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://held0.com";

  const staticPages = [
    { de: "/", en: "/en" },
    { de: "/projekte", en: "/en/projects" },
    { de: "/ueber", en: "/en/about" },
    { de: "/kontakt", en: "/en/contact" },
    { de: "/blog", en: "/en/blog" },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const page of staticPages) {
    entries.push({
      url: `${baseUrl}${page.de}`,
      lastModified: new Date(),
      changeFrequency: page.de === "/" ? "weekly" : "monthly",
      priority: page.de === "/" ? 1 : 0.8,
      alternates: {
        languages: {
          de: `${baseUrl}${page.de}`,
          en: `${baseUrl}${page.en}`,
        },
      },
    });
    entries.push({
      url: `${baseUrl}${page.en}`,
      lastModified: new Date(),
      changeFrequency: page.de === "/" ? "weekly" : "monthly",
      priority: page.de === "/" ? 1 : 0.8,
      alternates: {
        languages: {
          de: `${baseUrl}${page.de}`,
          en: `${baseUrl}${page.en}`,
        },
      },
    });
  }

  const slugs = getAllPostSlugs("de");
  for (const slug of slugs) {
    entries.push({
      url: `${baseUrl}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          de: `${baseUrl}/blog/${slug}`,
          en: `${baseUrl}/en/blog/${slug}`,
        },
      },
    });
    entries.push({
      url: `${baseUrl}/en/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: {
        languages: {
          de: `${baseUrl}/blog/${slug}`,
          en: `${baseUrl}/en/blog/${slug}`,
        },
      },
    });
  }

  return entries;
}
