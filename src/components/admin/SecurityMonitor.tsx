import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Clock, Activity, Globe, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface SecuritySummary {
  event_type: string;
  severity: string;
  count: number;
  unique_ips: number;
  latest_at: string;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: string;
  ip_address: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export function SecurityMonitor() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["security-summary"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_security_summary", {
        hours_back: 24,
      });
      if (error) throw error;
      return data as SecuritySummary[];
    },
    refetchInterval: 30000,
  });

  const { data: recentEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["security-events-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as SecurityEvent[];
    },
    refetchInterval: 30000,
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "error":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Critical
          </Badge>
        );
      case "warn":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warning
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Info
          </Badge>
        );
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      rate_limit_exceeded: "Rate Limit Hit",
      auth_signin_failed: "Failed Sign-in",
      auth_signup_failed: "Failed Sign-up",
      admin_access_denied: "Admin Access Denied",
    };
    return labels[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalEvents = summary?.reduce((acc, s) => acc + Number(s.count), 0) || 0;
  const warnEvents = summary?.filter((s) => s.severity === "warn" || s.severity === "error")
    .reduce((acc, s) => acc + Number(s.count), 0) || 0;
  const uniqueIPs = summary?.reduce((acc, s) => acc + Number(s.unique_ips), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Monitoring
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time security event tracking</p>
        </div>
        <Badge variant="outline" className="text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          Last 24 hours
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-panel bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-3xl font-bold text-blue-500">
                  {summaryLoading ? "..." : totalEvents}
                </p>
                <p className="text-xs text-muted-foreground mt-1">All security events</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`glass-panel bg-gradient-to-br ${warnEvents > 0 ? 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20' : 'from-green-500/10 to-green-600/5 border-green-500/20'}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className={`text-3xl font-bold ${warnEvents > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                  {summaryLoading ? "..." : warnEvents}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {warnEvents > 0 ? 'Requiring attention' : 'All clear'}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${warnEvents > 0 ? 'bg-yellow-500/20' : 'bg-green-500/20'} flex items-center justify-center`}>
                {warnEvents > 0 ? (
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique IPs</p>
                <p className="text-3xl font-bold text-purple-500">
                  {summaryLoading ? "..." : uniqueIPs}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Distinct sources</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Globe className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Type Breakdown */}
      {summary && summary.length > 0 && (
        <Card className="glass-panel-elevated">
          <CardHeader>
            <CardTitle className="text-base">Event Breakdown</CardTitle>
            <CardDescription>Security events by type in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(item.severity)}
                    <span className="font-medium">
                      {getEventTypeLabel(item.event_type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {item.count} events
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {item.unique_ips} IPs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card className="glass-panel-elevated">
        <CardHeader>
          <CardTitle className="text-base">Recent Events</CardTitle>
          <CardDescription>Latest security events across the system</CardDescription>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentEvents && recentEvents.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between p-3 rounded-xl bg-card/50 border border-border/50 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(event.severity)}
                      <span className="font-medium text-sm">
                        {getEventTypeLabel(event.event_type)}
                      </span>
                    </div>
                    {event.ip_address && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        IP: {event.ip_address}
                      </span>
                    )}
                    {event.details && (
                      <span className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded max-w-md truncate">
                        {JSON.stringify(event.details).slice(0, 80)}...
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(event.created_at), "MMM d, HH:mm")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500/50 mb-4" />
              <p className="text-muted-foreground">No security events in the last 24 hours</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Your system is running smoothly</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}