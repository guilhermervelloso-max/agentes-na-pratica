import type { MetadataRoute } from "next";
import { abs } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/salvos"] }], sitemap: abs("/sitemap.xml") };
}
