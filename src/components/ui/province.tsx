"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { CarouselBadge } from "./carousel-badge";
import Autoplay from "embla-carousel-autoplay";

const PROVINCES = [
  "YUKON",
  "SASKATCHEWAN",
  "QUEBEC",
  "PRINCE EDWARD ISLAND",
  "ONTARIO",
  "NUNAVUT",
  "NOVA SCOTIA",
  "NEW BRUNSWICK",
  "NEWFOUNDLAND",
  "NEW BRUNSWICK",
  "MANITORA",
  "BRITISH COLUMBIA",
  "ALBERTA",
];

export function ProvinceCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  // Initialize Embla with autoplay plugin
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000, stopOnInteraction: false }),
  ]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
      }
    },
    [emblaApi]
  );

  // Update selected index when slide changes
  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    });

    return () => {
      emblaApi.off("select", () => {});
    };
  }, [emblaApi]);

  // Handle mouse enter/leave for autoplay
  const handleMouseEnter = useCallback(() => {
    if (emblaApi && autoplayEnabled) {
      const autoplayPlugin = emblaApi.plugins().autoplay;
      if (autoplayPlugin) {
        autoplayPlugin.stop();
        setAutoplayEnabled(false);
      }
    }
  }, [emblaApi, autoplayEnabled]);

  const handleMouseLeave = useCallback(() => {
    if (emblaApi && !autoplayEnabled) {
      const autoplayPlugin = emblaApi.plugins().autoplay;
      if (autoplayPlugin) {
        autoplayPlugin.play();
        setAutoplayEnabled(true);
      }
    }
  }, [emblaApi, autoplayEnabled]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div
        className="overflow-hidden"
        ref={emblaRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex">
          {PROVINCES.map((province) => (
            <div
              key={province}
              className="flex-[0_0_100%] min-w-0 relative h-32 bg-black flex items-center justify-center"
            >
              <h2 className="text-yellow-400 text-4xl font-bold">{province}</h2>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-8">
        {PROVINCES.map((province, index) => (
          <CarouselBadge
            key={province}
            province={province}
            isActive={index === selectedIndex}
            onClick={() => scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
