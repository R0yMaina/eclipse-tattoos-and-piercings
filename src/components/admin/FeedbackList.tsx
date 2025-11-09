import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { format } from "date-fns";

interface Feedback {
  id: string;
  rating: number | null;
  comment: string | null;
  message_content: string | null;
  created_at: string;
}

export function FeedbackList() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase.rpc("get_recent_feedback", {
        limit_count: 50,
      });

      if (error) throw error;

      setFeedback(data || []);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading feedback...</div>;
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-500 text-yellow-500"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Feedback</CardTitle>
        <CardDescription>
          User ratings and comments on AI responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {feedback.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No feedback yet
          </p>
        ) : (
          <div className="space-y-4">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  {item.rating && (
                    <div className="flex items-center gap-2">
                      {renderStars(item.rating)}
                      <span className="text-sm text-muted-foreground">
                        {item.rating}/5
                      </span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.created_at), "MMM d, yyyy h:mm a")}
                  </span>
                </div>

                {item.comment && (
                  <p className="text-sm text-foreground mb-3 italic">
                    "{item.comment}"
                  </p>
                )}

                {item.message_content && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Response:
                    </p>
                    <p className="text-sm text-foreground/80 line-clamp-2">
                      {item.message_content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
