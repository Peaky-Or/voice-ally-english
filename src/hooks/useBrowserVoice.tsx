import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface UseBrowserVoiceReturn {
  startConversation: () => Promise<void>;
  endConversation: () => void;
  sendMessage: (text: string) => void;
  isConnected: boolean;
  isListening: boolean;
  isAISpeaking: boolean;
  conversation: Array<{ speaker: string; message: string; timestamp: Date }>;
  error: string | null;
}

export const useBrowserVoice = (): UseBrowserVoiceReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [conversation, setConversation] = useState<Array<{ speaker: string; message: string; timestamp: Date }>>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  // Generate AI response using OpenAI API
  const generateAIResponse = async (userText: string, conversationHistory: Array<{ speaker: string; message: string; timestamp: Date }>): Promise<string> => {
    try {
      const response = await fetch('https://chdbqxtasxiibgncrhdf.supabase.co/functions/v1/chat-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          conversationHistory: conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to simple response
      return "I'm having trouble connecting right now. Can you try saying that again?";
    }
  };

  // Text-to-speech using browser API
  const speakText = useCallback(async (text: string) => {
    if (!synthesisRef.current) {
      synthesisRef.current = window.speechSynthesis;
    }

    return new Promise<void>((resolve) => {
      // Cancel any ongoing speech
      synthesisRef.current?.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Try to use a female voice
      const voices = synthesisRef.current?.getVoices() || [];
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('susan')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => {
        setIsAISpeaking(true);
      };

      utterance.onend = () => {
        setIsAISpeaking(false);
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsAISpeaking(false);
        resolve();
      };

      synthesisRef.current?.speak(utterance);
    });
  }, []);

  // Handle user message and generate AI response
  const handleUserMessage = useCallback(async (text: string) => {
    // Add user message to conversation
    setConversation(prev => [...prev, {
      speaker: 'User',
      message: text,
      timestamp: new Date()
    }]);

    try {
      // Generate real AI response using OpenAI
      const aiResponse = await generateAIResponse(text, conversation);
      
      // Add AI response to conversation
      setConversation(prev => [...prev, {
        speaker: 'AI',
        message: aiResponse,
        timestamp: new Date()
      }]);

      // Speak the AI response
      await speakText(aiResponse);
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI response",
        variant: "destructive",
      });
    }
  }, [speakText, toast, conversation]);

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported in this browser');
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript.trim();
      
      if (text) {
        console.log('Speech recognized:', text);
        handleUserMessage(text);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      
      // Show user-friendly error messages
      if (event.error === 'not-allowed') {
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access in your browser settings",
          variant: "destructive",
        });
      } else if (event.error === 'network') {
        toast({
          title: "Network Error",
          description: "Voice recognition requires a stable internet connection",
          variant: "destructive",
        });
      } else if (event.error === 'no-speech') {
        // Don't show error for no-speech, just restart
        setTimeout(() => {
          if (isConnected && !isAISpeaking) {
            try {
              recognition.start();
            } catch (e) {
              console.error('Could not restart recognition:', e);
            }
          }
        }, 1000);
        return;
      }
      
      // Try to restart after other errors
      if (event.error !== 'not-allowed' && event.error !== 'service-not-allowed') {
        setTimeout(() => {
          if (isConnected && !isAISpeaking) {
            try {
              recognition.start();
            } catch (e) {
              console.error('Could not restart recognition:', e);
            }
          }
        }, 2000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended');
      
      // Restart recognition if still connected and not currently speaking
      setTimeout(() => {
        if (isConnected && !isAISpeaking) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Could not restart recognition:', e);
          }
        }
      }, 500);
    };

    return recognition;
  }, [handleUserMessage]);

  // Start conversation
  const startConversation = useCallback(async () => {
    try {
      setError(null);
      
      // Check for microphone permission first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (permissionError) {
        toast({
          title: "Microphone Permission Required",
          description: "Please allow microphone access to use voice features",
          variant: "destructive",
        });
        return;
      }
      
      // Initialize speech synthesis
      synthesisRef.current = window.speechSynthesis;
      
      // Wait for voices to load
      if (synthesisRef.current.getVoices().length === 0) {
        await new Promise(resolve => {
          synthesisRef.current!.onvoiceschanged = () => resolve(undefined);
        });
      }
      
      // Initialize speech recognition
      recognitionRef.current = initSpeechRecognition();
      
      setIsConnected(true);
      
      // Start with a greeting
      const greeting = "Hello! I'm your English conversation partner. Start speaking and I'll help you practice!";
      setConversation([{
        speaker: 'AI',
        message: greeting,
        timestamp: new Date()
      }]);
      
      await speakText(greeting);
      
      // Start listening after greeting with better error handling
      setTimeout(() => {
        if (recognitionRef.current && isConnected) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Could not start recognition:', e);
            toast({
              title: "Voice Recognition Error",
              description: "Try refreshing the page or check your microphone settings",
              variant: "destructive",
            });
          }
        }
      }, 2000);

      toast({
        title: "Voice Chat Started",
        description: "Speak naturally to practice English!",
      });
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
      toast({
        title: "Error",
        description: "Failed to start voice conversation. Please check your browser permissions and try again.",
        variant: "destructive",
      });
    }
  }, [initSpeechRecognition, speakText, toast]);

  // End conversation
  const endConversation = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    
    setIsConnected(false);
    setIsListening(false);
    setIsAISpeaking(false);
    setError(null);
  }, []);

  // Send text message
  const sendMessage = useCallback((text: string) => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please start the conversation first",
        variant: "destructive",
      });
      return;
    }

    handleUserMessage(text);
  }, [isConnected, handleUserMessage, toast]);

  return {
    startConversation,
    endConversation,
    sendMessage,
    isConnected,
    isListening,
    isAISpeaking,
    conversation,
    error
  };
};