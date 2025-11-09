import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Star, TrendingUp, Calendar, Activity } from "lucide-react";

interface AnalyticsData {
  total_sessions: number;
  total_messages: number;
  total_feedback: number;
  avg_rating: number;
  sessions_today: number;
  messages_today: number;
}

export function AnalyticsOverview() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase.rpc("get_chat_analytics");

      if (error) throw error;

      if (data && data.length > 0) {
        setAnalytics(data[0]);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-12">No analytics data available</div>;
  }

  const stats = [
    {
      title: "Total Sessions",
      value: analytics.total_sessions?.toString() || "0",
      icon: Users,
      description: "All chat sessions",
      color: "text-blue-500",
    },
    {
      title: "Total Messages",
      value: analytics.total_messages?.toString() || "0",
      icon: MessageSquare,
      description: "Messages exchanged",
      color: "text-green-500",
    },
    {
      title: "Total Feedback",
      value: analytics.total_feedback?.toString() || "0",
      icon: Star,
      description: "User ratings",
      color: "text-yellow-500",
    },
    {
      title: "Average Rating",
      value: analytics.avg_rating ? analytics.avg_rating.toString() : "N/A",
      icon: TrendingUp,
      description: "Out of 5 stars",
      color: "text-purple-500",
    },
    {
      title: "Sessions Today",
      value: analytics.sessions_today?.toString() || "0",
      icon: Calendar,
      description: "New sessions",
      color: "text-orange-500",
    },
    {
      title: "Messages Today",
      value: analytics.messages_today?.toString() || "0",
      icon: Activity,
      description: "Today's activity",
      color: "text-pink-500",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
