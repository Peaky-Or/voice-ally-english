import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Settings } from "lucide-react";

interface VoiceInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTopic?: string | null;
}

export const VoiceInterface = ({ isOpen, onClose, selectedTopic }: VoiceInterfaceProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState([
    { speaker: "AI", message: "Hello! I'm your English companion. What would you like to talk about today?" }
  ]);

  const toggleListening = () => {
    setIsListening(!isListening);
    // TODO: Implement actual voice recognition
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Voice Conversation</h2>
            <p className="text-muted-foreground">Practice your English speaking skills</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* Conversation Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {conversation.map((item, index) => (
            <div 
              key={index} 
              className={`flex ${item.speaker === 'User' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-lg ${
                  item.speaker === 'User' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground'
                }`}
              >
                <div className="text-sm font-medium mb-1">{item.speaker}</div>
                <div>{item.message}</div>
              </div>
            </div>
          ))}
          
          {/* AI Speaking Indicator */}
          {isSpeaking && (
            <div className="flex justify-start">
              <div className="bg-accent text-accent-foreground p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4" />
                  <span>AI is speaking...</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Voice Controls */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-center space-x-4">
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            
            <Button
              variant={isListening ? "voice" : "default"}
              size="lg"
              className={`w-16 h-16 rounded-full ${isListening ? 'animate-pulse-glow' : ''}`}
              onClick={toggleListening}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            
            <Button variant="outline" size="icon">
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-muted-foreground">
              {isListening ? "Listening... Speak now" : "Click the microphone to start speaking"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};