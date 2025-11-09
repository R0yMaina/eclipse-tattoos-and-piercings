import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  if (loading) {
    return <div className="text-center py-12">Loading questions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Popular Questions</CardTitle>
        <CardDescription>
          Questions users ask most frequently
        </CardDescription>
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No questions yet
          </p>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {q.question}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {q.count} {q.count === 1 ? "time" : "times"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
