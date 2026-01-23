import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Users, Star, TrendingUp, Calendar, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

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
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="glass-panel animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-8 w-8 bg-muted rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2" />
              <div className="h-3 w-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="glass-panel">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      title: "Total Sessions",
      value: analytics.total_sessions?.toString() || "0",
      icon: Users,
      description: "All chat sessions",
      gradient: "from-blue-500/20 to-blue-600/5",
      borderColor: "border-blue-500/30",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-500",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Messages",
      value: analytics.total_messages?.toString() || "0",
      icon: MessageSquare,
      description: "Messages exchanged",
      gradient: "from-green-500/20 to-green-600/5",
      borderColor: "border-green-500/30",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-500",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Total Feedback",
      value: analytics.total_feedback?.toString() || "0",
      icon: Star,
      description: "User ratings",
      gradient: "from-yellow-500/20 to-yellow-600/5",
      borderColor: "border-yellow-500/30",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-500",
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Average Rating",
      value: analytics.avg_rating ? analytics.avg_rating.toFixed(1) : "N/A",
      icon: TrendingUp,
      description: "Out of 5 stars",
      gradient: "from-purple-500/20 to-purple-600/5",
      borderColor: "border-purple-500/30",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-500",
      trend: analytics.avg_rating && analytics.avg_rating >= 4 ? "Excellent" : "Good",
      trendUp: analytics.avg_rating && analytics.avg_rating >= 4,
    },
    {
      title: "Sessions Today",
      value: analytics.sessions_today?.toString() || "0",
      icon: Calendar,
      description: "New sessions",
      gradient: "from-orange-500/20 to-orange-600/5",
      borderColor: "border-orange-500/30",
      iconBg: "bg-orange-500/20",
      iconColor: "text-orange-500",
      trend: analytics.sessions_today > 0 ? "Active" : "Quiet",
      trendUp: analytics.sessions_today > 0,
    },
    {
      title: "Messages Today",
      value: analytics.messages_today?.toString() || "0",
      icon: Activity,
      description: "Today's activity",
      gradient: "from-pink-500/20 to-pink-600/5",
      borderColor: "border-pink-500/30",
      iconBg: "bg-pink-500/20",
      iconColor: "text-pink-500",
      trend: analytics.messages_today > 0 ? "Active" : "Quiet",
      trendUp: analytics.messages_today > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Analytics Overview
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Track your chat performance and engagement</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className={`glass-panel-elevated bg-gradient-to-br ${stat.gradient} ${stat.borderColor} overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`h-10 w-10 rounded-xl ${stat.iconBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {stat.trendUp ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info Card */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="text-base">Performance Summary</CardTitle>
          <CardDescription>Quick overview of your chat system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-xl bg-muted/30">
              <div className="text-2xl font-bold text-primary">
                {analytics.total_messages > 0 && analytics.total_sessions > 0 
                  ? (analytics.total_messages / analytics.total_sessions).toFixed(1) 
                  : "0"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Avg Messages/Session</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/30">
              <div className="text-2xl font-bold text-primary">
                {analytics.total_feedback > 0 && analytics.total_sessions > 0 
                  ? ((analytics.total_feedback / analytics.total_sessions) * 100).toFixed(0) 
                  : "0"}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Feedback Rate</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/30">
              <div className="text-2xl font-bold text-primary">
                {analytics.avg_rating ? `${analytics.avg_rating.toFixed(1)}/5` : "N/A"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Customer Satisfaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}