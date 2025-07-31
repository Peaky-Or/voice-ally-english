import { Button } from "@/components/ui/button";
import { Mic, MessageCircle, BookOpen } from "lucide-react";

interface HeroSectionProps {
  onStartConversation: () => void;
}

export const HeroSection = ({ onStartConversation }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-30"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-16 h-16 bg-primary/10 rounded-full animate-float"></div>
      <div className="absolute top-40 right-32 w-12 h-12 bg-accent/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 left-1/4 w-8 h-8 bg-primary/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent leading-tight">
            Your AI English Companion
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-3xl mx-auto">
            Practice speaking English naturally with your personal AI teacher. 
            Get instant feedback, build confidence, and improve fluency through conversation.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-4 h-auto"
              onClick={onStartConversation}
            >
              <Mic className="w-5 h-5" />
              Start Speaking Now
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 h-auto border-2 hover:border-primary"
            >
              <BookOpen className="w-5 h-5" />
              Browse Topics
            </Button>
          </div>
          
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300">
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Natural Conversations</h3>
              <p className="text-muted-foreground">
                Engage in realistic dialogues tailored to your level and interests
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300">
              <Mic className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Voice Recognition</h3>
              <p className="text-muted-foreground">
                Advanced AI listens and responds to your pronunciation in real-time
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:shadow-lg transition-all duration-300">
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Personalized Learning</h3>
              <p className="text-muted-foreground">
                Adaptive lessons that grow with your progress and learning style
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};