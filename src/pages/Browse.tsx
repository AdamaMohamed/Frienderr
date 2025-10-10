import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Friend {
  id: string;
  nickname: string;
  useless_trait: string;
  tagline: string;
  keeps_count: number;
  cross_offs_count: number;
}

const Browse = () => {
  const navigate = useNavigate();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

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
      toast.error("Couldn't load friends 😢");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-4xl text-white font-bold animate-pulse">Loading friends...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-white">All Friends</h1>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🤷</div>
            <h2 className="text-3xl font-bold text-white mb-4">No Friends Yet!</h2>
            <p className="text-xl text-white/80 mb-8">Be the first to roast someone</p>
            <Button
              onClick={() => navigate("/post")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-xl rounded-full font-bold"
            >
              Post a Friend
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friend, index) => {
              const totalVotes = friend.keeps_count + friend.cross_offs_count;
              const keepPercentage = totalVotes > 0 
                ? Math.round((friend.keeps_count / totalVotes) * 100) 
                : 50;

              return (
                <Card 
                  key={friend.id} 
                  className="shadow-xl border-2 border-primary/20 hover:shadow-2xl transition-all hover:scale-105 bounce-in bg-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <h3 className="text-3xl font-bold mb-3 text-foreground text-center">
                      {friend.nickname}
                    </h3>
                    <div className="h-1 w-16 bg-primary mx-auto rounded-full mb-4" />
                    
                    <div className="space-y-4 mb-6">
                      <div className="bg-muted/50 p-4 rounded-xl">
                        <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">
                          Useless Trait
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {friend.useless_trait}
                        </p>
                      </div>

                      <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                        <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">
                          About
                        </p>
                        <p className="text-base italic text-foreground">
                          "{friend.tagline}"
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Keep Rate
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {keepPercentage}%
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1 bg-success/20 p-2 rounded-lg border border-success/30 flex items-center justify-center gap-2">
                          <Heart className="w-4 h-4 text-success" />
                          <span className="text-lg font-bold text-success">
                            {friend.keeps_count}
                          </span>
                        </div>
                        <div className="flex-1 bg-destructive/20 p-2 rounded-lg border border-destructive/30 flex items-center justify-center gap-2">
                          <X className="w-4 h-4 text-destructive" />
                          <span className="text-lg font-bold text-destructive">
                            {friend.cross_offs_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
