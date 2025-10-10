import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Post = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    useless_trait: "",
    tagline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nickname || !formData.useless_trait || !formData.tagline) {
      toast.error("Please fill out all fields!");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("friends")
        .insert([formData]);

      if (error) throw error;

      toast.success("Friend posted! 🎉", {
        description: "Your friend is now ready to be judged by strangers!"
      });

      setTimeout(() => {
        navigate("/swipe");
      }, 1500);
    } catch (error) {
      console.error("Error posting friend:", error);
      toast.error("Oops! Something went wrong 😅");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-white hover:bg-white/10"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Home
        </Button>

        <Card className="shadow-2xl border-4 border-primary/20 bounce-in">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Sparkles className="w-16 h-16 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-4xl font-bold">Roast a Friend</CardTitle>
            <CardDescription className="text-lg mt-2">
              Time to expose your friend's most useless qualities 😈
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-lg font-semibold">
                  Friend's Nickname
                </Label>
                <Input
                  id="nickname"
                  placeholder="e.g., Big Tony, Sleepy Steve..."
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="text-lg h-12 rounded-xl border-2 focus:border-primary"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="useless_trait" className="text-lg font-semibold">
                  Their Most Useless Trait
                </Label>
                <Input
                  id="useless_trait"
                  placeholder="e.g., Can recite every Star Wars quote"
                  value={formData.useless_trait}
                  onChange={(e) => setFormData({ ...formData, useless_trait: e.target.value })}
                  className="text-lg h-12 rounded-xl border-2 focus:border-primary"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline" className="text-lg font-semibold">
                  Funny Tagline / About Them
                </Label>
                <Textarea
                  id="tagline"
                  placeholder="Roast them in one sentence..."
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="text-lg min-h-24 rounded-xl border-2 focus:border-primary resize-none"
                  maxLength={200}
                />
                <p className="text-sm text-muted-foreground text-right">
                  {formData.tagline.length}/200
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-xl py-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg font-bold transform hover:scale-105 transition-all"
              >
                {loading ? "Posting..." : "Post This Friend 🚀"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-white/70 mt-6 text-sm">
          💡 Pro tip: The funnier the roast, the more swipes they'll get!
        </p>
      </div>
    </div>
  );
};

export default Post;
