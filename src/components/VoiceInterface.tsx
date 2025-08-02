import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Volume2, Settings, Send, Phone, PhoneOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";
import { useAuth } from "@/hooks/useAuth";

interface VoiceInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTopic?: string | null;
}

export const VoiceInterface = ({ isOpen, onClose, selectedTopic }: VoiceInterfaceProps) => {
  const [textInput, setTextInput] = useState('');
  
  const { user } = useAuth();
  const { 
    startConversation, 
    endConversation, 
    sendMessage, 
    isConnected, 
    isAISpeaking, 
    conversation 
  } = useRealtimeVoice();

  const handleSendMessage = () => {
    const message = textInput.trim();
    if (message) {
      sendMessage(message);
      setTextInput('');
    }
  };

  const handleToggleConnection = () => {
    if (isConnected) {
      endConversation();
    } else {
      startConversation();
    }
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
          {!isConnected && conversation.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <div className="text-center text-muted-foreground">
                <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Click "Start Voice Call" to begin your conversation</p>
              </div>
            </div>
          )}
          
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
          {isAISpeaking && (
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
        <div className="p-6 border-t border-border space-y-4">
          {/* Connection Control */}
          <div className="flex justify-center">
            <Button
              onClick={handleToggleConnection}
              variant={isConnected ? "destructive" : "default"}
              size="lg"
              className="flex items-center space-x-2"
            >
              {isConnected ? <PhoneOff className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
              <span>{isConnected ? "End Voice Call" : "Start Voice Call"}</span>
            </Button>
          </div>

          {isConnected && (
            <>
              {/* Text Input */}
              <div className="flex space-x-2">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={!isConnected}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!textInput.trim() || !isConnected}
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Voice Status */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {isAISpeaking ? "AI is speaking..." : "Speak naturally or type your message"}
                </p>
                <div className="flex justify-center space-x-4 mt-2">
                  <Button variant="outline" size="icon">
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};