import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, X } from "lucide-react";

interface SwipeCardProps {
  friend: {
    id: string;
    nickname: string;
    useless_trait: string;
    tagline: string;
    keeps_count: number;
    cross_offs_count: number;
  };
  onSwipe: (friendId: string, isKeep: boolean) => void;
  disabled?: boolean;
}

const SwipeCard = ({ friend, onSwipe, disabled }: SwipeCardProps) => {
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (clientX: number, clientY: number) => {
    if (disabled) return;
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || disabled) return;
    const offsetX = clientX - dragStart.x;
    const offsetY = clientY - dragStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleDragEnd = () => {
    if (!isDragging || disabled) return;
    setIsDragging(false);

    const swipeThreshold = 100;
    
    if (Math.abs(dragOffset.x) > swipeThreshold) {
      const isKeep = dragOffset.x > 0;
      onSwipe(friend.id, isKeep);
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  const rotation = isDragging ? dragOffset.x / 10 : 0;
  const opacity = isDragging ? Math.max(0.7, 1 - Math.abs(dragOffset.x) / 300) : 1;

  const totalVotes = friend.keeps_count + friend.cross_offs_count;
  const keepPercentage = totalVotes > 0 ? Math.round((friend.keeps_count / totalVotes) * 100) : 50;

  return (
    <Card
      className="relative w-full h-[500px] cursor-grab active:cursor-grabbing shadow-2xl border-4 border-primary/20 bg-card overflow-hidden select-none touch-none"
      style={{
        transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
        opacity,
        transition: isDragging ? "none" : "transform 0.3s ease-out, opacity 0.3s ease-out",
      }}
      onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        handleDragStart(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        handleDragMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={handleDragEnd}
    >
      {/* Swipe indicators */}
      {isDragging && (
        <>
          <div
            className="absolute top-8 left-8 z-10 transform -rotate-12"
            style={{ opacity: Math.max(0, dragOffset.x / 150) }}
          >
            <div className="bg-success text-success-foreground px-6 py-3 rounded-xl font-bold text-2xl border-4 border-success flex items-center gap-2">
              <Heart className="w-6 h-6" />
              KEEP
            </div>
          </div>
          <div
            className="absolute top-8 right-8 z-10 transform rotate-12"
            style={{ opacity: Math.max(0, -dragOffset.x / 150) }}
          >
            <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-xl font-bold text-2xl border-4 border-destructive flex items-center gap-2">
              <X className="w-6 h-6" />
              NOPE
            </div>
          </div>
        </>
      )}

      <CardContent className="p-8 h-full flex flex-col justify-between">
        {/* Nickname */}
        <div>
          <h2 className="text-5xl font-bold text-center mb-4 text-foreground">
            {friend.nickname}
          </h2>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6" />
        </div>

        {/* Traits */}
        <div className="space-y-6 flex-1 flex flex-col justify-center">
          <div className="bg-muted/50 p-6 rounded-2xl">
            <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Useless Trait
            </p>
            <p className="text-2xl font-semibold text-foreground">
              {friend.useless_trait}
            </p>
          </div>

          <div className="bg-primary/10 p-6 rounded-2xl border-2 border-primary/20">
            <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              About Them
            </p>
            <p className="text-xl italic text-foreground">
              "{friend.tagline}"
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Popularity Score</span>
            <span className="text-lg font-bold text-foreground">{keepPercentage}% Keep Rate</span>
          </div>
          <div className="flex gap-4 text-center">
            <div className="flex-1 bg-success/20 p-3 rounded-xl border-2 border-success/30">
              <div className="text-2xl font-bold text-success">{friend.keeps_count}</div>
              <div className="text-xs text-muted-foreground">Keeps</div>
            </div>
            <div className="flex-1 bg-destructive/20 p-3 rounded-xl border-2 border-destructive/30">
              <div className="text-2xl font-bold text-destructive">{friend.cross_offs_count}</div>
              <div className="text-xs text-muted-foreground">Cross Offs</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SwipeCard;
