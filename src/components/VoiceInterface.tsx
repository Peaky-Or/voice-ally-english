import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, Settings, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface VoiceInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTopic?: string | null;
}

export const VoiceInterface = ({ isOpen, onClose, selectedTopic }: VoiceInterfaceProps) => {
  const [conversation, setConversation] = useState([
    { speaker: "AI", message: "Hello! I'm your English companion. What would you like to talk about today?" }
  ]);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { transcript, isListening, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition();
  const { speak, isSpeaking, stopSpeaking } = useTextToSpeech();

  useEffect(() => {
    if (transcript && !isListening) {
      setTextInput(transcript);
    }
  }, [transcript, isListening]);

  const processMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);
    const userMessage = { speaker: "User", message };
    setConversation(prev => [...prev, userMessage]);

    try {
      // Check grammar
      const { data: grammarData } = await supabase.functions.invoke('grammar-check', {
        body: { text: message }
      });

      // Generate AI response
      const aiResponse = `Great! I can see you said "${message}". ${
        grammarData?.grammarScore ? 
          `Your grammar score is ${grammarData.grammarScore}%. ` : ''
      }${
        grammarData?.errors?.length > 0 ? 
          `Here are some suggestions: ${grammarData.errors.join(', ')}. ` : 
          'Your grammar looks good! '
      }Let's continue our conversation.`;

      const aiMessage = { speaker: "AI", message: aiResponse };
      setConversation(prev => [...prev, aiMessage]);

      // Speak the AI response
      await speak(aiResponse);

      // Save conversation if user is logged in
      if (user) {
        await supabase.from('conversations').insert({
          user_id: user.id,
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          transcript: JSON.stringify([userMessage, aiMessage]),
          topic_id: selectedTopic,
          grammar_score: grammarData?.grammarScore || 85,
          grammar_errors: grammarData?.errors || [],
          duration_seconds: 30
        });
      }

    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Error",
        description: "Failed to process your message",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = () => {
    const message = textInput.trim();
    if (message) {
      processMessage(message);
      setTextInput('');
      resetTranscript();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      if (!isSupported) {
        toast({
          title: "Not Supported",
          description: "Speech recognition is not supported in your browser",
          variant: "destructive",
        });
        return;
      }
      startListening();
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

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex justify-center">
              <div className="bg-muted text-muted-foreground p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing your message...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Voice Controls */}
        <div className="p-6 border-t border-border space-y-4">
          {/* Text Input */}
          <div className="flex space-x-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your message or use voice..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isProcessing}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!textInput.trim() || isProcessing}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Voice Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => isSpeaking ? stopSpeaking() : null}
              disabled={!isSpeaking}
            >
              <Volume2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className={`w-16 h-16 rounded-full ${isListening ? 'animate-pulse' : ''}`}
              onClick={toggleListening}
              disabled={isProcessing}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isListening ? "Listening... Speak now" : 
               isProcessing ? "Processing your message..." :
               "Type or speak your message"}
            </p>
            {transcript && (
              <p className="text-xs text-primary mt-1">
                Recognized: "{transcript}"
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};