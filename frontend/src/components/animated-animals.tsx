import { useState } from "react";
import { cn } from "@/lib/utils";

interface AnimalProps {
  emoji: string;
  name: string;
  actionText: string;
  className?: string;
  idleAnimation?: string;
  flip?: boolean;
}

export function PerchedAnimal({
  emoji,
  name,
  actionText,
  className,
  idleAnimation = "animate-animal-float",
  flip = false,
}: AnimalProps) {
  const [clicked, setClicked] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setClicked(true);
    setShowBubble(true);
    setTimeout(() => setClicked(false), 600);
    setTimeout(() => setShowBubble(false), 1200);
  };

  return (
    <span
      className={cn(
        "absolute z-10 select-none cursor-pointer group pointer-events-auto leading-none",
        className
      )}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
      title={`${name} — click or touch me!`}
      role="button"
      tabIndex={0}
      aria-label={name}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleInteraction(e as any);
        }
      }}
    >
      {/* Speech / Reaction popup */}
      {showBubble && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground text-background px-2 py-0.5 text-[11px] font-semibold tracking-normal shadow-lg animate-animal-pop pointer-events-none z-20">
          {actionText}
        </span>
      )}

      <span
        className={cn(
          "inline-block text-xl sm:text-2xl md:text-3xl transition-transform duration-200 transform-gpu drop-shadow-xs",
          idleAnimation,
          flip && "-scale-x-100",
          clicked
            ? "animate-animal-jump"
            : "group-hover:scale-130 group-hover:-translate-y-1"
        )}
      >
        {emoji}
      </span>
    </span>
  );
}
