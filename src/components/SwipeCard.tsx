import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, X, User } from "lucide-react";

interface SwipeCardProps {
  friend: {
    id: string;
    nickname: string;
    useless_trait: string;
    tagline: string;
    keeps_count: number;
    cross_offs_count: number;
    photo_url?: string;
    discord_username?: string;
    interests?: string;
    why_not_want?: string;
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
      className="relative w-full min-h-[550px] cursor-grab active:cursor-grabbing shadow-2xl border-4 border-primary/20 bg-card overflow-hidden select-none touch-none"
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
        <div>
          {friend.photo_url ? (
            <div className="flex justify-center mb-4">
              <img
                src={friend.photo_url}
                alt={friend.nickname}
                className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
              />
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-primary/20">
                <User className="w-16 h-16 text-muted-foreground" />
              </div>
            </div>
          )}
          
          <h2 className="text-4xl font-bold text-center mb-2 text-foreground">
            {friend.nickname}
          </h2>
          {friend.discord_username && (
            <p className="text-sm text-center text-muted-foreground mb-4">
              Discord: {friend.discord_username}
            </p>
          )}
          <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6" />
        </div>

        <div className="space-y-4 flex-1 flex flex-col justify-center">
          <div className="bg-muted/50 p-4 rounded-xl">
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              Useless Trait
            </p>
            <p className="text-lg font-semibold text-foreground">
              {friend.useless_trait}
            </p>
          </div>

          {friend.interests && (
            <div className="bg-accent/10 p-4 rounded-xl border-2 border-accent/20">
              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                Interests
              </p>
              <p className="text-base text-foreground">
                {friend.interests}
              </p>
            </div>
          )}

          <div className="bg-primary/10 p-4 rounded-xl border-2 border-primary/20">
            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
              About Them
            </p>
            <p className="text-base italic text-foreground">
              "{friend.tagline}"
            </p>
          </div>

          {friend.why_not_want && (
            <div className="bg-destructive/10 p-4 rounded-xl border-2 border-destructive/20">
              <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                The Issue
              </p>
              <p className="text-base text-foreground">
                {friend.why_not_want}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Popularity</span>
            <span className="text-base font-bold text-foreground">{keepPercentage}% Keep Rate</span>
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
