import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://held0.com/", lastModified: new Date() }];
}
