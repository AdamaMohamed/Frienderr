import { Link } from "react-router-dom";
import { Heart, UserPlus, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Floating emoji decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="float absolute top-10 left-10 text-6xl opacity-20">😂</div>
        <div className="float absolute top-40 right-20 text-5xl opacity-20" style={{ animationDelay: '1s' }}>🤡</div>
        <div className="float absolute bottom-20 left-1/4 text-7xl opacity-20" style={{ animationDelay: '2s' }}>💀</div>
        <div className="float absolute bottom-40 right-1/3 text-5xl opacity-20" style={{ animationDelay: '0.5s' }}>🔥</div>
      </div>

      <main className="relative z-10 max-w-2xl w-full text-center bounce-in">
        {/* Logo/Header */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Flame className="w-12 h-12 text-accent animate-pulse" />
            <h1 className="text-7xl font-bold text-white tracking-tight">
              Friendder
            </h1>
            <Heart className="w-12 h-12 text-destructive animate-pulse" />
          </div>
          <p className="text-2xl text-white/90 font-semibold">
            Like Tinder, but for roasting your friends
          </p>
        </div>

        {/* Description Card */}
        <div className="bg-card rounded-3xl p-8 shadow-2xl mb-8 transform hover:scale-105 transition-transform">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            How it works (it's dumb)
          </h2>
          <div className="space-y-4 text-left text-lg text-muted-foreground">
            <p className="flex items-start gap-3">
              <span className="text-3xl">1️⃣</span>
              <span>Post your friend's most useless trait and a roast-worthy tagline</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-3xl">2️⃣</span>
              <span>Others swipe right to "keep" them or left to "cross them off"</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="text-3xl">3️⃣</span>
              <span>Watch the votes roll in and see who's loved (or not)</span>
            </p>
          </div>
          <div className="mt-6 p-4 bg-accent/10 rounded-xl border-2 border-accent">
            <p className="text-sm font-semibold text-foreground">
              ⚠️ Disclaimer: This is all for laughs. Don't be a jerk. We're just having fun here! 😄
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/swipe">
            <Button 
              size="lg" 
              className="text-xl px-8 py-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold w-full sm:w-auto"
            >
              Start Swiping 👉
            </Button>
          </Link>
          <Link to="/post">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-xl px-8 py-6 rounded-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-bold w-full sm:w-auto"
            >
              <UserPlus className="mr-2 w-6 h-6" />
              Roast a Friend
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-12">
          <Link to="/browse">
            <Button 
              variant="ghost" 
              className="text-white/80 hover:text-white hover:bg-white/10 text-lg font-semibold"
            >
              Browse All Friends →
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
