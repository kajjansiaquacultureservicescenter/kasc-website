"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  name: string;
  badge?: string | null;
  badgeStyle?: string;
  inStock: boolean;
};

export default function ProductImageGallery({ images, name, badge, badgeStyle, inStock }: Props) {
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  return (
    <div className="flex flex-col h-full">
      {/* Main image */}
      <div className="relative flex-1 min-h-[340px] lg:min-h-[480px] bg-gradient-to-br from-[#eef8fd] to-[#f0fcf4]">
        <Image
          src={images[active]}
          alt={name}
          fill
          className="object-cover transition-opacity duration-200"
          priority
        />
        {badge && (
          <span className={cn("absolute top-5 left-5 px-3 py-1.5 rounded-full text-sm font-bold shadow-md", badgeStyle ?? "bg-gray-800 text-white")}>
            {badge}
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="px-5 py-2 bg-gray-800 text-white font-semibold rounded-full">Out of Stock</span>
          </div>
        )}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors z-10"
            >
              <ChevronLeft size={18} className="text-[#071e2e]" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors z-10"
            >
              <ChevronRight size={18} className="text-[#071e2e]" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    i === active ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 p-3 bg-[#f8fafc] border-t border-gray-100 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={cn(
                "relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all",
                i === active ? "border-[#0f5070]" : "border-transparent opacity-55 hover:opacity-100"
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
