import { useState, useRef, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';

interface UseLocalAIReturn {
  generateResponse: (message: string, conversationHistory: Array<{ speaker: string; message: string }>) => Promise<string>;
  isLoading: boolean;
  isInitialized: boolean;
  initializeModel: () => Promise<void>;
}

export const useLocalAI = (): UseLocalAIReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const pipelineRef = useRef<any>(null);

  const initializeModel = useCallback(async () => {
    if (pipelineRef.current) return;
    
    setIsLoading(true);
    try {
      console.log('Loading AI model...');
      // Use a lightweight conversational model
      pipelineRef.current = await pipeline(
        'text-generation',
        'microsoft/DialoGPT-small',
        { device: 'webgpu' }
      );
      setIsInitialized(true);
      console.log('AI model loaded successfully!');
    } catch (error) {
      console.error('Failed to load AI model:', error);
      // Fallback to a simpler model
      try {
        pipelineRef.current = await pipeline(
          'text-generation',
          'gpt2',
          { device: 'wasm' }
        );
        setIsInitialized(true);
        console.log('Fallback AI model loaded!');
      } catch (fallbackError) {
        console.error('Failed to load fallback model:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateResponse = useCallback(async (
    message: string, 
    conversationHistory: Array<{ speaker: string; message: string }>
  ): Promise<string> => {
    if (!pipelineRef.current) {
      throw new Error('AI model not initialized');
    }

    setIsLoading(true);
    try {
      // Build conversation context
      const recentHistory = conversationHistory.slice(-6); // Last 3 exchanges
      let conversationText = '';
      
      // Add conversation history
      recentHistory.forEach(item => {
        if (item.speaker === 'User') {
          conversationText += `Human: ${item.message}\n`;
        } else {
          conversationText += `Assistant: ${item.message}\n`;
        }
      });
      
      // Add current message
      conversationText += `Human: ${message}\nAssistant:`;

      // Generate response
      const response = await pipelineRef.current(conversationText, {
        max_new_tokens: 50,
        temperature: 0.8,
        do_sample: true,
        pad_token_id: 50256,
        eos_token_id: 50256,
      });

      // Extract the generated text
      let generatedText = response[0].generated_text;
      
      // Clean up the response
      const assistantResponse = generatedText
        .split('Assistant:')
        .pop()
        ?.split('\n')[0]
        ?.split('Human:')[0]
        ?.trim() || '';

      // Fallback responses if generation fails
      if (!assistantResponse || assistantResponse.length < 3) {
        const fallbackResponses = [
          "That's interesting! Tell me more about that.",
          "I'd love to hear your thoughts on this topic.",
          "Can you share more details about that?",
          "What do you think about this?",
          "That sounds fascinating! Please continue.",
          "I'm following along. What happened next?",
        ];
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      }

      return assistantResponse;
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Intelligent fallback based on message content
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! I'm excited to chat with you today. What's on your mind?";
      }
      
      if (lowerMessage.includes('how are you')) {
        return "I'm doing well, thank you! How are you doing today?";
      }
      
      if (lowerMessage.includes('weather')) {
        return "Weather is always a great conversation starter! What's the weather like where you are?";
      }
      
      if (lowerMessage.includes('food') || lowerMessage.includes('eat')) {
        return "Food is such a wonderful topic! What's your favorite cuisine?";
      }
      
      // Generic encouraging responses
      const genericResponses = [
        "That's really interesting! Can you tell me more?",
        "I'm enjoying our conversation. What else would you like to share?",
        "Your English is improving! Please continue with your thoughts.",
        "That's a great point. How do you feel about it personally?",
        "I'd love to hear more about your perspective on this.",
      ];
      
      return genericResponses[Math.floor(Math.random() * genericResponses.length)];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateResponse,
    isLoading,
    isInitialized,
    initializeModel,
  };
};