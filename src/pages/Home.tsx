import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, BookOpen, BarChart3, Star, CheckCircle, Globe, Users, Zap } from "lucide-react";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Mic className="w-8 h-8 text-primary" />,
      title: "Voice Conversations",
      description: "Practice speaking English with AI-powered voice conversations that adapt to your level"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-primary" />,
      title: "Topic-Based Learning",
      description: "Choose from various conversation topics to practice real-world scenarios"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
      title: "Progress Tracking",
      description: "Monitor your improvement with detailed analytics and vocabulary tracking"
    },
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: "24/7 Availability",
      description: "Practice anytime, anywhere with our always-available AI conversation partner"
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Personalized Experience",
      description: "Get customized feedback and suggestions based on your learning goals"
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "Instant Feedback",
      description: "Receive real-time pronunciation and grammar feedback to improve faster"
    }
  ];

  const benefits = [
    "Build confidence in English conversations",
    "Improve pronunciation and fluency",
    "Learn at your own pace",
    "Practice without judgment",
    "Access anytime, anywhere"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-16">
        {/* Hero Section */}
        <HeroSection onStartConversation={() => navigate("/auth")} />

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Master English
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our AI-powered platform provides comprehensive tools to improve your English speaking skills
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Why Choose FluentlyXd?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Join thousands of learners who have improved their English speaking skills with our innovative AI-powered platform.
                </p>
                
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <span className="text-lg">{benefit}</span>
                    </div>
                  ))}
                </div>

                {!user && (
                  <div className="mt-8">
                    <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>
                      Get Started Today
                    </Button>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
                  <div className="bg-card rounded-xl p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <Mic className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">AI Conversation Partner</div>
                        <div className="text-sm text-muted-foreground">Ready to chat</div>
                      </div>
                    </div>
                    <div className="bg-muted rounded-lg p-4 mb-4">
                      <p className="text-sm">"Hello! I'm excited to help you practice English today. What would you like to talk about?"</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">Rated 5/5 by learners</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="py-20 px-4">
            <div className="container mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Speaking English Confidently?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join our community of learners and start your journey to English fluency today.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-3" onClick={() => navigate("/auth")}>
                Start Free Trial
              </Button>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              FluentlyXd
            </span>
          </div>
          <p className="text-muted-foreground">
            © 2024 FluentlyXd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;