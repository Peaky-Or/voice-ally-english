import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface UseRealtimeVoiceReturn {
  startConversation: () => Promise<void>;
  endConversation: () => void;
  sendMessage: (text: string) => void;
  isConnected: boolean;
  isAISpeaking: boolean;
  conversation: Array<{ speaker: string; message: string; timestamp: Date }>;
  error: string | null;
}

export const useRealtimeVoice = (): UseRealtimeVoiceReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [conversation, setConversation] = useState<Array<{ speaker: string; message: string; timestamp: Date }>>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Uint8Array[]>([]);
  const isPlayingRef = useRef(false);

  // Initialize audio context
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  }, []);

  // Create WAV header for PCM audio
  const createWavHeader = useCallback((pcmLength: number) => {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 24000, true);
    view.setUint32(28, 48000, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, pcmLength, true);
    
    return new Uint8Array(buffer);
  }, []);

  // Play audio from queue
  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0 || !audioContextRef.current) {
      return;
    }

    isPlayingRef.current = true;
    const audioData = audioQueueRef.current.shift()!;

    try {
      const wavHeader = createWavHeader(audioData.length);
      const wavData = new Uint8Array(wavHeader.length + audioData.length);
      wavData.set(wavHeader, 0);
      wavData.set(audioData, wavHeader.length);

      const audioBuffer = await audioContextRef.current.decodeAudioData(wavData.buffer.slice(0));
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        isPlayingRef.current = false;
        playNextAudio();
      };
      
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      isPlayingRef.current = false;
      playNextAudio();
    }
  }, [createWavHeader]);

  // Add audio to queue
  const addToAudioQueue = useCallback((audioData: Uint8Array) => {
    audioQueueRef.current.push(audioData);
    playNextAudio();
  }, [playNextAudio]);

  // Start WebSocket connection
  const startConversation = useCallback(async () => {
    try {
      await initAudioContext();
      
      const wsUrl = `wss://chdbqxtasxiibgncrhdf.functions.supabase.co/realtime-voice`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        
        // Send session configuration
        wsRef.current?.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are a helpful English conversation partner. Help users practice their English speaking skills. Keep responses conversational and engaging.',
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: { model: 'whisper-1' },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.8
          }
        }));
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received:', data.type);

        switch (data.type) {
          case 'response.audio.delta':
            setIsAISpeaking(true);
            // Convert base64 to Uint8Array
            const binaryString = atob(data.delta);
            const audioBytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              audioBytes[i] = binaryString.charCodeAt(i);
            }
            addToAudioQueue(audioBytes);
            break;

          case 'response.audio.done':
            setIsAISpeaking(false);
            break;

          case 'response.audio_transcript.delta':
            if (data.delta) {
              setConversation(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.speaker === 'AI') {
                  return prev.slice(0, -1).concat({
                    ...lastMessage,
                    message: lastMessage.message + data.delta
                  });
                } else {
                  return prev.concat({
                    speaker: 'AI',
                    message: data.delta,
                    timestamp: new Date()
                  });
                }
              });
            }
            break;

          case 'input_audio_buffer.speech_started':
            console.log('User started speaking');
            break;

          case 'input_audio_buffer.speech_stopped':
            console.log('User stopped speaking');
            break;

          case 'error':
            console.error('WebSocket error:', data);
            setError(data.error?.message || 'Unknown error');
            break;
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
        toast({
          title: "Connection Error",
          description: "Failed to connect to voice service",
          variant: "destructive",
        });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsAISpeaking(false);
      };

    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
      toast({
        title: "Error",
        description: "Failed to start voice conversation",
        variant: "destructive",
      });
    }
  }, [initAudioContext, addToAudioQueue, toast]);

  // End conversation
  const endConversation = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsAISpeaking(false);
    audioQueueRef.current = [];
    isPlayingRef.current = false;
  }, []);

  // Send text message
  const sendMessage = useCallback((text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Not Connected",
        description: "Please start the conversation first",
        variant: "destructive",
      });
      return;
    }

    setConversation(prev => prev.concat({
      speaker: 'User',
      message: text,
      timestamp: new Date()
    }));

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text
        }]
      }
    };

    wsRef.current.send(JSON.stringify(event));
    wsRef.current.send(JSON.stringify({ type: 'response.create' }));
  }, [toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endConversation();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [endConversation]);

  return {
    startConversation,
    endConversation,
    sendMessage,
    isConnected,
    isAISpeaking,
    conversation,
    error
  };
};