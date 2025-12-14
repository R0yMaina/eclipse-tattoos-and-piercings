import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Clock, Activity } from "lucide-react";
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
    refetchInterval: 30000, // Refresh every 30 seconds
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "destructive";
      case "warn":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      rate_limit_exceeded: "Rate Limit Hit",
      auth_signin_failed: "Failed Sign-in",
      auth_signup_failed: "Failed Sign-up",
      admin_access_denied: "Admin Access Denied",
    };
    return labels[type] || type;
  };

  const totalEvents = summary?.reduce((acc, s) => acc + Number(s.count), 0) || 0;
  const warnEvents =
    summary
      ?.filter((s) => s.severity === "warn" || s.severity === "error")
      .reduce((acc, s) => acc + Number(s.count), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Security Monitoring</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Events (24h)
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading ? "..." : totalEvents}
            </div>
            <p className="text-xs text-muted-foreground">
              Total security events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {summaryLoading ? "..." : warnEvents}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryLoading
                ? "..."
                : summary?.reduce(
                    (acc, s) => acc + Number(s.unique_ips),
                    0
                  ) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Distinct sources
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Type Breakdown */}
      {summary && summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Breakdown (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={getSeverityColor(item.severity)}>
                      {item.severity}
                    </Badge>
                    <span className="font-medium">
                      {getEventTypeLabel(item.event_type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{item.count} events</span>
                    <span>{item.unique_ips} IPs</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : recentEvents && recentEvents.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start justify-between py-2 px-3 rounded-lg bg-muted/50 text-sm"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={getSeverityColor(event.severity)}
                        className="text-xs"
                      >
                        {event.severity}
                      </Badge>
                      <span className="font-medium">
                        {getEventTypeLabel(event.event_type)}
                      </span>
                    </div>
                    {event.ip_address && (
                      <span className="text-xs text-muted-foreground">
                        IP: {event.ip_address}
                      </span>
                    )}
                    {event.details && (
                      <span className="text-xs text-muted-foreground">
                        {JSON.stringify(event.details).slice(0, 100)}
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
            <p className="text-muted-foreground text-center py-8">
              No security events in the last 24 hours
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
