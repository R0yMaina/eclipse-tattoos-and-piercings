import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, TrendingUp, HelpCircle } from "lucide-react";

interface Question {
  question: string;
  count: number;
}

export function PopularQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase.rpc("get_popular_questions", {
        limit_count: 20,
      });

      if (error) throw error;

      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const maxCount = Math.max(...questions.map(q => q.count), 1);

  if (loading) {
    return (
      <Card className="glass-panel">
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Popular Questions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Questions users ask most frequently</p>
        </div>
        <Badge variant="outline" className="text-muted-foreground">
          {questions.length} unique questions
        </Badge>
      </div>

      <Card className="glass-panel-elevated">
        <CardContent className="pt-6">
          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No questions yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Questions will appear here as users interact with the chat</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, index) => {
                const percentage = (q.count / maxCount) * 100;
                return (
                  <div
                    key={index}
                    className="relative group rounded-xl border border-border/50 bg-card/50 overflow-hidden hover:border-primary/30 transition-all duration-300"
                  >
                    {/* Progress bar background */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                    
                    <div className="relative flex items-start justify-between gap-4 p-4">
                      <div className="flex-1 flex items-start gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <p className="text-sm font-medium text-foreground leading-relaxed pt-1">
                          {q.question}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="shrink-0 bg-primary/10 text-primary border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      >
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {q.count}×
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}