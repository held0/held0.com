import fs from "fs";
import path from "path";
import matter from "gray-matter";

function getContentDirectory(locale: string): string {
  return path.join(process.cwd(), "content/blog", locale);
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: string;
}

export interface BlogPostData extends BlogPostMeta {
  content: string;
}

function calculateReadingTime(content: string, locale: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  if (locale === "en") {
    return `${minutes} min read`;
  }
  return `${minutes} Min. Lesezeit`;
}

export function getAllPosts(locale: string = "de"): BlogPostMeta[] {
  const contentDirectory = getContentDirectory(locale);

  // Fallback to DE if locale directory doesn't exist
  const fallbackDirectory = getContentDirectory("de");
  const dir = fs.existsSync(contentDirectory) ? contentDirectory : fallbackDirectory;

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir);
  const posts = files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const fullPath = path.join(dir, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        description: data.description || "",
        date: data.date || new Date().toISOString(),
        readingTime: calculateReadingTime(content, locale),
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return posts;
}

export function getPostBySlug(slug: string, locale: string = "de"): BlogPostData | null {
  const contentDirectory = getContentDirectory(locale);
  let fullPath = path.join(contentDirectory, `${slug}.mdx`);

  // Fallback to DE if locale-specific post doesn't exist
  if (!fs.existsSync(fullPath)) {
    const fallbackPath = path.join(getContentDirectory("de"), `${slug}.mdx`);
    if (fs.existsSync(fallbackPath)) {
      fullPath = fallbackPath;
    } else {
      return null;
    }
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || slug,
    description: data.description || "",
    date: data.date || new Date().toISOString(),
    readingTime: calculateReadingTime(content, locale),
    content,
  };
}

export function getAllPostSlugs(locale: string = "de"): string[] {
  const contentDirectory = getContentDirectory(locale);

  // Fallback to DE if locale directory doesn't exist
  const fallbackDirectory = getContentDirectory("de");
  const dir = fs.existsSync(contentDirectory) ? contentDirectory : fallbackDirectory;

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir);
  return files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, ""));
}
