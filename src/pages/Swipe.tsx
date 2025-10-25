import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, X, RotateCcw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SwipeCard from "@/components/SwipeCard";
import { Card, CardContent } from "@/components/ui/card";

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
  sex?: string;
  user_id?: string;
}

const Swipe = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [allFriends, setAllFriends] = useState<Friend[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sex: "",
    interests: [] as string[],
  });
  
  const swipeRightSound = useRef<HTMLAudioElement | null>(null);
  const swipeLeftSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchFriends();
    
    // Create audio elements for swipe sounds
    swipeRightSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGJ0fPTgjMGHWy58OGeUhELTKXh8blrGwU+ltby0H8pBSl+zPLaizsIGGS+7+OhTBAMVKzn8bllGgdBntzy0IMnBSh6y/HajDoIHG/A7+KdTxALTqPh8bRsFgU3k9Xz1IAqBSZ7yfHdizsIGG/A7+GdTxALT6Xh8bVtGQdCntzy0YMmBSh6y/HdjDoIHXDA7+KeTxALT6Xh8bNsFgU3k9XzyoAqBSZ7yfHdizsIGG/A7+GdTxALTqTh8bRtGQdBntzy0YMmBSh6y/HdjDoIHXDA7+OeTxALTqPh8bRsFgU3k9XzyoAqBSZ7yfHdizsIGW/A7+CdTxALT6Xh8bNsGQdBntzy0YMmBSh6y/HdjDoIHXDA7+OeTxALTqTh8bVsFgU2k9XzyoAqBSZ7yfHdizsIGW/A7+CdTxALUKXh8bJsGQdBntzy0YMmBSh6y/HdjToIHXDA7+SdTxALTqTh8bVsFQU3k9XzyoAqBSZ7yfHdizsIGW/A7+CdTxALUKXh8bJsGAdBntzy04MmBSh6y/HdjToIHXHA7+SdThALTqTh8bVsFQU3k9XzyoAqBCZ7yfHdizsIGW/B7+CdTxALUKXh8bJsGAdBntzy04MlBSh6y/HdjToIHXHA7+SdThALTqTh8bVsFQU3k9XzyoAqBCZ8yfHdizsIGW/B7+CdTxALT6Xh8bJsGAdBntzx04MlBSh6y/HdjToIHXHA7+SdThALT6Th8bVsFQU3k9XzyoAqBCZ8yfHdizsIGW/B7+CdTxALT6Xh8bFsGAdBntzx04MlBSh6y/HdjToIHXHA7+SdThALT6Th8bVsFQU3k9XzyoAqBCZ8yfHdizsIGW/B7+CdTxALT6Xh8bFsGAdBntzx04MlBSh6y/HdjToIHXHA7+SdThALT6Th8bVsFQU3k9XzyoAqBCZ8yfHdizsIGW/B7+CdTxALT6Xh8bFsGAdBntzx04MlBSh6y/HdjToIHXHA7+SdThALT6Th8bVsFQU3k9XzyoAqBCZ8yfHdizsIGW/B7+CdTxALT6Xh8bFsGAdBntzx04MlBSh6y/HdjToIHXHA7+SdThALT6Th8bVsFQU3k9XzyoAqBCZ8yfHdizsIGW/B7+CdTxALT6Xh8Q==');
    swipeLeftSound.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYiFbF1fdZivq5BgNjVfodDcqmEcBD+a3PLDcSQGLIHO8tiJNggZZ7zs559NEwxPpuPvt2McBziQ1/HNfCwEJHfH8d+RQAoUXrTq7KlVFgpFnuDyvW4gBTKI0fPTgjMFHWy68OGeUhEKS6Th8rxqGgU+ldby0H8pBil+zPLaiz0IGmS+7+OhTRALVKzl8LlmGgZBndz00oMnBSh6y/LajDoIHW/A7+KdTxALTqPi8bRsFgY3k9Xzz4AqBiZ7yvHdjDsIGG/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThALTqTh8rRsFgY3k9Xzz4AqBiZ7yvHdjDsIGW/A8OGdThA=');
  }, []);

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAllFriends(data || []);
      applyFilters(data || []);
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Couldn't load friends");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (friendsList: Friend[]) => {
    let filtered = friendsList;

    if (filters.sex) {
      filtered = filtered.filter(f => f.sex === filters.sex);
    }

    if (filters.interests.length > 0) {
      filtered = filtered.filter(f => {
        if (!f.interests) return false;
        return filters.interests.some(interest => 
          f.interests?.toLowerCase().includes(interest.toLowerCase())
        );
      });
    }

    setFriends(filtered);
    setCurrentIndex(0);
  };

  useEffect(() => {
    applyFilters(allFriends);
  }, [filters]);

  const handleVote = async (friendId: string, isKeep: boolean) => {
    if (swiping) return;
    setSwiping(true);

    // Play sound
    if (isKeep && swipeRightSound.current) {
      swipeRightSound.current.play().catch(() => {});
    } else if (!isKeep && swipeLeftSound.current) {
      swipeLeftSound.current.play().catch(() => {});
    }

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
    setFilters({ sex: "", interests: [] });
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className="text-white hover:bg-white/10"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <div className="text-white font-bold text-lg">
            {currentIndex + 1} / {friends.length}
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={resetStack}
          className="text-white hover:bg-white/10"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-6 pb-4">
          <Card className="bg-card/95 backdrop-blur">
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">Gender</label>
                <select
                  value={filters.sex}
                  onChange={(e) => setFilters({ ...filters, sex: e.target.value })}
                  className="w-full h-10 rounded-lg border-2 border-input bg-background px-3 focus:border-primary focus:outline-none"
                >
                  <option value="">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Interests</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Gaming", "Anime", "Movies", "Music", "Sports"].map((interest) => (
                    <label key={interest} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.interests.includes(interest)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({ ...filters, interests: [...filters.interests, interest] });
                          } else {
                            setFilters({ ...filters, interests: filters.interests.filter(i => i !== interest) });
                          }
                        }}
                        className="w-4 h-4 accent-primary"
                      />
                      {interest}
                    </label>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => setFilters({ sex: "", interests: [] })}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

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
