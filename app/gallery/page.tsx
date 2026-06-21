"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, PlayCircle, Image as ImageIcon, Film, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Video = { id: string; title: string; youtube_url: string; description: string; created_at: string };

const GALLERY_IMAGES = [
  { src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80", alt: "Kajjansi farm at sunrise", category: "ponds" },
  { src: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&q=80", alt: "Pond preparation and construction", category: "ponds" },
  { src: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80", alt: "Dam liner materials", category: "liners" },
  { src: "https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=600&q=80", alt: "Fish fingerlings in pond", category: "hatchery" },
  { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80", alt: "Aquaculture training session", category: "training" },
  { src: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&q=80", alt: "Farm operations", category: "training" },
  { src: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80", alt: "Fish feed pellets", category: "feed" },
  { src: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=600&q=80", alt: "Colourful fish in hatchery", category: "hatchery" },
  { src: "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=600&q=80", alt: "Water quality monitoring", category: "hatchery" },
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", alt: "Pond water view", category: "ponds" },
  { src: "https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=600&q=80", alt: "Nile tilapia fingerlings", category: "hatchery" },
  { src: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80", alt: "Sustainable aquaculture environment", category: "ponds" },
];

const DEMO_VIDEOS: Video[] = [
  { id: "1", title: "How We Construct Fish Ponds at KASC", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: "A walkthrough of our complete fish pond construction process, from site assessment to final testing.", created_at: "2024-01-15" },
  { id: "2", title: "Dam Liner Installation Tutorial", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: "Step-by-step guide to installing HDPE dam liners for fish ponds and water storage.", created_at: "2024-02-01" },
  { id: "3", title: "Meet Our Kajjansi Farm", youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", description: "A tour of the Kajjansi demonstration farm — hatchery, ponds, training center, and fabrication shop.", created_at: "2024-03-10" },
];

function getYouTubeId(url: string): string {
  const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : "";
}

export default function GalleryPage() {
  const [tab, setTab] = useState<"photos" | "videos">("photos");
  const [videos, setVideos] = useState<Video[]>(DEMO_VIDEOS);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    async function fetchVideos() {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("videos").select("*").order("created_at", { ascending: false });
        if (data && data.length > 0) setVideos(data);
      } catch {}
    }
    fetchVideos();
  }, []);

  const categories = ["all", ...Array.from(new Set(GALLERY_IMAGES.map((i) => i.category)))];
  const filtered = filter === "all" ? GALLERY_IMAGES : GALLERY_IMAGES.filter((i) => i.category === filter);

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-20 lg:py-28 gradient-hero overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#1a6b94]/20 blur-3xl" />
        <div className="container-wide relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm mb-6">
              <ImageIcon size={14} className="text-[#5aafd4]" /> Media Gallery
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-5">Our Work in Pictures & Videos</h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              See our fish farms, pond constructions, dam liner installations, and training programs — straight from the field.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-12 fill-white">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Tab Switch */}
      <div className="bg-white border-b border-gray-100 sticky top-[80px] lg:top-[84px] z-30">
        <div className="container-wide flex items-center gap-4 py-4">
          <button onClick={() => setTab("photos")}
            className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all",
              tab === "photos" ? "bg-[#0f5070] text-white" : "text-gray-600 hover:bg-gray-50")}>
            <ImageIcon size={16} /> Photos ({GALLERY_IMAGES.length})
          </button>
          <button onClick={() => setTab("videos")}
            className={cn("flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all",
              tab === "videos" ? "bg-[#0f5070] text-white" : "text-gray-600 hover:bg-gray-50")}>
            <Film size={16} /> Videos ({videos.length})
          </button>
        </div>
      </div>

      {/* Photos */}
      {tab === "photos" && (
        <section className="section-padding bg-[#f8fafc]">
          <div className="container-wide">
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setFilter(cat)}
                  className={cn("px-4 py-2 rounded-full text-sm font-medium border transition-all capitalize",
                    filter === cat ? "bg-[#0f5070] text-white border-[#0f5070]" : "bg-white text-gray-600 border-gray-200 hover:border-[#2d8ab8] hover:text-[#0f5070]")}>
                  {cat === "all" ? "All Photos" : cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((img, i) => (
                <button key={i} onClick={() => setLightbox(img)}
                  className="relative rounded-2xl overflow-hidden aspect-square group shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <Image src={img.src} alt={img.alt} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-[#071e2e]/0 group-hover:bg-[#071e2e]/40 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/0 group-hover:bg-white/90 flex items-center justify-center transition-all scale-0 group-hover:scale-100">
                      <Plus size={18} className="text-[#0f5070]" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-xs font-medium">{img.alt}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Videos */}
      {tab === "videos" && (
        <section className="section-padding bg-[#f8fafc]">
          <div className="container-wide">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => {
                const videoId = getYouTubeId(video.youtube_url);
                return (
                  <div key={video.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow group">
                    <div className="relative aspect-video bg-[#071e2e]">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
                        title={video.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <PlayCircle size={14} className="text-red-500" />
                        <span className="text-xs text-gray-400">{new Date(video.created_at).toLocaleDateString("en-UG", { year: "numeric", month: "long" })}</span>
                      </div>
                      <h3 className="font-bold text-[#071e2e] mb-2 font-display line-clamp-2">{video.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{video.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
            <X size={20} />
          </button>
          <div className="relative max-w-4xl w-full aspect-[4/3] rounded-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <Image src={lightbox.src} alt={lightbox.alt} fill className="object-contain" />
          </div>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">{lightbox.alt}</p>
        </div>
      )}

      {/* CTA */}
      <section className="py-16 bg-white text-center">
        <div className="container-wide">
          <h2 className="text-2xl font-bold text-[#071e2e] mb-3">Want to See Our Farm in Person?</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">We welcome farm visits to Kajjansi. Come see our operations firsthand and meet our team.</p>
          <Link href="/farm" className="btn-primary">Explore Our Farm <Play size={15} /></Link>
        </div>
      </section>
    </div>
  );
}
