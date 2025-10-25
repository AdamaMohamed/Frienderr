import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const Post = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [formData, setFormData] = useState({
    nickname: "",
    useless_trait: "",
    tagline: "",
    discord_username: "",
    interests: [] as string[],
    why_not_want: "",
    sex: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nickname || !formData.useless_trait || !formData.tagline || !formData.sex) {
      toast.error("Fill in the required fields");
      return;
    }

    setLoading(true);

    try {
      let photoUrl = "";

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from('friend-photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('friend-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      const { error } = await supabase
        .from("friends")
        .insert([{
          nickname: formData.nickname,
          useless_trait: formData.useless_trait,
          tagline: formData.tagline,
          discord_username: formData.discord_username,
          interests: formData.interests.join(", "),
          why_not_want: formData.why_not_want,
          sex: formData.sex,
          photo_url: photoUrl,
          user_id: user.id,
        }]);

      if (error) throw error;

      toast.success("Friend posted", {
        description: "Ready for judgment"
      });

      setTimeout(() => {
        navigate("/swipe");
      }, 1500);
    } catch (error) {
      console.error("Error posting friend:", error);
      toast.error("Something went wrong");
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
            <CardTitle className="text-4xl font-bold">Post a Friend</CardTitle>
            <CardDescription className="text-lg mt-2">
              Share your friend and let others vote
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="photo" className="text-base font-semibold">
                  Photo (optional)
                </Label>
                <div className="flex items-center gap-4">
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-xl object-cover border-2 border-primary"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 rounded-full w-6 h-6 p-0"
                        onClick={() => {
                          setPhotoFile(null);
                          setPhotoPreview("");
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-primary/50 hover:border-primary cursor-pointer flex items-center justify-center transition-colors">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-base font-semibold">
                  Nickname *
                </Label>
                <Input
                  id="nickname"
                  placeholder="Big Tony, Sleepy Steve"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="h-11 rounded-xl border-2 focus:border-primary"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discord_username" className="text-base font-semibold">
                  Discord Username
                </Label>
                <Input
                  id="discord_username"
                  placeholder="username#1234"
                  value={formData.discord_username}
                  onChange={(e) => setFormData({ ...formData, discord_username: e.target.value })}
                  className="h-11 rounded-xl border-2 focus:border-primary"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="useless_trait" className="text-base font-semibold">
                  Most Useless Trait *
                </Label>
                <select
                  id="useless_trait"
                  value={formData.useless_trait}
                  onChange={(e) => setFormData({ ...formData, useless_trait: e.target.value })}
                  className="w-full h-11 rounded-xl border-2 border-input bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">Select a trait</option>
                  <option value="Can recite every Star Wars quote">Can recite every Star Wars quote</option>
                  <option value="Always late to everything">Always late to everything</option>
                  <option value="Obsessed with zodiac signs">Obsessed with zodiac signs</option>
                  <option value="Corrects grammar constantly">Corrects grammar constantly</option>
                  <option value="Talks in movie quotes">Talks in movie quotes</option>
                  <option value="Never stops talking about crypto">Never stops talking about crypto</option>
                  <option value="Makes everything a competition">Makes everything a competition</option>
                  <option value="Posts food pics every meal">Posts food pics every meal</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sex" className="text-base font-semibold">
                  Gender *
                </Label>
                <select
                  id="sex"
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full h-11 rounded-xl border-2 border-input bg-background px-3 py-2 focus:border-primary focus:outline-none"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">
                  Interests (Select all that apply)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Gaming", "Anime", "Movies", "Music", "Sports", "Reading", "Coding", "Art", "Travel", "Food"].map((interest) => (
                    <label key={interest} className="flex items-center gap-2 p-2 rounded-lg border-2 border-input hover:border-primary cursor-pointer transition-colors bg-background">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, interests: [...formData.interests, interest] });
                          } else {
                            setFormData({ ...formData, interests: formData.interests.filter(i => i !== interest) });
                          }
                        }}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline" className="text-base font-semibold">
                  About Them *
                </Label>
                <Textarea
                  id="tagline"
                  placeholder="Write something funny about them"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="min-h-20 rounded-xl border-2 focus:border-primary resize-none"
                  maxLength={200}
                />
                <p className="text-sm text-muted-foreground text-right">
                  {formData.tagline.length}/200
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="why_not_want" className="text-base font-semibold">
                  Why You're Tired of Them
                </Label>
                <Textarea
                  id="why_not_want"
                  placeholder="Be honest but funny"
                  value={formData.why_not_want}
                  onChange={(e) => setFormData({ ...formData, why_not_want: e.target.value })}
                  className="min-h-20 rounded-xl border-2 focus:border-primary resize-none"
                  maxLength={200}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-lg py-5 rounded-full font-bold transform hover:scale-105 transition-all"
              >
                {loading ? "Posting..." : "Post Friend"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-white/70 mt-6 text-sm">
          The funnier, the better
        </p>
      </div>
    </div>
  );
};

export default Post;
