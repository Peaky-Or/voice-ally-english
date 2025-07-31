import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Briefcase, Coffee, Plane, Heart, Gamepad2 } from "lucide-react";

const topics = [
  {
    id: "daily",
    title: "Daily Conversations",
    description: "Practice everyday situations and small talk",
    icon: Coffee,
    level: "Beginner",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  },
  {
    id: "business",
    title: "Business English",
    description: "Professional conversations and workplace scenarios",
    icon: Briefcase,
    level: "Intermediate",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
  },
  {
    id: "travel",
    title: "Travel & Tourism",
    description: "Navigate airports, hotels, and tourist attractions",
    icon: Plane,
    level: "Beginner",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
  },
  {
    id: "academic",
    title: "Academic Discussions",
    description: "University-level topics and presentations",
    icon: BookOpen,
    level: "Advanced",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  },
  {
    id: "social",
    title: "Social Interactions",
    description: "Making friends and casual conversations",
    icon: Heart,
    level: "Beginner",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
  },
  {
    id: "entertainment",
    title: "Entertainment & Hobbies",
    description: "Discuss movies, books, games, and interests",
    icon: Gamepad2,
    level: "Intermediate",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
  }
];

interface TopicSelectorProps {
  onSelectTopic: (topicId: string) => void;
}

export const TopicSelector = ({ onSelectTopic }: TopicSelectorProps) => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose Your Conversation Topic
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select a topic that interests you and start practicing English in real-world scenarios
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {topics.map((topic) => {
            const IconComponent = topic.icon;
            return (
              <Card 
                key={topic.id} 
                className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105 border-2 hover:border-primary/20"
                onClick={() => onSelectTopic(topic.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <Badge className={topic.color}>
                    {topic.level}
                  </Badge>
                </div>
                
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {topic.title}
                </h3>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {topic.description}
                </p>
                
                <Button 
                  variant="outline" 
                  className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
                >
                  Start Conversation
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};