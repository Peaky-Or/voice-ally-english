import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Calendar, BookOpen, Mic, Star } from "lucide-react";
import { ConversationHistory } from "./ConversationHistory";
import { VocabularyTracker } from "./VocabularyTracker";

interface Profile {
  id: string;
  username?: string;
  display_name?: string;
  level_score: number;
  streak_days: number;
  total_conversations: number;
}

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  points: number;
  unlocked_at: string;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAchievements();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchAchievements = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("user_id", user.id)
      .order("unlocked_at", { ascending: false });

    if (error) {
      console.error("Error fetching achievements:", error);
    } else {
      setAchievements(data || []);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const levelProgress = profile ? (profile.level_score % 100) : 0;
  const currentLevel = profile ? Math.floor(profile.level_score / 100) + 1 : 1;

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentLevel}</div>
            <Progress value={levelProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {levelProgress}% to next level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.streak_days || 0}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <Mic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.total_conversations || 0}</div>
            <p className="text-xs text-muted-foreground">completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievements.length}</div>
            <p className="text-xs text-muted-foreground">unlocked</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Conversation History</TabsTrigger>
          <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <ConversationHistory />
        </TabsContent>

        <TabsContent value="vocabulary" className="space-y-4">
          <VocabularyTracker />
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      {achievement.achievement_name}
                    </CardTitle>
                    <Badge variant="secondary">+{achievement.points} XP</Badge>
                  </div>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
            {achievements.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No achievements yet. Start practicing to unlock your first achievement!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};