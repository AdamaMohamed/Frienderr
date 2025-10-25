import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Match {
  id: string;
  nickname: string;
  photo_url?: string;
  discord_username?: string;
  interests?: string;
  tagline: string;
}

const Matches = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      fetchMatches();
    }
  }, [user, authLoading]);

  const fetchMatches = async () => {
    try {
      // Get friends I posted
      const { data: myFriends, error: myFriendsError } = await supabase
        .from("friends")
        .select("id")
        .eq("user_id", user!.id);

      if (myFriendsError) throw myFriendsError;

      if (!myFriends || myFriends.length === 0) {
        setLoading(false);
        return;
      }

      const myFriendIds = myFriends.map(f => f.id);

      // Get people who swiped keep on my friends
      const { data: swipesOnMyFriends, error: swipesError } = await supabase
        .from("swipes")
        .select("user_id, friend_id")
        .in("friend_id", myFriendIds)
        .eq("vote_type", "keep");

      if (swipesError) throw swipesError;

      if (!swipesOnMyFriends || swipesOnMyFriends.length === 0) {
        setLoading(false);
        return;
      }

      // Get my swipes
      const { data: mySwipes, error: mySwipesError } = await supabase
        .from("swipes")
        .select("friend_id")
        .eq("user_id", user!.id)
        .eq("vote_type", "keep");

      if (mySwipesError) throw mySwipesError;

      const mySwipedFriendIds = mySwipes?.map(s => s.friend_id) || [];

      // Find mutual matches
      const mutualUserIds = new Set<string>();
      
      for (const swipe of swipesOnMyFriends) {
        // Get friends posted by this user
        const { data: theirFriends } = await supabase
          .from("friends")
          .select("id")
          .eq("user_id", swipe.user_id);

        if (theirFriends) {
          const theirFriendIds = theirFriends.map(f => f.id);
          // Check if I swiped keep on any of their friends
          const hasMatch = theirFriendIds.some(id => mySwipedFriendIds.includes(id));
          if (hasMatch) {
            mutualUserIds.add(swipe.user_id);
          }
        }
      }

      // Fetch the actual friend profiles of matched users
      if (mutualUserIds.size > 0) {
        const { data: matchedFriends, error: matchError } = await supabase
          .from("friends")
          .select("*")
          .in("user_id", Array.from(mutualUserIds));

        if (matchError) throw matchError;

        setMatches(matchedFriends || []);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      toast.error("Couldn't load matches");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-4xl text-white font-bold animate-pulse">Loading matches...</div>
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
          <h1 className="text-4xl font-bold text-white">Your Matches</h1>
          <div className="w-24" />
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">💔</div>
            <h2 className="text-3xl font-bold text-white mb-4">No Matches Yet</h2>
            <p className="text-xl text-white/80 mb-8">Start swiping to find mutual connections</p>
            <Button
              onClick={() => navigate("/swipe")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-xl rounded-full font-bold"
            >
              Start Swiping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <Card 
                key={match.id} 
                className="shadow-xl border-2 border-primary/20 hover:shadow-2xl transition-all hover:scale-105 bounce-in bg-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  {match.photo_url && (
                    <img
                      src={match.photo_url}
                      alt={match.nickname}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                  )}
                  <h3 className="text-3xl font-bold mb-3 text-foreground text-center">
                    {match.nickname}
                  </h3>
                  <div className="h-1 w-16 bg-primary mx-auto rounded-full mb-4" />
                  
                  <div className="space-y-3 mb-4">
                    <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                      <p className="text-base italic text-foreground">
                        "{match.tagline}"
                      </p>
                    </div>

                    {match.discord_username && (
                      <div className="bg-success/10 p-4 rounded-xl border border-success/20">
                        <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">
                          Discord
                        </p>
                        <p className="text-lg font-semibold text-foreground">
                          {match.discord_username}
                        </p>
                      </div>
                    )}

                    {match.interests && (
                      <div className="bg-muted/50 p-4 rounded-xl">
                        <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">
                          Interests
                        </p>
                        <p className="text-sm text-foreground">
                          {match.interests}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-success">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-bold">Mutual Match</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Matches;
