import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AINA Teman Seller Malaysia",
    short_name: "AINA",
    description:
      "Teman digital untuk bantu seller Malaysia dengan idea content, caption, hook dan strategi bisnes.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#6D3DF5",
    orientation: "portrait",
    icons: [
      {
        src: "/aina-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/aina-logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}