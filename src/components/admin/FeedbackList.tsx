import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 transition-colors ${
              star <= rating
                ? "fill-yellow-500 text-yellow-500"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4) {
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          <ThumbsUp className="h-3 w-3 mr-1" />
          Positive
        </Badge>
      );
    } else if (rating >= 3) {
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          Neutral
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
        <ThumbsDown className="h-3 w-3 mr-1" />
        Needs Improvement
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="glass-panel">
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const avgRating = feedback.length > 0 
    ? feedback.reduce((acc, f) => acc + (f.rating || 0), 0) / feedback.filter(f => f.rating).length
    : 0;
  const positiveCount = feedback.filter(f => f.rating && f.rating >= 4).length;
  const negativeCount = feedback.filter(f => f.rating && f.rating < 3).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Recent Feedback
          </h2>
          <p className="text-sm text-muted-foreground mt-1">User ratings and comments on AI responses</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-3xl font-bold text-yellow-500">{avgRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">/5</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Positive Reviews</p>
                <p className="text-3xl font-bold text-green-500">{positiveCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <ThumbsUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Need Attention</p>
                <p className="text-3xl font-bold text-red-500">{negativeCount}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <ThumbsDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card className="glass-panel-elevated">
        <CardHeader>
          <CardTitle className="text-base">All Feedback</CardTitle>
          <CardDescription>
            {feedback.length} total feedback entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Star className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No feedback yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedback.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      {item.rating && (
                        <>
                          {renderStars(item.rating)}
                          {getRatingBadge(item.rating)}
                        </>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(item.created_at), "MMM d, yyyy • h:mm a")}
                    </span>
                  </div>

                  {item.comment && (
                    <p className="text-sm text-foreground mb-3 bg-muted/30 p-3 rounded-lg italic">
                      "{item.comment}"
                    </p>
                  )}

                  {item.message_content && (
                    <div className="pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        AI Response:
                      </p>
                      <p className="text-sm text-foreground/70 line-clamp-2">
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
    </div>
  );
}