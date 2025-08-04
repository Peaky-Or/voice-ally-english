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

  // Enhanced response generation with better context awareness
  const generateSimpleResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();
    
    // Greeting responses
    if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
      return "Hello! I'm excited to help you practice English today. What would you like to talk about?";
    }
    
    // Help and practice requests
    if (lowerText.includes('help') || lowerText.includes('practice')) {
      return "I'm here to help you practice your English speaking skills. Just speak naturally and I'll respond!";
    }
    
    // Goodbye responses
    if (lowerText.includes('bye') || lowerText.includes('goodbye') || lowerText.includes('see you')) {
      return "Goodbye! It was great practicing English with you today. Keep up the good work!";
    }
    
    // Question responses
    if (lowerText.includes('how are you') || lowerText.includes('how do you')) {
      return "I'm doing well, thank you for asking! How are you feeling about your English practice today?";
    }
    
    // Weather related
    if (lowerText.includes('weather') || lowerText.includes('sunny') || lowerText.includes('rain')) {
      return "Weather is a great topic for conversation! Can you describe the weather where you are right now?";
    }
    
    // Food related
    if (lowerText.includes('food') || lowerText.includes('eat') || lowerText.includes('hungry')) {
      return "Food is one of my favorite topics! What's your favorite dish? Can you describe it to me?";
    }
    
    // Hobbies and interests
    if (lowerText.includes('hobby') || lowerText.includes('like') || lowerText.includes('enjoy')) {
      return "That sounds interesting! Tell me more about what you enjoy doing in your free time.";
    }
    
    // Work or study
    if (lowerText.includes('work') || lowerText.includes('job') || lowerText.includes('study') || lowerText.includes('school')) {
      return "Work and studies are important parts of life. What do you do? I'd love to hear more about it.";
    }
    
    // Family
    if (lowerText.includes('family') || lowerText.includes('mother') || lowerText.includes('father') || lowerText.includes('sister') || lowerText.includes('brother')) {
      return "Family is very important. Can you tell me a bit about your family?";
    }
    
    // Travel
    if (lowerText.includes('travel') || lowerText.includes('country') || lowerText.includes('city') || lowerText.includes('visit')) {
      return "Travel is such an exciting topic! Have you been to any interesting places recently?";
    }
    
    // Learning English
    if (lowerText.includes('english') || lowerText.includes('language') || lowerText.includes('learn')) {
      return "Learning English is a wonderful journey! What aspect of English would you like to practice most?";
    }
    
    // Default encouraging responses
    const encouragingResponses = [
      `You mentioned "${userText}". That's a great topic! Can you tell me more about that?`,
      "I can hear you're getting more confident with your English. Keep going!",
      "That's interesting! What made you think about that topic?",
      "Great! Your pronunciation is improving. Can you expand on that idea?",
      "I'm following along. What else would you like to share about this?",
      "Excellent! Let's keep the conversation going. What's your opinion on this?",
      "That's a good point. How do you feel about it personally?",
      "Wonderful! You're expressing yourself very well. Continue, please.",
    ];
    
    return encouragingResponses[Math.floor(Math.random() * encouragingResponses.length)];
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
      // Simple AI response generation (you can replace this with Hugging Face API)
      const aiResponse = generateSimpleResponse(text);
      
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
  }, [generateSimpleResponse, speakText, toast]);

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
      
      // Try to restart after error (except for certain fatal errors)
      if (event.error !== 'not-allowed' && event.error !== 'service-not-allowed') {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.error('Could not restart recognition:', e);
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended');
      
      // Restart recognition if still connected and not currently speaking
      setTimeout(() => {
        if (recognitionRef.current && isConnected && !isAISpeaking) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Could not restart recognition:', e);
          }
        }
      }, 500);
    };

    return recognition;
  }, [handleUserMessage, isConnected, isAISpeaking]);

  // Start conversation
  const startConversation = useCallback(async () => {
    try {
      setError(null);
      
      // Initialize speech synthesis
      synthesisRef.current = window.speechSynthesis;
      
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
      
      // Start listening after greeting
      setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Could not start recognition:', e);
          }
        }
      }, 1500);

      toast({
        title: "Voice Chat Started",
        description: "Speak naturally to practice English!",
      });
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
      toast({
        title: "Error",
        description: "Failed to start voice conversation. Please check your browser permissions.",
        variant: "destructive",
      });
    }
  }, [initSpeechRecognition, isConnected, speakText, toast]);

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