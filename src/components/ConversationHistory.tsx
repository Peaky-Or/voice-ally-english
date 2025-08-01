import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Play, Calendar, Clock, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  topic_id: string;
  duration_seconds: number;
  grammar_score?: number;
  vocabulary_score?: number;
  pronunciation_score?: number;
  audio_url?: string;
  transcript?: string;
  grammar_errors: any;
  created_at: string;
}

export const ConversationHistory = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation history",
        variant: "destructive",
      });
    } else {
      setConversations(data || []);
    }
    setLoading(false);
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    } else {
      setConversations(prev => prev.filter(conv => conv.id !== id));
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      });
    }
  };

  const playAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(err => {
        toast({
          title: "Error",
          description: "Failed to play audio recording",
          variant: "destructive",
        });
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "secondary";
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return <div className="p-4">Loading conversations...</div>;
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No conversations yet. Start practicing to see your progress!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <Card key={conversation.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{conversation.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(conversation.duration_seconds)}
                  </span>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {conversation.audio_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => playAudio(conversation.audio_url!)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteConversation(conversation.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {conversation.grammar_score !== null && (
                <Badge variant={getScoreColor(conversation.grammar_score)}>
                  Grammar: {conversation.grammar_score}%
                </Badge>
              )}
              {conversation.vocabulary_score !== null && (
                <Badge variant={getScoreColor(conversation.vocabulary_score)}>
                  Vocabulary: {conversation.vocabulary_score}%
                </Badge>
              )}
              {conversation.pronunciation_score !== null && (
                <Badge variant={getScoreColor(conversation.pronunciation_score)}>
                  Pronunciation: {conversation.pronunciation_score}%
                </Badge>
              )}
            </div>

            {conversation.grammar_errors.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Grammar Improvements:</h4>
                <div className="space-y-1">
                  {conversation.grammar_errors.map((error: any, index: number) => (
                    <div key={index} className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      <span className="font-medium text-destructive">{error.incorrect}</span>
                      {" → "}
                      <span className="font-medium text-green-600">{error.correct}</span>
                      {error.explanation && (
                        <p className="text-xs mt-1">{error.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {conversation.transcript && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Transcript:</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {conversation.transcript}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};