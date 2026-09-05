import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface CoconutParticle {
  id: number;
  x: number;
  rotation: number;
}

export function InteractiveTree({ className }: { className?: string }) {
  const [isWobbling, setIsWobbling] = useState(false);
  const [coconuts, setCoconuts] = useState<CoconutParticle[]>([]);
  const [tilt, setTilt] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const treeRef = useRef<HTMLButtonElement>(null);
  const coconutIdRef = useRef(0);

  const triggerReaction = () => {
    setIsWobbling(true);
    setTimeout(() => setIsWobbling(false), 750);

    // Spawn falling coconut particle
    const newId = ++coconutIdRef.current;
    const randomX = (Math.random() - 0.5) * 22;
    const randomRot = (Math.random() - 0.5) * 120;

    setCoconuts((prev) => [
      ...prev.slice(-3),
      { id: newId, x: randomX, rotation: randomRot },
    ]);

    setTimeout(() => {
      setCoconuts((prev) => prev.filter((c) => c.id !== newId));
    }, 850);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!treeRef.current) return;
    const rect = treeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const offset = (e.clientX - centerX) / (rect.width / 2);
    // Tilt dynamically following cursor between -18deg and +18deg
    setTilt(Math.max(-20, Math.min(20, offset * 18)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (!treeRef.current || !e.touches[0]) return;
    const rect = treeRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const touch = e.touches[0];
    const offset = (touch.clientX - centerX) / (rect.width / 2);
    setTilt(Math.max(-25, Math.min(25, offset * 22)));
  };

  return (
    <div className="relative inline-flex items-center justify-center select-none">
      <button
        ref={treeRef}
        type="button"
        onClick={triggerReaction}
        onTouchStart={triggerReaction}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setTilt(0)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setIsHovered(false);
          setTilt(0);
        }}
        title="Touch or click the coconut tree! 🌴🥥"
        aria-label="Interactive coconut tree"
        className={cn(
          "group relative flex size-8 items-center justify-center rounded-full transition-transform duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer active:scale-95",
          className
        )}
      >
        <span
          className={cn(
            "text-2xl leading-none inline-block select-none transition-transform duration-150",
            isWobbling
              ? "animate-tree-shake"
              : isHovered
              ? "animate-tree-breeze"
              : "hover:scale-115"
          )}
          style={{
            transformOrigin: "50% 90%",
            transform: !isWobbling && tilt !== 0 ? `rotate(${tilt}deg) scale(1.12)` : undefined,
          }}
          role="img"
          aria-label="coconut palm tree"
        >
          🌴
        </span>
      </button>

      {/* Falling Coconut Particles */}
      {coconuts.map((c) => (
        <span
          key={c.id}
          className="pointer-events-none absolute text-sm animate-coconut-fall select-none"
          style={{
            left: `calc(50% + ${c.x}px)`,
            top: "20%",
            transform: `rotate(${c.rotation}deg)`,
          }}
        >
          🥥
        </span>
      ))}
    </div>
  );
}
