import { MetadataRoute } from "next";

const BASE_URL = "https://prompt-share-eight-alpha.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/mypage"] },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
