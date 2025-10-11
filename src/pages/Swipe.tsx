import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SwipeCard from "@/components/SwipeCard";

interface Friend {
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
}

const Swipe = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFriends(data || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Couldn't load friends");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (friendId: string, isKeep: boolean) => {
    if (swiping) return;
    setSwiping(true);

    const voteType = isKeep ? "keep" : "cross";

    try {
      const { error } = await supabase.rpc("vote_on_friend", {
        friend_id: friendId,
        vote_type: voteType,
      });

      if (error) throw error;

      toast.success(isKeep ? "Kept" : "Crossed off", {
        duration: 1000,
      });

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setSwiping(false);
      }, 500);
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Vote failed");
      setSwiping(false);
    }
  };

  const resetStack = () => {
    setCurrentIndex(0);
    fetchFriends();
    toast.success("Stack refreshed");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-4xl text-white font-bold animate-pulse">Loading friends...</div>
      </div>
    );
  }

  const currentFriend = friends[currentIndex];
  const hasMoreFriends = currentIndex < friends.length;

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Home
        </Button>
        <div className="text-white font-bold text-lg">
          {currentIndex + 1} / {friends.length}
        </div>
        <Button
          variant="ghost"
          onClick={resetStack}
          className="text-white hover:bg-white/10"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Card Stack */}
      <div className="flex-1 flex items-center justify-center p-6">
        {hasMoreFriends && currentFriend ? (
          <div className="relative w-full max-w-sm">
            <SwipeCard
              friend={currentFriend}
              onSwipe={handleVote}
              disabled={swiping}
            />
          </div>
        ) : (
          <div className="text-center bounce-in">
            <h2 className="text-4xl font-bold text-white mb-4">
              That's Everyone
            </h2>
            <p className="text-xl text-white/80 mb-8">
              You've swiped through all the friends
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={resetStack}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-xl rounded-full font-bold"
              >
                <RotateCcw className="mr-2 w-6 h-6" />
                Start Over
              </Button>
              <Button
                onClick={() => navigate("/post")}
                variant="secondary"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-6 text-xl rounded-full font-bold"
              >
                Post a Friend
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {hasMoreFriends && currentFriend && (
        <div className="p-6 flex justify-center gap-6 pb-12">
          <Button
            onClick={() => handleVote(currentFriend.id, false)}
            disabled={swiping}
            className="w-20 h-20 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-2xl transform hover:scale-110 transition-all disabled:opacity-50"
            size="icon"
          >
            <X className="w-10 h-10" />
          </Button>
          <Button
            onClick={() => handleVote(currentFriend.id, true)}
            disabled={swiping}
            className="w-20 h-20 rounded-full bg-success hover:bg-success/90 text-success-foreground shadow-2xl transform hover:scale-110 transition-all disabled:opacity-50"
            size="icon"
          >
            <Heart className="w-10 h-10" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default Swipe;
