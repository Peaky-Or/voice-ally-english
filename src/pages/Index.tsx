import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { TopicSelector } from "@/components/TopicSelector";
import { VoiceInterface } from "@/components/VoiceInterface";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  const { user, loading } = useAuth();
  const [isVoiceInterfaceOpen, setIsVoiceInterfaceOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleStartConversation = () => {
    setIsVoiceInterfaceOpen(true);
  };

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopic(topicId);
    setIsVoiceInterfaceOpen(true);
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <Dashboard />
        <TopicSelector onSelectTopic={handleSelectTopic} />
      </main>

      <VoiceInterface 
        isOpen={isVoiceInterfaceOpen} 
        onClose={() => setIsVoiceInterfaceOpen(false)}
        selectedTopic={selectedTopic}
      />
    </div>
  );
};

export default Index;
