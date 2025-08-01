import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Star, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface VocabularyWord {
  id: string;
  word: string;
  definition?: string;
  example_sentence?: string;
  difficulty_level: number;
  mastery_level: number;
  times_practiced: number;
  last_practiced_at?: string;
  created_at: string;
}

export const VocabularyTracker = () => {
  const { user } = useAuth();
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWord, setNewWord] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newExample, setNewExample] = useState("");
  const [isAddingWord, setIsAddingWord] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchVocabulary();
    }
  }, [user]);

  const fetchVocabulary = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("vocabulary")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching vocabulary:", error);
      toast({
        title: "Error",
        description: "Failed to load vocabulary",
        variant: "destructive",
      });
    } else {
      setVocabulary(data || []);
    }
    setLoading(false);
  };

  const addWord = async () => {
    if (!user || !newWord.trim()) return;

    setIsAddingWord(true);
    const { data, error } = await supabase
      .from("vocabulary")
      .insert({
        user_id: user.id,
        word: newWord.trim(),
        definition: newDefinition.trim() || null,
        example_sentence: newExample.trim() || null,
        difficulty_level: 1,
        mastery_level: 0,
        times_practiced: 0,
      })
      .select()
      .single();

    setIsAddingWord(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message.includes("duplicate") 
          ? "This word is already in your vocabulary" 
          : "Failed to add word",
        variant: "destructive",
      });
    } else {
      setVocabulary(prev => [data, ...prev]);
      setNewWord("");
      setNewDefinition("");
      setNewExample("");
      toast({
        title: "Success",
        description: "Word added to your vocabulary!",
      });
    }
  };

  const deleteWord = async (id: string) => {
    const { error } = await supabase
      .from("vocabulary")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete word",
        variant: "destructive",
      });
    } else {
      setVocabulary(prev => prev.filter(word => word.id !== id));
      toast({
        title: "Success",
        description: "Word removed from vocabulary",
      });
    }
  };

  const practiceWord = async (wordId: string) => {
    const { error } = await supabase
      .from("vocabulary")
      .update({
        times_practiced: vocabulary.find(w => w.id === wordId)!.times_practiced + 1,
        mastery_level: Math.min(vocabulary.find(w => w.id === wordId)!.mastery_level + 10, 100),
        last_practiced_at: new Date().toISOString(),
      })
      .eq("id", wordId)
      .eq("user_id", user?.id);

    if (!error) {
      setVocabulary(prev => prev.map(word => 
        word.id === wordId 
          ? { 
              ...word, 
              times_practiced: word.times_practiced + 1,
              mastery_level: Math.min(word.mastery_level + 10, 100),
              last_practiced_at: new Date().toISOString()
            }
          : word
      ));
    }
  };

  const getMasteryColor = (level: number) => {
    if (level >= 80) return "default";
    if (level >= 50) return "secondary";
    return "outline";
  };

  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < level ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  if (loading) {
    return <div className="p-4">Loading vocabulary...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Your Vocabulary ({vocabulary.length} words)
          </CardTitle>
          <CardDescription>
            Track and practice the words you're learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add New Word
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Word</DialogTitle>
                <DialogDescription>
                  Add a new word to your vocabulary collection
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="word">Word</Label>
                  <Input
                    id="word"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="Enter the word"
                  />
                </div>
                <div>
                  <Label htmlFor="definition">Definition (optional)</Label>
                  <Textarea
                    id="definition"
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    placeholder="What does this word mean?"
                  />
                </div>
                <div>
                  <Label htmlFor="example">Example Sentence (optional)</Label>
                  <Textarea
                    id="example"
                    value={newExample}
                    onChange={(e) => setNewExample(e.target.value)}
                    placeholder="Use the word in a sentence"
                  />
                </div>
                <Button 
                  onClick={addWord} 
                  disabled={isAddingWord || !newWord.trim()}
                  className="w-full"
                >
                  {isAddingWord ? "Adding..." : "Add Word"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {vocabulary.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No words in your vocabulary yet. Add some words to start learning!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vocabulary.map((word) => (
            <Card key={word.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{word.word}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">{getDifficultyStars(word.difficulty_level)}</div>
                      <Badge variant={getMasteryColor(word.mastery_level)}>
                        {word.mastery_level}% mastered
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteWord(word.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {word.definition && (
                  <div>
                    <p className="text-sm font-medium">Definition:</p>
                    <p className="text-sm text-muted-foreground">{word.definition}</p>
                  </div>
                )}
                
                {word.example_sentence && (
                  <div>
                    <p className="text-sm font-medium">Example:</p>
                    <p className="text-sm text-muted-foreground italic">"{word.example_sentence}"</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Mastery Progress</span>
                    <span>{word.mastery_level}/100</span>
                  </div>
                  <Progress value={word.mastery_level} className="h-2" />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Practiced {word.times_practiced} times
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => practiceWord(word.id)}
                  >
                    Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};