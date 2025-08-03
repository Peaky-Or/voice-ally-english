import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { TopicSelector } from "@/components/TopicSelector";
import { VoiceInterface } from "@/components/VoiceInterface";
import { Dashboard as DashboardComponent } from "@/components/Dashboard";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isVoiceInterfaceOpen, setIsVoiceInterfaceOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

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
      
      <main className="pt-16">
        <DashboardComponent />
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

export default Dashboard;