"use client";

interface CarouselBadgeProps {
  province: string;
  isActive: boolean;
  onClick: () => void;
}

export function CarouselBadge({
  province,
  isActive,
  onClick,
}: CarouselBadgeProps) {
  return (
    <button
      onClick={() => {
        console.log(`Clicked on ${province}`);
        onClick();
      }}
      className={`
        px-4 py-2 rounded-lg text-sm font-medium transition-all
        ${
          isActive
            ? "bg-yellow-400 text-black"
            : "bg-black text-yellow-400 hover:bg-yellow-400 hover:text-black"
        }
      `}
    >
      {province}
    </button>
  );
}
