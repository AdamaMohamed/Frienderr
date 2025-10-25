import { useNavigate } from "react-router-dom";
import { Heart, UserPlus, Sparkles, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-primary p-6 flex items-center justify-center">
      <Card className="max-w-2xl w-full shadow-2xl border-4 border-primary/20 bounce-in">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <Heart className="w-20 h-20 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-5xl font-bold mb-3">Frienderr</CardTitle>
          <CardDescription className="text-xl">
            Rate your friends. Share the chaos. Vote on who needs to touch grass.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {user && (
            <div className="flex items-center justify-between bg-card/50 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <span className="font-medium">{user.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="rounded-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          )}

          {!user && (
            <Button
              size="lg"
              onClick={() => navigate("/auth")}
              className="w-full h-16 text-xl rounded-2xl"
            >
              Login / Sign Up
            </Button>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <Button
              size="lg"
              onClick={() => user ? navigate("/post") : navigate("/auth")}
              className="h-24 text-xl rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg font-bold transform hover:scale-105 transition-all"
            >
              <UserPlus className="mr-3 w-6 h-6" />
              Post a Friend
            </Button>

            <Button
              size="lg"
              onClick={() => navigate("/swipe")}
              className="h-24 text-xl rounded-2xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg font-bold transform hover:scale-105 transition-all"
            >
              <Sparkles className="mr-3 w-6 h-6" />
              Start Swiping
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/matches")}
              className="h-16 text-lg rounded-2xl border-2 border-primary hover:bg-primary/10 font-semibold"
            >
              <Heart className="mr-2 w-5 h-5" />
              Your Matches
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/browse")}
              className="h-16 text-lg rounded-2xl border-2 border-primary hover:bg-primary/10 font-semibold"
            >
              Browse All Friends
            </Button>
          </div>

          <div className="bg-card/50 rounded-xl p-6 space-y-3">
            <h3 className="font-bold text-lg">How it works:</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Post your friends with their annoying traits</li>
              <li>Others vote by swiping left or right</li>
              <li>See who gets the most votes</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
