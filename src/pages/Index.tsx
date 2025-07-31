import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { TopicSelector } from "@/components/TopicSelector";
import { VoiceInterface } from "@/components/VoiceInterface";

const Index = () => {
  const [isVoiceInterfaceOpen, setIsVoiceInterfaceOpen] = useState(false);

  const handleStartConversation = () => {
    setIsVoiceInterfaceOpen(true);
  };

  const handleSelectTopic = (topicId: string) => {
    console.log("Selected topic:", topicId);
    setIsVoiceInterfaceOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <HeroSection onStartConversation={handleStartConversation} />
        <TopicSelector onSelectTopic={handleSelectTopic} />
      </main>

      <VoiceInterface 
        isOpen={isVoiceInterfaceOpen} 
        onClose={() => setIsVoiceInterfaceOpen(false)} 
      />
    </div>
  );
};

export default Index;
